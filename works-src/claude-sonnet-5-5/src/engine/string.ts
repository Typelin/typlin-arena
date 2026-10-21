import { clamp } from './math'

/** 模態弦：位移 = Σ a_n · sin(nπx)，每個模態是一個會衰減的複數相量。 */
export const NMODES = 24
export const NPTS = 161
// 220 Hz（A3）：筆電喇叭放得出基頻，音量與辨識度都比 110 Hz 明確
export const BASE_HZ = 220
/** 輕微的非諧性（真實鋼弦的剛性） */
const B = 0.0006

/** SIN[n-1][i] = sin(nπ x_i) */
export const SIN: Float32Array[] = Array.from({ length: NMODES }, (_, k) => {
  const row = new Float32Array(NPTS)
  for (let i = 0; i < NPTS; i++) row[i] = Math.sin((k + 1) * Math.PI * (i / (NPTS - 1)))
  return row
})

/** 三角形撥弦的傅立葉係數（峰在 p，高 h） */
export function pluckCoeff(n: number, p: number, h: number) {
  return (2 * h * Math.sin(n * Math.PI * p)) / (n * n * Math.PI * Math.PI * p * (1 - p))
}

/** 輕觸節點（自然泛音）：只有在 q 處為節點的模態能活下來 */
export function damperSurvive(n: number, q: number | null) {
  if (q == null) return 1
  const s = Math.abs(Math.sin(n * Math.PI * q))
  return Math.exp(-((s / 0.2) ** 2))
}

export const modeHzOf = (hz: number, n: number) => hz * n * Math.sqrt(1 + B * n * n)
/** 振幅衰減率（1/s）：高階模態死得快，像真的弦 */
export const modeRate = (n: number) => 0.2 * (1 + 0.34 * Math.pow(n - 1, 1.3))

export interface Held {
  p: number
  h: number
}

export class ModalString {
  re = new Float32Array(NMODES)
  im = new Float32Array(NMODES)
  y = new Float32Array(NPTS)
  /** 視覺用的次幀取樣（動態模糊） */
  ghost: Float32Array[] = [new Float32Array(NPTS), new Float32Array(NPTS)]
  ghostCount = 0
  ratio: number
  held: Held | null = null
  damper: number | null = null
  mute = 0
  energy = 0
  /** 版面：由 Instrument 每幀寫入 */
  yNorm = 0.5
  alpha = 1
  constructor(ratio: number) {
    this.ratio = ratio
  }
  get hz() {
    return BASE_HZ * this.ratio
  }
  /** 視覺基頻（Hz）：慢動作版本，與音高略有關係 */
  get visualHz() {
    return 1.25 * Math.pow(this.ratio, 0.35)
  }

  pluck(p: number, h: number) {
    for (let k = 0; k < NMODES; k++) {
      const n = k + 1
      this.re[k] = pluckCoeff(n, p, h) * damperSurvive(n, this.damper)
      this.im[k] = 0
    }
  }

  /** 加入共鳴能量（不改變相位連續性） */
  excite(k: number, amp: number) {
    this.re[k] += amp
  }

  damp() {
    this.mute = 40
  }

  clear() {
    this.re.fill(0)
    this.im.fill(0)
    this.mute = 0
    this.held = null
  }

  step(dt: number, reduced: boolean) {
    let e = 0
    const extra = this.mute
    for (let k = 0; k < NMODES; k++) {
      const n = k + 1
      const f = Math.exp(-(modeRate(n) + extra) * dt)
      const r = this.re[k]
      const i = this.im[k]
      if (reduced) {
        this.re[k] = r * f
        this.im[k] = i * f
      } else {
        const th = 2 * Math.PI * this.visualHz * n * Math.sqrt(1 + B * n * n) * dt
        const c = Math.cos(th)
        const s = Math.sin(th)
        this.re[k] = (r * c - i * s) * f
        this.im[k] = (r * s + i * c) * f
      }
      e += this.re[k] * this.re[k] + this.im[k] * this.im[k]
    }
    this.energy = e
    if (extra > 0 && e < 1e-6) this.mute = 0
  }

  /** 把目前（或往前 back 秒）的位移取樣到 out（單位：滿幅 = 1） */
  sample(out: Float32Array, back: number, reduced: boolean) {
    if (this.held) {
      const { p, h } = this.held
      for (let i = 0; i < NPTS; i++) {
        const x = i / (NPTS - 1)
        out[i] = x < p ? (h * x) / p : (h * (1 - x)) / (1 - p)
      }
      return
    }
    out.fill(0)
    for (let k = 0; k < NMODES; k++) {
      let a = this.re[k]
      if (!reduced && back > 0) {
        const n = k + 1
        const th = 2 * Math.PI * this.visualHz * n * Math.sqrt(1 + B * n * n) * back
        a = this.re[k] * Math.cos(th) + this.im[k] * Math.sin(th)
      }
      if (Math.abs(a) < 2e-4) continue
      const row = SIN[k]
      for (let i = 0; i < NPTS; i++) out[i] += a * row[i]
    }
  }

  /** 單一模態的位移（梯子視圖用）。held 時直接用解析係數預覽。 */
  modeAmp(k: number): number {
    if (this.held) {
      return Math.abs(pluckCoeff(k + 1, this.held.p, this.held.h)) * damperSurvive(k + 1, this.damper)
    }
    return Math.hypot(this.re[k], this.im[k])
  }

  modeSample(k: number, out: Float32Array, reduced: boolean) {
    const row = SIN[k]
    if (this.held) {
      const a = pluckCoeff(k + 1, this.held.p, this.held.h) * damperSurvive(k + 1, this.damper)
      for (let i = 0; i < NPTS; i++) out[i] = a * row[i]
      return
    }
    const a = reduced ? this.re[k] : this.re[k]
    for (let i = 0; i < NPTS; i++) out[i] = a * row[i]
  }

  /** 線性取樣 y 於 x∈[0,1] */
  at(x: number) {
    const f = clamp(x) * (NPTS - 1)
    const i = Math.min(NPTS - 2, Math.floor(f))
    return this.y[i] + (this.y[i + 1] - this.y[i]) * (f - i)
  }
}

/**
 * 兩弦之間的共鳴強度（0..1+）：以真實頻率計算洛倫茲重疊。
 * 幾何權重 1/√(n·m)：愈高階的重合，愈弱。
 */
export function couplingScore(hzA: number, hzB: number, nm = 8): number {
  let best = 0
  for (let n = 1; n <= nm; n++) {
    const fa = modeHzOf(hzA, n)
    for (let m = 1; m <= nm; m++) {
      const fb = modeHzOf(hzB, m)
      const bw = 0.0045 * fb
      const d = (fa - fb) / bw
      const L = 1 / (1 + d * d)
      const w = 1 / Math.sqrt(n * m)
      best = Math.max(best, L * w)
    }
  }
  return best
}
