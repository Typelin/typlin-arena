import { Renderer, type Frame } from './gl/renderer'
import { bbChroma, bbCss } from './color'
import { effortStore } from './effort'

type V3 = [number, number, number]
type Sp = { x: number; v: number }
type Orb = { x: number; y: number; r: number }

type Look = {
  temp: number
  crust: number
  glow: number
  bg: V3
  sparks: number
  exposure: number
  vis: number
  pour: number
  orb2: number
  attract: number
  light: number
  grid: number
  tgt: number
  glyph: number
  ring: number
}

const look = (o: Partial<Look>): Look => ({
  glyph: 0,
  ring: 0,
  temp: 2600,
  crust: 0,
  glow: 1,
  bg: [0.02, 0.012, 0.008],
  sparks: 400,
  exposure: 1,
  vis: 1,
  pour: 0,
  orb2: 0,
  attract: 0,
  light: 0,
  grid: 0,
  tgt: 0,
  ...o,
})

const LOOKS: Record<string, Look> = {
  hero: look({ temp: 2650, crust: 0.2, glow: 1.0, bg: [0.016, 0.008, 0.005], sparks: 560 }),
  work: look({ temp: 3100, crust: 0, glow: 1.15, bg: [0.011, 0.006, 0.004], sparks: 650, pour: 1 }),
  point: look({ temp: 1250, crust: 1, glow: 0, bg: [0.95, 0.27, 0.05], sparks: 0, light: 1 }),
  text: look({ temp: 2900, vis: 0, glow: 0, bg: [0.006, 0.005, 0.008], sparks: 0, glyph: 1 }),
  cutoff: look({ temp: 1500, crust: 0.8, glow: 0.42, bg: [0.007, 0.01, 0.017], sparks: 24 }),
  paste: look({ temp: 2500, crust: 0.04, glow: 0.95, bg: [0.013, 0.008, 0.01], sparks: 760, orb2: 1, attract: 1 }),
  together: look({ temp: 2350, crust: 0.08, glow: 1.0, bg: [0.022, 0.01, 0.006], sparks: 900, ring: 1 }),
  sources: look({ temp: 1700, crust: 0.55, glow: 0.5, bg: [0.008, 0.006, 0.005], sparks: 40 }),
  scores: look({ temp: 2400, vis: 0, glow: 0, bg: [0.013, 0.0105, 0.009], sparks: 0 }),
  aa: look({ temp: 2600, vis: 0, glow: 0, bg: [0.005, 0.007, 0.012], sparks: 0 }),
  domains: look({ temp: 3600, crust: 0, glow: 0.62, bg: [0.009, 0.006, 0.005], sparks: 0 }),
  versus: look({ temp: 3300, crust: 0, glow: 1.05, bg: [0.016, 0.008, 0.005], sparks: 620 }),
}

export const EFFORT_LOOK = [
  { temp: 1450, sparks: 60, glow: 0.72, crust: 0.42 },
  { temp: 2500, sparks: 280, glow: 1.0, crust: 0.05 },
  { temp: 3700, sparks: 560, glow: 1.22, crust: 0 },
  { temp: 5600, sparks: 950, glow: 1.45, crust: 0 },
  { temp: 9500, sparks: 1550, glow: 1.75, crust: 0 },
]

const GRID_TARGET: [number, number] = [499, 499]

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const mired = (a: number, b: number, t: number) => 1e6 / lerp(1e6 / a, 1e6 / b, t)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
// Overshoots slightly before settling, like a drop of metal landing.
const backOut = (t: number) => {
  const c = 1.9
  return t <= 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}
const nearView = (el: HTMLElement, vh: number) => {
  const b = el.getBoundingClientRect()
  return b.bottom > -vh * 0.25 && b.top < vh * 1.25
}

function step(s: Sp, target: number, omega: number, zeta: number, dt: number) {
  const n = Math.max(1, Math.ceil(dt / 0.008))
  const h = dt / n
  for (let i = 0; i < n; i++) {
    s.v += (omega * omega * (target - s.x) - 2 * zeta * omega * s.v) * h
    s.x += s.v * h
  }
}

