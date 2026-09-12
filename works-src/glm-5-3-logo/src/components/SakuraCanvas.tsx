import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------
   SakuraCanvas — 全站夜樱粒子层
   · 常驻飘落樱花（数量按视口面积与设备能力自适应）
   · 指针移动产生柔和风场，花瓣顺势漂移
   · 点击/触摸处绽开一圈花瓣（burst）
   · prefers-reduced-motion 时完全静止，不消耗性能
------------------------------------------------------------------ */

type Petal = {
  x: number; y: number
  size: number
  vx: number; vy: number
  rot: number; vr: number
  hue: number; alpha: number
  sway: number; swaySpeed: number; phase: number
  burst?: boolean; life?: number; decay?: number
}

const MIN_SIZE = 8   // 触控目标无涉，但花瓣尺寸下限（视觉可辨）
const TAU = Math.PI * 2

function makePetal(w: number, h: number, spawnTop = true): Petal {
  return {
    x: Math.random() * w,
    y: spawnTop ? -20 - Math.random() * h * 0.3 : Math.random() * h,
    size: 7 + Math.random() * 8,
    vx: 0.2 + Math.random() * 0.5,
    vy: 0.35 + Math.random() * 0.75,
    rot: Math.random() * TAU,
    vr: (Math.random() - 0.5) * 0.02,
    hue: 338 + Math.random() * 16,       // 338–354 樱粉
    alpha: 0.5 + Math.random() * 0.35,
    sway: 0.6 + Math.random() * 1.4,
    swaySpeed: 0.004 + Math.random() * 0.008,
    phase: Math.random() * TAU,
  }
}

function makeBurstPetal(x: number, y: number): Petal {
  const ang = Math.random() * TAU
  const speed = 1.4 + Math.random() * 2.6
  return {
    x, y,
    size: 6 + Math.random() * 7,
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed - 0.6,
    rot: Math.random() * TAU,
    vr: (Math.random() - 0.5) * 0.18,
    hue: 335 + Math.random() * 22,
    alpha: 0.95,
    sway: 0,
    swaySpeed: 0,
    phase: 0,
    burst: true,
    life: 1,
    decay: 0.006 + Math.random() * 0.008,
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  const { size } = p
  const s = Math.max(size, MIN_SIZE * 0.6)
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = p.alpha
  // 花瓣：两瓣心形叠加近似樱花瓣
  ctx.fillStyle = `hsl(${p.hue} 85% 80%)`
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.5)
  ctx.bezierCurveTo(s * 0.9, -s * 0.9, s * 1.05, s * 0.45, 0, s * 0.62)
  ctx.bezierCurveTo(-s * 1.05, s * 0.45, -s * 0.9, -s * 0.9, 0, -s * 0.5)
  ctx.fill()
  ctx.fillStyle = `hsl(${p.hue + 8} 90% 88%)`
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.2)
  ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.62, s * 0.3, 0, s * 0.4)
  ctx.bezierCurveTo(-s * 0.62, s * 0.3, -s * 0.55, -s * 0.5, 0, -s * 0.2)
  ctx.fill()
  ctx.restore()
}

export default function SakuraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0
    let petals: Petal[] = []
    let wind = { x: 0 }

    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const isSmall = () => window.innerWidth < 720

    const targetCount = () => {
      const base = Math.round((w * h) / 26000)
      return Math.max(isSmall() ? 14 : 22, Math.min(base, isSmall() ? 34 : 70))
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * DPR)
      canvas.height = Math.round(h * DPR)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      const n = targetCount()
      while (petals.length < n) petals.push(makePetal(w, h, false))
      petals.length = n
    }

    const onPointer = (e: PointerEvent) => {
      wind.x += (e.movementX || 0) * 0.06
      wind.x = Math.max(-3, Math.min(3, wind.x))
    }

    const onDown = (e: PointerEvent) => {
      if (reduced) return
      // 点击处绽开 10–14 瓣
      const n = 10 + Math.floor(Math.random() * 5)
      for (let i = 0; i < n; i++) petals.push(makeBurstPetal(e.clientX, e.clientY))
      if (petals.length > targetCount() + 90) petals = petals.filter((p) => !p.burst || (p.life ?? 1) > 0.25)
    }

    let t = 0
    const frame = () => {
      t++
      ctx.clearRect(0, 0, w, h)

      // 风场衰减
      wind.x *= 0.94

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]

        if (p.burst) {
          p.life = (p.life ?? 1) - (p.decay ?? 0.01)
          p.vx *= 0.985
          p.vy = p.vy * 0.985 + 0.02
          p.x += p.vx
          p.y += p.vy
          p.rot += p.vr
          p.alpha = Math.max(0, p.life ?? 0)
          if ((p.life ?? 0) <= 0) {
            petals.splice(i, 1)
            continue
          }
        } else {
          p.phase += p.swaySpeed * 16
          p.x += p.vx + Math.sin(p.phase) * p.sway * 0.35 + wind.x
          p.y += p.vy
          p.rot += p.vr + Math.sin(p.phase * 0.5) * 0.004
          if (p.y > h + 30 || p.x < -60 || p.x > w + 60) {
            petals[i] = makePetal(w, h, true)
            continue
          }
        }
        drawPetal(ctx, p)
      }

      if (petals.length < targetCount()) petals.push(makePetal(w, h, true))
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    if (reduced) {
      // 静态一帧：均匀撒一次，不进入动画循环
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) drawPetal(ctx, p)
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onDown)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="sakura-canvas"
      aria-hidden="true"
    />
  )
}
