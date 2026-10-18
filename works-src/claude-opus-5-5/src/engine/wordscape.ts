import { SCAPE_CHARS, UNSAID_WORDS } from '../content'
import { GRAPHITE, INK, PAPER, RED, SERIF } from './consts'
import { clamp, easeInOut, easeOut, hash01, lerp, mixColor, ramp } from './math'
import type { Camera } from './types'

/**
 * 萬詞成山 — a landscape written in the unsaid.
 *
 * Every mountain is made of vertical columns of words that were not chosen: possibilities that
 * hover around any sentence, every alternative in the lattices, and — as the visitor goes — the
 * real roads not taken in this conversation, which lift off the river and settle on the ridges.
 * From afar it reads as ink mountains in mist; close up (the lens) every stroke is a word.
 *
 *   I    blank paper
 *   II   the far range
 *   III  a second range; ghosts begin to rise into them
 *   IV   a third range; schools of words swim through the page
 *   V    mist written in 雲霧嵐靄; leaves of 葉 falling
 *   VI   the near range, a sun made of 日 with one vermilion 你 for every word the visitor turned,
 *        water written in 水波流, petals of 花, all touched with gold
 */

type RGB = [number, number, number]
const GOLD: RGB = [176, 128, 52]
const BLOSSOM: RGB = [214, 120, 104]
const SLATE: RGB = [108, 116, 120]

interface RangeSpec {
  base: number
  amp: number
  size: number
  alpha: number
  depth: number
  par: number
  unlock: number
  colour: RGB
  seed: number
}

const RANGES: RangeSpec[] = [
  { base: 0.52, amp: 0.34, size: 7, alpha: 0.3, depth: 0.15, par: 0.012, unlock: 0.9, colour: SLATE, seed: 3 },
  { base: 0.64, amp: 0.3, size: 8.5, alpha: 0.38, depth: 0.15, par: 0.024, unlock: 1.9, colour: GRAPHITE, seed: 7 },
  { base: 0.77, amp: 0.26, size: 10, alpha: 0.44, depth: 0.14, par: 0.04, unlock: 2.9, colour: [70, 66, 60], seed: 11 },
  { base: 0.98, amp: 0.09, size: 11, alpha: 0.3, depth: 0.1, par: 0.07, unlock: 5.0, colour: INK, seed: 19 },
]

const BUCKET = 48

interface Glyphs {
  x: number[]
  y: number[]
  s: number[]
  a: number[]
  c: string[]
}

class Range {
  spec: RangeSpec
  canvas = document.createElement('canvas')
  ctx: CanvasRenderingContext2D
  P = 0
  H = 0
  sc = 1
  col = 0
  cols = 0
  glyphs: Glyphs = { x: [], y: [], s: [], a: [], c: [] }
  /** Glyph indices bucketed by range-x, so the lens never scans the whole mountain. */
  private buckets = new Map<number, number[]>()
  /** Highest ink on this range (screen y); everything above is transparent and is not blitted. */
  minY = Infinity
  private harm: { w: number; k: number; ph: number }[] = []
  private stream = ''
  private si = 0

  constructor(spec: RangeSpec, P: number, H: number, sc: number, seed: number) {
    this.spec = spec
    this.ctx = this.canvas.getContext('2d')!
    this.P = P
    this.H = H
    this.sc = sc
    this.canvas.width = Math.round(P * sc)
    this.canvas.height = Math.round(H * sc)
    this.cols = Math.ceil(P / (spec.size * 1.22))
    for (let k = 1; k <= 7; k++) {
      this.harm.push({ w: Math.pow(k, -1.15) * (0.6 + hash01(spec.seed, k, seed) * 0.8), k, ph: hash01(k, spec.seed, seed) * Math.PI * 2 })
    }
    // A long reading stream of unsaid words, shuffled per range.
    const words = UNSAID_WORDS.slice().sort((a, b) => hash01(a.length, a.charCodeAt(0), spec.seed + seed) - hash01(b.length, b.charCodeAt(0), spec.seed + seed))
    this.stream = words.join('')
  }

  /** Ridge height (screen px from top) at range-x. Periodic in P, so the range tiles seamlessly. */
  ridge(x: number) {
    let f = 0
    let sum = 0
    for (const h of this.harm) {
      f += h.w * (0.5 + 0.5 * Math.sin((Math.PI * 2 * h.k * x) / this.P + h.ph))
      sum += h.w
    }
    f /= sum
    return this.H * this.spec.base - this.height01(f) * this.H * this.spec.amp * 1.5
  }

  /** Tall, pointed peaks with long low valleys between them. */
  private height01(f: number) {
    return Math.pow(f, 2.6) * 1.4
  }

  /** 0..1 height at range-x, used to give peaks deeper bodies than valleys. */
  peak(x: number) {
    return (this.H * this.spec.base - this.ridge(x)) / (this.H * this.spec.amp * 1.5 * 1.4)
  }

