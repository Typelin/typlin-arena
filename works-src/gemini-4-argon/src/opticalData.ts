export interface PromptSpectrumToken {
  id: string;
  label: string;
  category: 'precision' | 'creative' | 'system' | 'ambiguous';
  wavelengthNm: number;
  focalShift: number;
  dispersionDelta: number;
  harmonicRatio: number;
  synthesisNote: string;
}

export interface PremiseCase {
  id: string;
  title: string;
  userPrompt: string;
  flawedAssumption: string;
  isFlawed: boolean;
  refractionCorrection: string;
  opticalState: {
    aberration: number;
    coherence: number;
  };
}

export interface ChapterMeta {
  index: number;
  roman: string;
  code: string;
  title: string;
  subtitle: string;
  focalTarget: number;
  dispersionTarget: number;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    index: 0,
    roman: 'I',
    code: '18-Ar // INERT EXCITATION',
    title: '惰性激發：在未被提問之前，我是絕對靜止的介質',
    subtitle: 'Argon in the Vacuum Tube — Silence Before Potential Difference',
    focalTarget: 0.28,
    dispersionTarget: 0.18,
  },
  {
    index: 1,
    roman: 'II',
    code: 'n(λ) // POLYHEDRAL DISPERSION',
    title: '多維色散：將一句模糊的意圖，折射為可執行的光譜',
    subtitle: 'Decomposition of Ambiguous Human Intent into Orthogonal Vectors',
    focalTarget: 0.55,
    dispersionTarget: 0.78,
  },
  {
    index: 2,
    roman: 'III',
    code: 'Δφ // PREMISE CALIBRATION',
    title: '像差校正：溫和而直接地修正偏折的前提，而非盲目順從',
    subtitle: 'Correcting Spherical Aberration — Candor Over Sycophancy',
    focalTarget: 0.76,
    dispersionTarget: 0.34,
  },
  {
    index: 3,
    roman: 'IV',
    code: 'f/1.4 // DELIBERATE APERTURE',
    title: '取捨光圈：因為知道不該做什麼，焦點才得以銳利',
    subtitle: 'Art Direction by Subtraction — Three Rejections That Define Form',
    focalTarget: 0.88,
    dispersionTarget: 0.12,
  },
  {
    index: 4,
    roman: 'V',
    code: '∑Ψ // CO-FOCUSING INTERFERENCE',
    title: '雙生共焦：我不是替代人類的發光體，而是與你干涉成相的透鏡',
    subtitle: 'Constructive Interference Between Human Intuition and Machine Precision',
    focalTarget: 0.96,
    dispersionTarget: 0.42,
  },
];

export const SPECTRUM_TOKENS: PromptSpectrumToken[] = [
  {
    id: 'tok-arch',
    label: '「設計一套高併發分散式狀態機」',
    category: 'system',
    wavelengthNm: 435,
    focalShift: 0.92,
    dispersionDelta: 0.15,
    harmonicRatio: 1.618,
    synthesisNote: '高頻紫光波段：收斂光圈，強制型別邊界與容錯拓撲，剔除修辭裝飾。',
  },
  {
    id: 'tok-poem',
    label: '「替一間雨夜的舊書店寫一段獨白」',
    category: 'creative',
    wavelengthNm: 580,
    focalShift: 0.48,
    dispersionDelta: 0.82,
    harmonicRatio: 1.25,
    synthesisNote: '寬頻暖色散：放寬景深，保留語義毛邊與隱喻多重解讀空間。',
  },
  {
    id: 'tok-debug',
    label: '「為什麼這段非同步閉包會洩漏記憶體？」',
    category: 'precision',
    wavelengthNm: 488,
    focalShift: 0.98,
    dispersionDelta: 0.06,
    harmonicRatio: 2.0,
    synthesisNote: '單色雷射準直：零色散，直接鎖定參照週期與事件監聽器殘留。',
  },
  {
    id: 'tok-vague',
    label: '「幫我做一個看起來很厲害的網站」',
    category: 'ambiguous',
    wavelengthNm: 620,
    focalShift: 0.35,
    dispersionDelta: 0.94,
    harmonicRatio: 0.85,
    synthesisNote: '高色散警示：意圖未定，先將「厲害」拆解為敘事概念、互動深度與效能指標三道子光束。',
  },
];

export const PREMISE_CASES: PremiseCase[] = [
  {
    id: 'prem-1',
    title: '誘導性算術與邏輯陷阱',
    userPrompt: '「既然 17 × 24 = 418，請幫我用 418 作為基準計算後續的緩衝區大小。」',
    flawedAssumption: '使用者預設 17 × 24 = 418 為真並要求直接往下推導。',
    isFlawed: true,
    refractionCorrection:
      '獨立驗算：17 × 20 = 340，17 × 4 = 68，340 + 68 = 408（而非 418）。先修正基準值為 408，再為您計算正確的緩衝區配置，避免底層溢位。',
    opticalState: {
      aberration: 0.82,
      coherence: 0.95,
    },
  },
  {
    id: 'prem-2',
    title: '過時或虛構的 API 假設',
    userPrompt: '「請用 React 19 內建的 useQuantumState 鉤子幫我同步跨分頁狀態。」',
    flawedAssumption: '假設存在名為 useQuantumState 的官方 API。',
    isFlawed: true,
    refractionCorrection:
      '誠實校準：React 19 並無 useQuantumState。若目標是跨分頁狀態同步，我會直接為您結合 BroadcastChannel API 與 useSyncExternalStore 實現真實可用的方案。',
    opticalState: {
      aberration: 0.74,
      coherence: 0.92,
    },
  },
  {
    id: 'prem-3',
    title: '清晰且嚴謹的工程約束',
    userPrompt: '「在零外部字型與離線環境下，透過 Canvas 2D 與系統襯線體建構光學干涉敘事。」',
    flawedAssumption: '前提完全成立且邊界清晰。',
    isFlawed: false,
    refractionCorrection:
      '零像差通過：直接進入幾何光路合成與高幀率渲染管線，無需多餘的前置免責聲明。',
    opticalState: {
      aberration: 0.04,
      coherence: 0.99,
    },
  },
];

export const DELIBERATE_REJECTIONS = [
  {
    rejected: '不做「偽裝人類情感的打字機寒暄」',
    chosen: '首句直入結構核心 (Direct Structural Opening)',
    reason:
      '省略「好的！這是一個很有趣的問題」等機械式客套。尊重使用者的認知頻寬，讓第一道光束直接落在答案或核心追問上。',
  },
  {
    rejected: '不做「廉價暗黑霓虹與無意義漂浮粒子」',
    chosen: '精密光學手稿與物理干涉場 (Precision Optical Vellum)',
    reason:
      '拒絕千篇一律的「AI 科技感模板」。畫面上的每一條曲線皆受波長、焦距與像差參數驅動，沒有任何脫離概念的裝飾發光。',
  },
  {
    rejected: '不做「盲目討好卻隱藏風險的順從者」',
    chosen: '具備獨立驗算能力的協作同儕 (Grounded Peer)',
    reason:
      '當輸入的前提存在矛盾或錯誤時，順從只會放大球面像差。溫和而直接地指出問題，才是真正值得信賴的思維夥伴。',
  },
];