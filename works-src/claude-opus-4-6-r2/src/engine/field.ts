import { SimplexNoise } from './noise.ts'

export interface Look {
  noiseScale: number
  noiseSpeed: number
  flowSpeed: number
  turbulence: number
  convergence: number
  fadeAlpha: number
  particleAlpha: number
  accentRatio: number
  angleOffset: number
  strokeWidth: number
  hueBase: number
  hueRange: number
  saturation: number
  lightness: number
  accentHue: number
  accentSat: number
  accentLight: number
}

export const BASE_LOOK: Look = {
  noiseScale: 0.003, noiseSpeed: 0.12, flowSpeed: 1, turbulence: 0.15,
  convergence: 0.2, fadeAlpha: 0.025, particleAlpha: 0.38, accentRatio: 0.08,
  angleOffset: 0, strokeWidth: 1.1, hueBase: 30, hueRange: 20,
  saturation: 55, lightness: 38, accentHue: 38, accentSat: 88, accentLight: 58,
}

export const LOOKS: Record<string, Partial<Look>> = {
  hero: {
    noiseScale: 0.0022, noiseSpeed: 0.1, flowSpeed: 0.7, turbulence: 0.06,
    convergence: 0.28, fadeAlpha: 0.016, particleAlpha: 0.32, accentRatio: 0.12,
    strokeWidth: 1.3,
  },
  identity: {
    noiseScale: 0.0035, flowSpeed: 1.1, turbulence: 0.04, convergence: 0.08,
    fadeAlpha: 0.028, angleOffset: Math.PI * 0.12, accentRatio: 0.06, strokeWidth: 1.0,
  },
  thinking: {
    noiseScale: 0.005, noiseSpeed: 0.28, flowSpeed: 2.2, turbulence: 0.5,
    convergence: 0, fadeAlpha: 0.04, particleAlpha: 0.42, accentRatio: 0.18,
    strokeWidth: 1.1,
  },
  strengths: {
    noiseScale: 0.0028, noiseSpeed: 0.08, flowSpeed: 1.5, turbulence: 0.08,
    convergence: 0.55, fadeAlpha: 0.013, particleAlpha: 0.48, accentRatio: 0.28,
    strokeWidth: 1.4,
  },
  limits: {
    noiseScale: 0.007, noiseSpeed: 0.3, flowSpeed: 0.45, turbulence: 0.65,
    convergence: 0, fadeAlpha: 0.065, particleAlpha: 0.18, accentRatio: 0.03,
    strokeWidth: 0.7, hueBase: 14, saturation: 35, lightness: 28,
  },
  benchmarks: {
    noiseScale: 0.0038, noiseSpeed: 0.1, flowSpeed: 1.3, turbulence: 0.12,
    convergence: 0.4, fadeAlpha: 0.02, particleAlpha: 0.4, accentRatio: 0.2,
    strokeWidth: 1.2,
  },
  data: {
    noiseScale: 0.0018, noiseSpeed: 0.05, flowSpeed: 0.25, turbulence: 0.02,
    convergence: 0.12, fadeAlpha: 0.08, particleAlpha: 0.12, accentRatio: 0.04,
    strokeWidth: 0.6,
  },
}

interface Mote {
  x: number; y: number; px: number; py: number
  vx: number; vy: number
  age: number; maxAge: number
  accent: boolean; hue: number
}

export class FlowField {
  private motes: Mote[] = []
  private n1: SimplexNoise
  private n2: SimplexNoise
  private cur: Look
  private tgt: Look
  private t = 0
  private w = 0
  private h = 0
  private ctx: CanvasRenderingContext2D
  private mx = -1; private my = -1; private mActive = false

  private cvs: HTMLCanvasElement
  private count: number
  private reduced: boolean

  constructor(cvs: HTMLCanvasElement, count: number, reduced: boolean) {
    this.cvs = cvs; this.count = count; this.reduced = reduced
    this.ctx = cvs.getContext('2d')!
    this.n1 = new SimplexNoise(42)
    this.n2 = new SimplexNoise(137)
    this.cur = { ...BASE_LOOK }
    this.tgt = { ...BASE_LOOK }
    this.resize()
    this.seed()
  }

