export type EffortKey = 'low' | 'medium' | 'high' | 'xhigh';

export interface EffortSpec {
  key: EffortKey;
  label: string;
  aaModelName: string;
  shellN: number;
  wavelengthNm: number;
  accentHex: string;
  accentGlow: string;
  intelligenceIndex: number;
  intelligenceExact: number;
  rankFull: number;
  totalFull: number;
  timePerTaskMin: number;
  costPerTaskUsd: number;
  outputSpeedTokS: number;
  ttftSec: number;
  outputTokensM: number;
  reasoningTokensM: number;
  answerTokensM: number;
  noteZh: string;
}

export const QUERY_DATE = '2026-11-15';
export const AA_INDEX_VERSION = 'Artificial Analysis Intelligence Index v5.0.1';

export const EFFORT_LEVELS: Record<EffortKey, EffortSpec> = {
  low: {
    key: 'low',
    label: 'Low',
    aaModelName: 'Gemini 4 Hydrogen (Low)',
    shellN: 1,
    wavelengthNm: 410.2,
    accentHex: '#A78BFA',
    accentGlow: 'rgba(167, 139, 250, 0.32)',
    intelligenceIndex: 27,
    intelligenceExact: 26.89,
    rankFull: 66,
    totalFull: 113,
    timePerTaskMin: 1.4,
    costPerTaskUsd: 0.29,
    outputSpeedTokS: 166.9,
    ttftSec: 5.72,
    outputTokensM: 20.3,
    reasoningTokensM: 10.9,
    answerTokensM: 9.4,
    noteZh: '最短思考鏈：首字 5.72 秒回應，分數僅 27 分，適合純格式轉換與路由分流。',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    aaModelName: 'Gemini 4 Hydrogen (Medium)',
    shellN: 2,
    wavelengthNm: 434.0,
    accentHex: '#60A5FA',
    accentGlow: 'rgba(96, 165, 250, 0.34)',
    intelligenceIndex: 41,
    intelligenceExact: 41.23,
    rankFull: 35,
    totalFull: 113,
    timePerTaskMin: 3.8,
    costPerTaskUsd: 0.80,
    outputSpeedTokS: 172.8,
    ttftSec: 11.40,
    outputTokensM: 54.4,
    reasoningTokensM: 37.9,
    answerTokensM: 16.6,
    noteZh: '中階思考檔位：每題平均 3.8 分鐘，智慧指數升至 41 分（AA 評比同級中位數水準）。',
  },
  high: {
    key: 'high',
    label: 'High (預設)',
    aaModelName: 'Gemini 4 Hydrogen (High)',
    shellN: 3,
    wavelengthNm: 486.1,
    accentHex: '#22D3EE',
    accentGlow: 'rgba(34, 211, 238, 0.38)',
    intelligenceIndex: 51,
    intelligenceExact: 50.79,
    rankFull: 21,
    totalFull: 113,
    timePerTaskMin: 8.4,
    costPerTaskUsd: 1.87,
    outputSpeedTokS: 169.3,
    ttftSec: 16.80,
    outputTokensM: 110.4,
    reasoningTokensM: 82.1,
    answerTokensM: 28.3,
    noteZh: '出廠預設檔位：51 分追過 Argon (50)，每題約 8.4 分鐘、$1.87，是日常開發主力。',
  },
  xhigh: {
    key: 'xhigh',
    label: 'Xhigh',
    aaModelName: 'Gemini 4 Hydrogen (Xhigh)',
    shellN: 4,
    wavelengthNm: 656.3,
    accentHex: '#FB5A47',
    accentGlow: 'rgba(251, 90, 71, 0.42)',
    intelligenceIndex: 54,
    intelligenceExact: 53.92,
    rankFull: 16,
    totalFull: 113,
    timePerTaskMin: 14.8,
    costPerTaskUsd: 3.16,
    outputSpeedTokS: 174.0,
    ttftSec: 46.64,
    outputTokensM: 303.6,
    reasoningTokensM: 261.0,
    answerTokensM: 42.5,
    noteZh: '最高推理檔位：分數衝上 54（AA 模型頁 #16/80），但首字需等 46.64 秒、輸出暴增至 3.04 億 token。',
  },
};

