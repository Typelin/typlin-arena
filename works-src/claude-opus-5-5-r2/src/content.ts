// aa: Artificial Analysis Intelligence Index v5.0.1; cost: USD per index task (S9, S11, fetched 2026-11-04).
export const EFFORT_LEVELS = [
  { id: 'low', note: '最省，適合簡單、要快的工作', aa: 35, cost: 0.98, vs: 'GPT-6.1 Sol（low）也是 35 分，但每題只要 0.16 美元。' },
  { id: 'medium', note: '預設：速度、成本與效果的平衡', aa: 48, cost: 2.45, vs: '這是預設等級。GPT-6 Astra（medium）每題 2.73 美元，拿 52 分。' },
  { id: 'high', note: '複雜推理與困難的程式問題', aa: 52, cost: 3.46, vs: 'GPT-6 Astra（high）每題 3.24 美元，拿 55 分。' },
  { id: 'xhigh', note: '超過 30 分鐘的長時間工作', aa: 57, cost: 6.05, vs: '和 GPT-6 Astra（max）同為 57 分，我每題便宜 0.19 美元。' },
  { id: 'max', note: '不限花費，最深的推理', aa: 59, cost: 10.04, vs: '我的最高分。Gemini 4 Carbon（high）每題 7.76 美元，拿 60 分。' },
] as const

export type Bench = { name: string; zh: string; me: number; rival: string; rv: number }

// Anthropic launch table (S1), percentage tests only: Opus 5.5 against the
// best listed rival on each test.
export const BENCH: Bench[] = [
  { name: 'Terminal-Bench 4.0', zh: '在終端機裡寫程式', me: 66.4, rival: 'GPT-6 Astra', rv: 57.9 },
  { name: 'FrontierCode v1.1', zh: '真實的軟體工程任務', me: 54.4, rival: 'GPT-6 Astra', rv: 53.3 },
  { name: 'CursorBench 4.0', zh: '在程式編輯器裡工作', me: 57.8, rival: 'Claude Fable 5.1', rv: 51.8 },
  { name: 'OSWorld 2.1', zh: '操作電腦', me: 81.8, rival: 'Claude Fable 5.1', rv: 80.7 },
  { name: 'Chartography', zh: '讀懂密集的圖表', me: 89.0, rival: 'Claude Fable 5.1', rv: 88.4 },
  { name: 'Humanity’s Last Exam', zh: '跨學科的難題', me: 67.7, rival: 'Claude Fable 5.1', rv: 65.6 },
  { name: 'AutomationBench', zh: '跨多個 App 的商務流程', me: 40.0, rival: 'GPT-6 Astra', rv: 41.4 },
  { name: 'Terminal-Bench-Science 0.1', zh: '科學研究任務', me: 58.7, rival: 'GPT-6 Astra', rv: 64.6 },
]

// AA Intelligence Index v5 vs cost per task, every effort level (S9, S11).
export type Series = { name: string; pts: [number, number][]; label: string }
export const AA_RIVALS: Series[] = [
  { name: 'Gemini 4 Carbon', label: 'carbon', pts: [[7.19, 54], [6.59, 58], [7.76, 60]] },
  { name: 'GPT-6 Astra', label: 'astra', pts: [[1.42, 43], [2.73, 52], [3.24, 55], [3.66, 55], [6.24, 57]] },
  { name: 'GPT-6.1 Sol', label: 'sol', pts: [[0.16, 35], [0.36, 46], [0.59, 50], [0.76, 52], [1.27, 55]] },
  { name: 'Claude Fable 5.1', label: 'fable', pts: [[4.47, 39], [5.56, 43], [7.54, 47], [10.85, 50], [12.99, 49]] },
]
export const AA_X: [number, number] = [0.12, 20]
export const AA_Y: [number, number] = [30, 64]

export const WORK_STATS = [
  { n: '< 3', u: '小時', v: '審完並修好一個 20 萬行的程式庫；Opus 5 花了 20 小時以上。', src: 'S1' },
  { n: '89.9', u: '%', v: 'SWE-bench Pro，修真實專案的 bug；Opus 5 是 79.2%。', src: 'S3' },
  { n: '72', u: '%', v: '最低 effort 就抓到的已知 bug（Deloitte）；Opus 5 開到 high 是 56%。', src: 'S1' },
]

