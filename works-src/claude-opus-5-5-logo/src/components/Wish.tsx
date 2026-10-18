import { useEffect, useMemo, useRef, useState } from 'react'
import { reducedMotion } from '../hooks'

interface Star {
  id: number
  text: string
  x: number
  y: number
  mine?: boolean
}

const KEY = 'sakimu-wishes'
const PRESET: Star[] = [
  { id: -1, text: '讓小店的預約不再靠電話', x: 14, y: 30 },
  { id: -2, text: '一個會呼吸的品牌官網', x: 27, y: 62 },
  { id: -3, text: '排班表不用再熬夜做', x: 46, y: 22 },
  { id: -4, text: '讓奶奶也能順手用的小程式', x: 63, y: 70 },
  { id: -5, text: '把資料變成一眼能懂的圖', x: 82, y: 40 },
]

function load(): Star[] {
  try {
    const raw = localStorage.getItem(KEY)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v.filter((s) => typeof s?.text === 'string').slice(-24) : []
  } catch {
    return []
  }
}

function save(stars: Star[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stars))
  } catch {
    /* storage unavailable: wishes simply do not persist */
  }
}

/** A free spot in the sky, away from the existing stars. */
function place(stars: Star[]) {
  let best = { x: 50, y: 50 }
  let bestD = -1
  for (let i = 0; i < 40; i++) {
    const x = 8 + Math.random() * 84
    const y = 12 + Math.random() * 70
    const d = Math.min(...stars.map((s) => Math.hypot((s.x - x) * 1.6, s.y - y)), 999)
    if (d > bestD) {
      bestD = d
      best = { x, y }
    }
  }
  return best
}

const SPARK = 'M0 -10 C1.2 -2.4 2.4 -1.2 10 0 C2.4 1.2 1.2 2.4 0 10 C-1.2 2.4 -2.4 1.2 -10 0 C-2.4 -1.2 -1.2 -2.4 0 -10 Z'

export function Wish() {
  const [mine, setMine] = useState<Star[]>(() => load())
  const [text, setText] = useState('')
  const [flying, setFlying] = useState<Star | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [said, setSaid] = useState('')
  const sky = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const flyer = useRef<HTMLDivElement>(null)

  const stars = useMemo(() => [...PRESET, ...mine], [mine])
  // a fixed field of background stars
  const dust = useMemo(() => {
    let s = 7
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 90 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.4 + rnd() * 1.3, d: rnd() * 6 }))
  }, [])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const t = text.trim().slice(0, 24)
    if (!t || flying) return
    const star: Star = { id: Date.now(), text: t, ...place(stars), mine: true }
    setText('')
    if (reducedMotion()) {
      land(star)
      return
    }
    setFlying(star)
  }

  const land = (star: Star) => {
    setMine((m) => {
      const next = [...m, star].slice(-24)
      save(next)
      return next
    })
    setFlying(null)
    setFocus(star.id)
    setSaid(`你的夢「${star.text}」已經掛上夜空。`)
  }

  // fly the wish from the input up to its spot, turning from words into a petal into a star
  useEffect(() => {
    if (!flying) return
    const el = flyer.current
    const box = sky.current?.getBoundingClientRect()
    const from = input.current?.getBoundingClientRect()
    if (!el || !box || !from) {
      land(flying)
      return
    }
    const sx = from.left + 24 - box.left
    const sy = from.top + from.height / 2 - box.top
    const tx = (flying.x / 100) * box.width
    const ty = (flying.y / 100) * box.height
    const mx = (sx + tx) / 2 + (tx > sx ? -1 : 1) * box.width * 0.18
    const my = Math.min(sy, ty) - box.height * 0.12
    const a = el.animate(
      [
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 0 },
        { transform: `translate(${sx}px, ${sy - 30}px) scale(1)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${mx}px, ${my}px) scale(0.7) rotate(160deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.35) rotate(320deg)`, opacity: 1 },
      ],
      { duration: 2100, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' },
    )
    a.onfinish = () => land(flying)
    return () => a.cancel()
  }, [flying])

  const line = mine.map((s) => `${s.x},${s.y}`).join(' ')
  const shown = stars.find((s) => s.id === focus)

  return (
    <section className="wish" id="wish" aria-labelledby="wish-h">
      <div className="wish-head">
        <p className="eyebrow">05 · 許一個夢</p>
        <h2 id="wish-h">把想做的事，掛到夜空上</h2>
        <p className="wish-lede">寫下一個你想實現的東西。它會化成一片花瓣飛上去，成為一顆星。（只儲存在你自己的瀏覽器裡，不會傳送到任何地方。）</p>
      </div>

      <div className="sky" ref={sky}>
        <div className="sky-dust" aria-hidden="true">
          {dust.map((d, i) => (
            <i key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.r * 2, height: d.r * 2, animationDelay: `${-d.d}s` }} />
          ))}
        </div>
        <svg className="sky-moon" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="nightmoon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffd2df" />
              <stop offset="1" stopColor="#9fa9ec" />
            </linearGradient>
          </defs>
          <path d="M128 18 A86 86 0 1 0 182 150 A70 70 0 1 1 128 18 Z" fill="url(#nightmoon)" />
        </svg>
        <svg className="sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {mine.length > 1 && <polyline points={line} />}
        </svg>
        <ul className="stars" aria-label="夜空中的夢">
          {stars.map((s) => (
            <li key={s.id} style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <button
                type="button"
                className="star"
                data-mine={s.mine || undefined}
                data-on={focus === s.id || undefined}
                aria-label={`夢：${s.text}`}
                onPointerEnter={() => setFocus(s.id)}
                onFocus={() => setFocus(s.id)}
                onClick={() => setFocus(s.id)}
              >
                <svg viewBox="-12 -12 24 24" aria-hidden="true">
                  <path d={SPARK} />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        {shown && (
          <p className="star-tip" style={{ left: `${Math.min(68, Math.max(32, shown.x))}%`, top: `${shown.y}%` }} aria-hidden="true">
            {shown.text}
          </p>
        )}
        {flying && (
          <div className="flyer" ref={flyer} aria-hidden="true">
            <span className="flyer-text">{flying.text}</span>
            <span className="flyer-petal" />
          </div>
        )}
      </div>

      <form className="wish-form" onSubmit={send}>
        <label htmlFor="wish-in" className="sr-only">
          你的夢
        </label>
        <input
          id="wish-in"
          ref={input}
          value={text}
          maxLength={24}
          onChange={(e) => setText(e.target.value)}
          placeholder="例如：讓我的花店能線上預訂"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-moon" disabled={!text.trim() || !!flying}>
          放飛
        </button>
      </form>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>

      <div className="cta">
        <h3>把你的夢，交給咲夢</h3>
        <p>說說你想做的東西。我們會在兩個工作日內回覆，第一次聊天不收費。</p>
        <a className="btn btn-dawn" href="mailto:hello@sakimu.studio?subject=%E6%88%91%E6%9C%89%E4%B8%80%E4%B8%AA%E6%A2%A6">
          hello@sakimu.studio
        </a>
      </div>
    </section>
  )
}
