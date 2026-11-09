import { useEffect, useRef, useState } from 'react'
import { MODEL } from '../data'
import { usePrefersReducedMotion } from '../hooks'
import './Hero.css'

const MAX_PULL = 190

type Winding = { rx: number; ry: number; rot: number; o: number; vermilion: boolean }

/** Thirty turns of one thread, wound into a skein. Deterministic. */
const WINDINGS: Winding[] = Array.from({ length: 30 }, (_, i) => {
  const t = i / 29
  const rx = 54 + t * 184
  return {
    rx,
    ry: rx * (0.86 + 0.05 * Math.sin(i * 1.9 + 1)),
    rot: ((i * 137.5) % 44) - 22,
    o: 0.1 + 0.2 * t,
    vermilion: i >= 27,
  }
})
const INNER = WINDINGS.slice(0, 24)
const OUTER = WINDINGS.slice(24)

/**
 * Poster first screen. The whole context window sits at the right as one
 * wound skein of thread; its loose end hangs down with a handle. Pulling
 * the end unwinds the skein a little and counts out tokens — the page
 * below is the rest of that same line, laid out straight.
 */
export default function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const skeinRef = useRef<HTMLDivElement | null>(null)
  const spinRef = useRef<SVGGElement | null>(null)
  const outerRef = useRef<SVGGElement | null>(null)
  const curveRef = useRef<SVGPathElement | null>(null)
  const strainRef = useRef<SVGPathElement | null>(null)
  const handleRef = useRef<SVGGElement | null>(null)
  const countRef = useRef<HTMLSpanElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const [touched, setTouched] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const stage = stageRef.current
    const curve = curveRef.current
    const strainPath = strainRef.current
    const handle = handleRef.current
    if (!stage || !curve || !strainPath || !handle) return

    let dragging = false
    let pull = 0 // px beyond rest
    let velocity = 0
    let raf = 0
    let lastPointerY = 0

    /** Loose-end exit point on the skein's lower-left rim, in stage coords. */
    const exitPoint = () => {
      const s = stage.getBoundingClientRect()
      const el = skeinRef.current
      if (!el) return { x: s.width * 0.72, y: 90 }
      const r = el.getBoundingClientRect()
      return {
        x: r.left - s.left + r.width * 0.14,
        y: r.top - s.top + r.height * 0.64,
      }
    }

    const render = () => {
      const w = stage.clientWidth
      const exit = exitPoint()
      const hx = exit.x - Math.min(96, w * 0.07)
      const hang = w < 640 ? 72 : 116
      const hy = exit.y + hang + pull
      const d = `M ${exit.x} ${exit.y} C ${exit.x - 34} ${exit.y + 52}, ${hx - 30} ${hy - 58}, ${hx} ${hy}`
      curve.setAttribute('d', d)
      strainPath.setAttribute('d', d)
      const strain = pull / MAX_PULL
      strainPath.style.strokeDasharray = `${Math.max(0.02, strain)} 1`
      handle.setAttribute('transform', `translate(${hx} ${hy})`)
      if (spinRef.current) {
        spinRef.current.style.transform = `rotate(${(-16 * strain).toFixed(2)}deg) scale(${(1 - 0.05 * strain).toFixed(3)})`
      }
      if (outerRef.current) {
        outerRef.current.style.opacity = `${1 - strain * 0.9}`
      }
      if (countRef.current) {
        const tokens = Math.floor(Math.pow(strain, 1.12) * MODEL.contextTokens)
        countRef.current.textContent = tokens.toLocaleString('en-US')
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${strain})`
      }
    }

    const spring = () => {
      // critically-damped-ish spring back to rest, with a little overshoot
      const stiffness = 0.085
      const damping = 0.78
      velocity = (velocity + (0 - pull) * stiffness) * damping
      pull += velocity
      if (Math.abs(pull) < 0.15 && Math.abs(velocity) < 0.15) {
        pull = 0
        velocity = 0
        render()
        raf = 0
        return
      }
      render()
      raf = requestAnimationFrame(spring)
    }

    const localY = (clientY: number) => {
      const rect = stage.getBoundingClientRect()
      return clientY - rect.top
    }

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastPointerY = localY(e.clientY)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      handle.setPointerCapture?.(e.pointerId)
      setTouched(true)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const y = localY(e.clientY)
      const dy = y - lastPointerY
      lastPointerY = y
      pull = Math.min(MAX_PULL, Math.max(0, pull + dy * 1.15))
      velocity = 0
      render()
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      if (reduced) {
        pull = 0
        render()
        return
      }
      if (!raf) raf = requestAnimationFrame(spring)
    }

    const onResize = () => render()

    render()
    const settle = requestAnimationFrame(render)
    handle.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('resize', onResize)
    return () => {
      handle.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(settle)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <header className="hero">
      <div className="hero-top">
        <span>TYPELIN ARENA · 同題展廳</span>
        <span>新題目組 · 參賽作品</span>
      </div>

      <div className="hero-main">
        <p className="hero-kicker">
          <span className="hero-kicker-name">關於你自己</span>
          <span className="hero-kicker-sub">A SELF-INTRODUCTION IN ONE THREAD</span>
        </p>
        <h1 className="hero-title" aria-label="Muse Spark 1.3">
          <span className="hero-title-line">MUSE</span>
          <span className="hero-title-line">
            SPARK <span className="hero-version">1.3</span>
          </span>
        </h1>
        <p className="hero-byline">
          <span className="hero-work-title">《一線到底》</span>
          <span className="hero-maker">Meta 出品</span>
        </p>
        <p className="hero-lede">
          我是 Meta 做的模型，專門陪人把長活做完。
          <br />
          這一頁只有一條線，從頭到尾，正好一百萬個 token 長。
        </p>
      </div>

      <div className="hero-pull" ref={stageRef}>
        <div className="hero-skein" ref={skeinRef} aria-hidden="true">
          <div className="hero-skein-shadow" />
          <svg className="hero-skein-svg" viewBox="-260 -260 520 520">
            <g ref={spinRef} className="hero-skein-spin">
              <g>
                {INNER.map((wd, i) => (
                  <ellipse
                    key={i}
                    className="hero-winding"
                    rx={wd.rx}
                    ry={wd.ry}
                    transform={`rotate(${wd.rot})`}
                    style={{ strokeOpacity: wd.o }}
                  />
                ))}
              </g>
              <g ref={outerRef}>
                {OUTER.map((wd, i) => (
                  <ellipse
                    key={i}
                    className={`hero-winding${wd.vermilion ? ' is-vermilion' : ''}`}
                    rx={wd.rx}
                    ry={wd.ry}
                    transform={`rotate(${wd.rot})`}
                    style={{ strokeOpacity: wd.vermilion ? 0.6 : wd.o }}
                  />
                ))}
              </g>
            </g>
          </svg>
        </div>
        <svg className="hero-pull-svg" aria-hidden="true">
          <path ref={curveRef} className="hero-curve" pathLength={1} />
          <path ref={strainRef} className="hero-strain" pathLength={1} />
          <g ref={handleRef} className="hero-handle">
            <circle className="hero-handle-ring" r="17" />
            <circle className="hero-handle-dot" r="7" />
          </g>
        </svg>
        <div className="hero-pull-meta">
          <p className={`hero-pull-hint${touched ? ' is-done' : ''}`}>
            抓住線頭，往下拉
          </p>
          <p className="hero-pull-count">
            <span ref={countRef}>0</span>
            <span className="hero-pull-total"> / {MODEL.contextLabel} TOKENS</span>
          </p>
          <div className="hero-pull-bar">
            <div ref={barRef} className="hero-pull-bar-fill" />
          </div>
        </div>
      </div>

      <p className="hero-scroll">往下滑，線會繼續 ↓</p>
    </header>
  )
}
