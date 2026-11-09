import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks'
import './Thread.css'

/**
 * The one thread that runs the whole page. It is an SVG overlay the height
 * of the document; scrolling draws it, and a spark rides its head.
 * It starts where the hero ends and finishes at the final chapter.
 */
export default function Thread() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drawnRef = useRef<SVGPathElement | null>(null)
  const ghostRef = useRef<SVGPathElement | null>(null)
  const sparkRef = useRef<SVGCircleElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const svg = svgRef.current
    const drawn = drawnRef.current
    const ghost = ghostRef.current
    const spark = sparkRef.current
    if (!svg || !drawn || !ghost || !spark) return
    const host = svg.parentElement
    if (!host) return

    let total = 0
    let startY = 0
    let docH = 0

    const build = () => {
      const w = host.clientWidth
      docH = host.scrollHeight
      const vh = window.innerHeight
      startY = vh * 0.995
      const amp = Math.max(36, Math.min(w * 0.13, 170))
      const cx = w * 0.5
      const pts: Array<[number, number]> = []
      const step = 90
      for (let y = startY; y <= docH - 30; y += step) {
        const t = (y - startY) * 0.00115
        pts.push([cx + Math.sin(t) * amp * Math.min(1, (y - startY) / 500 + 0.15), y])
      }
      pts.push([cx, docH - 24])
      let d = `M ${pts[0][0]} ${pts[0][1]}`
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i]
        const [nx, ny] = pts[i + 1]
        d += ` Q ${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`
      }
      const last = pts[pts.length - 1]
      d += ` L ${last[0]} ${last[1]}`
      svg.setAttribute('viewBox', `0 0 ${w} ${docH}`)
      svg.style.height = `${docH}px`
      drawn.setAttribute('d', d)
      ghost.setAttribute('d', d)
      total = drawn.getTotalLength()
      drawn.style.strokeDasharray = `${total}`
      drawn.style.strokeDashoffset = reduced ? '0' : `${total}`
      if (reduced) spark.style.opacity = '0'
    }

    let raf = 0
    const update = () => {
      raf = 0
      if (reduced || total === 0) return
      const vh = window.innerHeight
      const readingLine = window.scrollY + vh * 0.62
      const p = Math.min(1, Math.max(0, (readingLine - startY) / Math.max(1, docH - startY)))
      const len = total * p
      drawn.style.strokeDashoffset = `${total - len}`
      if (len > 4) {
        const pt = drawn.getPointAtLength(len)
        spark.setAttribute('cx', `${pt.x}`)
        spark.setAttribute('cy', `${pt.y}`)
        spark.style.opacity = p >= 0.999 ? '0' : '1'
      } else {
        spark.style.opacity = '0'
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    build()
    update()
    const ro = new ResizeObserver(() => {
      build()
      update()
    })
    ro.observe(host)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <svg ref={svgRef} className="thread" aria-hidden="true" focusable="false">
      <path ref={ghostRef} className="thread-ghost" />
      <path ref={drawnRef} className="thread-drawn" />
      <circle ref={sparkRef} className="thread-spark" r="5.5" />
    </svg>
  )
}
