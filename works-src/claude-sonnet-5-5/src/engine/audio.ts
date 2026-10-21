import { modeHzOf, modeRate } from './string'

/**
 * 加法合成的弦聲：每個模態一個正弦振盪器，頻率含非諧性，衰減率與視覺一致。
 * 沒有任何音檔。第一次撥動就是使用者手勢，所以不需要「開啟聲音」的閘門。
 */
const MASTER = 1.5

interface Voice {
  stop: (t: number) => void
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private bus!: GainNode
  private master!: GainNode
  private noise!: AudioBuffer
  private voices = new Set<Voice>()
  private active = 0
  muted = false
  private tuneNodes: { stop: () => void } | null = null

  get ready() {
    return !!this.ctx
  }

  /** 必須在使用者手勢內呼叫 */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return false
      const ctx = new AC({ latencyHint: 'interactive' })
      this.ctx = ctx
      this.master = ctx.createGain()
      this.master.gain.value = this.muted ? 0 : MASTER
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -14
      comp.ratio.value = 4
      comp.attack.value = 0.004
      comp.release.value = 0.25
      this.bus = ctx.createGain()
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 6200
      lp.Q.value = 0.4
      const conv = ctx.createConvolver()
      conv.buffer = this.makeImpulse(ctx, 2.4)
      const wet = ctx.createGain()
      wet.gain.value = 0.26
      this.bus.connect(lp)
      lp.connect(this.master)
      lp.connect(conv)
      conv.connect(wet)
      wet.connect(this.master)
      this.master.connect(comp)
      comp.connect(ctx.destination)
      // 共用的短噪音（撥片的啪聲）
      const len = Math.floor(ctx.sampleRate * 0.06)
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = this.noise.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return true
  }

  private makeImpulse(ctx: AudioContext, sec: number) {
    const len = Math.floor(ctx.sampleRate * sec)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      let lp = 0
      for (let i = 0; i < len; i++) {
        const t = i / len
        lp += (Math.random() * 2 - 1 - lp) * (0.55 - 0.45 * t)
        d[i] = lp * Math.pow(1 - t, 2.6)
      }
    }
    return buf
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : MASTER, this.ctx.currentTime, 0.05)
  }

  /**
   * @param amps  各模態相對振幅（可為負，取絕對值）
   * @param vel   力度 0..1
   * @param attack 0 = 撥弦（瞬間），>0 = 共鳴（緩起）
   */
  pluck(hz: number, amps: ArrayLike<number>, vel: number, opts: { delay?: number; attack?: number; pan?: number; gain?: number; norm?: boolean } = {}) {
    const ctx = this.ctx
    if (!ctx || this.muted) return
    const t0 = ctx.currentTime + (opts.delay ?? 0) + 0.005
    const attack = opts.attack ?? 0.004
    const tight = this.active > 150 ? 5 : this.active > 90 ? 8 : 12
    // 撥弦：以泛音總和正規化，不論撥在哪裡都一樣明確。共鳴（norm=false）保持原始比例，維持「被帶動」的輕。
    let gainK = (opts.gain ?? 1) * 1.2 * vel
    if (opts.norm !== false) {
      let sum = 0
      for (let k = 0; k < tight; k++) if (modeHzOf(hz, k + 1) <= 7000) sum += Math.abs(amps[k] ?? 0)
      gainK = (opts.gain ?? 1) * 0.5 * vel * (sum > 0 ? 1 / sum : 0)
    }
    const out = ctx.createGain()
    const pan = ctx.createStereoPanner()
    pan.pan.value = opts.pan ?? 0
    out.connect(pan)
    pan.connect(this.bus)
    const oscs: OscillatorNode[] = []
    let longest = 0
    for (let k = 0; k < tight; k++) {
      const n = k + 1
      const a = Math.abs(amps[k] ?? 0)
      if (a < 0.004) continue
      const f = modeHzOf(hz, n)
      if (f > 7000) break
      const g = ctx.createGain()
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const rate = modeRate(n)
      const peak = Math.min(0.7, a * gainK)
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.linearRampToValueAtTime(peak, t0 + attack)
      g.gain.setTargetAtTime(0, t0 + attack, 1 / rate)
      const life = attack + Math.min(7, 5.5 / rate)
      o.connect(g)
      g.connect(out)
      o.start(t0)
      o.stop(t0 + life)
      oscs.push(o)
      longest = Math.max(longest, life)
    }
    // 撥片的啪聲：只有真正撥的時候才有
    if (attack < 0.01 && vel > 0.05) {
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = Math.min(5200, 1200 + hz * 9)
      bp.Q.value = 0.9
      const g = ctx.createGain()
      g.gain.setValueAtTime(vel * 0.3, t0)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045)
      src.connect(bp)
      bp.connect(g)
      g.connect(out)
      src.start(t0)
    }
    this.active += oscs.length
    const voice: Voice = {
      stop: (t: number) => {
        for (const o of oscs) {
          try {
            o.stop(t)
          } catch {
            /* 已停止 */
          }
        }
      },
    }
    this.voices.add(voice)
    // 第一個模態活得最久，以它收尾
    const tail = oscs[0]
    if (tail) {
      tail.onended = () => {
        this.active = Math.max(0, this.active - oscs.length)
        this.voices.delete(voice)
        out.disconnect()
        pan.disconnect()
      }
    } else {
      this.voices.delete(voice)
    }
    return longest
  }

  /** 整體被一隻手按住：所有聲音在極短時間內熄滅 */
  hush() {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    this.bus.gain.cancelScheduledValues(t)
    this.bus.gain.setTargetAtTime(0, t, 0.018)
    const toStop = [...this.voices]
    window.setTimeout(() => {
      for (const v of toStop) v.stop(ctx.currentTime)
      this.bus.gain.cancelScheduledValues(ctx.currentTime)
      this.bus.gain.setValueAtTime(1, ctx.currentTime + 0.05)
    }, 160)
  }

  /** 調音時的持續音：兩根弦的基頻，同度時會聽到拍頻消失 */
  tune(on: boolean, hzA = 220, hzU = 220) {
    const ctx = this.ctx
    if (!ctx) return
    if (!on) {
      this.tuneNodes?.stop()
      this.tuneNodes = null
      return
    }
    if (this.tuneNodes || this.muted) return
    const g = ctx.createGain()
    g.gain.value = 0
    g.gain.setTargetAtTime(0.1, ctx.currentTime, 0.04)
    const a = ctx.createOscillator()
    const u = ctx.createOscillator()
    a.type = 'triangle'
    u.type = 'triangle'
    a.frequency.value = hzA
    u.frequency.value = hzU
    a.connect(g)
    u.connect(g)
    g.connect(this.bus)
    a.start()
    u.start()
    this.tuneNodes = {
      stop: () => {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.04)
        a.stop(ctx.currentTime + 0.3)
        u.stop(ctx.currentTime + 0.3)
        this.tuneUpdate = null
      },
    }
    this.tuneUpdate = (hzU2: number) => {
      u.frequency.setTargetAtTime(hzU2, ctx.currentTime, 0.02)
    }
  }
  tuneUpdate: ((hzU: number) => void) | null = null
}
