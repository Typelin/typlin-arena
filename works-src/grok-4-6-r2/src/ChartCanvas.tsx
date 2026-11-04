import { useEffect, useRef } from 'react'
import { attachCanvas } from './canvas'
import type { DrawState } from './canvas'
import { useDocumentHidden, useReducedMotion } from './hooks'

type Buoy = { name: string; short: string; score: number; self?: boolean }

const BUOYS: Buoy[] = [
  { name: 'Opus 5 max', short: 'Opus 5', score: 63 },
  { name: 'Fable 5 max', short: 'Fable 5', score: 62 },
  { name: 'Grok 4.6 high', short: '4.6', score: 61, self: true },
  { name: 'Sol max', short: 'Sol', score: 61 },
  { name: 'Grok 4.5 high', short: '4.5', score: 56 },
]

export function ChartCanvas({ heading }: { heading: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const headingRef = useRef(heading)
  const reduced = useReducedMotion()
  const paused = useDocumentHidden()
  headingRef.current = heading

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const state: DrawState = { reduced, paused }
    const min = 54
    const max = 65
    const stop = attachCanvas(canvas, (ctx, w, h, t) => {
      state.reduced = reduced
      state.paused = paused
      const narrow = w < 560

      const fog = ctx.createLinearGradient(0, 0, 0, h)
      fog.addColorStop(0, '#1a2e24')
      fog.addColorStop(0.42, '#101c16')
      fog.addColorStop(1, '#050806')
      ctx.fillStyle = fog
      ctx.fillRect(0, 0, w, h)

      const mist = ctx.createRadialGradient(w * 0.5, h * 0.18, 8, w * 0.5, h * 0.12, w * 0.7)
      mist.addColorStop(0, 'rgba(186,210,190,0.18)')
      mist.addColorStop(1, 'rgba(186,210,190,0)')
      ctx.fillStyle = mist
      ctx.fillRect(0, 0, w, h)

      const waterY = h * 0.84
      const water = ctx.createLinearGradient(0, waterY, 0, h)
      water.addColorStop(0, '#1c3c2c')
      water.addColorStop(1, '#050806')
      ctx.fillStyle = water
      ctx.fillRect(0, waterY, w, h - waterY)

      ctx.strokeStyle = 'rgba(120,160,140,0.18)'
      ctx.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        const y = waterY + ((t * 12 + i * 34) % Math.max(20, h - waterY))
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x <= w; x += 28) ctx.lineTo(x, y + Math.sin(x * 0.028 + t + i) * 2)
        ctx.stroke()
      }

      const n = BUOYS.length
      const left = w * 0.08
      const span = w * 0.84
      const drift = headingRef.current * (narrow ? 2 : 6)
      BUOYS.forEach((b, i) => {
        const x = left + ((i + 0.5) / n) * span + drift
        const plotTop = h * 0.12
        const plotBottom = h * 0.48
        const top = plotTop + ((max - b.score) / (max - min)) * (plotBottom - plotTop)
        const bob = Math.sin(t * 1.5 + i * 0.9) * 4
        const y = top + bob

        ctx.strokeStyle = b.self ? 'rgba(196,165,116,0.8)' : 'rgba(126,180,160,0.38)'
        ctx.lineWidth = b.self ? 2.4 : 1.15
        ctx.beginPath()
        ctx.moveTo(x, y + 12)
        ctx.lineTo(x + Math.sin(t + i) * 2.5, waterY + 6)
        ctx.stroke()

        ctx.fillStyle = 'rgba(4,10,8,0.4)'
        ctx.beginPath()
        ctx.ellipse(x, waterY + 10, 16, 5, 0, 0, Math.PI * 2)
        ctx.fill()

        const body = ctx.createLinearGradient(x - 10, y, x + 10, y + 32)
        body.addColorStop(0, b.self ? '#e8d3a4' : '#9ecfc4')
        body.addColorStop(1, b.self ? '#8a6a38' : '#2a5a52')
        ctx.fillStyle = body
        ctx.beginPath()
        ctx.moveTo(x - 10, y + 8)
        ctx.lineTo(x + 10, y + 8)
        ctx.lineTo(x + 6, y + 30)
        ctx.lineTo(x - 6, y + 30)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = b.self ? '#c4a574' : '#7ec8c3'
        ctx.beginPath()
        ctx.arc(x, y, b.self ? 11 : 7, 0, Math.PI * 2)
        ctx.fill()

        if (b.self) {
          ctx.strokeStyle = `rgba(232,211,164,${0.5 + Math.sin(t * 2) * 0.2})`
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(x, y, 18, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.textAlign = 'center'
        ctx.fillStyle = b.self ? '#f6edd8' : 'rgba(230,236,228,0.92)'
        ctx.font = b.self
          ? '700 20px "IBM Plex Mono", ui-monospace, monospace'
          : '600 14px "IBM Plex Mono", ui-monospace, monospace'
        ctx.fillText(String(b.score), x, y - 18)
        ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'
        ctx.fillStyle = 'rgba(214,201,176,0.9)'
        ctx.fillText(narrow ? b.short : b.name, x, y + 46)
      })
      ctx.textAlign = 'left'
    }, state)
    return stop
  }, [paused, reduced])

  return <canvas ref={ref} className="scene-canvas" aria-hidden="true" />
}
