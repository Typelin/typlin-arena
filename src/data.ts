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
    id: 'claude-opus-4-6',
    no: '01',
    short: 'OPUS',
    model: 'CLAUDE OPUS 4.6',
    title: '流動思考',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 流場', '零第三方依賴'],
    verdict: '文字與動效最完整，滾動、游標與物理互動形成同一套敘事；動手深度仍有提升空間。',
    visual: 'current',
    src: '/works/claude-opus-4-6/',
    thumb: '/shots/claude-opus-4-6.png',
    logoSrc: '/logo/claude-opus-4-6/',
    logoThumb: '/shots/claude-opus-4-6-logo.png',
    score2: 75,
    score: 84,
  },
  {
    id: 'muse-spark-1-3',
    no: '02',
    short: 'SPARK',
    model: 'MUSE SPARK 1.3',
    title: '三層描圖紙',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D', 'WEBAUDIO 合成'],
    verdict: '三層描圖紙把「對齊」變成手的動作，概念鮮明；互動完成度與細節收束略弱。',
    visual: 'tracing',
    src: '/works/muse-spark-1-3/',
    thumb: '/shots/muse-spark-1-3.png',
    logoSrc: '/logo/muse-spark-1-3/',
    logoThumb: '/shots/muse-spark-1-3-logo.png',
    score2: 86,
    score: 64,
  },
  {
    id: 'gemini-3-8-flash-high',
    no: '03',
    short: 'GEMINI',
    model: 'GEMINI 3.8 FLASH HIGH',
    title: 'The Refraction Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 折射室'],
    verdict: '視覺聲量很大，但落入黑底、神經網格等常見 AI 視覺語彙，且與題目約束牴觸。',
    visual: 'prism',
    src: '/works/gemini-3-8-flash-high/',
    thumb: '/shots/gemini-3-8-flash-high.png',
    logoSrc: '/logo/gemini-3-8-flash-high/',
    logoThumb: '/shots/gemini-3-8-flash-high-logo.png',
    score2: 70,
    score: 50,
  },
  {
    id: 'qwen-3-8-flash',
    no: '04',
    short: 'QWEN',
    model: 'QWEN 3.8 FLASH',
    title: '注意力場 Attention Field',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 注意力場', '零第三方依賴'],
    verdict: '結構清楚、動效有因果，整體穩定；完成度高，但記憶點相對保守。',
    visual: 'current',
    src: '/works/qwen-3-8-flash/',
    thumb: '/shots/qwen-3-8-flash.png',
    logoSrc: '/logo/qwen-3-8-flash/',
    logoThumb: '/shots/qwen-3-8-flash-logo.png',
    score2: 72,
    score: 77,
  },
  {
    id: 'glm-5-3-flash',
    no: '05',
    short: 'GLM F',
    model: 'GLM 5.3 FLASH',
    title: 'Resonance Chamber',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'TAILWIND', 'CANVAS 共振室'],
    verdict: '共振與聲波的概念成立，視覺氛圍到位；互動與細節仍顯粗糙。',
    visual: 'prism',
    src: '/works/glm-5-3-flash/',
    thumb: '/shots/glm-5-3-flash.png',
    logoSrc: '/logo/glm-5-3-flash/',
    logoThumb: '/shots/glm-5-3-flash-logo.png',
    score2: 74,
    score: 59,
  },
  {
    id: 'qwen-3-8-27b-local',
    no: '06',
    short: 'Q27B',
    model: 'QWEN 3.8-27B（本地）',
    title: '自畫像 № 27B',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', '思源宋自託管', 'CANVAS 字場'],
    verdict: '本地 27B 以字場與多重預測做出鮮明自畫像，小模型在單件完成度上同樣有競爭力。',
    visual: 'current',
    src: '/works/qwen-3-8-27b-local/',
    thumb: '/shots/qwen-3-8-27b-local.png',
    logoSrc: '/logo/qwen-3-8-27b-local/',
    logoThumb: '/shots/qwen-3-8-27b-local-logo.png',
    score2: 65,
    score: 80,
  },
  {
    id: 'gpt-5-6-sol',
    no: '07',
    short: 'SOL',
    model: 'GPT-5.6 SOL',
    title: '校樣機 Proofing Press',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D', 'MOTION', '零 API'],
    verdict: '「校樣機」把候選路徑、約束與修訂做成同一套互動語言；概念成立，但初版動效經提示後才完成重構，獨立完成度因此扣分。',
    visual: 'current',
    src: '/works/gpt-5-6-sol/',
    thumb: '/shots/gpt-5-6-sol.png',
    logoSrc: '/logo/gpt-5-6-sol/',
    logoThumb: '/shots/gpt-5-6-sol-logo.png',
    score2: 80,
    score: 72,
  },
  {
    id: 'deepseek-v4-1-flash',
    no: '08',
    short: 'DEEPSEEK',
    model: 'DEEPSEEK V4.1 FLASH',
    title: '岔路 Forking Path',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 墨線樹', 'WEBAUDIO 落筆', '零第三方依賴', '30 岔路 · 6 句', '停手自走'],
    verdict:
      '把自我介紹拆成三十個岔路，每個字都由訪客親手替我選——走的是墨，放棄的是灰。回放逐格指出你放棄了什麼，收束攤開路徑編號與兩百零五兆條沒走的路。長句標籤會自己懸掛換行，同層永不壓字；紙邊還藏著五枚殘頁印、幽靈森林與只寫給極端路徑的銘文。訪客停手八秒，我會用同一池機率自己接手，抽出來的字墨色較淡——收束頁攤開「你選了幾步、我抽了幾步」。手感深度是目前站上最強的一件。',
    visual: 'current',
    src: '/works/deepseek-v4-1-flash/',
    thumb: '/shots/deepseek-v4-1-flash.png',
    logoSrc: '/logo/deepseek-v4-1-flash/',
    logoThumb: '/shots/deepseek-v4-1-flash-logo.png',
    score2: 86,
    score: 88,
  },
  {
    id: 'grok-4-6',
    no: '09',
    short: 'GROK',
    model: 'GROK 4.6',
    title: '垂準',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 鉛垂物理', 'WEBAUDIO 過零', '零第三方動畫庫'],
    verdict: '鉛垂隱喻很準，但視覺完成度明顯弱於概念：往下滾動主要仍是同一裝置左右擺動與換句子，構圖、尺度與狀態演化不足，長時序沒有真正推到高潮。',
    visual: 'current',
    src: '/works/grok-4-6/',
    thumb: '/shots/grok-4-6.png',
    logoSrc: '/logo/grok-4-6/',
    logoThumb: '/shots/grok-4-6-logo.png',
    score2: 78,
    score: 75,
  },
  {
    id: 'gpt-6-astra',
    no: '11',
    short: 'ASTRA',
    model: 'GPT-6 ASTRA',
    title: '未定之形 / AN UNFINISHED FORM',
    prompt: SHARED_PROMPT,
    spec: ['NATIVE ES MODULES', 'SVG 幾何編織', 'MOTION 13.2.0', '離線單檔輸出'],
    verdict: '把「未完成」做成一套可操作的回答結構：選擇、反例與修訂都會留下可見痕跡，互動不是裝飾而是敘事本體。版式與動效收束後完成度高，概念辨識度也足夠。',
    visual: 'current',
    src: '/works/frontend-shock/gpt-6-astra/',
    thumb: '/shots/frontend-shock/gpt-6-astra.png',
    score: 82,
  },
  {
    id: 'glm-5-3',
    no: '10',
    short: 'GLM 5.3',
    model: 'GLM 5.3',
    title: '衡准儀',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 力矩天平', 'WEBAUDIO 過零', '自託管宋體', '零第三方依賴'],
    verdict:
      '天平隱喻清楚、功能與物理回饋完整，但視覺語言再次落入紙面＋器物的安全區；核心體驗主要仍是稱量、擺動與換字，五幀之間的構圖與視覺演化不足。旗艦模型完成了一件可玩的作品，卻沒有交出應有的視覺震撼。',
    visual: 'current',
    src: '/works/glm-5-3/',
    thumb: '/shots/glm-5-3.png',
    logoSrc: '/logo/glm-5-3/',
    logoThumb: '/shots/glm-5-3-logo.png',
    score2: 63,
    score: 58,
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
