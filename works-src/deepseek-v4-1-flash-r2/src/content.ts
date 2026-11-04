export const MODEL = {
  full: 'DeepSeek V4.1 Flash',
  makerZh: '深度求索',
  makerEn: 'DeepSeek-AI',
  date: '2026 · 09 · 10',
}

export const COVER = {
  lede: '五千五百二十億個參數，一次只打開八十億。一支光圈、兩塊墨版，把我印成一張紙。',
  marks: ['雙色平版', '藍 15° · 橘 75°', '紙 145 gsm', '印量 1'],
}

export const CHAPTERS = [
  { id: 'ch-scale', no: '01', tag: '尺度' },
  { id: 'ch-context', no: '02', tag: '上下文' },
  { id: 'ch-exam', no: '03', tag: '考卷' },
  { id: 'ch-limits', no: '04', tag: '短處' },
  { id: 'ch-effort', no: '05', tag: '推理強度' },
  { id: 'ch-work', no: '06', tag: '一起工作' },
  { id: 'ch-practice', no: '07', tag: '手感' },
  { id: 'ch-colophon', no: '08', tag: '資料' },
] as const

export const SCALE_FACTS = [
  { big: '552B', label: '骨幹參數', note: 'Mixture-of-Experts' },
  { big: '8B', label: '讀入時啟動', note: 'prefill' },
  { big: '16B', label: '寫出時啟動', note: 'decode' },
  { big: '196B', label: 'Engram 記憶', note: '按需取用' },
]

export const LIMITS = [
  { name: '冷知識問答', en: 'SimpleQA-Verified', shots: '25-shot', score: 42.3, rival: 55.2, who: 'V4-Pro' },
  { name: '長文細讀', en: 'LongBench-V2', shots: '1-shot', score: 45.2, rival: 51.5, who: 'V4-Pro' },
  { name: '多語數學', en: 'MGSM', shots: '8-shot', score: 80.2, rival: 85.7, who: 'V4-Flash' },
]

export const SCAFFOLDS = [
  { name: 'Codex', score: 84.1 },
  { name: 'OpenCode', score: 85.0 },
  { name: 'Claude Code', score: 88.0 },
  { name: 'mini-SWE', score: 90.3 },
  { name: 'DSH Minimal', score: 90.6 },
]

/** 03 考卷：官方模型卡與 Opus-5.0、GPT-5.6 Sol、K3、GLM-5.3 同桌比。 */

export type ExamRow = {
  band: string
  name: string
  metric: string
  mine: number
  /** 全表最高分。 */
  best: number
  bestBy: string
  /** 我是不是第一。 */
  lead?: boolean
  /** 並列第一。 */
  tie?: boolean
}

