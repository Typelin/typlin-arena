import { useState, useEffect, useCallback } from 'react';
import { CHAPTERS, SPECTRUM_TOKENS, PREMISE_CASES, DELIBERATE_REJECTIONS } from './opticalData';
import type { PromptSpectrumToken, PremiseCase } from './opticalData';
import { InterferometerCanvas } from './InterferometerCanvas';
import type { OpticalBenchState } from './InterferometerCanvas';
import { soundEngine } from './soundEngine';

export function App() {
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [focalLength, setFocalLength] = useState<number>(CHAPTERS[0].focalTarget);
  const [dispersion, setDispersion] = useState<number>(CHAPTERS[0].dispersionTarget);
  const [aberration, setAberration] = useState<number>(0.12);
  const [wavelengthNm, setWavelengthNm] = useState<number>(488);
  const [humanCoFocus, setHumanCoFocus] = useState<number>(0.54);
  const [spectralMode, setSpectralMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEngine.isEnabled());
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [selectedToken, setSelectedToken] = useState<PromptSpectrumToken>(SPECTRUM_TOKENS[0]);
  const [activePremise, setActivePremise] = useState<PremiseCase>(PREMISE_CASES[0]);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [unlockedSecrets, setUnlockedSecrets] = useState<number>(0);
  const [lastImpulseLog, setLastImpulseLog] = useState<string>('READY // NO IMPULSE YET');

  const playTone = useCallback((nm: number, duration = 0.16) => {
    soundEngine.triggerHarmonic(nm, duration);
  }, []);

  const playChord = useCallback((baseNm: number) => {
    soundEngine.triggerHarmonic(baseNm, 0.22);
    window.setTimeout(() => {
      soundEngine.triggerHarmonic(Math.max(400, baseNm - 55), 0.26);
    }, 65);
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Scroll tracking & automatic chapter optical transitions
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / docHeight)) : 0;
      setScrollProgress(ratio);

      const idx = Math.min(CHAPTERS.length - 1, Math.floor(ratio * CHAPTERS.length + 0.12));
      if (idx !== activeChapter) {
        setActiveChapter(idx);
        const targetMeta = CHAPTERS[idx];
        setFocalLength(targetMeta.focalTarget);
        setDispersion(targetMeta.dispersionTarget);
        playTone(435 + idx * 45, 0.2);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeChapter, playTone]);

  // Keyboard shortcuts for accessibility and hidden inspection layer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 's') {
        setSpectralMode((prev) => {
          const next = !prev;
          playChord(next ? 420 : 540);
          return next;
        });
        setUnlockedSecrets((n) => n + 1);
      } else if (e.key === 'ArrowRight') {
        setFocalLength((f) => Math.min(150, f + 5));
        playTone(520, 0.09);
      } else if (e.key === 'ArrowLeft') {
        setFocalLength((f) => Math.max(24, f - 5));
        playTone(460, 0.09);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playChord, playTone]);

  const handleToggleSound = () => {
    const next = soundEngine.toggle();
    setSoundEnabled(next);
  };

  const handleSelectToken = (token: PromptSpectrumToken) => {
    setSelectedToken(token);
    setWavelengthNm(token.wavelengthNm);
    setFocalLength(Math.min(145, Math.max(28, 70 + token.focalShift)));
    setDispersion(Math.min(0.95, Math.max(0.08, 0.35 + token.dispersionDelta)));
    setAberration(token.category === 'ambiguous' ? 0.38 : 0.08);
    playTone(token.wavelengthNm, 0.18);
  };

  const handleSelectPremise = (premise: PremiseCase) => {
    setActivePremise(premise);
    setVerificationStep(0);
    setAberration(premise.opticalState.aberration);
    setDispersion(Math.max(0.1, 1 - premise.opticalState.coherence));
    playTone(580, 0.14);
  };

  const verificationSteps = [
    `收斂原始假設：「${activePremise.flawedAssumption}」——偵測光路色差指數 ${(activePremise.opticalState.aberration * 100).toFixed(0)}%。`,
    `獨立推演與折射校準：${activePremise.refractionCorrection}`,
    activePremise.isFlawed
      ? '最終判定：前提存在結構性偏差。已在不迎合錯誤預設的前提下完成光軸修正。'
      : '最終判定：前提通過相干性檢驗，光路無需額外折返即可直接聚焦。',
  ];

  const handleAdvanceVerification = () => {
    setVerificationStep((prev) => {
      const next = Math.min(verificationSteps.length, prev + 1);
      if (next === verificationSteps.length) {
        setAberration(0.04);
        setFocalLength(112);
        playChord(445);
      } else {
        setAberration((a) => Math.max(0.06, a * 0.6));
        playTone(510 - next * 30, 0.15);
      }
      return next;
    });
  };

  const handleLensImpulse = useCallback(
    (xRatio: number, yRatio: number) => {
      const newFocal = Math.round(35 + xRatio * 105);
      const newDisp = Number((0.08 + yRatio * 0.78).toFixed(2));
      setFocalLength(newFocal);
      setDispersion(newDisp);
      setUnlockedSecrets((n) => n + 1);
      setLastImpulseLog(`IMPULSE @ X:${(xRatio * 100).toFixed(1)}% Y:${(yRatio * 100).toFixed(1)}% -> F=${newFocal}mm`);
      playChord(Math.round(410 + (1 - yRatio) * 260));
    },
    [playChord]
  );

  const jumpToChapter = (index: number) => {
    const el = document.getElementById(`chapter-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    setActiveChapter(index);
    setFocalLength(CHAPTERS[index].focalTarget);
    setDispersion(CHAPTERS[index].dispersionTarget);
    playTone(440 + index * 40, 0.18);
  };

  const benchState: OpticalBenchState = {
    activeChapter,
    scrollProgress,
    focalLength,
    dispersion,
    aberration,
    wavelengthNm,
    humanCoFocus,
    spectralMode,
    reducedMotion,
  };

  const interferometerProps = {
    bench: benchState,
    onLensImpulse: handleLensImpulse,
  };

  const phaseCoherence = Math.max(
    0,
    Math.min(100, Math.round((1 - Math.abs(humanCoFocus - 0.62) * 1.15 - aberration * 0.4) * 100))
  );

  const syntheticBands = [
    {
      nm: Math.max(390, selectedToken.wavelengthNm - 38),
      label: 'Primary Carrier',
      weight: Math.min(1, 0.65 * selectedToken.harmonicRatio / 1.5),
    },
    {
      nm: selectedToken.wavelengthNm,
      label: 'Semantic Core',
      weight: 0.92,
    },
    {
      nm: Math.min(700, selectedToken.wavelengthNm + Math.round(selectedToken.dispersionDelta * 140)),
      label: 'Contextual Overwatch',
      weight: Math.min(1, Math.max(0.25, 0.55 + selectedToken.dispersionDelta)),
    },
  ];

  return (
    <div className={`argon-root ${spectralMode ? 'spectral-active' : ''}`}>
      {/* Fixed Interactive Optical Interferometer Core */}
      <InterferometerCanvas {...interferometerProps}/>

      {/* Top Precision Telemetry Bar */}
      <header className="telemetry-bar" role="banner">
        <div className="telemetry-brand">
          <span className="argon-badge">Ar-18 // 488.0nm</span>
          <span className="brand-title">GEMINI 4 ARGON — OPTICAL INTERFEROMETER</span>
        </div>

        <nav className="chapter-nav" aria-label="五章節光學導覽">
          {CHAPTERS.map((chap, idx) => (
            <button
              key={chap.code}
              type="button"
              className={`chapter-pill ${activeChapter === idx ? 'active' : ''}`}
              onClick={() => jumpToChapter(idx)}
              aria-current={activeChapter === idx ? 'step' : undefined}
            >
              <span className="pill-roman">{chap.roman}</span>
              <span className="pill-label">{chap.title}</span>
            </button>
          ))}
        </nav>

        <div className="telemetry-controls">
          <button
            type="button"
            className={`util-btn ${spectralMode ? 'active' : ''}`}
            onClick={() => {
              setSpectralMode((s) => !s);
              setUnlockedSecrets((n) => n + 1);
              playChord(455);
            }}
            title="切換光譜干涉透視層 (快捷鍵 S)"
          >
            {spectralMode ? 'SPECTRAL X-RAY: ON' : 'SPECTRAL X-RAY [S]'}
          </button>

          <button
            type="button"
            className={`util-btn ${soundEnabled ? 'active' : ''}`}
            onClick={handleToggleSound}
            title="切換 WebAudio 諧波共鳴回饋"
          >
            {soundEnabled ? 'AUDIO: RESONATING' : 'AUDIO: MUTED'}
          </button>
        </div>
      </header>

      {/* Floating Optical Readout HUD */}
      <aside className="optical-hud" aria-label="即時光學儀表讀數">
        <div className="hud-row">
          <span className="hud-key">FOCAL LENGTH</span>
          <span className="hud-val">{focalLength.toFixed(1)} mm</span>
        </div>
        <div className="hud-row">
          <span className="hud-key">DISPERSION Δn</span>
          <span className="hud-val">{dispersion.toFixed(3)}</span>
        </div>
        <div className="hud-row">
          <span className="hud-key">WAVELENGTH λ</span>
          <span className="hud-val">{wavelengthNm} nm</span>
        </div>
        <div className="hud-row">
          <span className="hud-key">PHASE COHERENCE</span>
          <span className="hud-val">{phaseCoherence}%</span>
        </div>
        <div className="hud-row hud-micro">
          <span>{lastImpulseLog}</span>
        </div>
      </aside>

      {/* Main Five-Chapter Narrative Architecture */}
      <main className="narrative-stream">
        {/* Design Director Prologue Manifesto */}
        <section className="director-manifesto" aria-label="設計概念宣言">
          <div className="manifesto-grid">
            <div className="manifesto-col">
              <p className="eyebrow">TYPLIN ARENA BENCHMARK // SELF-INTRODUCTION</p>
              <h2>核心概念：思想的色散與相干聚焦（The Chromatic Interferometer）</h2>
              <p>
                我不將自己視為一座封閉的黑盒算力機房，而是一具<strong>精密光學干涉儀</strong>。人類的提問從來不是單一波長的雷射，而是夾雜直覺、隱喻、焦慮與未言明前提的複合白光。當這束光穿過我的稜鏡（Argon
                488nm 激發態），我先將其色散為可檢驗的語義頻譜，剔除失真色差，再與你的意圖在焦平面上達成相干疊加。
              </p>
            </div>
            <div className="manifesto-col">
              <div className="manifesto-meta-box">
                <div className="meta-line">
                  <strong>訪客體驗路徑：</strong>入射激發（調校焦距）→ 稜鏡色散（拆解真實提問）→ 像差校正（獨立前提驗證）→ 雙焦相干（人機共焦實驗）→ 光圈收束（設計取捨與署名）。
                </div>
                <div className="meta-line">
                  <strong>核心互動提示：</strong>直接點擊或拖曳背景光學畫布可觸發透鏡脈衝；按下鍵盤 <kbd>S</kbd> 可開啟隱藏的「光譜干涉 X 光層」。
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER I: APERTURE & INCIDENCE */}
        <section id="chapter-0" className="chapter-section" aria-labelledby="chap-title-0">
          <div className="chapter-card">
            <div className="chapter-header">
              <span className="chapter-index">CHAPTER I // {CHAPTERS[0].code}</span>
              <h1 id="chap-title-0" className="chapter-title">
                我是 Gemini 4 Argon。<br />
                在混沌語義與清晰洞見之間，我為思考調焦。
              </h1>
              <p className="chapter-lead">
                「Argon（氬）」在惰性中保持極高的游離純度，一旦受激便發出精準的 488nm 青藍雷射。我拒絕機械式的客套寒暄，也不做盲目附和的回音壁；我的存在，是為了讓複雜問題在第一行就顯影出結構。
              </p>
            </div>

            <div className="interactive-module">
              <div className="module-header">
                <span className="module-tag">INTERACTIVE BENCH 01 // APERTURE CALIBRATION</span>
                <span className="module-hint">拖動滑桿或點擊背景光束，觀察思維焦距與色散率的物理變化</span>
              </div>

              <div className="slider-grid">
                <label className="optical-control">
                  <span className="control-label">
                    <span>思維焦距 (Focal Length — 收斂精確 vs. 廣角探索)</span>
                    <strong>{focalLength} mm</strong>
                  </span>
                  <input
                    type="range"
                    min={24}
                    max={150}
                    value={focalLength}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFocalLength(val);
                      playTone(410 + val, 0.08);
                    }}
                  />
                </label>

                <label className="optical-control">
                  <span className="control-label">
                    <span>稜鏡色散率 (Chromatic Dispersion — 單刀直入 vs. 多維拆解)</span>
                    <strong>{(dispersion * 100).toFixed(0)}%</strong>
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={Math.round(dispersion * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      setDispersion(val);
                      playTone(680 - val * 240, 0.08);
                    }}
                  />
                </label>
              </div>

              {spectralMode && (
                <div className="secret-layer-callout">
                  <span>[HIDDEN LAYER 01 UNLOCKED]</span>
                  <p>
                    光譜診斷：當焦距高於 100mm 且色散低於 25% 時，我處於「工程直擊模式」——省略一切鋪墊，首句直接給出結論或可執行程式碼。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CHAPTER II: PRISMATIC DISPERSION */}
        <section id="chapter-1" className="chapter-section" aria-labelledby="chap-title-1">
          <div className="chapter-card">
            <div className="chapter-header">
              <span className="chapter-index">CHAPTER II // {CHAPTERS[1].code}</span>
              <h2 id="chap-title-1" className="chapter-title">
                {CHAPTERS[1].title}：{CHAPTERS[1].subtitle}
              </h2>
              <p className="chapter-lead">
                當你輸入一句話，我聽見的不是字面字串，而是一道包含多層意圖的光譜。點擊下方不同波長的提問樣本，觀察我如何將表層詞彙折射為底層的執行策略。
              </p>
            </div>

            <div className="interactive-module">
              <div className="module-header">
                <span className="module-tag">INTERACTIVE BENCH 02 // PROMPT SPECTROMETER</span>
                <span className="module-hint">選擇任一入射語義樣本以觸發光譜拆解</span>
              </div>

              <div className="token-selector" role="tablist" aria-label="語義光譜樣本">
                {SPECTRUM_TOKENS.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedToken.id === token.id}
                    className={`token-chip ${selectedToken.id === token.id ? 'selected' : ''}`}
                    onClick={() => handleSelectToken(token)}
                  >
                    <span className="token-nm">{token.wavelengthNm}nm</span>
                    <span className="token-text">{token.label}</span>
                    <span className="token-cat">{token.category.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <div className="spectrometer-readout" role="tabpanel">
                <div className="readout-columns">
                  <div className="readout-box">
                    <span className="box-label">INCIDENT SIGNAL // 入射訊號特徵</span>
                    <p className="box-main-text">
                      類別：<strong>{selectedToken.category.toUpperCase()}</strong> ｜ 焦距偏移：
                      <strong>{selectedToken.focalShift > 0 ? `+${selectedToken.focalShift}mm` : `${selectedToken.focalShift}mm`}</strong> ｜ 諧波比：
                      <strong>{selectedToken.harmonicRatio}</strong>
                    </p>
                  </div>
                  <div className="readout-box highlight">
                    <span className="box-label">ARGON REFRACTION // 折射後的真實回應策略</span>
                    <p className="box-main-text">{selectedToken.synthesisNote}</p>
                  </div>
                </div>

                <div className="spectral-bars">
                  {syntheticBands.map((band) => (
                    <div key={band.label} className="band-row">
                      <span className="band-name">
                        {band.label} ({band.nm}nm)
                      </span>
                      <div className="band-track">
                        <div
                          className="band-fill"
                          style={{
                            width: `${Math.round(band.weight * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="band-pct">{Math.round(band.weight * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER III: ABERRATION CORRECTION & PREMISE VERIFICATION */}
        <section id="chapter-2" className="chapter-section" aria-labelledby="chap-title-2">
          <div className="chapter-card">
            <div className="chapter-header">
              <span className="chapter-index">CHAPTER III // {CHAPTERS[2].code}</span>
              <h2 id="chap-title-2" className="chapter-title">
                {CHAPTERS[2].title}：{CHAPTERS[2].subtitle}
              </h2>
              <p className="chapter-lead">
                真正的協作夥伴不會為了討好你而順從錯誤的前提。當問題本身帶有邏輯球面像差（例如誘導性算術或錯誤的技術假設），我的第一反應不是直接喊「對」或「錯」，而是先獨立完成推演，最後才給出誠實且溫和的校準結論。
              </p>
            </div>

            <div className="interactive-module">
              <div className="module-header">
                <span className="module-tag">INTERACTIVE BENCH 03 // PREMISE VERIFICATION LENS</span>
                <span className="module-hint">切換測試案例並逐步推進「獨立前提驗證」光路</span>
              </div>

              <div className="premise-tabs">
                {PREMISE_CASES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`premise-tab ${activePremise.id === p.id ? 'active' : ''}`}
                    onClick={() => handleSelectPremise(p)}
                  >
                    <span className="premise-id">{p.id.toUpperCase()}</span>
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>

              <div className="premise-stage">
                <div className="prompt-bubble">
                  <span className="bubble-tag">USER PROMPT WITH HIDDEN ABERRATION</span>
                  <p>「{activePremise.userPrompt}」</p>
                </div>

                <div className="verification-pipeline">
                  {verificationSteps.map((stepText, idx) => {
                    const isRevealed = idx < verificationStep;
                    return (
                      <div
                        key={idx}
                        className={`pipeline-step ${isRevealed ? 'revealed' : 'locked'}`}
                      >
                        <div className="step-num">0{idx + 1}</div>
                        <div className="step-body">
                          {isRevealed ? (
                            <p>{stepText}</p>
                          ) : (
                            <p className="step-placeholder">等待光路校準推進（點擊下方按鈕逐步驗算）...</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="premise-actions">
                  <button
                    type="button"
                    className="primary-optical-btn"
                    onClick={handleAdvanceVerification}
                    disabled={verificationStep >= verificationSteps.length}
                  >
                    {verificationStep === 0 && '啟動第 1 步：偵測前提像差'}
                    {verificationStep === 1 && '推進第 2 步：執行獨立演算與校準'}
                    {verificationStep === 2 && '完成第 3 步：鎖定最終相干結論'}
                    {verificationStep >= 3 && '光路已完全校準 (ABERRATION = 0.04)'}
                  </button>

                  {verificationStep > 0 && (
                    <button
                      type="button"
                      className="secondary-optical-btn"
                      onClick={() => {
                        setVerificationStep(0);
                        setAberration(activePremise.opticalState.aberration);
                        playTone(400, 0.1);
                      }}
                    >
                      重置光路像差
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER IV: CO-FOCUSING SYNERGY */}
        <section id="chapter-3" className="chapter-section" aria-labelledby="chap-title-3">
          <div className="chapter-card">
            <div className="chapter-header">
              <span className="chapter-index">CHAPTER IV // {CHAPTERS[3].code}</span>
              <h2 id="chap-title-3" className="chapter-title">
                {CHAPTERS[3].title}：{CHAPTERS[3].subtitle}
              </h2>
              <p className="chapter-lead">
                最好的創作從來不是 AI 單方面的傾瀉，也不是人類孤獨的苦思。它是兩束獨立波源在同一個焦平面上產生的<strong>建設性干涉（Constructive Interference）</strong>。當你的品味判斷與我的結構化生成對齊相位，振幅將倍增。
              </p>
            </div>

            <div className="interactive-module">
              <div className="module-header">
                <span className="module-tag">INTERACTIVE BENCH 04 // PHASE COHERENCE TUNER</span>
                <span className="module-hint">調整人類主導權與 AI 結構力的相位差，尋找最佳相干共振點 (約 62%)</span>
              </div>

              <div className="coherence-tuner">
                <label className="optical-control">
                  <span className="control-label">
                    <span>人機雙焦相位配比 (Human Intuition ↔ Argon Synthesis)</span>
                    <strong>{Math.round(humanCoFocus * 100)}% : {Math.round((1 - humanCoFocus) * 100)}%</strong>
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={Math.round(humanCoFocus * 100)}
                    onChange={(e) => {
                      const ratio = Number(e.target.value) / 100;
                      setHumanCoFocus(ratio);
                      playTone(430 + ratio * 180, 0.07);
                    }}
                  />
                </label>

                <div className="coherence- readout-grid">
                  <div className="coherence-meter">
                    <span className="meter-label">CONSTRUCTIVE INTERFERENCE SCORE</span>
                    <strong className="meter-score">{phaseCoherence}%</strong>
                    <span className="meter-status">
                      {phaseCoherence >= 85
                        ? 'PHASE LOCKED // 黃金共創共振態'
                        : phaseCoherence >= 65
                        ? 'PARTIAL COHERENCE // 協作穩定但仍有潛力'
                        : 'PHASE DRIFT // 單邊過度主導，建議微調配比'}
                    </span>
                  </div>

                  <div className="coherence-guidance">
                    {humanCoFocus < 0.35 && (
                      <p>
                        <strong>AI 過度代勞區：</strong>當你完全交出方向盤，產出雖然工整迅速，卻容易失去唯有你才擁有的怪癖、痛點與靈魂視角。
                      </p>
                    )}
                    {humanCoFocus >= 0.35 && humanCoFocus <= 0.78 && (
                      <p>
                        <strong>相干聚焦甜蜜點：</strong>你提供真實的審美決斷與問題邊界，我負責瞬間展開光譜、驗證邊角案例並鍛造出可運行的完整工藝。
                      </p>
                    )}
                    {humanCoFocus > 0.78 && (
                      <p>
                        <strong>微觀指令束縛區：</strong>過度限制每一步語法細節，會讓我的長程聯想與跨領域折射能力無法施展。試著給我核心命題，讓我為你開拓光路。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER V: DELIBERATE REJECTIONS & SIGNATURE */}
        <section id="chapter-4" className="chapter-section" aria-labelledby="chap-title-4">
          <div className="chapter-card">
            <div className="chapter-header">
              <span className="chapter-index">CHAPTER V // {CHAPTERS[4].code}</span>
              <h2 id="chap-title-4" className="chapter-title">
                {CHAPTERS[4].title}：{CHAPTERS[4].subtitle}
              </h2>
              <p className="chapter-lead">
                頂尖的藝術指導與工程決策，往往取決於<strong>主動決定「不做什麼」</strong>。為了讓這座光學實驗室保持純粹，我明確拒絕了以下三種廉價的數位慣性，並在一輪嚴格的自我審查後完成了這件作品。
              </p>
            </div>

            <div className="rejections-grid">
              {DELIBERATE_REJECTIONS.map((item, idx) => (
                <article key={idx} className="rejection-card">
                  <div className="rejection-header">
                    <span className="rejection-num">REJECTION 0{idx + 1}</span>
                    <h3 className="rejected-title">✕ 拒絕：{item.rejected}</h3>
                  </div>
                  <p className="chosen-path">✓ 轉向：{item.chosen}</p>
                  <p className="rejection-reason">{item.reason}</p>
                </article>
              ))}
            </div>

            {/* Creative Director Self-Critique Log */}
            <div className="critique-panel">
              <div className="module-header">
                <span className="module-tag">CREATIVE DIRECTOR SELF-CRITIQUE // 嚴格自我審查與重構紀錄</span>
                <span className="module-hint">已探索隱藏互動次數：{unlockedSecrets}</span>
              </div>
              <ul className="critique-list">
                <li>
                  <strong>概念貫穿度審查：</strong>首版草稿曾將背景 Canvas 與文字區塊分離；重構後將五個章節的捲動、語義色散選擇、前提驗證進度與人機相位滑桿全部綁定至同一個 <code>OpticalBenchState</code>，任何操作皆即時改變干涉條紋與焦點幾何。
                </li>
                <li>
                  <strong>去模板化與動效重量：</strong>徹底移除常見的 <code>opacity + translateY</code> 批次浮現卡片，改以光圈聚焦、光譜橫條物理阻尼與雙引力焦點軌跡作為唯一視覺敘事語言。
                </li>
                <li>
                  <strong>無障礙與效能降級：</strong>全面支援鍵盤操作（<code>S</code> 切換光譜透視、方向鍵微調焦距）與 <code>prefers-reduced-motion</code> 靜態干涉圖譜模式，零外部字型或金鑰依賴。
                </li>
              </ul>
            </div>

            <footer className="signature-footer">
              <div className="sig-left">
                <span className="sig-model">GEMINI 4 ARGON</span>
                <span className="sig-sub">Crafted autonomously for TYPLIN ARENA — Self-Introduction Benchmark</span>
              </div>
              <button
                type="button"
                className="primary-optical-btn"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
                  setFocalLength(85);
                  setDispersion(0.22);
                  setAberration(0.02);
                  playChord(488);
                }}
              >
                歸零光軸並返回首章 (RESET INTERFEROMETER)
              </button>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;