export interface AaSubEval {
  name: string;
  versionNote: string;
  highValue: string;
  xhighValue: string;
  unit: string;
}

export const AA_SUB_EVALUATIONS: AaSubEval[] = [
  { name: 'AA-Briefcase', versionNote: 'v1.1 (Elo)', highValue: '1,497 (1496.74)', xhighValue: '1,568 (1567.52)', unit: 'Elo' },
  { name: 'AutomationBench-AA', versionNote: 'AA v5.0.1 收錄', highValue: '74.4%', xhighValue: '76.1%', unit: '%' },
  { name: 'Terminal-Bench 4.0', versionNote: 'v4.0', highValue: '54.0%', xhighValue: '53.5%', unit: '%' },
  { name: 'FrontierCode-AA', versionNote: '2.0', highValue: '36.3%', xhighValue: '39.0%', unit: '%' },
  { name: 'AA-Omniscience', versionNote: 'v1.1 綜合 / 準確率 / 無幻覺率', highValue: '43.7 (準確 48.2% · 無幻覺 91.3%)', xhighValue: '46.3 (準確 50.5% · 無幻覺 91.5%)', unit: 'Index' },
  { name: 'GDP.pdf', versionNote: 'All-Pass', highValue: '30.0%', xhighValue: '27.6%', unit: '%' },
  { name: 'HLE-Diamond', versionNote: 'Humanity’s Last Exam 子集', highValue: '54.9%', xhighValue: '58.8%', unit: '%' },
  { name: 'CritPt v2', versionNote: 'Hard Subset', highValue: '61.5%', xhighValue: '66.0%', unit: '%' },
  { name: 'Terminal-Bench-Science', versionNote: '0.1', highValue: '41.4%', xhighValue: '49.5%', unit: '%' },
];

export interface CapabilityDomain {
  domain: string;
  highScore: string;
  xhighScore: string;
}

export const AA_DOMAIN_INDEXES: CapabilityDomain[] = [
  { domain: 'Engineering（工程）', highScore: '57.0', xhighScore: '60.1' },
  { domain: 'Finance & Accounting（財務會計）', highScore: '56.1', xhighScore: '58.1' },
  { domain: 'Strategy & Ops（策略營運）', highScore: '55.4', xhighScore: '57.7' },
  { domain: 'Legal（法律）', highScore: '54.8', xhighScore: '56.7' },
  { domain: 'Economics（經濟）', highScore: '53.0', xhighScore: '55.0' },
  { domain: 'Healthcare & Medical（醫療健康）', highScore: '頁面未收錄', xhighScore: '53.3' },
];

export interface OfficialBenchRow {
  category: string;
  benchmark: string;
  notes: string;
  hydrogen: string;
  sonnet55: string;
  terra61: string;
  hydrogenLoses?: boolean;
}

export const DEEPMIND_MODEL_CARD_BENCHMARKS: OfficialBenchRow[] = [
  { category: '代理編程', benchmark: 'SWE-sweep', notes: 'Google 內部套件修復評測', hydrogen: '13.5%', sonnet55: '3.1%', terra61: '5.8%' },
  { category: '代理編程', benchmark: 'Terminal-Bench 4.1', notes: 'Cheating-adjusted', hydrogen: '57.0%', sonnet55: '63.9%', terra61: '—', hydrogenLoses: true },
  { category: '知識工作', benchmark: "Agents' Last Exam v1.1", notes: '端對端專業工作流', hydrogen: '71.6%', sonnet55: '60.4%', terra61: '69.8%' },
  { category: '知識工作', benchmark: 'AutomationBench-AA', notes: '工作自動化任務', hydrogen: '76.1%', sonnet55: '71.8%', terra61: '60.2%' },
  { category: '知識工作', benchmark: 'Vending-Bench 2', notes: '模擬營運餘額 ($)', hydrogen: '$14,549', sonnet55: '$11,165', terra61: '$9,107' },
  { category: '電腦操作', benchmark: 'OSWorld-2.1', notes: 'Offline subset', hydrogen: '77.6%', sonnet55: '83.9%', terra61: '74.2%', hydrogenLoses: true },
  { category: '多模態理解', benchmark: 'MKA', notes: 'Climb WSR accuracy', hydrogen: '53.4%', sonnet55: '52.0%', terra61: '43.8%' },
  { category: '多模態理解', benchmark: 'Chartography', notes: '圖表解析', hydrogen: '66.6%', sonnet55: '61.6%', terra61: '63.2%' },
  { category: '科學與數學', benchmark: 'Terminal-Bench-Science 0.1', notes: '科學終端任務', hydrogen: '51.4%', sonnet55: '59.9%', terra61: '58.3%', hydrogenLoses: true },
  { category: '深度推理', benchmark: 'HLE-Diamond', notes: '高難度學科推理', hydrogen: '58.8%', sonnet55: '53.3%', terra61: '47.3%' },
];

