import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../hooks'

const PHASES = [
  { lit: 0.08, name: '新月', t: '聆聽', d: '一次不趕時間的對話。瞭解你的業務、使用者和那個「夢」到底是什麼。', w: '第 1 週' },
  { lit: 0.3, name: '蛾眉月', t: '構想', d: '資訊架構、原型和視覺方向。先在紙上犯錯，比在程式碼裡犯錯便宜得多。', w: '第 2–3 週' },
  { lit: 0.62, name: '上弦月', t: '打磨', d: '按週迭代開發，每週都能看到能點、能用的版本，而不是最後才揭曉。', w: '第 4–8 週' },
  { lit: 1, name: '滿月', t: '交付與陪伴', d: '上線、培訓、交接文件，然後繼續陪跑：監控、最佳化、長出下一個版本。', w: '長期' },
]

/** Lit region of a moon of radius r for an illuminated fraction f (waxing, lit on the right). */
function litPath(f: number, r: number) {
  const k = Math.cos(f * Math.PI) // +1 new, 0 half, -1 full
  const rx = Math.abs(k) * r
  // back from the bottom: bulge right (crescent) or left (gibbous)
  const sweep = k > 0 ? 0 : 1
  return `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx.toFixed(2)} ${r} 0 0 ${sweep} 0 ${-r} Z`
}

function Moon({ f }: { f: number }) {
  const r = 34
  return (
    <svg className="moon" viewBox="-44 -44 88 88" aria-hidden="true">
      <circle r={r} className="moon-shadow" />
      <path d={litPath(Math.max(0.001, f), r)} fill="url(#moonfill)" />
      <circle r={r} className="moon-rim" />
    </svg>
  )
}

export function Phases() {
  const ref = useRef<HTMLElement>(null)
  const [t, setT] = useState(reducedMotion() ? 1 : 0)

  // the moons wax together once the row is on screen
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        el.dataset.in = ''
        const t0 = performance.now()
        const tick = (now: number) => {
          const x = Math.min(1, (now - t0) / 2200)
          setT(1 - Math.pow(1 - x, 3))
          if (x < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="phases reveal" id="process" ref={ref} aria-labelledby="ph-h" data-in={reducedMotion() || undefined}>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="moonfill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6b3c7" />
            <stop offset="0.55" stopColor="#8e9ad8" />
            <stop offset="1" stopColor="#4a5aa3" />
          </linearGradient>
        </defs>
      </svg>
      <p className="eyebrow">04 · 合作方式</p>
      <h2 id="ph-h">像月亮一樣，一點一點圓滿</h2>
      <ol className="ph-row">
        {PHASES.map((p, i) => (
          <li key={p.name} style={{ '--i': i } as React.CSSProperties}>
            <Moon f={p.lit * t} />
            <p className="ph-name">
              {p.name} · <span>{p.w}</span>
            </p>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
