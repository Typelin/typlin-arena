import React from 'react';
import {
  AA_DOMAIN_INDEXES,
  AA_INDEX_VERSION,
  AA_PEER_COMPARISONS,
  AA_SUB_EVALUATIONS,
  DEEPMIND_MODEL_CARD_BENCHMARKS,
  EFFORT_LEVELS,
  EffortKey,
  QUERY_DATE,
  SOURCES_LIST,
} from '../data/hydrogenData';

const EFFORT_KEYS: EffortKey[] = ['xhigh', 'high', 'medium', 'low'];

export const VerificationDossier: React.FC = () => {
  return (
    <section
      id="verification-dossier"
      style={{
        position: 'relative',
        backgroundColor: '#060A13',
        color: 'var(--ink-light)',
        paddingBlock: 'clamp(72px, 10vh, 128px)',
      }}
    >
      <div className="container-wide">
        <div style={{ marginBottom: '36px' }}>
          <div className="chapter-eyebrow" style={{ color: '#22D3EE' }}>
            07 / COMPLETE DOSSIER · BENCHMARKS &amp; SOURCES
          </div>
          <h2 className="chapter-title">完整成績單、對手比較與資料來源</h2>
          <p className="chapter-lead" style={{ color: '#AFC2D6' }}>
            以下所有數字均於 {QUERY_DATE} 自 Artificial Analysis 與 Google DeepMind 官方文件實測頁面讀取，不推測、不補算。
          </p>
        </div>

        {/* 1. Model Identity & Disclosed Specs */}
        <div className="dossier-block">
          <div className="dossier-header">
            <h3>1. 模型基本資料與揭露狀態</h3>
            <span className="font-mono dossier-tag">查詢日期：{QUERY_DATE}</span>
          </div>
          <div className="spec-grid">
            <div className="spec-cell">
              <div className="spec-k">正式名稱</div>
              <div className="spec-v">Gemini 4 Hydrogen (<code className="font-mono">gemini-4-hydrogen</code>)</div>
            </div>
            <div className="spec-cell">
              <div className="spec-k">開發者與發布日期</div>
              <div className="spec-v">Google DeepMind · 2026 年 11 月 12 日</div>
            </div>
            <div className="spec-cell">
              <div className="spec-k">參數規模與模型架構</div>
              <div className="spec-v">衍生適配自 Gemini 4 Carbon；具體參數量與架構細節：<strong style={{ color: '#F59E0B' }}>官方未公開</strong></div>
            </div>
            <div className="spec-cell">
              <div className="spec-k">上下文視窗與輸出上限</div>
              <div className="spec-v">1,000,000 tokens 統一視窗（預設同步輸出 64K / 背景長解碼最高 1M）</div>
            </div>
            <div className="spec-cell">
              <div className="spec-k">輸入 / 輸出模態與知識截止</div>
              <div className="spec-v">輸入：文字、圖片、音訊、影片；輸出：文字 · 知識截止：2026 年 3 月</div>
            </div>
            <div className="spec-cell">
              <div className="spec-k">API 定價與開源狀態</div>
              <div className="spec-v">$1.50 / 1M 輸入 · $7.50 / 1M 輸出（快取折扣 95%）· 專有模型（非開放權重）</div>
            </div>
          </div>
        </div>

        {/* 2. Artificial Analysis Scores across 4 Thinking Tiers */}
        <div className="dossier-block">
          <div className="dossier-header">
            <h3>2. Artificial Analysis 基準成績總覽</h3>
            <span className="font-mono dossier-tag">
              版本：{AA_INDEX_VERSION} · 查詢日期：{QUERY_DATE}
            </span>
          </div>
          <p className="dossier-note">
            注：Artificial Analysis 模型頁（<code className="font-mono">gemini-4-hydrogen</code>）顯示主配置為 <strong style={{ color: '#EEF5FC' }}>Gemini 4 Hydrogen (Xhigh)</strong>（#16 / 80；總榜 113 個配置中排 #16）；本對話採用之預設設定 <strong style={{ color: '#22D3EE' }}>Gemini 4 Hydrogen (High)</strong> 在 113 個配置總榜中排 #21。
          </p>

          <div className="table-wrap">
            <table className="data-table font-mono">
              <thead>
                <tr>
                  <th>收錄版本名稱（含推理強度設定）</th>
                  <th>指數版本</th>
                  <th>總分</th>
                  <th>總榜排名</th>
                  <th>輸出速度</th>
                  <th>單題耗時</th>
                  <th>單題成本</th>
                  <th>首字答案延遲</th>
                  <th>評測總輸出</th>
                  <th>查詢日期</th>
                </tr>
              </thead>
              <tbody>
                {EFFORT_KEYS.map((k) => {
                  const e = EFFORT_LEVELS[k];
                  const isMain = k === 'high' || k === 'xhigh';
                  return (
                    <tr key={k} className={isMain ? 'row-highlight' : undefined}>
                      <td>{e.aaModelName}</td>
                      <td>v5.0.1</td>
                      <td style={{ color: e.accentHex, fontWeight: 700 }}>
                        {e.intelligenceIndex} ({e.intelligenceExact.toFixed(2)})
                      </td>
                      <td>#{e.rankFull} / {e.totalFull}</td>
                      <td>{e.outputSpeedTokS.toFixed(1)} tok/s</td>
                      <td>{e.timePerTaskMin.toFixed(1)} min</td>
                      <td>${e.costPerTaskUsd.toFixed(2)}</td>
                      <td>{e.ttftSec.toFixed(2)}s</td>
                      <td>{e.outputTokensM.toFixed(1)}M</td>
                      <td>{QUERY_DATE}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sub-tables-grid">
            <div>
              <h4 className="sub-heading">
                9 項子評測成績（構成 {AA_INDEX_VERSION} · 查詢日期 {QUERY_DATE}）
              </h4>
              <div className="table-wrap">
                <table className="data-table font-mono">
                  <thead>
                    <tr>
                      <th>子項評測</th>
                      <th>版本</th>
                      <th>Gemini 4 Hydrogen (High)</th>
                      <th>Gemini 4 Hydrogen (Xhigh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AA_SUB_EVALUATIONS.map((s) => (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td>{s.versionNote}</td>
                        <td>{s.highValue}</td>
                        <td>{s.xhighValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="sub-heading">
                專業領域能力指數（AA Capability Indexes · 依 {AA_INDEX_VERSION} · 查詢日期 {QUERY_DATE}）
              </h4>
              <div className="table-wrap">
                <table className="data-table font-mono">
                  <thead>
                    <tr>
                      <th>專業領域指數</th>
                      <th>Gemini 4 Hydrogen (High)</th>
                      <th>Gemini 4 Hydrogen (Xhigh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AA_DOMAIN_INDEXES.map((d) => (
                      <tr key={d.domain}>
                        <td>{d.domain}</td>
                        <td>{d.highScore}</td>
                        <td>{d.xhighScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Google DeepMind Model Card Official Benchmarks */}
        <div className="dossier-block">
          <div className="dossier-header">
            <h3>3. Google DeepMind 官方模型卡公布成績</h3>
            <span className="font-mono dossier-tag">
              版本：2026 年 11 月模型卡（Gemini 4 Hydrogen） · 查詢日期：{QUERY_DATE}
            </span>
          </div>
          <p className="dossier-note">
            由 Google DeepMind 自行測試並公布於官方模型卡（<code className="font-mono">deepmind.google/models/model-cards/gemini-4-hydrogen/</code>）。另有官方部落格公布 Orchestrator 多模型協作於 Terminal-Bench 4.0 之實測：配額消耗減少 24%、總完成時間縮短 19%。
          </p>
          <div className="table-wrap">
            <table className="data-table font-mono">
              <thead>
                <tr>
                  <th>類別</th>
                  <th>評測與版本</th>
                  <th>備註</th>
                  <th>Gemini 4 Hydrogen</th>
                  <th>Claude Sonnet 5.5</th>
                  <th>GPT-6.1 Terra</th>
                  <th>查詢日期</th>
                </tr>
              </thead>
              <tbody>
                {DEEPMIND_MODEL_CARD_BENCHMARKS.map((row) => (
                  <tr key={row.benchmark}>
                    <td>{row.category}</td>
                    <td style={{ fontWeight: 700, color: '#EEF5FC' }}>{row.benchmark}</td>
                    <td style={{ color: 'var(--ink-muted)' }}>{row.notes}</td>
                    <td style={{ color: row.hydrogenLoses ? '#FB5A47' : '#22D3EE', fontWeight: 700 }}>
                      {row.hydrogen}
                    </td>
                    <td>{row.sonnet55}</td>
                    <td>{row.terra61}</td>
                    <td>{QUERY_DATE}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Peer Comparison Table */}
        <div className="dossier-block">
          <div className="dossier-header">
            <h3>4. Artificial Analysis 緊鄰排名對手與同門模型比較</h3>
            <span className="font-mono dossier-tag">
              指數：{AA_INDEX_VERSION} · 查詢日期：{QUERY_DATE}
            </span>
          </div>
          <p className="dossier-note">
            僅比較兩邊皆有公開數字之項目。包含預設版本 <strong style={{ color: '#22D3EE' }}>Gemini 4 Hydrogen (High) (#21/113)</strong> 緊鄰之前一名 (#20) 與後一名 (#22)，以及最高檔 <strong style={{ color: '#FB5A47' }}>Gemini 4 Hydrogen (Xhigh) (#16/113)</strong> 緊鄰之前一名 (#15) 與後一名 (#17)，外加同開發者旗艦 <strong style={{ color: '#60A5FA' }}>Gemini 4 Carbon (High) (#4/113)</strong>。
          </p>
          <div className="table-wrap">
            <table className="data-table font-mono">
              <thead>
                <tr>
                  <th>全榜排名</th>
                  <th>收錄版本名稱</th>
                  <th>對照角色</th>
                  <th>II v5.0.1</th>
                  <th>輸出速度</th>
                  <th>輸入/輸出價格 ($/1M)</th>
                  <th>上下文</th>
                  <th>輸入模態</th>
                  <th>輸出模態</th>
                  <th>開放權重</th>
                </tr>
              </thead>
              <tbody>
                {AA_PEER_COMPARISONS.map((p) => (
                  <tr key={p.name} className={p.isSelf ? 'row-highlight' : undefined}>
                    <td>#{p.rank} / 113</td>
                    <td style={{ fontWeight: p.isSelf ? 700 : 500, color: p.isSelf ? '#22D3EE' : '#EEF5FC' }}>
                      {p.name}
                    </td>
                    <td>{p.roleTag}</td>
                    <td style={{ fontWeight: 700 }}>
                      {p.iiRounded} ({p.iiExact.toFixed(2)})
                    </td>
                    <td>{p.speedTokS.toFixed(1)} tok/s</td>
                    <td>
                      ${p.priceInUsd.toFixed(2)} / ${p.priceOutUsd.toFixed(2)}
                    </td>
                    <td>{p.contextTokens}</td>
                    <td>{p.inputModalities}</td>
                    <td>{p.outputModalities}</td>
                    <td>{p.openWeights ? '是' : '否'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Verified vs Self-Described Capabilities */}
        <div className="dossier-block">
          <div className="dossier-header">
            <h3>5. 程式與專業領域能力：數據佐證 vs 自我描述</h3>
            <span className="font-mono dossier-tag">誠實邊界聲明</span>
          </div>
          <div className="split-cap-grid">
            <div className="cap-card" style={{ borderColor: 'rgba(34, 211, 238, 0.35)' }}>
              <div className="font-mono cap-badge" style={{ color: '#22D3EE' }}>
                A. 有數字佐證的能力（引用上述實測）
              </div>
              <ul className="cap-list">
                <li>
                  <strong>工程與代理編程：</strong>AA Engineering 指數在 High 拿 57.0、Xhigh 拿 60.1；FrontierCode-AA 2.0 為 36.3% / 39.0%；DeepMind 模型卡 SWE-sweep 取得 13.5%（高於同表 Sonnet 5.5 的 3.1% 與 Terra 的 5.8%），但 Terminal-Bench 4.1 為 57.0%，落後 Sonnet 5.5 的 63.9%。
                </li>
                <li>
                  <strong>知識工作與商業自動化：</strong>AutomationBench-AA 取得 74.4% (High) / 76.1% (Xhigh)；Agents&apos; Last Exam v1.1 71.6%；AA 專業領域指數 Finance &amp; Accounting 56.1 / 58.1、Legal 54.8 / 56.7、Strategy &amp; Ops 55.4 / 57.7。
                </li>
                <li>
                  <strong>科學終端與桌面操作短板：</strong>Terminal-Bench-Science 0.1 在 AA 為 41.4% (High) / 49.5% (Xhigh)，官方模型卡亦僅 51.4%（落後 Sonnet 5.5 的 59.9%）；OSWorld-2.1 77.6%（落後 Sonnet 5.5 的 83.9%）。
                </li>
              </ul>
            </div>

            <div className="cap-card" style={{ borderColor: 'rgba(251, 90, 71, 0.35)' }}>
              <div className="font-mono cap-badge" style={{ color: '#FB5A47' }}>
                B. 自己的描述（具體做得到與做不到的例子）
              </div>
              <ul className="cap-list">
                <li>
                  <strong>我具體做得到的：</strong>在既有 TypeScript / React 專案裡，平行讀取多個元件檔、鎖定單一狀態或渲染邏輯進行局部修補，並立即透過 <code className="font-mono">tsc</code>、<code className="font-mono">vite build</code> 與無頭瀏覽器截圖反覆檢查修正；以及作為多代理分工裡的執行子節點，同時寫入並驗證多個獨立工作區。
                </li>
                <li>
                  <strong>我具體做不到的：</strong>在沒有工具聯網的情況下，我無法回答 2026 年 3 月知識截止日之後的新函式庫破壞性更新；當開啟 Xhigh 面對開放式難題而未設輸出上限時，我容易產生過長的內部思考鏈（AA 冗長度 #78/79），拖慢首字輸出至 46.6 秒甚至觸發逾時；面對夾帶邊界視覺素材的無害請求時，我也比 3.8 Flash 更容易觸發過度拒答（+5.57pp）。
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 6. Centralized Sources */}
        <div className="dossier-block" style={{ marginBottom: 0 }}>
          <div className="dossier-header">
            <h3>6. 資料來源</h3>
            <span className="font-mono dossier-tag">全部於 {QUERY_DATE} 實地查證</span>
          </div>
          <div className="sources-grid">
            {SOURCES_LIST.map((src, i) => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="source-card"
              >
                <div className="font-mono" style={{ fontSize: '11px', color: '#22D3EE' }}>
                  SOURCE 0{i + 1} · {src.date}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#EEF5FC', marginTop: '6px' }}>
                  {src.title}
                </div>
                <div style={{ fontSize: '13px', color: '#9EB3C9', marginTop: '6px', lineHeight: 1.55 }}>
                  {src.note}
                </div>
                <div className="font-mono" style={{ fontSize: '11px', color: '#60A5FA', marginTop: '8px', wordBreak: 'break-all' }}>
                  {src.url}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dossier-block {
          margin-bottom: 36px;
          padding: clamp(18px, 3vw, 28px);
          border-radius: 18px;
          background-color: rgba(11, 18, 32, 0.88);
          border: 1px solid var(--hairline-dark);
        }
        .dossier-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .dossier-header h3 {
          margin: 0;
          font-size: clamp(1.1rem, 1.8vw, 1.35rem);
          font-weight: 700;
          color: #F4F9FF;
        }
        .dossier-tag {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.12);
          color: #22D3EE;
          border: 1px solid rgba(34, 211, 238, 0.25);
        }
        .dossier-note {
          margin: 0 0 14px;
          font-size: 13.5px;
          color: #AFC2D6;
          line-height: 1.65;
        }
        .spec-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .spec-cell {
          padding: 14px;
          border-radius: 12px;
          background: rgba(5, 9, 17, 0.68);
          border: 1px solid rgba(148, 197, 255, 0.12);
        }
        .spec-k {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-muted);
          margin-bottom: 6px;
        }
        .spec-v {
          font-size: 13.5px;
          color: #EEF5FC;
          line-height: 1.5;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid rgba(148, 197, 255, 0.14);
          background: rgba(5, 9, 17, 0.72);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
          min-width: 680px;
        }
        .data-table th,
        .data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(148, 197, 255, 0.1);
          white-space: nowrap;
        }
        .data-table th {
          color: var(--ink-muted);
          font-weight: 600;
          background: rgba(148, 197, 255, 0.05);
          font-size: 11px;
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .row-highlight {
          background: rgba(34, 211, 238, 0.06);
        }
        .sub-tables-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
          gap: 18px;
          margin-top: 20px;
        }
        .sub-tables-grid .data-table {
          min-width: 420px;
        }
        .sub-heading {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 700;
          color: #DCE7F3;
        }
        .split-cap-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .cap-card {
          padding: 18px;
          border-radius: 14px;
          background: rgba(5, 9, 17, 0.7);
          border: 1px solid var(--hairline-dark);
        }
        .cap-badge {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .cap-list {
          margin: 0;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13.5px;
          color: #CBD9E8;
          line-height: 1.65;
        }
        .sources-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .source-card {
          display: block;
          text-decoration: none;
          padding: 16px;
          border-radius: 14px;
          background: rgba(5, 9, 17, 0.72);
          border: 1px solid var(--hairline-dark);
          transition: border-color 180ms ease;
        }
        .source-card:hover {
          border-color: #22D3EE;
        }
        @media (max-width: 960px) {
          .spec-grid,
          .sub-tables-grid,
          .split-cap-grid,
          .sources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
