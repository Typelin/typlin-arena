import { hash01, mixColor, ramp } from './math'
import { GRAPHITE, INK, PAPER, RED } from './consts'
import type { Camera } from './types'

/**
 * The paper behind the river. It starts blank; each chapter adds one layer, so by the
 * delta the page has become a landscape:
 *
 *   I    blank paper
 *   II   currents — hairline flow lines drift across the page
 *   III  ink washes bloom where words are written; far mountains surface
 *   IV   vermilion ripples spread from wherever the visitor pushes
 *   V    silt rain and mist; the page fades
 *   VI   the mountains come whole, a vermilion sun rises, the currents turn gold
 *
 * Rendered at reduced resolution (the softness suits ink wash) on its own canvas.
 */

const RES = 0.6
const GOLD: [number, number, number] = [176, 132, 62]
const MIST: [number, number, number] = [226, 224, 214]
const CELADON: [number, number, number] = [104, 136, 104]


interface Mote {
  x: number
  y: number
  age: number
  life: number
}
interface Bloom {
  x: number
  y: number
  r: number
  born: number
  life: number
  a: number
  red: boolean
}
interface Ripple {
  x: number
  y: number
  born: number
  strong: boolean
}
interface Drop {
  x: number
  y: number
  len: number
  v: number
}

export interface BackdropState {
  /** 0..6: chapter index plus finale progress. */
  rich: number
  cam: Camera
  flow: number
  rm: boolean
}

