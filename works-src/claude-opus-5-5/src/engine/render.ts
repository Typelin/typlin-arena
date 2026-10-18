import { CHAPTERS } from '../content'
import { F, GRAPHITE, INK, MONO, PAPER, PITCH, RED, SERIF, SILT, UL } from './consts'
import { clamp, easeInOut, easeOut, easeOutBack, lerp, mixColor } from './math'
import type { Camera, CandState, DeltaSeg, Fossil, OpenSlot, RiverNode, Silt, TrailPoint } from './types'
import type { Flora } from './flora'
import type { TextSprites } from './textsprites'

/**
 * The words on the page (chosen words, roads not taken, probabilities, tallies) only change when
 * the camera moves or the river changes. While nothing changes they are drawn once into this
 * cache and blitted, which is pixel-identical and saves hundreds of fillText calls per frame.
 */
export interface TextCache {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  key: string
  /** Key seen on the previous frame: the cache is only built once a state holds for two frames. */
  seen: string
}

export function createTextCache(): TextCache {
  const canvas = document.createElement('canvas')
  return { canvas, ctx: canvas.getContext('2d')!, key: '', seen: '' }
}

export interface Scene {
  nodes: RiverNode[]
  open: OpenSlot | null
  fossils: Fossil[]
  cam: Camera
  W: number
  H: number
  dpr: number
  now: number
  rm: boolean
  heat: number
  keyboard: boolean
  order: number[]
  /** Restart wash progress 0..1, or -1. */
  wash: number
  finaleU: number
  bias: number
  /** First node inside the context window, and the bracket's visibility. */
  windowFrom?: number
  windowAlpha?: number
  /** Opening marginalia beside the first fork, 0..1. */
  hint?: number
  /** Chapter index: layers accumulate as it grows. */
  stage?: number
  /** Number of riverbank contour lines (fractional while fading in). */
  banks?: number
  trail?: TrailPoint[]
  silt?: Silt[]
  delta?: DeltaSeg[]
  deltaGrowth?: number
  flora?: Flora
  rich?: number
  /** Pointer in world space, when the visitor is present. */
  pointer?: { x: number; y: number } | null
  wind?: number
  /** Rasterised words, used whenever text is drawn on the live canvas. */
  sprites?: TextSprites
  /** Shape text directly (used when filling the static text cache). */
  direct?: boolean
  /** Optional cache for the text layer (see renderScene). */
  textCache?: TextCache
  /** Bumped whenever words are committed or removed. */
  version?: number
  /** Static render for export: every animation finished, no erosion, every stamp shown. */
  still?: boolean
}

const GHOST_SCALE = 0.74
const FONT_WORD = `500 ${F}px ${SERIF}`

const fmtP = (p: number) => (p >= 0.995 ? '1.0' : '.' + String(Math.round(p * 100)).padStart(2, '0'))

interface View {
  x0: number
  x1: number
  y0: number
  y1: number
}

function viewOf(sc: Scene): View {
  const { cam, W, H } = sc
  const x0 = cam.fx - cam.ax / cam.s
  const y0 = cam.fy - cam.ay / cam.s
  return { x0, y0, x1: x0 + W / cam.s, y1: y0 + H / cam.s }
}

function nodeVisible(n: RiverNode, v: View) {
  const right = n.x + n.width + 180
  const left = n.newRow ? -300 : Math.min(n.x, n.prevEnd.x)
  return right >= v.x0 && left <= v.x1 + 40 && n.y + 220 >= v.y0 && n.y - 220 <= v.y1
}

type RGB = [number, number, number]

const rgbStr = (c: RGB) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
const rgbaMix = (a: RGB, b: RGB, t: number, alpha: number) =>
  `rgba(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))},${Math.min(1, alpha).toFixed(3)})`

/**
 * Draw text in the colour lerp(a, b, t) at opacity A using only two sprites per word (pure a and
 * pure b), so erosion — every word drifting from ink to silt — never multiplies sprite variants.
 *
 * Two stacked passes, a then b, with
 *     a1 = 1 − (1 − A) / (1 − A·t)      a2 = A·t
 * leave the background weight at (1 − A), the a weight at A(1 − t) and the b weight at A·t:
 * exactly the single-pass result for the glyph body (anti-aliased edges differ imperceptibly).
 */
function inkPasses(t: number, A: number): [number, number] {
  if (t <= 0.001) return [A, 0]
  if (t >= 0.999) return [0, A]
  const a2 = A * t
  return [1 - (1 - A) / (1 - a2), a2]
}

/**
 * A serif word at world (x, baseline y), scaled k about its optical centre-left — through the
 * sprite cache when there is one, otherwise shaped directly (export, fallback).
 */
