import { useEffect, useRef } from 'react'
import logo from '../assets/logo.png'
import { reducedMotion } from '../hooks'
import { burstAt } from '../petals'

/* Positions inside the 800×800 logo artwork. */
const RING = { cx: 400, cy: 312, r: 196 }
const FLOWER = { x: 240, y: 318 }

export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)

  // the emblem opens with a bloom from its own flower
  useEffect(() => {
    if (reducedMotion()) return
    const t = setTimeout(() => {
      const el = stage.current
      if (!el) return
      const r = el.getBoundingClientRect()
      burstAt(r.left + (FLOWER.x / 800) * r.width, r.top + (FLOWER.y / 800) * r.height, 26, 1.1)
    }, 1300)
    return () => clearTimeout(t)
  }, [])

  // gentle 3D tilt toward the pointer
  useEffect(() => {
    if (reducedMotion() || matchMedia('(pointer: coarse)').matches) return
    const el = tilt.current
    if (!el) return
    let raf = 0
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    const loop = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      el.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0
    }
    const on = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5
      ty = e.clientY / innerHeight - 0.5
      if (!raf) raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', on, { passive: true })
    return () => {
      removeEventListener('pointermove', on)
      cancelAnimationFrame(raf)
    }
  }, [])

  const bloom = (e: React.MouseEvent | React.KeyboardEvent) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if ('clientX' in e && e.clientX) burstAt(e.clientX, e.clientY, 22)
    else burstAt(r.left + (FLOWER.x / 800) * r.width, r.top + (FLOWER.y / 800) * r.height, 22)
  }

  return (
    <header className="hero" id="top">
      <svg className="hero-moon" viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <linearGradient id="moonline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3a5bd" />
            <stop offset="0.6" stopColor="#7e8fd0" />
            <stop offset="1" stopColor="#b9b2e6" />
          </linearGradient>
        </defs>
        <circle cx="500" cy="500" r="470" fill="none" stroke="url(#moonline)" strokeWidth="1" opacity="0.35" />
        <path d="M500 60 A440 440 0 1 0 940 500" fill="none" stroke="url(#moonline)" strokeWidth="2" opacity="0.3" />
      </svg>

      <div className="hero-stage" ref={stage}>
        <div className="hero-tilt" ref={tilt}>
          <svg className="hero-orbits" viewBox="0 0 800 800" aria-hidden="true">
            <g className="orbit orbit-a">
              <circle cx={RING.cx} cy={RING.cy} r={RING.r + 34} fill="none" stroke="url(#moonline)" strokeWidth="1.4" strokeDasharray="2 10" strokeLinecap="round" />
            </g>
            <g className="orbit orbit-b">
              <circle cx={RING.cx} cy={RING.cy} r={RING.r + 62} fill="none" stroke="#f2b6c8" strokeWidth="1" strokeDasharray="120 40 6 40" opacity="0.7" />
              <path className="orbit-star" d="M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9Z" fill="#7f90d2" transform={`translate(${RING.cx + RING.r + 62} ${RING.cy})`} />
            </g>
            <g className="orbit orbit-c">
              <circle className="petal-dot" cx={RING.cx - RING.r - 34} cy={RING.cy} r="4" fill="#f3a5bd" />
            </g>
          </svg>
          <button className="hero-logo" type="button" onClick={bloom} aria-label="咲夢信息科技工作室標誌，點選讓花瓣飄落">
            <img src={logo} alt="咲夢信息科技工作室 SAKIMU TECH STUDIO —— 用代碼創造美好未來" width={800} height={800} fetchPriority="high" />
          </button>
        </div>
      </div>

      <div className="hero-copy">
        <p className="hero-tag">
          一間小而用心的資訊科技工作室
          <span aria-hidden="true"> · </span>
          <br className="br-m" />
          官網 / 小程式 / 業務系統 / 互動動效
        </p>
        <div className="hero-actions">
          <a className="btn btn-ink" href="#bloom">
            看一段程式碼開花
          </a>
          <a className="btn btn-line" href="#wish">
            許一個夢
          </a>
        </div>
      </div>

      <a className="scroll-cue" href="#name" aria-label="向下滾動">
        <span />
      </a>
    </header>
  )
}
