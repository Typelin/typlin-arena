import { WORKS } from '../data/content'
import { delay } from '../lib/motion'

export function Works() {
  return (
    <section className="section works" id="works">
      <div className="shell">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow reveal">SELECTED WORKS</p>
            <h2 className="section-title reveal" style={delay(70)}>
              做過的一些東西
            </h2>
          </div>
          <p className="section-lead reveal" style={delay(140)}>
            少數可以公開的案例。其餘的，客戶希望安靜地被使用就好。
          </p>
        </div>

        <ul className="works__list">
          {WORKS.map((work, index) => (
            <li
              key={work.title}
              className={`work work--${work.tone} reveal`}
              style={delay(index * 80)}
            >
              <div className="work__meta">
                <span className="work__year">{work.year}</span>
                <span className="work__kind">{work.kind}</span>
              </div>

              <div className="work__main">
                <h3 className="work__title">{work.title}</h3>
                <p className="work__body">{work.body}</p>
              </div>

              <div className="work__result">
                <span className="work__metric">{work.metric}</span>
                <span className="work__arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </li>
          ))}
        </ul>

        <p className="works__note reveal">
          <span className="petal-dot" aria-hidden="true" />
          想知道某一件的技術細節？來信問，我們很樂意講。
        </p>
      </div>
    </section>
  )
}