function wordAt(ctx: CanvasRenderingContext2D, sc: Scene, w: string, x: number, y: number, k: number, ca: RGB, cb: RGB, t: number, alpha: number) {
  if (sc.sprites && !sc.still && !sc.direct) {
    const [a1, a2] = inkPasses(t, Math.min(1, alpha))
    const base = y - 0.38 * F + 0.38 * F * k
    const dev = sc.dpr * sc.cam.s
    if (a1 > 0.003) sc.sprites.draw(ctx, w, SERIF, 500, F * k, dev, rgbStr(ca), a1, x, base)
    if (a2 > 0.003) sc.sprites.draw(ctx, w, SERIF, 500, F * k, dev, rgbStr(cb), a2, x, base)
    return
  }
  ctx.font = FONT_WORD
  ctx.fillStyle = rgbaMix(ca, cb, t, alpha)
  word(ctx, w, x, y, k)
}

/** A small mono label (probabilities) at world (x, baseline y). */
function labelAt(ctx: CanvasRenderingContext2D, sc: Scene, s: string, size: number, x: number, y: number, ca: RGB, cb: RGB, t: number, alpha: number) {
  if (sc.sprites && !sc.still && !sc.direct) {
    const [a1, a2] = inkPasses(t, Math.min(1, alpha))
    const dev = sc.dpr * sc.cam.s
    if (a1 > 0.003) sc.sprites.draw(ctx, s, MONO, 400, size, dev, rgbStr(ca), a1, x, y)
    if (a2 > 0.003) sc.sprites.draw(ctx, s, MONO, 400, size, dev, rgbStr(cb), a2, x, y)
    return
  }
  ctx.font = `400 ${size}px ${MONO}`
  ctx.fillStyle = rgbaMix(ca, cb, t, alpha)
  ctx.fillText(s, x, y)
}

/**
 * Map annotations (chapter milestones, the context bracket, the river mouth) keep a constant
 * size on screen, so their world size changes with every zoom — but their device size does not,
 * so they always hit the same sprite instead of being re-shaped each frame.
 */
function noteAt(ctx: CanvasRenderingContext2D, sc: Scene, text: string, size: number, x: number, y: number, rgb: RGB, alpha: number, align: 'left' | 'right' = 'left') {
  if (sc.sprites && !sc.still && !sc.direct) {
    const x0 = align === 'right' ? x - sc.sprites.advance(text, MONO, 500, size) : x
    sc.sprites.draw(ctx, text, MONO, 500, size, sc.dpr * sc.cam.s, rgbStr(rgb), alpha, x0, y)
    return
  }
  ctx.font = `500 ${size}px ${MONO}`
  ctx.fillStyle = mixColor(rgb, rgb, 0, alpha)
  ctx.textAlign = align
  ctx.fillText(text, x, y)
  ctx.textAlign = 'left'
}

/** A word drawn at world (x, baseline y), scaled about its optical centre-left. */
function word(ctx: CanvasRenderingContext2D, w: string, x: number, y: number, k: number) {
  if (k === 1) {
    ctx.fillText(w, x, y)
    return
  }
  const cy = y - 0.38 * F
  ctx.save()
  ctx.translate(x, cy)
  ctx.scale(k, k)
  ctx.fillText(w, 0, 0.38 * F)
  ctx.restore()
}

/** Misregistered print: a ghost impression offset from the main one — the look of a word that isn't true. */
function invented(ctx: CanvasRenderingContext2D, w: string, x: number, y: number, k: number, alpha: number, now: number, rm: boolean) {
  const jitter = rm ? 0 : Math.sin(now * 0.013) * 0.8
  ctx.fillStyle = mixColor(GRAPHITE, GRAPHITE, 0, alpha * 0.55)
  word(ctx, w, x + 1.8 + jitter, y - 1.4, k)
  ctx.fillStyle = mixColor(INK, INK, 0, alpha * 0.85)
  word(ctx, w, x, y, k)
}

/**
 * The river's return between rows: a true meander — a U-turn to the right, a long
 * reach back across the page between the rows, and a U-turn into the next row.
 */
export function returnPath(ctx: CanvasRenderingContext2D, px: number, py: number, x: number, y: number) {
  const mid = (py + y) / 2
  const r = Math.min(120, (y - py) / 2)
  ctx.bezierCurveTo(px + r * 1.35, py, px + r * 1.35, mid, px, mid)
  ctx.lineTo(x + 20, mid)
  ctx.bezierCurveTo(x - r * 1.35, mid, x - r * 1.35, y, x, y)
}

function riverPath(ctx: CanvasRenderingContext2D, n: { prevEnd: { x: number; y: number }; newRow: boolean; x: number; y: number }, width: number) {
  const px = n.prevEnd.x
  const py = n.prevEnd.y + UL
  const y = n.y + UL
  ctx.moveTo(px, py)
  if (n.newRow) {
    returnPath(ctx, px, py, n.x, y)
  } else {
    const dx = n.x - px
    ctx.bezierCurveTo(px + dx * 0.55, py, n.x - dx * 0.55, y, n.x, y)
  }
  ctx.lineTo(n.x + width, y)
}

function pathLength(n: RiverNode) {
  const dx = n.x - n.prevEnd.x
  const dy = n.y - n.prevEnd.y
  return (n.newRow ? Math.abs(dx) + Math.abs(dy) * 1.7 + 40 : Math.hypot(dx, dy) * 1.12) + n.width
}

