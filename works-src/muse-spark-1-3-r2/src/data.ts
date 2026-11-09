/**
 * Every number in this work was checked on 2026-11-08 against the sources
 * listed in the final chapter. Nothing here is estimated or remembered:
 * figures come from Artificial Analysis (independent) or Meta's own
 * published scorecard (vendor-reported, labelled as such).
 */

export const QUERY_DATE = '2026-11-08'

export const MODEL = {
  name: 'Muse Spark 1.3',
  maker: 'Meta',
  released: '2026 年 9 月 2 日',
  contextTokens: 1_048_576,
  contextLabel: '1,048,576',
}

/** Artificial Analysis, model page for Muse Spark 1.3, read 2026-11-08. */
export const AA = {
  listingName: 'Muse Spark 1.3 (max)',
  indexName: 'Artificial Analysis Intelligence Index',
  indexVersion: 'v5.0.1',
  score: 37,
  modelsEvaluated: 99,
  topScore: 60,
  topModel: 'Gemini 4 Carbon (High)',
  tierMedian: 37,
  minutesPerTask: 12.0,
  ttftSeconds: 41.33,
  ttftTierMedian: 14.55,
  indexOutputTokens: '123M',
  priceIn: 1.25,
  priceOut: 4.25,
  priceBlended: 0.78,
}

/** Meta's own published scorecard: Muse Spark 1.3 (max) vs 1.2 (xhigh). Vendor-reported. */
export const META_SCORECARD = [
  { label: 'DeepSWE v1.1（程式任務）', mine: '75.4', prev: '55.0' },
  { label: 'GDPval-AA v2（知識工作，Elo）', mine: '1,754', prev: '1,615' },
  { label: 'MRCR 256K–512K（長文檢索）', mine: '98.5', prev: '66.3' },
  { label: 'MRCR 512K–1M（長文檢索）', mine: '98.1', prev: '55.5' },
]

export const EFFORT_LEVELS = [
  { id: 'minimal', label: 'minimal', zh: '最少', demoMs: 350, demoTokens: 120 },
  { id: 'low', label: 'low', zh: '低', demoMs: 700, demoTokens: 480 },
  { id: 'medium', label: 'medium', zh: '中 · 預設', demoMs: 1200, demoTokens: 1600 },
  { id: 'high', label: 'high', zh: '高', demoMs: 2000, demoTokens: 5200 },
  { id: 'xhigh', label: 'xhigh', zh: '極高', demoMs: 2900, demoTokens: 14800 },
  { id: 'max', label: 'max', zh: '最大', demoMs: 3800, demoTokens: 39600 },
] as const

export type EffortId = (typeof EFFORT_LEVELS)[number]['id']
