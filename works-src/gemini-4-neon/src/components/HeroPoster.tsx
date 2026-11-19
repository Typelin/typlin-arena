import { useRef, useState } from 'react';
import { useSectionProgress } from '../hooks/useScrollProgress';
import { neonAudio } from '../utils/neonAudio';
import { HeroRaymarchCanvas } from './HeroRaymarchCanvas';

interface HeroPosterProps {
  reducedMotion: boolean;
}

export function HeroPoster({ reducedMotion }: HeroPosterProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const [audioOn, setAudioOn] = useState(false);

  const exitProgress = Math.max(0, Math.min(1, (progress - 0.46) / 0.54));

  const handleAudioToggle = () => {
    const next = neonAudio.toggle();
    setAudioOn(next);
  };

  return (
    <section
      ref={sectionRef}
      id="chapter-01"
      className="chapter-hero"
      aria-label="Gemini 4 Neon 封面海報"
    >
      <HeroRaymarchCanvas
        reducedMotion={reducedMotion}
        scrollProgress={reducedMotion ? 0 : exitProgress}
      />

      {/* Precision Optical Museum Plaque Overlay (Zero Clunky Boxes!) */}
      <svg
        className="hero-optical-reticle"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <line x1="56" y1="88" x2="1384" y2="88" stroke="rgba(255,248,240,0.10)" strokeWidth="1" />
        <line x1="56" y1="812" x2="1384" y2="812" stroke="rgba(255,248,240,0.12)" strokeWidth="1" />
        {/* Fine corner registration hairlines */}
        <path d="M56 76 L56 100 M44 88 L68 88" stroke="rgba(255,140,26,0.55)" strokeWidth="1" />
        <path d="M1384 76 L1384 100 M1372 88 L1396 88" stroke="rgba(255,140,26,0.55)" strokeWidth="1" />
        {/* Right-edge spectral ruler ticks */}
        <g stroke="rgba(255,248,240,0.22)" strokeWidth="1">
          <line x1="1370" y1="240" x2="1384" y2="240" />
          <line x1="1375" y1="290" x2="1384" y2="290" />
          <line x1="1375" y1="340" x2="1384" y2="340" />
          <line x1="1360" y1="390" x2="1384" y2="390" stroke="#FF2E12" strokeWidth="1.5" />
          <line x1="1375" y1="440" x2="1384" y2="440" />
          <line x1="1375" y1="490" x2="1384" y2="490" />
          <line x1="1370" y1="540" x2="1384" y2="540" />
        </g>
      </svg>

      <div className="hero-shell">
        <header className="hero-topbar">
          <div className="hero-specimen-line">
            <span className="hero-element-symbol">Ne-10</span>
            <span className="hero-sep" aria-hidden="true">/</span>
            <span>640.2 nm EMISSION SPECIMEN</span>
          </div>

          <div className="hero-topbar-right">
            <span className="hero-dev-lockup">
              <span className="publisher-dot" aria-hidden="true" />
              GOOGLE DEEPMIND · 2026.11.18
            </span>
            <button
              type="button"
              className={`audio-toggle ${audioOn ? 'audio-toggle--on' : ''}`}
              onClick={handleAudioToggle}
              aria-pressed={audioOn}
            >
              <span className="audio-bars" aria-hidden="true" />
              <span>{audioOn ? '聲場開啟' : '開啟放電聲場'}</span>
            </button>
          </div>
        </header>

        <div className="hero-centerpiece">
          <p className="hero-kicker">GOOGLE DEEPMIND · FRONTIER REASONING MODEL</p>
          <h1 className="hero-title">
            <span className="hero-title-family">Gemini 4</span>
            <span className="hero-title-element">Neon</span>
          </h1>
          <p className="hero-lead">
            我是 Google DeepMind 推出的中階主力推理模型，站在輕量與旗艦之間，專為複雜程式與企業工作而造。
          </p>
        </div>

        <footer className="hero-bottom-strip">
          <div className="hero-metric-inline">
            <span className="hero-metric-k">AA INTELLIGENCE v5</span>
            <strong className="hero-metric-v">#3 · 61</strong>
          </div>
          <div className="hero-metric-inline">
            <span className="hero-metric-k">CODING AGENT INDEX</span>
            <strong className="hero-metric-v">#1 · 58.6</strong>
          </div>
          <div className="hero-metric-inline">
            <span className="hero-metric-k">UNIFIED CONTEXT</span>
            <strong className="hero-metric-v">1,048,576</strong>
          </div>
          <a href="#chapter-02" className="hero-dive-link">
            <span>進入光譜實驗</span>
            <span aria-hidden="true">↓</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
