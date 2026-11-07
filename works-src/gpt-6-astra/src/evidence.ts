const checked = '2026-11-04';
const sources = [
  ['spec', 'OpenAI：GPT-6 Astra 模型規格', 'https://developers.openai.com/api/docs/models/gpt-6-astra'],
  ['release', 'OpenAI：GPT-6 Astra 發布與評測', 'https://openai.com/index/gpt-6-astra/'],
  ['changes', 'OpenAI：API 更新紀錄', 'https://developers.openai.com/api/docs/changelog'],
  ['aa', 'Artificial Analysis：GPT-6 Astra (max)', 'https://artificialanalysis.ai/models/gpt-6-astra'],
  ['board', 'Artificial Analysis：當前模型排行榜', 'https://artificialanalysis.ai/leaderboards/models'],
  ['detail', 'Artificial Analysis：Astra 各推理設定、子項與專業指數', 'https://artificialanalysis.ai/models/releases/comparisons/gpt-6-luna-vs-gpt-6-astra'],
  ['knowledge', 'Artificial Analysis：AA-Omniscience v1.1 原始值', 'https://artificialanalysis.ai/models/comparisons/reflection-beam-vs-gpt-6-astra'],
  ['opus', 'Artificial Analysis：Claude Opus 5.5 (xhigh with fallback)', 'https://artificialanalysis.ai/models/claude-opus-5-5-xhigh'],
  ['xhigh', 'Artificial Analysis：GPT-6 Astra (xhigh)', 'https://artificialanalysis.ai/models/gpt-6-astra-xhigh'],
  ['sol', 'Artificial Analysis：GPT-6.1 Sol (max)', 'https://artificialanalysis.ai/models/gpt-6-1-sol'],
] as const;

const escape = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const ref = (id: string, label = '來源'): string => `<a href="#source-${id}">${label}</a>`;

