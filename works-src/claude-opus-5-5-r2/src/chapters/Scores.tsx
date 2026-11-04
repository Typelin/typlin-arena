import type { CSSProperties } from 'react'
import { BENCH } from '../content'

export default function Scores() {
  return (
    <section className="ch scores" data-scene="scores" aria-labelledby="t-scores">
      <div className="scores-head">
        <h2 id="t-scores">
          官方的 <b className="num">9</b> 項測驗，我拿下 <b className="num">7</b> 項第一。
        </h2>
        <p className="first">熔金流到的位置是我的分數，藍白刻線是該項最強的對手。輸掉的兩項也在這裡。</p>
      </div>
      <div className="bars-wrap">
        <div className="bars-axis" aria-hidden="true">
          <span className="bars-axis-in">
            {[0, 25, 50, 75, 100].map((v) => (
              <span key={v} style={{ left: `${v}%` }}>
                {v}
              </span>
            ))}
          </span>
        </div>
        <ol className="bars">
          {BENCH.map((b, i) => {
            const win = b.me > b.rv
            return (
              <li
                className="bar"
                key={b.name}
                data-lose={win ? undefined : ''}
                style={{ '--i': i, '--me': b.me, '--rv': b.rv } as CSSProperties}
              >
                <p className="bar-name">
                  <span className="bar-zh">{b.zh}</span>
                  <span className="bar-en">{b.name}</span>
                </p>
                <div className="bar-track" data-bar data-me={b.me} data-rv={b.rv} aria-hidden="true">
                  <span className="bar-fill" />
                  <span className="bar-tick" />
                </div>
                <p className="bar-val">
                  <b className="bar-me">{b.me.toFixed(1)}</b>
                  <span className="bar-rv">
                    {win ? '勝過' : '輸給'} {b.rival} 的 {b.rv.toFixed(1)}
                  </span>
                </p>
              </li>
            )
          })}
        </ol>
      </div>
      <p className="scores-note">
        單位是百分比。第 9 項 GDPval-AA 以 Elo 計分：我 1846，Claude Fable 5.1 是 1735。對手只算官方表上列出的模型；官方也提醒，到了這個水準，分數差距已不太能代表實際使用的差距。
        <span className="fact-src">S1</span>
      </p>
    </section>
  )
}