function drawMilestones(ctx: CanvasRenderingContext2D, sc: Scene) {
  const s = sc.cam.s
  for (const n of sc.nodes) {
    if (n.slotInChapter !== 0) continue
    const def = CHAPTERS[n.chapter]
    const base = n.row * PITCH
    const x = n.x - 30
    const e = sc.still ? 0 : n.e
    const a = 0.5 * (1 - 0.5 * e)
    ctx.strokeStyle = mixColor(GRAPHITE, GRAPHITE, 0, a)
    ctx.lineWidth = Math.max(1, 1 / s)
    ctx.setLineDash([3 / Math.max(s, 0.3), 4 / Math.max(s, 0.3)])
    ctx.beginPath()
    ctx.moveTo(x, base - 118)
    ctx.lineTo(x, base + 48)
    ctx.stroke()
    ctx.setLineDash([])
    const size = Math.max(0.42 * F, 11 / s)
    // The source's label sits below the line, clear of the opening inscription.
    const ly = n.chapter === 0 ? base + 44 : base - 106
    noteAt(ctx, sc, `§ ${def.numeral}  ${def.title} · ${def.en}`, size, x + 8, ly, GRAPHITE, Math.min(1, a + 0.25))
  }
}

function drawFossils(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  const s = sc.cam.s
  ctx.lineWidth = Math.max(0.8, 0.8 / s)
  for (const f of sc.fossils) {
    if (f.x > v.x1 + 50 || f.x + 400 < v.x0) continue
    const age = sc.now - f.at
    const a = 0.12 + 0.45 * Math.exp(-age / 420)
    ctx.strokeStyle = mixColor(f.mine ? RED : GRAPHITE, SILT, 0.5, a)
    const [px, py, x, y, x2, y2] = f.pts
    ctx.beginPath()
    ctx.moveTo(px, py)
    const dx = x - px
    if (dx < 0) returnPath(ctx, px, py, x, y)
    else ctx.bezierCurveTo(px + dx * 0.55, py, x - dx * 0.55, y, x, y)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    if (age < 520 && !sc.rm) {
      // The word lifts off the paper.
      const k = age / 520
      ctx.font = FONT_WORD
      ctx.fillStyle = mixColor(INK, SILT, k, 1 - k)
      word(ctx, f.word, f.x, f.y - k * 10, 1)
    }
  }
}

function drawGhosts(ctx: CanvasRenderingContext2D, sc: Scene, v: View, part: 'branches' | 'text') {
  const s = sc.cam.s
  for (const n of sc.nodes) {
    if (!n.fork || !nodeVisible(n, v)) continue
    const k = sc.still || sc.rm ? 1 : easeOut(clamp((sc.now - n.bornAt) / 560))
    const e = sc.still ? 0 : n.e
    n.cands.forEach((c, i) => {
      if (i === n.chosen) return
      const scale = lerp(c.s, GHOST_SCALE, k)
      const alpha = lerp(0.25 + 0.75 * c.p, 0.34, k) * c.a * (1 - 0.55 * e)
      if (part === 'branches') {
        ctx.strokeStyle = mixColor(GRAPHITE, SILT, e, alpha * 0.8)
        ctx.lineWidth = Math.max(0.6 / s, 0.5 + 1.4 * c.p * (1 - k) + 0.3)
        ctx.beginPath()
        riverPath(ctx, { prevEnd: n.prevEnd, newRow: n.newRow, x: n.x, y: c.y }, c.width * scale)
        ctx.stroke()
        return
      }
      if (c.invented) {
        ctx.font = FONT_WORD
        invented(ctx, c.w, n.x, c.y, scale, alpha, sc.now, sc.rm)
      } else {
        wordAt(ctx, sc, c.w, n.x, c.y, scale, GRAPHITE, SILT, e, alpha)
      }
      labelAt(ctx, sc, c.invented ? '?' : fmtP(c.p), 0.36 * F, n.x + c.width * scale + 5, c.y - 0.1 * F, GRAPHITE, SILT, e, alpha * 0.85)
      if ((sc.stage ?? 0) >= 1 && c.votes > 0) {
        ctx.strokeStyle = mixColor(GRAPHITE, SILT, e, alpha * 0.7)
        ctx.lineWidth = 0.8
        tally(ctx, c.votes, n.x + c.width * scale + 0.95 * F, c.y - 0.12 * F, 0.8)
      }
    })
  }
}

/** Tally marks: every visit of the ink tip is a vote. Groups of five, struck through. */
function tally(ctx: CanvasRenderingContext2D, votes: number, x: number, y: number, k: number) {
  const n = Math.min(votes, 25)
  if (n <= 0) return
  const h = 0.32 * F * k
  const step = 3.4 * k
  ctx.beginPath()
  let cx = x
  for (let i = 0; i < n; i++) {
    const inGroup = i % 5
    if (inGroup === 4) {
      ctx.moveTo(cx - step * 4.4, y - h * 0.15)
      ctx.lineTo(cx + step * 0.2, y - h * 0.85)
      cx += step * 2.2
    } else {
      ctx.moveTo(cx, y)
      ctx.lineTo(cx, y - h)
      cx += step
    }
  }
  ctx.stroke()
}

function riverWidth(n: RiverNode) {
  return n.fork ? 1.1 + 3.4 * n.p : 2
}

