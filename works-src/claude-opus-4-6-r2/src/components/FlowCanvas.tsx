import { useEffect, useRef, useCallback } from 'react'
import { FlowField } from '../engine/field.ts'

interface Props {
  currentLook: string
  reducedMotion: boolean
}

export default function FlowCanvas({ currentLook, reducedMotion }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<FlowField | null>(null)
  const frameRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => {
    const cvs = ref.current; if (!cvs) return
    const ff = new FlowField(cvs, 2200, reducedMotion)
    fieldRef.current = ff

    const onResize = () => ff.resize()
    window.addEventListener('resize', onResize)

    lastRef.current = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now
      ff.tick(dt)
      if (!reducedMotion) frameRef.current = requestAnimationFrame(loop)
    }

    if (reducedMotion) {
      for (let i = 0; i < 120; i++) ff.tick(0.016)
    } else {
      frameRef.current = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [reducedMotion])

  useEffect(() => {
    fieldRef.current?.setLook(currentLook)
  }, [currentLook])

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    fieldRef.current?.setMouse(e.clientX - r.left, e.clientY - r.top, true)
  }, [])
  const onLeave = useCallback(() => {
    fieldRef.current?.setMouse(-1, -1, false)
  }, [])

  return (
    <div
      className="flow-canvas"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ pointerEvents: 'auto' }}
    >
      <canvas ref={ref} aria-hidden="true" style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
