import { clamp, lerp, rng, smoothstep } from './math'

/** 首屏花瓣：每一片都取自 logo.png 的真实像素颜色 */
interface Hero {
  hx: number // 在 logo 方框里的归一化位置 0..1
  hy: number
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  bucket: number
  delay: number
  phase: number
  scale: number
}

interface Ambient {
  x: number
  y: number
  size: number
  rot: number
  spin: number
  flip: number
  vx: number
  vy: number
  depth: number
  phase: number
}

interface Bit {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  size: number
  life: number
  max: number
  color: string
}

const BIT_COLORS = ['#F0A8C0', '#F090A8', '#F0C0C0', '#9090C0', '#7890C0']
const GLYPHS = ['</>', '{ }', '( )', '[ ]', '=>', '//']

export class PetalField {
  private ctx: CanvasRenderingContext2D
  private W = 0
  private H = 0
  private dpr = 1
  private hero: Hero[] = []
  private buckets: string[] = []
  private amb: Ambient[] = []
  private bits: Bit[] = []
  private stars: { x: number; y: number; r: number; p: number; big: boolean }[] = []
  private glyphs: { x: number; y: number; t: string; v: number; p: number; s: number }[] = []
  private raf = 0
  private last = 0
  private time = 0
  private night = 0
  private px = -9999
  private py = -9999
  private scrollVel = 0
  private lastScrollY = 0
  private gustAt = 4.5
  private gustT = -1
  private imgAlpha = 0
  private ready = false
  private t0 = 0

  constructor(
    private canvas: HTMLCanvasElement,
    private box: HTMLElement,
    private img: HTMLImageElement,
    private reduced: boolean,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.lastScrollY = window.scrollY
    this.resize()
    this.sample()
  }

