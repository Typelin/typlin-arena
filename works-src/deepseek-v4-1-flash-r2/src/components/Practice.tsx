import { PRACTICE } from '../content'

/**
 * 07 手感：同一個模型，在不同專業裡不是同一個名次。
 * 右邊那條尺只有三段：落後、中段、領先。橘點停在哪，就是我在那一行專業裡的位置。
 */

const LEVEL: Record<string, number> = {
  lead: 84,
  mid: 52,
  behind: 24,
  na: 46,
}

const VERDICT: Record<string, string> = {
  lead: '領先',
  mid: '中段',
  behind: '落後',
  na: '沒有尺',
}

export default function Practice() {
  return (
    <section className="chapter practice" id="ch-practice">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">07</span>
          <span className="ch-tag mono-sm">手感 / IN PRACTICE</span>
        </div>

        <div className="pr-head">
          <h2 className="ch-title">
            <span className="ln">換一種專業，</span>
            <span className="ln">我就換一個名次。</span>
          </h2>
          <div className="pr-lede">
            <p>
              分數不是一個總分，是一排抽屜。有些抽屜我拉得開，有些拉不開。
            </p>
            <p>
              下面每一格都寫了三件事：我在哪裡、別人在哪裡、差在哪一種能力上。
            </p>
          </div>
        </div>

        <ol className="pr-list">
          {PRACTICE.map((p, i) => (
            <li className="pr-item" key={p.key} data-kind={p.kind}>
              <span className="pr-no mono-sm">{String(i + 1).padStart(2, '0')}</span>

              <div className="pr-main">
                <div className="pr-top">
                  <h3 className="pr-label">{p.label}</h3>
                  <span className="pr-en mono-sm">{p.en}</span>
                </div>
                <p className="pr-headline">{p.headline}</p>
                <p className="pr-best mono-sm">{p.best}</p>
                <p className="pr-note">{p.note}</p>
              </div>

              <div className="pr-gauge" aria-hidden="true">
                <span className="pr-verdict mono-sm">{VERDICT[p.kind]}</span>
                <span className="pr-axis">
                  <i className="pr-fill" style={{ width: `${LEVEL[p.kind]}%` }} />
                  <i className="pr-tick" />
                  <i className="pr-tick" />
                  <b style={{ left: `${LEVEL[p.kind]}%` }} />
                </span>
                <span className="pr-ends mono-sm">
                  <em>落後</em>
                  <em>中間</em>
                  <em>領先</em>
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="pr-foot">
          <p className="pr-foot-lead mono-sm">如果只能帶一句話走，帶這句</p>
          <p className="pr-foot-big">
            <span className="ln">我比較像一個很會動手的人，</span>
            <span className="ln ln-2">不是一個什麼都懂的人。</span>
          </p>
          <p className="pr-foot-note mono-sm">
            這不是謙虛。上面十九條考卷裡我輸掉的那些，剛好都是「知道」比「做」重要的題目。
          </p>
        </div>
      </div>
    </section>
  )
}
