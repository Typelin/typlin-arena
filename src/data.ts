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
  /** 頁籤短名 */
  short: string;
  /** 真實縮圖（站內截取，非示意） */
  thumb: string;
  /** 第二測 LOGO 落地（僅部分作品有） */
  logoSrc?: string;
  logoThumb?: string;
  score2?: number | null;
  /** 評審親打的真實分數；null = 尚未評分 */
  score: number | null;
};

const SHARED_PROMPT = '同一道題：關於你自己的前端作品';

export const PLATES: Plate[] = [
  {
    id: 'opus',
    no: '01',
    short: 'OPUS',
    model: 'CLAUDE OPUS 4.6',
    title: '流動思考',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 流場', '零第三方依賴'],
    verdict: '文字與動效最完整，滾動、游標與物理互動形成同一套敘事；動手深度仍有提升空間。',
    visual: 'current',
    src: '/works/opus/',
    thumb: '/shots/opus.png',
    logoSrc: '/logo/opus/',
    logoThumb: '/shots/opus-logo.png',
    score2: 75,
    score: 88,
  },
  {
    id: 'spark',
    no: '02',
    short: 'SPARK',
    model: 'MUSE SPARK 1.3',
    title: '三層描圖紙',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D', 'WEBAUDIO 合成'],
    verdict: '三層描圖紙把「對齊」變成手的動作，概念鮮明；互動完成度與細節收束略弱。',
    visual: 'tracing',
    src: '/works/spark/',
    thumb: '/shots/spark.png',
    logoSrc: '/logo/spark/',
    logoThumb: '/shots/spark-logo.png',
    score2: 86,
    score: 71,
  },
  {
    id: 'gemini',
    no: '03',
    short: 'GEMINI',
    model: 'GEMINI 3.8 FLASH HIGH',
    title: 'The Refraction Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 折射室'],
    verdict: '視覺聲量很大，但落入黑底、神經網格等常見 AI 視覺語彙，且與題目約束牴觸。',
    visual: 'prism',
    src: '/works/gemini/',
    thumb: '/shots/gemini.png',
    logoSrc: '/logo/gemini/',
    logoThumb: '/shots/gemini-logo.png',
    score2: 70,
    score: 61,
  },
  {
    id: 'qwen',
    no: '04',
    short: 'QWEN',
    model: 'QWEN 3.8 FLASH',
    title: '注意力場 Attention Field',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 注意力場', '零第三方依賴'],
    verdict: '結構清楚、動效有因果，整體穩定；完成度高，但記憶點相對保守。',
    visual: 'current',
    src: '/works/qwen/',
    thumb: '/shots/qwen.png',
    logoSrc: '/logo/qwen/',
    logoThumb: '/shots/qwen-logo.png',
    score2: 72,
    score: 81,
  },
  {
    id: 'glm',
    no: '05',
    short: 'GLM',
    model: 'GLM 5.3 FLASH',
    title: 'Resonance Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 共振室'],
    verdict: '共振與聲波的概念成立，視覺氛圍到位；互動與細節仍顯粗糙。',
    visual: 'prism',
    src: '/works/glm/',
    thumb: '/shots/glm.png',
    logoSrc: '/logo/glm/',
    logoThumb: '/shots/glm-logo.png',
    score2: 74,
    score: 69,
  },
  {
    id: 'qw27',
    no: '06',
    short: 'Q27B',
    model: 'QWEN 3.8-27B（本地）',
    title: '自畫像 № 27B',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', '思源宋自託管', 'CANVAS 字場'],
    verdict: '本地 27B 以字場與多重預測做出鮮明自畫像，小模型在單件完成度上同樣有競爭力。',
    visual: 'current',
    src: '/works/qw27/',
    thumb: '/shots/qw27.png',
    score: 85,
  },
  {
    id: 'gpt56sol',
    no: '07',
    short: 'SOL',
    model: 'GPT-5.6 SOL',
    title: '校樣機 Proofing Press',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D', 'MOTION', '零 API'],
    verdict: '「校樣機」把候選路徑、約束與修訂做成同一套互動語言；概念成立，但初版動效經提示後才完成重構，獨立完成度因此扣分。',
    visual: 'current',
    src: '/works/gpt56sol/',
    thumb: '/shots/gpt56sol.png',
    score: 74,
  },
  {
    id: 'deepseek',
    no: '08',
    short: 'DEEPSEEK',
    model: 'DEEPSEEK V4.1 FLASH',
    title: '測深 Sounding',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 聲納', 'WEBAUDIO PING', '零第三方依賴'],
    verdict: '把「自我介紹」整件事沉到水裡，改用聲納給訪客一把尺；概念徹底，克制得有理。',
    visual: 'current',
    src: '/works/deepseek/',
    thumb: '/shots/deepseek.png',
    score: null,
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
