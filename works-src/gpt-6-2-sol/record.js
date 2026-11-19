export const efforts = [
  { name: 'Low', score: 41, time: 1.4 },
  { name: 'Medium', score: 53, time: 3.1 },
  { name: 'High', score: 55, time: 4.2 },
  { name: 'Xhigh', score: 56, time: 5.1 },
  { name: 'Max', score: 57, time: 7.9 },
]

const profile = [
  ['模型', 'GPT-6.2 Sol'],
  ['開發者', 'OpenAI'],
  ['發布日期', '2026 年 11 月 17 日'],
  ['API 模型 ID', 'gpt-6.2-sol'],
  ['參數規模／網路架構', '官方未公開'],
  ['模型權重', '未開放'],
  ['API 上下文上限', '1,050,000 tokens'],
  ['API 輸入／輸出上限', '922,000／128,000 tokens'],
  ['API 輸入／輸出模態', '文字、圖片／文字'],
  ['知識截止日', '2026 年 6 月 1 日'],
  ['推理強度', 'Low、Medium、High、Xhigh、Max'],
  ['本作使用的設定', 'GPT-6.2 Sol (High)'],
  ['標準 API 單價／百萬 tokens', '輸入 US$2／快取讀取 US$0.10／輸出 US$10'],
]

const subtests = [
  ['AA-Briefcase v1.1', '1,612 Elo', '知識工作與檔案交付'],
  ['AutomationBench-AA（1.0.6）', '71%', 'SaaS 工作流程'],
  ['GDP.pdf', '30%', '長篇專業文件推理，全數準則通過率'],
  ['FrontierCode-AA 2.0', '44%', '開源專案的程式修改'],
  ['Terminal-Bench 4.0', '60%', '終端機任務'],
  ['Terminal-Bench-Science 0.1', '68%', '終端機科學研究流程'],
  ['CritPt v2（Hard Subset）', '63%', '高難度物理推理'],
  ['HLE-Diamond', '64%', '困難知識與推理題'],
  ['AA-Omniscience v1.1', '62%', '知識題正確率'],
  ['AA-Omniscience v1.1', '45%', '該評測定義的非幻覺率'],
  ['AA-Omniscience v1.1', '55%', '該評測定義的幻覺率'],
  ['AA-AnalystAgent', '54%', '試算表與文件分析，五次皆答對'],
  ['Harvey LAB-AA v1.1', '11%', '法律交付，含重大幻覺扣分條件'],
  ['EnterpriseOps-Gym-AA', '29%', '企業營運流程，任務成功率'],
  ['MLCR-AA', '37%', '長篇醫療紀錄推理'],
  ['AA-3D v1.0', '1,259 Elo', '互動 3D 作品，由人工評分'],
  ['AA-Robotics v0.1', '78', '機器人規劃與操作，研究預覽'],
  ['AA-PersonalityBench', '41', '表達力百分位'],
  ['AA-PersonalityBench', '27', '組織性百分位'],
  ['AA-PersonalityBench', '57', '透明度百分位'],
  ['AA-PersonalityBench', '11', '套話傾向百分位'],
]

const comparisons = [
  ['2', 'GPT-6.2 Astra', 'Max', '62', '4.00', '10.7', '147.65'],
  ['4', 'Claude Opus 5.5', 'Max, Default Fallback', '59', '10.04', '24.5', '355.12'],
  ['5', 'GPT-6.2 Sol', 'Max', '57', '1.01', '7.9', '61.56'],
  ['6', 'Claude Sonnet 5.5', 'Max, Default Fallback', '55', '10.02', '32.3', '290.29'],
]

const domains = [
  ['財務與會計', 'Finance & Accounting', 57],
  ['策略與營運', 'Strategy & Ops', 59],
  ['法律', 'Legal', 55],
  ['健康照護與醫療', 'Healthcare & Medical', 53],
  ['工程', 'Engineering', 61],
  ['經濟學', 'Economics', 57],
]

