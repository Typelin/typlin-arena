/**
 * Falling-petal field drawn on one fixed canvas behind the content.
 *
 * Petals are pre-rasterised into a handful of sprites; each frame only blits them with a
 * rotation and a horizontal squash (the "flip" of a petal turning in the air). Pointer motion
 * pushes nearby petals, scroll velocity lifts the whole field, and `burst()` releases a cluster
 * from a point (used by the logo flower and the 咲 / 夢 characters).
 */

interface Petal {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  flip: number
  vf: number
  size: number
  sprite: number
  /** Burst petals fade out instead of recycling. */
  life: number
  ttl: number
}

const PALETTE = [
  ['#fbd3df', '#f19ab4'],
  ['#fde4ec', '#f4a9bf'],
  ['#f8c4d4', '#e98aa8'],
  ['#fff1f5', '#f7b9cb'],
  ['#e9e3f6', '#b8b0e2'],
]

function makeSprite(a: string, b: string, px: number) {
  const c = document.createElement('canvas')
  c.width = px
  c.height = px
  const g = c.getContext('2d')!
  const s = px / 2
  g.translate(s, s)
  const grad = g.createLinearGradient(0, -s, 0, s)
  grad.addColorStop(0, a)
  grad.addColorStop(1, b)
  g.fillStyle = grad
  // a sakura petal: rounded body with a notch at the tip
  g.beginPath()
  g.moveTo(0, s * 0.92)
  g.bezierCurveTo(-s * 0.95, s * 0.35, -s * 0.72, -s * 0.78, -s * 0.16, -s * 0.9)
  g.lineTo(0, -s * 0.66)
  g.lineTo(s * 0.16, -s * 0.9)
  g.bezierCurveTo(s * 0.72, -s * 0.78, s * 0.95, s * 0.35, 0, s * 0.92)
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.55)'
  g.lineWidth = px * 0.025
  g.beginPath()
  g.moveTo(0, s * 0.75)
  g.lineTo(0, -s * 0.4)
  g.stroke()
  return c
}

