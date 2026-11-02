export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
export const easeBack = (t: number) => {
  const x = clamp(t)
  const c1 = 2.2
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error('missing ' + sel)
  return el
}

const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
export const isReduced = () => mq.matches

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

/** seeded rng so the drawings are the same every visit */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

export class Spring {
  x: number
  v = 0
  constructor(
    public k = 120,
    public c = 14,
    x0 = 0,
  ) {
    this.x = x0
  }
  step(target: number, dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.008))
    const h = dt / n
    for (let i = 0; i < n; i++) {
      const a = -this.k * (this.x - target) - this.c * this.v
      this.v += a * h
      this.x += this.v * h
    }
    return this.x
  }
  get settled() {
    return Math.abs(this.v) < 0.02
  }
}

type Frame = (t: number, dt: number) => void
const frames: Frame[] = []
export function onFrame(fn: Frame) {
  frames.push(fn)
}
let t0 = 0
let last = 0
function loop(now: number) {
  if (!t0) {
    t0 = now
    last = now
  }
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const t = (now - t0) / 1000
  for (const f of frames) f(t, dt)
  requestAnimationFrame(loop)
}
export function startLoop() {
  requestAnimationFrame(loop)
}

export function watchVisible(el: Element, cb: (visible: boolean) => void, margin = '10% 0px') {
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) cb(e.isIntersecting)
    },
    { rootMargin: margin },
  )
  io.observe(el)
}

/** 0 when the element's top meets the viewport bottom, 1 when its bottom meets the viewport top */
export function passProgress(el: Element) {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  return clamp((vh - r.top) / (vh + r.height))
}

/** progress through a tall element that holds a sticky child */
export function pinProgress(el: Element) {
  const r = el.getBoundingClientRect()
  const span = r.height - window.innerHeight
  return span <= 0 ? 0 : clamp(-r.top / span)
}

export function fitCanvas(cv: HTMLCanvasElement, maxDpr = 2) {
  const r = cv.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  const w = Math.max(1, Math.round(r.width * dpr))
  const h = Math.max(1, Math.round(r.height * dpr))
  if (cv.width !== w || cv.height !== h) {
    cv.width = w
    cv.height = h
  }
  return { w, h, dpr, cssW: r.width, cssH: r.height }
}

export function onResize(fn: () => void) {
  let raf = 0
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(fn)
  })
}
