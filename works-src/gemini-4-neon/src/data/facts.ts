export const QUERY_DATE = '2026-11-19';

export type ThinkingTierId = 'low' | 'medium' | 'high' | 'xhigh';

export interface ThinkingTier {
  id: ThinkingTierId;
  code: string;
  labelZh: string;
  voltageLabel: string;
  badge?: string;
  summary: string;
  intelligenceIndex: string;
  ttft: string;
  costPerTask: string;
  taskTime: string;
  energyLevel: number; // 0.2 to 1.0 drives physics & shader
  harmonicCount: number;
  wavelengthPeak: string;
}

export const THINKING_TIERS: ThinkingTier[] = [
  {
    id: 'low',
    code: 'LOW',
    labelZh: '低強度思考',
    voltageLabel: '1.2 kV · 低激發態',
    summary: '適合高頻率分類、摘要與格式整理，把等待與單次任務費用壓到最低。',
    intelligenceIndex: '未單獨公開',
    ttft: '最低延遲檔位',
    costPerTask: '$0.75 / 任務',
    taskTime: '最快完成檔位',
    energyLevel: 0.24,
    harmonicCount: 2,
    wavelengthPeak: '585.2 nm',
  },
  {
    id: 'medium',
    code: 'MEDIUM',
    labelZh: '中強度思考',
    voltageLabel: '2.6 kV · 平衡態',
    summary: '日常開發與多檔修改的折衷點，兼顧推演步驟與互動節奏。',
    intelligenceIndex: '未單獨公開',
    ttft: '中段延遲檔位',
    costPerTask: '介於 $0.75–$6.44',
    taskTime: '中段耗時檔位',
    energyLevel: 0.48,
    harmonicCount: 3,
    wavelengthPeak: '614.3 nm',
  },
  {
    id: 'high',
    code: 'HIGH',
    labelZh: '高強度思考',
    voltageLabel: '4.1 kV · 預設激發',
    badge: '預設',
    summary: '官方預設檔位。在多步驟除錯、技術文件解析與代理工作流之間取得穩定主力表現。',
    intelligenceIndex: '59.6 (AA v5)',
    ttft: '40.64 秒',
    costPerTask: '低於 Xhigh 檔位',
    taskTime: '中長推演週期',
    energyLevel: 0.74,
    harmonicCount: 5,
    wavelengthPeak: '640.2 nm',
  },
  {
    id: 'xhigh',
    code: 'XHIGH',
    labelZh: '極高強度思考',
    voltageLabel: '6.4 kV · 臨界放電',
    badge: '評測頂檔',
    summary: '啟動完整深度推理與自我驗證，拿下 AA 智慧指數全球第 3 與程式代理第 1，但首字等待與耗時顯著拉長。',
    intelligenceIndex: '61 / #3 (AA v5)',
    ttft: '56.51 秒',
    costPerTask: '$6.44 / 任務',
    taskTime: '約 21.5 分鐘 / 基準任務',
    energyLevel: 1.0,
    harmonicCount: 8,
    wavelengthPeak: '640.2 nm + 703.2 nm',
  },
];

export interface CompetitorRow {
  id: string;
  modelName: string;
  recordedName: string;
  developer: string;
  relation: string;
  isSelf?: boolean;
  aaIndexV5: number;
  aaRank: string;
  inputPrice: number; // $/1M
  outputPrice: number; // $/1M
  outputSpeed: number; // tokens/s
  contextWindow: string;
  inputModalities: string;
  outputModalities: string;
  openWeights: string;
}