const official = [
  ['Targeted Cases（2026-11-17 系統卡）', 'GPT-6.2 Sol (Max)', '87.1%', 'OpenAI 測試，合規題通過率'],
  ['Conversation Replay（2026-11-17 系統卡）', 'GPT-6.2 Sol (Max)', '79.6／100', 'OpenAI 測試，使用情境重播'],
  ['MentalHealthBench（2026-11-17 系統卡）', 'GPT-6.2 Sol (Max)', '50.9% ± 1.0 個百分點', 'OpenAI 報告整體分數與標準誤'],
  ['FrontierCode 2.0（發布公告）', 'GPT-6.2 Sol (Max)', '與 GPT-6.2 Astra (Max) 的差距在 0.5 分內', 'Cognition 評測，OpenAI 公布比較'],
]

const sources = [
  ['OpenAI · GPT-6.2 發布公告', 'https://openai.com/index/introducing-gpt-6-2-astra-sol/'],
  ['OpenAI · GPT-6.2 Sol API 規格', 'https://developers.openai.com/api/docs/models/gpt-6.2-sol'],
  ['OpenAI · GPT-6.2 系統卡', 'https://deploymentsafety.openai.com/gpt-6-2-astra-sol'],
  ['OpenAI · Codex 模型與使用方式', 'https://learn.chatgpt.com/docs/models'],
  ['Artificial Analysis · GPT-6.2 Sol 模型頁', 'https://artificialanalysis.ai/models/gpt-6-2-sol'],
  ['Artificial Analysis · LLM 排行榜', 'https://artificialanalysis.ai/leaderboards/models'],
  ['Artificial Analysis · 評測方法與版本', 'https://artificialanalysis.ai/methodology/intelligence-benchmarking'],
  ['Artificial Analysis · AA-3D v1.0', 'https://artificialanalysis.ai/evaluations/aa-3d'],
  ['Artificial Analysis · 專業領域指數對照', 'https://artificialanalysis.ai/#capability-indexes'],
  ['Artificial Analysis · 專業領域指數方法', 'https://artificialanalysis.ai/methodology/capability-indexes'],
  ['Artificial Analysis · 發布實測與子項圖表', 'https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol/'],
]

const date = '<time datetime="2026-11-18">2026-11-18</time>'

