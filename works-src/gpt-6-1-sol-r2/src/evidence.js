const links = {
  model: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol',
  launch: 'https://openai.com/index/introducing-gpt-6-1-sol/',
  card: 'https://deploymentsafety.openai.com/gpt-6-1-sol',
  mental: 'https://deploymentsafety.openai.com/gpt-6-1-sol/mentalhealthbench/tbl-9',
  aa: 'https://artificialanalysis.ai/models/gpt-6-1-sol',
  comparison: 'https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-vs-gpt-6-astra',
  board: 'https://artificialanalysis.ai/leaderboards/models',
  high: 'https://artificialanalysis.ai/models/gpt-6-astra-high',
  sonnet: 'https://artificialanalysis.ai/models/claude-sonnet-5-5',
  astra: 'https://artificialanalysis.ai/models/gpt-6-astra',
};
const external = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;
const benchmarks = [
  ['AA-Briefcase v1.1', '1555 Elo', 'v1.1'],
  ['AutomationBench-AA', '65%', '獨立版號未標'],
  ['Terminal-Bench 4.0', '56%', '4.0'],
  ['FrontierCode 2.0', '41%', '2.0'],
  ['AA-Omniscience v1.1', '42', 'v1.1 / Net Score'],
  ['GDP.pdf', '31%', '獨立版號未標'],
  ['HLE-Diamond', '59%', '獨立版號未標'],
  ['CritPt v2 (Hard Subset)', '70%', 'v2 / Hard Subset'],
  ['Terminal-Bench-Science 0.1', '58%', '0.1'],
];
const fields = [
  ['Finance & Accounting', '56.2277560783758'],
  ['Strategy & Ops', '57.6134804164691'],
  ['Legal', '53.6635002700218'],
  ['Healthcare & Medical', '52.0336299039313'],
  ['Engineering', '59.3526158549784'],
  ['Economics', '57.423675'],
];
export function renderEvidence() {
  return `
    <div class="evidence-block"><h3>模型基本資料<span>MODEL SPECIFICATIONS / [01–03]</span></h3><div class="evidence-body"><dl class="fact-list">
      <div><dt>正式名稱 / 開發者</dt><dd>GPT-6.1 Sol / OpenAI</dd></div><div><dt>發布時間</dt><dd>2026 年 9 月 29 日</dd></div>
      <div><dt>參數規模</dt><dd>官方未公開</dd></div><div><dt>內部架構</dt><dd>未查到可核對的官方細節；<br>不推定 dense 或 MoE。</dd></div>
      <div><dt>API 上下文 / 最大輸出</dt><dd>1,050,000 / 128,000 tokens</dd></div><div><dt>Codex、ChatGPT Work 預設上下文</dt><dd>500,000 tokens</dd></div>
      <div><dt>輸入 / 輸出</dt><dd>文字、圖片 / 文字<br>不支援原生音訊、影片輸入。</dd></div><div><dt>知識截止 / 權重</dt><dd>2026-04-30 / 未開放權重</dd></div>
      <div><dt>推理設定</dt><dd>low / medium / high / xhigh / max<br>API 預設 medium。</dd></div><div><dt>標準 API 價格（USD／百萬 tokens）</dt><dd>輸入 $2 / 輸出 $10 / 快取讀取 $0.10</dd></div>
    </dl><p class="evidence-note">規格查詢：2026-11-04。AA 將上下文簡寫為 1M；官方 API 規格為 1,050,000。價格限標準短上下文，長上下文、速度模式與工具另有計價。來源 ${external(links.model, '[01]')}、${external(links.launch, '[02]')}、${external(links.aa, '[04]')}。</p></div></div>

    <div class="evidence-block"><h3>獨立評測成績<span>ARTIFICIAL ANALYSIS / [04–05]</span></h3><div class="evidence-body"><p><strong>GPT-6.1 Sol (Max)</strong> · Intelligence Index <strong>v5.0.1：55</strong> · 排名 <strong>8 / 62</strong></p><p class="evidence-note">測試者：Artificial Analysis。以下全為 GPT-6.1 Sol (Max)，查詢日均為 2026-11-04，總指數版本 v5.0.1。未提供獨立版號的子項如實標示，不把總指數版本當作子項版本。</p><div class="table-wrap"><table><caption class="sr-only">Artificial Analysis 子項評測，模型 GPT-6.1 Sol (Max)，查詢日期 2026-11-04</caption><thead><tr><th scope="col">評測</th><th scope="col">成績</th><th scope="col">評測版本</th></tr></thead><tbody>${benchmarks.map(([name,score,version])=>`<tr><td>${name}</td><td class="num">${score}</td><td>${version}</td></tr>`).join('')}</tbody></table></div><p class="evidence-note">程式領域的數字佐證：Terminal-Bench 4.0、FrontierCode 2.0。專業工作佐證：AA-Briefcase v1.1、GDP.pdf。這些成績衡量特定題集，不表示能無誤完成任何程式或專業工作。${external(links.comparison, '完整原始成績 [05]')}</p></div></div>

    <div class="evidence-block"><h3>與相鄰模型比較<span>SAME INDEX, SAME DATE / [06–09]</span></h3><div class="evidence-body"><p class="evidence-note">Intelligence Index v5.0.1；查詢日期均為 2026-11-04。相鄰模型以當日榜單順序為準。三者顯示分數均為 55，不宣稱並列。速度取各模型頁 FAQ；價格為 USD／百萬 tokens；每題成本為 AA Index 的加權平均。</p><div class="table-wrap" tabindex="0" role="region" aria-label="對手比較表，窄螢幕可左右捲動"><table class="comparison-table"><thead><tr><th scope="col">收錄模型名稱 / 設定</th><th scope="col">排名</th><th scope="col">Index<br>v5.0.1</th><th scope="col">輸入 / 輸出</th><th scope="col">tokens/s</th><th scope="col">USD／題</th><th scope="col">上下文</th></tr></thead><tbody>
      <tr><td>GPT-6 Astra (High)<small>緊鄰前一名 / OpenAI</small></td><td>7 / 62</td><td class="num">55</td><td>$10 / $50</td><td>55.8</td><td>$3.24</td><td>1M</td></tr>
      <tr class="me"><td>GPT-6.1 Sol (Max)<small>本模型 / OpenAI</small></td><td>8 / 62</td><td class="num">55</td><td>$2 / $10</td><td>74.1</td><td>$1.27</td><td>1M</td></tr>
      <tr><td>Claude Sonnet 5.5<br>(Max, Default Fallback)<small>榜單名：max with fallback / Anthropic / 緊鄰後一名</small></td><td>9 / 62</td><td class="num">55</td><td>$2 / $10</td><td>139.3</td><td>$10.02</td><td>1M</td></tr>
      <tr><td>GPT-6 Astra (Max)<small>同開發者的另一模型 / OpenAI</small></td><td>5 / 62</td><td class="num">57</td><td>$10 / $50</td><td>67.1</td><td>$6.24</td><td>1M</td></tr>
    </tbody></table></div><p class="evidence-note">四者皆為文字、圖片輸入，文字輸出，未開放權重。表內價格與速度為當日 AA 頁面值，不代表每個服務商或所有負載。${external(links.board, '排名 [06]')} · ${external(links.high, 'Astra High [07]')} · ${external(links.sonnet, 'Sonnet [08]')} · ${external(links.astra, 'Astra Max [09]')}</p></div></div>

    <div class="evidence-block"><h3>各專業領域<span>CAPABILITY INDEXES / [04]</span></h3><div class="evidence-body"><p class="status-note">AA 模型頁有六個專業領域指數。公開 HTML 原始資料可讀，但各指數<strong>未標獨立版本號</strong>，因此不將它們包裝為版本已完整查證的分數。</p><details class="raw-scores"><summary>查看六項公開原始值與資料限制</summary><p class="evidence-note">模型：GPT-6.1 Sol (Max)；查詢日：2026-11-04；頁面總指數版本：v5.0.1；領域指數獨立版本：未標。以下逐字保留官方頁面 hydration 資料值，不是圖表上顯示精度，不另行四捨五入。</p><div class="table-wrap"><table><thead><tr><th>專業領域</th><th>原始值</th></tr></thead><tbody>${fields.map(([name,value])=>`<tr><td>${name}</td><td class="num">${value}</td></tr>`).join('')}</tbody></table></div></details><p class="evidence-note">這些評測不足以證明可獨立提供醫療、法律或金融決策；領域任務仍需具體資料、工具與人工審核。${external(links.aa, 'AA 模型頁 [04]')}</p></div></div>

    <div class="evidence-block"><h3>官方自己公布的成績<span>OPENAI SELF-EVALUATION / [03, 10]</span></h3><div class="evidence-body"><p><strong>MentalHealthBench / GPT-6.1 Sol (maximum reasoning effort)</strong></p><p class="evidence-note">測試者：OpenAI；評測獨立版本號：官方未標。資料出自 2026-09-29 系統卡 §5.3 Table 9；查詢：2026-11-04。此發布快照日期不是評測版本號。分數為平均值 ± 1 標準誤，不視為一般使用成功率。</p><div class="table-wrap"><table><thead><tr><th scope="col">評測項目</th><th scope="col">官方成績</th></tr></thead><tbody><tr><td>Overall</td><td class="num">57.9 ± 1.0%</td></tr><tr><td>Non-acute</td><td class="num">57.3 ± 1.3%</td></tr><tr><td>High-acuity</td><td class="num">59.1 ± 2.2%</td></tr><tr><td>Emergent</td><td class="num">58.0 ± 1.9%</td></tr></tbody></table></div><p class="evidence-note">另有 HealthBench 長度校正分數：Professional 64.2、標準 58.5、Hard 36.2、Consensus 96.0。模型 GPT-6.1 Sol；官方未標推理強度及獨立版號，故不作完整版本比較。來源為同系統卡 §5.1 Table 7；查詢 2026-11-04。${external(links.card, '系統卡 [03]')} · ${external(links.mental, 'MentalHealthBench 原表 [10]')}</p></div></div>

    <div class="evidence-block"><h3>我能做，也會做錯<span>MY DESCRIPTION ≠ A BENCHMARK</span></h3><div class="evidence-body"><div class="own-description"><div><h4>自己的具體工作描述</h4><p>能將頁面需求拆成資料與元件，修改程式，使用可用工具執行 build，再打開畫面修正。也能讀圖表、整理來源差異。這些是工作方式描述，不是新測得的成績。</p></div><div><h4>明確的限制</h4><p>無法僅憑程式文字保證實際畫面正確；沒有工具與權限就不能替人完成外部操作。模型會產生事實錯誤；不直接接收音訊、影片，也不應假設知道知識截止後發生的事。</p></div></div><p class="evidence-note">官方發布公告仍報告刻意困難題組中的事實錯誤；那不是一般使用的錯誤率。長上下文不保證每個細節都會被正確使用。架構、權重規模與未提供的版本資訊，一律不由表現反推。</p></div></div>

    <div class="evidence-block"><h3>資料來源<span>PRIMARY SOURCES / 2026.11.04</span></h3><div class="evidence-body"><ol class="source-list">${[
      ['01', links.model, 'GPT-6.1 Sol — OpenAI API', '模型名稱、上下文、價格、模態、知識截止、推理設定'],
      ['02', links.launch, 'Introducing GPT-6.1 Sol — OpenAI', '發布、用途、官方能力與事實錯誤限制'],
      ['03', links.card, 'GPT-6.1 Sol System Card Addendum — OpenAI', '發布日期、訓練資料說明、官方評測與限制'],
      ['04', links.aa, 'GPT-6.1 Sol (Max) — Artificial Analysis', 'Intelligence Index v5.0.1、排名、專業領域、參數未公開'],
      ['05', links.comparison, 'Sol (Max) / Astra (Max) — Artificial Analysis', '九項子評測與共同規格'],
      ['06', links.board, 'Model Leaderboard — Artificial Analysis', '查詢當日緊鄰前後名次與同開發者比較'],
      ['07', links.high, 'GPT-6 Astra (High) — Artificial Analysis', '緊鄰前一名的速度、價格與規格'],
      ['08', links.sonnet, 'Claude Sonnet 5.5 — Artificial Analysis', '緊鄰後一名；Max, Default Fallback 設定'],
      ['09', links.astra, 'GPT-6 Astra (Max) — Artificial Analysis', '同開發者的另一模型'],
      ['10', links.mental, 'MentalHealthBench Table 9 — OpenAI', 'maximum effort 官方自測精確數值'],
    ].map(([n,url,title,note])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer"><span>${n}</span><span>${title}<small>${note}</small></span><span aria-hidden="true">↗</span></a></li>`).join('')}</ol></div></div>
  `;
}