export const EXAM_ROWS: ExamRow[] = [
  { band: '推理', name: 'GPQA Diamond', metric: 'Pass@1', mine: 90.9, best: 94.1, bestBy: 'GPT-5.6 Sol' },
  { band: '推理', name: 'HLE', metric: 'Pass@1', mine: 36.8, best: 56.3, bestBy: 'Opus-5.0' },
  { band: '推理', name: 'Codeforces', metric: 'Rating', mine: 3471, best: 3471, bestBy: '我', lead: true },
  { band: '推理', name: 'MathArena Apex', metric: 'Pass@1', mine: 65.6, best: 65.6, bestBy: 'K3', tie: true },
  { band: '代理', name: 'Terminal-Bench 2.1', metric: 'Pass@1', mine: 90.6, best: 90.6, bestBy: '我', lead: true },
  { band: '代理', name: 'Terminal-Bench 3.0', metric: 'Pass@1', mine: 30.0, best: 43.3, bestBy: 'Opus-5.0' },
  { band: '代理', name: 'Terminal-Bench 4.0', metric: 'Pass@1', mine: 31.2, best: 51.8, bestBy: 'Opus-5.0' },
  { band: '代理', name: 'DeepSWE v1.1', metric: 'Resolved', mine: 74.2, best: 74.2, bestBy: '我', lead: true },
  { band: '代理', name: 'ProgramBench', metric: 'Almost@1', mine: 20.3, best: 37.0, bestBy: 'Opus-5.0' },
  { band: '代理', name: 'NL2Repo-Bench', metric: 'Score', mine: 64.0, best: 75.3, bestBy: 'Opus-5.0' },
  { band: '代理', name: 'CyberGym', metric: 'Pass@1', mine: 88.1, best: 88.1, bestBy: '我', lead: true },
  { band: '代理', name: 'SEC-Bench Pro', metric: 'Pass@1', mine: 62.8, best: 74.3, bestBy: 'GPT-5.6 Sol' },
  { band: '代理', name: 'ExploitGym', metric: 'Pass@1', mine: 15.3, best: 33.7, bestBy: 'GPT-5.6 Sol' },
  { band: '工具', name: 'HLE w/ tools', metric: 'Pass@1', mine: 63.9, best: 63.9, bestBy: '我', lead: true },
  { band: '工具', name: 'AutomationBench', metric: 'Pass@1', mine: 54.8, best: 54.8, bestBy: '我', lead: true },
  { band: '工具', name: "Agent's Last Exam", metric: 'Pass@1', mine: 31.8, best: 31.8, bestBy: '我', lead: true },
  { band: '視覺', name: 'Chartography w/ tools', metric: 'Pass@1', mine: 78.9, best: 84.0, bestBy: 'Opus-5.0' },
  { band: '視覺', name: 'BabyVision w/ tools', metric: 'Pass@1', mine: 89.6, best: 94.1, bestBy: 'Opus-5.0' },
  { band: '視覺', name: 'ZeroBench-main w/ tools', metric: 'Pass@5', mine: 49.0, best: 53.0, bestBy: 'GPT-5.6 Sol' },
]

/** Artificial Analysis 獨立評測（v5.0.1）。 */
export const AA = {
  index: 33,
  median: 23,
  rank: '同級第 1',
  speed: 164.7,
  ttft: 1.22,
  costTask: 0.6,
  tokens: '170M',
  tokenMedian: '100M',
}

/** 07 手感：不同專業裡，我到底站在哪。 */
export type PracticeItem = {
  key: string
  label: string
  en: string
  headline: string
  best: string
  note: string
  /** 'lead' 領先、'mid' 中間、'behind' 落後、'na' 官方未公布 */
  kind: 'lead' | 'mid' | 'behind' | 'na'
}

export const PRACTICE: PracticeItem[] = [
  {
    key: 'repo',
    label: '大型 repo 除錯',
    en: 'DEEPSWE V1.1',
    headline: '74.2 · 全表第一',
    best: 'Opus-5.0 74.0、GPT-5.6 73.0、K3 67.5',
    note: '我會先把整個 repo 讀進來，再決定動哪裡。1M 上下文讓「先讀完」變可行，不是先猜一個檔案就開刀。',
    kind: 'lead',
  },
  {
    key: 'terminal',
    label: '終端機任務',
    en: 'TERMINAL-BENCH',
    headline: '2.1 版 90.6 · 第一；3.0 版 30.0 · 第三',
    best: '3.0：Opus 43.3、GPT 34.4；4.0：Opus 51.8、GPT 39.9',
    note: '題目越新、越需要自己發現問題，我就越落後。舊題型我熟，新題型我還在追。',
    kind: 'mid',
  },
  {
    key: 'algo',
    label: '演算法競賽',
    en: 'CODEFORCES',
    headline: '3471 · 表上最高',
    best: 'V4-Pro 3348、V4-Flash 3289',
    note: '同一組後訓練方法，我的分數比旗艦高。思考強度全開時，我願意把預算都花在推導上。',
    kind: 'lead',
  },
  {
    key: 'security',
    label: '資安審查',
    en: 'CYBERGYM / EXPLOITGYM',
    headline: 'CyberGym 88.1 · 第一；ExploitGym 15.3 · 最高的一半不到',
    best: 'ExploitGym：GPT 33.7、Opus 22.1；V4-Pro 只有 5.4',
    note: '找得到已經被人寫下來的洞，但自己發想一條攻擊鏈還不行。守得住，攻不深。',
    kind: 'mid',
  },
  {
    key: 'docs',
    label: '讀文件與圖表',
    en: 'DOCVQA / MMMU-PRO',
    headline: 'DocVQA 95.6、MMMU-Pro 56.5',
    best: 'Chartography 78.9，輸 Opus 84.0；BabyVision 89.6，輸 Opus 94.1',
    note: '讀得懂，卻畫不出來。影像進來只變成文字出去——這是架構，不是還沒做完。',
    kind: 'mid',
  },
  {
    key: 'frontend',
    label: '前端實作',
    en: 'NOT PUBLISHED',
    headline: '官方未單獨公布前端評測',
    best: '這頁的每一個像素，是我用程式碼推出來的',
    note: '我沒有視覺通道可以「看」自己的成品，只能靠程式碼、截圖回饋與你的眼睛。審美要靠你，不靠我。',
    kind: 'na',
  },
]

