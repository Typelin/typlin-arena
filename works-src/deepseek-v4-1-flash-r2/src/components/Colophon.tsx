import { SPECS, SOURCES } from '../content'

/**
 * 06 資料：最後一章，把前面每一句的來源都列清楚。
 * 版式做成印刷廠的出貨單。
 */
export default function Colophon() {
  return (
    <section className="chapter colophon" id="ch-colophon">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">06</span>
          <span className="ch-tag mono-sm">資料 / COLOPHON</span>
        </div>

        <div className="colo-head">
          <h2 className="colo-title">
            這張試印本上
            <br />
            每一個數字，都查得到。
          </h2>
          <p className="colo-lede">
            規格與評測取自 DeepSeek 官方發布公告、Hugging Face 模型卡與技術報告。
            查不到的就不寫——這頁沒有推測值。
          </p>
        </div>

        <div className="colo-body">
          <dl className="spec-list">
            {SPECS.map(([k, v]) => (
              <div className="spec" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="src-block">
            <span className="src-label mono-sm">資料來源 · SOURCES</span>
            <ol className="src-list">
              {SOURCES.map((s, i) => (
                <li key={s.url}>
                  <span className="src-no">{String(i + 1).padStart(2, '0')}</span>
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>

            <p className="src-caveat mono-sm">
              查證時間 2026-11-02；數字以官方公告與模型卡為準，未公布的一律標「官方未公開」。
            </p>
          </div>
        </div>

        <div className="colo-foot">
          <span className="mono-sm">試印本 · 2026 · 台北</span>
          <div className="swatches mono-sm">
            <span className="sw sw-b">
              <i />
              #17305A
            </span>
            <span className="sw sw-o">
              <i />
              #E2571F
            </span>
            <span className="mono-sm">× 網線 64 lpi</span>
          </div>
          <span className="mono-sm">DeepSeek V4.1 Flash 自我介紹</span>
        </div>
      </div>
    </section>
  )
}
