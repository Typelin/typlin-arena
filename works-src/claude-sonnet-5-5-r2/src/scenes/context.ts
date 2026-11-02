import { $, Spring, clamp, fitCanvas, fmt, isReduced, lerp, onFrame, onResize, pinProgress, smooth, watchVisible } from '../lib/util'

const TOTAL = 1_000_000
const LN = Math.log(TOTAL)
const OUT_FRAC = Math.sqrt(128_000 / TOTAL)

const pack = (r: number, g: number, b: number) => (255 << 24) | (b << 16) | (g << 8) | r
const BG = [10, 15, 30]
const mix = (c: number[], a: number) => pack(
  Math.round(BG[0] + (c[0] - BG[0]) * a),
  Math.round(BG[1] + (c[1] - BG[1]) * a),
  Math.round(BG[2] + (c[2] - BG[2]) * a),
)
const CREAM = [246, 234, 211]
const FROST = [185, 199, 238]
const CLAY = [232, 100, 58]
const OUTC = [255, 150, 96]

const creamT = [1, 0.74, 0.5, 0.3].map((a) => mix(CREAM, a))
const frostT = [0.95, 0.6].map((a) => mix(FROST, a))
const clayT = [0.9, 0.6].map((a) => mix(CLAY, a))
const outT = [1, 0.8, 0.62, 0.46].map((a) => mix(OUTC, a))
const HOT = mix([255, 120, 70], 1)

function hash(u: number, v: number) {
  let h = (Math.imul(u, 0x9e3779b1) ^ Math.imul(v, 0x85ebca6b)) >>> 0
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d) >>> 0
  h ^= h >>> 12
  h = Math.imul(h, 0x297a2d39) >>> 0
  h ^= h >>> 15
  return h >>> 0
}

function shade(c: number, k: number) {
  const r = Math.min(255, Math.round((c & 255) * k))
  const g = Math.min(255, Math.round(((c >>> 8) & 255) * k))
  const b = Math.min(255, Math.round(((c >>> 16) & 255) * k))
  return pack(r, g, b)
}

const NOTES: [number, string][] = [
  [1, '這是 1 個 token，我讀文字的最小單位。'],
  [60, '10 個、100 個，再往後退一步。'],
  [3000, '一千個，一萬個，字已經小到看不清。'],
  [90000, '十萬個。每個點都是我讀進去的一小塊。'],
  [900000, '一百萬個，我一次放得進腦子的量。'],
]