export class PetalField {
  private ctx: CanvasRenderingContext2D
  private petals: Petal[] = []
  private sprites: HTMLCanvasElement[] = []
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private last = 0
  private pointer = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0 }
  private lift = 0
  private lastScroll = 0
  private ambient: number
  private night = false
  private still: boolean

  constructor(private canvas: HTMLCanvasElement, still: boolean) {
    this.ctx = canvas.getContext('2d')!
    this.still = still
    this.sprites = PALETTE.map(([a, b]) => makeSprite(a, b, 64))
    this.resize()
    this.ambient = this.w < 720 ? 18 : 34
    for (let i = 0; i < this.ambient; i++) this.petals.push(this.spawn(true))
    this.lastScroll = window.scrollY
    addEventListener('resize', this.resize)
    addEventListener('pointermove', this.onPointer, { passive: true })
    addEventListener('scroll', this.onScroll, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
    if (still) this.draw()
    else this.start()
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    removeEventListener('resize', this.resize)
    removeEventListener('pointermove', this.onPointer)
    removeEventListener('scroll', this.onScroll)
    document.removeEventListener('visibilitychange', this.onVisibility)
  }

  setNight(on: boolean) {
    this.night = on
    if (this.still) this.draw()
  }

  /** Release `n` petals from a viewport point. */
  burst(x: number, y: number, n = 18, spread = 1) {
    if (this.still) return
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = (60 + Math.random() * 220) * spread
      const p = this.spawn(false)
      p.x = x
      p.y = y
      p.vx = Math.cos(a) * v
      p.vy = Math.sin(a) * v - 80
      p.size *= 0.8 + Math.random() * 0.5
      p.life = 0
      p.ttl = 2.6 + Math.random() * 2.2
      this.petals.push(p)
    }
  }

  private spawn(scatter: boolean): Petal {
    const size = (this.w < 720 ? 9 : 11) + Math.random() * 12
    return {
      x: Math.random() * this.w,
      y: scatter ? Math.random() * this.h : -30 - Math.random() * 80,
      vx: 10 + Math.random() * 25,
      vy: 22 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.6,
      flip: Math.random() * Math.PI * 2,
      vf: 1.2 + Math.random() * 2.4,
      size,
      sprite: Math.random() < 0.12 ? 4 : Math.floor(Math.random() * 4),
      life: 0,
      ttl: 0,
    }
  }

  private resize = () => {
    this.dpr = Math.min(devicePixelRatio || 1, 2)
    this.w = innerWidth
    this.h = innerHeight
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
    if (this.still) this.draw()
  }

  private onPointer = (e: PointerEvent) => {
    const now = performance.now()
    const dt = Math.max(8, now - this.pointer.t) / 1000
    if (this.pointer.t) {
      this.pointer.vx = (e.clientX - this.pointer.x) / dt
      this.pointer.vy = (e.clientY - this.pointer.y) / dt
    }
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    this.pointer.t = now
  }

  private onScroll = () => {
    const y = window.scrollY
    this.lift += (y - this.lastScroll) * 0.9
    this.lastScroll = y
  }

  private onVisibility = () => {
    if (this.still) return
    if (document.hidden) cancelAnimationFrame(this.raf)
    else this.start()
  }

  private start() {
    cancelAnimationFrame(this.raf)
    this.last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.step(dt, now / 1000)
      this.draw()
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  private step(dt: number, t: number) {
    const { pointer } = this
    // pointer velocity decays so a still cursor stops pushing
    pointer.vx *= Math.pow(0.02, dt)
    pointer.vy *= Math.pow(0.02, dt)
    // scrolling down drags petals up the screen with the page, then lets go
    const lift = this.lift
    this.lift *= Math.pow(0.004, dt)
    const gust = Math.sin(t * 0.37) * 14 + Math.sin(t * 0.13) * 10
    const R = 140
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i]
      const dx = p.x - pointer.x
      const dy = p.y - pointer.y
      const d2 = dx * dx + dy * dy
      if (d2 < R * R) {
        const f = 1 - Math.sqrt(d2) / R
        p.vx += pointer.vx * f * 2.2 * dt
        p.vy += pointer.vy * f * 2.2 * dt
        p.vr += (pointer.vx > 0 ? 1 : -1) * f * 4 * dt
      }
      // drift toward the ambient fall speed
      const tvx = 16 + gust
      const tvy = p.ttl ? 50 : 34
      p.vx += (tvx - p.vx) * Math.min(1, dt * 0.9)
      p.vy += (tvy - p.vy) * Math.min(1, dt * 0.9)
      p.x += p.vx * dt + Math.sin(p.flip) * 0.4
      p.y += p.vy * dt - lift * dt * 0.6
      p.rot += p.vr * dt
      p.vr *= Math.pow(0.6, dt)
      p.flip += p.vf * dt
      if (p.ttl) {
        p.life += dt
        if (p.life > p.ttl) {
          this.petals.splice(i, 1)
          continue
        }
      } else if (p.y > this.h + 40 || p.x > this.w + 60 || p.x < -60 || p.y < -160) {
        const n = this.spawn(false)
        if (p.y < -160) n.y = this.h + 30
        else if (p.x > this.w + 60) {
          n.x = -30
          n.y = Math.random() * this.h
        }
        this.petals[i] = n
      }
    }
  }

  private draw() {
    const { ctx, dpr } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const base = this.night ? 0.7 : 0.85
    // at night the petals catch the moonlight instead of darkening the sky
    ctx.globalCompositeOperation = this.night ? 'screen' : 'source-over'
    for (const p of this.petals) {
      let a = base
      if (p.ttl) a *= Math.min(1, (p.ttl - p.life) / 0.8)
      if (a <= 0.01) continue
      const sx = Math.cos(p.flip)
      const c = Math.cos(p.rot)
      const s = Math.sin(p.rot)
      ctx.globalAlpha = a * (0.65 + 0.35 * Math.abs(sx))
      ctx.setTransform(c * sx * dpr, s * sx * dpr, -s * dpr, c * dpr, p.x * dpr, p.y * dpr)
      ctx.drawImage(this.sprites[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}

let field: PetalField | null = null

export function mountPetals(canvas: HTMLCanvasElement, still: boolean) {
  field = new PetalField(canvas, still)
  return () => {
    field?.destroy()
    field = null
  }
}

/** Release petals from the centre of an element (or a viewport point). */
export function burstAt(x: number, y: number, n?: number, spread?: number) {
  field?.burst(x, y, n, spread)
}

export function burstFrom(el: Element, n?: number) {
  const r = el.getBoundingClientRect()
  field?.burst(r.left + r.width / 2, r.top + r.height / 2, n)
}

export function setPetalNight(on: boolean) {
  field?.setNight(on)
}
