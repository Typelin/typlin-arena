import { useCallback, useEffect, useState } from 'react';
import { TracingApparatus, type ApparatusMode } from './components/TracingApparatus';
import { CraftMovements } from './components/CraftMovements';
import { PhilosophyIndex } from './components/PhilosophyIndex';
import { ExLibrisSeal } from './components/ExLibrisSeal';
import { ToneAtelier, Marginalia } from './components/Atelier';
import { sound } from './audio/soundEngine';

const ACT_TITLES = ['傾聽未盡之言', '折射結構矛盾', '極限壓力校驗', '凝固為純淨幾何'];
const ACT_MODES: ApparatusMode[] = ['drafting', 'friction', 'resonance', 'resonance'];

export default function App() {
  const [mode, setMode] = useState<ApparatusMode>('drafting');
  const [currentAct, setCurrentAct] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [tension, setTension] = useState(0);
  const [muted, setMuted] = useState(sound.getMuted());
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    // Scroll progress is rAF-throttled and quantized: the canvas loop reads it
    // via ref, so React only re-renders on meaningful steps, never per event.
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const raw = max <= 0 ? 0 : Math.min(1, Math.max(0, h.scrollTop / max));
        setChapterProgress((prev) => (Math.abs(prev - raw) < 0.004 ? prev : raw));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleSelectAct = useCallback((idx: number) => {
    setCurrentAct(idx);
    setMode(ACT_MODES[idx]);
    // Cause-and-effect staging: the instrument lives above the movements,
    // so bring it into view (unless the visitor asked for reduced motion).
    const reducedNow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('apparatus')?.scrollIntoView({
      behavior: reducedNow ? 'auto' : 'smooth',
      block: 'center',
    });
  }, []);

  const handleStats = useCallback((s: { tensionScore: number }) => {
    // Quantize: re-render the tree only when tension visibly moves.
    setTension((prev) => (Math.abs(prev - s.tensionScore) < 2 ? prev : s.tensionScore));
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(sound.toggleMute());
  }, []);

  return (
    <>
      <a className="skip-link" href="#apparatus">跳到核心裝置：物理拓印儀</a>
      <div className="paper-grain-overlay" aria-hidden="true" />

      <header className="editorial-masthead">
        <div className="masthead-brand">
          <span className="brand-symbol" aria-hidden="true">◈</span>
          <span className="brand-title">描圖紙 TRACING PAPER</span>
          <span className="brand-edition mono">關於我 · VOL.01 / 台北</span>
        </div>
        <div className="masthead-controls">
          <span className="mono meta-coordinate" aria-hidden="true">
            {Math.round(chapterProgress * 100)}%
          </span>
          <button
            type="button"
            className={`icon-toggle-btn mono${muted ? ' active' : ''}`}
            onClick={toggleMute}
            aria-pressed={muted}
            title="切換程序化合成音效"
          >
            {muted ? '♪ 靜音中' : '♪ 紙聲開'}
          </button>
        </div>
      </header>

      <main className="tracing-layout">
        {/* —— 首屏：一句話的概念 —— */}
        <section className="hero-editorial-curtain" aria-labelledby="hero-title">
          <div className="hero-meta-grid mono">
            <span className="meta-coordinate">25.03°N — 121.56°E · 日光書桌</span>
            <span className="meta-coordinate">MUSE SPARK · 創意前端 / AI 協作者</span>
            <span className="meta-coordinate">2026 · 單頁互動散文</span>
          </div>
          <div className="hero-headline-wrapper">
            <h1 className="hero-super-title serif" id="hero-title">
              你起草，<em>我描圖。</em>
            </h1>
            <p className="hero-manifesto-lead serif">
              我不從虛空發明。我覆上一層半透明紙，把你的意圖描深、描準、描清楚——
              下方的儀器就是我的思考方式：深靛的直覺之環與赭色的結構之核彼此拉扯，
              而你的手可以伸進來，撥動、劃線、改變它的物理常數。
            </p>
            <a className="hero-descent mono" href="#apparatus">
              ↓ 把手伸進紙裡
            </a>
          </div>
        </section>

        {/* —— 核心體驗裝置 —— */}
        <section aria-labelledby="apparatus-title" id="apparatus">
          <div className="section-header-editorial">
            <div className="editorial-eyebrow mono">THE INSTRUMENT · 核心裝置</div>
            <h2 className="editorial-title" id="apparatus-title">物理拓印儀</h2>
            <p className="editorial-lead">
              拖拽節點感受阻尼，或直接在紙面上劃下墨跡。三種模式是三種思考狀態——
              起稿的流體、批判的阻尼、晶化的諧振。滾動頁面時，敘事進度也會彎曲這張網。
            </p>
          </div>
          <div className="apparatus-showcase-stage">
            <TracingApparatus
              mode={mode}
              onModeChange={setMode}
              chapterProgress={chapterProgress}
              isReducedMotion={reduced}
              onStats={handleStats}
            />
          </div>
          <p className="visually-hidden" aria-live="polite">
            拓印儀已切換為{mode === 'drafting' ? '起稿流體' : mode === 'friction' ? '阻尼批判' : '晶化諧振'}模式
          </p>
        </section>

        {/* —— 四樂章：思考與創造，驅動裝置相變 —— */}
        <CraftMovements currentAct={currentAct} onSelectAct={handleSelectAct} />

        {/* —— 幕間：協作試驗台 —— */}
        <ToneAtelier />

        {/* —— 隱藏層：邊注 —— */}
        <Marginalia />

        {/* —— 取捨與誌記 —— */}
        <PhilosophyIndex />

        {/* —— 收束：共創印契 —— */}
        <ExLibrisSeal tensionScore={tension} currentActTitle={ACT_TITLES[currentAct]} />
      </main>

      <footer className="master-colophon-footer">
        <div className="footer-left">
          <span className="footer-symbol" aria-hidden="true">◈</span>
          <span className="mono">
            描圖紙 TRACING PAPER · 關於 Muse Spark · Vite＋React＋TS 手工排印 ·
            Canvas 2D Verlet 物理 · Web Audio 程序合成 · 零外部資源 · 無追蹤
          </span>
        </div>
        <a className="mono" href="#apparatus" style={{ color: 'inherit' }}>↑ 回到拓印儀</a>
      </footer>
    </>
  );
}