export function initContext() {
  const sec = $('#context')
  const cv = $<HTMLCanvasElement>('#field')
  const countEl = $('#ctxCount')
  const noteEl = $('#ctxNote')
  const outEl = $('#ctxOut')
  const reduced = isReduced()

  let W = 0
  let H = 0
  let cols = 1000
  let rows = 1000
  let img: ImageData | null = null
  let buf: Uint32Array | null = null
  let dirty = true
  let visible = false
  let lastE = -1
  let lastOut = -1
  let noteIdx = -1
  let areaW = 0
  let areaH = 0

  function size() {
    const f = fitCanvas(cv, 2)
    W = f.w
    H = f.h
    areaW = W * 0.96
    areaH = H * 0.96
    cols = Math.max(1, Math.round(Math.sqrt((TOTAL * areaW) / areaH)))
    rows = Math.ceil(TOTAL / cols)
    img = cv.getContext('2d')!.createImageData(W, H)
    buf = new Uint32Array(img.data.buffer)
    dirty = true
  }

  function rect(x0: number, y0: number, wd: number, ht: number, col: number, grad: boolean) {
    const b = buf!
    let xa = Math.round(x0)
    let ya = Math.round(y0)
    let xb = xa + Math.max(1, Math.round(wd))
    let yb = ya + Math.max(1, Math.round(ht))
    if (xb <= 0 || yb <= 0 || xa >= W || ya >= H) return
    xa = Math.max(0, xa)
    ya = Math.max(0, ya)
    xb = Math.min(W, xb)
    yb = Math.min(H, yb)
    const full = yb - ya
    for (let y = ya; y < yb; y++) {
      let c = col
      if (grad) {
        const t = (y - ya) / full
        c = shade(col, t < 0.04 ? 1.12 : t > 0.96 ? 0.55 : 1 - t * 0.24)
      }
      const o = y * W
      for (let x = xa; x < xb; x++) b[o + x] = c
    }
  }

  function draw(e: number, p: number) {
    if (!buf || !img) return
    const g = cv.getContext('2d')!
    buf.fill(0)
    const N = Math.exp(LN * clamp(e))
    const hw = Math.max(0.5, 0.5 * Math.sqrt((N * cols) / rows))
    const hh = hw * (rows / cols)
    const cap = Math.min(areaW, areaH) * 0.5
    const s = Math.min(areaW / (2 * hw), areaH / (2 * hh), cap)
    const cx = W / 2
    const cy = H / 2

    const hwF = 0.5 * Math.sqrt((TOTAL * cols) / rows)
    const hhF = hwF * (rows / cols)
    const outK = smooth((p - 0.88) / 0.07)
    const oU0 = hwF * (1 - 2 * OUT_FRAC)
    const oV0 = hhF * (1 - 2 * OUT_FRAC)
    const oU1 = oU0 + outK * 2 * OUT_FRAC * hwF
    const fr = Math.max(1, 3 / s)

    const gap = s > 8 ? Math.max(1, s * 0.1) : s > 3 ? 1 : 0
    const hf = s > 3 ? 0.54 : 0.7
    const uMax = Math.min(Math.ceil(hw), Math.floor(cols / 2) + 1)
    const vMax = Math.min(Math.ceil(hh), Math.floor(rows / 2) + 1)
    const dot = s < 2.4

    for (let v = -vMax; v <= vMax; v++) {
      const av = Math.abs(v)
      if (av >= hh) continue
      const py = cy + v * s
      if (py < -s || py > H + s) continue
      for (let u = -uMax; u <= uMax; u++) {
        const au = Math.abs(u)
        if (au >= hw) continue
        const px = cx + u * s
        if (px < -s || px > W + s) continue
        const h = hash(u, v)
        const wf = 0.34 + ((h & 255) / 255) * 0.56
        const t8 = (h >>> 8) & 7
        const tone = t8 < 3 ? 0 : t8 < 6 ? 1 : t8 === 6 ? 2 : 3
        const sp = (h >>> 11) & 63
        let col = creamT[tone]
        if (sp === 0) col = clayT[tone & 1]
        else if (sp === 1) col = frostT[tone & 1]
        const edge = hw - au < fr || hh - av < fr
        const inOut = outK > 0 && u >= oU0 && u < oU1 && v >= oV0
        if (inOut) col = outT[tone]
        if (edge) col = HOT
        if (dot) {
          const ix = Math.round(px)
          const iy = Math.round(py)
          if (ix >= 0 && ix < W && iy >= 0 && iy < H) buf[iy * W + ix] = col
          if (s > 1.4 && ix + 1 < W && ix >= 0 && iy >= 0 && iy < H) buf[iy * W + ix + 1] = col
        } else {
          const bw = (s - gap) * wf
          const bh = (s - gap) * hf
          rect(px - (s - gap) / 2, py - bh / 2, bw, bh, col, s > 40)
        }
      }
    }
    g.putImageData(img, 0, 0)

    const shown = Math.round(Math.min(TOTAL, N))
    countEl.textContent = fmt(shown)
    let idx = 0
    for (let i = 0; i < NOTES.length; i++) if (N >= NOTES[i][0]) idx = i
    if (idx !== noteIdx) {
      noteIdx = idx
      noteEl.textContent = NOTES[idx][1]
    }
    outEl.classList.toggle('on', outK > 0.35)
    outEl.style.setProperty('--k', outK.toFixed(3))
  }

  size()
  onResize(size)
  watchVisible(sec, (v) => (visible = v), '40% 0px')

  if (reduced) {
    draw(1, 1)
    onResize(() => {
      size()
      draw(1, 1)
    })
    return
  }

  const sp = new Spring(46, 13, 0)
  onFrame((_t, dt) => {
    if (!visible) return
    const p = pinProgress(sec)
    const m = clamp((p - 0.07) / 0.8)
    const target = lerp(m, smooth(m), 0.55)
    const e = sp.step(target, dt)
    if (!dirty && Math.abs(e - lastE) < 4e-5 && Math.abs(p - lastOut) < 4e-4) return
    lastE = e
    lastOut = p
    dirty = false
    draw(e, p)
  })
}