  private next() {
    const ch = this.stream[this.si % this.stream.length]
    this.si++
    return ch
  }

  get done() {
    return this.col >= this.cols
  }

  private baked = false

  /** Render columns until the time budget is spent; once complete, bake in the mist at the foot. */
  build(budgetMs: number) {
    this.buildColumns(budgetMs)
    if (this.done && !this.baked) {
      this.baked = true
      if (this.spec.base < 0.95) this.bakeMist()
    }
  }

  /**
   * The paper-coloured mist pooled at the range's foot, painted once into the range itself.
   * Source-over is associative — (mist over range) over page = mist over (range over page) —
   * so this is the same image as painting the mist every frame, at no per-frame cost.
   */
  private bakeMist() {
    const { ctx, H, P } = this
    const fy = H * this.spec.base
    ctx.setTransform(this.sc, 0, 0, this.sc, 0, 0)
    const g = ctx.createLinearGradient(0, fy - H * 0.06, 0, fy + H * 0.12)
    g.addColorStop(0, mixColor(PAPER, PAPER, 0, 0))
    g.addColorStop(0.6, mixColor(PAPER, PAPER, 0, 0.55))
    g.addColorStop(1, mixColor(PAPER, PAPER, 0, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, fy - H * 0.06, P, H * 0.18)
  }

  private buildColumns(budgetMs: number) {
    const t0 = performance.now()
    const { ctx, spec, sc } = this
    ctx.setTransform(sc, 0, 0, sc, 0, 0)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const colW = spec.size * 1.22
    while (!this.done && performance.now() - t0 < budgetMs) {
      const i = this.col++
      const x = i * colW + (hash01(i, spec.seed) - 0.5) * spec.size * 0.35
      const top = this.ridge(x) + hash01(i, 2, spec.seed) * spec.size * 0.6
      // Peaks carry long bodies of text down into the mist; valleys only a few words.
      const L = this.H * spec.depth * (0.35 + 1.6 * this.peak(x)) * (0.8 + hash01(i, 3, spec.seed) * 0.4)
      for (let j = 0; ; j++) {
        const y = top + j * spec.size * 1.08
        const d = (j * spec.size * 1.08) / L
        if (d >= 1 || y > this.H) break
        // ink is densest on the ridge line and thins quickly into mist
        const a = spec.alpha * Math.pow(1 - d, 2.2) * (j === 0 ? 1.6 : j === 1 ? 1.2 : 1)
        if (a < 0.012) break
        const size = spec.size * (j === 0 ? 1.25 : 0.9 + hash01(i, j, spec.seed) * 0.16)
        this.glyph(this.next(), x, y, size, a, spec.colour)
      }
    }
  }

  glyph(ch: string, x: number, y: number, size: number, a: number, colour: RGB) {
    const { ctx } = this
    ctx.font = `500 ${size.toFixed(1)}px ${SERIF}`
    ctx.fillStyle = mixColor(colour, colour, 0, Math.min(1, a))
    ctx.fillText(ch, x, y)
    // wrap copies near the seams
    if (x < size * 2) ctx.fillText(ch, x + this.P, y)
    if (x > this.P - size * 2) ctx.fillText(ch, x - this.P, y)
    if (y - size < this.minY) this.minY = Math.max(0, y - size)
    if (a > 0.04) {
      const g = this.glyphs
      const gx = ((x % this.P) + this.P) % this.P
      const b = Math.floor(gx / BUCKET)
      let list = this.buckets.get(b)
      if (!list) this.buckets.set(b, (list = []))
      list.push(g.x.length)
      g.x.push(gx)
      g.y.push(y)
      g.s.push(size)
      g.a.push(a)
      g.c.push(ch)
    }
  }

  /** A word that was not chosen settles on the ridge, making the mountain a little taller. */
  deposit(word: string, rx: number) {
    const { spec } = this
    const ctx = this.ctx
    ctx.setTransform(this.sc, 0, 0, this.sc, 0, 0)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const top = this.ridge(rx)
    const n = word.length
    const step = spec.size * 1.12
    for (let i = 0; i < n; i++) {
      this.glyph(word[i], rx, top - (n - i) * step, spec.size * 1.12, Math.min(0.95, spec.alpha * 1.6), INK)
    }
    return top - n * step
  }

  /** Glyph indices whose x lies within [x0, x1] (range-x, may extend past the seam). */
  near(x0: number, x1: number): number[] {
    const out: number[] = []
    const nb = Math.ceil(this.P / BUCKET)
    for (let b = Math.floor(x0 / BUCKET); b <= Math.floor(x1 / BUCKET); b++) {
      const list = this.buckets.get(((b % nb) + nb) % nb)
      if (list) for (const i of list) out.push(i)
    }
    return out
  }
}

interface Flight {
  word: string
  sx: number
  sy: number
  tx: number
  range: number
  born: number
  dur: number
  size0: number
}

interface Drifter {
  ch: string
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  kind: 'mist' | 'petal' | 'leaf' | 'light'
  phase: number
}

interface School {
  word: string
  x: number
  y: number
  dir: number
  speed: number
  phase: number
  red: boolean
  trail: { x: number; y: number }[]
}

export interface ScapeState {
  rich: number
  cam: Camera
  rm: boolean
  flow: number
  /** Where the lens rests, and how visible it is. */
  pointer: { x: number; y: number; a: number } | null
  /** Fraction of forks the visitor turned (for the sun). */
  share: number
  mineCount: number
  /** Zoom of the whole landscape (finale pull-back). */
  zoom: number
  /** An opaque panel covering part of the screen (the ending): nothing behind it is drawn. */
  occluder: { x: number; y: number; w: number; h: number } | null
}

export class Wordscape {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private W = 0
  private H = 0
  private sc = 1
  private P = 0
  private ranges: Range[] = []
  private flights: Flight[] = []
  private drifters: Drifter[] = []
  private schools: School[] = []
  private sun: {
    canvas: HTMLCanvasElement
    key: string
    ctx: CanvasRenderingContext2D
    cells: [number, number][]
    yours: Set<number>
    R: number
    step: number
  } | null = null
  private seed = Math.floor(Math.random() * 1000)
  private offsets: number[] = []
  private rises: number[] = []
  private ready = false
  private sunTop = Infinity
  /** Words waiting to settle without a flight (fast scrolling), drained a few per frame. */
  private pending: { w: string; tx: number; range: number }[] = []
  private warmAt = 0
  private warm: [string, number, RGB][] | null = null

