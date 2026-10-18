import { GRAPHITE, INK, PAPER, RED, SILT, UL } from './consts'
import { clamp, easeOut, easeOutBack, hash01, mixColor } from './math'
import type { RiverNode } from './types'

/**
 * 萬物競發 — life along the banks.
 *
 * Every word written plants something on the bank below it. Nothing sprouts in the first
 * chapter; from the second on, everything already written starts to grow, and each chapter
 * unlocks another kind of life and another colour:
 *
 *   II   grass and reeds           — celadon, the first colour after ink
 *   III  plum branches in bud      — blossom pink
 *   IV   flowers; the visitor's words bloom vermilion; plants lean away from the pointer
 *   V    forgotten words wither    — grey, drooping, petals falling
 *   VI   full bloom, touched with gold
 */

type RGB = [number, number, number]
export const CELADON: RGB = [104, 136, 104]
export const BLOSSOM: RGB = [228, 158, 146]
export const GOLD: RGB = [184, 138, 58]

type Kind = 'grass' | 'reed' | 'branch' | 'flower'

interface Plant {
  kind: Kind
  x: number
  dy: number
  h: number
  lean: number
  seed: number
  unlock: number
  /** When this plant reached its current form (ms), or -1. */
  since: number
  /** The form it is currently drawn in: a sprout until its own kind unlocks. */
  form: Kind | null
}

export interface FloraView {
  now: number
  rich: number
  s: number
  rm: boolean
  still: boolean
  /** Pointer in world space, or null. */
  px: number | null
  py: number | null
  wind: number
}

/** The garden band begins this far below the river line. */
const BANK = 228

const UNLOCK: Record<Kind, number> = { grass: 0.9, reed: 1.3, branch: 1.65, flower: 2.5 }

export class Flora {
  /** Keyed by the node object itself: no per-frame key strings, and plants die with their node. */
  private plants = new WeakMap<RiverNode, Plant[]>()
  seed = Math.random() * 1000

  reset() {
    this.plants = new WeakMap()
    this.seed = Math.random() * 1000
  }

  private plantsFor(n: RiverNode): Plant[] {
    let list = this.plants.get(n)
    if (list) return list
    list = []
    const span = n.width + 14
    const count = 3 + Math.floor(hash01(n.index, this.seed) * 3)
    for (let i = 0; i < count; i++) {
      const r = hash01(n.index, i, this.seed)
      const r2 = hash01(i, n.index * 3.7, this.seed)
      // A mix weighted toward grass; the visitor's words favour flowers and blossom.
      let kind: Kind = r < 0.38 ? 'grass' : r < 0.6 ? 'reed' : r < 0.84 ? 'branch' : 'flower'
      if (n.mine && r2 < 0.5) kind = r < 0.5 ? 'flower' : 'branch'
      const h = kind === 'grass' ? 22 + r2 * 26 : kind === 'reed' ? 62 + r2 * 50 : kind === 'branch' ? 70 + r2 * 46 : 38 + r2 * 30
      list.push({
        kind,
        x: n.x - 6 + ((i + 0.5) / count) * span + (r2 - 0.5) * 10,
        dy: BANK + (r - 0.5) * 22,
        h,
        lean: (r2 - 0.5) * 0.5,
        seed: r * 1000,
        unlock: UNLOCK[kind] + r2 * 0.4,
        since: -1,
        form: null,
      })
    }
    this.plants.set(n, list)
    return list
  }

