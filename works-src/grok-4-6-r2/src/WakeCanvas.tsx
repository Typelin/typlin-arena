import { useEffect, useRef } from 'react'
import { attachCanvas, lerp } from './canvas'
import type { DrawState } from './canvas'
import { useDocumentHidden, useReducedMotion } from './hooks'
import type { Effort } from './facts'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; s: number }

const EFFORT_WAKE: Record<Effort, number> = {
  low: 0.35,
  medium: 0.65,
  high: 1,
  xhigh: 1.35,
}

export function WakeCanvas({
  heading,
  scroll,
  effort,
  onHeading,
}: {
  heading: number
  scroll: number
  effort: Effort
  onHeading?: (h: number) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const headingRef = useRef(heading)
  const scrollRef = useRef(scroll)
  const effortRef = useRef(effort)
  const reduced = useReducedMotion()
  const paused = useDocumentHidden()
  headingRef.current = heading
  scrollRef.current = scroll
  effortRef.current = effort

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const foam: Particle[] = []
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.58,
      r: 0.35 + Math.random() * 1.35,
      a: 0.12 + Math.random() * 0.6,
      tw: Math.random() * Math.PI * 2,
    }))
    const state: DrawState = { reduced, paused }

    const stop = attachCanvas(canvas, (ctx, w, h, t) => {
      state.reduced = reduced
      state.paused = paused
      const hd = headingRef.current
      const sc = scrollRef.current
      const power = EFFORT_WAKE[effortRef.current]
      const split = w < 520
      const horizon = split
        ? h * 0.38
        : h * lerp(0.58, 0.46, Math.min(1, sc * 3))

      const sky = ctx.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, '#040910')
      sky.addColorStop(0.42, '#07141e')
      sky.addColorStop(0.78, '#0c2433')
      sky.addColorStop(1, '#16384a')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, horizon)

      for (const s of stars) {
        const tw = 0.45 + 0.55 * Math.sin(t * 1.2 + s.tw)
        ctx.fillStyle = `rgba(214,232,240,${s.a * tw})`
        ctx.fillRect(s.x * w, s.y * horizon, s.r, s.r)
      }

      const moonX = split ? w * 0.78 : w * 0.76
      const moonY = horizon * (split ? 0.42 : 0.36)
      const moonR = Math.min(w, h) * (split ? 0.07 : 0.058)
      const halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.15, moonX, moonY, moonR * 5)
      halo.addColorStop(0, 'rgba(220,232,238,0.5)')
      halo.addColorStop(0.22, 'rgba(160,196,210,0.12)')
      halo.addColorStop(1, 'rgba(160,196,210,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, horizon)

      ctx.beginPath()
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
      ctx.fillStyle = '#e7eef2'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(moonX + moonR * 0.42, moonY - moonR * 0.12, moonR * 0.88, 0, Math.PI * 2)
      ctx.fillStyle = '#0b1d2a'
      ctx.fill()

      const water = ctx.createLinearGradient(0, horizon, 0, h)
      water.addColorStop(0, '#102838')
      water.addColorStop(0.18, '#0b1c28')
      water.addColorStop(0.55, '#071017')
      water.addColorStop(1, '#020508')
      ctx.fillStyle = water
      ctx.fillRect(0, horizon, w, h - horizon)

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, horizon, w, h - horizon)
      ctx.clip()
      const path = moonX + Math.sin(t * 0.28) * 6
      const glowH = h - horizon
      ctx.beginPath()
      ctx.moveTo(path - 4, horizon)
      ctx.lineTo(path + 4, horizon)
      ctx.lineTo(path + glowH * 0.18, h)
      ctx.lineTo(path - glowH * 0.18, h)
      ctx.closePath()
      const fall = ctx.createLinearGradient(path, horizon, path, h)
      fall.addColorStop(0, 'rgba(214,230,236,0.28)')
      fall.addColorStop(0.22, 'rgba(214,230,236,0.1)')
      fall.addColorStop(1, 'rgba(214,230,236,0)')
      ctx.fillStyle = fall
      ctx.fill()
      const spark = ctx.createRadialGradient(path, horizon, 2, path, horizon, 36)
      spark.addColorStop(0, 'rgba(232,242,246,0.35)')
      spark.addColorStop(1, 'rgba(232,242,246,0)')
      ctx.fillStyle = spark
      ctx.beginPath()
      ctx.arc(path, horizon, 36, 0, Math.PI * 2)
      ctx.fill()
      for (let i = 0; i < 9; i++) {
        const y = horizon + ((t * (12 + power * 8) + i * 53) % (h - horizon + 40))
        ctx.strokeStyle = `rgba(88,138,150,${0.04 + (i % 4) * 0.025})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x <= w; x += 20) {
          ctx.lineTo(x, y + Math.sin(x * 0.018 + t * 1.05 + i) * (2.2 + power))
        }
        ctx.stroke()
      }
      ctx.restore()

      const minX = split ? w * 0.28 : w * 0.58
      const maxX = w * 0.86
      const boatX = Math.max(minX, Math.min(maxX, (split ? w * 0.58 : w * 0.74) + hd * w * 0.1))
      const boatY = horizon + h * (split ? 0.12 : 0.07) + Math.sin(t * 1.55) * (2.2 + power)
      const scale = lerp(1, 0.72, Math.min(1, sc * 2.2))
      const hullW = Math.min(w, 920) * (split ? 0.18 : 0.13) * scale
      const hullH = hullW * 0.3
      const wakeLen = Math.min(w * 0.5, 480) * power

      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.beginPath()
      ctx.moveTo(boatX, boatY + hullH * 0.15)
      ctx.lineTo(boatX - wakeLen * 0.62 - hd * 40, h)
      ctx.lineTo(boatX + wakeLen * 0.16 - hd * 12, h)
      ctx.closePath()
      const wake = ctx.createLinearGradient(boatX, boatY, boatX - wakeLen * 0.25, h)
      wake.addColorStop(0, `rgba(186,220,224,${0.22 * power})`)
      wake.addColorStop(0.4, `rgba(126,200,195,${0.08 * power})`)
      wake.addColorStop(1, 'rgba(126,200,195,0)')
      ctx.fillStyle = wake
      ctx.fill()
      ctx.restore()

      if (!state.reduced && Math.random() < 0.3 + power * 0.3) {
        foam.push({
          x: boatX - hullW * 0.08,
          y: boatY + hullH * 0.4,
          vx: (Math.random() - 0.5) * 0.8 - hd * 0.55,
          vy: 0.2 + Math.random() * 0.4,
          life: 1,
          s: 1.1 + Math.random() * 2.6,
        })
      }
      for (let i = foam.length - 1; i >= 0; i--) {
        const p = foam[i]
        p.x += p.vx - 1.55 * power
        p.y += p.vy
        p.life -= 0.0075
        if (p.life <= 0 || p.x < -12) foam.splice(i, 1)
      }
      for (const p of foam) {
        ctx.fillStyle = `rgba(198,222,226,${p.life * 0.5})`
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, p.s * 2.4, p.s * 0.65, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.save()
      ctx.translate(boatX, boatY)
      ctx.rotate(hd * 0.16 + Math.sin(t * 1.55) * 0.016)
      ctx.fillStyle = 'rgba(2,6,10,0.4)'
      ctx.beginPath()
      ctx.ellipse(0, hullH * 0.78, hullW * 0.72, hullH * 0.38, 0, 0, Math.PI * 2)
      ctx.fill()

      const hull = ctx.createLinearGradient(-hullW, 0, hullW, hullH)
      hull.addColorStop(0, '#2a2018')
      hull.addColorStop(0.45, '#14100c')
      hull.addColorStop(1, '#0c0a08')
      ctx.fillStyle = hull
      ctx.beginPath()
      ctx.moveTo(-hullW * 0.54, -hullH * 0.05)
      ctx.quadraticCurveTo(0, hullH * 1.2, hullW * 0.58, 0)
      ctx.quadraticCurveTo(hullW * 0.1, -hullH * 0.42, -hullW * 0.2, -hullH * 0.38)
      ctx.quadraticCurveTo(-hullW * 0.48, -hullH * 0.28, -hullW * 0.54, -hullH * 0.05)
      ctx.fill()
      ctx.strokeStyle = 'rgba(196,165,116,0.55)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.fillStyle = '#2c241c'
      ctx.beginPath()
      ctx.moveTo(-hullW * 0.16, -hullH * 0.18)
      ctx.lineTo(hullW * 0.14, -hullH * 0.16)
      ctx.lineTo(hullW * 0.1, -hullH * 0.78)
      ctx.lineTo(-hullW * 0.08, -hullH * 0.8)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#d4b07a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -hullH * 0.78)
      ctx.lineTo(0, -hullH * (1.9 + power * 0.28))
      ctx.stroke()

      ctx.fillStyle = `rgba(154,184,180,${0.55 + power * 0.3})`
      ctx.beginPath()
      ctx.moveTo(2, -hullH * (1.85 + power * 0.28))
      ctx.lineTo(hullW * (0.34 + power * 0.06), -hullH * 1.05)
      ctx.lineTo(2, -hullH * 0.9)
      ctx.closePath()
      ctx.fill()

      const lamp = ctx.createRadialGradient(-hullW * 0.02, -hullH * 0.46, 0, -hullW * 0.02, -hullH * 0.46, 16)
      lamp.addColorStop(0, 'rgba(255,214,140,0.95)')
      lamp.addColorStop(0.35, 'rgba(196,165,116,0.35)')
      lamp.addColorStop(1, 'rgba(196,165,116,0)')
      ctx.fillStyle = lamp
      ctx.beginPath()
      ctx.arc(-hullW * 0.02, -hullH * 0.46, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f3d9a4'
      ctx.beginPath()
      ctx.arc(-hullW * 0.02, -hullH * 0.46, 2.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      const edge = ctx.createLinearGradient(0, 0, 28, 0)
      edge.addColorStop(0, 'rgba(3,8,12,0.35)')
      edge.addColorStop(1, 'rgba(3,8,12,0)')
      ctx.fillStyle = edge
      ctx.fillRect(0, 0, 28, h)
    }, state)
    return stop
  }, [paused, reduced])

  return (
    <canvas
      ref={ref}
      className="scene-canvas is-live"
      aria-hidden="true"
      onPointerMove={(e) => {
        if (!onHeading) return
        const r = e.currentTarget.getBoundingClientRect()
        onHeading(((e.clientX - r.left) / r.width) * 2 - 1)
      }}
    />
  )
}
