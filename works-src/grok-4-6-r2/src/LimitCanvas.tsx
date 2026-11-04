import { useEffect, useRef } from 'react'
import { attachCanvas } from './canvas'
import type { DrawState } from './canvas'
import { useDocumentHidden, useReducedMotion } from './hooks'

export function LimitCanvas({ heading, lit }: { heading: number; lit: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const headingRef = useRef(heading)
  const litRef = useRef(lit)
  const reduced = useReducedMotion()
  const paused = useDocumentHidden()
  headingRef.current = heading
  litRef.current = lit

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const state: DrawState = { reduced, paused }
    const labels = ['權重', '輸出', '終端', '時事']
    const stop = attachCanvas(canvas, (ctx, w, h, t) => {
      state.reduced = reduced
      state.paused = paused
      const rust = ctx.createLinearGradient(0, 0, w, h)
      rust.addColorStop(0, '#1c100c')
      rust.addColorStop(0.55, '#120804')
      rust.addColorStop(1, '#070402')
      ctx.fillStyle = rust
      ctx.fillRect(0, 0, w, h)

      const rivet = 9
      for (let i = 0; i < rivet; i++) {
        const y = ((i / rivet) * h + headingRef.current * 8) % h
        ctx.fillStyle = i % 2 === 0 ? 'rgba(48,24,16,0.45)' : 'rgba(28,14,10,0.35)'
        ctx.fillRect(0, y, w, h / rivet + 6)
      }

      const n = 4
      const cols = 2
      const rows = Math.ceil(n / cols)
      const padX = w * 0.1
      const padY = h * 0.1
      const cellW = (w - padX * 2) / cols
      const cellH = (h - padY * 2) / rows

      for (let i = 0; i < n; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const cx = padX + (col + 0.5) * cellW + headingRef.current * 5
        const cy = padY + (row + 0.5) * cellH + Math.sin(t * 0.6 + i) * 3
        const r = Math.min(cellW, cellH) * 0.32
        const on = litRef.current === i

        ctx.beginPath()
        ctx.arc(cx, cy, r + 10, 0, Math.PI * 2)
        ctx.fillStyle = on ? 'rgba(72,28,18,0.95)' : 'rgba(28,14,10,0.9)'
        ctx.fill()
        ctx.strokeStyle = on ? 'rgba(196,92,72,0.85)' : 'rgba(196,165,116,0.22)'
        ctx.lineWidth = on ? 3 : 1.4
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = on ? '#2a100c' : '#120806'
        ctx.fill()

        if (on) {
          const lamp = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 2, cx, cy, r)
          lamp.addColorStop(0, 'rgba(196,92,72,0.55)')
          lamp.addColorStop(1, 'rgba(196,92,72,0)')
          ctx.fillStyle = lamp
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = on ? '#f6edd8' : 'rgba(196,165,116,0.55)'
        ctx.font = '12px "IBM Plex Mono", ui-monospace, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`0${i + 1}`, cx, cy - 4)
        ctx.fillText(labels[i], cx, cy + 14)
      }
    }, state)
    return stop
  }, [paused, reduced])

  return <canvas ref={ref} className="scene-canvas" aria-hidden="true" />
}