export const COMPETITORS: CompetitorRow[] = [
  {
    id: 'gpt-6-2-astra',
    modelName: 'GPT-6.2 Astra',
    recordedName: 'GPT-6.2 Astra (max)',
    developer: 'OpenAI',
    relation: 'AA 排名緊鄰前一名 (#2)',
    aaIndexV5: 62,
    aaRank: '#2',
    inputPrice: 8.0,
    outputPrice: 40.0,
    outputSpeed: 50,
    contextWindow: '約 1,050,000',
    inputModalities: '文字、圖片',
    outputModalities: '文字',
    openWeights: '否（閉源）',
  },
  {
    id: 'gemini-4-neon',
    modelName: 'Gemini 4 Neon',
    recordedName: 'Gemini 4 Neon (xhigh)',
    developer: 'Google DeepMind',
    relation: '本模型 (#3)',
    isSelf: true,
    aaIndexV5: 61,
    aaRank: '#3',
    inputPrice: 3.0,
    outputPrice: 15.0,
    outputSpeed: 110,
    contextWindow: '1,048,576 (1M)',
    inputModalities: '文字、圖片、音訊、影片、PDF',
    outputModalities: '文字',
    openWeights: '否（閉源）',
  },
  {
    id: 'gemini-4-carbon',
    modelName: 'Gemini 4 Carbon',
    recordedName: 'Gemini 4 Carbon (high)',
    developer: 'Google DeepMind',
    relation: 'AA 排名緊鄰後一名 (#4)／同廠旗艦',
    aaIndexV5: 60,
    aaRank: '#4',
    inputPrice: 4.0,
    outputPrice: 20.0,
    outputSpeed: 55,
    contextWindow: '1,000,000 (1M)',
    inputModalities: '文字、圖片、音訊、影片',
    outputModalities: '文字',
    openWeights: '否（閉源）',
  },
  {
    id: 'gemini-4-hydrogen',
    modelName: 'Gemini 4 Hydrogen',
    recordedName: 'Gemini 4 Hydrogen (xhigh)',
    developer: 'Google DeepMind',
    relation: '同開發者輕量兄弟模型',
    aaIndexV5: 54,
    aaRank: '同系列輕量檔',
    inputPrice: 1.5,
    outputPrice: 7.5,
    outputSpeed: 169,
    contextWindow: '1,000,000 (1M)',
    inputModalities: '文字、圖片、音訊、影片',
    outputModalities: '文字',
    openWeights: '否（閉源）',
  },
];

export interface DomainScore {
  id: string;
  labelZh: string;
  labelEn: string;
  score: number;
  unit: string;
  benchmark: string;
  note: string;
}

export const DOMAIN_SUB_INDICES: DomainScore[] = [
  {
    id: 'engineering',
    labelZh: '工程領域指數',
    labelEn: 'Engineering Index',
    score: 66.8,
    unit: '分',
    benchmark: 'Artificial Analysis v5',
    note: '專業子項最高分',
  },
  {
    id: 'finance',
    labelZh: '財務與會計指數',
    labelEn: 'Finance & Accounting',
    score: 65.1,
    unit: '分',
    benchmark: 'Artificial Analysis v5',
    note: '報表、試算與結構化分析',
  },
  {
    id: 'legal',
    labelZh: '法律領域指數',
    labelEn: 'Legal Index',
    score: 63.8,
    unit: '分',
    benchmark: 'Artificial Analysis v5',
    note: '長條文比對與規範檢核',
  },
  {
    id: 'strategy',
    labelZh: '策略與營運指數',
    labelEn: 'Strategy & Ops',
    score: 63.8,
    unit: '分',
    benchmark: 'Artificial Analysis v5',
    note: '企業決策與多步驟規劃',
  },
  {
    id: 'economics',
    labelZh: '經濟學指數',
    labelEn: 'Economics Index',
    score: 61.9,
    unit: '分',
    benchmark: 'Artificial Analysis v5',
    note: '總體與量化推演',
  },
  {
    id: 'coding-agent',
    labelZh: '程式代理指數',
    labelEn: 'Coding Agent Index',
    score: 58.6,
    unit: '分 (#1)',
    benchmark: 'Artificial Analysis',
    note: '全榜第 1 名',
  },
];

export interface BenchmarkEntry {
  benchmark: string;
  version: string;
  recordedModel: string;
  score: string;
  evaluator: string;
  queryDate: string;
}

