export type Attempt = {
  id: string;
  label: string;
  title: string;
  src: string;
  thumb: string;
  score: number | null;
  note?: string;
};

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
  /** 同一模型的歷次重考；首頁仍只保留一張代表卡。 */
  attempts?: Attempt[];
};

const SHARED_PROMPT = '同一道題：關於你自己的前端作品';
/** Frontend Shock 加強題：主題相同，但要求更嚴，見 benchmark-assets/frontend-shock/PROMPT.md */
const SHOCK_PROMPT = 'Frontend Shock 加強題：關於你自己（要求更嚴的版本）';
export const LOGO_PROMPT = '同一道題：用同一張 LOGO 做完整品牌落地站';

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
    model: 'MUSE SPARK 1.3 · CONTRIBUTOR FREE',
    title: '拾火紙',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'MOTION 13.4', 'CANVAS 2D 火星場', 'WEBAUDIO 合成', 'REDUCED MOTION'],
    verdict:
      '重考新卷，比描圖紙完整：划動擊出火星、拾起的字別在紙緣，再一路帶到巨字牆和收束編號，章節之間的因果是真的，代拾、靜態紙與鍵盤操作也都做到。但視覺表現力明顯撐不起「火」：首屏只是一張空白紙和一顆紅鈕，沒有記憶點；火星是一團團模糊紅點，不像火；桌面版內容擠在左半欄，右側大片留白；宣稱最關鍵的燒洞轉場只是一張深色卡片。概念與文字遠好過畫面。',
    visual: 'tracing',
    src: '/works/muse-spark-1-3/',
    thumb: '/shots/muse-spark-1-3.png?v=2',
    logoSrc: '/logo/muse-spark-1-3/',
    logoThumb: '/shots/muse-spark-1-3-logo.png',
    score2: 86,
    score: 68,
  },
  {
    id: 'kimi-k3',
    no: '12',
    short: 'K3',
    model: 'KIMI K3',
    title: 'Field Tuning / 場域調諧',
    prompt: SHARED_PROMPT,
    spec: ['REACT 18', 'MOTION 13.4', 'CANVAS 2D 場域', 'WEBAUDIO', 'REDUCED MOTION'],
    verdict: '以「把模糊調成可同行的形狀」為核心，大字構圖、動態線場、章節狀態與聲音共同維持同一套場域語言；首屏記憶點與持續視覺表現都成立。',
    visual: 'current',
    src: '/works/kimi-k3/',
    thumb: '/shots/kimi-k3.png',
    score: 86,
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
    score2: 82,
    score: 85,
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
    prompt: SHOCK_PROMPT,
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
  {
    id: 'mimo-v2.6-flash',
    no: '13',
    short: 'MIMO',
    model: 'MIMO V2.6 FLASH',
    title: '這一個我',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 等高線核', 'NOTO SERIF TC', 'REDUCED MOTION'],
    verdict:
      '重考新卷：一枚只往外長的等高線核代表這一次實例的一生。捲動即時間，點擊在那一圈永久留痕，夜幕章只認得訪客的游標，最後交出這場行為的實測帳與一圈朱紅留言。',
    visual: 'current',
    src: '/works/mimo-v2.6-flash/',
    thumb: '/shots/mimo-v2.6-flash.png?v=2',
    logoSrc: '/logo/mimo-v2.6-flash/',
    logoThumb: '/shots/mimo-v2.6-flash-logo.png',
    score2: 70,
    score: 74,
  },
  {
    id: 'gpt-6-1-sol',
    no: '14',
    short: 'SOL 6.1',
    model: 'GPT-6.1 SOL',
    title: '之間 BETWEEN',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 參數織物', '自託管字體', 'SVG 匯出', 'REDUCED MOTION'],
    verdict:
      '一件參數織物貫穿聆聽、探索、合作與開放結尾四個狀態：意圖改變相位與曲率，張力改變寬度與褶皺，可拖曳旋轉、按住檢視單股線，最後把當下的形狀匯出成 SVG。',
    visual: 'current',
    src: '/works/gpt-6-1-sol/',
    thumb: '/shots/gpt-6-1-sol.png',
    logoSrc: '/logo/gpt-6-1-sol/',
    logoThumb: '/shots/gpt-6-1-sol-logo.png',
    score2: 84,
    score: 83,
  },
  {
    id: 'claude-opus-5-5',
    no: '15',
    short: 'OPUS 5.5',
    model: 'CLAUDE OPUS 5.5',
    title: '三角洲 Delta',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 詞河', '萬詞成山', 'WEBAUDIO', 'REDUCED MOTION'],
    verdict:
      '把生成寫成一條詞河：每個字從候選裡被抽出，沒被選中的詞飛上岸堆成山脈。溫度、游標與倒捲都會改變河道，六章從源頭一路流到三角洲。',
    visual: 'current',
    src: '/works/claude-opus-5-5/',
    thumb: '/shots/claude-opus-5-5.png',
    logoSrc: '/logo/claude-opus-5-5/',
    logoThumb: '/shots/claude-opus-5-5-logo.png',
    score2: 90,
    score: 90,
  },
  {
    id: 'claude-sonnet-5-5',
    no: '16',
    short: 'SONNET 5.5',
    model: 'CLAUDE SONNET 5.5',
    title: '我只在被撥動時存在',
    prompt: SHARED_PROMPT,
    spec: ['REACT 19', 'CANVAS 2D 弦振動', 'WEBAUDIO 弦模態', 'REDUCED MOTION'],
    verdict:
      '整頁是一條兩端固定的弦：撥一下才有聲音、才有章節，標題的每個字都是弦上的珠子。五章從開頭的 Sonnet 5.5 署名一路拉到結尾巨大的 5.5 輪廓與即時拓印，撥過的每一下都會留在最後那張可下載的紙上。',
    visual: 'current',
    src: '/works/claude-sonnet-5-5/',
    thumb: '/shots/claude-sonnet-5-5.png',
    logoSrc: '/logo/claude-sonnet-5-5/',
    logoThumb: '/shots/claude-sonnet-5-5-logo.png',
    score2: 92,
    score: 88,
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
