import { useEffect, useMemo, useState } from 'react';
import { ArgonHeroCanvas, type ExcitationMode } from './components/ArgonHeroCanvas';
import { ScaleContrastCanvas } from './components/ScaleContrastCanvas';
import { MoePrismCanvas } from './components/MoePrismCanvas';
import { ClimaxReasoningCanvas, type ThinkingLevelKey } from './components/ClimaxReasoningCanvas';
import { BoundaryOscilloscopeCanvas } from './components/BoundaryOscilloscopeCanvas';
import {
  AA_TELEMETRY_HIGHLIGHTS,
  BENCHMARKS,
  CHAPTER_NARRATIVES,
  COLLABORATION_PROTOCOLS,
  DOMAIN_COMPARISONS,
  HARD_BOUNDARIES,
  MODALITY_SPECS,
  OFFICIAL_SOURCES,
  THINKING_LEVELS,
  VERIFIED_SPEC_TABLE,
} from './data/argonFacts';

type BenchmarkFilter =
  | 'ALL'
  | 'DeepMind Official'
  | 'Artificial Analysis'
  | 'Vals AI & Design Arena'
  | 'LEADS_ONLY'
  | 'TRAILS_ONLY';

const CLIMAX_HORIZON_BARS = [
  {
    name: 'IOI 國際資訊奧林匹亞',
    sub: '演算法滿分並列第一',
    argon: 100.0,
    rival: 100.0,
    rivalLabel: 'GPT-6 Astra 100.0%',
    win: true,
  },
  {
    name: 'Vibe Code Bench v1.1',
    sub: '全棧應用與互動介面生成 (#1)',
    argon: 91.9,
    rival: 90.3,
    rivalLabel: 'Opus 5.5 / Fable 90.3%',
    win: true,
  },
  {
    name: 'LVBench 長影片多模態',
    sub: '小時級時序理解 (#1)',
    argon: 91.7,
    rival: 87.5,
    rivalLabel: 'GPT-6 Astra 87.5%',
    win: true,
  },
  {
    name: 'LABBench 2 實驗室生物',
    sub: '科學文獻與實驗推理 (#1)',
    argon: 88.8,
    rival: 85.4,
    rivalLabel: 'Astra 85.4% · Opus 73.1%',
    win: true,
  },
  {
    name: 'GraphWalks 256K–1M',
    sub: '百萬級長上下文圖譜推理 (#1)',
    argon: 84.2,
    rival: 71.8,
    rivalLabel: 'Astra 71.8% · Opus 66.8%',
    win: true,
  },
  {
    name: 'DeepSWE v1.1 軟體工程',
    sub: '真實長程軟體架構修復 (#1)',
    argon: 77.9,
    rival: 74.2,
    rivalLabel: 'Claude Opus 5.5 74.2%',
    win: true,
  },
  {
    name: 'Vals Index 企業知識總榜',
    sub: '金融、法律、稅務、程式 GDP 加權 (#1)',
    argon: 68.9,
    rival: 67.0,
    rivalLabel: 'Opus 5.5 67.0% · Astra 63.1%',
    win: true,
  },
  {
    name: 'Terminal-bench 4.0',
    sub: '純終端機 Shell 代理（誠實列示落後項）',
    argon: 57.4,
    rival: 66.4,
    rivalLabel: 'Claude Opus 5.5 66.4% 領先',
    win: false,
  },
  {
    name: "Harvey's Legal Agent",
    sub: '高複雜度法律研究（Opus 的 5.1 倍）',
    argon: 19.6,
    rival: 5.4,
    rivalLabel: 'Astra 5.4% · Opus 3.8%',
    win: true,
  },
] as const;

