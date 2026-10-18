/**
 * Word sprites for the river canvas.
 *
 * Shaping and rasterising text is the most expensive thing the river does, and while the camera
 * moves (fast scrolling, zooms) the static text cache cannot help. Each distinct (text, font,
 * colour) is rasterised at a few size buckets (sixth-of-an-octave steps) and blitted.
 *
 * Making a sprite costs more than drawing the text once, so creation is rationed per frame:
 *   · live drawing (camera moving) borrows the nearest existing bucket — within about an octave
 *     down or half an octave up; on moving text the difference is imperceptible;
 *   · strict drawing (building the static cache) wants an exact bucket, makes what it may this
 *     frame, and reports `incomplete` so the cache is finished over the next frames instead.
 */

const STEP = 6 // buckets per octave
const BUDGET = 7_000_000 // device pixels kept alive (≈28 MB)
/** Time each frame may spend rasterising new sprites (ms). */
const MAKE_MS = 3
/**
 * Live drawing may borrow a sprite this many buckets larger / smaller. Larger covers a whole
 * zoom-out (three octaves, high-quality downsampling); once the camera settles the static cache
 * redraws everything from exact-size sprites.
 */
const BORROW_UP = 18
const BORROW_DOWN = 3

interface Sprite {
  c: HTMLCanvasElement
  /** Raster font size in device px. */
  px: number
  pad: number
  base: number
  w: number
  h: number
}

export class TextSprites {
  /** LRU of every sprite, keyed `${base}#${bucket}`. */
  private lru = new Map<string, Sprite>()
  /** Buckets available per base key, for nearest-bucket lookup. */
  private index = new Map<string, Set<number>>()
  private pixels = 0
  private probe = document.createElement('canvas').getContext('2d')!
  /** Time spent rasterising this frame (ms). */
  private spent = 0
  /** Advance width per px of font size, measured once per string. */
  private widths = new Map<string, number>()
  /** Strict mode: require an exact bucket (used to build the crisp static cache). */
  strict = false
  /** Set when a strict draw could not be satisfied this frame. */
  incomplete = false
  /** Dry run: look up / make sprites but draw nothing (used to check the static cache is ready). */
  dry = false

  /** Advance width of `text` at `size` (measured once per string, then scaled). */
  advance(text: string, family: string, weight: number, size: number) {
    const wk = `${text}|${family}|${weight}`
    let per = this.widths.get(wk)
    if (per === undefined) {
      this.probe.font = `${weight} 100px ${family}`
      per = this.probe.measureText(text).width / 100
      this.widths.set(wk, per)
    }
    return per * size
  }

  /** Call once per frame. */
  frame() {
    this.spent = 0
  }

  draw(
    ctx: CanvasRenderingContext2D,
    text: string,
    family: string,
    weight: number,
    size: number,
    devScale: number,
    rgb: string,
    alpha: number,
    x: number,
    baseline: number,
  ) {
    if (alpha <= 0.003) return
    const want = size * devScale
    if (want < 1) return
    const b = Math.ceil(Math.log2(want) * STEP)
    const base = `${text}|${family}|${weight}|${rgb}`
    let s = this.find(base, b, this.strict ? 1 : BORROW_UP, this.strict ? 0 : BORROW_DOWN)
    if (!s) {
      if (this.spent < MAKE_MS) {
        const t0 = performance.now()
        s = this.make(base, b, text, family, weight, rgb)
        this.spent += performance.now() - t0
      } else if (this.strict) {
        this.incomplete = true
        return
      } else if (this.dry) {
        return
      } else {
        // nothing to borrow and no budget left: shape it directly this once
        ctx.save()
        ctx.globalAlpha = Math.min(1, alpha)
        ctx.font = `${weight} ${size}px ${family}`
        ctx.fillStyle = rgb
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(text, x, baseline)
        ctx.restore()
        return
      }
    }
    if (this.dry) return
    const k = size / s.px // world units per raster px
    ctx.globalAlpha = Math.min(1, alpha)
    ctx.drawImage(s.c, x - s.pad * k, baseline - s.base * k, s.w * k, s.h * k)
    ctx.globalAlpha = 1
  }

  /** Nearest existing bucket to b within [b - down, b + up], preferring larger (sharper). */
  private find(base: string, b: number, up: number, down: number): Sprite | undefined {
    const set = this.index.get(base)
    if (!set) return undefined
    let best = Infinity
    let bb = 0
    for (const v of set) {
      const d = v - b
      if (d > up || d < -down) continue
      const cost = d >= 0 ? d : -d * 2 // enlarging is worse than shrinking
      if (cost < best) {
        best = cost
        bb = v
      }
    }
    if (best === Infinity) return undefined
    const key = `${base}#${bb}`
    const s = this.lru.get(key)!
    this.lru.delete(key)
    this.lru.set(key, s)
    return s
  }

  private make(base: string, b: number, text: string, family: string, weight: number, rgb: string): Sprite {
    const px = Math.pow(2, b / STEP)
    const wk = `${text}|${family}|${weight}`
    let per = this.widths.get(wk)
    if (per === undefined) {
      this.probe.font = `${weight} 100px ${family}`
      per = this.probe.measureText(text).width / 100
      this.widths.set(wk, per)
    }
    // generous fixed ascent/descent: CJK and Latin glyphs both fit, no per-sprite metrics needed
    const pad = Math.ceil(px * 0.12) + 1
    const asc = Math.ceil(px * 1.0) + 1
    const desc = Math.ceil(px * 0.3) + 1
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.ceil(per * px + pad * 2))
    c.height = Math.max(1, asc + desc)
    const x = c.getContext('2d')!
    x.font = `${weight} ${px}px ${family}`
    x.textBaseline = 'alphabetic'
    x.fillStyle = rgb
    x.fillText(text, pad, asc)
    const s: Sprite = { c, px, pad, base: asc, w: c.width, h: c.height }
    this.lru.set(`${base}#${b}`, s)
    let set = this.index.get(base)
    if (!set) this.index.set(base, (set = new Set()))
    set.add(b)
    this.pixels += c.width * c.height
    this.evict()
    return s
  }

  private evict() {
    for (const [k, s] of this.lru) {
      if (this.pixels <= BUDGET) break
      this.lru.delete(k)
      this.pixels -= s.c.width * s.c.height
      const i = k.lastIndexOf('#')
      const set = this.index.get(k.slice(0, i))
      if (set) {
        set.delete(Number(k.slice(i + 1)))
        if (!set.size) this.index.delete(k.slice(0, i))
      }
    }
  }
}
