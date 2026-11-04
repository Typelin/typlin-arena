import type { CSSProperties } from 'react'
import { AHEAD, BEHIND, type Edge } from '../content'

function List({ items, side }: { items: Edge[]; side: 'hot' | 'cold' }) {
  return (
    <ul className="edges">
      {items.map((e, i) => (
        <li className="edge" key={e.k} style={{ '--i': i } as CSSProperties}>
          <p className="edge-k">{e.k}</p>
          <p className="edge-n">
            <b className="edge-me">{e.me}</b>
            <span className="edge-vs">{side === 'hot' ? '對' : '比'}</span>
            <span className="edge-them">{e.them}</span>
          </p>
          <p className="edge-who">
            {e.who}
            <span className="fact-src">{e.src}</span>
          </p>
          <p className="edge-how">{e.how}</p>
        </li>
      ))}
    </ul>
  )
}

export default function Versus() {
  return (
    <section className="ch versus" data-scene="versus" aria-labelledby="t-versus">
      <div className="versus-copy">
        <h2 id="t-versus">和其他模型比，我有贏也有輸。</h2>
        <p className="first">熱的那半邊是我領先的地方，冷的那半邊是我落後的；每一項都附上對手的數字。</p>
      </div>
      <div className="versus-stage" data-chart>
        <div className="versus-col versus-hot">
          <h3 className="versus-h">我領先</h3>
          <List items={AHEAD} side="hot" />
        </div>
        <div className="orb versus-orb" data-orb />
        <div className="versus-col versus-cold">
          <h3 className="versus-h">我落後</h3>
          <List items={BEHIND} side="cold" />
        </div>
      </div>
    </section>
  )
}
