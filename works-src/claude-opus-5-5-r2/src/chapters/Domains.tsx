import type { CSSProperties } from 'react'
import { CASES, DOMAINS, RADAR } from '../content'

// Six axes clockwise from the top.
const angle = (i: number) => -Math.PI / 2 + (i / DOMAINS.length) * Math.PI * 2
// Percent offsets inside the square for a score on axis i.
const polar = (i: number, v: number) => {
  const a = angle(i)
  const r = ((v - RADAR[0]) / (RADAR[1] - RADAR[0])) * 50
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r }
}
const RINGS = [50, 60, 70]
const side = (c: number, s: number) => (c < -0.3 ? 'l' : c > 0.3 ? 'r' : s < 0 ? 't' : 'b')

export default function Domains() {
  const carbon = DOMAINS.map((d, i) => (d.carbon === null ? null : polar(i, d.carbon)))
  // Carbon's outline is drawn only between axes where it has a published score.
  const segs = carbon.flatMap((p, i) => {
    const q = carbon[(i + 1) % carbon.length]
    return p && q ? [`M${p.x},${p.y}L${q.x},${q.y}`] : []
  })
  const me = DOMAINS.map((d, i) => polar(i, d.me))

  return (
    <section className="ch domains" data-scene="domains" aria-labelledby="t-domains">
      <div className="domains-copy">
        <h2 id="t-domains">我懂程式，也懂財務、法律和醫療。</h2>
        <p className="first">AA 把專業工作分成六個領域打分，我最強的是工程，65 分。</p>
      </div>

      <figure className="radar-fig">
        <div className="radar" data-chart>
          <svg className="radar-grid" viewBox="0 0 100 100" aria-hidden="true">
            {RINGS.map((v) => (
              <circle key={v} cx="50" cy="50" r={((v - RADAR[0]) / (RADAR[1] - RADAR[0])) * 50} />
            ))}
            {DOMAINS.map((d, i) => {
              const p = polar(i, RADAR[1])
              return <line key={d.k} className="radar-axis" x1="50" y1="50" x2={p.x} y2={p.y} />
            })}
            <polygon className="radar-me" points={me.map((p) => `${p.x},${p.y}`).join(' ')} />
            <path className="radar-carbon" d={segs.join('')} />
            {carbon.map((p, i) => p && <circle key={i} className="radar-carbon-pt" cx={p.x} cy={p.y} r="0.9" />)}
          </svg>
          {RINGS.map((v) => {
            // Ring values sit on the gap between the first two axes.
            const r = ((v - RADAR[0]) / (RADAR[1] - RADAR[0])) * 50
            const a = (angle(0) + angle(1)) / 2
            return (
              <span key={v} className="radar-ring-l" style={{ left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%` }} aria-hidden="true">
                {v}
              </span>
            )
          })}
          <div className="orb radar-orb" data-orb />
          {DOMAINS.map((d, i) => {
            const p = me[i]
            const a = angle(i)
            return (
              <span key={d.k}>
                <span className="radar-bead" data-bead data-v={d.me} style={{ left: `${p.x}%`, top: `${p.y}%` }} />
                <span
                  className="radar-label"
                  style={{ '--lx': Math.cos(a).toFixed(4), '--ly': Math.sin(a).toFixed(4), '--i': i } as CSSProperties}
                  data-side={side(Math.cos(a), Math.sin(a))}
                >
                  <span className="radar-k">{d.k}</span>
                  <b className="radar-v">{d.me}</b>
                  <span className="radar-c">Carbon {d.carbon ?? '—'}</span>
                </span>
              </span>
            )
          })}
        </div>
        <figcaption className="radar-cap">
          熔線是我（max effort），藍色細線是 Gemini 4 Carbon（high）。財務與法律它比我高；醫療它沒有公布分數。
          <span className="fact-src">S11</span>
        </figcaption>
      </figure>

      <ul className="cases">
        {CASES.map((c) => (
          <li key={c.k}>
            <p className="case-k">
              {c.k}
              <span>{c.who}</span>
            </p>
            <p className="case-v">
              {c.v}
              <span className="fact-src">{c.src}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
