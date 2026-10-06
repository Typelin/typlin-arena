import { useEffect, useRef } from 'react'

type Petal = {
  x: number
  y: number
  z: number
  r: number
  vx: number
  vy: number
  rot: number
  vr: number
  sway: number
  hue: number
  alpha: number
}

/** 飄落花瓣背景：點擊可迸發一簇花瓣 */
export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const petalsRef = useRef<Petal[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const make = (x: number, y: number, burst = false): Petal => {
      const angle = burst ? Math.random() * Math.PI * 2 : Math.PI / 2 + (Math.random() - 0.5) * 0.6
      const speed = burst ? 0.6 + Math.random() * 2.4 : 0.25 + Math.random() * 0.55
      return {
        x,
        y,
        z: 0.5 + Math.random() * 0.9,
        r: 5 + Math.random() * 7,
        vx: Math.cos(angle) * speed * (burst ? 1 : 0.35),
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.03,
        sway: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.6 ? 0 : 1, // 0 粉 / 1 藍
        alpha: 0.35 + Math.random() * 0.4,
      }
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const count = reduced ? 14 : Math.min(46, Math.floor(w / 34))
    petalsRef.current = Array.from({ length: count }, () => {
      const p = make(Math.random() * w, Math.random() * h)
      return p
    })

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.alpha
      const grad = ctx.createLinearGradient(-p.r, 0, p.r, 0)
      if (p.hue === 0) {
        grad.addColorStop(0, '#ffd9e4')
        grad.addColorStop(1, '#f7a8c0')
      } else {
        grad.addColorStop(0, '#dfe6ff')
        grad.addColorStop(1, '#9fb2e8')
      }
      ctx.fillStyle = grad
      // 花瓣：兩段貝茲曲線
      ctx.beginPath()
      ctx.moveTo(0, -p.r)
      ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.6, p.r * 0.7, p.r * 0.7, 0, p.r)
      ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.7, -p.r * 0.9, -p.r * 0.6, 0, -p.r)
      ctx.fill()
      ctx.restore()
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of petalsRef.current) {
        p.sway += 0.012
        p.x += p.vx + Math.sin(p.sway) * 0.45 * p.z
        p.y += p.vy * p.z
        p.rot += p.vr
        if (p.y > h + 30) {
          p.y = -30
          p.x = Math.random() * w
          p.vy = 0.25 + Math.random() * 0.55
        }
        if (p.x > w + 30) p.x = -30
        if (p.x < -30) p.x = w + 30
        drawPetal(p)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const onResize = () => resize()
    const onBurst = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number }>
      const { x, y } = ce.detail
      const burst = Array.from({ length: 12 }, () => make(x, y, true))
      petalsRef.current.push(...burst)
      // 控制總量
      if (petalsRef.current.length > 120) {
        petalsRef.current.splice(0, petalsRef.current.length - 120)
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('petal:burst', onBurst as EventListener)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('petal:burst', onBurst as EventListener)
    }
  }, [])

  return <canvas ref={canvasRef} className="petal-canvas" aria-hidden="true" />
}

export function burstAt(x: number, y: number) {
  window.dispatchEvent(new CustomEvent('petal:burst', { detail: { x, y } }))
}