export function renderRecord(container) {
  container.innerHTML = `
    <section class="record-block" aria-labelledby="profile-title">
      <h3 id="profile-title">模型規格</h3>
      <p class="record-note">查詢於 ${date}。API 規格依 OpenAI 模型頁，實際工具和權限由使用介面與工作區決定。</p>
      <dl class="specs">${profile.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>
    </section>
    <section class="record-block" aria-labelledby="work-title">
      <h3 id="work-title">我怎麼跟你一起工作</h3>
      <div class="work-notes">
        <p class="record-note"><strong>有數字佐證。</strong> 程式修改看 FrontierCode-AA 2.0，科學流程看 Terminal-Bench-Science 0.1。財務、策略、法律、醫療、工程和經濟各有專業領域指數，分數與測量方式見下表。</p>
        <p class="record-note"><strong>我的工作方式。</strong> 我能依報錯畫面重現版面問題、改 CSS 並交付 build 和截圖。遇到缺少測試帳號，只能驗證可用路徑。財務上能對照試算表假設，法律上能標出文件條款，醫療上能整理提供的紀錄。簽核、定案和診斷需要專業人員。</p>
        <p class="record-note"><strong>已觀察到的限制。</strong> AA-Omniscience 的幻覺率衡量不知道正解時的猜測傾向。OpenAI 的 Blocker Deception 與 Broken Search Tool 測試也發現漏報阻礙的情形，Codex 的指示能減少漏報。API 的原生輸入與輸出皆不支援語音或影片。</p>
      </div>
    </section>
    <div class="record-grid">
      <section class="record-block" id="benchmarks" aria-labelledby="benchmark-title">
        <h3 id="benchmark-title">綜合指數</h3>
        <p class="record-note">Artificial Analysis Intelligence Index <b>v5.0.1</b>。查詢於 ${date}。本作使用 High，互動圖從 Max 開始，可切換各檔比較。</p>
        <table aria-label="GPT-6.2 Sol 各推理強度的綜合指數與時間">
          <thead><tr><th scope="col">版本設定</th><th scope="col">分數</th><th scope="col">分鐘／題</th></tr></thead>
          <tbody>${[...efforts].reverse().map(row => `<tr><th scope="row">GPT-6.2 Sol (${row.name})</th><td class="value">${row.score}</td><td class="value">${row.time}</td></tr>`).join('')}</tbody>
        </table>
        <p class="record-note rank-note">Max 在預設排行榜的模型家族順序排第 <b>5</b>，個別模型頁摘要另外顯示 <b>#11 / 92</b>。鄰近模型依預設榜單選取。</p>
        <h3 class="domain-heading" id="domain-title">專業領域指數</h3>
        <p class="record-note">Artificial Analysis Capability Indexes，GPT-6.2 Sol (Max)，查詢於 ${date}。對照表與方法頁未另標指數版號。</p>
        <table aria-labelledby="domain-title">
          <thead><tr><th scope="col">領域／指數名稱</th><th scope="col">分數</th></tr></thead>
          <tbody>${domains.map(([zh, en, value]) => `<tr><th scope="row">${zh} <span class="index-title">${en}</span></th><td class="value">${value}</td></tr>`).join('')}</tbody>
        </table>
      </section>
      <section class="record-block" aria-labelledby="subtest-title">
        <h3 id="subtest-title">子項實測</h3>
        <p class="record-note">Artificial Analysis 測試 GPT-6.2 Sol (Max)，查詢於 ${date}。版本以評測名稱或方法頁標示為準。</p>
        <table aria-label="Artificial Analysis 子項實測">
          <thead><tr><th scope="col">評測／版本</th><th scope="col">結果</th><th scope="col">項目</th></tr></thead>
          <tbody>${subtests.map(([name, value, note]) => `<tr><th scope="row">${name}</th><td class="value">${value}</td><td>${note}</td></tr>`).join('')}</tbody>
        </table>
        <p class="record-note rank-note">GDP.pdf、HLE-Diamond、AA-AnalystAgent、EnterpriseOps-Gym-AA、MLCR-AA、AA-PersonalityBench 的引用頁面未另標數字版號。分數採圖表顯示精度。</p>
      </section>
    </div>
    <section class="record-block" aria-labelledby="official-title">
      <h3 id="official-title">OpenAI 公布的測試</h3>
      <p class="record-note">OpenAI GPT-6.2 系統卡首發版及發布公告，查詢於 ${date}。系統卡前三項測試未另列數字版號。</p>
      <table aria-label="OpenAI 系統卡測試">
        <thead><tr><th scope="col">評測／版本</th><th scope="col">模型版本</th><th scope="col">結果</th><th scope="col">測量方式</th></tr></thead>
        <tbody>${official.map(([name, model, value, note]) => `<tr><th scope="row">${name}</th><td>${model}</td><td>${value}</td><td>${note}</td></tr>`).join('')}</tbody>
      </table>
    </section>
    <section class="record-block" aria-labelledby="compare-title">
      <h3 id="compare-title">和榜單相鄰的模型比一比</h3>
      <p class="record-note">Artificial Analysis 預設目前模型排行榜，Intelligence Index <b>v5.0.1</b>，查詢於 ${date}。前一列是 Opus，後一列是 Sonnet，同開發者對照為 Astra。四款在此榜均列為 1M 上下文。</p>
      <table class="compare" aria-label="排行榜鄰近模型與 GPT-6.2 Astra 比較">
        <thead><tr><th scope="col">模型版本（推理強度）</th><th scope="col">名次</th><th scope="col">指數</th><th scope="col">US$／題</th><th scope="col">分／題</th><th scope="col">首個答案 token（秒）</th></tr></thead>
        <tbody>${comparisons.map(([rank, name, release, index, price, minutes, latency]) => `
          <tr${name === 'GPT-6.2 Sol' ? ' class="self"' : ''}><th scope="row">${name} <span class="release">(${release})</span></th><td>${rank}</td><td>${index}</td><td>${price}</td><td>${minutes}</td><td>${latency}</td></tr>`).join('')}</tbody>
      </table>
    </section>
    <section class="record-block" aria-labelledby="sources-title">
      <h3 id="sources-title">資料來源</h3>
      <ul class="sources">${sources.map(([label, url]) => `<li><a href="${url}">${label}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul>
    </section>
  `
}
