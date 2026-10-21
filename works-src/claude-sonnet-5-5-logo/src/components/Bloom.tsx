import { useRef, useState } from 'react'
import { shedFrom } from '../engine/bridge'

const SERVICES = [
  { t: '网站与小程序', d: '官网、活动页、小程序。从第一屏的气质开始，把想说的话放到该在的位置。', open: 0.38 },
  { t: '应用与系统', d: '后台、管理工具、内部系统。先把流程梳理清楚，再写成稳当好用的程序。', open: 0.62 },
  { t: '自动化与 AI 接入', d: '把重复的事交给代码，把合适的模型接进现有产品，边界和成本都讲明白。', open: 0.82 },
  { t: '上线之后的照看', d: '修问题、调体验、小步迭代。做完不是结束，是花开之后的修剪。', open: 1 },
]

const PETAL = 'M0,0 C-22,-18 -32,-52 -13,-80 L0,-69 L13,-80 C32,-52 22,-18 0,0Z'

export function Bloom() {
  const [idx, setIdx] = useState(0)
  const [held, setHeld] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const open = held ? 1.14 : SERVICES[idx].open

  const press = () => setHeld(true)
  const release = () => {
    if (!held) return
    setHeld(false)
    shedFrom(btn.current, 16)
  }

  return (
    <div className="bloom">
      <div className="bloom-art">
        <button
          ref={btn}
          type="button"
          className="flower"
          aria-label="按住让花完全盛开，松开时花瓣会落下"
          aria-pressed={held}
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault()
              press()
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') release()
          }}
        >
          <svg viewBox="-110 -110 220 220" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="0" y2="-1">
                <stop offset="0" stopColor="#F090A8" />
                <stop offset="1" stopColor="#F8D4DF" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={PETAL}
                fill="url(#pg)"
                stroke="#F090A8"
                strokeWidth="1"
                style={{
                  transform: `rotate(${i * 72 + (1 - open) * 14}deg) scale(${0.52 + open * 0.48}, ${0.3 + open * 0.7})`,
                }}
              />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const a = (i / 7) * Math.PI * 2 + 0.3
              const L = 10 + open * 24
              return (
                <g key={i} style={{ opacity: 0.25 + open * 0.75 }}>
                  <line x1="0" y1="0" x2={Math.cos(a) * L} y2={Math.sin(a) * L} stroke="#304878" strokeWidth="1.2" />
                  <circle cx={Math.cos(a) * L} cy={Math.sin(a) * L} r="2.4" fill="#304878" />
                </g>
              )
            })}
            <circle r="5" fill="#F0A8C0" />
          </svg>
        </button>
        <p className="hint">按住花朵，让它开到最盛</p>
      </div>
      <ul className="services">
        {SERVICES.map((s, i) => (
          <li key={s.t}>
            <button
              type="button"
              className="svc"
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
              onMouseEnter={() => setIdx(i)}
              onFocus={() => setIdx(i)}
            >
              <span className="svc-n">0{i + 1}</span>
              <span className="svc-b">
                <strong>{s.t}</strong>
                <span>{s.d}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
