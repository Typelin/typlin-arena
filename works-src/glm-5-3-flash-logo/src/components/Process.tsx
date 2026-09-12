import Reveal from './Reveal'
import SecHead from './SecHead'

const STEPS = [
  { no: '壹', t: '聆聽', d: '需求訪談、目標拆解，把模糊的想望寫成清楚的第一頁。', w: '1–2 週' },
  { no: '貳', t: '播種', d: '資訊架構、視覺方向與原型，先看見，再決定。', w: '1–3 週' },
  { no: '參', t: '生長', d: '設計與工程並行，每週可見的進度與可點的版本。', w: '3–8 週' },
  { no: '肆', t: '盛開', d: '測試、上線、移交與培訓，陪產品走完最後一里路。', w: '1–2 週' },
]

export default function Process() {
  return (
    <section className="sec" id="process">
      <div className="wrap">
        <SecHead no="04" zh="流程" en="PROCESS" lead="四個季節，一趟花期。每一步你都看得見。" />
        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.no} delay={i * 110} className="step">
              <div className="step-head">
                <span className="step-no">{s.no}</span>
                <h3>{s.t}</h3>
                <span className="step-week">{s.w}</span>
              </div>
              <p>{s.d}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="quote-block">
          <blockquote>
            好產品不是澆一次水就開花的。
            <br />
            我們習慣在上線之後，繼續陪著澆水。
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}