function mixLook(a: Look, b: Look, t: number): Look {
  const m = (k: Exclude<keyof Look, 'bg' | 'temp'>) => lerp(a[k], b[k], t)
  return {
    temp: mired(a.temp, b.temp, t),
    crust: m('crust'),
    glow: m('glow'),
    bg: [lerp(a.bg[0], b.bg[0], t), lerp(a.bg[1], b.bg[1], t), lerp(a.bg[2], b.bg[2], t)],
    sparks: m('sparks'),
    exposure: m('exposure'),
    vis: m('vis'),
    pour: m('pour'),
    orb2: m('orb2'),
    attract: m('attract'),
    light: m('light'),
    grid: m('grid'),
    tgt: m('tgt'),
    glyph: m('glyph'),
    ring: m('ring'),
  }
}

function effortLook(e: number) {
  const L = EFFORT_LOOK
  if (e < 0) {
    const k = clamp(-e)
    return {
      temp: lerp(L[0].temp, 950, k),
      sparks: L[0].sparks * (1 - k),
      glow: lerp(L[0].glow, 0.22, k),
      crust: lerp(L[0].crust, 0.9, k),
    }
  }
  const i = Math.min(L.length - 2, Math.floor(e))
  const f = clamp(e - i, 0, 1.2)
  return {
    temp: mired(L[i].temp, L[i + 1].temp, f),
    sparks: Math.max(0, lerp(L[i].sparks, L[i + 1].sparks, f)),
    glow: lerp(L[i].glow, L[i + 1].glow, f),
    crust: clamp(lerp(L[i].crust, L[i + 1].crust, f)),
  }
}

function orbOf(el: HTMLElement | null): Orb {
  if (!el) return { x: 0, y: 0, r: 0 }
  const b = el.getBoundingClientRect()
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width / 2 }
}

type Sec = {
  el: HTMLElement
  key: string
  orb: HTMLElement | null
  orb2: HTMLElement | null
  grid: HTMLElement | null
  clear: HTMLElement | null
  glyph: HTMLElement | null
  ring: HTMLElement | null
  bars: HTMLElement[]
  beads: HTMLElement[]
  chart: HTMLElement | null
}

type Tokens = { cell: number; anchor: [number, number]; out: number; clear: DOMRect | null }