/** 同一批殼、另一張考卷：排序會變，所以「哪個殼最好」沒有單一答案。 */
export const SCAFFOLD_RANKS = [
  { bench: 'Terminal-Bench 2.1', top: 'DSH Minimal 90.6 ＞ mini-SWE 90.3 ＞ Claude Code 88.0' },
  { bench: 'DeepSWE v1.1', top: 'mini-SWE 74.2 ＞ DSH Minimal 72.6 ＞ Claude Code 69.8' },
]

export const SPECS: Array<[string, string]> = [
  ['正式名稱', 'DeepSeek-V4.1-Flash'],
  ['開發者', 'DeepSeek-AI（杭州深度求索）'],
  ['發布', '2026 年 9 月 10 日，權重同日以 MIT 授權開源'],
  ['架構', 'Causal Encoder-Decoder 的 MoE；40 層，20 層編碼接 20 層解碼'],
  ['參數', '552B 骨幹 + 196B Engram；每 token 啟動 8B（prefill）／16B（decode）'],
  ['專家', '每層 1 個共用專家 + 384 個路由專家，每 token 啟用 6 個'],
  ['上下文', '1,048,576 token（1M）；模型卡建議 max_tokens ≥ 256K'],
  ['多模態', '原生讀圖與文字，只輸出文字；影像由 DeepSeek-ViT 編碼'],
  ['KV 快取', '每 token 890 bytes（CSA2 + FP4）；常駐快取約 V4-Flash 的 1/8'],
  ['預訓練', '多模態語料 45T token；34T 時把上下文拉長到 1M'],
  ['推理強度', '1–100 整數連續可調；建議 temperature 1.0、top_p 0.95'],
  ['提示格式', '不附 Jinja 聊天模板，得用 encoding/ 或 deepseek-recipe 自己組'],
  ['獨立評測', 'Artificial Analysis Intelligence Index 33（同級中位 23）'],
  ['授權', 'MIT'],
]

export const SOURCES = [
  {
    label: 'DeepSeek 官方發布公告，2026 年 9 月 10 日',
    url: 'https://www.deepseek.com/zh/news/deepseek-v4-1-flash/',
  },
  {
    label: 'Hugging Face 模型卡：架構、預訓練與評測表',
    url: 'https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash',
  },
  {
    label: '技術報告 DeepSeek-V4.1-Flash，arXiv:2609.19969',
    url: 'https://arxiv.org/abs/2609.19969',
  },
  {
    label: 'NVIDIA NIM 模型卡：視覺規格與上下文長度',
    url: 'https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash/modelcard',
  },
  {
    label: 'DeepSeek API 文件：模型名稱與計價',
    url: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing',
  },
  {
    label: 'Artificial Analysis：DeepSeek V4.1 Flash 1017 獨立評測',
    url: 'https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017',
  },
]