  /** 把 logo.png 缩到小画布，逐像素取色，每个有颜色的像素变成一片花瓣 */
  private sample() {
    const load = () => {
      const N = 112
      const c = document.createElement('canvas')
      c.width = c.height = N
      const g = c.getContext('2d', { willReadFrequently: true })!
      g.drawImage(this.img, 0, 0, N, N)
      const d = g.getImageData(0, 0, N, N).data
      const R = rng(7)
      const map = new Map<string, number>()
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = (y * N + x) * 4
          const a = d[i + 3]
          if (a < 120) continue
          const r = d[i], gg = d[i + 1], b = d[i + 2]
          if (r + gg + b > 735) continue
          const q = (v: number) => Math.min(255, Math.round(v / 20) * 20)
          const key = `rgb(${q(r)},${q(gg)},${q(b)})`
          let bi = map.get(key)
          if (bi === undefined) {
            bi = this.buckets.length
            this.buckets.push(key)
            map.set(key, bi)
          }
          this.hero.push({
            hx: (x + 0.5) / N,
            hy: (y + 0.5) / N,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            rot: R() * Math.PI * 2,
            spin: (R() - 0.5) * 6,
            bucket: bi,
            delay: ((y / N) * 1.6 + R() * 1.2) * (this.reduced ? 0 : 1),
            phase: R() * Math.PI * 2,
            scale: 0.85 + R() * 0.5,
          })
        }
      }
      for (const p of this.hero) {
        p.x = R() * this.W
        p.y = -R() * this.H * 0.7 - 30
        p.vx = (R() - 0.5) * 40
        p.vy = 60 + R() * 90
      }
      this.ready = true
      this.t0 = this.time
    }
    if (this.img.complete && this.img.naturalWidth) load()
    else this.img.addEventListener('load', load, { once: true })
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.W = window.innerWidth
    this.H = window.innerHeight
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    const R = rng(21)
    const n = this.W < 700 ? 16 : 32
    this.amb = Array.from({ length: n }, () => ({
      x: R() * this.W,
      y: R() * this.H,
      size: 5 + R() * 8,
      rot: R() * 6.28,
      spin: (R() - 0.5) * 1.6,
      flip: R() * 6.28,
      vx: (R() - 0.3) * 14,
      vy: 16 + R() * 26,
      depth: 0.08 + R() * 0.3,
      phase: R() * 6.28,
    }))
    const S = rng(33)
    this.stars = Array.from({ length: this.W < 700 ? 44 : 84 }, () => ({
      x: S() * this.W,
      y: S() * this.H,
      r: 0.5 + S() * 1.3,
      p: S() * 6.28,
      big: S() > 0.93,
    }))
    this.glyphs = Array.from({ length: this.W < 700 ? 5 : 9 }, (_, i) => ({
      x: S() * this.W,
      y: S() * this.H,
      t: GLYPHS[i % GLYPHS.length],
      v: 6 + S() * 10,
      p: S() * 6.28,
      s: 13 + S() * 10,
    }))
  }

  /** (透明度, 浮动偏移px)：真正的 PNG 随花瓣聚齐而浮现 */
  onImg: (alpha: number, fy: number) => void = () => {}
  private groups: number[][] = []

  setNight(n: number) {
    this.night = n
  }

  setPointer(x: number, y: number) {
    this.px = x
    this.py = y
  }

  /** 一阵风：把附近的花瓣吹散，并撒出几片新的 */
  gust(x: number, y: number) {
    if (this.reduced) return
    for (const p of this.hero) {
      const dx = p.x - x
      const dy = p.y - y
      const d = Math.hypot(dx, dy) + 1
      if (d < 320) {
        const f = (1 - d / 320) * 520
        p.vx += (dx / d) * f + (Math.random() - 0.5) * 80
        p.vy += (dy / d) * f - 90
      }
    }
    this.shed(x, y, 14)
  }

  /** 从某一点落下几片花瓣 */
  shed(x: number, y: number, n: number) {
    if (this.reduced) return
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 60 + Math.random() * 180
      this.bits.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 80,
        rot: Math.random() * 6.28,
        spin: (Math.random() - 0.5) * 8,
        size: 4 + Math.random() * 5,
        life: 0,
        max: 1.6 + Math.random() * 1.4,
        color: BIT_COLORS[(Math.random() * BIT_COLORS.length) | 0],
      })
    }
    if (this.bits.length > 160) this.bits.splice(0, this.bits.length - 160)
  }

  start() {
    if (this.reduced) {
      this.onImg(1, 0)
      return
    }
    this.last = performance.now()
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop)
      const dt = Math.min(0.033, (now - this.last) / 1000)
      this.last = now
      if (!document.hidden) this.frame(dt)
    }
    this.raf = requestAnimationFrame(loop)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }

  private frame(dt: number) {
    const { ctx, W, H } = this
    this.time += dt
    const time = this.time
    const sy = window.scrollY
    const dScroll = sy - this.lastScrollY
    this.lastScrollY = sy
    this.scrollVel += (dScroll / Math.max(dt, 0.001) - this.scrollVel) * Math.min(1, dt * 6)
    const release = smoothstep(0.06 * H, 0.62 * H, sy)

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    this.drawNight(time)
    this.drawAmbient(dt, dScroll)

    if (this.ready) this.updateHero(dt, release)
    this.drawBits(dt)
  }

  private updateHero(dt: number, release: number) {
    const { W, H, hero, px, py } = this
    const time = this.time
    const r = this.box.getBoundingClientRect()
    const size = r.width
    const left = r.left
    const top = r.top
    const fy = Math.sin(time * 0.9) * 5 * (1 - release)

    if (this.gustT < 0 && time > this.gustAt) this.gustT = 0
    let dip = 0
    let gx = -9999
    if (this.gustT >= 0) {
      this.gustT += dt
      const u = this.gustT / 2.4
      gx = lerp(-200, W + 200, u)
      dip = Math.sin(Math.PI * clamp(u))
      if (u >= 1) {
        this.gustT = -1
        this.gustAt = time + 7 + Math.random() * 4
      }
    }

    if (this.groups.length === 0) {
      this.groups = this.buckets.map(() => [])
      hero.forEach((p, i) => this.groups[p.bucket].push(i))
    }

    const cell = size / 112
    const t = time - this.t0
    let settled = 0
    const cull = release > 0.98
    for (let i = 0; i < hero.length; i++) {
      const p = hero[i]
      if (cull && p.y > H + 120) continue
      const lt = t - p.delay
      p.rot += p.spin * dt
      if (lt < 0) {
        p.x += (p.vx + Math.sin(time * 1.6 + p.phase) * 34) * dt
        p.y += p.vy * dt
        continue
      }
      const wave = Math.sin(time * 1.1 + p.hx * 5 + p.hy * 3) * 1.6 * (1 - release)
      const tx = left + p.hx * size + wave
      const ty = top + p.hy * size + fy + wave * 0.6
      const k = 56 * smoothstep(0, 1.1, lt) * (1 - release)
      const c = 2 * Math.sqrt(Math.max(k, 0.01)) * 0.85 + 1.2
      let ax = (tx - p.x) * k - p.vx * c
      let ay = (ty - p.y) * k - p.vy * c
      if (release > 0) {
        ay += 180 * release
        ax += (60 + Math.sin(p.phase + time) * 40) * release
        ax -= p.vx * 0.5 * release
        ay -= p.vy * 0.5 * release
      }
      const dx = p.x - px
      const dy = p.y - py
      const d2 = dx * dx + dy * dy
      if (d2 < 150 * 150) {
        const d = Math.sqrt(d2) + 0.01
        const f = (1 - d / 150) ** 2 * 5200
        ax += (dx / d) * f + (-dy / d) * f * 0.35
        ay += (dy / d) * f + (dx / d) * f * 0.35
      }
      if (gx > -9000) {
        const w = 1 - Math.abs(p.x - gx) / 150
        if (w > 0) {
          ax += 1500 * w
          ay += Math.sin(p.phase * 3 + time * 9) * 1600 * w
        }
      }
      p.vx += ax * dt
      p.vy += ay * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (Math.abs(tx - p.x) < 5 && Math.abs(ty - p.y) < 5 && lt > 0.3) settled++
    }

    const ratio = settled / hero.length
    const target = smoothstep(0.62, 0.97, ratio) * (1 - release) * (1 - dip * 0.96)
    this.imgAlpha += (target - this.imgAlpha) * Math.min(1, dt * (target > this.imgAlpha ? 3.2 : 9))
    this.onImg(this.imgAlpha, fy)

    if (this.imgAlpha > 0.985 && release < 0.01) return
    const pa = (1 - smoothstep(0.35, 0.95, release)) * (1 - this.imgAlpha * 0.92)
    if (pa <= 0.01) return
    const ctx = this.ctx
    ctx.globalAlpha = pa
    const rx = cell * 1.05
    const ry = cell * 0.62
    for (let b = 0; b < this.groups.length; b++) {
      const g = this.groups[b]
      ctx.fillStyle = this.buckets[b]
      ctx.beginPath()
      for (let j = 0; j < g.length; j++) {
        const p = hero[g[j]]
        if (p.y > H + 20 || p.y < -40 || p.x < -40 || p.x > W + 40) continue
        ctx.moveTo(p.x + rx * p.scale, p.y)
        ctx.ellipse(p.x, p.y, rx * p.scale, ry * p.scale, p.rot, 0, Math.PI * 2)
      }
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawAmbient(dt: number, dScroll: number) {
    const { ctx, W, H, px, py, night } = this
    const time = this.time
    const r = Math.round(lerp(240, 205, night))
    const g = Math.round(lerp(168, 214, night))
    const b = Math.round(lerp(192, 255, night))
    for (const a of this.amb) {
      a.x += (a.vx + Math.sin(time * 0.7 + a.phase) * 18) * dt
      a.y += a.vy * dt - dScroll * a.depth
      a.rot += a.spin * dt
      a.flip += dt * 2.2
      const dx = a.x - px
      const dy = a.y - py
      const d2 = dx * dx + dy * dy
      if (d2 < 120 * 120) {
        const d = Math.sqrt(d2) + 0.01
        a.x += (dx / d) * (1 - d / 120) * 220 * dt
        a.y += (dy / d) * (1 - d / 120) * 220 * dt
      }
      if (a.y > H + 20) {
        a.y = -20
        a.x = Math.random() * W
      } else if (a.y < -30) a.y = H + 20
      if (a.x > W + 30) a.x = -20
      else if (a.x < -30) a.x = W + 20
      const flip = 0.25 + 0.75 * Math.abs(Math.cos(a.flip))
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.62 - night * 0.2).toFixed(2)})`
      ctx.beginPath()
      ctx.ellipse(a.x, a.y, a.size, a.size * 0.55 * flip, a.rot, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawNight(time: number) {
    const n = this.night
    if (n < 0.02) return
    const { ctx, W, H } = this
    ctx.fillStyle = '#f4e8f2'
    for (const s of this.stars) {
      const tw = 0.45 + 0.55 * Math.sin(time * 1.4 + s.p)
      ctx.globalAlpha = n * tw
      if (s.big) {
        const L = 6 + tw * 3
        ctx.fillRect(s.x - L, s.y - 0.5, L * 2, 1)
        ctx.fillRect(s.x - 0.5, s.y - L, 1, L * 2)
      } else {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.fillStyle = '#9fb0e8'
    for (const g of this.glyphs) {
      g.y -= g.v * 0.016
      if (g.y < -30) {
        g.y = H + 30
        g.x = Math.random() * W
      }
      ctx.globalAlpha = n * (0.16 + 0.1 * Math.sin(time * 0.8 + g.p))
      ctx.font = `${g.s}px "DM Mono", ui-monospace, Consolas, monospace`
      ctx.fillText(g.t, g.x, g.y)
    }
    ctx.globalAlpha = 1
  }

  private drawBits(dt: number) {
    const { ctx, H } = this
    for (let i = this.bits.length - 1; i >= 0; i--) {
      const b = this.bits[i]
      b.life += dt
      if (b.life > b.max || b.y > H + 30) {
        this.bits.splice(i, 1)
        continue
      }
      b.vy += 160 * dt
      b.vx *= 1 - dt * 1.4
      b.vy *= 1 - dt * 0.6
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.rot += b.spin * dt
      ctx.globalAlpha = 1 - smoothstep(0.6, 1, b.life / b.max)
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.ellipse(b.x, b.y, b.size, b.size * 0.55, b.rot, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}