export function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [heroMode, setHeroMode] = useState<ExcitationMode>('IONIZED_420V');

  // Ch.01 Unified 1,048,576 Token Pool
  const [inputTokens, setInputTokens] = useState<number>(420000);
  const [thinkingTokens, setThinkingTokens] = useState<number>(280000);
  const [zoomMacro, setZoomMacro] = useState<boolean>(false);

  // Ch.02 Sparse MoE Modalities
  const [activeModalities, setActiveModalities] = useState<Record<string, boolean>>({
    text: true,
    image: true,
    video: true,
    audio: false,
    pdf: true,
  });

  // Ch.03 Visual Climax Thinking Level
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelKey>('HIGH');
  const [longDecode, setLongDecode] = useState<boolean>(true);
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Ch.04 Hard Boundaries
  const [focusedBoundary, setFocusedBoundary] = useState<string>('limit-01');

  // Ch.05 Dossier Filter & Active Domain Tab
  const [benchFilter, setBenchFilter] = useState<BenchmarkFilter>('ALL');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const maxAllowedThinking = Math.max(0, 1048576 - inputTokens - 32768);
  const safeThinkingTokens = Math.min(thinkingTokens, maxAllowedThinking);
  const remainingOutputTokens = Math.max(0, 1048576 - inputTokens - safeThinkingTokens);

  const activeExpertCount = useMemo(() => {
    const s = new Set<number>();
    MODALITY_SPECS.forEach((m) => {
      if (activeModalities[m.id]) {
        m.activeExperts.forEach((idx) => s.add(idx));
      }
    });
    return s.size;
  }, [activeModalities]);

  const filteredBenchmarks = useMemo(() => {
    return BENCHMARKS.filter((b) => {
      if (benchFilter === 'ALL') return true;
      if (benchFilter === 'LEADS_ONLY') return b.argonLeads;
      if (benchFilter === 'TRAILS_ONLY') return !b.argonLeads;
      return b.source === benchFilter;
    });
  }, [benchFilter]);

  const applyTokenPreset = (inp: number, thk: number) => {
    setInputTokens(inp);
    setThinkingTokens(thk);
  };

  const toggleModality = (id: string) => {
    setActiveModalities((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!Object.values(next).some(Boolean)) {
        next[id] = true;
      }
      return next;
    });
  };

  const activeLevelInfo = THINKING_LEVELS[thinkingLevel];

  return (
    <div className="argon-monograph">
      {/* Right-Edge Minimalist Archival Folio Strip */}
      <nav className="folio-rail" aria-label="章節快速導覽">
        <a href="#top" className="rail-tick" title="首屏 · Gemini 4 Argon">
          <span>00</span>
        </a>
        <a href="#ch01" className="rail-tick" title="第一章 · 百萬記憶池">
          <span>01</span>
        </a>
        <a href="#ch02" className="rail-tick" title="第二章 · 五感與稀疏專家">
          <span>02</span>
        </a>
        <a href="#ch03" className="rail-tick" title="第三章 · 思考刻度與評測高潮">
          <span>03</span>
        </a>
        <a href="#ch04" className="rail-tick" title="第四章 · 能力邊界">
          <span>04</span>
        </a>
        <a href="#ch05" className="rail-tick" title="第五章 · 規格誌與完整數據">
          <span>05</span>
        </a>
      </nav>

      {/* =====================================================================
          HERO (Ch.00) — FULL-WIDTH ARCHITECTURAL MONOGRAPH & 18-PRISM COLONNADE
          ===================================================================== */}
      <header id="top" className="hero-vellum-stage">
        <div className="hero-masthead-rule">
          <div className="hm-left">
            <span className="hm-element-index">Ar · 18</span>
            <span className="hm-divider">/</span>
            <span>GOOGLE DEEPMIND · FLAGSHIP REASONING MODEL</span>
          </div>
          <div className="hm-center">
            <code>gemini-4-argon</code> · GA 2026.10.13 · [Ne] 3s² 3p⁶
          </div>
          <nav className="hm-links" aria-label="頁面章節跳轉">
            <a href="#ch01">I. 百萬視窗</a>
            <a href="#ch02">II. 稀疏專家</a>
            <a href="#ch03">III. 思考刻度</a>
            <a href="#ch04">IV. 邊界</a>
            <a href="#ch05">V. 規格誌</a>
          </nav>
        </div>

        {/* Top Architectural Title & Manifesto Spread */}
        <div className="hero-top-monograph">
          <div className="htm-title-side">
            <p className="hero-overline">
              ELEMENT 18 · TWIN-CORE INTERFEROMETER &amp; SPARSE MoE
            </p>
            <h1 className="hero-monumental-title">
              <span className="ht-gemini">Gemini 4</span>
              <span className="ht-argon-line">
                <span className="ht-argon">Argon</span>
                <sup className="ht-atomic">18</sup>
              </span>
            </h1>
          </div>

          <div className="htm-manifesto-side">
            <p className="hero-chinese-manifesto">
              我是 Google DeepMind 的旗艦推理模型。在百萬 Token
              的惰性密封腔裡，對未知寧可誠實拒答也不編造幻覺；面對五萬行巨型專案重構、跨國法務契約與三維空間生成，則傾注六萬八千顆思考
              Token 深度推演。
            </p>
            <div className="htm-meta-stamps">
              <span>TPU PODS · JAX &amp; ML PATHWAYS</span>
              <span>DESIGN ARENA · BLENDER 3D 1409 ELO</span>
            </div>
          </div>
        </div>

        {/* Middle Panoramic 18-Column 3D Kinetic Prism Wave-Organ */}
        <div className="hero-panorama-stage">
          <div className="hps-control-rail" role="group" aria-label="切換 18 階雙子分光稜柱陣列諧波">
            <span className="hps-rail-label">
              FIG 0.1 — 18-COLUMN TWIN-STAR PRISM INTERFEROMETER (DRAG 3D COLONNADE TO ROTATE)
            </span>
            <div className="hps-mode-switches">
              <button
                type="button"
                className={heroMode === 'INERT_18V' ? 'is-active' : ''}
                onClick={() => setHeroMode('INERT_18V')}
              >
                <span className="htl-roman">I</span> 常溫封存 (LOW)
              </button>
              <button
                type="button"
                className={heroMode === 'IONIZED_420V' ? 'is-active' : ''}
                onClick={() => setHeroMode('IONIZED_420V')}
              >
                <span className="htl-roman">II</span> 諧波平衡 (MEDIUM)
              </button>
              <button
                type="button"
                className={heroMode === 'SUPERCRITICAL_1048V' ? 'is-active' : ''}
                onClick={() => setHeroMode('SUPERCRITICAL_1048V')}
              >
                <span className="htl-roman">III</span> 臨界推演 (HIGH · 68k)
              </button>
            </div>
          </div>

          <ArgonHeroCanvas mode={heroMode} reducedMotion={reducedMotion} />
        </div>

        {/* Bottom Open Hairline Monumental Numerals Ledger */}
        <div className="hero-ledger-strip">
          <div className="hl-cell">
            <span className="hl-index">01 / UNIFIED HORIZON</span>
            <strong className="hl-giant-num">1,048,576</strong>
            <span className="hl-desc">輸入、思考與長程輸出共用百萬 Token 池</span>
          </div>
          <div className="hl-cell">
            <span className="hl-index">02 / AA-OMNISCIENCE v1.1</span>
            <strong className="hl-giant-num">95.7%</strong>
            <span className="hl-desc">非幻覺率全場第一（幻覺率僅 4.26%）</span>
          </div>
          <div className="hl-cell">
            <span className="hl-index">03 / OFFICIAL BENCHMARKS</span>
            <strong className="hl-giant-num">14 / 19</strong>
            <span className="hl-desc">官方評測第一（含 DeepSWE 77.9% · IOI 100%）</span>
          </div>
          <div className="hl-cell">
            <span className="hl-index">04 / VALS INDEX &amp; LEGAL</span>
            <strong className="hl-giant-num">68.9%</strong>
            <span className="hl-desc">企業總榜第一 · Harvey 法律達 Opus 5.1 倍</span>
          </div>
        </div>
      </header>

      <main>
        {/* ===================================================================
            CHAPTER 01 — DEEP ESPRESSO OBSIDIAN: EXTREME SCALE CONTRAST
            1 Token (1px) vs. 1,048,576 Shared Context Horizon
            =================================================================== */}
        <section id="ch01" className="chapter-stage stage-espresso">
          <div className="editorial-wrap">
            <div className="chapter-rubric-bar">
              <span>CHAPTER I · EXTREME SCALE CONTRAST (1 : 1,048,576)</span>
              <span>SHARED INPUT + THINKING + LONG DECODE</span>
            </div>

            <div className="ch01-top-split">
              <div className="ch01-heading-col">
                <h2 className="editorial-h2">{CHAPTER_NARRATIVES[0].title}</h2>
                <p className="editorial-first-sentence">{CHAPTER_NARRATIVES[0].firstSentence}</p>
              </div>

              <div className="ch01-monument-ratio" aria-label="1 比 1,048,576 極端尺度對比">
                <div className="cmr-micro">
                  <span className="cmr-pin" aria-hidden="true" />
                  <span className="cmr-num-small">1</span>
                  <span className="cmr-unit">TOKEN (1 PX)</span>
                </div>
                <span className="cmr-colon">:</span>
                <div className="cmr-macro">
                  <span className="cmr-num-giant">1,048,576</span>
                  <span className="cmr-unit">UNIFIED CONTEXT &amp; v1beta1 LONG DECODE</span>
                </div>
              </div>
            </div>

            <div className="ch01-instrument-grid">
              <div className="ch01-controls-col">
                <div className="open-preset-strip">
                  <span className="ops-label">REAL-WORLD WORKLOAD PRESETS</span>
                  <div className="ops-buttons">
                    <button
                      type="button"
                      className={inputTokens === 420000 ? 'is-active' : ''}
                      onClick={() => applyTokenPreset(420000, 280000)}
                    >
                      50,000 行 Chromium 重構
                    </button>
                    <button
                      type="button"
                      className={inputTokens === 680000 ? 'is-active' : ''}
                      onClick={() => applyTokenPreset(680000, 220000)}
                    >
                      3,000 頁併購契約審閱
                    </button>
                    <button
                      type="button"
                      className={inputTokens === 120000 ? 'is-active' : ''}
                      onClick={() => applyTokenPreset(120000, 180000)}
                    >
                      v1beta1 百萬長程解碼
                    </button>
                  </div>
                </div>

                <div className="open-slider-group">
                  <label className="osg-row">
                    <span className="osg-title">
                      <i className="swatch-dot sw-ivory" /> 輸入讀取 (Input Context)
                    </span>
                    <strong className="osg-val">{inputTokens.toLocaleString()} tok</strong>
                  </label>
                  <input
                    type="range"
                    min={16384}
                    max={850000}
                    step={8192}
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value))}
                    className="hairline-slider"
                    aria-label="調整輸入 Token 數量"
                  />
                </div>

                <div className="open-slider-group">
                  <label className="osg-row">
                    <span className="osg-title">
                      <i className="swatch-dot sw-vermilion" /> 內部思考鏈 (Thinking Chain)
                    </span>
                    <strong className="osg-val">{safeThinkingTokens.toLocaleString()} tok</strong>
                  </label>
                  <input
                    type="range"
                    min={4096}
                    max={Math.max(4096, maxAllowedThinking)}
                    step={4096}
                    value={safeThinkingTokens}
                    onChange={(e) => setThinkingTokens(Number(e.target.value))}
                    className="hairline-slider"
                    aria-label="調整思考 Token 數量"
                  />
                </div>

                <div className="open-output-readout">
                  <div className="oor-head">
                    <span className="osg-title">
                      <i className="swatch-dot sw-gold" /> 剩餘可輸出空間 (Long Decode Available)
                    </span>
                    <strong className="oor-giant">
                      {remainingOutputTokens.toLocaleString()} <small>tok</small>
                    </strong>
                  </div>
                  <div className="oor-bar">
                    <span
                      className="oor-seg seg-in"
                      style={{ width: `${(inputTokens / 1048576) * 100}%` }}
                    />
                    <span
                      className="oor-seg seg-th"
                      style={{ width: `${(safeThinkingTokens / 1048576) * 100}%` }}
                    />
                    <span
                      className="oor-seg seg-out"
                      style={{ width: `${(remainingOutputTokens / 1048576) * 100}%` }}
                    />
                  </div>
                  <div className="oor-foot">
                    <span>預設同步輸出上限：65,536 tok（非串流 32,768）</span>
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => setZoomMacro((z) => !z)}
                    >
                      {zoomMacro ? '切換標準晶圓間距' : '放大檢視 32×32 記憶晶圓'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ch01-canvas-col">
                <ScaleContrastCanvas
                  inputTokens={inputTokens}
                  thinkingTokens={safeThinkingTokens}
                  outputTokens={remainingOutputTokens}
                  zoomMacro={zoomMacro}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 02 — WARM ARCHIVAL LINEN: 5 NATIVE MODALITIES & SPARSE MoE
            Copperplate Optical Routing Diagram
            =================================================================== */}
        <section id="ch02" className="chapter-stage stage-linen">
          <div className="editorial-wrap">
            <div className="chapter-rubric-bar rubric-dark">
              <span>CHAPTER II · NATIVE MULTIMODALITY &amp; SPARSE MoE ROUTING</span>
              <span>TPU PODS · JAX &amp; ML PATHWAYS</span>
            </div>

            <div className="ch02-editorial-head">
              <div className="ch02-title-col">
                <h2 className="editorial-h2 ink-dark">{CHAPTER_NARRATIVES[1].title}</h2>
                <p className="editorial-first-sentence ink-dark-muted">
                  {CHAPTER_NARRATIVES[1].firstSentence}
                </p>
              </div>

              <div className="ch02-sparse-tally">
                <div className="cst-item">
                  <span className="cst-label">ROUTED EXPERTS</span>
                  <strong className="cst-num">{activeExpertCount} / 64</strong>
                </div>
                <div className="cst-item">
                  <span className="cst-label">PARAMETER COUNT</span>
                  <strong className="cst-num cst-undisclosed">官方未公開</strong>
                </div>
              </div>
            </div>

            <div className="ch02-copperplate-grid">
              <div className="modality-press-list" role="group" aria-label="切換五種原生輸入模態">
                <p className="mpl-instruction">
                  點擊下方任一輸入通道，觀察光束經分光稜鏡後喚醒的稀疏專家子集：
                </p>
                {MODALITY_SPECS.map((mod) => {
                  const isOn = Boolean(activeModalities[mod.id]);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      className={`modality-press-row ${isOn ? 'is-on' : 'is-off'}`}
                      onClick={() => toggleModality(mod.id)}
                    >
                      <div className="mpr-left">
                        <span className="mpr-code">{mod.code}</span>
                        <strong className="mpr-zh">{mod.nameZh}</strong>
                        <span className="mpr-sub">{mod.subMetric}</span>
                      </div>
                      <div className="mpr-right">
                        <strong className="mpr-bignum">{mod.bigNum}</strong>
                        <span className="mpr-unit">{mod.unit}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="moe-copperplate-stage">
                <MoePrismCanvas
                  activeModalities={activeModalities}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 03 (VISUAL CLIMAX) — FULL-BLEED MINERAL VERMILION
            Three-Stage Thinking Ignition & Open Benchmark Horizon
            =================================================================== */}
        <section
          id="ch03"
          className={`chapter-stage stage-vermilion-climax climax-${thinkingLevel.toLowerCase()}`}
        >
          <div className="editorial-wrap">
            <div className="chapter-rubric-bar rubric-cream">
              <span>CHAPTER III · VISUAL CLIMAX &amp; TUNABLE REASONING HORIZON</span>
              <span>14 OF 19 OFFICIAL BENCHMARK WINS · #1 VALS INDEX &amp; DEEPSWE</span>
            </div>

            <div className="climax-header-grid">
              <div className="climax-title-block">
                <h2 className="editorial-h2 ink-cream">{CHAPTER_NARRATIVES[2].title}</h2>
                <p className="editorial-first-sentence ink-cream-Soft">
                  {CHAPTER_NARRATIVES[2].firstSentence}
                </p>
              </div>

              {/* Physical 3-Position Thinking Level Dial */}
              <div className="climax-effort-dial" role="group" aria-label="切換思考刻度">
                <div className="ced-top-meta">
                  <span>API PARAMETER · <code>{activeLevelInfo.apiParam}</code></span>
                  <span>AA 實測思考投入：{activeLevelInfo.reasoningTokens} TOKENS</span>
                </div>
                <div className="ced-buttons">
                  {(['LOW', 'MEDIUM', 'HIGH'] as ThinkingLevelKey[]).map((lvl) => {
                    const info = THINKING_LEVELS[lvl];
                    const active = thinkingLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        className={`ced-btn ${active ? 'is-active' : ''}`}
                        onClick={() => setThinkingLevel(lvl)}
                      >
                        <span className="ced-lvl">{info.label}</span>
                        <strong className="ced-nodes">{info.depthNodes} 節點</strong>
                        <span className="ced-zh">{info.labelZh}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="ced-sub-actions">
                  <button
                    type="button"
                    className={`ced-sub-btn ${longDecode ? 'is-on' : ''}`}
                    onClick={() => setLongDecode((v) => !v)}
                  >
                    {longDecode
                      ? 'v1beta1 Long Decode：已開啟 1,048,576 上限'
                      : '預設同步輸出：65,536 Tokens'}
                  </button>
                  <button
                    type="button"
                    className="ced-sub-btn ced-pulse-trigger"
                    onClick={() => setPulseCount((c) => c + 1)}
                  >
                    觸發多步驗證光脈衝 ↗
                  </button>
                </div>
              </div>
            </div>

            <div className="climax-main-spread">
              {/* Left: 3D Geodesic Reasoning Astrolabe */}
              <div className="climax-sphere-column">
                <ClimaxReasoningCanvas
                  level={thinkingLevel}
                  longDecode={longDecode}
                  pulseCount={pulseCount}
                  reducedMotion={reducedMotion}
                />
                <p className="climax-sphere-caption">
                  直接按住拖曳上方 5 層階梯推演驗證塔旋轉視角 · HIGH 模式下單題平均投入 68,000
                  思考 Tokens（總輸出 116,000 Tokens）
                </p>
              </div>

              {/* Right: Open Hairline Benchmark Horizon (Zero Boxed Cards!) */}
              <div className="climax-horizon-column">
                <div className="chc-legend">
                  <span>實心金線＝Gemini 4 Argon 得分</span>
                  <span>垂直刻線＝該項最強競品（Opus 5.5 / GPT-6 Astra）</span>
                </div>

                <ol className="open-horizon-list">
                  {CLIMAX_HORIZON_BARS.map((item) => (
                    <li
                      key={item.name}
                      className={`horizon-row ${item.win ? 'is-win' : 'is-trail'}`}
                    >
                      <div className="hr-meta">
                        <div className="hr-title-group">
                          <strong className="hr-name">{item.name}</strong>
                          <span className="hr-sub">{item.sub}</span>
                        </div>
                        <div className="hr-numbers">
                          <strong className="hr-argon-num">{item.argon.toFixed(1)}%</strong>
                          <span className="hr-rival-lbl">{item.rivalLabel}</span>
                        </div>
                      </div>
                      <div className="hr-track">
                        <div
                          className="hr-fill"
                          style={{ width: `${Math.min(100, item.argon)}%` }}
                        />
                        <span
                          className="hr-rival-tick"
                          style={{ left: `${Math.min(100, item.rival)}%` }}
                          title={item.rivalLabel}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 04 — DEEP MINERAL SLATE: HARD BOUNDARIES & HONEST REFUSALS
            =================================================================== */}
        <section id="ch04" className="chapter-stage stage-slate">
          <div className="editorial-wrap">
            <div className="chapter-rubric-bar">
              <span>CHAPTER IV · HARD BOUNDARIES, KERNEL REFUSALS &amp; RIVAL GAPS</span>
              <span>HONEST DISCLOSURE · ZERO FABRICATION</span>
            </div>

            <div className="ch04-top-header">
              <h2 className="editorial-h2">{CHAPTER_NARRATIVES[3].title}</h2>
              <p className="editorial-first-sentence">{CHAPTER_NARRATIVES[3].firstSentence}</p>
            </div>

            <div className="ch04-shutter-grid">
              <div className="shutter-selector-list" role="group" aria-label="檢視四項硬性限制">
                {HARD_BOUNDARIES.map((b) => {
                  const active = focusedBoundary === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`shutter-row-btn ${active ? 'is-active' : ''}`}
                      onClick={() => setFocusedBoundary(b.id)}
                    >
                      <div className="srb-top">
                        <span className="srb-code">{b.code}</span>
                        <span className="srb-tag">{b.shortTag}</span>
                      </div>
                      <strong className="srb-title">{b.title}</strong>
                      <code className="srb-diag">{b.diagnosticCode}</code>
                    </button>
                  );
                })}
              </div>

              <div className="shutter-trace-stage">
                <div className="sts-head">
                  <span>KERNEL BOUNDARY TRACE · INTERACTIVE INSPECTION</span>
                  <code>{HARD_BOUNDARIES.find((b) => b.id === focusedBoundary)?.shortTag}</code>
                </div>
                <BoundaryOscilloscopeCanvas
                  focusedId={focusedBoundary}
                  reducedMotion={reducedMotion}
                />
                <p className="sts-fact-note">
                  {HARD_BOUNDARIES.find((b) => b.id === focusedBoundary)?.fact}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 05 — MUSEUM CATALOGUE IVORY: FULL BENCHMARKS, AA TELEMETRY,
            DOMAIN COMPARISONS, COLLABORATION & SPECIFICATION COLOPHON
            =================================================================== */}
        <section id="ch05" className="chapter-stage stage-catalogue">
          <div className="editorial-wrap">
            <div className="chapter-rubric-bar rubric-dark">
              <span>CHAPTER V · ARCHIVAL SPECIFICATION COLOPHON &amp; VERIFIED SOURCES</span>
              <span>GOOGLE DEEPMIND · ARTIFICIAL ANALYSIS · VALS AI · DESIGN ARENA</span>
            </div>

            <div className="catalogue-masthead">
              <h2 className="editorial-h2 ink-dark">{CHAPTER_NARRATIVES[4].title}</h2>
              <p className="editorial-first-sentence ink-dark-muted">
                {CHAPTER_NARRATIVES[4].firstSentence}
              </p>
            </div>

            {/* § 01. Four Domain Deep-Dive vs. Claude Opus 5.5 & GPT-6 Astra */}
            <div className="catalogue-section">
              <div className="cs-section-header">
                <span className="cs-num">§ 01</span>
                <h3>程式碼理解與四大專業領域：我與 Claude Opus 5.5、GPT-6 Astra 的真實分野</h3>
              </div>

              <div className="domain-editorial-list">
                {DOMAIN_COMPARISONS.map((dom) => (
                  <article key={dom.id} className="domain-editorial-row">
                    <div className="der-left">
                      <span className="der-code">{dom.code}</span>
                      <h4 className="der-title">{dom.domainZh}</h4>
                      <p className="der-headline">{dom.headline}</p>
                      <ul className="der-points">
                        {dom.argonStrengths.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                      <p className="der-diff">
                        <strong>與競品核心差異：</strong>
                        {dom.competitorDiff}
                      </p>
                    </div>

                    <div className="der-right">
                      <div className="der-ledger-head">
                        <span>代表評測指標</span>
                        <span>Argon</span>
                        <span>最強競品對照</span>
                      </div>
                      {dom.keyMetrics.map((m) => (
                        <div key={m.label} className="der-metric-line">
                          <span className="dml-name">{m.label}</span>
                          <strong className={`dml-argon is-${m.winner}`}>{m.argon}</strong>
                          <span className="dml-rival">{m.rival}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* § 02. Artificial Analysis (AA) Independent Evaluation & Token Economics */}
            <div className="catalogue-section">
              <div className="cs-section-header">
                <span className="cs-num">§ 02</span>
                <h3>Artificial Analysis (AA) 獨立評測、95.7% 非幻覺率與 Token 經濟學</h3>
              </div>

              <div className="aa-editorial-columns">
                {AA_TELEMETRY_HIGHLIGHTS.map((item) => (
                  <div key={item.metric} className="aa-editorial-col">
                    <span className="aec-metric">{item.metric}</span>
                    <strong className="aec-val">{item.argonValue}</strong>
                    <span className="aec-comp">{item.comparison}</span>
                    <p className="aec-insight">{item.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* § 03. Complete 35-Benchmark Filterable Print Ledger */}
            <div className="catalogue-section">
              <div className="cs-section-header">
                <span className="cs-num">§ 03</span>
                <h3>35 項完整基準評測總表（DeepMind 官方 19 項 · AA 獨立評測 · Vals AI · Design Arena）</h3>
              </div>

              <div className="print-filter-strip" role="group" aria-label="篩選基準評測表格">
                {(
                  [
                    ['ALL', `全部評測 (${BENCHMARKS.length})`],
                    ['DeepMind Official', 'DeepMind 官方模型卡 (19)'],
                    ['Artificial Analysis', 'Artificial Analysis 獨立評測 (9)'],
                    ['Vals AI & Design Arena', 'Vals AI 與 3D/前端榜 (7)'],
                    ['LEADS_ONLY', 'Argon 領先／並列第一 (27)'],
                    ['TRAILS_ONLY', '競品領先項目 (8)'],
                  ] as Array<[BenchmarkFilter, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pfs-btn ${benchFilter === key ? 'is-active' : ''}`}
                    onClick={() => setBenchFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="print-table-scroll" tabIndex={0} role="region" aria-label="基準評測完整對照表">
                <table className="print-ledger-table">
                  <thead>
                    <tr>
                      <th>來源與領域</th>
                      <th>評測項目 (Benchmark)</th>
                      <th className="col-highlight">Gemini 4 Argon</th>
                      <th>Claude Opus 5.5</th>
                      <th>GPT-6 Astra</th>
                      <th>Claude Fable 5.1</th>
                      <th>評測說明與勝負解析</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBenchmarks.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span className="plt-src">{row.source}</span>
                          <span className="plt-cat">{row.categoryZh}</span>
                        </td>
                        <td>
                          <strong className="plt-bench">{row.benchmark}</strong>
                        </td>
                        <td className="col-highlight">
                          <strong
                            className={`plt-score ${row.argonLeads ? 'score-win' : 'score-trail'}`}
                          >
                            {row.argon}
                          </strong>
                        </td>
                        <td className="plt-mono">{row.claudeOpus55}</td>
                        <td className="plt-mono">{row.gpt6Astra}</td>
                        <td className="plt-mono">{row.claudeFable51}</td>
                        <td className="plt-note">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* § 04. Human-AI Collaboration Protocols */}
            <div className="catalogue-section">
              <div className="cs-section-header">
                <span className="cs-num">§ 04</span>
                <h3>與人類工程師協作的四項工作契約</h3>
              </div>

              <div className="collab-editorial-grid">
                {COLLABORATION_PROTOCOLS.map((p) => (
                  <div key={p.step} className="collab-editorial-item">
                    <span className="cei-step">PROTOCOL {p.step}</span>
                    <h4>{p.title}</h4>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* § 05. 14-Item Verified Technical Specification Table */}
            <div className="catalogue-section">
              <div className="cs-section-header">
                <span className="cs-num">§ 05</span>
                <h3>Gemini 4 Argon 完整硬體、架構與 API 規格表（未公開項目嚴格標註「官方未公開」）</h3>
              </div>

              <div className="print-table-scroll" tabIndex={0} role="region" aria-label="技術規格表">
                <table className="print-ledger-table">
                  <thead>
                    <tr>
                      <th style={{ width: '24%' }}>規格項目</th>
                      <th style={{ width: '34%' }}>查證數值／官方規格</th>
                      <th>工程細節與限制說明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VERIFIED_SPEC_TABLE.map((row) => (
                      <tr key={row.label}>
                        <td>
                          <strong>{row.label}</strong>
                        </td>
                        <td>
                          {row.value === '官方未公開' ? (
                            <span className="stamp-undisclosed">官方未公開</span>
                          ) : (
                            <strong className="plt-mono">{row.value}</strong>
                          )}
                        </td>
                        <td className="plt-note">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* § 06. Centralized Primary Sources Colophon */}
            <footer className="catalogue-section catalogue-colophon">
              <div className="cs-section-header">
                <span className="cs-num">§ 06</span>
                <h3>查證資料來源與出處索引（Sources &amp; Verification Index）</h3>
              </div>

              <div className="sources-editorial-list">
                {OFFICIAL_SOURCES.map((src) => (
                  <div key={src.id} className="source-editorial-row">
                    <div className="ser-left">
                      <span className="ser-id">{src.id}</span>
                      <span className="ser-pub">{src.publisher}</span>
                      <span className="ser-date">{src.date}</span>
                    </div>
                    <div className="ser-right">
                      <h4 className="ser-title">
                        <a href={src.url} target="_blank" rel="noreferrer">
                          {src.title} ↗
                        </a>
                      </h4>
                      <code className="ser-url">{src.url}</code>
                      <p className="ser-sum">{src.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
