import { useSyncExternalStore, type CSSProperties } from 'react'
import { AA_RIVALS, AA_X, AA_Y, EFFORT_LEVELS } from '../content'
import { effortStore } from '../effort'

const px = (cost: number) => ((Math.log(cost) - Math.log(AA_X[0])) / (Math.log(AA_X[1]) - Math.log(AA_X[0]))) * 100
const py = (v: number) => (1 - (v - AA_Y[0]) / (AA_Y[1] - AA_Y[0])) * 100
const X_TICKS = [0.25, 1, 4, 16]
const Y_TICKS = [35, 45, 55]
// Label side per bead, chosen so labels clear the rival lines.
const POS = ['r', 'r', 'r', 'tl', 'r']
// Where each rival's name sits: which point of its line, and on which side.
const TAGS: Record<string, { pt: number; pos: string }> = {
  carbon: { pt: 2, pos: 'tl' },
  astra: { pt: 0, pos: 'l' },
  sol: { pt: 4, pos: 't' },
  fable: { pt: 0, pos: 'b' },
}

export default function Index() {
  const level = useSyncExternalStore(effortStore.subscribe, effortStore.get)
  const cur = EFFORT_LEVELS[level]

  return (
    <section className="ch aa" data-scene="aa" aria-labelledby="t-aa">
      <div className="aa-copy">
        <h2 id="t-aa">
          第三方的 <span className="nb">AA 智慧指數：</span>
          <span className="nb">
            我 <b className="num">59</b> 分，排第二。
          </span>
        </h2>
        <p className="first">Artificial Analysis 用 9 項測驗打分，第一名是 Gemini 4 Carbon 的 60 分。圖上越高越聰明，越右越貴。</p>
        <div className="aa-read" aria-live="polite">
          <p className="aa-read-k">
            <strong>{cur.id}</strong>
            <b className="aa-read-n">{cur.aa}</b>
            <span>分 · 每題 {cur.cost.toFixed(2)} 美元</span>
          </p>
          <p className="aa-read-v">{cur.vs}</p>
        </div>
        <p className="aa-hint">點圖上的熔珠切換 effort，上一章的旋鈕也會跟著動。</p>
      </div>

      <figure className="aa-fig">
        <div className="aa-plot" data-chart>
          <span className="aa-ax aa-ax-y" aria-hidden="true">
            智慧指數 ↑
          </span>
          <span className="aa-ax aa-ax-x" aria-hidden="true">
            每題成本（對數刻度）→
          </span>
          {Y_TICKS.map((v) => (
            <span className="aa-gy" key={v} style={{ top: `${py(v)}%` }} aria-hidden="true">
              <span>{v}</span>
            </span>
          ))}
          {X_TICKS.map((c) => (
            <span className="aa-gx" key={c} style={{ left: `${px(c)}%` }} aria-hidden="true">
              <span>${c}</span>
            </span>
          ))}
          <svg className="aa-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {AA_RIVALS.map((s) => (
              <polyline key={s.label} className={`aa-line aa-${s.label}`} points={s.pts.map(([c, v]) => `${px(c)},${py(v)}`).join(' ')} />
            ))}
            <polyline className="aa-line aa-me-line" points={EFFORT_LEVELS.map((l) => `${px(l.cost)},${py(l.aa)}`).join(' ')} />
          </svg>
          {AA_RIVALS.map((s) =>
            s.pts.map(([c, v], i) => (
              <span
                key={`${s.label}${i}`}
                className={`aa-dot aa-${s.label}`}
                style={{ left: `${px(c)}%`, top: `${py(v)}%`, '--x': px(c) } as CSSProperties}
                aria-hidden="true"
              />
            )),
          )}
          {AA_RIVALS.map((s) => {
            const t = TAGS[s.label]
            const [c, v] = s.pts[t.pt]
            return (
              <span
                key={s.label}
                className={`aa-tag aa-${s.label}`}
                data-pos={t.pos}
                style={{ left: `${px(c)}%`, top: `${py(v)}%`, '--x': px(c) } as CSSProperties}
                aria-hidden="true"
              >
                {s.name}
              </span>
            )
          })}
          {EFFORT_LEVELS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              className="aa-bead"
              data-bead
              data-pos={POS[i]}
              aria-pressed={i === level}
              aria-label={`Claude Opus 5.5 ${l.id}：${l.aa} 分，每題 ${l.cost.toFixed(2)} 美元`}
              onClick={() => effortStore.set(i)}
              style={{ left: `${px(l.cost)}%`, top: `${py(l.aa)}%`, '--x': px(l.cost) } as CSSProperties}
            >
              <span className="aa-bead-l" aria-hidden="true">
                {l.id}
              </span>
            </button>
          ))}
        </div>
        <figcaption className="aa-cap">
          熔金的線是我的五個 effort 等級，其他線是別的模型，每個點是一個 effort 等級。縱軸是 AA 智慧指數 v5.0.1，橫軸是跑一題的平均花費（美元）。2026 年 11 月 4 日查詢。
          <span className="fact-src">S9 S11</span>
        </figcaption>
      </figure>
    </section>
  )
}
