import { useEffect, useRef, useState } from 'react'
import { STATS } from '../data/content'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { delay } from '../lib/motion'

function StatValue({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setValue(target)
      return
    }

    let frame = 0
    let started = false

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return
          started = true
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min((now - start) / 1300, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(target * eased))
            if (progress < 1) frame = requestAnimationFrame(step)
          }
          frame = requestAnimationFrame(step)
          observer.disconnect()
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, reduced])

  return <span ref={ref}>{value}</span>
}

export function Stats() {
  return (
    <section className="stats" aria-label="工作室數據">
      <div className="shell stats__grid">
        {STATS.map((stat, index) => (
          <div key={stat.label} className="stat reveal" style={delay(index * 80)}>
            <p className="stat__value">
              <StatValue target={Number(stat.value)} />
              <span className="stat__unit">{stat.unit}</span>
            </p>
            <p className="stat__label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
