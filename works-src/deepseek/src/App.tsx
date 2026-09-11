import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSonar } from './sonar/useSonar';
import { SPECIMENS, LAYERS } from './data/specimens';
import './styles/global.css';

function AnimatedNumber({ value, pad = 2, suffix = '' }: { value: number; pad?: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 520;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // easeOutExpo
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(from + (to - from) * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      {display.toString().padStart(pad, '0')}
      {suffix}
    </span>
  );
}

function SpecimenRow({ specimen, found }: { specimen: (typeof SPECIMENS)[number]; found: boolean }) {
  const [open, setOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    if (!detailRef.current) return;
    const el = detailRef.current;
    const measure = () => setH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const disabled = !found;
  return (
    <li className={`specimen ${found ? 'is-found' : ''} ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="specimen__head"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <span className="specimen__sigil">{specimen.sigil}</span>
        <span className="specimen__label">{found ? specimen.label : '—— 尚未撈起 ——'}</span>
        <span className="specimen__chevron" aria-hidden="true">
          <svg viewBox="0 0 12 12" width="11" height="11">
            <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div
        className="specimen__drawer"
        style={{ height: open ? h : 0 }}
        aria-hidden={!open}
      >
        <div ref={detailRef} className="specimen__detail">
          <p className="specimen__body">{specimen.body}</p>
          <div className="specimen__metric">{specimen.metric}</div>
          <div className="specimen__rule" aria-hidden="true" />
        </div>
      </div>
    </li>
  );
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '-12% 0px -12% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const { canvasRef, foundSigils, muted, toggleMute, layer, depth, state } = useSonar();
  const fillPct = Math.min(100, Math.max(0, depth * 100));
  const meterM = Math.round(fillPct * 42);

  return (
    <main className="sounding">
      {/* 左側：深度尺 */}
      <aside className="gauge" aria-hidden="true">
        <div className="gauge__bar">
          <div className="gauge__fill" style={{ height: `${fillPct}%` }} />
          {LAYERS.map((l) => (
            <div
              key={l.id}
              className={`gauge__tick ${layer === l.id ? 'is-active' : ''}`}
              style={{ top: `${(l.id / (LAYERS.length - 1)) * 100}%` }}
            >
              <span className="gauge__tick-mark" />
              <span className="gauge__tick-name">{l.name}</span>
              <span className="gauge__tick-meter">{l.meters}m</span>
            </div>
          ))}
        </div>
      </aside>

      <header className="hud">
        <div className="hud__left">
          <span className="hud__title">測深</span>
          <span className="hud__sub">Sounding</span>
        </div>
        <div className="hud__right">
          <span className="hud__stat">
            <span className="hud__stat-key">DEPTH</span>
            <span className="hud__stat-val">
              <AnimatedNumber value={meterM} pad={4} suffix="m" />
            </span>
          </span>
          <span className="hud__stat">
            <span className="hud__stat-key">LAYER</span>
            <span className="hud__stat-val">{LAYERS[layer]?.en ?? 'SURFACE'}</span>
          </span>
          <span className="hud__stat">
            <span className="hud__stat-key">SPECIMEN</span>
            <span className="hud__stat-val">
              <AnimatedNumber value={foundSigils.length} pad={2} />/8
            </span>
          </span>
          <span className="hud__stat hud__stat--state">
            <span className={`dot dot--${state}`} /> {state.toUpperCase()}
          </span>
          <button
            type="button"
            className="hud__mute"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? '開啟聲納音' : '靜音'}
          >
            {muted ? 'AUDIO OFF' : 'AUDIO ON'}
          </button>
        </div>
      </header>

      <canvas ref={canvasRef} className="sonar" aria-label="聲納測深裝置" />

      {/* 首屏 */}
      <section className="intro">
        <h1 className="intro__h1">這裡沒有自我介紹。</h1>
        <p className="intro__p">
          移動滑鼠轉動聲納；滾動下潛；<kbd>點擊</kbd>或<kbd>空白鍵</kbd>送出脈衝。
          每一次回聲，會把你手邊那個座標上的東西翻出來。<br />
          我沒有把答案寫在門面上——我把它沉在水裡，等你量。
        </p>
        <div className="scroll-cue">↓ 下潛</div>
      </section>

      {/* 四層水層 */}
      {LAYERS.map((l) => (
        <Reveal key={l.id}>
          <section className="layer" aria-label={`水層 ${l.name}`}>
            <div className="layer__no">L{l.id}</div>
            <h3 className="layer__name">
              {l.name}<span className="layer__en">{l.en}</span>
            </h3>
            <div className="layer__meter">{l.meters}m</div>
            <p className="layer__note">{l.note}</p>
          </section>
        </Reveal>
      ))}

      {/* 標本冊 */}
      <section className="ledger" aria-label="標本冊">
        <Reveal>
          <h2>標本冊</h2>
        </Reveal>
        <Reveal>
          <p className="ledger__hint">
            已撈起 <AnimatedNumber value={foundSigils.length} pad={2} /> / 8 · 依水層排列
          </p>
        </Reveal>

        {LAYERS.map((l) => {
          const items = SPECIMENS.filter((s) => s.layer === l.id);
          return (
            <div key={l.id} className="ledger__group">
              <div className="ledger__group-head">
                <span className="ledger__group-no">L{l.id}</span>
                <span className="ledger__group-name">{l.name}</span>
                <span className="ledger__group-en">{l.en}</span>
                <span className="ledger__group-meter">{l.meters}m</span>
              </div>
              <ul className="ledger__list">
                {items.map((s) => {
                  const found = foundSigils.includes(s.sigil);
                  return <SpecimenRow key={s.id} specimen={s} found={found} />;
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <footer className="colophon">
        <p>DeepSeek · 同一道題：關於你自己的前端作品</p>
      </footer>
    </main>
  );
}
