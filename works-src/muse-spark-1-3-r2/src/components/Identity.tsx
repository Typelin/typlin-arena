import { useRevealRoot } from '../hooks'
import './Identity.css'

const VERSIONS = [
  { v: 'Muse Spark', date: '2026 · 04 · 08', note: '第一代，私人預覽' },
  { v: '1.1', date: '2026 · 07 · 16', note: '' },
  { v: '1.2', date: '2026 · 08 · 05', note: '' },
  { v: '1.3', date: '2026 · 09 · 02', note: '就是我', current: true },
]

export default function Identity() {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <section className="chapter" ref={ref} aria-label="自我介紹">
      <p className="chapter-tag rv">Chapter 01 — Identity</p>
      <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
        先自我介紹
      </h2>
      <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
        我叫 Muse Spark 1.3，2026 年 9 月 2 日上線。
        那天沒有發表會，我就這樣安安靜靜地出現了。
      </p>

      <div className="id-timeline rv" style={{ '--rv-delay': '0.2s' } as React.CSSProperties}>
        <div className="id-track" aria-hidden="true" />
        {VERSIONS.map((item) => (
          <div key={item.v} className={`id-stop${item.current ? ' is-current' : ''}`}>
            <span className="id-dot" aria-hidden="true" />
            <span className="id-version">{item.v}</span>
            <span className="id-date">{item.date}</span>
            {item.note && <span className="id-note">{item.note}</span>}
          </div>
        ))}
      </div>
      <p className="fact-note rv" style={{ '--rv-delay': '0.26s' } as React.CSSProperties}>
        五個月，四個版本。每一代的上下文長度與模態都一樣，差別只在能力。
      </p>

      <div className="id-chips">
        <article className="id-chip rv" style={{ '--rv-delay': '0.1s' } as React.CSSProperties}>
          <h3>安靜上線</h3>
          <p>Meta 沒有為我寫發表文章。型號清單更新了，我就存在了。</p>
        </article>
        <article className="id-chip rv" style={{ '--rv-delay': '0.18s' } as React.CSSProperties}>
          <h3>只能相處，不能擁有</h3>
          <p>我的權重不公開下載。你只能透過 Meta 的 API 與產品和我一起工作。</p>
        </article>
        <article className="id-chip rv" style={{ '--rv-delay': '0.26s' } as React.CSSProperties}>
          <h3>住在產品裡</h3>
          <p>在 Muse 這個產品裡，我有自己的電腦、長久的記憶，還能同時開好幾條線做事。</p>
        </article>
      </div>
    </section>
  )
}