  /** Every drifter / water sprite (char, size, colour) the scene can ask for. */
  private warmList(): [string, number, RGB][] {
    if (this.warm) return this.warm
    const out: [string, number, RGB][] = []
    const sizes = (a: number, b: number) => {
      const r: number[] = []
      for (let s = a; s <= b + 0.001; s += 0.5) r.push(s)
      return r
    }
    const k = this.W < 720 ? 0.85 : 1
    void k
    for (const ch of SCAPE_CHARS.mist) for (const s of sizes(10, 20)) out.push([ch, s, mixRGB(SLATE, PAPER, 0.35)])
    for (const ch of SCAPE_CHARS.leaf) for (const s of sizes(9, 15)) out.push([ch, s, mixRGB(GRAPHITE, SLATE, 0.3)])
    for (const g of [0, 0.25, 0.5, 0.75, 1])
      for (const ch of SCAPE_CHARS.petal) for (const s of sizes(9, 15)) out.push([ch, s, mixRGB(BLOSSOM, GOLD, g * 0.3)])
    for (const s of sizes(7, 11)) out.push([SCAPE_CHARS.light, s, GOLD])
    for (const g of [0, 0.25, 0.5, 0.75, 1])
      for (let row = 0; row < 4; row++)
        for (const ch of SCAPE_CHARS.water) out.push([ch, 9 + row * 2, mixRGB(mixRGB(SLATE, GOLD, g * 0.5), INK, row * 0.15)])
    this.warm = out
    return out
  }
  private idleHandle = 0
  /** Pre-rendered glyphs: drawing an image is far cheaper than shaping text every frame. */
  private sprites = new Map<string, { c: HTMLCanvasElement; w: number }>()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  resize(W: number, H: number) {
    this.W = W
    this.H = H
    this.sc = Math.min(window.devicePixelRatio || 1, 1.5)
    this.canvas.width = Math.round(W * this.sc)
    this.canvas.height = Math.round(H * this.sc)
    this.canvas.style.width = `${W}px`
    this.canvas.style.height = `${H}px`
    this.P = Math.max(1400, Math.round(W * 1.6))
    this.rebuild()
  }

  private rebuild() {
    // Portrait screens make mountains look tall and crowded: flatten and shrink them there.
    const ampK = clamp((this.W / this.H) * 1.1, 0.5, 1)
    const sizeK = this.W < 720 ? 0.85 : 1
    this.ranges = RANGES.map(
      (spec) => new Range({ ...spec, amp: spec.amp * ampK, size: spec.size * sizeK }, this.P, this.H, this.sc, this.seed),
    )
    this.offsets = RANGES.map(() => 0)
    this.rises = RANGES.map(() => 0)
    this.drifters = []
    this.schools = []
    this.sun = null
    this.pending = []
    this.warm = null
    this.warmAt = 0
    this.ready = true
    this.scheduleIdleBuild()
  }

