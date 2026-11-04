import { useEffect, useRef } from 'react'
import { attachCanvas } from './canvas'
import type { DrawState } from './canvas'
import { useDocumentHidden, useReducedMotion } from './hooks'

export function ContextCanvas({ zoom }: { zoom: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const zoomRef = useRef(zoom)
  const reduced = useReducedMotion()
  const paused = useDocumentHidden()
  zoomRef.current = zoom

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const state: DrawState = { reduced, paused }
    const rings = [
      { t: 0.08, label: '1k', color: 'rgba(126,200,195,0.4)' },
      { t: 0.22, label: '32k', color: 'rgba(126,200,195,0.45)' },
      { t: 0.4, label: '200k', color: 'rgba(196,165,116,0.9)' },
      { t: 1, label: '500k', color: 'rgba(232,211,164,0.85)' },
    ]
    const stop = attachCanvas(canvas, (ctx, w, h, t) => {
      state.reduced = reduced
      state.paused = paused
      const z = zoomRef.current
      ctx.fillStyle = '#05080c'
      ctx.fillRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.46
      const maxR = Math.min(w, h) * (0.12 + z * 0.3)

      const voidG = ctx.createRadialGradient(cx, cy, 6, cx, cy, maxR * 1.2)
      voidG.addColorStop(0, '#16384c')
      voidG.addColorStop(0.4, '#0a1824')
      voidG.addColorStop(1, '#020406')
      ctx.fillStyle = voidG
      ctx.beginPath()
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
      ctx.fill()

      rings.forEach((ring) => {
        const r = maxR * ring.t
        if (r < 8) return
        ctx.strokeStyle = ring.color
        ctx.lineWidth = ring.t === 0.4 ? 2.4 : ring.t === 1 ? 1.6 : 1
        ctx.setLineDash(ring.t === 0.4 || ring.t === 1 ? [] : [5, 7])
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = ring.color
        ctx.font = '12px "IBM Plex Mono", ui-monospace, monospace'
        if (ring.t === 1) {
          ctx.textAlign = 'center'
          ctx.fillText(ring.label, cx, Math.max(22, cy - r - 10))
        } else if (ring.t === 0.4) {
          ctx.textAlign = 'left'
          ctx.fillText(ring.label, cx + r + 8, cy + 4)
        } else if (ring.t === 0.22) {
          ctx.textAlign = 'right'
          ctx.fillText(ring.label, cx - r - 8, cy + 4)
        }
      })

      const boat = Math.max(1.6, 18 * (1 - z * 0.9))
      ctx.save()
      ctx.translate(cx + Math.sin(t) * (1 - z) * 3, cy)
      ctx.fillStyle = z > 0.82 ? '#c4a574' : '#e8d3a4'
      ctx.beginPath()
      ctx.moveTo(0, -boat)
      ctx.lineTo(boat * 0.7, boat * 0.55)
      ctx.lineTo(-boat * 0.7, boat * 0.55)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }, state)
    return stop
  }, [paused, reduced])

  return <canvas ref={ref} className="scene-canvas" aria-hidden="true" />
}
