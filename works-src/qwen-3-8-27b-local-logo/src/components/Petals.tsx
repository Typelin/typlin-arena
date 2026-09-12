import { useEffect, useRef } from 'react'

interface Petal {
  baseX: number
  y: number
  r: number
  vy: number
  swayAmp: number
  swayFreq: number
  phase: number
  rot: number
  vrot: number
  color: string
  alpha: number
}

const COLORS = ['242,169,189', '235,140,167', '250,214,226', '226,120,155']

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Falling sakura petals rendered on a canvas behind the hero content. */
export default function Petals() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0
    let petals: Petal[] = []
    let last = performance.now()

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const makePetal = (spawnTop: boolean): Petal => ({
      baseX: rand(0, width),
      y: spawnTop ? -rand(10, 60) : rand(-height * 0.2, height + 40),
      r: rand(5, 13),
      vy: rand(22, 64),
      swayAmp: rand(8, 26),
      swayFreq: rand(0.4, 1.1),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vrot: rand(-1.4, 1.4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: rand(0.35, 0.8),
    })

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(46, Math.max(12, Math.round((width * height) / 26000)))
      petals = Array.from({ length: count }, () => makePetal(false))
    }

    const drawPetal = (p: Petal, x: number) => {
      ctx.save()
      ctx.translate(x, p.y)
      ctx.rotate(p.rot)
      const r = p.r
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.bezierCurveTo(r * 0.75, -r * 0.4, r * 0.6, r * 0.9, 0, r * 1.2)
      ctx.bezierCurveTo(-r * 0.6, r * 0.9, -r * 0.75, -r * 0.4, 0, -r)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of petals) drawPetal(p, p.baseX)
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, width, height)
      for (const p of petals) {
        p.y += p.vy * dt
        p.rot += p.vrot * dt
        if (p.y > height + 24) Object.assign(p, makePetal(true))
        drawPetal(p, p.baseX + Math.sin((now / 1000) * p.swayFreq + p.phase) * p.swayAmp)
      }
      raf = requestAnimationFrame(frame)
    }

    resize()
    if (reduced) {
      renderStatic()
    } else {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      resize()
      if (reduced) renderStatic()
    }
    window.addEventListener('resize', onResize)

    // Pause the loop while the hero is out of view.
    const io = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? true
        if (reduced) return
        if (isVisible && !raf) {
          last = performance.now()
          raf = requestAnimationFrame(frame)
        } else if (!isVisible && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0.05 },
    )
    io.observe(canvas)

    return () => {
      window.removeEventListener('resize', onResize)
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="petals" aria-hidden="true" />
}