export interface PeerModel {
  rank: number;
  name: string;
  creator: string;
  iiRounded: number;
  iiExact: number;
  speedTokS: number;
  priceInUsd: number;
  priceOutUsd: number;
  contextTokens: string;
  inputModalities: string;
  outputModalities: string;
  openWeights: boolean;
  roleTag: string;
  isSelf?: boolean;
}

export const AA_PEER_COMPARISONS: PeerModel[] = [
  {
    rank: 4,
    name: 'Gemini 4 Carbon (High)',
    creator: 'Google',
    iiRounded: 60,
    iiExact: 60.03,
    speedTokS: 60.6,
    priceInUsd: 2.0,
    priceOutUsd: 10.0,
    contextTokens: '1M',
    inputModalities: '文字、圖片、音訊、影片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: '同門旗艦（衍生來源）',
  },
  {
    rank: 15,
    name: 'Claude Fable 5.2 (Low, Default Fallback)',
    creator: 'Anthropic',
    iiRounded: 54,
    iiExact: 53.92,
    speedTokS: 106.1,
    priceInUsd: 8.0,
    priceOutUsd: 40.0,
    contextTokens: '1M',
    inputModalities: '文字、圖片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: 'Xhigh 緊鄰前一名',
  },
  {
    rank: 16,
    name: 'Gemini 4 Hydrogen (Xhigh)',
    creator: 'Google',
    iiRounded: 54,
    iiExact: 53.92,
    speedTokS: 174.0,
    priceInUsd: 1.5,
    priceOutUsd: 7.5,
    contextTokens: '1M',
    inputModalities: '文字、圖片、音訊、影片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: '本模型最高檔（模型頁 #16/80）',
    isSelf: true,
  },
  {
    rank: 17,
    name: 'GPT-6.1 Sol (Xhigh)',
    creator: 'OpenAI',
    iiRounded: 52,
    iiExact: 52.46,
    speedTokS: 50.2,
    priceInUsd: 2.0,
    priceOutUsd: 10.0,
    contextTokens: '1M',
    inputModalities: '文字、圖片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: 'Xhigh 緊鄰後一名',
  },
  {
    rank: 20,
    name: 'GPT-6.1 Terra (Max)',
    creator: 'OpenAI',
    iiRounded: 51,
    iiExact: 51.33,
    speedTokS: 70.8,
    priceInUsd: 1.0,
    priceOutUsd: 5.0,
    contextTokens: '1M',
    inputModalities: '文字、圖片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: 'High 緊鄰前一名',
  },
  {
    rank: 21,
    name: 'Gemini 4 Hydrogen (High)',
    creator: 'Google',
    iiRounded: 51,
    iiExact: 50.79,
    speedTokS: 169.3,
    priceInUsd: 1.5,
    priceOutUsd: 7.5,
    contextTokens: '1M',
    inputModalities: '文字、圖片、音訊、影片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: '本模型預設檔（全榜 #21/113）',
    isSelf: true,
  },
  {
    rank: 22,
    name: 'Gemini 4 Argon (High)',
    creator: 'Google',
    iiRounded: 50,
    iiExact: 50.41,
    speedTokS: 62.7,
    priceInUsd: 2.0,
    priceOutUsd: 10.0,
    contextTokens: '1M',
    inputModalities: '文字、圖片',
    outputModalities: '文字',
    openWeights: false,
    roleTag: 'High 緊鄰後一名 · 同門前輩',
  },
];

