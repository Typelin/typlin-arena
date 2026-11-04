export type Effort = 'low' | 'medium' | 'high' | 'xhigh'

export const QUERY_DATE = '2026-11-04'

export const MODEL = {
  fullName: 'Grok 4.6',
  apiName: 'grok-4.6',
  developer: 'SpaceXAI',
  developerNote:
    '官方模型卡註明 SpaceXAI 為 XAI LLC 的營業名稱，可與 xAI 互用；官網頁尾署 SpaceX Super Intelligence LLC。',
  released: '2026-08-12',
  context: 500_000,
  longContextThreshold: 200_000,
  modalitiesIn: '文字、影像',
  modalitiesOut: '文字',
  reasoning: ['low', 'medium', 'high', 'xhigh'] as const,
  reasoningDefault: 'high' as Effort,
  openWeights: false,
  paramsOfficial: '官方未公開精確參數數量；模型卡寫「1.5T-scale model family」。',
  architecture: '官方未公開層數、專家配置與完整架構。',
  knowledgeCutoffDocs: 'January 2026',
  knowledgeCutoffModelsPage: 'February 1, 2026',
  knowledgeCutoffCard: '預訓練截止 January 2026；補充訓練用到晚至 June 2026 的資料。',
  outputLimit: '官方未設文字輸出上限。',
} as const

export const PRICE = {
  input: 2,
  cached: 0.5,
  output: 6,
  inputLong: 4,
  cachedLong: 1,
  outputLong: 12,
  fastNote: '另有 fast／priority 變體，標準費率的兩倍。',
  unit: '美元／百萬 token',
} as const

export const AA_INDEX_LAUNCH = {
  version: 'v4.1.1',
  captured: '2026-08-12',
  queried: QUERY_DATE,
  effort: 'high' as Effort,
  score: 61,
  evals:
    'GDPval-AA v2、τ³-Banking、Terminal-Bench v2.1、SciCode、Humanity’s Last Exam、GPQA Diamond、CritPt、AA-Omniscience、AA-LCR',
  neighbors: {
    above: { name: 'Claude Fable 5（max with fallback）', score: 62 },
    tied: { name: 'GPT-5.6 Sol（max）', score: 61 },
    below: { name: 'Kimi K3', score: '評測文未列精確分數' },
    sameLab: { name: 'Grok 4.5（high）', score: 56 },
    leader: { name: 'Claude Opus 5（max）', score: 63 },
  },
  agentic: {
    gdpval: { name: 'GDPval-AA v2 Elo', value: '1753' },
    tau: { name: 'τ³-Banking', value: '50.7%' },
    terminal21: { name: 'Terminal-Bench v2.1', value: '88.4%' },
    briefcase: { name: 'AA-Briefcase Elo', value: '1577' },
    costPerTask: { name: 'Cost per Intelligence Index task', value: '$0.84' },
    turns: { name: 'AA-Briefcase 平均輪次', value: '~53 輪、~0.5B 輸入 token' },
  },
} as const

export const AA_NOW = {
  captured: QUERY_DATE,
  indexVersion: 'v5.0.1',
  status: 'deprecated',
  intelligenceIndex: 'N/A（模型頁寫 No publicly available API）',
  speedHigh: { value: 67.1, unit: 'output tokens/s', rank: '#133 / 197' },
  ttftHigh: { value: 39.16, unit: 's' },
  e2eHigh: { value: 46.61, unit: 's' },
  speedXhigh: { value: 72.3, unit: 'output tokens/s' },
  ttftXhigh: { value: 49.35, unit: 's' },
  blended: { value: 1.35, note: '7:2:1 cache hit / input / output' },
  subscoresHigh: [
    { name: 'AA-Briefcase v1.1 Elo', value: '1529', effort: 'high' },
    { name: 'AutomationBench-AA', value: '67%', effort: 'high' },
    { name: 'Terminal-Bench 4.0', value: '21%', effort: 'high' },
    { name: 'GDP.pdf All-pass', value: '17%', effort: 'high' },
    { name: 'Terminal-Bench-Science 0.1', value: '6%', effort: 'high' },
  ],
  subscoresXhigh: [
    { name: 'AA-Briefcase v1.1 Elo', value: '1540', effort: 'xhigh' },
    { name: 'AutomationBench-AA', value: '67%', effort: 'xhigh' },
    { name: 'Terminal-Bench 4.0', value: '17%', effort: 'xhigh' },
    { name: 'FrontierCode 2.0', value: '20%', effort: 'xhigh' },
    { name: 'AA-Omniscience v1.1', value: '25', effort: 'xhigh' },
    { name: 'GDP.pdf All-pass', value: '17%', effort: 'xhigh' },
    { name: 'CritPt v2 (Hard Subset)', value: '40%', effort: 'xhigh' },
  ],
} as const