function drawRiver(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  const s = sc.cam.s
  for (const n of sc.nodes) {
    if (!nodeVisible(n, v)) continue
    const k = sc.still || sc.rm ? 1 : clamp((sc.now - n.bornAt) / (n.fork ? 460 : 200))
    const e = sc.still ? 0 : n.e
    const col = n.mine ? RED : INK
    const lw = Math.max(0.8 / s, riverWidth(n) * (1 - 0.45 * e))
    const L = pathLength(n)
    // Riverbanks: contour lines beneath the channel, one more per chapter.
    const banks = sc.banks ?? 0
    if (banks > 0.01 && k >= 1) {
      ctx.lineWidth = Math.max(0.6 / s, 0.7)
      for (let b = 1; b <= Math.ceil(banks); b++) {
        const a = clamp(banks - (b - 1)) * (0.22 / b) * (1 - 0.5 * e)
        ctx.strokeStyle = mixColor(n.mine ? RED : GRAPHITE, SILT, e, a)
        ctx.save()
        ctx.translate(0, lw * 0.5 + 5.5 * b)
        ctx.beginPath()
        riverPath(ctx, n, n.width)
        ctx.stroke()
        ctx.restore()
      }
    }
    ctx.lineWidth = lw
    ctx.strokeStyle = mixColor(col, SILT, e * (n.mine ? 0.75 : 1), 1 - 0.45 * e)
    if (n.invented) ctx.setLineDash([2.5, 4.5])
    else if (k < 1) ctx.setLineDash([L * easeOut(k), L * 2])
    ctx.beginPath()
    riverPath(ctx, n, n.width)
    ctx.stroke()
    // The current: light glints travelling downstream, from chapter II on.
    if ((sc.stage ?? 0) >= 1 && !sc.still && !sc.rm && k >= 1 && !n.invented && lw * s > 1.3) {
      ctx.setLineDash([1.6, 26])
      ctx.lineDashOffset = -((sc.now * 0.034 + n.index * 7) % 27.6)
      ctx.lineWidth = lw * 0.34
      ctx.strokeStyle = mixColor(PAPER, PAPER, 0, 0.7 * (1 - e))
      ctx.beginPath()
      riverPath(ctx, n, n.width)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.lineDashOffset = 0
    }
    // dry-brush edge: a lighter, thinner second pass slightly offset
    if (!n.invented && lw * s > 1.4) {
      ctx.save()
      ctx.translate(0.8, lw * 0.42)
      ctx.lineWidth = lw * 0.32
      ctx.strokeStyle = mixColor(col, PAPER, 0.35 + e * 0.5, 0.45)
      ctx.beginPath()
      riverPath(ctx, n, n.width * 0.92)
      ctx.stroke()
      ctx.restore()
    }
    ctx.setLineDash([])
  }
}

function drawWords(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  ctx.font = FONT_WORD
  for (const n of sc.nodes) {
    if (!nodeVisible(n, v)) continue
    const k = sc.still || sc.rm ? 1 : clamp((sc.now - n.bornAt) / 420)
    const e = sc.still ? 0 : n.e
    const scale = lerp(n.s0, 1, easeOutBack(k))
    const alpha = 1 - 0.62 * e
    if (n.invented) {
      invented(ctx, n.word, n.x, n.y, scale, alpha, sc.now, sc.rm)
      ctx.font = `400 ${0.4 * F}px ${MONO}`
      ctx.fillStyle = mixColor(RED, SILT, e, alpha)
      ctx.fillText('※', n.x + n.width + 2, n.y - 0.78 * F)
      ctx.font = FONT_WORD
      continue
    }
    wordAt(ctx, sc, n.word, n.x, n.y, scale, n.mine ? RED : INK, SILT, e * (n.mine ? 0.8 : 1), alpha)
  }
}

function drawStamps(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  const size = 0.34 * F
  for (const n of sc.nodes) {
    if (!n.mine) continue
    if (!sc.still && n.stampAt < 0) continue
    if (!nodeVisible(n, v)) continue
    const t = sc.still || sc.rm ? 1 : clamp((sc.now - n.stampAt) / 300)
    const k = lerp(1.9, 1, easeOutBack(t))
    const e = sc.still ? 0 : n.e
    const a = Math.min(1, t * 2.2) * (1 - 0.6 * e)
    ctx.save()
    ctx.translate(n.x + n.width / 2, n.y + UL + 0.5 * F)
    ctx.rotate(n.tilt)
    ctx.scale(k, k)
    ctx.fillStyle = mixColor(RED, SILT, e * 0.7, a)
    ctx.fillRect(-size / 2, -size / 2, size, size)
    ctx.strokeStyle = mixColor(PAPER, PAPER, 0, a * 0.9)
    ctx.lineWidth = 0.9
    ctx.strokeRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4)
    ctx.restore()
  }
}

