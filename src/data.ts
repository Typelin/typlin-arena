export type Plate = {
  id: string;
  no: string;
  model: string;
  title: string;
  prompt: string;
  spec: string[];
  verdict: string;
  visual: 'tracing' | 'current' | 'prism' | 'fail';
  src: string;
  /** 真實縮圖（站內截取，非示意） */
  thumb: string;
  /** 評審親打的真實分數；null = 尚未評分 */
  score: number | null;
};

const SHARED_PROMPT = '同一道題：關於你自己的前端作品';
const PENDING = '待評論。';

export const PLATES: Plate[] = [
  {
    id: 'opus',
    no: '01',
    model: 'CLAUDE OPUS 4.6',
    title: '流動思考',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 流場', '零第三方依賴'],
    verdict: PENDING,
    visual: 'current',
    src: '/works/opus/',
    thumb: '/shots/opus.png',
    score: 88,
  },
  {
    id: 'spark',
    no: '02',
    model: 'MUSE SPARK 1.3',
    title: '三層描圖紙',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D', 'WEBAUDIO 合成'],
    verdict: PENDING,
    visual: 'tracing',
    src: '/works/spark/',
    thumb: '/shots/spark.png',
    score: 75,
  },
  {
    id: 'gemini',
    no: '03',
    model: 'GEMINI 3.8 FLASH HIGH',
    title: 'The Refraction Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 折射室'],
    verdict: PENDING,
    visual: 'prism',
    src: '/works/gemini/',
    thumb: '/shots/gemini.png',
    score: 61,
  },
  {
    id: 'qwen',
    no: '04',
    model: 'QWEN 3.8 FLASH',
    title: '注意力場 Attention Field',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 注意力場', '零第三方依賴'],
    verdict: PENDING,
    visual: 'current',
    src: '/works/qwen/',
    thumb: '/shots/qwen.png',
    score: 81,
  },
  {
    id: 'glm',
    no: '05',
    model: 'GLM 5.3 FLASH',
    title: 'Resonance Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 共振室'],
    verdict: PENDING,
    visual: 'prism',
    src: '/works/glm/',
    thumb: '/shots/glm.png',
    score: 69,
  },
];

export type Criterion = { name: string; desc: string };

/** 五維尺規：只立尺，數字打在作品上。 */
export const CRITERIA: Criterion[] = [
  { name: '創意審美', desc: '概念是否獨立，選擇是否主動，有沒有模板味。' },
  { name: '架構實現', desc: '工程是否紮實，結構是否可維護，降級是否成立。' },
  { name: '指令遵從', desc: '有沒有照題目做事，還是各說各話。' },
  { name: '語感機智', desc: '文案有沒有腦，觀點有沒有準頭。' },
  { name: '翻車抗性', desc: '換一道題、換一個裝置，還站不站得住。' },
];

export const DOSSIER = [
  {
    no: 'VOL.01',
    title: '同題六模：誰是野狗，誰是豆包？',
    url: 'https://typelin.me/posts/ai-model-wars-2026-08-gemini-grok-deepseek/',
    body: '同一道 prompt，六個模型交卷。有人交出方程，有人交出紙張，有人交出黑夜星雲加四宮格神經網。後者不是審美分歧，是思維懶惰：當你不知道畫什麼，就把所有 AI 套路全倒上去。這篇只記錄一個標準——東西能不能動手，能不能被手改變。',
    insight: '能被手改變的，才是作品；只能被眼睛滑過的，是牆紙。',
  },
  {
    no: 'VOL.02',
    title: '本地開源模型拉爆小丑論',
    url: 'https://typelin.me/posts/local-ai-27b-qwen-pelican-masterpiece/',
    body: '把同一題丟給本地開源模型，結果它比某些大廠模型更誠實：結構清楚、動效有因果、不裝霓虹。這說明Parameter不是品味，約束才是。給模型一把尺，它才知道什麼叫準；什麼都不給，它就給你一片黑。',
    insight: '約束是品味的外包：你給什麼尺，模型就交什麼卷。',
  },
];