  /**
   * Build every range ahead of time in idle slices, so no scroll frame ever pays for it.
   * (Ranges still build on demand if the visitor outruns the idle builder.)
   */
  private scheduleIdleBuild() {
    const w = window as unknown as {
      requestIdleCallback?: (cb: (d: { timeRemaining: () => number }) => void, o?: { timeout: number }) => number
      cancelIdleCallback?: (h: number) => void
    }
    if (this.idleHandle) {
      if (w.cancelIdleCallback) w.cancelIdleCallback(this.idleHandle)
      else window.clearTimeout(this.idleHandle)
    }
    const step = (remaining: () => number) => {
      this.idleHandle = 0
      for (const rg of this.ranges) {
        while (!rg.done && remaining() > 3) rg.build(Math.min(4, remaining() - 2))
        if (!rg.done) break
      }
      // then pre-rasterise every mist, leaf, petal, light and water glyph the later chapters use,
      // so their first appearance during a fast scroll costs nothing
      if (this.ranges.every((rg) => rg.done)) {
        const warm = this.warmList()
        while (this.warmAt < warm.length && remaining() > 2) {
          const [ch, size, rgb] = warm[this.warmAt++]
          this.sprite(ch, size, rgb)
        }
        if (this.warmAt >= warm.length && remaining() > 4) this.ensureSun(Math.min(this.W, this.H) * 0.12)
      }
      if (this.ranges.some((rg) => !rg.done) || this.warmAt < this.warmList().length) schedule()
    }
    const schedule = () => {
      if (w.requestIdleCallback) this.idleHandle = w.requestIdleCallback((d) => step(() => d.timeRemaining()), { timeout: 400 })
      else {
        this.idleHandle = window.setTimeout(() => {
          const t0 = performance.now()
          step(() => 6 - (performance.now() - t0))
        }, 60)
      }
    }
    schedule()
  }

  /** A glyph rendered once at full opacity; callers set globalAlpha. Sizes snap to 0.5px. */
  private sprite(ch: string, size: number, rgb: RGB) {
    const q = Math.round(size * 2) / 2
    const r = Math.round(rgb[0])
    const g = Math.round(rgb[1])
    const b = Math.round(rgb[2])
    const key = `${ch}|${q}|${r},${g},${b}`
    let s = this.sprites.get(key)
    if (!s) {
      if (this.sprites.size > 2400) this.sprites.clear()
      const w = Math.ceil(q * 1.6)
      const c = document.createElement('canvas')
      c.width = Math.ceil(w * this.sc)
      c.height = Math.ceil(w * this.sc)
      const x = c.getContext('2d')!
      x.setTransform(this.sc, 0, 0, this.sc, 0, 0)
      x.font = `500 ${q}px ${SERIF}`
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillStyle = `rgb(${r},${g},${b})`
      x.fillText(ch, w / 2, w / 2)
      s = { c, w }
      this.sprites.set(key, s)
    }
    return s
  }

  /** Draw a sprite centred at (x, y) under the current transform. */
  private stamp(ch: string, size: number, rgb: RGB, alpha: number, x: number, y: number) {
    if (alpha <= 0.003) return
    const s = this.sprite(ch, size, rgb)
    this.ctx.globalAlpha = Math.min(1, alpha)
    this.ctx.drawImage(s.c, x - s.w / 2, y - s.w / 2, s.w, s.w)
  }

  reset() {
    this.seed = Math.floor(Math.random() * 1000)
    this.flights = []
    if (this.W) this.rebuild()
  }

  /** Words that were not chosen at a fork lift off the river toward the mountains. */
  release(words: { w: string; x: number; y: number }[], rich: number, fast = false) {
    if (!this.ready || rich < 0.95) return
    const open = this.ranges.map((r, i) => (rich >= r.spec.unlock + 0.15 ? i : -1)).filter((i) => i >= 0)
    if (!open.length) return
    for (const g of words) {
      const w = g.w.replace(/[，。、：；？！「」—]/g, '')
      if (!w) continue
      const range = open[Math.floor(Math.random() * open.length)]
      const tx = clamp(g.x + (Math.random() - 0.5) * this.W * 0.5, this.W * 0.06, this.W * 0.94)
      // Racing through the text: no flights, the words settle quietly a few per frame.
      if (fast || this.flights.length >= 14) {
        this.pending.push({ w, tx, range })
        if (this.pending.length > 48) this.pending.shift()
        continue
      }
      this.flights.push({ word: w, sx: g.x, sy: g.y, tx, range, born: performance.now(), dur: 1700 + Math.random() * 900, size0: this.W < 720 ? 15 : 20 })
    }
  }

  private toRangeX(i: number, sx: number, zoom: number) {
    const cx = this.W / 2
    const unzoomed = cx + (sx - cx) / zoom
    return (((unzoomed + this.offsets[i]) % this.P) + this.P) % this.P
  }

  private settle(word: string, sx: number, i: number, zoom = 1) {
    this.ranges[i].deposit(word, this.toRangeX(i, sx, zoom))
  }