function drawOpen(ctx: CanvasRenderingContext2D, sc: Scene, textOK: boolean) {
  const o = sc.open
  if (!o) return
  const now = sc.now
  const s = sc.cam.s
  const decided = o.decided
  // Candidates float slightly while undecided; heat makes them quiver.
  const shimmer = (c: CandState) =>
    sc.rm || decided !== null ? 0 : Math.sin(now * 0.0085 + c.ord * 1.9) * sc.heat * 3.4 + Math.sin(now * 0.0019 + c.ord * 1.3) * 1.6

  if (o.fork) {
    // Possible channels: dashed, flowing toward each candidate in proportion to its chance.
    ctx.setLineDash([4, 5])
    ctx.lineDashOffset = sc.rm ? 0 : -now * 0.024
    o.cands.forEach((c) => {
      if (c.a < 0.02) return
      ctx.strokeStyle = mixColor(GRAPHITE, RED, c.bias * 0.85, (0.12 + 0.6 * c.p) * c.a)
      ctx.lineWidth = Math.max(0.6 / s, 0.5 + 1.8 * c.p)
      ctx.beginPath()
      riverPath(ctx, { prevEnd: o.prevEnd, newRow: o.newRow, x: o.x, y: c.y + shimmer(c) }, c.width * c.s)
      ctx.stroke()
    })
    ctx.setLineDash([])
    ctx.lineDashOffset = 0
  }

  if (textOK) {
    o.cands.forEach((c, i) => {
      if (c.a < 0.02) return
      const y = c.y + shimmer(c)
      const chosen = decided === i
      const a = o.fork ? (0.3 + 0.7 * c.p) * c.a : 0.4
      ctx.font = FONT_WORD
      if (c.invented) {
        invented(ctx, c.w, o.x, y, c.s, a, now, sc.rm)
      } else {
        const col = o.fork ? mixColor(INK, RED, Math.max(c.bias * 0.9, chosen && o.mine ? 1 : 0), a) : mixColor(GRAPHITE, GRAPHITE, 0, a)
        ctx.fillStyle = col
        word(ctx, c.w, o.x, y, c.s)
      }
      if (o.fork) {
        ctx.font = `400 ${0.38 * F}px ${MONO}`
        ctx.fillStyle = mixColor(GRAPHITE, RED, c.bias * 0.7, 0.4 + 0.6 * c.a)
        ctx.fillText(c.invented ? '?' : fmtP(c.p), o.x + c.width * c.s + 6, y - 0.1 * F)
        if ((sc.stage ?? 0) >= 1 && c.votes > 0) {
          ctx.strokeStyle = mixColor(GRAPHITE, RED, c.bias * 0.8, 0.75 * c.a)
          ctx.lineWidth = 1
          tally(ctx, c.votes, o.x + c.width * c.s + 1.15 * F, y - 0.12 * F, 1)
        }
        if (sc.keyboard) {
          const n = sc.order.indexOf(i)
          if (n >= 0) {
            ctx.fillStyle = mixColor(INK, INK, 0, 0.55)
            ctx.fillText(String(n + 1), o.x - 0.62 * F, y - 0.1 * F)
          }
        }
      }
    })
  }

  // The ink tip, leaning toward whichever word it is weighing.
  const g = o.cands[o.glance]
  const tipX = o.x - (o.fork ? 9 : 5)
  const tipY = o.needleY + UL
  const px = o.prevEnd.x
  const py = o.prevEnd.y + UL
  ctx.strokeStyle = mixColor(INK, RED, g ? g.bias * 0.8 : 0, 0.92)
  ctx.lineWidth = Math.max(0.9 / s, 2.1)
  ctx.beginPath()
  ctx.moveTo(px, py)
  if (o.newRow) returnPath(ctx, px, py, tipX, tipY)
  else {
    const dx = tipX - px
    ctx.bezierCurveTo(px + dx * 0.6, py, tipX - dx * 0.5, tipY, tipX, tipY)
  }
  ctx.stroke()
  const breathe = sc.rm ? 0 : Math.sin(now * 0.006) * 0.5
  ctx.fillStyle = mixColor(INK, RED, g ? g.bias * 0.8 : 0, 1)
  ctx.beginPath()
  ctx.arc(tipX, tipY, Math.max(1.6 / s, 3.4 + breathe), 0, Math.PI * 2)
  ctx.fill()
}

/** The visitor's pointer as terrain: a fading vermilion survey line (after chapter IV's reveal). */
function drawTrail(ctx: CanvasRenderingContext2D, sc: Scene) {
  const t = sc.trail
  if (!t || t.length < 2 || sc.still) return
  const s = sc.cam.s
  ctx.lineWidth = Math.max(1 / s, 1.1)
  for (let i = 1; i < t.length; i++) {
    const age = (sc.now - t[i].t) / 4200
    if (age >= 1) continue
    ctx.strokeStyle = mixColor(RED, RED, 0, (1 - age) * 0.42)
    ctx.beginPath()
    ctx.moveTo(t[i - 1].x, t[i - 1].y)
    ctx.lineTo(t[i].x, t[i].y)
    ctx.stroke()
    if (i % 6 === 0) {
      ctx.fillStyle = mixColor(RED, RED, 0, (1 - age) * 0.6)
      ctx.fillRect(t[i].x - 1.5 / s, t[i].y - 1.5 / s, 3 / s, 3 / s)
    }
  }
}