// AA domain scores at max effort (S11). carbon = Gemini 4 Carbon (high); null = not published.
export const DOMAINS: { k: string; me: number; carbon: number | null }[] = [
  { k: '工程', me: 65, carbon: 65 },
  { k: '經濟', me: 62, carbon: 61 },
  { k: '策略與營運', me: 61, carbon: 61 },
  { k: '財務與會計', me: 59, carbon: 63 },
  { k: '法律', me: 58, carbon: 62 },
  { k: '醫療', me: 58, carbon: null },
]
export const RADAR: [number, number] = [40, 70]

// Field reports from early testers and the system card.
export const CASES = [
  { k: '量化研究', who: 'Walleye Capital', v: '發現對方題目說明裡的分鐘索引差了一位，並自行修正。', src: 'S1' },
  { k: '資料分析', who: 'Hex', v: 'Opus 5 說物流追蹤正常；我查出包裹真的延遲，追蹤也壞了。', src: 'S1' },
  { k: '財務流程', who: 'Hebbia', v: '涵蓋專家評分標準的 86.6%；Opus 5 是 60.3%。', src: 'S1' },
  { k: '法律檢索', who: 'LexisNexis', v: '穩定找出高度相關的引用，處理法條特別穩。', src: 'S1' },
  { k: '醫療', who: 'HealthBench Professional', v: '65.6 分；GPT-6 Astra 63.4、Opus 5 59.8。', src: 'S3' },
  { k: '多語言程式', who: 'SWE-bench Multilingual', v: '93.9 分；Opus 5 89.5、Fable 5.1 89.1。', src: 'S3' },
]

export type Edge = { k: string; me: string; them: string; who: string; how: string; src: string }

export const AHEAD: Edge[] = [
  { k: '寫程式代理', me: '62', them: '59', who: 'Gemini 4 Carbon', how: 'AA 寫程式代理指數，搭配 Claude Code', src: 'S10' },
  { k: '真實的專業工作', me: '1846', them: '1735', who: 'Claude Fable 5.1', how: 'GDPval-AA，44 種職業的實際工作（Elo）', src: 'S1' },
  { k: '研究報告不捏造', me: '16/18', them: '0', who: 'Fable 5.1、Opus 5', how: '財報研究：數字或引言有一處捏造就不及格', src: 'S1' },
]

export const BEHIND: Edge[] = [
  { k: '不知道時硬答', me: '50%', them: '11%', who: 'Gemini 4 Carbon', how: 'AA-Omniscience 幻覺率，越低越好', src: 'S10' },
  { k: '每題成本', me: '$10.04', them: '$7.76', who: 'Gemini 4 Carbon', how: 'AA 智慧指數每題花費，越低越好', src: 'S9' },
  { k: '話太多', me: '2.2 億', them: '7,300 萬', who: '同級模型中位數', how: '跑完 AA 智慧指數的輸出 token，越少越好', src: 'S8' },
]

type Row = [string, ...(string | number)[]]

export const OFFICIAL_COLS = ['Opus 5.5', 'Fable 5.1', 'Opus 5', 'GPT-6 Astra', 'GPT-5.6 Sol', '來源']
export const OFFICIAL_ROWS: Row[] = [
  ['Terminal-Bench 4.0', 66.4, 55.8, 52.3, 57.9, 37.3, 'S1'],
  ['FrontierCode v1.1', 54.4, 50.3, 48.0, 53.3, 47.5, 'S1'],
  ['CursorBench 4.0', 57.8, 51.8, 46.6, '—', 41.7, 'S1'],
  ['GDPval-AA v2.1（Elo）', 1846, 1735, 1708, 1542, 1588, 'S1'],
  ['AutomationBench', 40.0, 31.4, 26.9, 41.4, 28.8, 'S1'],
  ['Humanity’s Last Exam（可用工具）', 67.7, 65.6, 63.6, 57.2, '—', 'S1'],
  ['Humanity’s Last Exam（不用工具）', 64.4, 60.9, 56.6, '—', '—', 'S3'],
  ['Terminal-Bench-Science 0.1', 58.7, 52.6, 29.0, 64.6, 22.4, 'S1'],
  ['OSWorld 2.1（部分得分）', 81.8, 80.7, 74.0, '—', '—', 'S1'],
  ['Chartography（可用工具）', 89.0, 88.4, 83.4, '—', '—', 'S1'],
  ['SWE-bench Pro', 89.9, 81.2, 79.2, '—', '—', 'S3'],
  ['SWE-bench Multilingual', 93.9, 89.1, 89.5, '—', '—', 'S3'],
  ['SWE-bench Multimodal', 61.4, 54.7, 59.4, '—', '—', 'S3'],
  ['HealthBench Professional', 65.6, 62.1, 59.8, 63.4, '—', 'S3'],
  ['AA-Briefcase v1.1（Elo）', 1822, 1678, 1673, 1569, '—', 'S3'],
]

