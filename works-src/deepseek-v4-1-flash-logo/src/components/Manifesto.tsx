import { MANIFESTO } from '../data/content'
import { delay } from '../lib/motion'

export function Manifesto() {
  return (
    <section className="section manifesto" id="manifesto">
      <div className="shell manifesto__grid">
        <div className="manifesto__copy">
          <p className="eyebrow reveal">{MANIFESTO.eyebrow}</p>
          <h2 className="section-title reveal" style={delay(70)}>
            {MANIFESTO.title}
          </h2>

          <div className="manifesto__body">
            {MANIFESTO.paragraphs.map((text, index) => (
              <p key={text} className="reveal" style={delay(140 + index * 90)}>
                {text}
              </p>
            ))}
          </div>

          <p className="manifesto__sign reveal" style={delay(430)}>
            <span className="manifesto__sign-line" aria-hidden="true" />
            咲夢工作室 · 全體三人
          </p>
        </div>

        <div className="manifesto__panel reveal" style={delay(200)}>
          <div className="manifesto__panel-head">
            <span className="manifesto__dot" aria-hidden="true" />
            <span className="manifesto__dot" aria-hidden="true" />
            <span className="manifesto__dot" aria-hidden="true" />
            <span className="manifesto__panel-title">sakimu — build</span>
          </div>

          <div className="manifesto__log">
            {MANIFESTO.buildLog.map((line, index) => (
              <p
                key={line.text}
                className={`manifesto__line reveal is-${line.kind}`}
                style={delay(260 + index * 170)}
              >
                {line.kind === 'bloom' && <span className="manifesto__bloom" aria-hidden="true" />}
                {line.text}
              </p>
            ))}
          </div>

          <p className="manifesto__panel-foot">每一次交付，都從這行指令開始。</p>
        </div>
      </div>
    </section>
  )
}
