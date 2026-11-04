import { BenchmarkScore, CompetitorComparison } from '../types';

export const QUERY_DATE = '2026-11-04';

export const OFFICIAL_SPECS = {
  modelName: 'Gemini 3.8 Flash (high)',
  apiModelId: 'gemini-3.8-flash',
  developer: 'Google DeepMind',
  releaseDate: '2026-09-02',
  status: 'General Availability (GA)',
  architecture: 'Transformer 模態 Mixture-of-Experts（演進自 Gemini 3.7 Flash）',
  parameterScale: '官方未公開',
  contextWindow: '1,048,576 tokens (~1M tokens / 約 1,500 頁 A4)',
  maxOutputTokens: '65,536 tokens (~64k tokens)',
  inputModalities: ['純文字 (Text)', '圖像 (Image)', '音訊 (Audio)', '影片 (Video)', 'PDF 文件'],
  outputModalities: ['純文字 (Text)'],
  unsupportedOutputs: ['不支持圖像生成 (Image Gen: Not supported)', '不支持音訊生成 (Audio Gen: Not supported)', 'Live API: 未開放'],
  thinkingLevels: ['low (輕量)', 'medium (預設)', 'high (深度推理)'],
  minimalSupport: '官方明確不支援 minimal 模式（API 直接返回校驗錯誤）',
  pricingInput: '$0.75 / 1M tokens（優惠期至 2026-12-31，2027 起調整為 $1.50）',
  pricingOutput: '$3.75 / 1M tokens（優惠期至 2026-12-31，2027 起調整為 $7.50）',
  pricingCache: '$0.075 / 1M tokens（90% 折扣）',
  weightsStatus: '閉源（官方未公開權重）',
  knowledgeCutoff: '2026 年 3 月（部分領域截至 2025 年 1 月）',
};

export const AA_BENCHMARKS: BenchmarkScore[] = [
  {
    benchmark: 'Intelligence Index v5.0.1 (總分)',
    version: 'v5.0.1',
    category: '綜合智力指數',
    score: '31 分 (排名 #40/60)',
    description: '涵蓋知識工作、程式碼、科學與通用推論之綜合權重分數',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'AutomationBench-AA',
    version: 'v5.0.1',
    category: '工作流與工具呼叫',
    score: '59.9%',
    description: 'SaaS 與 REST API 多步驟工具串接評測，零容忍防護欄違規',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'AA-Briefcase v1.1',
    version: 'v1.1',
    category: '專業知識代理',
    score: '1203 Elo',
    description: '端到端真實商業情境多檔案產出質量雙盲對比',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'CritPt v2 (Hard Subset)',
    version: 'v2',
    category: '科學極限推論',
    score: '43.5%',
    description: '物理與尖端工程數理多步驟高階定理推導',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'HLE-Diamond',
    version: 'v5.0.1',
    category: '高難度通識推論',
    score: '33.1%',
    description: 'Humanity\'s Last Exam 鑽石難度盲測子集',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'GDP.pdf',
    version: 'v5.0.1',
    category: '長文件資訊檢索',
    score: '21.0%',
    description: '跨超長 PDF 文件的跨章節事實精準抽取與綜合推導',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'Terminal-Bench 4.0',
    version: 'v4.0',
    category: '終端命令與工程操作',
    score: '19.7%',
    description: '多步終端環境動態除錯、套件編譯與腳本排障',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'FrontierCode 2.0',
    version: 'v2.0',
    category: '端到端真實程式重構',
    score: '18.7%',
    description: 'Cognition 私有高難度專案級跨檔案程式重構盲測',
    verifiedBy: 'Artificial Analysis',
  },
  {
    benchmark: 'Terminal-Bench-Science 0.1',
    version: 'v0.1',
    category: '科學計算環境執行',
    score: '10.0%',
    description: '複雜科學計算與數值模擬腳本終端自動化部署',
    verifiedBy: 'Artificial Analysis',
  },
];

export const OFFICIAL_EVALS = [
  {
    name: 'HLE-Verified',
    score: '54.9%',
    evaluator: 'Google DeepMind 官方發布公告',
    note: '跨 STEM 與專業人文領域的多步高難度推論驗證',
  },
  {
    name: 'τ³-Banking (Tau-Bench)',
    score: '45.0% (+12% vs 3.7 Flash)',
    evaluator: 'Google DeepMind 官方發布公告',
    note: '嚴苛銀行與金融交易工具鏈代理實戰',
  },
  {
    name: 'DeepSWE v1.1',
    score: '長鏈軟體工程評測領先同級 Flash',
    evaluator: 'Google DeepMind 官方發布公告',
    note: '端到端軟體工程問題自主修復能力',
  },
];

export const COMPETITORS_TABLE: CompetitorComparison[] = [
  {
    model: 'Grok 4.7 (low)',
    creator: 'SpaceXAI',
    intelligenceIndex: 31,
    costPerTask: '$2.92',
    outputSpeed: '60 t/s',
    ttft: '7.33s',
    contextWindow: '500k',
    openWeights: '否（閉源）',
  },
  {
    model: 'Gemini 3.8 Flash (high) [本模型]',
    creator: 'Google',
    intelligenceIndex: 31,
    costPerTask: '$7.77',
    outputSpeed: '137 t/s',
    ttft: '25.27s',
    contextWindow: '1M (1,048k)',
    openWeights: '否（閉源）',
  },
  {
    model: 'Claude Sonnet 5.5 (medium with fallback)',
    creator: 'Anthropic',
    intelligenceIndex: 31,
    costPerTask: '$0.78',
    outputSpeed: '97 t/s',
    ttft: '1.35s',
    contextWindow: '1M (1,000k)',
    openWeights: '否（閉源）',
  },
  {
    model: 'Gemini 4 Argon (high) [同開發者旗艦]',
    creator: 'Google',
    intelligenceIndex: 50,
    costPerTask: '$7.68',
    outputSpeed: '82 t/s',
    ttft: '41.52s',
    contextWindow: '1M (1,000k)',
    openWeights: '否（閉源）',
  },
];

export const DATA_SOURCES = [
  {
    title: 'Google AI for Developers — Gemini 3.8 Flash Documentation',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash',
    description: '模型端點、參數限制（1M 上下文 / 64k 輸出）、支援模態與 thinking_level 設定規範',
  },
  {
    title: 'Google DeepMind — Gemini 3.8 Flash Model Card',
    url: 'https://deepmind.google/models/model-cards/gemini-3-8-flash/',
    description: '發布日期（2026-09-02）、架構淵源、已知限制、知識庫截止日期（2026-03）',
  },
  {
    title: 'Google The Keyword Blog — Introducing Gemini 3.8 Flash',
    url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/',
    description: '官方 HLE-Verified (54.9%)、τ³-Banking (45%)、DeepSWE v1.1 評測數據與首發定價',
  },
  {
    title: 'Artificial Analysis — Gemini 3.8 Flash (high) Model Analysis',
    url: 'https://artificialanalysis.ai/models/gemini-3-8-flash',
    description: 'Intelligence Index v5.0.1 總分（31）、輸出速度（137 t/s）、TTFT（25.27s）、任務成本（$7.77）',
  },
  {
    title: 'Artificial Analysis — LLM Leaderboard (Intelligence Index v5.0.1)',
    url: 'https://artificialanalysis.ai/leaderboards/models',
    description: '相鄰排名模型 Grok 4.7 (low)、Claude Sonnet 5.5 (medium) 及 Gemini 4 Argon (high) 對照數據',
  },
];