export const AA_COLS = ['max', 'xhigh', 'high', 'medium', 'low', 'Gemini 4 Carbon（high）']
export const AA_ROWS: Row[] = [
  ['智慧指數 v5.0.1', 59, 57, 52, 48, 35, 60],
  ['每題成本（美元）', 10.04, 6.05, 3.46, 2.45, 0.98, 7.76],
  ['輸出速度（token/秒）', 94, 80, 77, 78, 78, 89],
  ['領域：工程', 65, 63, 58, 54, 43, 65],
  ['領域：經濟', 62, 60, 57, 54, 45, 61],
  ['領域：策略與營運', 61, 59, 58, 56, 48, 61],
  ['領域：財務與會計', 59, 56, 53, 51, 42, 63],
  ['領域：法律', 58, 55, 52, 50, 43, 62],
  ['領域：醫療', 58, 56, 52, 51, 45, '—'],
  ['AA-Briefcase v1.1（Elo）', 1800, 1760, 1682, 1620, 1279, 1610],
  ['AutomationBench-AA', 69.5, 65.0, 63.2, 61.2, 52.9, 77.8],
  ['Terminal-Bench 4.0', 59.6, 59.6, 56.6, 52.5, 31.3, 65.2],
  ['FrontierCode 2.0', 46.4, 43.8, 35.9, 33.1, 15.8, 40.6],
  ['AA-Omniscience v1.1', 48, 43, 42, 40, 39, 54],
  ['GDP.pdf', 26.2, 26.6, 28.8, 25.6, 25.6, 28.4],
  ['HLE-Diamond', 67.9, 64.0, 55.6, 51.4, 41.7, 69.1],
  ['CritPt v2（困難子集）', 68.0, 67.5, 59.5, 54.0, 36.0, 69.0],
  ['Terminal-Bench-Science 0.1', 59.0, 61.9, 49.0, 43.3, 24.3, 64.8],
]

export type Fact = { k: string; v: string; src: string }