  draw(ctx: CanvasRenderingContext2D, nodes: RiverNode[], visible: (n: RiverNode) => boolean, v: FloraView) {
    if (v.rich < 0.85) return
    const lineMin = 0.7 / v.s
    const detail = v.s > 0.32
    const gold = clamp((v.rich - 5.1) / 0.8)
    for (const n of nodes) {
      if (!visible(n)) continue
      const base = n.y + UL
      const wither = v.still ? 0 : n.e
      for (const p of this.plantsFor(n)) {
        // Every plant sprouts as grass in chapter II, then grows into its own kind when that unlocks.
        const form: Kind | null = v.rich >= p.unlock ? p.kind : v.rich >= UNLOCK.grass ? 'grass' : null
        if (form !== p.form) {
          p.form = form
          p.since = form ? (v.still || v.rm ? 0 : v.now) : -1
        }
        if (!form) continue
        const g = v.still || v.rm ? 1 : clamp((v.now - p.since - (p.seed % 700)) / 2400)
        if (g <= 0) continue
        const bx = p.x
        const by = base + p.dy
        // Wind, plus a push away from the pointer (from chapter IV).
        let sway = v.rm ? 0 : Math.sin(v.now * 0.0014 + bx * 0.012 + p.seed) * (0.06 + v.wind * 0.18)
        if (v.px !== null && v.py !== null && v.rich >= 2.8) {
          const dx = bx - v.px
          const dy = by - p.h * 0.5 - v.py
          const d = Math.hypot(dx, dy)
          if (d < 140) sway += Math.sign(dx || 1) * (1 - d / 140) * 0.55
        }
        const droop = wither * 0.9
        const ang = p.lean + sway + droop * Math.sign(p.lean || 0.1)
        const stemCol = mixColor(mixRGB(CELADON, INK, form === 'branch' ? 0.65 : 0.15), SILT, wither * 0.9, (0.55 + 0.35 * clamp(v.rich - 1)) * (1 - wither * 0.45))
        ctx.strokeStyle = stemCol
        ctx.lineCap = 'round'
        switch (form) {
          case 'grass':
            drawGrass(ctx, bx, by, p.kind === 'grass' ? p : { ...p, h: 18 + (p.seed % 16) }, g, ang, lineMin, detail)
            break
          case 'reed':
            drawReed(ctx, bx, by, p, g, ang, lineMin, wither)
            break
          case 'branch':
            drawBranch(ctx, bx, by, p, g, ang, lineMin, detail, v, n.mine, wither, gold)
            break
          case 'flower':
            drawFlower(ctx, bx, by, p, g, ang, lineMin, v, n.mine, wither, gold)
            break
        }
      }
    }
  }
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function tip(bx: number, by: number, h: number, ang: number) {
  return { x: bx + Math.sin(ang) * h, y: by - Math.cos(ang) * h }
}

function drawGrass(ctx: CanvasRenderingContext2D, bx: number, by: number, p: Plant, g: number, ang: number, lw: number, detail: boolean) {
  const blades = detail ? 5 : 2
  // Zoomed out, every blade is clamped to the same hairline: one path instead of five strokes.
  const batch = lw >= 1.4
  if (batch) {
    ctx.lineWidth = lw
    ctx.beginPath()
  }
  for (let i = 0; i < blades; i++) {
    const off = (i - (blades - 1) / 2) * 2.4
    const a = ang + (i - (blades - 1) / 2) * 0.22
    const h = p.h * (0.6 + 0.4 * hash01(p.seed, i)) * easeOut(g)
    const t = tip(bx + off, by, h, a)
    if (!batch) {
      ctx.lineWidth = Math.max(lw, 1.4 - i * 0.1)
      ctx.beginPath()
    }
    ctx.moveTo(bx + off, by)
    ctx.quadraticCurveTo(bx + off + Math.sin(a * 0.3) * h * 0.3, by - h * 0.55, t.x, t.y)
    if (!batch) ctx.stroke()
  }
  if (batch) ctx.stroke()
}

function drawReed(ctx: CanvasRenderingContext2D, bx: number, by: number, p: Plant, g: number, ang: number, lw: number, wither: number) {
  const h = p.h * easeOut(g)
  const t = tip(bx, by, h, ang)
  ctx.lineWidth = Math.max(lw, 1.3)
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.quadraticCurveTo(bx + Math.sin(ang) * h * 0.25, by - h * 0.6, t.x, t.y)
  // a leaf (same stroke)
  ctx.moveTo(bx, by - h * 0.2)
  ctx.quadraticCurveTo(bx + 14, by - h * 0.45, bx + 22 + Math.sin(ang) * 10, by - h * 0.32)
  ctx.stroke()
  if (g > 0.6) {
    // plume: short strokes along the top
    const k = clamp((g - 0.6) / 0.4)
    ctx.lineWidth = Math.max(lw, 2.6 * k)
    ctx.strokeStyle = mixColor(GRAPHITE, SILT, wither, 0.7 * k)
    ctx.beginPath()
    for (let i = 0; i < 7; i++) {
      const u = 1 - i * 0.045
      const q = tip(bx, by, h * u, ang)
      ctx.moveTo(q.x, q.y)
      ctx.lineTo(q.x + Math.sin(ang + 0.6) * 4, q.y - Math.cos(ang + 0.6) * 4)
    }
    ctx.stroke()
  }
}

function blossom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, centre: string, s: number) {
  // Below ~1.5 screen px the five petals and centre are indistinguishable from one dot.
  if (r * s < 1.5) {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(x, y, r * 0.95, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.fillStyle = col
  // Under ~3 screen px the petals' overlaps are sub-pixel: fill them as one path.
  const one = r * s < 3
  if (one) ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const px = x + Math.cos(a) * r * 0.62
    const py = y + Math.sin(a) * r * 0.62
    if (!one) ctx.beginPath()
    ctx.moveTo(px + r * 0.52, py)
    ctx.arc(px, py, r * 0.52, 0, Math.PI * 2)
    if (!one) ctx.fill()
  }
  if (one) ctx.fill()
  ctx.fillStyle = centre
  ctx.beginPath()
  ctx.arc(x, y, r * 0.26, 0, Math.PI * 2)
  ctx.fill()
}

function petalColour(v: FloraView, mine: boolean, wither: number, gold: number, a: number) {
  const base = mine && v.rich >= 2.8 ? RED : mixRGB(BLOSSOM, PAPER, 0.15)
  return mixColor(mixRGB(base, GOLD, gold * 0.25), SILT, wither, a * (1 - wither * 0.7))
}

function drawBranch(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  p: Plant,
  g: number,
  ang: number,
  lw: number,
  detail: boolean,
  v: FloraView,
  mine: boolean,
  wither: number,
  gold: number,
) {
  // Plum: a crooked trunk with two levels of twigs; buds open into blossom as the story goes on.
  const segs = 4
  let x = bx
  let y = by
  let a = ang * 0.6
  const len = (p.h / segs) * easeOut(g)
  const tips: { x: number; y: number; a: number; w: number }[] = []
  for (let i = 0; i < segs; i++) {
    a += (hash01(p.seed, i) - 0.5) * 0.7
    const nx = x + Math.sin(a) * len
    const ny = y - Math.cos(a) * len
    ctx.lineWidth = Math.max(lw, 3.2 - i * 0.6)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()
    if (i >= 1 && detail) tips.push({ x: nx, y: ny, a: a + (i % 2 ? 0.9 : -0.9), w: 1.6 - i * 0.2 })
    x = nx
    y = ny
  }
  tips.push({ x, y, a, w: 1 })
  const bloomK = clamp((v.rich - 1.75) / 0.9) * clamp((g - 0.5) / 0.5)
  const l = len * 0.8
  // Zoomed out, all twigs share the clamped hairline: stroke them as one path first.
  const batch = lw >= 1.6
  if (batch) {
    ctx.lineWidth = lw
    ctx.beginPath()
    for (const t of tips) {
      ctx.moveTo(t.x, t.y)
      ctx.lineTo(t.x + Math.sin(t.a) * l, t.y - Math.cos(t.a) * l)
    }
    ctx.stroke()
  }
  for (const t of tips) {
    const ex = t.x + Math.sin(t.a) * l
    const ey = t.y - Math.cos(t.a) * l
    if (!batch) {
      ctx.lineWidth = Math.max(lw, t.w)
      ctx.beginPath()
      ctx.moveTo(t.x, t.y)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }
    if (bloomK > 0) {
      const pop = v.still || v.rm ? 1 : easeOutBack(bloomK)
      const r = (3.2 + hash01(t.x, p.seed) * 2.6) * pop * (1 - wither * 0.5)
      if (r > 0.3) {
        blossom(ctx, ex, ey, r, petalColour(v, mine, wither, gold, 0.85), mixColor(GOLD, GOLD, 0, 0.9), v.s)
        if (detail) blossom(ctx, (t.x + ex) / 2, (t.y + ey) / 2, r * 0.7, petalColour(v, mine, wither, gold, 0.7), mixColor(GOLD, GOLD, 0, 0.8), v.s)
      }
    } else if (g > 0.7) {
      ctx.fillStyle = mixColor(INK, INK, 0, 0.6)
      ctx.beginPath()
      ctx.arc(ex, ey, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  p: Plant,
  g: number,
  ang: number,
  lw: number,
  v: FloraView,
  mine: boolean,
  wither: number,
  gold: number,
) {
  const h = p.h * easeOut(g)
  const t = tip(bx, by, h, ang)
  ctx.lineWidth = Math.max(lw, 1.2)
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.quadraticCurveTo(bx - Math.sin(ang) * 6, by - h * 0.5, t.x, t.y)
  ctx.stroke()
  const k = v.still || v.rm ? 1 : easeOutBack(clamp((g - 0.55) / 0.45))
  if (k <= 0) return
  // chrysanthemum: a ring of radial petals
  const r = (7 + hash01(p.seed, 9) * 5) * k * (1 - wither * 0.5)
  const col = petalColour(v, mine, wither, gold, 0.9)
  if (r * v.s < 1.5) {
    // sub-pixel: the ring of petals reads as a single dot
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(t.x, t.y, r * 0.7, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.strokeStyle = col
  ctx.lineWidth = Math.max(lw, 1.8)
  ctx.beginPath()
  const n = 14
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + p.seed
    ctx.moveTo(t.x + Math.cos(a) * r * 0.25, t.y + Math.sin(a) * r * 0.25)
    ctx.lineTo(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r * 0.8)
  }
  ctx.stroke()
  ctx.fillStyle = mixColor(GOLD, GOLD, 0, 0.9)
  ctx.beginPath()
  ctx.arc(t.x, t.y, Math.max(1, r * 0.22), 0, Math.PI * 2)
  ctx.fill()
  // a leaf pair
  ctx.strokeStyle = mixColor(CELADON, SILT, wither, 0.7)
  ctx.beginPath()
  ctx.moveTo(bx, by - h * 0.35)
  ctx.quadraticCurveTo(bx - 10, by - h * 0.5, bx - 16, by - h * 0.38)
  ctx.moveTo(bx, by - h * 0.25)
  ctx.quadraticCurveTo(bx + 10, by - h * 0.4, bx + 15, by - h * 0.28)
  ctx.stroke()
}
