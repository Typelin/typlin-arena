import { AA, EXAM_ROWS } from '../content'

/**
 * 03 考卷：官方模型卡把我跟 Opus-5.0、GPT-5.6 Sol、K3、GLM-5.3 排在同一張表上。
 * 每一條畫成一橫列：整條長度＝全表最高分，橘點＝我的位置。
 * 於是「差多少」在二十條之間可以直接用眼睛比，不必換算。
 */

export default function Exam() {
  const wins = EXAM_ROWS.filter((r) => r.lead).length
  const ties = EXAM_ROWS.filter((r) => r.tie).length
  const losses = EXAM_ROWS.length - wins - ties
  const aaPos = (AA.index / 50) * 100
  const aaMedian = (AA.median / 50) * 100

  return (
    <section className="chapter exam" id="ch-exam">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">03</span>
          <span className="ch-tag mono-sm">考卷 / THE EXAM</span>
        </div>

        <div className="exam-top">
          <div className="exam-lead">
            <h2 className="ch-title">
              <span className="ln">同一張桌子，</span>
              <span className="ln">我不總是坐主位。</span>
            </h2>
            <p className="ch-first">
              官方模型卡把我跟 Opus-5.0、GPT-5.6 Sol、K3、GLM-5.3 排在同一張表，十九條考卷。
            </p>
            <p className="ch-body prose">
              我贏 {wins} 條、並列 {ties} 條、輸 {losses} 條。贏的多半是「動手做完」，輸的多半是「知道得多」。
            </p>
          </div>

          <div className="exam-tally">
            <div
              className="tally-bar"
              role="img"
              aria-label={`十九條考卷：贏 ${wins} 條、並列 ${ties} 條、輸 ${losses} 條`}
            >
              {EXAM_ROWS.map((r) => (
                <i
                  key={r.name}
                  className={r.lead ? 'is-win' : r.tie ? 'is-tie' : 'is-loss'}
                  title={`${r.name}：${r.mine}`}
                />
              ))}
            </div>
            <div className="tally-key mono-sm">
              <span>
                <b>{String(wins).padStart(2, '0')}</b> 贏
              </span>
              <span>
                <b>{String(ties).padStart(2, '0')}</b> 並列
              </span>
              <span>
                <b>{String(losses).padStart(2, '0')}</b> 輸
              </span>
            </div>
            <p className="tally-note">
              一條一格，照輸贏高低排。這不是平均值——是我跟四個對手一題一題數出來的。
            </p>
          </div>
        </div>

        <ol className="exam-list">
          {EXAM_ROWS.map((r) => {
            const rel = (r.mine / r.best) * 100
            const gap = r.best - r.mine
            return (
              <li
                className="exam-row"
                key={r.name}
                data-kind={r.lead ? 'win' : r.tie ? 'tie' : 'loss'}
              >
                <span className="ex-band mono-sm">{r.band}</span>
                <span className="ex-name">
                  {r.name}
                  <em className="mono-sm">{r.metric}</em>
                </span>
                <span className="ex-track" aria-hidden="true">
                  <i className="ex-fill" style={{ width: `${rel}%` }} />
                  <b className="ex-mine" style={{ left: `${rel}%` }} />
                </span>
                <span className="ex-num">
                  {r.mine}
                  <em className="mono-sm">
                    {r.lead
                      ? '全表第一'
                      : r.tie
                        ? `並列第一 · 同 ${r.bestBy}`
                        : `差 ${gap.toFixed(1)} 分 · ${r.bestBy} 最高`}
                  </em>
                </span>
              </li>
            )
          })}
        </ol>

        <p className="exam-source mono-sm">
          條長＝該列全表最高分，橘點＝我的分數。十九條取自 Hugging Face 模型卡「Comparison with frontier models」，全部是 max reasoning effort、temperature 1.0、top_p 0.95。
        </p>

        {/* Artificial Analysis 的獨立評測 */}
        <div className="aa-block">
          <div className="aa-left">
            <p className="aa-kicker mono-sm">獨立評測 · ARTIFICIAL ANALYSIS v5.0.1</p>
            <p className="aa-big">
              <b>{AA.index}</b>
              <span className="aa-of mono-sm">／ 100</span>
            </p>
            <p className="aa-cap">
              Intelligence Index {AA.index}，同級中位數 {AA.median}；在 AA 的同級比較裡排第一。
              九項加權：知識工作、代理自動化、終端、程式、科學、常識與幻覺率。
            </p>
          </div>

          <div className="aa-meter">
            <div className="aa-scale" role="img" aria-label={`Intelligence Index ${AA.index}，同級中位數 ${AA.median}`}>
              <span className="aa-fill" style={{ width: `${aaPos}%` }} />
              <span className="aa-median" style={{ left: `${aaMedian}%` }}>
                <em className="mono-sm">同級中位 {AA.median}</em>
              </span>
              <span className="aa-now" style={{ left: `${aaPos}%` }}>
                <em className="mono-sm">我 {AA.index}</em>
              </span>
            </div>
            <dl className="aa-facts">
              <div>
                <dt className="mono-sm">輸出速度</dt>
                <dd>
                  {AA.speed} <span>tok/s</span>
                </dd>
              </div>
              <div>
                <dt className="mono-sm">首字延遲</dt>
                <dd>
                  {AA.ttft} <span>s</span>
                </dd>
              </div>
              <div>
                <dt className="mono-sm">每題成本</dt>
                <dd>$ {AA.costTask}</dd>
              </div>
              <div>
                <dt className="mono-sm">思考量</dt>
                <dd>
                  {AA.tokens} <span>（中位 {AA.tokenMedian}）</span>
                </dd>
              </div>
            </dl>
            <p className="aa-warn mono-sm">
              AA 自己標了一句：思考量偏多。分數高，有一部分是用更多 token 換來的。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
