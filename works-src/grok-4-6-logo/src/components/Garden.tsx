import { useEffect, useRef } from 'react'
import { useReducedMotion, useScrollNight } from '../hooks/media'

type Kind = 'petal' | 'glyph' | 'spark'

type Particle = {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vr: number
  life: number
  hue: number
  glyph: string
}

const GLYPHS = ['</>', '{ }', '=>', '咲', '梦', '；']

function spawn(w: number, h: number, kind: Kind, x?: number, y?: number): Particle {
  const burst = x !== undefined
  return {
    kind,
    x: x ?? Math.random() * w,
    y: y ?? (kind === 'glyph' ? h * (0.38 + Math.random() * 0.5) : Math.random() * h),
    vx: burst ? (Math.random() - 0.5) * 4.2 : (Math.random() - 0.5) * 0.35,
    vy: burst ? -Math.random() * 2.4 - 0.4 : Math.random() * 0.35 + 0.08,
    r:
      kind === 'glyph'
        ? 11 + Math.random() * 8
        : kind === 'spark'
          ? 1 + Math.random() * 1.6
          : 6 + Math.random() * 10,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.04,
    life: 0,
    hue: Math.random(),
    glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0] ?? '</>',
  }
}

function petalPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(0, -1)
  ctx.bezierCurveTo(0.62, -0.42, 0.52, 0.55, 0, 1)
  ctx.bezierCurveTo(-0.52, 0.55, -0.62, -0.42, 0, -1)
  ctx.closePath()
}

export function Garden() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const night = useScrollNight()
  const nightRef = useRef(night)
  nightRef.current = night

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false }
    let lastPx = 0
    let lastPy = 0
    let w = 0
    let h = 0
    let raf = 0
    let hidden = document.hidden

    const particles: Particle[] = []

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      particles.length = 0
      const n = reduced ? 12 : Math.min(56, 28 + Math.floor(w / 80))
      for (let i = 0; i < n; i++) particles.push(spawn(w, h, 'petal'))
      if (!reduced) {
        for (let i = 0; i < 8; i++) particles.push(spawn(w, h, 'spark'))
        for (let i = 0; i < 4; i++) particles.push(spawn(w, h, 'glyph'))
      }
    }

    const burst = (x: number, y: number) => {
      if (reduced) return
      for (let i = 0; i < 22; i++) particles.push(spawn(w, h, i % 7 === 0 ? 'spark' : 'petal', x, y))
      if (particles.length > 140) particles.splice(0, particles.length - 140)
    }

    const onMove = (e: PointerEvent) => {
      pointer.vx = e.clientX - lastPx
      pointer.vy = e.clientY - lastPy
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.inside = true
      lastPx = e.clientX
      lastPy = e.clientY
    }

    const onBurst = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail
      if (d) burst(d.x, d.y)
    }

    const drawSpark = (p: Particle, alpha: number) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-p.r * 2.2, 0)
      ctx.lineTo(p.r * 2.2, 0)
      ctx.moveTo(0, -p.r * 2.2)
      ctx.lineTo(0, p.r * 2.2)
      ctx.stroke()
      ctx.restore()
    }

    const drawPetal = (p: Particle, alpha: number) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(p.r * 0.55, p.r)
      const pink = p.hue > 0.72
      ctx.fillStyle = pink
        ? `rgba(244, 167, 193,${alpha})`
        : `rgba(232, 214, 228,${alpha})`
      petalPath(ctx)
      ctx.fill()
      ctx.restore()
    }

    const drawGlyph = (p: Particle, alpha: number) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot * 0.2)
      ctx.font = `${p.r}px "IBM Plex Mono", monospace`
      ctx.fillStyle = `rgba(110, 130, 200,${alpha * 0.55})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.glyph, 0, 0)
      ctx.restore()
    }

    const step = () => {
      const n = nightRef.current
      const paper = 1 - n
      ctx.clearRect(0, 0, w, h)

      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, `rgba(10, 12, 28,${0.22 * n})`)
      g.addColorStop(0.45, `rgba(28, 24, 48,${0.1 * n})`)
      g.addColorStop(1, `rgba(246, 240, 230,${0.08 * paper})`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.42, Math.max(w, h) * 0.42)
      glow.addColorStop(0, `rgba(244, 167, 193,${0.14 * n})`)
      glow.addColorStop(0.45, `rgba(74, 95, 168,${0.1 * n})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        if (!reduced) {
          p.life += 1
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const dist = Math.hypot(dx, dy) || 1
          if (pointer.inside && dist < 180) {
            const f = (1 - dist / 180) * 0.08
            p.vx += pointer.vx * f
            p.vy += pointer.vy * f
          }
          p.vx *= 0.985
          p.vy = p.vy * 0.985 + 0.012
          p.x += p.vx + Math.sin(p.life * 0.01 + p.hue * 8) * 0.18
          p.y += p.vy
          p.rot += p.vr
          if (p.y > h + 20) {
            p.y = -20
            p.x = Math.random() * w
          }
          if (p.x < -40) p.x = w + 20
          if (p.x > w + 40) p.x = -20
        }

        const fade = p.kind === 'spark' ? 0.35 + 0.45 * n : 0.22 + 0.45 * n
        if (p.kind === 'petal') drawPetal(p, fade)
        else if (p.kind === 'spark') drawSpark(p, fade)
        else drawGlyph(p, fade * (0.35 + n * 0.65))
      }

      if (!hidden && !reduced) raf = requestAnimationFrame(step)
    }

    resize()
    seed()
    step()

    const onResize = () => {
      resize()
      seed()
      if (reduced) step()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('sakimu:burst', onBurst)
    const onVis = () => {
      hidden = document.hidden
      if (!hidden && !reduced) {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(step)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('sakimu:burst', onBurst)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduced])

  return <canvas ref={ref} className="garden" aria-hidden="true" />
}

export function bloomAt(x: number, y: number) {
  window.dispatchEvent(new CustomEvent('sakimu:burst', { detail: { x, y } }))
}