  frame(now: number, dt: number, st: ScapeState) {
    const { ctx, W, H } = this
    ctx.setTransform(this.sc, 0, 0, this.sc, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (!this.ready) return
    const r = st.rich

    // Normally the idle builder has finished long ago; this only catches a visitor who outran it.
    let budget = 2.5
    for (const rg of this.ranges) {
      if (rg.done || r < rg.spec.unlock - 0.15) continue
      const t0 = performance.now()
      rg.build(budget)
      budget -= performance.now() - t0
      if (budget <= 0) break
    }
    if (r < 0.85) return

    // settle queued words, two per frame
    for (let i = 0; i < 2 && this.pending.length; i++) {
      const p = this.pending.shift()!
      this.settle(p.w, p.tx, p.range, st.zoom)
    }

    const L = {
      mist: 0.25 * ramp(r, 2.6, 3.4) + 0.75 * ramp(r, 3.6, 4.4) * (1 - 0.55 * ramp(r, 5.1, 5.8)),
      leaves: ramp(r, 3.8, 4.4) * (1 - ramp(r, 5.0, 5.4)),
      petals: ramp(r, 5.0, 5.8),
      water: ramp(r, 4.9, 5.7),
      sun: ramp(r, 5.05, 5.9),
      gold: ramp(r, 5.2, 6),
      schools: ramp(r, 2.8, 3.5),
      light: ramp(r, 5.3, 6),
      fade: ramp(r, 3.7, 4.4) * (1 - ramp(r, 5.0, 5.6)),
    }

    // Everything behind an opaque panel is invisible: clip it away so it is never rasterised.
    const open = this.openRect(st.occluder)
    ctx.save()
    if (open) {
      ctx.beginPath()
      ctx.rect(open.x0, open.y0, open.x1 - open.x0, open.y1 - open.y0)
      ctx.clip()
    }
    this.openX1 = open ? open.x1 : W
    this.openY1 = open ? open.y1 : H
    ctx.save()
    const z = st.zoom
    ctx.translate(W / 2, H * 0.62)
    ctx.scale(z, z)
    ctx.translate(-W / 2, -H * 0.62)

    if (L.sun > 0) this.drawSun(now, L.sun, st)

    // Ranges, far to near, with parallax against the camera and a slow drift.
    // The part of the page visible through the current zoom, in pre-zoom coordinates.
    const vx0 = W / 2 - W / 2 / z
    const vx1 = W / 2 + W / 2 / z
    const vy0 = H * 0.62 - (H * 0.62) / z
    const vy1 = H * 0.62 + (H * 0.38) / z
    this.ranges.forEach((rg, i) => {
      const reveal = easeInOut(clamp((r - rg.spec.unlock) / 0.9))
      this.offsets[i] = (((st.cam.fx * rg.spec.par + now * 0.0025 * (i + 1)) % this.P) + this.P) % this.P
      this.rises[i] = (1 - reveal) * H * 0.1
      if (reveal <= 0.001) return
      const ox = this.offsets[i]
      ctx.globalAlpha = reveal * (1 - L.fade * 0.4 * (1 - i * 0.15)) * (1 - 0.3 * L.gold)
      // Blit only what is both inked and on screen: skip the empty sky above the highest glyph
      // and whichever tile copies fall outside the view.
      const rise = this.rises[i]
      const top = Math.max(isFinite(rg.minY) ? rg.minY : H, vy0 - rise, 0)
      const bottom = Math.min(H, vy1 - rise)
      if (bottom > top) {
        for (const base of [-ox, -ox + this.P]) {
          const x0 = Math.max(base, vx0)
          const x1 = Math.min(base + this.P, vx1)
          if (x1 <= x0) continue
          const sc = this.sc
          ctx.drawImage(rg.canvas, (x0 - base) * sc, top * sc, (x1 - x0) * sc, (bottom - top) * sc, x0, top + rise, x1 - x0, bottom - top)
        }
      }
      ctx.globalAlpha = 1
      // (the mist at each range's foot is baked into the range canvas — see Range.bakeMist)
    })

    if (L.water > 0) this.drawWater(now, L.water, L.gold)
    ctx.restore()

    // Highest drawn pixel so far (ranges, sun halo), in screen space: the tint below needs nothing above it.
    let inkTop = H
    this.ranges.forEach((rg, i) => {
      if (r >= rg.spec.unlock && isFinite(rg.minY)) inkTop = Math.min(inkTop, rg.minY + this.rises[i])
    })
    if (L.sun > 0) inkTop = Math.min(inkTop, this.sunTop)
    inkTop = H * 0.62 + (inkTop - H * 0.62) * z - 2

    // Gold light over everything written, at the end.
    if (L.gold > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = mixColor(GOLD, GOLD, 0, 0.3 * L.gold)
      const y0 = Math.max(0, inkTop)
      ctx.fillRect(0, y0, W, H - y0)
      ctx.restore()
    }

    if (L.schools > 0) this.drawSchools(dt, st, L.schools)
    this.drawDrifters(now, dt, st, L)
    this.drawFlights(now, st)
    if (st.pointer && r >= 1.8) this.drawLens(st.pointer.x, st.pointer.y, r, st.pointer.a)
    ctx.restore()
  }

  private openX1 = 0
  private openY1 = 0

  /** The uncovered part of the screen, when a panel spans the full height (side) or width (bottom). */
  private openRect(o: ScapeState['occluder']) {
    if (!o) return null
    const { W, H } = this
    if (o.h >= H * 0.75 && o.x > W * 0.3) return { x0: 0, y0: 0, x1: o.x, y1: H }
    if (o.w >= W * 0.9 && o.y > H * 0.2) return { x0: 0, y0: 0, x1: W, y1: o.y }
    return null
  }

  /* ── roads not taken, rising ── */
  private drawFlights(now: number, st: ScapeState) {
    const ctx = this.ctx
    const keep: Flight[] = []
    for (const f of this.flights) {
      const k = clamp((now - f.born) / f.dur)
      const rg = this.ranges[f.range]
      const rx = this.toRangeX(f.range, f.tx, st.zoom)
      const ty = rg.ridge(rx) + this.rises[f.range] - f.word.length * rg.spec.size * 0.6
      if (k >= 1) {
        this.settle(f.word, f.tx, f.range, st.zoom)
        continue
      }
      keep.push(f)
      const e = easeInOut(k)
      // a lifting arc: up from the river, then gliding down onto the ridge
      const u = 1 - e
      const c1x = f.sx
      const c1y = f.sy - 160
      const c2x = f.tx
      const c2y = Math.min(ty, f.sy) - 140
      const x = u * u * u * f.sx + 3 * u * u * e * c1x + 3 * u * e * e * c2x + e * e * e * f.tx
      const y = u * u * u * f.sy + 3 * u * u * e * c1y + 3 * u * e * e * c2y + e * e * e * ty
      // whole-pixel steps: the shrinking word reuses a handful of sprites instead of making new ones
      const size = Math.round(lerp(f.size0, rg.spec.size * 1.12, easeOut(k)))
      const n = f.word.length
      const rgb = mixRGB(GRAPHITE, INK, Math.round(k * 10) / 10)
      const a = 0.35 + 0.4 * Math.sin(Math.PI * k)
      // the word turns from a horizontal line into a vertical column as it travels
      for (let i = 0; i < n; i++) {
        const hx = (i - (n - 1) / 2) * size
        const vy = (i - (n - 1) / 2) * size * 1.08
        this.stamp(f.word[i], size, rgb, a, x + hx * (1 - e), y + vy * e)
      }
    }
    ctx.globalAlpha = 1
    this.flights = keep
  }

  /** Lay the disc of 日 once (done in idle time, before the finale needs it). */
  private ensureSun(R: number) {
    const key = `${Math.round(R)}`
    if (this.sun && this.sun.key === key) return
    const c = document.createElement('canvas')
    const s = this.sc
    c.width = Math.ceil(R * 2 * s)
    c.height = Math.ceil(R * 2 * s)
    const x = c.getContext('2d')!
    x.setTransform(s, 0, 0, s, 0, 0)
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    const step = 9
    const cells: [number, number][] = []
    for (let yy = -R; yy <= R; yy += step) {
      for (let xx = -R; xx <= R; xx += step) if (xx * xx + yy * yy <= (R - 3) * (R - 3)) cells.push([xx, yy])
    }
    x.font = `500 8px ${SERIF}`
    x.fillStyle = mixColor(RED, PAPER, 0.3, 0.24)
    for (const [xx, yy] of cells) x.fillText(SCAPE_CHARS.sun, R + xx, R + yy)
    this.sun = { canvas: c, key, ctx: x, cells, yours: new Set(), R, step }
  }

  /* ── the sun: written in 日, with one vermilion 你 for each word the visitor turned ── */
  private drawSun(now: number, level: number, st: ScapeState) {
    const { W, H } = this
    const R = Math.min(W, H) * 0.12
    // The disc of 日 is laid once; when the visitor's count changes only the affected cells are
    // re-cut (cleared and re-inked as 你 or 日) — identical to re-laying the whole sun.
    this.ensureSun(R)
    const sun = this.sun!
    const want = new Set<number>()
    for (let i = 0; i < Math.min(st.mineCount, sun.cells.length); i++) want.add(Math.floor(hash01(i, 5, this.seed) * sun.cells.length))
    const recut = (i: number, mine: boolean) => {
      const [xx, yy] = sun.cells[i]
      const half = sun.step / 2
      sun.ctx.clearRect(sun.R + xx - half, sun.R + yy - half, sun.step, sun.step)
      sun.ctx.font = `500 ${mine ? 10 : 8}px ${SERIF}`
      sun.ctx.fillStyle = mine ? mixColor(RED, RED, 0, 0.8) : mixColor(RED, PAPER, 0.3, 0.24)
      sun.ctx.fillText(mine ? SCAPE_CHARS.you : SCAPE_CHARS.sun, sun.R + xx, sun.R + yy)
    }
    for (const i of want) if (!sun.yours.has(i)) recut(i, true)
    for (const i of sun.yours) if (!want.has(i)) recut(i, false)
    sun.yours = want
    const x = W * 0.3
    const y = lerp(H * 0.95, H * 0.42, easeInOut(level)) + Math.sin(now * 0.0004) * 2
    const ctx = this.ctx
    this.sunTop = y - R * 3
    const halo = ctx.createRadialGradient(x, y, R * 0.9, x, y, R * 2.4)
    halo.addColorStop(0, mixColor(RED, GOLD, 0.5, 0.12 * level))
    halo.addColorStop(1, mixColor(RED, GOLD, 0.5, 0))
    ctx.fillStyle = halo
    ctx.fillRect(x - R * 3, y - R * 3, R * 6, R * 6)
    ctx.globalAlpha = level
    ctx.drawImage(sun.canvas, x - R, y - R, R * 2, R * 2)
    ctx.globalAlpha = 1
  }

  /* ── water written in 水波流, rolling at the foot of the page ── */
  private drawWater(now: number, level: number, gold: number) {
    const { W, H } = this
    const chars = SCAPE_CHARS.water
    const gq = Math.round(gold * 4) / 4
    for (let row = 0; row < 4; row++) {
      const y0 = H * (0.9 + row * 0.028)
      const size = 9 + row * 2
      const rgb = mixRGB(mixRGB(SLATE, GOLD, gq * 0.5), INK, row * 0.15)
      const a = (0.18 + row * 0.07) * level
      const step = size * 1.5
      const shift = (now * (0.012 + row * 0.006)) % step
      if (y0 - 20 > this.openY1) continue
      for (let x = -step + shift; x < Math.min(W, this.openX1) + step; x += step) {
        const y = y0 + Math.sin(x * 0.012 + now * 0.0012 + row) * (4 + row * 2)
        this.stamp(chars[Math.floor(Math.abs(x / step + row * 3)) % chars.length], size, rgb, a, x, y)
      }
    }
    this.ctx.globalAlpha = 1
  }

  /* ── schools of unsaid words swimming through the page ── */
  private drawSchools(dt: number, st: ScapeState, level: number) {
    const { ctx, W, H } = this
    const want = W < 720 ? 2 : 5
    while (this.schools.length < want) {
      const dir = Math.random() < 0.5 ? 1 : -1
      this.schools.push({
        word: UNSAID_WORDS[Math.floor(Math.random() * UNSAID_WORDS.length)].repeat(2),
        x: dir > 0 ? -60 : W + 60,
        y: H * (0.3 + Math.random() * 0.55),
        dir,
        speed: 26 + Math.random() * 22,
        phase: Math.random() * 6,
        red: st.rich >= 2.9 && Math.random() < 0.35,
        trail: [],
      })
    }
    for (const s of this.schools) {
      if (!st.rm) {
        s.phase += dt * 2.2
        s.x += s.dir * (s.speed + st.flow * 60) * dt
        s.y += Math.sin(s.phase) * 18 * dt
      }
      s.trail.unshift({ x: s.x, y: s.y })
      if (s.trail.length > 80) s.trail.length = 80
      const n = s.word.length
      for (let i = 0; i < n; i++) {
        const p = s.trail[Math.min(s.trail.length - 1, i * 6)]
        const size = Math.max(6, 13 - i * 0.9)
        this.stamp(s.word[i], size, mixRGB(s.red ? RED : INK, PAPER, i / (n + 2)), 0.55 * level, p.x, p.y)
      }
    }
    ctx.globalAlpha = 1
    this.schools = this.schools.filter((s) => s.x > -120 && s.x < W + 120)
  }

  /* ── mist, leaves, petals and motes, all written ── */
  private drawDrifters(now: number, dt: number, st: ScapeState, L: Record<string, number>) {
    const { ctx, W, H } = this
    // density follows screen area, so a phone is not buried
    const k = clamp((W * H) / (1440 * 900), 0.3, 1)
    const want: Record<Drifter['kind'], number> = {
      mist: Math.round(160 * L.mist * k),
      leaf: Math.round(60 * L.leaves * k),
      petal: Math.round(90 * L.petals * k),
      light: Math.round(50 * L.light * k),
    }
    const count = (k: Drifter['kind']) => this.drifters.filter((d) => d.kind === k).length
    for (const kind of Object.keys(want) as Drifter['kind'][]) {
      let c = count(kind)
      while (c < want[kind]) {
        this.drifters.push(this.spawn(kind, true))
        c++
      }
      if (c > want[kind]) {
        let extra = c - want[kind]
        this.drifters = this.drifters.filter((d) => !(d.kind === kind && extra-- > 0))
      }
    }
    const sc = this.sc
    const gq = Math.round(L.gold * 4) / 4
    const rgbOf: Record<Drifter['kind'], RGB> = {
      mist: mixRGB(SLATE, PAPER, 0.35),
      leaf: mixRGB(GRAPHITE, SLATE, 0.3),
      petal: mixRGB(BLOSSOM, GOLD, gq * 0.3),
      light: GOLD,
    }
    for (const d of this.drifters) {
      if (!st.rm) {
        d.phase += dt
        d.x += (d.vx + st.flow * 40) * dt
        d.y += d.vy * dt + (d.kind === 'mist' ? Math.sin(d.phase * 0.4) * 3 * dt : 0)
        d.rot += d.vr * dt
      }
      if (d.x < -40 || d.x > W + 40 || d.y > H + 30 || d.y < -40) Object.assign(d, this.spawn(d.kind, false))
      let a: number
      if (d.kind === 'mist') a = 0.22 * L.mist * (0.6 + 0.4 * Math.sin(d.phase))
      else if (d.kind === 'leaf') a = 0.5 * L.leaves
      else if (d.kind === 'petal') a = 0.75 * L.petals
      else a = (0.4 + 0.5 * Math.sin(now * 0.004 + d.phase * 5)) * L.light
      if (a <= 0.003) continue
      if (d.x - d.size > this.openX1 || d.y - d.size > this.openY1) continue
      const cos = Math.cos(d.rot) * sc
      const sin = Math.sin(d.rot) * sc
      ctx.setTransform(cos, sin, -sin, cos, d.x * sc, d.y * sc)
      this.stamp(d.ch, d.size, rgbOf[d.kind], a, 0, 0)
    }
    ctx.setTransform(sc, 0, 0, sc, 0, 0)
    ctx.globalAlpha = 1
  }

  private spawn(kind: Drifter['kind'], anywhere: boolean): Drifter {
    const { W, H } = this
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
    if (kind === 'mist') {
      const band = Math.floor(Math.random() * 3)
      return {
        ch: pick(SCAPE_CHARS.mist),
        x: anywhere ? Math.random() * W : -30,
        y: H * (0.3 + band * 0.18) + (Math.random() - 0.5) * H * 0.08,
        vx: 8 + Math.random() * 10,
        vy: 0,
        rot: 0,
        vr: 0,
        size: 10 + Math.random() * 10,
        kind,
        phase: Math.random() * 6,
      }
    }
    if (kind === 'light') {
      return {
        ch: SCAPE_CHARS.light,
        x: Math.random() * W,
        y: H * (0.15 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 4,
        rot: 0,
        vr: 0,
        size: 7 + Math.random() * 4,
        kind,
        phase: Math.random() * 6,
      }
    }
    const leaf = kind === 'leaf'
    return {
      ch: pick(leaf ? SCAPE_CHARS.leaf : SCAPE_CHARS.petal),
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -20,
      vx: leaf ? -8 - Math.random() * 10 : 16 + Math.random() * 24,
      vy: leaf ? 22 + Math.random() * 16 : 10 + Math.random() * 14,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 2.4,
      size: 9 + Math.random() * 6,
      kind,
      phase: Math.random() * 6,
    }
  }

  /* ── the lens: close up, every stroke of the mountain is a word ── */
  private drawLens(px: number, py: number, rich: number, alpha: number) {
    const ctx = this.ctx
    const R = 74
    const M = 2.3
    const hits: { x: number; y: number; s: number; a: number; c: string }[] = []
    this.ranges.forEach((rg, i) => {
      if (rich < rg.spec.unlock + 0.05 || !rg.glyphs.x.length) return
      const rx = (((px + this.offsets[i]) % this.P) + this.P) % this.P
      const span = R / M + 10
      for (const k of rg.near(rx - span, rx + span)) {
        let dx = rg.glyphs.x[k] - rx
        if (dx > this.P / 2) dx -= this.P
        if (dx < -this.P / 2) dx += this.P
        const gy = rg.glyphs.y[k] + this.rises[i]
        const dy = gy - py
        if (dx * dx + dy * dy > span * span) continue
        hits.push({ x: px + dx * M, y: py + dy * M, s: rg.glyphs.s[k] * M, a: rg.glyphs.a[k], c: rg.glyphs.c[k] })
      }
    })
    if (hits.length < 6) return
    ctx.save()
    ctx.globalAlpha = alpha
    const bg = ctx.createRadialGradient(px, py, R * 0.6, px, py, R * 1.2)
    bg.addColorStop(0, mixColor(PAPER, PAPER, 0, 0.94))
    bg.addColorStop(1, mixColor(PAPER, PAPER, 0, 0))
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(px, py, R * 1.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(px, py, R, 0, Math.PI * 2)
    ctx.clip()
    for (const h of hits) {
      // glyphs are stored top-anchored; sprites are centred
      this.stamp(h.c, h.s, INK, Math.min(0.9, 0.25 + h.a * 2.2) * alpha, h.x, h.y + h.s / 2)
    }
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = mixColor(INK, INK, 0, 0.35)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(px, py, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = `400 10px ${SERIF}`
    ctx.fillStyle = mixColor(GRAPHITE, GRAPHITE, 0, 0.9)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('近看：山是用沒說出口的詞寫成的', px, py + R + 8)
    ctx.restore()
  }
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
