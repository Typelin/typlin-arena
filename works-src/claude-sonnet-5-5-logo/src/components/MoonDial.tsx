import { useCallback, useEffect, useRef, useState } from 'react'
import { bridge, reducedMotion } from '../engine/bridge'

const STEPS = [
  { moon: '新月', t: '听你说', d: '先不动手。把你想做的事、给谁用、卡在哪里，一件一件问清楚，写成一页看得懂的需求。', out: '一页需求说明' },
  { moon: '上弦', t: '画出来', d: '用草图和可点的原型，让想法先有形状。看得见，才好说“这里不对”。', out: '结构草图 / 可点原型' },
  { moon: '盈凸', t: '写出来', d: '开始写代码。每隔一段时间给你看真实可用的版本，而不是最后才揭晓。', out: '可运行的阶段版本' },
  { moon: '满月', t: '交到你手里', d: '上线、验收、讲清楚怎么用。源码和说明一并交付，之后遇到问题也找得到人。', out: '上线版本 + 使用说明' },
]

const CX = 200
const CY = 200
const RR = 160
const START = 150
const SPAN = 240
const pos = (p: number, r = RR) => {
  const a = ((START + (p / 3) * SPAN) * Math.PI) / 180
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

export function MoonDial() {
  const [p, setP] = useState(0)
  const [drag, setDrag] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const raf = useRef(0)
  const pRef = useRef(0)
  const stepRef = useRef(0)
  pRef.current = p
  const step = Math.round(p)

  const burst = useCallback(() => {
    const el = svg.current
    if (!el || !bridge.field) return
    const r = el.getBoundingClientRect()
    bridge.field.shed(r.left + r.width / 2, r.top + r.height / 2, 14)
  }, [])

  useEffect(() => {
    if (stepRef.current !== step) {
      stepRef.current = step
      burst()
    }
  }, [step, burst])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const glide = useCallback((to: number) => {
    cancelAnimationFrame(raf.current)
    if (reducedMotion()) {
      setP(to)
      return
    }
    const tick = () => {
      const cur = pRef.current
      const next = cur + (to - cur) * 0.2
      if (Math.abs(to - next) < 0.004) {
        setP(to)
        return
      }
      setP(next)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  const fromPointer = (e: React.PointerEvent) => {
    const el = svg.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 400 - CX
    const y = ((e.clientY - r.top) / r.height) * 400 - CY
    const deg = (Math.atan2(y, x) * 180) / Math.PI
    const rel = (((deg - START) % 360) + 360) % 360
    let v: number
    if (rel <= SPAN) v = (rel / SPAN) * 3
    else v = rel < 300 ? 3 : 0
    cancelAnimationFrame(raf.current)
    setP(v)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: step + 1,
      ArrowUp: step + 1,
      ArrowLeft: step - 1,
      ArrowDown: step - 1,
      Home: 0,
      End: 3,
    }
    if (e.key in map) {
      e.preventDefault()
      glide(Math.max(0, Math.min(3, map[e.key])))
    }
  }

  const thick = 2 * 70 * (0.14 + (p / 3) * 0.86)
  const h = pos(p)
  const arcA = pos(0)
  const arcB = pos(3)
  const arcP = pos(p)
  const s = STEPS[step]

  return (
    <div className="moon">
      <div className="moon-dial">
        <svg
          ref={svg}
          viewBox="0 0 400 400"
          role="img"
          aria-label={`月相转盘，当前阶段：${s.t}`}
          className={drag ? 'dragging' : ''}
        >
          <defs>
            <mask id="phase">
              <rect width="400" height="400" fill="#000" />
              <circle cx={CX} cy={CY} r="70" fill="#fff" />
              <circle cx={CX - thick} cy={CY} r="70" fill="#000" />
            </mask>
            <radialGradient id="glow">
              <stop offset="0" stopColor="#F0A8C0" stopOpacity="0.5" />
              <stop offset="1" stopColor="#F0A8C0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r={70 + 26 + p * 14} fill="url(#glow)" />
          <circle cx={CX} cy={CY} r="70" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" />
          <g mask="url(#phase)">
            <circle cx={CX} cy={CY} r="70" fill="#f6e9f1" />
            <circle cx={CX + 24} cy={CY - 22} r="9" fill="#e5cfe0" />
            <circle cx={CX + 36} cy={CY + 24} r="6" fill="#e5cfe0" />
            <circle cx={CX + 8} cy={CY + 8} r="4" fill="#e5cfe0" />
          </g>
          <path
            d={`M${arcA.x},${arcA.y} A${RR},${RR} 0 1 1 ${arcB.x},${arcB.y}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={`M${arcA.x},${arcA.y} A${RR},${RR} 0 ${p / 3 > 0.5 ? 1 : 0} 1 ${arcP.x},${arcP.y}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {STEPS.map((st, i) => {
            const m = pos(i)
            const l = pos(i, RR + 30)
            return (
              <g key={st.moon} onClick={() => glide(i)} style={{ cursor: 'pointer' }}>
                <circle cx={m.x} cy={m.y} r="14" fill="transparent" />
                <circle cx={m.x} cy={m.y} r="5" fill={i <= step ? 'var(--accent)' : 'var(--bg)'} stroke="var(--accent)" strokeWidth="2" />
                <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className="dial-label" opacity={i === step ? 1 : 0.55}>
                  {st.moon}
                </text>
              </g>
            )
          })}
          <g
            role="slider"
            tabIndex={0}
            aria-label="服务流程阶段"
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={step + 1}
            aria-valuetext={`${s.moon}：${s.t}`}
            onKeyDown={onKey}
            onPointerDown={(e) => {
              ;(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId)
              setDrag(true)
              fromPointer(e)
            }}
            onPointerMove={(e) => {
              if (drag) fromPointer(e)
            }}
            onPointerUp={() => {
              setDrag(false)
              glide(Math.round(pRef.current))
            }}
            onPointerCancel={() => {
              setDrag(false)
              glide(Math.round(pRef.current))
            }}
            className="dial-handle"
          >
            <circle cx={h.x} cy={h.y} r="26" fill="transparent" />
            <circle cx={h.x} cy={h.y} r="13" fill="#F0A8C0" stroke="#fff" strokeWidth="3" />
            <circle cx={h.x} cy={h.y} r="4" fill="#304878" />
          </g>
        </svg>
      </div>
      <div className="moon-text" aria-live="polite">
        <span className="moon-no">
          {String(step + 1).padStart(2, '0')} / 04 · {s.moon}
        </span>
        <h3>{s.t}</h3>
        <p>{s.d}</p>
        <span className="moon-out">交付：{s.out}</span>
        <div className="moon-steps" role="group" aria-label="跳到某个阶段">
          {STEPS.map((st, i) => (
            <button key={st.moon} type="button" aria-pressed={i === step} onClick={() => glide(i)}>
              {st.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
