export type DrawState = { reduced: boolean; paused: boolean }

export function attachCanvas(
  canvas: HTMLCanvasElement,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
  opts: DrawState,
): () => void {
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return () => undefined

  let raf = 0
  let running = true
  let visible = true
  let last = performance.now()
  let elapsed = 0

  const size = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = Math.max(1, rect.width)
    const cssH = Math.max(1, rect.height)
    const w = Math.max(1, Math.round(cssW * dpr))
    const h = Math.max(1, Math.round(cssH * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { w: cssW, h: cssH }
  }

  const paint = (now: number) => {
    const { w, h } = size()
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!opts.paused && !opts.reduced) elapsed += dt
    ctx.clearRect(0, 0, w, h)
    draw(ctx, w, h, elapsed)
  }

  const frame = (now: number) => {
    if (!running) return
    if (!visible) {
      raf = 0
      return
    }
    paint(now)
    raf = requestAnimationFrame(frame)
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
      if (visible && running && raf === 0) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    },
    { rootMargin: '120px' },
  )
  io.observe(canvas)

  paint(performance.now())
  raf = requestAnimationFrame(frame)

  return () => {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n))
}