function mixRGB(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Smooth 1D value noise. */
function noise1(x: number, seed: number) {
  const i = Math.floor(x)
  const f = x - i
  const a = hash01(i, seed)
  const b = hash01(i + 1, seed)
  const t = f * f * (3 - 2 * f)
  return a + (b - a) * t
}

export class Backdrop {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private acc: HTMLCanvasElement
  private actx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private motes: Mote[] = []
  private blooms: Bloom[] = []
  private ripples: Ripple[] = []
  private drops: Drop[] = []
  private nextBloom = 0
  private seed = Math.random() * 1000

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.acc = document.createElement('canvas')
    this.actx = this.acc.getContext('2d')!
  }

  resize(W: number, H: number) {
    this.w = Math.max(1, Math.round(W * RES))
    this.h = Math.max(1, Math.round(H * RES))
    this.canvas.width = this.w
    this.canvas.height = this.h
    this.canvas.style.width = `${W}px`
    this.canvas.style.height = `${H}px`
    this.acc.width = this.w
    this.acc.height = this.h
    this.motes = []
    this.drops = []
  }

  reset() {
    this.actx.clearRect(0, 0, this.w, this.h)
    this.blooms = []
    this.ripples = []
    this.motes = []
    this.seed = Math.random() * 1000
  }

  /** A word was written at screen position (x, y). */
  written(x: number, y: number, mine: boolean, rich: number) {
    if (rich >= 1.8 && Math.random() < 0.55) {
      this.bloom(x * RES + (Math.random() - 0.5) * 60, y * RES + (Math.random() - 0.5) * 40, mine && rich >= 2.8)
    }
    if (mine && rich >= 2.8) this.ripples.push({ x: x * RES, y: y * RES, born: performance.now(), strong: true })
  }

  /** The visitor's pointer moved over the page. */
  touched(x: number, y: number, rich: number) {
    if (rich < 2.8) return
    const last = this.ripples[this.ripples.length - 1]
    const now = performance.now()
    if (last && now - last.born < 420) return
    this.ripples.push({ x: x * RES, y: y * RES, born: now, strong: false })
    if (this.ripples.length > 24) this.ripples.shift()
  }

  private bloom(x: number, y: number, red: boolean) {
    this.blooms.push({
      x,
      y,
      r: 60 + Math.random() * 160,
      born: performance.now(),
      life: 5000 + Math.random() * 6000,
      a: 0.08 + Math.random() * 0.08,
      red,
    })
    if (this.blooms.length > 18) this.blooms.shift()
  }

  frame(now: number, dt: number, st: BackdropState) {
    const { ctx, w, h } = this
    const r = st.rich
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const L = {
      flow: ramp(r, 0.6, 1.6),
      bloom: ramp(r, 1.6, 2.6),
      hills: 0.35 * ramp(r, 1.8, 2.8) + 0.25 * ramp(r, 2.8, 3.8) + 0.4 * ramp(r, 5.0, 5.9),
      ripple: ramp(r, 2.7, 3.3),
      rain: ramp(r, 3.8, 4.4) * (1 - 0.7 * ramp(r, 5.1, 5.7)),
      mist: ramp(r, 3.7, 4.5) * (1 - 0.5 * ramp(r, 5.2, 5.9)),
      sun: ramp(r, 5.05, 5.9),
      gold: ramp(r, 5.2, 6),
      koi: ramp(r, 2.0, 2.8),
      leaves: ramp(r, 3.8, 4.5) * (1 - ramp(r, 5.0, 5.5)),
      petals: ramp(r, 2.6, 3.4) * 0.35 + ramp(r, 5.0, 5.8) * 0.65,
      rays: ramp(r, 5.3, 6),
      flies: ramp(r, 3.0, 3.8) * 0.4 + ramp(r, 5.2, 6) * 0.6,
      celadon: ramp(r, 0.6, 1.6) * (1 - ramp(r, 3.6, 4.4) * 0.6),
    }
    if (r < 0.5) {
      this.actx.clearRect(0, 0, w, h)
      return
    }

    // Mountains, sun, fish, petals and motes are written in words now (wordscape.ts);
    // this layer keeps the wash beneath them: currents, ink blooms, ripples, rain, mist, light.
    this.drawRays(now, L.rays)
    this.drawBlooms(now, L.bloom, r)
    this.drawFlow(now, dt, st, L.flow, L.gold, L.celadon)
    this.drawMist(now, L.mist)
    this.drawRain(dt, st, L.rain)
    this.drawRipples(now, L.ripple, st.rm)
  }

  /* ── III+ · koi beneath the page; vermilion ones once the visitor is known ── */
  /* ── V leaves fall; VI petals drift on the wind ── */
  /* ── VI · fireflies of gold (they begin, faintly, in IV) ── */
  /* ── VI · light from the sun, fanning over the page ── */
  private drawRays(now: number, level: number) {
    if (level <= 0.001) return
    const c = this.ctx
    const { w, h } = this
    const sx = w * 0.3
    const sy = h * 0.42
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.2 + Math.sin(now * 0.0002 + i) * 0.03
      const len = h * 1.2
      const spread = 0.045
      c.fillStyle = mixColor(GOLD, PAPER, 0.5, 0.06 * level * (0.6 + 0.4 * Math.sin(now * 0.0009 + i * 1.3)))
      c.beginPath()
      c.moveTo(sx, sy)
      c.lineTo(sx + Math.cos(a - spread) * len, sy + Math.sin(a - spread) * len)
      c.lineTo(sx + Math.cos(a + spread) * len, sy + Math.sin(a + spread) * len)
      c.closePath()
      c.fill()
    }
    c.restore()
  }

  /* ── VI · a few birds crossing the sky ── */
  /* ── II · currents: particles in a slowly turning field leave hairline trails ── */
  private drawFlow(now: number, dt: number, st: BackdropState, level: number, gold: number, celadon: number) {
    const a = this.actx
    const { w, h } = this
    // fade the trails
    a.globalCompositeOperation = 'destination-out'
    a.fillStyle = `rgba(0,0,0,${st.rm ? 1 : 0.035})`
    a.fillRect(0, 0, w, h)
    a.globalCompositeOperation = 'source-over'
    if (level <= 0.001) return

    const target = Math.round(60 + 160 * level + 80 * gold)
    while (this.motes.length < target) {
      this.motes.push({ x: Math.random() * w, y: Math.random() * h, age: 0, life: 3 + Math.random() * 6 })
    }
    if (this.motes.length > target) this.motes.length = target

    const t = now * 0.00012
    const speed = (26 + st.flow * 120) * dt
    const par = -st.cam.fx * 0.004
    a.lineWidth = 1
    a.strokeStyle = mixColor(mixRGB(GRAPHITE, CELADON, celadon * 0.8), GOLD, gold, 0.26 * level + 0.14 * gold)
    a.beginPath()
    for (const m of this.motes) {
      const ang =
        Math.sin((m.x + par * 60) * 0.006 + t * 3) * 0.9 +
        Math.cos(m.y * 0.009 - t * 2) * 0.7 +
        (noise1(m.x * 0.004 + t, this.seed) - 0.5) * 1.2 -
        0.15
      const nx = m.x + Math.cos(ang) * speed
      const ny = m.y + Math.sin(ang) * speed * 0.55
      if (!st.rm) {
        a.moveTo(m.x, m.y)
        a.lineTo(nx, ny)
      }
      m.x = nx
      m.y = ny
      m.age += dt
      if (m.age > m.life || m.x < -10 || m.x > w + 10 || m.y < -10 || m.y > h + 10) {
        m.x = Math.random() < 0.6 ? -5 : Math.random() * w
        m.y = Math.random() * h
        m.age = 0
      }
    }
    a.stroke()
    this.ctx.drawImage(this.acc, 0, 0)
  }

  /* ── III · ink washes ── */
  private drawBlooms(now: number, level: number, rich: number) {
    if (level <= 0.001) return
    if (now > this.nextBloom) {
      this.bloom(Math.random() * this.w, this.h * (0.15 + Math.random() * 0.7), rich >= 2.8 && Math.random() < 0.3)
      // more often as the story goes on
      this.nextBloom = now + (2400 - Math.min(1600, rich * 260)) * (0.6 + Math.random() * 0.8)
    }
    const c = this.ctx
    this.blooms = this.blooms.filter((b) => now - b.born < b.life)
    for (const b of this.blooms) {
      // born may be a hair later than this frame's clock
      const k = Math.max(0, (now - b.born) / b.life)
      const env = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k * 0.4)
      const rad = b.r * (0.35 + 0.65 * Math.sqrt(k))
      const g = c.createRadialGradient(b.x, b.y, rad * 0.1, b.x, b.y, rad)
      const col = b.red ? RED : INK
      g.addColorStop(0, mixColor(col, col, 0, b.a * env * level))
      g.addColorStop(0.55, mixColor(col, col, 0, b.a * 0.55 * env * level))
      g.addColorStop(1, mixColor(col, col, 0, 0))
      c.fillStyle = g
      c.beginPath()
      // slightly irregular, like ink taken by paper fibres
      for (let i = 0; i <= 24; i++) {
        const th = (i / 24) * Math.PI * 2
        const rr = rad * (0.86 + 0.14 * noise1(th * 2 + b.born, 7))
        const x = b.x + Math.cos(th) * rr
        const y = b.y + Math.sin(th) * rr * 0.8
        if (i === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.fill()
    }
  }

  /* ── III → VI · far mountains, three ranges with mist between ── */
  /* ── IV · vermilion ripples ── */
  private drawRipples(now: number, level: number, rm: boolean) {
    if (level <= 0.001 || rm) return
    const c = this.ctx
    this.ripples = this.ripples.filter((r) => now - r.born < (r.strong ? 2600 : 1800))
    c.lineWidth = 0.8
    for (const r of this.ripples) {
      const life = r.strong ? 2600 : 1800
      const k = Math.max(0, (now - r.born) / life)
      for (let i = 0; i < (r.strong ? 3 : 2); i++) {
        const kk = k - i * 0.14
        if (kk <= 0) continue
        const rad = 6 + kk * (r.strong ? 110 : 60)
        c.strokeStyle = mixColor(RED, RED, 0, (1 - kk) * (r.strong ? 0.4 : 0.22) * level)
        c.beginPath()
        c.ellipse(r.x, r.y, rad, rad * 0.42, 0, 0, Math.PI * 2)
        c.stroke()
      }
    }
  }

  /* ── V · silt rain ── */
  private drawRain(dt: number, st: BackdropState, level: number) {
    if (level <= 0.001) return
    const c = this.ctx
    const { w, h } = this
    const target = Math.round(220 * level)
    while (this.drops.length < target) {
      this.drops.push({ x: Math.random() * w, y: Math.random() * h, len: 4 + Math.random() * 9, v: 18 + Math.random() * 26 })
    }
    if (this.drops.length > target) this.drops.length = target
    c.strokeStyle = mixColor(GRAPHITE, PAPER, 0.1, 0.38 * level)
    c.lineWidth = 0.9
    c.beginPath()
    for (const d of this.drops) {
      if (!st.rm) {
        d.y += d.v * dt
        d.x -= d.v * 0.25 * dt
      }
      if (d.y > h + 10) {
        d.y = -10
        d.x = Math.random() * (w + 40)
      }
      c.moveTo(d.x, d.y)
      c.lineTo(d.x - d.len * 0.25, d.y + d.len)
    }
    c.stroke()
  }

  /* ── V · mist bands ── */
  private drawMist(now: number, level: number) {
    if (level <= 0.001) return
    const c = this.ctx
    const { w, h } = this
    for (let i = 0; i < 3; i++) {
      const y = h * (0.25 + i * 0.25) + Math.sin(now * 0.00021 + i * 2) * h * 0.06
      const bh = h * 0.16
      const g = c.createLinearGradient(0, y - bh, 0, y + bh)
      g.addColorStop(0, mixColor(MIST, MIST, 0, 0))
      g.addColorStop(0.5, mixColor(MIST, MIST, 0, 0.45 * level))
      g.addColorStop(1, mixColor(MIST, MIST, 0, 0))
      c.fillStyle = g
      c.fillRect(0, y - bh, w, bh * 2)
    }
  }

  /* ── VI · the sun ── */
}