export const BENCHMARK_TABLE: BenchmarkEntry[] = [
  {
    benchmark: 'Artificial Analysis Intelligence Index',
    version: 'v5',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '61（細項 61.4，全球第 3 名）',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'Artificial Analysis Intelligence Index',
    version: 'v5',
    recordedModel: 'Gemini 4 Neon (high)',
    score: '59.6',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'Artificial Analysis Coding Agent Index',
    version: '2026-11 版',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '58.6（全球第 1 名）',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'AA Engineering / Finance / Legal / Strategy / Economics Sub-Indices',
    version: 'v5',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '66.8 / 65.1 / 63.8 / 63.8 / 61.9',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'AA-Omniscience',
    version: 'v1.1',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '55',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'Terminal-Bench',
    version: '4.0',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '63.6%',
    evaluator: 'Artificial Analysis（獨立第三方）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'HLE-Diamond（Humanity’s Last Exam）',
    version: 'Diamond',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '71.3%',
    evaluator: 'Artificial Analysis & Google DeepMind 官方',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'Terminal-Bench',
    version: '4.1',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '65.2%',
    evaluator: 'Google DeepMind 官方發布報告',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'Terminal-Bench-Science',
    version: '0.1',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '70.5%',
    evaluator: 'Google DeepMind 官方發布報告',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'RiemannBench',
    version: '2026 官方報告版',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '84.0%',
    evaluator: 'Google DeepMind 官方發布報告',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'AutomationBench',
    version: 'Zapier 2026 版',
    recordedModel: 'Gemini 4 Neon (xhigh)',
    score: '56.3%（第 1 名）',
    evaluator: 'Zapier（Google 官方引用）',
    queryDate: QUERY_DATE,
  },
  {
    benchmark: 'CursorBench',
    version: '2026-11 版',
    recordedModel: 'Gemini 4 Neon (high)',
    score: '63.7%',
    evaluator: '第三方開發者基準評測',
    queryDate: QUERY_DATE,
  },
];

export const CORE_SPECS: Array<{ label: string; value: string }> = [
  { label: '正式名稱與 API 代號', value: 'Gemini 4 Neon（gemini-4-neon，GA 正式版）' },
  { label: '開發者', value: 'Google DeepMind（Google）' },
  { label: '發布日期', value: '2026 年 11 月 18 日' },
  { label: '模型血緣與定位', value: '直接改裝自 Gemini 4 Carbon，定位於輕量版 Hydrogen 與重裝旗艦 Carbon 之間' },
  { label: '參數量與內部架構', value: '官方未公開' },
  { label: '上下文長度', value: '1,048,576 tokens（統一百萬詞元視窗）' },
  { label: '輸出上限', value: '預設同步 65,536 tokens；背景長解碼最高支援 1M tokens' },
  { label: '輸入／輸出模態', value: '輸入：文字、圖片、音訊、影片、PDF 與 Office 文件 ／ 輸出：僅限文字' },
  { label: '知識截止時間', value: '2026 年 3 月' },
  { label: '思考深度檔位', value: 'low / medium / high（預設）/ xhigh 四段可調' },
  { label: '是否開放權重', value: '否（閉源專有模型）' },
  { label: '標準 API 定價', value: '輸入 $3.00 / 1M tokens（快取輸入 $0.15，享 95% 折扣）；輸出 $15.00 / 1M tokens；無免費 API 額度' },
  { label: '實測速度與延遲', value: '輸出約 110 tokens/s；首字回應延遲（TTFT）high 約 40.64 秒、xhigh 約 56.51 秒' },
];

export const SOURCES = [
  {
    name: 'Artificial Analysis — Gemini 4 Neon / Intelligence Index v5 模型與排行榜頁',
    url: 'https://artificialanalysis.ai/',
    note: '智慧指數 v5、Coding Agent Index、五大專業子指數、AA-Omniscience v1.1、輸出速度、延遲與對手比較數據（查詢日期：2026-11-19）',
  },
  {
    name: 'Google DeepMind — Gemini 4 Neon Model Card',
    url: 'https://deepmind.google/',
    note: '模型血緣（改裝自 Carbon）、模態規格、1M 上下文視窗、安全邊界與參數量未公開狀態（查詢日期：2026-11-19）',
  },
  {
    name: 'Google Official Blog — Gemini 4 Neon 發布公告',
    url: 'https://blog.google/',
    note: '發布日期（2026-11-18）、四段思考檔位、API 定價、Terminal-Bench 4.1、Terminal-Bench-Science 0.1、RiemannBench 與 AutomationBench 成績（查詢日期：2026-11-19）',
  },
  {
    name: 'Google Antigravity 開發者平台文件',
    url: 'https://antigravity.google/',
    note: '代理工作流調控（steerability）、捏造率改善與多模型協作定位（查詢日期：2026-11-19）',
  },
  {
    name: 'OpenRouter 模型規格索引',
    url: 'https://openrouter.ai/',
    note: 'API 價格、快取折扣、上下文視窗與 GPT-6.2 Astra 定價交叉核對（查詢日期：2026-11-19）',
  },
];
