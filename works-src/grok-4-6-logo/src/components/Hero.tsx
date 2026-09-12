import { useRef, type PointerEvent } from 'react'
import { HERO } from '../data/content'
import { useReducedMotion } from '../hooks/media'
import { bloomAt } from './Garden'
import { Logo } from './Logo'

export function Hero() {
  const gate = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  const tilt = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced) return
    const el = gate.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ty', `${x * 8}deg`)
    el.style.setProperty('--tx', `${-y * 8}deg`)
  }

  const reset = () => {
    const el = gate.current
    if (!el) return
    el.style.setProperty('--ty', '0deg')
    el.style.setProperty('--tx', '0deg')
  }

  const push = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    bloomAt(r.left + r.width / 2, r.top + r.height * 0.42)
  }

  return (
    <section className="hero" id="top">
      <p className="hero-eye">
        <span>信息科技工作室</span>
        <i />
        <span>SAKIMU TECH STUDIO</span>
      </p>

      <h1 className="sr-only">咲梦信息科技工作室</h1>

      <button
        ref={gate}
        type="button"
        className="hero-gate"
        aria-label="推开月洞门，让花园从标志里过来"
        onPointerMove={tilt}
        onPointerLeave={reset}
        onClick={push}
      >
        <span className="gate-glow" aria-hidden="true" />
        <span className="gate-ring" aria-hidden="true" />
        <Logo variant="lockup" alt="咲梦信息科技工作室标志：樱花与代码环成月洞门" className="hero-logo" />
        <span className="hero-push">点一下。门会开。花会从圆里过来。</span>
      </button>

      <p className="hero-koan">{HERO.koan}</p>
      <p className="hero-aside">{HERO.aside}</p>

      <div className="hero-cta">
        <a className="btn btn-ink" href="#name">
          {HERO.ctaEnter}
        </a>
        <a className="btn btn-ghost" href="#letter">
          {HERO.ctaWrite}
        </a>
      </div>

      <a className="hero-scroll" href="#name" aria-label="向下">
        <span>SCROLL</span>
        <i />
      </a>
    </section>
  )
}
