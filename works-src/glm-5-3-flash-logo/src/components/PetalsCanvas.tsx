import { useEffect, useRef } from 'react'

type Petal = {
  x: number
  y: number
  s: number
  sp: number
  ph: number
  amp: number
  rot: number
  rv: number
  c: number
  a: number
}

const COLORS = ['#F2A9BC', '#F7C6D4', '#E58BA6', '#CBA6D6', '#8F9BD8']

export default function PetalsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let petals: Petal[] = []

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const spawn = (init = false): Petal => ({
      x: rand(0, w),
      y: init ? rand(0, h) : -30,
      s: rand(6, 14),
      sp: rand(20, 46),
      ph: rand(0, Math.PI * 2),
      amp: rand(14, 34),
      rot: rand(0, Math.PI * 2),
      rv: rand(-0.6, 0.6),
      c: Math.floor(rand(0, COLORS.length)),
      a: rand(0.3, 0.75),
    })

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(26, Math.max(12, w / 64)))
      petals = Array.from({ length: n }, () => spawn(true))
    }

    const drawPetal = (s: number) => {
      ctx.beginPath()
      ctx.moveTo(0, s * 0.55)
      ctx.bezierCurveTo(-s * 0.6, s * 0.15, -s * 0.55, -s * 0.4, -s * 0.16, -s * 0.5)
      ctx.lineTo(0, -s * 0.3)
      ctx.lineTo(s * 0.16, -s * 0.5)
      ctx.bezierCurveTo(s * 0.55, -s * 0.4, s * 0.6, s * 0.15, 0, s * 0.55)
      ctx.closePath()
      ctx.fill()
    }

    const drawAll = () => {
      for (const p of petals) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.a
        ctx.fillStyle = COLORS[p.c]
        drawPetal(p.s)
        ctx.restore()
      }
    }

    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.sp * dt
        p.rot += p.rv * dt
        if (p.y > h + 40) Object.assign(p, spawn())
        const x = p.x + Math.sin((t / 1000) * 0.6 + p.ph) * p.amp
        ctx.save()
        ctx.translate(x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.a
        ctx.fillStyle = COLORS[p.c]
        drawPetal(p.s)
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    if (reduced) {
      drawAll()
    } else {
      raf = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="petals" aria-hidden="true" />
}