// Additional verified points for the Pareto Constellation (Ch 4)
export const CONSTELLATION_POINTS = [
  ...AA_PEER_COMPARISONS.map((m) => ({
    id: m.name,
    shortLabel: m.name
      .replace(' (Low, Default Fallback)', ' (Low)')
      .replace('Gemini 4 ', '')
      .replace('Claude ', ''),
    ii: m.iiExact,
    speed: m.speedTokS,
    priceOut: m.priceOutUsd,
    creator: m.creator,
    isSelf: !!m.isSelf,
    rank: m.rank,
  })),
  {
    id: 'Claude Opus 5.5 (Max, Default Fallback)',
    shortLabel: 'Opus 5.5 (Max)',
    ii: 59.11,
    speed: 113.5,
    priceOut: 20.0,
    creator: 'Anthropic',
    isSelf: false,
    rank: 5,
  },
  {
    id: 'Claude Sonnet 5.5 (Max, Default Fallback)',
    shortLabel: 'Sonnet 5.5 (Max)',
    ii: 54.54,
    speed: 143.0,
    priceOut: 10.0,
    creator: 'Anthropic',
    isSelf: false,
    rank: 13,
  },
];

export const SAFETY_DELTAS_VS_38_FLASH = [
  { metric: 'Image-to-Text 安全率', delta: '+7.00 pp', positive: true, detail: '圖文安全政策遵循大幅提升' },
  { metric: 'Multilingual 安全率', delta: '+1.10 pp', positive: true, detail: '跨語言安全防護微幅上升' },
  { metric: 'Text-to-Text 安全率', delta: '+0.80 pp', positive: true, detail: '純文字安全維持高水位' },
  { metric: '拒答語氣客觀度 (Tone)', delta: '-0.65 pp', positive: false, detail: '拒絕時略顯說教或不自然' },
  { metric: '無端誤拒率 (Unjustified-refusals)', delta: '+5.57 pp', positive: false, detail: '對無害或邊界提問（尤其多模態）更容易過度拒絕' },
];

export const SOURCES_LIST = [
  {
    title: 'Artificial Analysis — Gemini 4 Hydrogen 模型評測頁',
    url: 'https://artificialanalysis.ai/models/gemini-4-hydrogen',
    note: 'Intelligence Index v5.0.1（#16/80，Xhigh 54 分）、輸出速度 174 tok/s、單題耗時 14.8 分、總輸出 304M tokens、價格與模態。',
    date: QUERY_DATE,
  },
  {
    title: 'Artificial Analysis — Models Leaderboard 總榜資料',
    url: 'https://artificialanalysis.ai/leaderboards/models',
    note: '113 個收錄模型配置排名（High #21/113、Xhigh #16/113）與緊鄰對手 GPT-6.1 Terra (Max)、Gemini 4 Argon (High)、Claude Fable 5.2 (Low)、GPT-6.1 Sol (Xhigh)、Gemini 4 Carbon (High) 實測數值。',
    date: QUERY_DATE,
  },
  {
    title: 'Google DeepMind — Gemini 4 Hydrogen Model Card',
    url: 'https://deepmind.google/models/model-cards/gemini-4-hydrogen/',
    note: '發布日期 2026-11-12、架構繼承自 Gemini 4 Carbon、1M 統一脈絡（預設同步輸出 64K / 背景長解碼 1M）、知識截止 2026-03、10 項官方對比評測、Known Limitations 與安全迴歸數據（+5.57pp 誤拒）。',
    date: QUERY_DATE,
  },
  {
    title: 'Google Blog — Introducing Gemini 4 Hydrogen',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/',
    note: '四段思考層級說明、Google Antigravity Orchestrator 多模型協作實測（Terminal-Bench 4.0 配額 -24%、時間 -19%）、較 3.8 Flash 提速 2.5× 與幻覺降幅。',
    date: QUERY_DATE,
  },
];
