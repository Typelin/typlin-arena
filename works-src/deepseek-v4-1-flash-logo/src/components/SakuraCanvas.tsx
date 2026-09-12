import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Petal = {
  x: number
  y: number
  size: number
  vy: number
  drift: number
  rot: number
  vr: number
  phase: number
  sway: number
  alpha: number
  tone: 0 | 1 | 2
}

const TONES = ['240, 160, 182', '224, 124, 158', '248, 211, 222'] as const

function makePetal(width: number, height: number, spawnAbove = false): Petal {
  const size = 7 + Math.random() * 11
  return {
    x: Math.random() * width,
    y: spawnAbove ? -size * 2 : Math.random() * height,
    size,
    vy: 9 + Math.random() * 16,
    drift: -7 + Math.random() * 14,
    rot: Math.random() * Math.PI * 2,
    vr: (-0.28 + Math.random() * 0.56) * 0.6,
    phase: Math.random() * Math.PI * 2,
    sway: 12 + Math.random() * 26,
    alpha: 0.24 + Math.random() * 0.36,
    tone: Math.floor(Math.random() * 3) as 0 | 1 | 2,
  }
}

function petalPath(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(size * 0.62, -size * 0.34, size * 1.2, size * 0.22, 0, size)
  ctx.bezierCurveTo(-size * 1.2, size * 0.22, -size * 0.62, -size * 0.34, 0, 0)
  ctx.closePath()
}

/**
 * Ambient cherry-blossom drift. Deliberately low-density and low-contrast so it
 * reads as paper texture rather than decoration; it pauses when the tab is
 * hidden and never runs under `prefers-reduced-motion`.
 */
export function SakuraCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const running = active && !reduced

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !running) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let petals: Petal[] = []
    let frame = 0
    let last = 0
    let paused = document.hidden

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const density = width < 640 ? 9 : width < 1100 ? 16 : 22
      petals = Array.from({ length: density }, () => makePetal(width, height))
    }

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height)
      for (const p of petals) {
        p.phase += dt * 0.55
        p.y += p.vy * dt
        p.rot += p.vr * dt
        const x = p.x + Math.sin(p.phase) * p.sway + p.drift * p.phase * 0.18

        if (p.y > height + p.size * 2) {
          Object.assign(p, makePetal(width, height, true))
        }

        ctx.save()
        ctx.translate(x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = `rgb(${TONES[p.tone]})`
        petalPath(ctx, p.size)
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    const tick = (time: number) => {
      frame = requestAnimationFrame(tick)
      if (paused) {
        last = time
        return
      }
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0.016
      last = time
      draw(dt)
    }

    const onVisibility = () => {
      paused = document.hidden
      last = 0
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      ctx.clearRect(0, 0, width, height)
    }
  }, [running])

  if (!running) return null

  return <canvas ref={canvasRef} className="sakura-canvas" aria-hidden="true" />
}
