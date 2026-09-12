import { useEffect, useRef, useState } from 'react'
import { BRAND, HERO } from '../data/content'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { delay, parallax } from '../lib/motion'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`

export function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced) return
    if (window.matchMedia('(hover: none)').matches) return

    let frame = 0
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        setTilt({
          x: Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 0.9))),
          y: Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 0.9))),
        })
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <section className="hero" id="top">
      <div className="hero__wash" aria-hidden="true" />
      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="eyebrow reveal">{HERO.kicker}</p>

          <h1 className="hero__title reveal" style={delay(80)}>
            {HERO.title[0]}
            <br />
            <span className="hero__title-em">{HERO.title[1]}</span>
          </h1>

          <p className="hero__lead reveal" style={delay(160)}>
            {HERO.lead}
          </p>

          <div className="hero__actions reveal" style={delay(240)}>
            <a className="btn btn--solid" href="#contact">
              {HERO.primaryCta}
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a className="btn btn--ghost" href="#works">
              {HERO.secondaryCta}
            </a>
          </div>

          <div className="hero__meta reveal" style={delay(320)}>
            <span>
              <span className="petal-dot" aria-hidden="true" /> {BRAND.address.split(' ')[0]}
            </span>
            <span className="hero__meta-sep" aria-hidden="true" />
            <span>{BRAND.tagline}</span>
          </div>
        </div>

        <div className="hero__stage reveal" ref={stageRef} style={delay(120)}>
          <div className="hero__glow" aria-hidden="true" />

          <svg className="hero__orbit" viewBox="0 0 420 420" aria-hidden="true">
            <defs>
              <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f0a0b6" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#7e8fcb" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2b3a6b" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <circle
              cx="210"
              cy="210"
              r="196"
              fill="none"
              stroke="url(#orbitGrad)"
              strokeWidth="1"
              strokeDasharray="3 9"
            />
            <circle
              cx="210"
              cy="210"
              r="166"
              fill="none"
              stroke="#c2cbe8"
              strokeWidth="0.8"
              strokeDasharray="1 7"
            />
          </svg>

          <figure className="hero__card" style={parallax(tilt.x, tilt.y)}>
            <img
              className="hero__logo"
              src={LOGO_SRC}
              alt="咲夢信息科技工作室 LOGO"
              width={800}
              height={800}
              decoding="async"
            />
          </figure>

          <span className="hero__seal" aria-hidden="true">
            {HERO.seal}
          </span>
        </div>
      </div>

      <div className="hero__scroll shell" aria-hidden="true">
        <span className="hero__scroll-label">SCROLL</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