export const OFFICIAL_EVALS = [
  { name: 'AA Intelligence Index', grok46: '61', grok45: '56', sol: '61', fable: '62' },
  { name: 'GDPVal-AA v2', grok46: '1753', grok45: '1526', sol: '1728', fable: '1741' },
  { name: 'CursorBench v3.2', grok46: '69.9%', grok45: '66.7%', sol: '67.2%', fable: '70.5%' },
  { name: 'DeepSWE v1.1', grok46: '65.9%', grok45: '54%', sol: '73%', fable: '70%' },
  { name: 'FrontierCode v1.1 (Extended)', grok46: '61.3%', grok45: '56.6%', sol: '60.6%', fable: '63.6%' },
  { name: 'APEX-Agents', grok46: '57.5%', grok45: '47.1%', sol: '56.7%', fable: '59.2%' },
  { name: 'Terminal-Bench v3.0', grok46: '26%', grok45: '15.7%', sol: '34.6%', fable: '34.1%' },
  { name: 'APEX-SWE', grok46: '56.4%', grok45: '53.6%', sol: '—', fable: '58.8%' },
  { name: 'AA-Briefcase', grok46: '1577', grok45: '1313', sol: '1502', fable: '1574' },
  { name: 'Harvey LAB (Vals)', grok46: '15.8%', grok45: '12.9%', sol: '2.5%', fable: '11.3%' },
] as const

export const SIBLING_47 = [
  { name: 'CursorBench 4.0', grok47: '46.3%', grok46: '40.4%' },
  { name: 'DeepSWE v1.1', grok47: '71.0%（high）', grok46: '65.2%' },
  { name: 'EEBench', grok47: '64.0%', grok46: '53.0%' },
  { name: 'AA Briefcase v1.1', grok47: '1,657', grok46: '1,546' },
  { name: 'Terminal-Bench 4.0', grok47: '37.6%', grok46: '20.3%' },
  { name: 'Harvey Legal Agent Benchmark', grok47: '19.6%', grok46: '15.8%' },
  { name: 'HealthBench Professional', grok47: '56.7%', grok46: '48.5%' },
] as const

export const SOURCES = [
  {
    label: 'Introducing Grok 4.6',
    href: 'https://x.ai/news/grok-4-6',
    note: '正式名稱、發布日、訓練說明、官方評測表、定價、$2/$6、fast 變體兩倍價。',
  },
  {
    label: 'Grok 4.6 模型頁',
    href: 'https://docs.x.ai/developers/models/grok-4.6',
    note: 'API 名稱 grok-4.6、50 萬上下文、模態、推理強度、分級定價、Batch API。',
  },
  {
    label: 'Models 定價總表',
    href: 'https://docs.x.ai/developers/models',
    note: 'grok-4.6 與 grok-4.5／grok-4.7 價目；知識截止日註記 February 1, 2026。',
  },
  {
    label: 'API Release Notes',
    href: 'https://docs.x.ai/developers/release-notes',
    note: '2026-08-12 上線紀錄。',
  },
  {
    label: 'Model Card: Grok 4.6',
    href: 'https://media.x.ai/v1/website/card-4p6-4cd2dc57.pdf',
    note: '1.5T-scale 家族、與 Cursor 合作、知識截止、安全聲明。本次直接抓取 PDF 回 403，引述依公開轉載與搜尋摘要。',
  },
  {
    label: 'Artificial Analysis：Grok 4.6 評測文章',
    href: 'https://artificialanalysis.ai/articles/grok-4-6-benchmarks-and-analysis',
    note: 'Index 61、對手名次、agentic 子項、成本 $0.84。',
  },
  {
    label: 'Artificial Analysis：Grok 4.6 (High) 模型頁',
    href: 'https://artificialanalysis.ai/models/grok-4-6',
    note: '2026-11-04 查詢：deprecated、Index N/A、速度 67.1 t/s、TTFT 39.16s。',
  },
  {
    label: 'Artificial Analysis：High vs Xhigh',
    href: 'https://artificialanalysis.ai/models/comparisons/grok-4-6-vs-grok-4-6-xhigh',
    note: '子項評測與速度／延遲。',
  },
  {
    label: 'Artificial Analysis LLM Leaderboard',
    href: 'https://artificialanalysis.ai/leaderboards/models',
    note: '2026-11-04 現行榜為 Index v5.0.1，未列 Grok 4.6 的 Intelligence Index。',
  },
  {
    label: 'Introducing Grok 4.7',
    href: 'https://x.ai/news/grok-4-7',
    note: '同開發者後續模型；表內 Grok 4.6 High 對照列。',
  },
] as const