/** Specks of silt settling off forgotten words. */
function drawSilt(ctx: CanvasRenderingContext2D, sc: Scene) {
  const list = sc.silt
  if (!list || !list.length || sc.still) return
  for (const p of list) {
    const k = (sc.now - p.born) / p.life
    const a = Math.sin(Math.PI * clamp(k)) * 0.75
    ctx.fillStyle = mixColor(GRAPHITE, SILT, 0.4, a)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** The delta: distributaries grow from the river's mouth, vermilion in proportion to the visitor's share. */
function drawDelta(ctx: CanvasRenderingContext2D, sc: Scene) {
  const segs = sc.delta
  const g = sc.deltaGrowth ?? 0
  if (!segs || !segs.length || g <= 0) return
  const s = sc.cam.s
  for (const d of segs) {
    const local = clamp((g - d.at) / 0.2)
    if (local <= 0) continue
    const L = Math.hypot(d.x1 - d.x0, d.y1 - d.y0) * 1.2
    ctx.strokeStyle = mixColor(d.mine ? RED : INK, PAPER, d.depth * 0.08, 0.85 - d.depth * 0.08)
    ctx.lineWidth = Math.max(0.7 / s, d.w)
    if (local < 1) ctx.setLineDash([L * easeOut(local), L * 2])
    ctx.beginPath()
    ctx.moveTo(d.x0, d.y0)
    ctx.bezierCurveTo(d.c1x, d.c1y, d.c2x, d.c2y, d.x1, d.y1)
    ctx.stroke()
    ctx.setLineDash([])
    if (d.depth === 5 && local >= 1) {
      ctx.fillStyle = mixColor(d.mine ? RED : INK, PAPER, 0.3, 0.6)
      ctx.beginPath()
      ctx.arc(d.x1, d.y1, Math.max(1.2 / s, 2), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (g > 0.85) {
    const a = ramp01((g - 0.85) / 0.15)
    const m = segs[0]
    const size = Math.max(0.42 * F, 11 / s)
    noteAt(ctx, sc, '河口 · 入海前分成許多條 →', size, m.x0 - 8, m.y0 + size * 2.2, GRAPHITE, a, 'right')
  }
}

const ramp01 = (v: number) => clamp(v)

/** The context window: a hairline bracket over the words I can still see. */
function drawWindow(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  const a = sc.windowAlpha ?? 0
  const from = sc.windowFrom ?? -1
  if (a < 0.01 || from < 0 || sc.still) return
  const s = sc.cam.s
  const nodes = sc.nodes.slice(from)
  if (!nodes.length) return
  const rows = new Map<number, { x0: number; x1: number; y: number }>()
  for (const n of nodes) {
    const top = n.y
    const r = rows.get(n.row) ?? { x0: Infinity, x1: -Infinity, y: Infinity }
    r.x0 = Math.min(r.x0, n.x)
    r.x1 = Math.max(r.x1, n.x + n.width)
    r.y = Math.min(r.y, top)
    rows.set(n.row, r)
  }
  const o = sc.open
  if (o) {
    const r = rows.get(o.row) ?? { x0: o.x, x1: o.x, y: o.yc }
    r.x1 = Math.max(r.x1, o.x + Math.max(...o.cands.map((c) => c.width * c.s)) + 30)
    r.y = Math.min(r.y, o.yc)
    rows.set(o.row, r)
  }
  const list = [...rows.entries()].sort((p, q) => p[0] - q[0])
  ctx.strokeStyle = mixColor(INK, INK, 0, 0.7 * a)
  ctx.lineWidth = Math.max(1, 1.1 / s)
  list.forEach(([, r], i) => {
    const y = r.y - 2.6 * F
    const tick = 0.45 * F
    ctx.beginPath()
    if (i === 0) {
      ctx.moveTo(r.x0 - 12, y + tick)
      ctx.lineTo(r.x0 - 12, y)
    } else ctx.moveTo(r.x0 - 12, y)
    ctx.lineTo(r.x1 + 12, y)
    if (i === list.length - 1) ctx.lineTo(r.x1 + 12, y + tick)
    ctx.stroke()
    if (i === 0) {
      // Keep the label on screen even when the window starts off to the left.
      const lx = Math.max(r.x0 - 12, v.x0 + 24 / s)
      noteAt(ctx, sc, `上下文 · 我此刻還記得的 ${nodes.length} 個詞；括弧之外正在淤平`, Math.max(0.4 * F, 10 / s), lx, y - 0.3 * F, INK, 0.8 * a)
    }
  })
}

/** Marginalia for the first fork only: what you are looking at, in one breath. */
function drawHint(ctx: CanvasRenderingContext2D, sc: Scene) {
  const a = sc.hint ?? 0
  const o = sc.open
  if (a < 0.01 || !o || !o.fork) return
  const { cam, dpr } = sc
  const top = Math.min(...o.cands.filter((c) => c.a > 0.3).map((c) => c.y))
  const x = (o.x - cam.fx) * cam.s + cam.ax
  const y = (top - cam.fy) * cam.s + cam.ay - F * cam.s * 1.35
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const size = sc.W < 720 ? 10.5 : 11.5
  ctx.font = `400 ${size}px ${MONO}`
  ctx.fillStyle = mixColor(GRAPHITE, GRAPHITE, 0, a)
  ctx.strokeStyle = mixColor(GRAPHITE, GRAPHITE, 0, a * 0.8)
  ctx.lineWidth = 1
  const lines = ['岔口 — 我還沒決定下一個詞', '小數是機率；指向一個詞，河就往那裡彎']
  const lx = Math.max(12, Math.min(x, sc.W - 12 - Math.max(...lines.map((l) => ctx.measureText(l).width))))
  lines.forEach((l, i) => ctx.fillText(l, lx, y - (lines.length - 1 - i) * size * 1.6))
  ctx.beginPath()
  ctx.moveTo(lx, y + 6)
  ctx.lineTo(lx, y + F * cam.s * 0.55)
  ctx.stroke()
}

function drawWash(ctx: CanvasRenderingContext2D, sc: Scene) {
  if (sc.wash < 0) return
  const { W, H, dpr } = sc
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const u = sc.wash
  const band = W * 0.35
  let from: number
  let to: number
  if (u < 0.46) {
    from = -band
    to = lerp(-band, W + band, easeInOut(u / 0.46))
  } else {
    from = lerp(-band, W + band, easeInOut(clamp((u - 0.5) / 0.5)))
    to = W + band
  }
  const grad = ctx.createLinearGradient(from - band, 0, to + band, 0)
  const span = to - from + band * 2
  const e0 = band / span
  const paper = mixColor(PAPER, PAPER, 0, 1)
  const clear = mixColor(PAPER, PAPER, 0, 0)
  grad.addColorStop(0, clear)
  grad.addColorStop(clamp(e0), paper)
  grad.addColorStop(clamp(1 - e0), paper)
  grad.addColorStop(1, clear)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

export function renderScene(ctx: CanvasRenderingContext2D, sc: Scene) {
  const { cam, dpr } = sc
  ctx.setTransform(dpr * cam.s, 0, 0, dpr * cam.s, dpr * (cam.ax - cam.fx * cam.s), dpr * (cam.ay - cam.fy * cam.s))
  ctx.textBaseline = 'alphabetic'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // sprites borrowed during zooms are downsampled; keep that smooth
  ctx.imageSmoothingQuality = 'high'
  const v = viewOf(sc)
  const textOK = F * cam.s >= 3.2

  drawFossils(ctx, sc, v)
  drawTrail(ctx, sc)
  if (sc.flora) {
    // The garden lives below each row, so its visibility test is looser than the words'.
    const vis = (n: RiverNode) => n.x + n.width + 60 >= v.x0 && n.x - 60 <= v.x1 && n.y + 420 >= v.y0 && n.y - 60 <= v.y1
    sc.flora.draw(ctx, sc.nodes, vis, {
      now: sc.now,
      rich: sc.rich ?? 0,
      s: sc.cam.s,
      rm: sc.rm,
      still: !!sc.still,
      px: sc.pointer ? sc.pointer.x : null,
      py: sc.pointer ? sc.pointer.y : null,
      wind: sc.wind ?? 0,
    })
  }
  drawMilestones(ctx, sc)
  drawGhosts(ctx, sc, v, 'branches')
  drawRiver(ctx, sc, v)
  drawDelta(ctx, sc)
  if (textOK) drawText(ctx, sc, v)
  drawSilt(ctx, sc)
  drawStamps(ctx, sc, v)
  drawOpen(ctx, sc, textOK)
  drawWindow(ctx, sc, v)
  drawHint(ctx, sc)
  drawWash(ctx, sc)
}

function textLayer(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  drawGhosts(ctx, sc, v, 'text')
  drawWords(ctx, sc, v)
}

/** Text is static unless the camera, the river, erosion or an animation changes it. */
function textKey(sc: Scene): string | null {
  if (!sc.textCache || sc.still) return null
  const last = sc.nodes[sc.nodes.length - 1]
  // a word still inking in, or a fabricated word (it jitters), means the text is animating
  if (last && !sc.rm && sc.now - last.bornAt < 700) return null
  let e = 0
  for (const n of sc.nodes) {
    e += n.e
    if (n.invented) return null
    for (const c of n.cands) if (c.invented && c.a > 0.08) return null
  }
  const c = sc.cam
  return [c.fx.toFixed(3), c.fy.toFixed(3), c.s.toFixed(5), c.ax.toFixed(2), c.ay.toFixed(2), sc.W, sc.H, sc.dpr, sc.version ?? 0, sc.nodes.length, e.toFixed(4), sc.stage ?? 0].join('|')
}

function drawText(ctx: CanvasRenderingContext2D, sc: Scene, v: View) {
  const key = textKey(sc)
  const cache = sc.textCache
  if (!key || !cache) {
    textLayer(ctx, sc, v)
    if (cache) cache.seen = ''
    return
  }
  if (cache.key !== key) {
    if (cache.seen !== key) {
      // still settling: draw directly this frame, remember the state
      cache.seen = key
      textLayer(ctx, sc, v)
      return
    }
    // the same state two frames running: render it once into the cache
    const cv = cache.canvas
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    if (cv.width !== w || cv.height !== h) {
      cv.width = w
      cv.height = h
    }
    const cx = cache.ctx
    cx.setTransform(1, 0, 0, 1, 0, 0)
    cx.clearRect(0, 0, w, h)
    cx.setTransform(ctx.getTransform())
    cx.textBaseline = 'alphabetic'
    cx.lineCap = 'round'
    cx.lineJoin = 'round'
    // Built from exact-size sprites. A dry pass first makes whatever is missing (within this
    // frame's budget) without drawing; until everything is ready the live text is shown, so a
    // settle never costs one giant frame and nothing is drawn twice.
    const sp = sc.sprites
    if (sp) {
      sp.strict = true
      sp.dry = true
      sp.incomplete = false
      textLayer(cx, sc, v)
      sp.dry = false
      if (sp.incomplete) {
        sp.strict = false
        cache.key = ''
        cache.seen = key
        textLayer(ctx, sc, v)
        return
      }
    }
    textLayer(cx, sc, v)
    if (sp) sp.strict = false
    cache.key = key
  }
  const t = ctx.getTransform()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(cache.canvas, 0, 0)
  ctx.setTransform(t)
}

/** A keepsake image of the finished river. */
export function renderExport(
  nodes: RiverNode[],
  b: { x0: number; y0: number; x1: number; y1: number },
  stats: { words: number; forks: number; mine: number; invented: number; meanT: number },
  delta: DeltaSeg[] = [],
  flora?: Flora,
): HTMLCanvasElement {
  const W = 2400
  const margin = 150
  const s = (W - margin * 2) / (b.x1 - b.x0)
  const mapH = (b.y1 - b.y0) * s
  const footer = 360
  const H = Math.round(Math.max(1500, mapH + margin * 2 + footer))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = mixColor(PAPER, PAPER, 0, 1)
  ctx.fillRect(0, 0, W, H)
  // paper tooth
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(120,100,70,0.05)' : 'rgba(255,255,255,0.08)'
    ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5)
  }

  const cam: Camera = { fx: b.x0, fy: b.y0, s, ax: margin, ay: margin + (H - footer - margin * 2 - mapH) / 2 }
  renderScene(ctx, {
    nodes,
    open: null,
    fossils: [],
    cam,
    W,
    H,
    dpr: 1,
    now: performance.now(),
    rm: true,
    heat: 0,
    keyboard: false,
    order: [],
    wash: -1,
    finaleU: 1,
    bias: 0,
    still: true,
    stage: 5,
    banks: 3,
    delta,
    deltaGrowth: 1,
    flora,
    rich: 6,
  })

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const fy = H - footer + 40
  ctx.strokeStyle = mixColor(GRAPHITE, GRAPHITE, 0, 0.5)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(margin, fy)
  ctx.lineTo(W - margin, fy)
  ctx.stroke()

  ctx.fillStyle = mixColor(INK, INK, 0, 1)
  ctx.font = `900 96px ${SERIF}`
  ctx.fillText('三角洲', margin, fy + 140)
  ctx.font = `500 34px ${SERIF}`
  ctx.fillText('Claude Opus 5.5 與你一起寫下的一條河', margin, fy + 200)
  ctx.font = `400 24px ${MONO}`
  ctx.fillStyle = mixColor(GRAPHITE, GRAPHITE, 0, 1)
  const date = new Date().toISOString().slice(0, 10)
  const pct = stats.forks ? Math.round((stats.mine / stats.forks) * 100) : 0
  ctx.fillText(
    `${date}   ·   ${stats.words} 詞   ·   ${stats.forks} 個岔口   ·   你改變了 ${stats.mine} 處（${pct}%）   ·   編造 ${stats.invented}   ·   平均溫度 ${stats.meanT.toFixed(2)}`,
    margin,
    fy + 252,
  )

  drawSeal(ctx, W - margin - 190, fy + 50, 190)
  return canvas
}

/** 此河曾流 — "this river once flowed". Read right column first, top to bottom. */
export function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2)
  ctx.rotate(-0.035)
  ctx.fillStyle = mixColor(RED, RED, 0, 0.94)
  ctx.fillRect(-size / 2, -size / 2, size, size)
  ctx.fillStyle = mixColor(PAPER, PAPER, 0, 1)
  ctx.font = `900 ${size * 0.38}px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const q = size * 0.22
  ctx.fillText('此', q, -q)
  ctx.fillText('河', q, q)
  ctx.fillText('曾', -q, -q)
  ctx.fillText('流', -q, q)
  ctx.strokeStyle = mixColor(PAPER, PAPER, 0, 1)
  ctx.lineWidth = size * 0.025
  ctx.strokeRect(-size / 2 + size * 0.05, -size / 2 + size * 0.05, size * 0.9, size * 0.9)
  // worn impression
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(238,232,218,${(Math.random() * 0.7).toFixed(2)})`
    const r = Math.random() * size * 0.012 + 0.5
    ctx.beginPath()
    ctx.arc((Math.random() - 0.5) * size, (Math.random() - 0.5) * size, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