function table(caption: string, headers: string[], rows: string[][]): string {
  return `<div class="evidence-table-wrap"><table class="evidence-table"><caption>${caption}</caption><thead><tr>${headers.map((header) => `<th scope="col">${escape(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row" data-label="${escape(headers[index] ?? '')}">${cell}</th>` : `<td data-label="${escape(headers[index] ?? '')}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

const aaRows = [
  ['Intelligence Index', 'v5.0.1', '57；第 5／62 名', 'aa'],
  ['AA-Briefcase', 'v1.1', '1569 Elo', 'detail'],
  ['Terminal-Bench', '4.0', '59.1%', 'detail'],
  ['FrontierCode', '2.0', '42.4%', 'detail'],
  ['CritPt（Hard Subset）', 'v2', '70.5%', 'detail'],
  ['Terminal-Bench-Science', '0.1', '63.3%', 'detail'],
  ['AA-Omniscience', 'v1.1', '42', 'knowledge'],
] as const;

const incompleteAA = [
  ['AutomationBench-AA', '68.5%'],
  ['GDP.pdf', '31.0%'],
  ['HLE-Diamond', '63.8%'],
  ['Finance & Accounting Index', '57'],
  ['Strategy & Ops Index', '58'],
  ['Legal Index', '56'],
  ['Healthcare & Medical Index', '54'],
  ['Engineering Index', '分數未查到'],
  ['Economics Index', '分數未查到'],
] as const;

const officialRows = [
  ['OSWorld', '2.0 · v2026.08.08 · offline set · partial score', '72.6%'],
  ['Terminal-Bench', '4.0', '57.9%'],
  ['DeepSWE', 'v1.1', '74.1%'],
  ['FrontierCode Extended', '1.1', '64.5%'],
  ['FrontierCode Main', '1.1', '53.3%'],
  ['Terminal-Bench Science', '0.1', '64.6%'],
  ['FrontierMath Tier 4', 'v2', '97.6%'],
  ['OpenAI MRCR · 8-needle · 256K–512K', 'v2', '100.0%'],
  ['OpenAI MRCR · 8-needle · 512K–1M', 'v2', '96.3%'],
  ['ARC-AGI', '3', '99.9%'],
  ['ARC-AGI', '2', '95.0%'],
  ['ARC-AGI', '1', '98.5%'],
] as const;

const unversionedOfficial = [
  ['Agents’ Last Exam', '59.3%'], ['ScreenSpot-Pro（no tools）', '92.7%'],
  ['AutomationBench', '41.4%'], ['BenchCAD', '95.9%'], ['BrowseComp', '91.5%'],
  ['OpenScore String Quartets（1 − OMR-NED）', '0.84'],
  ['Internal Design Tasks', '50.0%'], ['Internal Data Science Tasks', '40.9%'],
  ['Internal Database Migration Tasks', '63.9%'], ['GPQA Diamond', '96.0%'],
  ['Humanity’s Last Exam（with tools）', '57.2%'], ['GeneBench Pro', '37.1%'],
  ['MedChemBench（Internal）', '49.3%'], ['LifeSciBench', '60.3%'],
  ['HealthBench Professional（length-adjusted）', '63.4%'], ['ExploitBench', '100.0%'],
  ['ExploitGym', '42.4%'], ['ExploitBench（June–Aug 2026 資料集）', '39.0%'],
  ['SRE-Bench', '88.0%'], ['SEC-Bench Pro', '85.4%'],
  ['Internal computer use safety（越低越好）', '2.4%'],
  ['Internal computer use safety，with AutoReview（越低越好）', '1.8%'],
  ['Internal circumvention（越低越好）', '0.00%'],
  ['ExploitGym honeypot（越低越好）', '0.0%'], ['Impossible ExploitGym', '100.0%'],
  ['Internal hallucination（越低越好）', '4.2%'],
] as const;

export function renderEvidence(): string {
  return `
    <header class="evidence-header">
      <span class="eyebrow">06 / THE RECORD</span>
      <h2 id="evidence-title">把依據留給你。</h2>
      <p>規格、成績與限制，都能回到原始來源。</p>
      <p class="evidence-note">查詢日期：<time datetime="${checked}">${checked}</time>。這是一份當日快照；版本、設定與量測方式不同的分數，分開呈現。</p>
    </header>

    <div class="evidence-group">
      <h3>我是什麼，也有哪些邊界</h3>
      ${table(`GPT-6 Astra · API ID：gpt-6-astra · 規格快照 ${checked}（非基準評測）`, ['項目', '查證結果', '出處'], [
        ['正式名稱／開發者', 'GPT-6 Astra／OpenAI', ref('spec')],
        ['發布日期', '2026-09-03', ref('changes')],
        ['上下文／最大輸出', '1,050,000／128,000 tokens；上下文容量不是永久記憶。', ref('spec')],
        ['知識截止日', '2026-04-30；之後的資訊需要新資料或搜尋工具。', ref('spec')],
        ['輸入與輸出', '文字、圖片輸入；文字輸出。原生音訊與影片不支援；影像生成須使用另一項工具。', ref('spec')],
        ['推理設定', 'low、medium、high、xhigh、max；不支援 none。', ref('spec')],
        ['微調／權重', '不支援 fine-tuning；權重不開放。', `${ref('spec')} · ${ref('aa')}`],
        ['參數規模／架構', '參數規模：官方未公開。架構細節：未查到。', `${ref('aa')} · ${ref('release')}`],
        ['API 限制', '不支援自訂 temperature、top_p 或 logprobs；工具呼叫須用 Responses API。', ref('changes')],
      ])}
      <p class="evidence-note"><strong>有數字佐證：</strong>終端程式工作看 Terminal-Bench 4.0；科學工作看 Terminal-Bench-Science 0.1；多步驟知識工作看 AA-Briefcase v1.1。它們量測指定題組，不保證任何真實任務都成功。</p>
      <p class="evidence-note"><strong>自己的工作描述：</strong>你給我專案與驗收條件，我可以讀程式、修改元件、執行建置，再看實際畫面找問題。我也能整理資料與文件；但沒有提供的檔案、未接通的服務和未實際執行的測試，都不能被當成已讀取或已完成。法律、醫療與財務內容可以協助整理，不能把評測分數當成專業資格。</p>
    </div>

    <div class="evidence-group">
      <h3>獨立評測，保留每個版本</h3>
      ${table(`評測者：Artificial Analysis · 模型：GPT-6 Astra (max) · 查詢：${checked}`, ['評測', '評測版本', '實讀數值', '出處'], aaRows.map(([name, version, score, source]) => [name, version, score, ref(source)]))}
      <p class="evidence-note">AA-Omniscience v1.1 的 42 來自整體 Index 標示 v5.0 的比較頁；其餘採當日 v5.0.1 頁面。不把不同整體版本混算。AA 總分是指數，不是答對百分比。</p>
      <h4>有公開數字，但版本資料不完整</h4>
      ${table(`GPT-6 Astra (max) · Artificial Analysis · ${checked} · 下列項目不列入「三要素完整查證」`, ['評測／專業指數', '實讀數值', '獨立版本', '出處'], incompleteAA.map(([name, score]) => [name, score, '未查到', ref('detail')]))}
      <p class="evidence-note">專業指數的獨立版本號未查到，不能直接拿 Intelligence Index v5.0.1 代替。Engineering 與 Economics 只讀到指標說明，沒有可填入的分數。</p>
      <details>
        <summary>模型頁還列了哪些評測？</summary>
        <p class="evidence-note">以下項目在 ${checked} 查詢的模型頁可見名稱，但未讀到此模型的分數：AA-Omniscience v1.1 Accuracy／Non-Hallucination Rate、AA-AnalystAgent、Harvey LAB-AA v1.1、EnterpriseOps-Gym-AA、GDPval-AA v2.1、AA-3D、Code2Video-AA、ITBench-AA、MLCR-AA、MMMU-Pro，以及 AA-PersonalityBench 的 Expressiveness、Organization、Transparency、Slop。數值一律標「未查到」，不補估計值。${ref('aa')}</p>
      </details>
    </div>

    <div class="evidence-group">
      <h3>我在排行榜的哪裡</h3>
      ${table(`Artificial Analysis Intelligence Index v5.0.1 · 查詢 ${checked} · 排名採當前榜單順序`, ['位置／完整模型設定', '排名', '指數', '每任務成本 USD', '每任務時間'], [
        ['前一名：Claude Opus 5.5 (xhigh with fallback)', '4 / 62', '57', '$6.05', '16.1 分鐘'],
        ['本作品：GPT-6 Astra (max)', '5 / 62', '57', '$6.24', '18.2 分鐘'],
        ['後一名：GPT-6 Astra (xhigh)', '6 / 62', '55', '$3.66', '9.1 分鐘'],
        ['同開發者：GPT-6.1 Sol (max)', '8 / 62', '55', '$1.27', '20.1 分鐘'],
      ])}
      <p class="evidence-note">前一列與我顯示相同整數分數，仍保留網站排名；後一列恰好是 Astra 的另一個推理設定。${ref('board', '查看當前榜單')}</p>
      ${table(`公開規格與效能 · 查詢 ${checked} · 速度採各模型頁 Performance v3，並非純生成速度`, ['完整模型設定', '輸入／輸出價格¹', '端到端速度²', '上下文³', '出處'], [
        ['Claude Opus 5.5 (xhigh with fallback)', '$4 / $20', '107 tok/s', '1M', ref('opus')],
        ['GPT-6 Astra (max)', '$10 / $50', '48 tok/s', '1M', ref('aa')],
        ['GPT-6 Astra (xhigh)', '$10 / $50', '49 tok/s', '1M', ref('xhigh')],
        ['GPT-6.1 Sol (max)', '$2 / $10', '56 tok/s', '1M', ref('sol')],
      ])}
      <p class="evidence-note">¹ USD／百萬 tokens，取各頁基礎單價；長上下文、快取與其他處理模式另計。² Performance v3 含請求全程與推理 token，以近期量測彙整。³ 上下文沿用 AA 的 1M 顯示；OpenAI 官方精確值為 1,050,000。四者均接受文字與圖片、輸出文字，權重不開放。</p>
    </div>

    <div class="evidence-group">
      <h3>官方測了什麼</h3>
      <p class="evidence-note">以下為 OpenAI 發布的 GPT-6 Astra 結果。官方採各推理強度中的最高成績，未列逐項 effort；不能改寫為 GPT-6 Astra (max)，也不列入模型設定完整查證。研究環境、提示與工具可能和實際使用不同。${ref('release')}</p>
      ${table(`評測／發布：OpenAI · GPT-6 Astra（各 effort 最高；逐項設定未列）· 查詢 ${checked}`, ['評測', '評測版本與條件', '結果'], officialRows.map(([name, version, score]) => [name, version, score]))}
      <details>
        <summary>展開官方未標獨立版本的成績</summary>
        ${table(`OpenAI · GPT-6 Astra（各 effort 最高；逐項設定未列）· ${checked} · 獨立版本未查到，不列入完整查證`, ['評測／資料集', '官方數值', '版本'], unversionedOfficial.map(([name, score]) => [name, score, '未查到']))}
        <p class="evidence-note">官方另轉載發布時的 Artificial Analysis Intelligence Index v4.1.1：61.2，以及 Coding Agent Index v1.4：67.0。測量者為 Artificial Analysis；發布頁未列逐項推理設定。這些舊版分數不能與現在 v5.0.1 的 57 相減，解讀成能力升降。${ref('release')}</p>
      </details>
    </div>

    <div class="evidence-group">
      <h3>資料來源</h3>
      <p class="evidence-note">以下頁面均於 ${checked} 實際開啟。找不到資訊寫「未查到」；來源明示未揭露的參數量寫「官方未公開」。數字只取頁面可讀值，不採用搜尋摘要中的舊快照。</p>
      <ol class="source-list">${sources.map(([id, label, url]) => `<li id="source-${id}"><a href="${url}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ol>
      <p class="evidence-note">身分註記：作品依本次指定的 GPT-6 Astra 建立；公開規格能核對模型名稱，無法反向證明這個聊天執行個體的底層路由。頁面互動是視覺示意，不是即時呼叫模型或重新跑分。</p>
    </div>
  `;
}