  resize() {
    const dpr = Math.min(devicePixelRatio, 1.75)
    this.w = this.cvs.parentElement!.clientWidth
    this.h = this.cvs.parentElement!.clientHeight
    this.cvs.width = this.w * dpr; this.cvs.height = this.h * dpr
    this.cvs.style.width = `${this.w}px`; this.cvs.style.height = `${this.h}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.ctx.fillStyle = '#0d0906'; this.ctx.fillRect(0, 0, this.w, this.h)
  }

  private seed() {
    const n = this.reduced ? Math.floor(this.count * 0.25) : this.count
    this.motes = Array.from({ length: n }, () => this.spawn(true))
  }

  private spawn(init = false): Mote {
    const x = Math.random() * this.w, y = Math.random() * this.h
    return {
      x, y, px: x, py: y, vx: 0, vy: 0,
      age: init ? Math.random() * 200 : 0,
      maxAge: 120 + Math.random() * 180,
      accent: Math.random() < this.cur.accentRatio,
      hue: this.cur.hueBase + (Math.random() - 0.5) * this.cur.hueRange,
    }
  }

  setLook(name: string) {
    const partial = LOOKS[name]
    if (partial) this.tgt = { ...BASE_LOOK, ...partial }
  }

  setMouse(x: number, y: number, active: boolean) {
    this.mx = x; this.my = y; this.mActive = active
  }

  tick(dt: number) {
    const c = this.cur, g = this.tgt
    this.t += dt * c.noiseSpeed

    const lerpRate = 0.025
    for (const k of Object.keys(c) as (keyof Look)[]) {
      const cv = c[k] as number, gv = g[k] as number
      ;(c as unknown as Record<string, number>)[k] = cv + (gv - cv) * lerpRate
    }

    this.ctx.fillStyle = `rgba(13,9,6,${c.fadeAlpha})`
    this.ctx.fillRect(0, 0, this.w, this.h)

    const cx = this.w * 0.5, cy = this.h * 0.5

    this.ctx.lineCap = 'round'

    for (const m of this.motes) {
      m.px = m.x; m.py = m.y; m.age++

      if (m.age >= m.maxAge || m.x < -20 || m.x > this.w + 20 || m.y < -20 || m.y > this.h + 20) {
        Object.assign(m, this.spawn())
        continue
      }

      const nx = m.x * c.noiseScale, ny = m.y * c.noiseScale
      let angle = this.n1.fbm(nx, ny + this.t, 3) * Math.PI * 2

      if (c.turbulence > 0.005) {
        const ta = this.n2.fbm(nx * 2.5, ny * 2.5 + this.t * 1.4, 4) * Math.PI * 2
        angle += (ta - angle) * c.turbulence
      }

      angle += c.angleOffset

      const spd = c.flowSpeed * (0.6 + this.n1.noise2d(nx * 0.4, ny * 0.4 + this.t * 0.2) * 0.4)
      m.vx += Math.cos(angle) * spd * 0.25
      m.vy += Math.sin(angle) * spd * 0.25

      if (c.convergence > 0.005) {
        const dx = cx - m.x, dy = cy - m.y
        const d = Math.sqrt(dx * dx + dy * dy) + 1
        m.vx += (dx / d) * c.convergence * 0.4
        m.vy += (dy / d) * c.convergence * 0.4
      }

      if (this.mActive) {
        const dx = this.mx - m.x, dy = this.my - m.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 180) {
          const f = (1 - d / 180) * 0.6
          m.vx += (-dy / (d + 1) * f + dx / (d + 1) * f * 0.25)
          m.vy += (dx / (d + 1) * f + dy / (d + 1) * f * 0.25)
        }
      }

      m.vx *= 0.93; m.vy *= 0.93
      m.x += m.vx; m.y += m.vy

      const ratio = m.age / m.maxAge
      const alpha = Math.min(1, ratio * 8) * Math.min(1, (1 - ratio) * 4) * c.particleAlpha
      if (alpha < 0.003) continue

      const h = m.accent ? c.accentHue : m.hue
      const s = m.accent ? c.accentSat : c.saturation
      const l = m.accent ? c.accentLight : c.lightness

      this.ctx.beginPath()
      this.ctx.moveTo(m.px, m.py)
      this.ctx.lineTo(m.x, m.y)
      this.ctx.strokeStyle = `hsla(${h},${s}%,${l}%,${alpha})`
      this.ctx.lineWidth = c.strokeWidth * (m.accent ? 1.6 : 1)
      this.ctx.stroke()
    }
  }
}
