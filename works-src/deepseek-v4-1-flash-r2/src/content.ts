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
  { id: 'ch-limits', no: '03', tag: '短處' },
  { id: 'ch-effort', no: '04', tag: '推理強度' },
  { id: 'ch-work', no: '05', tag: '一起工作' },
  { id: 'ch-colophon', no: '06', tag: '資料' },
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
]
