import { useState } from 'react'
import { SEASON } from '../data/content'
import { bloomAt } from './Garden'
import { Reveal } from './Reveal'

export function Season() {
  const [idx, setIdx] = useState(2)
  const stage = SEASON.stages[idx] ?? SEASON.stages[0]

  return (
    <Reveal as="section" className="section season-sec" id="season">
      <p className="kicker">
        <span>{SEASON.kicker}</span>
        <i />
        BLOOM WINDOW
      </p>
      <h2>{SEASON.title}</h2>
      <p className="lead">{SEASON.lead}</p>

      <div className="season-layout">
        <ol className="season-tabs">
          {SEASON.stages.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={i === idx ? 'is-on' : ''}
                onClick={(e) => {
                  setIdx(i)
                  const r = e.currentTarget.getBoundingClientRect()
                  bloomAt(r.left + r.width / 2, r.top)
                }}
              >
                <small>{s.en}</small>
                <strong>{s.name}</strong>
                <span>{s.days}</span>
              </button>
            </li>
          ))}
        </ol>

        <article className="season-panel" key={stage.id}>
          <Branch stage={idx} />
          <h3>
            {stage.name}
            <em>{stage.days}</em>
          </h3>
          <p>{stage.body}</p>
        </article>
      </div>
    </Reveal>
  )
}

function Branch({ stage }: { stage: number }) {
  const fills = [
    ['#f3d5c8', '#f3d5c8', '#f3d5c8', '#f3d5c8'],
    ['#f4a7c1', '#f3d5c8', '#f3d5c8', '#f3d5c8'],
    ['#f4a7c1', '#e889a8', '#f4a7c1', '#f3d5c8'],
    ['#f4a7c1', '#e889a8', '#f4a7c1', '#d97b96'],
  ]
  const fallen = stage === 3
  const c = fills[stage] ?? fills[0]

  return (
    <svg className="branch" viewBox="0 0 280 90" aria-hidden="true">
      <path
        d="M8 70 C 70 72, 90 40, 140 46 S 210 22, 268 18"
        fill="none"
        stroke="#3d4c8c"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M92 58 C 100 48, 118 42, 128 28" fill="none" stroke="#5b6db5" strokeWidth="1.4" />
      <path d="M168 40 C 176 28, 188 24, 198 12" fill="none" stroke="#5b6db5" strokeWidth="1.4" />
      <Flower cx={128} cy={26} fill={c[0] ?? '#f4a7c1'} drop={fallen} />
      <Flower cx={198} cy={12} fill={c[1] ?? '#f4a7c1'} drop={fallen} />
      <Flower cx={232} cy={22} fill={c[2] ?? '#f4a7c1'} drop={fallen} />
      <Flower cx={268} cy={16} fill={c[3] ?? '#f4a7c1'} drop={fallen} />
    </svg>
  )
}

function Flower({ cx, cy, fill, drop }: { cx: number; cy: number; fill: string; drop: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={drop ? 0.45 : 1}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-7"
          rx="4.2"
          ry="7.2"
          fill={fill}
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="2.2" fill="#fff6f0" />
    </g>
  )
}
