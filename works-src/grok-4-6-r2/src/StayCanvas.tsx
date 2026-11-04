import { useEffect, useRef } from 'react'
import { attachCanvas } from './canvas'
import type { DrawState } from './canvas'
import type { Effort } from './facts'
import { useDocumentHidden, useReducedMotion } from './hooks'

const POWER: Record<Effort, number> = { low: 0.4, medium: 0.7, high: 1, xhigh: 1.4 }

export function StayCanvas({ heading, effort }: { heading: number; effort: Effort }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const headingRef = useRef(heading)
  const effortRef = useRef(effort)
  const reduced = useReducedMotion()
  const paused = useDocumentHidden()
  headingRef.current = heading
  effortRef.current = effort

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const state: DrawState = { reduced, paused }
    const stop = attachCanvas(canvas, (ctx, w, h, t) => {
      state.reduced = reduced
      state.paused = paused
      const hd = headingRef.current
      const power = POWER[effortRef.current]

      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#061018')
      g.addColorStop(0.4, '#0a1c28')
      g.addColorStop(1, '#03080c')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      const cx = w * 0.5 + hd * w * 0.08
      ctx.save()
      ctx.translate(cx, h * 0.08)
      ctx.rotate(hd * 0.06)
      for (let i = 0; i < 46; i++) {
        const p = i / 45
        const y = p * h * 1.08 + Math.sin(t * 1.3 + i * 0.18) * 5
        const spread = 8 + p * w * 0.38 * power
        const a = (1 - p) * 0.22 * power
        ctx.fillStyle = `rgba(186, 220, 224, ${a})`
        ctx.beginPath()
        ctx.moveTo(-spread, y)
        ctx.lineTo(spread, y)
        ctx.lineTo(spread * 0.32, y + h * 0.028)
        ctx.lineTo(-spread * 0.32, y + h * 0.028)
        ctx.fill()
      }
      ctx.fillStyle = '#e8d3a4'
      ctx.beginPath()
      ctx.moveTo(0, -10)
      ctx.lineTo(9, 16)
      ctx.lineTo(-9, 16)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }, state)
    return stop
  }, [paused, reduced])

  return <canvas ref={ref} className="scene-canvas" aria-hidden="true" />
}