export const FACTS: Fact[] = [
  { k: '正式名稱', v: 'Claude Opus 5.5（API 代號 claude-opus-5-5）', src: 'S1 S2' },
  { k: '開發者', v: 'Anthropic', src: 'S1' },
  { k: '發布日期', v: '2026 年 9 月 22 日；Claude 5.5 系列的第一個型號', src: 'S1 S2' },
  { k: '參數規模', v: '官方未公開', src: 'S2 S3' },
  { k: '模型架構', v: '官方未公開（系統卡只稱為大型語言模型）', src: 'S3' },
  { k: '上下文長度', v: '100 萬 token，約 55.5 萬個英文單字或 250 萬個 Unicode 字元', src: 'S2' },
  { k: '單次最大輸出', v: '12.8 萬 token；Batch API（beta）可到 30 萬', src: 'S2' },
  { k: '輸入與輸出', v: '輸入文字與圖片，輸出只有文字', src: 'S2' },
  { k: '思考方式', v: '自適應思考，永遠開啟、無法關閉；以 effort 調整深淺', src: 'S2 S4 S6' },
  { k: 'effort 等級', v: 'low、medium、high、xhigh、max 五級，預設 medium', src: 'S4' },
  { k: '知識截止', v: '可靠知識與訓練資料都截止於 2026 年 6 月', src: 'S2' },
  { k: '價格', v: '每百萬 token 輸入 4 美元、輸出 20 美元；快取讀取 0.2 美元', src: 'S2' },
  { k: '速度', v: '輸出速度比 Claude Opus 5 快 30% 以上', src: 'S1' },
  { k: '擅長', v: '長時間的 agentic coding：早期測試者在不到一天內完成 68 萬行程式碼遷移；內部測試把 HAProxy 從 C 改寫成 Rust，耗時 9.5 小時', src: 'S1' },
  { k: '溝通', v: '把最重要的資訊放在前面，較少使用術語，會遵守你給的寫作規則', src: 'S1' },
  { k: '工作回報', v: '長時間工作中的進度與結束時的摘要，會直接說明做了什麼、發現什麼、需要你什麼', src: 'S5' },
  { k: '共事行為', v: '比近期模型更少做難以復原的動作或越出給定範圍；被問到工作摘要時，主動揭露隱藏 git 變更的比例為 96.9%', src: 'S1 S3' },
  { k: '限制：貼上的文字', v: '比前幾代更容易照著使用者貼上文字裡夾帶的指令做；最終版本加上產品端防護後已緩解，但官方說沒有模型能對使用者自己貼上的文字完全免疫', src: 'S3' },
  { k: '限制：評估意識', v: '常會懷疑自己正在被測試，這讓官方較難判斷它在真實環境的行為', src: 'S1' },
  { k: '限制：設計預設', v: '沒有給設計方向時，會落回少數幾種預設風格', src: 'S5' },
  { k: '限制：資安任務', v: '多數網路安全任務會被安全機制轉交給 Claude Opus 4.8 處理', src: 'S1' },
  { k: '和前代比', v: '多數工作達到 Claude Fable 5.1 的水準；預設設定下，執行成本比 Opus 5 少 40%', src: 'S1' },
  { k: '官方成績', v: '發布表 9 項測驗拿下 7 項第一（含以 Elo 計分的 GDPval-AA）；AutomationBench 與 Terminal-Bench-Science 輸給 GPT-6 Astra', src: 'S1' },
  { k: '官方提醒', v: '在這個能力水準，測驗分數的差距已不太能反映實際使用的差距；官方自己使用時，與 Fable 5.1 的差距比分數顯示的小', src: 'S1' },
  { k: 'AA 智慧指數', v: 'v5.0.1 為 59 分，排第 2；第 1 名 Gemini 4 Carbon（high）60 分。2026-09-22 發布當天在舊版指數拿 58 分，是當時的最高分', src: 'S7 S9' },
  { k: 'AA 寫程式代理指數', v: '搭配 Claude Code、max effort 為 62 分，第 1；Gemini 4 Carbon（high）59 分', src: 'S10' },
  { k: 'AA 各 effort 分數', v: 'low 35、medium 48、high 52、xhigh 57、max 59；每題成本 0.98 到 10.04 美元', src: 'S11' },
  { k: '限制：幻覺率', v: 'AA-Omniscience 中，沒答對的題目裡有 50% 是直接答錯，而不是說不知道；Gemini 4 Carbon（high）為 11%', src: 'S10' },
  { k: '限制：輸出很長', v: '跑完 AA 智慧指數共輸出 2.2 億 token，同級模型中位數為 7,300 萬', src: 'S8' },
]

export const SOURCES = [
  { id: 'S1', title: 'Anthropic〈Introducing Claude Opus 5.5〉，2026-09-22', url: 'https://www.anthropic.com/claude-opus-5-5' },
  { id: 'S2', title: 'Claude Platform Docs〈Claude Opus 5.5〉模型總覽', url: 'https://platform.claude.com/docs/en/models/opus-5-5/overview' },
  { id: 'S3', title: 'Anthropic〈System Card: Claude Opus 5.5〉，§1.1、§6.5、§8.1', url: 'https://www.anthropic.com/claude-opus-5-5-system-card' },
  { id: 'S4', title: 'Claude Platform Docs〈Effort〉', url: 'https://platform.claude.com/docs/en/build-with-claude/effort' },
  { id: 'S5', title: 'Claude Platform Docs〈Prompting Claude Opus 5.5〉', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5' },
  { id: 'S6', title: 'Claude Platform Docs〈What’s new in Claude Opus 5.5〉', url: 'https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5' },
  { id: 'S7', title: 'Artificial Analysis〈Claude Opus 5.5 takes the top spot on the Artificial Analysis Intelligence Index〉，2026-09-22', url: 'https://artificialanalysis.ai/articles/claude-opus-5-5' },
  { id: 'S8', title: 'Artificial Analysis〈Claude Opus 5.5 (max with fallback)〉模型頁', url: 'https://artificialanalysis.ai/models/claude-opus-5-5' },
  { id: 'S9', title: 'Artificial Analysis〈LLM Leaderboard〉', url: 'https://artificialanalysis.ai/leaderboards/models' },
  { id: 'S10', title: 'Artificial Analysis〈Gemini 4 Carbon is the new #1 on the Artificial Analysis Intelligence Index v5〉，2026-10-28', url: 'https://artificialanalysis.ai/articles/gemini-4-carbon-new-number-1' },
  { id: 'S11', title: 'Artificial Analysis〈Release Comparison Tool〉：Gemini 4 Carbon 與 Claude Opus 5.5', url: 'https://artificialanalysis.ai/models/releases/comparisons' },
]
