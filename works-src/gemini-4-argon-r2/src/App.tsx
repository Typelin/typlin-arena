import React, { useEffect, useState } from 'react';
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
  | 'DEEPMIND'
  | 'AA'
  | 'VALS_ARENA'
  | 'ARGON_LEADS'
  | 'RIVAL_LEADS';

export function App() {
  const [reducedMotion, setReducedMotion] = useState(false);

  // Hero Poster interactive state
  const [heroMode, setHeroMode] = useState<ExcitationMode>('IONIZED_420V');

  // Ch.01 Scale & Unified 1,048,576 Token state
  const [inputTokens, setInputTokens] = useState(420_000);
  const [thinkingTokens, setThinkingTokens] = useState(228_576);
  const [macroView, setMacroView] = useState(true);

  // Ch.02 Sparse MoE & Multimodal state
  const [activeModalities, setActiveModalities] = useState<string[]>([
    'text',
    'image',
    'video',
    'audio',
    'pdf',
  ]);

  // Ch.03 Visual Climax Thinking Level state
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelKey>('HIGH');
  const [longDecode, setLongDecode] = useState<boolean>(true);
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);

  // Ch.04 Mechanical Boundary Oscilloscope state
  const [inspectedBoundary, setInspectedBoundary] = useState<string>('limit-01');

  // Ch.05 Dossier Benchmark Filter
  const [benchFilter, setBenchFilter] = useState<BenchmarkFilter>('ALL');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const totalUnified = 1_048_576;
  const outputTokens = Math.max(0, totalUnified - inputTokens - thinkingTokens);

  const handleInputSlider = (val: number) => {
    const clampedInput = Math.min(val, totalUnified - 65_536);
    const remaining = totalUnified - clampedInput;
    const adjustedThinking = Math.min(thinkingTokens, Math.floor(remaining * 0.5));
    setInputTokens(clampedInput);
    setThinkingTokens(adjustedThinking);
  };

  const applyTokenPreset = (inp: number, think: number) => {
    setInputTokens(inp);
    setThinkingTokens(think);
  };

  const toggleModality = (id: string) => {
    setActiveModalities((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const activeExpertSet = new Set<number>();
  MODALITY_SPECS.forEach((m) => {
    if (activeModalities.includes(m.id)) {
      m.activeExperts.forEach((e) => activeExpertSet.add(e));
    }
  });

  const currentThinkingSpec = THINKING_LEVELS[thinkingLevel];

  const filteredBenchmarks = BENCHMARKS.filter((b) => {
    if (benchFilter === 'DEEPMIND') return b.source === 'DeepMind Official';
    if (benchFilter === 'AA') return b.source === 'Artificial Analysis';
    if (benchFilter === 'VALS_ARENA') return b.source === 'Vals AI & Design Arena';
    if (benchFilter === 'ARGON_LEADS') return b.argonLeads;
    if (benchFilter === 'RIVAL_LEADS') return !b.argonLeads;
    return true;
  });

  return (
    <div className="argon-page-shell" data-thinking-level={thinkingLevel}>
      {/* Top Floating Optical Navigation Rail */}
      <header className="optical-topbar" aria-label="模型導覽列">
        <div className="topbar-brand">
          <span className="element-badge">Ar¹⁸</span>
          <div className="brand-meta">
            <span className="brand-model">GEMINI 4 ARGON</span>
            <span className="brand-maker">Google DeepMind · Oct 13, 2026</span>
          </div>
        </div>
        <nav className="topbar-nav" aria-label="章節跳轉">
          <a href="#hero">00 海報</a>
          <a href="#ch01">01 百萬記憶</a>
          <a href="#ch02">02 稀疏專家</a>
          <a href="#ch03">03 思考調諧</a>
          <a href="#ch04">04 能力邊界</a>
          <a href="#ch05">05 完整規格與評測</a>
        </nav>
      </header>

      <main>
        {/* =====================================================================
            HERO POSTER (Ch.00): HIGH-PRESSURE ARGON-18 SPECTRAL CHAMBER
           ===================================================================== */}
        <section id="hero" className="hero-poster-section">
          <div className="hero-ambient-grid" aria-hidden="true" />

          {/* Central Volumetric Plasma Chamber */}
          <div className="hero-stage-wrapper">
            <ArgonHeroCanvas mode={heroMode} reducedMotion={reducedMotion} />
          </div>

          <div className="hero-poster-layout">
            <div className="hero-poster-header">
              <div className="poster-classification">
                <span className="status-dot" />
                <span>ATOMIC Z=18 // [Ne] 3s² 3p⁶ // SPARSE MoE TRANSFORMER</span>
              </div>
              <div className="poster-developer-stamp">
                DEVELOPED BY <strong>GOOGLE DEEPMIND</strong> · MODEL ID:{' '}
                <code>gemini-4-argon</code>
              </div>
            </div>

            <div className="hero-title-cluster">
              <p className="hero-kicker">GOOGLE DEEPMIND · FRONTIER REASONING MODEL</p>
              <h1 className="hero-display-title">
                <span className="title-gemini">GEMINI 4</span>
                <span className="title-argon-row">
                  <span className="title-argon">ARGON</span>
                  <span className="title-serif-tag">Noble Plasma</span>
                </span>
              </h1>
              <p className="hero-lead-statement">
                Google DeepMind 2026 旗艦推理模型。常壓下如惰性氬氣般沉靜；面對五萬行大型程式庫與三千頁法規財報時，點燃百萬統一記憶與高壓思維鏈。
              </p>
            </div>

            <div className="hero-bottom-console">
              <div
                className="excitation-control-panel"
                role="group"
                aria-label="高壓電離腔激發電壓切換"
              >
                <span className="console-prompt">
                  <span className="prompt-pulse" />
                  互動激發電場（移動游標牽引電漿・點擊切換電壓）：
                </span>
                <div className="excitation-buttons">
                  <button
                    type="button"
                    className={heroMode === 'INERT_18V' ? 'active' : ''}
                    onClick={() => setHeroMode('INERT_18V')}
                  >
                    18V 惰性基態
                  </button>
                  <button
                    type="button"
                    className={heroMode === 'IONIZED_420V' ? 'active' : ''}
                    onClick={() => setHeroMode('IONIZED_420V')}
                  >
                    420V 紫藍電離
                  </button>
                  <button
                    type="button"
                    className={heroMode === 'SUPERCRITICAL_1048V' ? 'active' : ''}
                    onClick={() => setHeroMode('SUPERCRITICAL_1048V')}
                  >
                    1048V 臨界白熾
                  </button>
                </div>
              </div>

              <div className="hero-poster-metrics">
                <div className="poster-metric-item">
                  <span className="pm-val">1,048,576</span>
                  <span className="pm-lbl">UNIFIED TOKENS (IN + THINK + OUT)</span>
                </div>
                <div className="poster-metric-item">
                  <span className="pm-val">#1 · 68.9%</span>
                  <span className="pm-lbl">VALS INDEX (FINANCE / LEGAL / CODE)</span>
                </div>
                <div className="poster-metric-item">
                  <span className="pm-val">77.9% / 91.9%</span>
                  <span className="pm-lbl">DEEPSWE v1.1 (#1) / VIBE CODE (#1)</span>
                </div>
                <div className="poster-metric-item">
                  <span className="pm-val">95.7%</span>
                  <span className="pm-lbl">AA-OMNISCIENCE NON-HALLUCINATION</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 01: EXTREME SCALE CONTRAST (1 TOKEN vs 1,048,576 TOKENS)
            Dual-Chamber Optical Scale Comparator (Unobstructed 1px Loupe vs 1M Ring)
           ===================================================================== */}
        <section id="ch01" className="chapter-section ch01-scale-section">
          <div className="chapter-container ch01-dual-chamber">
            {/* Left Control & Narrative Column */}
            <div className="chapter-narrative-card ch01-card">
              <div className="chapter-eyebrow">{CHAPTER_NARRATIVES[0].code}</div>
              <h2 className="chapter-title">{CHAPTER_NARRATIVES[0].title}</h2>
              <p className="chapter-first-sentence">{CHAPTER_NARRATIVES[0].firstSentence}</p>

              <div className="scale-ratio-banner">
                <div className="scale-micro-box">
                  <span className="micro-dot" />
                  <div>
                    <strong>1 TOKEN (1px)</strong>
                    <span>4 CHARS MICRO ORIGIN</span>
                  </div>
                </div>
                <div className="scale-vs-divider">1 : 1,048,576</div>
                <div className="scale-macro-box">
                  <div>
                    <strong>1,048,576 TOKENS</strong>
                    <span>50K LOC / 8 NOVELS / 8.4H AUDIO</span>
                  </div>
                </div>
              </div>

              <div className="token-partition-widget">
                <div className="widget-header-row">
                  <span className="widget-tag">INTERACTIVE // UNIFIED 1M POOL ALLOCATOR</span>
                  <button
                    type="button"
                    className="zoom-toggle-btn"
                    onClick={() => setMacroView((v) => !v)}
                  >
                    {macroView ? 'SCALE: 1:1M MACRO' : 'SCALE: 1:1 MICRO'}
                  </button>
                </div>

                <div className="preset-pill-row">
                  <button
                    type="button"
                    className={inputTokens === 420_000 ? 'active' : ''}
                    onClick={() => applyTokenPreset(420_000, 228_576)}
                  >
                    420K / 228K / 400K
                  </button>
                  <button
                    type="button"
                    className={inputTokens === 850_000 ? 'active' : ''}
                    onClick={() => applyTokenPreset(850_000, 133_040)}
                  >
                    850K IN (50K LOC)
                  </button>
                  <button
                    type="button"
                    className={inputTokens === 48_576 ? 'active' : ''}
                    onClick={() => applyTokenPreset(48_576, 200_000)}
                  >
                    800K LONG DECODE
                  </button>
                </div>

                <label className="slider-control-label" htmlFor="unified-token-slider">
                  <span>UNIFIED CONTEXT ALLOCATION</span>
                  <code>INPUT: {inputTokens.toLocaleString()}</code>
                </label>
                <input
                  id="unified-token-slider"
                  type="range"
                  min={20_000}
                  max={920_000}
                  step={10_000}
                  value={inputTokens}
                  onChange={(e) => handleInputSlider(Number(e.target.value))}
                  className="argon-range-slider"
                />

                <div className="unified-bar-meter" aria-label="統一視窗配置比例條">
                  <div
                    className="ub-segment ub-input"
                    style={{ width: `${(inputTokens / totalUnified) * 100}%` }}
                  />
                  <div
                    className="ub-segment ub-think"
                    style={{ width: `${(thinkingTokens / totalUnified) * 100}%` }}
                  />
                  <div
                    className="ub-segment ub-output"
                    style={{ width: `${(outputTokens / totalUnified) * 100}%` }}
                  />
                </div>

                <div className="unified-legend-row">
                  <span className="ul-item ul-in">
                    <i>●</i> IN: {(inputTokens / 1000).toFixed(0)}K
                  </span>
                  <span className="ul-item ul-th">
                    <i>●</i> THINK: {(thinkingTokens / 1000).toFixed(0)}K
                  </span>
                  <span className="ul-item ul-out">
                    <i>●</i> LONG DECODE: {(outputTokens / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            </div>

            {/* Right Unobstructed Comparator Stage: 1px Micro Loupe vs 1,048,576 Ring */}
            <div className="ch01-comparator-stage">
              <ScaleContrastCanvas
                inputTokens={inputTokens}
                thinkingTokens={thinkingTokens}
                outputTokens={outputTokens}
                macroView={macroView}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 02: SPARSE MoE & NATIVE MULTIMODAL DICHROIC PRISM
           ===================================================================== */}
        <section id="ch02" className="chapter-section ch02-moe-section">
          <div className="chapter-container ch02-layout">
            <div className="ch02-header-row">
              <div className="ch02-narrative-block">
                <div className="chapter-eyebrow">{CHAPTER_NARRATIVES[1].code}</div>
                <h2 className="chapter-title">{CHAPTER_NARRATIVES[1].title}</h2>
                <p className="chapter-first-sentence">{CHAPTER_NARRATIVES[1].firstSentence}</p>
              </div>

              <div className="ch02-telemetry-box">
                <div className="moe-stat-pill">
                  <span className="msp-num">{activeModalities.length} / 5</span>
                  <span className="msp-lbl">ACTIVE INPUT MODALITIES</span>
                </div>
                <div className="moe-stat-pill">
                  <span className="msp-num">{activeExpertSet.size} / 64</span>
                  <span className="msp-lbl">SPARSE EXPERTS ROUTED</span>
                </div>
                <div className="moe-stat-pill">
                  <span className="msp-num">84.2%</span>
                  <span className="msp-lbl">GRAPHWALKS (256K–1M #1)</span>
                </div>
              </div>
            </div>

            <div className="ch02-workbench-grid">
              <div className="modality-switchboard" role="group" aria-label="多模態輸入光束開關">
                <div className="switchboard-caption">
                  TOGGLE NATIVE MULTIMODAL BEAMS (CLICK TO ROUTE):
                </div>
                {MODALITY_SPECS.map((mod) => {
                  const isOn = activeModalities.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      className={`modality-emitter-btn ${isOn ? 'is-on' : 'is-off'}`}
                      onClick={() => toggleModality(mod.id)}
                      style={{ '--mod-color': mod.color } as React.CSSProperties}
                    >
                      <div className="meb-top">
                        <span className="meb-code">
                          <i className="meb-led" /> {mod.code} · {mod.nameEn}
                        </span>
                        <span className="meb-wave">{mod.wavelength}</span>
                      </div>
                      <div className="meb-main">
                        <strong>{mod.nameEn}</strong>
                        <span className="meb-quota">{mod.limitMetric}</span>
                      </div>
                      <div className="meb-sub">{mod.subMetric}</div>
                    </button>
                  );
                })}
              </div>

              <div className="moe-prism-stage">
                <MoePrismCanvas
                  activeModalities={activeModalities}
                  reducedMotion={reducedMotion}
                />
                <div className="prism-stage-footer">
                  <span>INPUT BEAMS (TEXT / IMAGE / VIDEO / AUDIO / PDF)</span>
                  <span>SPARSE MoE CONDITIONAL ROUTING →</span>
                  <span>64-EXPERT CRYSTAL LATTICE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 03 (VISUAL CLIMAX & CORE INTERACTION):
            THINKING LEVEL PHASE-TRANSITION & FRONTIER BENCHMARK IGNITION
           ===================================================================== */}
        <section
          id="ch03"
          className={`chapter-section ch03-climax-section climax-level-${thinkingLevel.toLowerCase()}`}
        >
          <div className="chapter-container ch03-climax-layout">
            <div className="ch03-top-banner">
              <div className="ch03-narrative">
                <div className="chapter-eyebrow">{CHAPTER_NARRATIVES[2].code}</div>
                <h2 className="chapter-title">{CHAPTER_NARRATIVES[2].title}</h2>
                <p className="chapter-first-sentence">{CHAPTER_NARRATIVES[2].firstSentence}</p>
              </div>

              <div className="climax-ignition-deck">
                <div className="ignition-deck-header">
                  <span className="ignition-badge">
                    <span className="live-spark" /> CORE INTERACTION // THINKING LEVEL TUNER
                  </span>
                  <span className="kelvin-readout">
                    {currentThinkingSpec.voltage} · {currentThinkingSpec.kelvin}
                  </span>
                </div>

                <div className="thinking-level-selector" role="radiogroup" aria-label="思考深度刻度">
                  {(['LOW', 'MEDIUM', 'HIGH'] as ThinkingLevelKey[]).map((lvl) => {
                    const spec = THINKING_LEVELS[lvl];
                    const active = thinkingLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={`thinking-lvl-btn lvl-${lvl.toLowerCase()} ${
                          active ? 'active' : ''
                        }`}
                        onClick={() => setThinkingLevel(lvl)}
                      >
                        <span className="tlb-key">{spec.label}</span>
                        <span className="tlb-nodes">{spec.depthNodes} NODES</span>
                      </button>
                    );
                  })}
                </div>

                <div className="climax-sub-controls">
                  <button
                    type="button"
                    className={`decode-mode-toggle ${longDecode ? 'is-long' : ''}`}
                    onClick={() => setLongDecode((v) => !v)}
                  >
                    <span>DECODE:</span>
                    <strong>
                      {longDecode ? '1,048,576 LONG DECODE' : '65,536 SYNC DEFAULT'}
                    </strong>
                  </button>

                  <button
                    type="button"
                    className="pulse-burst-btn"
                    onClick={() => setPulseTrigger((p) => p + 1)}
                  >
                    ⚡ IGNITE PULSE
                  </button>
                </div>
              </div>
            </div>

            <div className="ch03-reactor-grid">
              <div className="climax-canvas-frame">
                <ClimaxReasoningCanvas
                  level={thinkingLevel}
                  longDecode={longDecode}
                  pulseTrigger={pulseTrigger}
                  reducedMotion={reducedMotion}
                />
                <div className="canvas-drag-hint">
                  ✥ DRAG 3D GEODESIC LATTICE TO ROTATE · API PARAM:{' '}
                  <code>{currentThinkingSpec.apiParam}</code>
                </div>
              </div>

              <div className="climax-benchmark-panel">
                <div className="cbp-header">
                  <h3>FRONTIER SOTA TELEMETRY (OCT 2026)</h3>
                  <span>Gemini 4 Argon vs. Claude Opus 5.5 &amp; GPT-6 Astra</span>
                </div>

                <div className="cbp-bars-list">
                  {[
                    {
                      name: 'IOI Olympiad',
                      argon: 100.0,
                      opus: null,
                      astra: 100.0,
                      tag: '#1 PERFECT',
                    },
                    {
                      name: 'Vibe Code Bench',
                      argon: 91.9,
                      opus: 90.3,
                      astra: 89.6,
                      tag: '#1 FULL-STACK',
                    },
                    {
                      name: 'LVBench Video',
                      argon: 91.7,
                      opus: 83.7,
                      astra: 87.5,
                      tag: '#1 MULTIMODAL',
                    },
                    {
                      name: 'LABBench 2 Bio',
                      argon: 88.8,
                      opus: 73.1,
                      astra: 85.4,
                      tag: '+15.7% vs OPUS',
                    },
                    {
                      name: 'GraphWalks 1M',
                      argon: 84.2,
                      opus: 66.8,
                      astra: 71.8,
                      tag: '+17.4% vs OPUS',
                    },
                    {
                      name: 'DeepSWE v1.1',
                      argon: 77.9,
                      opus: 74.2,
                      astra: 74.1,
                      tag: '#1 SOTA SWE',
                    },
                    {
                      name: 'Vals Index GDP',
                      argon: 68.9,
                      opus: 67.0,
                      astra: 63.1,
                      tag: '#1 OF 49',
                    },
                    {
                      name: 'Harvey Legal',
                      argon: 19.6,
                      opus: 3.8,
                      astra: 5.4,
                      tag: '5.1× OPUS',
                    },
                  ].map((item) => (
                    <div key={item.name} className="telemetry-bar-card">
                      <div className="tbc-title-row">
                        <span className="tbc-name">{item.name}</span>
                        <span className="tbc-badge">{item.tag}</span>
                      </div>
                      <div className="tbc-track">
                        <div
                          className="tbc-fill-argon"
                          style={{ width: `${Math.min(100, item.argon)}%` }}
                        />
                      </div>
                      <div className="tbc-scores-row">
                        <strong className="score-argon">Argon: {item.argon}%</strong>
                        {item.astra !== null && (
                          <span className="score-rival">Astra: {item.astra}%</span>
                        )}
                        {item.opus !== null && (
                          <span className="score-rival">Opus 5.5: {item.opus}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 04: HARD BOUNDARIES & ANODIZED OSCILLOSCOPE DARKROOM
            Concise ~54-char Mandarin lead sentence + Interactive Hardware Oscilloscope
           ===================================================================== */}
        <section id="ch04" className="chapter-section ch04-boundary-section">
          <div className="chapter-container">
            <div className="ch04-header-block">
              <div className="chapter-eyebrow">{CHAPTER_NARRATIVES[3].code}</div>
              <h2 className="chapter-title">{CHAPTER_NARRATIVES[3].title}</h2>
              <p className="chapter-first-sentence">{CHAPTER_NARRATIVES[3].firstSentence}</p>
            </div>

            <div className="ch04-oscilloscope-workbench">
              {/* Left: 4 Tactile Hardware Boundary Selector Switches */}
              <div className="boundary-switch-list" role="tablist" aria-label="能力邊界診斷切換">
                {HARD_BOUNDARIES.map((b) => {
                  const isSelected = inspectedBoundary === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className={`boundary-shutter-btn ${isSelected ? 'is-focused' : ''}`}
                      onClick={() => setInspectedBoundary(b.id)}
                    >
                      <div className="bsc-top-bar">
                        <span className="bsc-code">{b.code}</span>
                        <span className="bsc-warning-pill">{b.shortTag}</span>
                      </div>
                      <div className="bsc-diagnostic-line">
                        <code>{b.diagnosticCode}</code>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Live Hardware Rejection & Boundary Oscilloscope Canvas */}
              <div className="boundary-oscilloscope-frame">
                <div className="bof-header">
                  <span>KERNEL BOUNDARY OSCILLOSCOPE // LIVE SIGNAL INSPECTION</span>
                  <code>MODE: {inspectedBoundary.toUpperCase()}</code>
                </div>
                <BoundaryOscilloscopeCanvas
                  selectedBoundary={inspectedBoundary}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 05 (FINAL CHAPTER): SWISS ARCHIVAL ALABASTER DOSSIER
            Full Facts, AA Scores, Coding & Domain Comparisons, 35 Benchmarks & Sources
           ===================================================================== */}
        <section id="ch05" className="chapter-section ch05-dossier-section">
          <div className="chapter-container">
            <div className="dossier-masthead">
              <div className="dossier-eyebrow">{CHAPTER_NARRATIVES[4].code}</div>
              <h2 className="dossier-main-title">{CHAPTER_NARRATIVES[4].title}</h2>
              <p className="dossier-lead-sentence">{CHAPTER_NARRATIVES[4].firstSentence}</p>
            </div>

            {/* 5.1 Domain & Coding Deep-Dive vs. Other Frontier Models */}
            <div className="dossier-block">
              <div className="dossier-section-head">
                <span className="dsh-index">SECTION 01</span>
                <h3>對程式碼與各專業領域的理解：我與 Claude Opus 5.5、GPT-6 Astra 的核心差異</h3>
              </div>

              <div className="domain-analysis-grid">
                {DOMAIN_COMPARISONS.map((dom) => (
                  <article key={dom.id} className="domain-card">
                    <div className="dc-header">
                      <span className="dc-code">{dom.code}</span>
                      <span className="dc-en">{dom.domainEn}</span>
                    </div>
                    <h4 className="dc-title">{dom.domainZh}</h4>
                    <p className="dc-headline">{dom.headline}</p>

                    <ul className="dc-strength-list">
                      {dom.argonStrengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>

                    <div className="dc-diff-box">
                      <strong>與其他旗艦模型的決策分水嶺：</strong>
                      <p>{dom.competitorDiff}</p>
                    </div>

                    <div className="dc-mini-table">
                      {dom.keyMetrics.map((km) => (
                        <div key={km.label} className="dc-metric-row">
                          <span className="dcm-lbl">{km.label}</span>
                          <span className={`dcm-argon win-${km.winner}`}>Argon: {km.argon}</span>
                          <span className="dcm-rival">{km.rival}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 5.2 Artificial Analysis (AA) Independent Leaderboard Breakdown */}
            <div className="dossier-block">
              <div className="dossier-section-head">
                <span className="dsh-index">SECTION 02</span>
                <h3>Artificial Analysis (AA) 獨立評測剖析：智力指數、非幻覺率、推理話量與真實成本</h3>
              </div>

              <div className="aa-highlights-grid">
                {AA_TELEMETRY_HIGHLIGHTS.map((item) => (
                  <div key={item.metric} className="aa-highlight-card">
                    <div className="aah-metric">{item.metric}</div>
                    <div className="aah-value">{item.argonValue}</div>
                    <div className="aah-comp">{item.comparison}</div>
                    <p className="aah-insight">{item.insight}</p>
                  </div>
                ))}
              </div>

              <div className="dossier-table-wrapper">
                <table className="dossier-table aa-comparison-table">
                  <thead>
                    <tr>
                      <th>獨立評測維度 (Artificial Analysis v5.0 / v4.3.2)</th>
                      <th className="col-argon">Gemini 4 Argon (High)</th>
                      <th>Claude Opus 5.5 (High)</th>
                      <th>GPT-6 Astra (Xhigh)</th>
                      <th>GPT-6.1 Sol (Medium)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AA Intelligence Index (v5.0 / v4.3.2)</td>
                      <td className="col-argon">
                        <strong>50.4 (v5.0) / 53 (v4.3.2)</strong>
                      </td>
                      <td>52.0 (Max 為 58)</td>
                      <td>55.0 (v4.3.2 為 53)</td>
                      <td>46.0 (v4.3.2 為 52)</td>
                    </tr>
                    <tr>
                      <td>AA-Omniscience v1.1 (知識可靠性指數)</td>
                      <td className="col-argon">
                        <strong>46.1 (#1 領先)</strong>
                      </td>
                      <td>42.0</td>
                      <td>44.0</td>
                      <td>40.0</td>
                    </tr>
                    <tr>
                      <td>AA-Omniscience 非幻覺率 / 幻覺率</td>
                      <td className="col-argon">
                        <strong>非幻覺 95.7% (幻覺 4.26% / v1.0 為 15%)</strong>
                      </td>
                      <td>未單獨列示</td>
                      <td>v1.0 幻覺率 51%</td>
                      <td>v1.0 幻覺率 54%</td>
                    </tr>
                    <tr>
                      <td>AutomationBench-AA (商務流程自動化)</td>
                      <td className="col-argon">
                        <strong>78% (#1 領先)</strong>
                      </td>
                      <td>63%</td>
                      <td>67%</td>
                      <td>63%</td>
                    </tr>
                    <tr>
                      <td>HLE-Diamond (Humanity&apos;s Last Exam)</td>
                      <td className="col-argon">
                        <strong>57%</strong>
                      </td>
                      <td>56%</td>
                      <td>62%</td>
                      <td>46%</td>
                    </tr>
                    <tr>
                      <td>單題平均輸出 Tokens / 其中思考 Tokens</td>
                      <td className="col-argon">
                        <strong>116k tokens (含 68k 思考)</strong>
                      </td>
                      <td>60k tokens (含 32k 思考)</td>
                      <td>27k tokens (含 15k 思考)</td>
                      <td>14k tokens (含 5k 思考)</td>
                    </tr>
                    <tr>
                      <td>跑完 AA 指標總輸出 Tokens (Verbosity)</td>
                      <td className="col-argon">
                        <strong>110M – 113M tokens</strong>
                      </td>
                      <td>56M tokens</td>
                      <td>32M tokens</td>
                      <td>15M tokens</td>
                    </tr>
                    <tr>
                      <td>輸出速度 (Output Speed) / 首字時間 (TTFT)</td>
                      <td className="col-argon">
                        <strong>81.4 – 83 tok/s</strong> (TTFT 40.5–47.7s)
                      </td>
                      <td>79 tok/s (TTFT 47.5s)</td>
                      <td>68 tok/s (TTFT 202.7s)</td>
                      <td>57 tok/s (TTFT 8.2s)</td>
                    </tr>
                    <tr>
                      <td>官方牌價 (每 1M 輸入 / 輸出) vs 單題實測成本</td>
                      <td className="col-argon">
                        <strong>$2/$10 體驗 ($4/$20 正式)｜單題 $7.68</strong>
                      </td>
                      <td>$4 / $20｜單題 $3.46</td>
                      <td>$10 / $50｜單題 $3.66</td>
                      <td>$2 / $10｜單題 $0.36</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.3 Complete 35-Benchmark Evaluation Matrix */}
            <div className="dossier-block">
              <div className="dossier-section-head">
                <span className="dsh-index">SECTION 03</span>
                <h3>35 項完整基準評測對照表（Google DeepMind 官方 + Artificial Analysis + Vals AI &amp; Design Arena）</h3>
              </div>

              <div className="benchmark-filter-bar" role="tablist" aria-label="評測資料來源篩選">
                {[
                  { key: 'ALL', label: `全部評測 (${BENCHMARKS.length})` },
                  {
                    key: 'DEEPMIND',
                    label: `DeepMind 官方模型卡 (${
                      BENCHMARKS.filter((b) => b.source === 'DeepMind Official').length
                    })`,
                  },
                  {
                    key: 'AA',
                    label: `Artificial Analysis (${
                      BENCHMARKS.filter((b) => b.source === 'Artificial Analysis').length
                    })`,
                  },
                  {
                    key: 'VALS_ARENA',
                    label: `Vals AI & Design Arena (${
                      BENCHMARKS.filter((b) => b.source === 'Vals AI & Design Arena').length
                    })`,
                  },
                  {
                    key: 'ARGON_LEADS',
                    label: `Argon 領先或並列第一 (${BENCHMARKS.filter((b) => b.argonLeads).length})`,
                  },
                  {
                    key: 'RIVAL_LEADS',
                    label: `對手領先項目 (${BENCHMARKS.filter((b) => !b.argonLeads).length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={benchFilter === tab.key}
                    className={`bench-filter-btn ${benchFilter === tab.key ? 'active' : ''}`}
                    onClick={() => setBenchFilter(tab.key as BenchmarkFilter)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="dossier-table-wrapper">
                <table className="dossier-table benchmark-master-table">
                  <thead>
                    <tr>
                      <th>來源</th>
                      <th>領域</th>
                      <th>評測項目 (Benchmark)</th>
                      <th>說明與排名備註</th>
                      <th className="col-argon">Gemini 4 Argon</th>
                      <th>GPT-6 Astra</th>
                      <th>Claude Fable 5.1</th>
                      <th>Claude Opus 5.5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBenchmarks.map((b) => (
                      <tr key={b.id} className={b.argonLeads ? 'row-argon-leads' : 'row-rival-leads'}>
                        <td>
                          <span className="src-pill">{b.source}</span>
                        </td>
                        <td>{b.categoryZh}</td>
                        <td>
                          <strong>{b.benchmark}</strong>
                        </td>
                        <td className="note-cell">{b.note}</td>
                        <td className="col-argon">
                          <span className={`score-chip ${b.argonLeads ? 'is-win' : 'is-trail'}`}>
                            {b.argon}
                          </span>
                        </td>
                        <td>{b.gpt6Astra}</td>
                        <td>{b.claudeFable51}</td>
                        <td>{b.claudeOpus55}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.4 Collaboration Protocol, Hard Limitations Details & 14-Row Spec Matrix */}
            <div className="dossier-block">
              <div className="dossier-section-head">
                <span className="dsh-index">SECTION 04</span>
                <h3>人機協作四大原則、四大能力限制詳解與完整查證硬體／API 技術規格表</h3>
              </div>

              <div className="collab-protocol-grid">
                {COLLABORATION_PROTOCOLS.map((c) => (
                  <div key={c.step} className="collab-card">
                    <span className="collab-step">PROTOCOL // {c.step}</span>
                    <h4>{c.title}</h4>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>

              <div className="collab-protocol-grid" style={{ marginBottom: '1.5rem' }}>
                {HARD_BOUNDARIES.map((b) => (
                  <div key={b.id} className="collab-card boundary-detail-dossier-card">
                    <span className="collab-step" style={{ color: '#b91c1c' }}>
                      {b.code} · {b.shortTag}
                    </span>
                    <h4>{b.title}</h4>
                    <p>{b.fact}</p>
                  </div>
                ))}
              </div>

              <div className="dossier-table-wrapper">
                <table className="dossier-table spec-master-table">
                  <thead>
                    <tr>
                      <th>規格項目</th>
                      <th>查證數值與官方設定</th>
                      <th>技術細節與限制說明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VERIFIED_SPEC_TABLE.map((row) => (
                      <tr key={row.label}>
                        <td className="spec-lbl-cell">
                          <strong>{row.label}</strong>
                        </td>
                        <td className="spec-val-cell">
                          <span
                            className={
                              row.value === '官方未公開' ? 'undisclosed-badge' : 'verified-val'
                            }
                          >
                            {row.value}
                          </span>
                        </td>
                        <td className="spec-detail-cell">{row.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.5 Official & Independent Verification Sources */}
            <footer className="dossier-sources-block" aria-label="資料來源">
              <div className="dossier-section-head">
                <span className="dsh-index">SECTION 05 // SOURCES</span>
                <h3>資料來源（Official &amp; Independent Verification Sources）</h3>
              </div>
              <div className="sources-list-grid">
                {OFFICIAL_SOURCES.map((src) => (
                  <div key={src.id} className="source-item-card">
                    <div className="sic-meta">
                      <span className="sic-id">{src.id}</span>
                      <span className="sic-pub">{src.publisher}</span>
                      <span className="sic-date">{src.date}</span>
                    </div>
                    <h4 className="sic-title">
                      <a href={src.url} target="_blank" rel="noreferrer">
                        {src.title} ↗
                      </a>
                    </h4>
                    <code className="sic-url">{src.url}</code>
                    <p className="sic-summary">{src.summary}</p>
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