export class Engine {
  private canvas: HTMLCanvasElement
  private r: Renderer | null = null
  private secs: Sec[] = []
  private blends: Sp[] = []
  private raf = 0
  private t0 = 0
  private last = 0
  private reduced = false
  private mq: MediaQueryList
  private eff: Sp = { x: 1, v: 0 }
  private effTarget = 1
  private dragging = false
  private offUntil = 0
  private kick = 0
  private hover: Sp = { x: 0, v: 0 }
  private lookX: Sp = { x: 0, v: 0 }
  private lookY: Sp = { x: 0, v: 0 }
  private pointer = { x: -9999, y: -9999, at: -1e9 }
  private o2x: Sp = { x: -1, v: 0 }
  private o2y: Sp = { x: -1, v: 0 }
  private hooks: Record<string, HTMLElement | null> = {}
  private lastCount = ''
  private lost = false
  private rev: Record<string, Sp> = {}
  private trig: Record<string, number> = {}
  private vars = new Map<HTMLElement, Record<string, string>>()
  private byKey: Record<string, Sec> = {}
  private barBuf = new Float32Array(40)
  private barVBuf = new Float32Array(40)
  private beadBuf = new Float32Array(48)
  private beadVBuf = new Float32Array(48)
  private wide = window.matchMedia('(min-width: 761px)')

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reduced = this.mq.matches
    try {
      this.r = new Renderer(canvas)
    } catch {
      this.r = null
      document.documentElement.classList.add('no-gl')
    }
    canvas.addEventListener('webglcontextlost', this.onLost)
  }

  private onLost = (e: Event) => {
    e.preventDefault()
    this.lost = true
    document.documentElement.classList.add('no-gl')
  }

  private onMotion = () => {
    this.reduced = this.mq.matches
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    this.pointer.at = performance.now()
  }

  start() {
    this.secs = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map((el) => ({
      el,
      key: el.dataset.scene ?? '',
      orb: el.querySelector<HTMLElement>('[data-orb]'),
      orb2: el.querySelector<HTMLElement>('[data-orb2]'),
      grid: el.querySelector<HTMLElement>('[data-grid]'),
      clear: el.querySelector<HTMLElement>('[data-clear]'),
      glyph: el.querySelector<HTMLElement>('[data-glyph]'),
      ring: el.querySelector<HTMLElement>('[data-ring]'),
      bars: Array.from(el.querySelectorAll<HTMLElement>('[data-bar]')),
      beads: Array.from(el.querySelectorAll<HTMLElement>('[data-bead]')),
      chart: el.querySelector<HTMLElement>('[data-chart]'),
    }))
    this.byKey = Object.fromEntries(this.secs.map((s) => [s.key, s]))
    if (this.r) {
      document.documentElement.classList.add('gl')
      const fam = '"Opus Serif TC", "PingFang TC", "Microsoft JhengHei", serif'
      const r = this.r
      document.fonts
        .load(`900 100px ${fam}`, '字')
        .catch(() => undefined)
        .then(() => r.setGlyph('字', fam))
    }
    this.blends = this.secs.map(() => ({ x: 0, v: 0 }))
    for (const k of ['hero', 'point', 'tokens', 'dial', 'count']) {
      this.hooks[k] = document.querySelector<HTMLElement>(`[data-hook="${k}"]`)
    }
    this.mq.addEventListener('change', this.onMotion)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    window.addEventListener('pointerdown', this.onPointer, { passive: true })
    this.t0 = performance.now()
    this.last = this.t0
    this.raf = requestAnimationFrame(this.tick)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.mq.removeEventListener('change', this.onMotion)
    window.removeEventListener('pointermove', this.onPointer)
    window.removeEventListener('pointerdown', this.onPointer)
    this.canvas.removeEventListener('webglcontextlost', this.onLost)
  }

  setEffort(i: number) {
    if (this.dragging) return
    if (i !== this.effTarget) this.kick = 1
    this.effTarget = i
  }

  dragEffort(e: number | null) {
    this.dragging = e !== null
    if (e !== null) this.effTarget = clamp(e, -0.85, 4)
  }

  tryOff() {
    this.offUntil = performance.now() + 420
    this.kick = 1
  }

  private resize(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const W = Math.max(1, Math.round(w * dpr))
    const H = Math.max(1, Math.round(h * dpr))
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W
      this.canvas.height = H
    }
    return dpr
  }

  // Entry trigger with hysteresis: on once el's top rises past `line` of the
  // viewport, off again only after it drops clearly below.
  private entered(key: string, el: Element, vh: number, line: number) {
    const top = el.getBoundingClientRect().top
    let on = this.trig[key] ?? 0
    if (top < vh * line) on = 1
    else if (top > vh * Math.min(1.02, line + 0.14)) on = 0
    this.trig[key] = on
    return on
  }

  // Linear clock toward the trigger, for sequences that need even pacing.
  private ramp(key: string, el: Element | null, vh: number, dt: number, dur: number, line = 0.78) {
    if (!el) return 0
    const on = this.entered(key, el, vh, line)
    const sp = (this.rev[key] ??= { x: 0, v: 0 })
    sp.x = this.reduced ? on : clamp(sp.x + (on ? dt / dur : -dt / (dur * 0.4)))
    return sp.x
  }

  private setVar(el: HTMLElement, name: string, v: number) {
    const s = v.toFixed(3)
    let rec = this.vars.get(el)
    if (!rec) this.vars.set(el, (rec = {}))
    if (rec[name] === s) return
    rec[name] = s
    el.style.setProperty(name, s)
  }

  // Score channels: each bar pours after the one above it has started, so
  // a fast scroll still reads as a cascade instead of a batch.
  private scores(vh: number, dpr: number, dt: number) {
    const s = this.byKey.scores
    if (!s || !nearView(s.el, vh)) return 0
    let prev = 1
    const n = Math.min(10, s.bars.length)
    for (let i = 0; i < n; i++) {
      const tr = s.bars[i]
      const on = this.entered(`bar${i}`, tr, vh, 0.9)
      const sp = (this.rev[`bar${i}`] ??= { x: 0, v: 0 })
      if (this.reduced) sp.x = on
      else if (on && prev > 0.14) sp.x = clamp(sp.x + dt / 1.15)
      else if (!on) sp.x = clamp(sp.x - dt / 0.5)
      prev = sp.x
      const f = 1 - Math.pow(1 - sp.x, 3)
      if (tr.parentElement) this.setVar(tr.parentElement, '--f', f)
      const b = tr.getBoundingClientRect()
      this.barBuf.set([b.left * dpr, (vh - b.top - b.height / 2) * dpr, b.width * dpr, b.height * dpr], i * 4)
      this.barVBuf.set([(Number(tr.dataset.me) / 100) * f, Number(tr.dataset.rv) / 100, 1, smooth(0, 0.22, sp.x)], i * 4)
    }
    return n
  }

  // Chart beads. Set 0 (slots 0-4) is the AA cost/intelligence line, one bead
  // per effort level; set 1 (slots 5-10) is the domain radar.
  private beads(vh: number, dpr: number, dt: number) {
    const out = { n: 0, box: [1e9, 1e9, -1e9, -1e9] as [number, number, number, number], hub: [0, 0] as [number, number], setA: [0, 0] as [number, number] }
    const B = this.beadBuf
    const V = this.beadVBuf
    B.fill(0)
    V.fill(0)
    const grow = (x: number, y: number, r: number) => {
      out.box[0] = Math.min(out.box[0], x - r)
      out.box[1] = Math.min(out.box[1], y - r)
      out.box[2] = Math.max(out.box[2], x + r)
      out.box[3] = Math.max(out.box[3], y + r)
    }
    const small = this.wide.matches ? 1 : 0.85
    const aa = this.byKey.aa
    if (aa && nearView(aa.el, vh) && aa.chart) {
      out.setA[0] = 1
      // One wipe runs left to right along the cost axis. Rival lines are
      // unmasked by it (CSS --p) and each bead lands as the wipe reaches it,
      // so the molten thread grows at the same pace as the reveal.
      const P = this.ramp('aa', aa.chart, vh, dt, 2.4, 0.7)
      this.setVar(aa.chart, '--p', P)
      const W = P * 1.12
      const cr = aa.chart.getBoundingClientRect()
      const sel = effortStore.get()
      let fxPrev = 0
      aa.beads.slice(0, 5).forEach((el, i) => {
        const b = el.getBoundingClientRect()
        const cx = b.left + b.width / 2
        const x = cx * dpr
        const y = (vh - b.top - b.height / 2) * dpr
        const fx = (cx - cr.left) / Math.max(1, cr.width)
        const sp = (this.rev[`sel${i}`] ??= { x: i === sel ? 1 : 0, v: 0 })
        if (this.reduced) sp.x = i === sel ? 1 : 0
        else step(sp, i === sel ? 1 : 0, 9, 0.6, dt)
        const R = 6.5 * small * (1 + 0.8 * sp.x) * dpr
        B.set([x, y, R, EFFORT_LOOK[i].temp], i * 4)
        V.set([backOut(clamp((W - fx) / 0.1)), 0, 0, i ? clamp((W - fxPrev) / Math.max(0.01, fx - fxPrev)) : 0], i * 4)
        fxPrev = fx
        grow(x, y, R * 14)
      })
    }
    const dm = this.byKey.domains
    if (dm && nearView(dm.el, vh) && dm.chart) {
      out.setA[1] = 1
      const P = this.ramp('dm', dm.chart, vh, dt, 2.6, 0.72)
      this.setVar(dm.chart, '--p', P)
      const p = P * 2.6
      const hub = orbOf(dm.orb)
      out.hub = [hub.x * dpr, (vh - hub.y) * dpr]
      const k6 = dm.beads.slice(0, 6)
      k6.forEach((el, k) => {
        const b = el.getBoundingClientRect()
        const x = (b.left + b.width / 2) * dpr
        const y = (vh - b.top - b.height / 2) * dpr
        const v = Number(el.dataset.v)
        const R = 5.5 * small * dpr
        const j = 5 + k
        B.set([x, y, R, mired(2300, 7200, clamp((v - 57) / 8))], j * 4)
        const close = clamp((p - 1.45 - (k6.length - 1) * 0.13) / 0.22)
        V.set([backOut(clamp((p - 0.45 - k * 0.16) / 0.4)), 1, ease(clamp((p - k * 0.16) / 0.55)), k ? clamp((p - 1.45 - (k - 1) * 0.13) / 0.22) : close], j * 4)
        grow(x, y, R * 14)
      })
      grow(out.hub[0], out.hub[1], 4)
    }
    out.n = out.setA[0] || out.setA[1] ? 11 : 0
    return out
  }

  private sectionLook(s: Sec, vh: number, effL: ReturnType<typeof effortLook>, tokens: { v: Tokens | null }): { L: Look; orb: Orb | null } {
    const orb = orbOf(s.orb)
    if (s.key === 'think') {
      const c = bbChroma(effL.temp)
      return {
        L: look({
          temp: effL.temp,
          crust: effL.crust,
          glow: effL.glow,
          sparks: effL.sparks,
          bg: [0.004 + c[0] * 0.02, 0.003 + c[1] * 0.014, 0.003 + c[2] * 0.02],
        }),
        orb,
      }
    }
    if (s.key === 'tokens' && s.grid) {
      const rect = s.el.getBoundingClientRect()
      const p = clamp(-rect.top / Math.max(1, rect.height - vh))
      const gs = s.grid.getBoundingClientRect()
      const cs = (orb.r * 2) / 0.42
      const ce = gs.width / 1000
      const z = this.reduced ? 1 : ease(clamp(p / 0.62))
      const cell = Math.exp(lerp(Math.log(Math.max(cs, ce)), Math.log(ce), z))
      const r = cell * 0.21
      const vis = smooth(8, 22, r)
      tokens.v = {
        cell,
        anchor: [orb.x, orb.y],
        out: smooth(0.72, 0.86, p),
        clear: s.clear ? s.clear.getBoundingClientRect() : null,
      }
      const pa = 1 - smooth(0.6, 0.68, p)
      const pb = smooth(0.7, 0.78, p)
      const hook = this.hooks.tokens
      if (hook) {
        hook.style.setProperty('--pa', pa.toFixed(3))
        hook.style.setProperty('--pb', pb.toFixed(3))
      }
      return {
        L: look({
          temp: 2700,
          crust: 0,
          glow: 0.95 * vis,
          bg: [0.004, 0.004, 0.006],
          sparks: 320 * vis,
          vis,
          grid: 1 - smooth(110, 300, cell),
          tgt: 1 - vis,
        }),
        orb: { x: orb.x, y: orb.y, r },
      }
    }
    const base = LOOKS[s.key] ?? LOOKS.hero
    // Chapters without an orb keep it where it was and only fade it.
    return { L: { ...base, bg: [...base.bg] as V3 }, orb: s.orb ? orb : null }
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const dt = Math.min(0.05, Math.max(0.0005, (now - this.last) / 1000))
    this.last = now
    const time = (now - this.t0) / 1000
    const cw = this.canvas.clientWidth || window.innerWidth
    const ch = this.canvas.clientHeight || window.innerHeight
    const dpr = this.resize(cw, ch)
    const reduced = this.reduced

    // Effort: an underdamped spring, so a change lands with a little overshoot.
    const effGoal = now < this.offUntil ? -0.8 : this.effTarget
    if (reduced) {
      this.eff.x = effGoal
      this.eff.v = 0
    } else {
      step(this.eff, effGoal, this.dragging ? 16 : 8.5, this.dragging ? 1 : 0.52, dt)
    }
    const effL = effortLook(this.eff.x)
    this.kick *= Math.exp(-dt * 5)

    const tokens: { v: Tokens | null } = { v: null }
    const cur = this.sectionLook(this.secs[0], ch, effL, tokens)
    let L = cur.L
    let orb = cur.orb ?? { x: cw * 0.5, y: ch * 0.5, r: 1 }
    let split = 0
    let o2: Orb | null = null
    let tokW = this.secs[0].key === 'tokens' ? 1 : 0
    let glyphBox: DOMRect | null = null
    let ringBox: DOMRect | null = null

    for (let i = 1; i < this.secs.length; i++) {
      const s = this.secs[i]
      const top = s.el.getBoundingClientRect().top
      const raw = clamp((ch * 0.8 - top) / (ch * 0.6))
      const b = this.blends[i]
      if (reduced) {
        b.x = raw
        b.v = 0
      } else {
        step(b, raw, 7.5, 1, dt)
      }
      const t = ease(clamp(b.x))
      if (t <= 0.0005 && top > ch) continue
      const next = this.sectionLook(s, ch, effL, tokens)
      if (t <= 0.0005) continue
      L = mixLook(L, next.L, t)
      if (next.orb) orb = { x: lerp(orb.x, next.orb.x, t), y: lerp(orb.y, next.orb.y, t), r: lerp(orb.r, next.orb.r, t) }
      split = s.key === 'versus' ? lerp(split, 1, t) : split * (1 - t)
      tokW = s.key === 'tokens' ? lerp(tokW, 1, t) : tokW * (1 - t)
      if (s.orb2 && t > 0.001) o2 = orbOf(s.orb2)
      if (s.glyph && t > 0.001) glyphBox = s.glyph.getBoundingClientRect()
      if (s.ring && t > 0.001) ringBox = s.ring.getBoundingClientRect()
    }

    // Load ignition: the orb starts as cold rock and melts open.
    const ig = reduced ? 1 : ease(clamp((time - 0.2) / 1.35))
    const pulse = reduced ? 0 : Math.exp(-Math.pow((time - 1.2) / 0.16, 2))
    L.crust = lerp(1, L.crust, ig)
    L.temp = mired(1050, L.temp, Math.pow(ig, 0.7))
    L.sparks *= ig
    L.vis *= reduced ? 1 : clamp(time / 0.3)
    const glowMul = 1 + pulse * 0.6 + this.kick * 0.35
    this.hooks.hero?.style.setProperty('--lit', clamp(ig * 1.05).toFixed(3))
    this.hooks.point?.style.setProperty('--light', clamp(L.light).toFixed(3))

    // Pointer: the hot side leans toward the cursor; hovering the orb heats it.
    const px = this.pointer.x
    const py = this.pointer.y
    const dx = px - orb.x
    const dy = py - orb.y
    const near = Math.hypot(dx, dy) < orb.r * 1.15 && now - this.pointer.at < 6000 ? 1 : 0
    const lr = Math.max(orb.r * 3, 1)
    if (reduced) {
      this.hover.x = near
      this.lookX.x = 0
      this.lookY.x = 0
    } else {
      step(this.hover, near, 6, 1, dt)
      step(this.lookX, clamp(dx / lr, -1, 1), 4, 1, dt)
      step(this.lookY, clamp(-dy / lr, -1, 1), 4, 1, dt)
    }
    const temp = mired(L.temp, L.temp + 650, this.hover.x)

    // Second ember: the pasted-in instruction. It follows the pointer inside its chapter.
    let orb2: [number, number, number, number] = [0, 0, 1, 0]
    let attract: [number, number, number] = [0, 0, 0]
    if (o2 && L.orb2 > 0.001) {
      const pasteSec = this.secs.find((s) => s.key === 'paste')
      const pr = pasteSec?.el.getBoundingClientRect()
      const fresh = now - this.pointer.at < 5000
      const inside = !!pr && fresh && py > pr.top && py < pr.bottom && px >= 0
      const gx = inside ? px : o2.x
      const gy = inside ? py : o2.y
      if (this.o2x.x < 0 || reduced) {
        this.o2x.x = gx
        this.o2y.x = gy
      } else {
        step(this.o2x, gx, 4.5, 0.9, dt)
        step(this.o2y, gy, 4.5, 0.9, dt)
      }
      const r2 = o2.r
      orb2 = [this.o2x.x * dpr, (ch - this.o2y.x) * dpr, r2 * dpr, clamp(L.orb2)]
      attract = [this.o2x.x * dpr, (ch - this.o2y.x) * dpr, clamp(L.attract) * (reduced ? 0 : 1)]
    }

    const dial = this.hooks.dial
    if (dial) {
      dial.style.setProperty('--e', this.eff.x.toFixed(4))
      dial.style.setProperty('--knob', bbCss(effL.temp, 0.12))
    }

    const tk = tokens.v
    let cell = 1000
    let anchor: [number, number] = [-1e5, -1e5]
    let clear: [number, number, number, number] = [0, 0, 0, 0]
    if (tk) {
      cell = tk.cell * dpr
      anchor = [tk.anchor[0] * dpr, (ch - tk.anchor[1]) * dpr]
      if (tk.clear) {
        const c = tk.clear
        clear = [c.left * dpr, (ch - c.bottom) * dpr, c.right * dpr, (ch - c.top) * dpr]
      }
      const count = this.hooks.count
      if (count) {
        const n = (lo: number, hi: number, a: number) => {
          const first = clamp(Math.ceil((lo - a) / tk.cell + GRID_TARGET[0]), 0, 999)
          const last = clamp(Math.floor((hi - a) / tk.cell + GRID_TARGET[0]), 0, 999)
          return Math.max(0, last - first + 1)
        }
        const total = n(0, cw, tk.anchor[0]) * n(0, ch, tk.anchor[1])
        const txt = Math.max(1, total).toLocaleString('en-US')
        if (txt !== this.lastCount) {
          count.textContent = txt
          this.lastCount = txt
        }
      }
    }

    // Runs without WebGL too: it drives the DOM fill (--f) of the score bars
    // and the order the versus entries arrive in.
    const barN = this.scores(ch, dpr, dt)
    const vs = this.byKey.versus
    if (vs?.chart && nearView(vs.el, ch)) this.setVar(vs.chart, '--p', this.ramp('vs', vs.chart, ch, dt, 1.8, 0.78))
    if (!this.r || this.lost) return
    const bd = this.beads(ch, dpr, dt)

    let glyph: [number, number, number, number] = [0, 0, 1, 1]
    if (glyphBox) {
      const side = Math.min(glyphBox.width, glyphBox.height)
      const gx = glyphBox.left + (glyphBox.width - side) / 2
      const gy = glyphBox.top + (glyphBox.height - side) / 2
      glyph = [gx * dpr, (ch - gy - side) * dpr, side * dpr, side * dpr]
    }
    let ring: [number, number, number, number] = [0, 0, 0, 0]
    let bound = 0
    if (ringBox && L.ring > 0.001) {
      const rr = (ringBox.width / 2) * dpr
      ring = [(ringBox.left + ringBox.width / 2) * dpr, (ch - ringBox.top - ringBox.height / 2) * dpr, rr, clamp(L.ring)]
      bound = L.ring > 0.5 ? rr : 0
    }

    // Versus: the seam is vertical on wide screens (hot left, cold right) and
    // horizontal on narrow ones (hot above, cold below).
    const seam: [number, number] = this.wide.matches ? [1, 0] : [0, -1]
    const splitV: [number, number, number, number] = [seam[0], seam[1], this.wide.matches ? 0.35 : 0.9, clamp(split)]

    const frame: Frame = {
      w: this.canvas.width,
      h: this.canvas.height,
      scale: dpr,
      time: reduced ? 4 : time,
      orb: [orb.x * dpr, (ch - orb.y) * dpr, Math.max(orb.r * dpr, 0.5)],
      temp,
      crust: clamp(L.crust),
      glow: L.glow * glowMul * (1 + this.hover.x * 0.15),
      bg: L.bg,
      flash: pulse * 0.012,
      dim: 0,
      look: [this.lookX.x, this.lookY.x],
      still: reduced ? 1 : 0,
      exposure: L.exposure,
      vis: clamp(L.vis),
      orb2,
      pour: [orb.x * dpr, orb.r * dpr * 0.2, clamp(L.pour)],
      sparks: reduced ? 0 : Math.round(L.sparks * (1 + this.kick * 0.6)),
      sparkFade: 1,
      bound,
      attract,
      grid: clamp(L.grid) * tokW,
      cell,
      anchor,
      target: GRID_TARGET,
      out: tk ? tk.out : 0,
      targetA: clamp(L.tgt),
      clear,
      glyph,
      glyphA: clamp(L.glyph),
      ring,
      bar: this.barBuf,
      barV: this.barVBuf,
      barN,
      barA: barN ? 1 : 0,
      bead: this.beadBuf,
      beadV: this.beadVBuf,
      beadN: bd.n,
      beadA: bd.n ? 1 : 0,
      beadBox: bd.box,
      hub: bd.hub,
      setA: bd.setA,
      split: splitV,
    }
    this.r.draw(frame)
  }
}
