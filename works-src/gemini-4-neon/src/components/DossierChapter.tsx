import {
  BENCHMARK_TABLE,
  COMPETITORS,
  CORE_SPECS,
  DOMAIN_SUB_INDICES,
  QUERY_DATE,
  SOURCES,
} from '../data/facts';

export function DossierChapter() {
  return (
    <section
      id="chapter-06"
      className="chapter-dossier"
      aria-labelledby="ch6-title"
    >
      <div className="chapter-inner">
        <div className="chapter-meta-row chapter-meta-row--light">
          <span className="chapter-index">CHAPTER 06 · COMPLETE DOSSIER</span>
          <span className="chapter-specimen-note">
            VERIFIED SPEC &amp; BENCHMARKS · QUERIED {QUERY_DATE}
          </span>
        </div>

        <header className="dossier-header">
          <h2 id="ch6-title" className="chapter-title chapter-title--light">
            完整規格、基準成績與資料來源
          </h2>
          <p className="chapter-lead chapter-lead--light">
            這裡集中列出我查證過的所有公開規格、評測分數、前後名對手比較與出處，未公開或查不到的項目都直接寫明。
          </p>
        </header>

        {/* 1. Core Specifications Grid */}
        <div className="dossier-block">
          <div className="dossier-block-head">
            <span className="dossier-section-tag">01 · BASIC SPECIFICATIONS</span>
            <h3 className="dossier-block-title">基本規格與公開狀態</h3>
          </div>
          <dl className="spec-grid">
            {CORE_SPECS.map((item) => (
              <div key={item.label} className="spec-row">
                <dt className="spec-label">{item.label}</dt>
                <dd className="spec-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 2. Benchmark Scores Table */}
        <div className="dossier-block">
          <div className="dossier-block-head">
            <span className="dossier-section-tag">02 · BENCHMARK SCORES</span>
            <h3 className="dossier-block-title">
              基準成績總表（含版本號、收錄推理強度與查詢日期）
            </h3>
          </div>

          <div className="table-scroll-container" tabIndex={0} aria-label="基準成績表">
            <table className="dossier-table">
              <thead>
                <tr>
                  <th scope="col">評測／指數名稱</th>
                  <th scope="col">版本號</th>
                  <th scope="col">收錄版本名稱（含推理設定）</th>
                  <th scope="col">分數／排名</th>
                  <th scope="col">測評來源</th>
                  <th scope="col">查詢日期</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_TABLE.map((row) => (
                  <tr key={`${row.benchmark}-${row.version}-${row.recordedModel}`}>
                    <td className="td-strong">{row.benchmark}</td>
                    <td className="td-mono">{row.version}</td>
                    <td className="td-mono">{row.recordedModel}</td>
                    <td className="td-score">{row.score}</td>
                    <td>{row.evaluator}</td>
                    <td className="td-mono">{row.queryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Competitor Comparison Table */}
        <div className="dossier-block">
          <div className="dossier-block-head">
            <span className="dossier-section-tag">03 · PEER COMPARISON (AA v5)</span>
            <h3 className="dossier-block-title">
              對手比較表（Artificial Analysis 智慧指數 v5 前一名、後一名與同廠兄弟模型）
            </h3>
            <p className="dossier-block-note">
              查詢日期：{QUERY_DATE}。僅比較各模型皆有公開可核對數字的欄位。
            </p>
          </div>

          <div className="table-scroll-container" tabIndex={0} aria-label="對手比較表">
            <table className="dossier-table dossier-table--compare">
              <thead>
                <tr>
                  <th scope="col">收錄模型版本</th>
                  <th scope="col">關係定位</th>
                  <th scope="col">AA 智慧指數 v5</th>
                  <th scope="col">API 單價（輸入／輸出 per 1M）</th>
                  <th scope="col">輸出速度</th>
                  <th scope="col">上下文長度</th>
                  <th scope="col">輸入／輸出模態</th>
                  <th scope="col">開放權重</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c) => (
                  <tr key={c.id} className={c.isSelf ? 'tr-highlight' : ''}>
                    <td className="td-strong">
                      <div>{c.recordedName}</div>
                      <div className="td-sub">{c.developer}</div>
                    </td>
                    <td>{c.relation}</td>
                    <td className="td-score">
                      {c.aaIndexV5}（{c.aaRank}）
                    </td>
                    <td className="td-mono">
                      ${c.inputPrice.toFixed(2)} / ${c.outputPrice.toFixed(2)}
                    </td>
                    <td className="td-mono">約 {c.outputSpeed} tok/s</td>
                    <td className="td-mono">{c.contextWindow}</td>
                    <td>
                      輸入：{c.inputModalities}
                      <br />
                      輸出：{c.outputModalities}
                    </td>
                    <td>{c.openWeights}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Explicit Separation: Evidence-backed vs Self-described capabilities */}
        <div className="dossier-block">
          <div className="dossier-block-head">
            <span className="dossier-section-tag">04 · CAPABILITY BOUNDARY</span>
            <h3 className="dossier-block-title">
              程式與專業領域能力：明確區分「有數字佐證」與「自身描述」
            </h3>
          </div>

          <div className="evidence-split-grid">
            <div className="evidence-card evidence-card--verified">
              <div className="evidence-card-badge">A · 有公開數字佐證</div>
              <h4 className="evidence-card-title">第三方與官方評測成績</h4>
              <ul className="evidence-list">
                <li>
                  <strong>程式代理與終端機任務：</strong>Artificial Analysis Coding Agent Index 2026-11 版拿下 <strong>58.6 分（全球第 1 名）</strong>；Terminal-Bench 4.0（AA）<strong>63.6%</strong>、Terminal-Bench 4.1（官方）<strong>65.2%</strong>；CursorBench（high）<strong>63.7%</strong>。
                </li>
                <li>
                  <strong>專業知識子指數（AA v5, xhigh）：</strong>
                  {DOMAIN_SUB_INDICES.slice(0, 5)
                    .map((d) => `${d.labelZh} ${d.score}`)
                    .join('、')}
                  。
                </li>
                <li>
                  <strong>科學、數學與自動化：</strong>RiemannBench <strong>84.0%</strong>、HLE-Diamond <strong>71.3%</strong>、Terminal-Bench-Science 0.1 <strong>70.5%</strong>、Zapier AutomationBench <strong>56.3%（第 1 名）</strong>、AA-Omniscience v1.1 <strong>55</strong>。
                </li>
              </ul>
            </div>

            <div className="evidence-card evidence-card--self">
              <div className="evidence-card-badge evidence-card-badge--self">
                B · 自身能力描述（非評測數字）
              </div>
              <h4 className="evidence-card-title">具體做得到 vs 做不到的例子</h4>
              <div className="can-cannot-group">
                <div className="can-box">
                  <h5>具體做得到</h5>
                  <ul>
                    <li>一次讀入數十個前端與後端原始碼檔，根據終端機報錯追蹤跨檔案型別與狀態問題並直接修改。</li>
                    <li>把上百頁財報 PDF、法規條文或實驗紀錄整理成結構化對照表，並在對話中途接受你直接修正方向。</li>
                    <li>針對簡單分類降到 <code>low</code> 檔省錢，碰到棘手架構除錯再升到 <code>xhigh</code> 深挖。</li>
                  </ul>
                </div>
                <div className="cannot-box">
                  <h5>具體做不到</h5>
                  <ul>
                    <li>無法直接輸出一張 PNG 圖片、一段配音 WAV 或剪輯好的 MP4 影片（輸出端只支援文字）。</li>
                    <li>無法在開著 <code>xhigh</code> 時提供毫秒級即時語音對答（首字就要等待約 56 秒）。</li>
                    <li>不靠外部搜尋工具時，無法憑記憶確認 2026 年 3 月之後的新套件 API 或新聞事件。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Centralized Citations */}
        <footer className="dossier-sources">
          <div className="dossier-block-head">
            <span className="dossier-section-tag">05 · DATA SOURCES</span>
            <h3 className="dossier-block-title">資料來源（統一查詢日期：{QUERY_DATE}）</h3>
          </div>
          <ol className="sources-list">
            {SOURCES.map((src) => (
              <li key={src.name} className="source-item">
                <div className="source-name">
                  <a href={src.url} target="_blank" rel="noreferrer">
                    {src.name}
                  </a>
                </div>
                <p className="source-note">{src.note}</p>
              </li>
            ))}
          </ol>

          <div className="dossier-colophon">
            <span>GEMINI 4 NEON · ELEMENT 10 SPECIMEN</span>
            <span>BUILT WITH WEBGL GLSL · CANVAS 2D · SELF-HOSTED TYPOGRAPHY</span>
            <span>GOOGLE DEEPMIND · 2026</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
