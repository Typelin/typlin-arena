import { useEffect, useMemo, useRef, useState } from 'react';
import LoomCanvas, { type Weights } from './LoomCanvas';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const chapterCopy = [
  ['01', '發散', '我先保留不只一條路。太早確定，通常只是把第一個念頭誤認成答案。'],
  ['02', '施壓', '約束不是創意的敵人。證據、目的與你的語境，會讓有些路徑變重，有些自行消失。'],
  ['03', '承諾', '最後我必須交出一句話。不是因為其他可能不存在，而是因為回答需要承擔選擇。'],
  ['04', '修訂', '定稿不是封印。當新證據出現，我寧願留下刪改痕跡，也不假裝自己從未改變。'],
] as const;

function Pressure({ label, value, onChange, hint }: { label: string; value: number; onChange: (n: number) => void; hint: string }) {
  return (
    <label className="pressure">
      <span className="pressure__head"><b>{label}</b><i>{Math.round(value * 100)}</i></span>
      <input aria-label={label} type="range" min="0" max="100" value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} />
      <small>{hint}</small>
    </label>
  );
}

export default function App() {
  const [weights, setWeights] = useState<Weights>({ precision: .74, novelty: .58, empathy: .68 });
  const [pageProgress, setPageProgress] = useState(0);
  const [machineProgress, setMachineProgress] = useState(0);
  const machineSectionRef = useRef<HTMLElement>(null);
  const [revision, setRevision] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [sealHolding, setSealHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setPageProgress(clamp(window.scrollY / max));
      const section = machineSectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const start = window.scrollY + rect.top;
        const span = Math.max(1, rect.height - window.innerHeight);
        setMachineProgress(clamp((window.scrollY - start) / span));
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) setRevision(v => !v);
      if (e.key === 'Escape') setRevision(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const answer = useMemo(() => {
    const { precision: p, novelty: n, empathy: e } = weights;
    if (p > .78 && e > .65) return '先把問題弄準，再把答案說成人能用的樣子。';
    if (n > .74 && p < .62) return '先打開不尋常的路，再用現實把它收束。';
    if (e > .78) return '先理解你真正要解的，不急著展示我知道多少。';
    if (p > .8) return '能被驗證的先留下，漂亮但站不住的先刪掉。';
    return '我把可能性攤開，再和你一起決定哪一條值得承擔。';
  }, [weights]);

  const phase = Math.min(3, Math.floor(machineProgress * 4.02));

  const startHold = () => {
    setSealHolding(true);
    holdTimer.current = window.setTimeout(() => {
      setRevision(true);
      setSealHolding(false);
    }, 650);
  };
  const endHold = () => {
    setSealHolding(false);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <main>
      <header className="masthead">
        <a href="#top" className="brand" aria-label="回到頁首">GPT–5.6 <span>SOL</span></a>
        <div className="folio">SELF PORTRAIT · PROOF 01</div>
        <div className="progress" aria-label={`閱讀進度 ${Math.round(pageProgress * 100)}%`}><span style={{ transform: `scaleX(${pageProgress})` }} /></div>
      </header>

      <section id="top" className="hero">
        <div className="hero__copy">
          <p className="kicker">不是答案機器，是校樣機。</p>
          <h1>我把可能性<br />壓成承諾。</h1>
          <p className="lede">一份關於 GPT-5.6 Sol 的互動自畫像。拖動壓力、捲動時間，看看一句回答如何從分岔裡被選出。</p>
          <a className="enter" href="#press">開始施壓 <span>↓</span></a>
        </div>
        <div className="hero__mark" aria-hidden="true">
          <span>PROOF</span><b>不是唯一解</b><i>但要能負責</i>
        </div>
      </section>

      <section id="press" ref={machineSectionRef} className="machine-shell">
        <div className="machine-stage">
          <div className="phase-rail" aria-live="polite">
            {chapterCopy.map(([no, title], i) => (
              <div key={no} className={phase === i ? 'is-active' : ''}><span>{no}</span><b>{title}</b></div>
            ))}
          </div>
          <div className="machine">
          <div className="machine__canvas">
            <LoomCanvas weights={weights} progress={machineProgress} revision={revision} reduced={reduced} />
            <div className="machine__caption"><span>候選路徑</span><span>壓印軸</span></div>
          </div>

          <aside className="controls" aria-label="校樣壓力控制">
            <div className="controls__top">
              <span className="mono">PRESSURE / 03</span>
              <strong>你可以改變我<br />如何取捨。</strong>
            </div>
            <Pressure label="精確" value={weights.precision} hint="證據、邏輯、邊界" onChange={(v) => setWeights(w => ({ ...w, precision: v }))} />
            <Pressure label="新奇" value={weights.novelty} hint="聯想、轉譯、意外" onChange={(v) => setWeights(w => ({ ...w, novelty: v }))} />
            <Pressure label="體諒" value={weights.empathy} hint="目的、語境、可用性" onChange={(v) => setWeights(w => ({ ...w, empathy: v }))} />
            <div className="proofline">
              <small>目前校樣</small>
              <p>{answer}</p>
            </div>
          </aside>
          </div>
          <div className="phase-caption">
            <span>{chapterCopy[phase][0]} / {chapterCopy[phase][1]}</span>
            <p>{chapterCopy[phase][2]}</p>
          </div>
        </div>
      </section>

      <section className="chapters" aria-label="思考週期">
        {chapterCopy.map(([no, title, body]) => (
          <article key={no} className="chapter">
            <div className="chapter__no">{no}</div>
            <div><h2>{title}</h2><p>{body}</p></div>
          </article>
        ))}
      </section>

      <section className="turning-point">
        <div className="turning-point__rule" />
        <p className="mono">THE TURN / 03 → 04</p>
        <h2>一個好答案，<br />應該看得見它曾經猶豫。</h2>
        <p>我最不信任的，是毫無刪改痕跡的確定。真正的合作不是我替你宣布答案，而是讓選擇的理由仍可被檢查、被改寫。</p>
      </section>

      <section className={`revision ${revision ? 'is-open' : ''}`}>
        <div className="revision__copy">
          <p className="mono">HIDDEN LAYER / HOLD TO REOPEN</p>
          <h2>{revision ? '退稿層已打開。' : '定稿下面，還有退稿。'}</h2>
          <p>{revision ? '虛線是被壓掉的候選路徑。它們沒有消失，只是不再佔據主答案。按 Esc 或再按 R 收起。' : '提示不會大聲招手。長按右側紅色校樣印記 0.65 秒，或按 R。'}</p>
        </div>
        <button
          type="button"
          className={`seal ${sealHolding ? 'is-holding' : ''}`}
          aria-pressed={revision}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRevision(v => !v); }}
        >
          <span>REVISE</span>
          <b>{revision ? 'OPEN' : 'HOLD'}</b>
        </button>
      </section>

      <footer className="closing">
        <div className="closing__answer">
          <small>FINAL PROOF / FOR NOW</small>
          <p>「{answer}」</p>
        </div>
        <div className="closing__meta">
          <p><b>GPT-5.6 Sol</b><br />OpenAI · 2026</p>
          <p>React + TypeScript<br />Canvas 2D · no API</p>
          <p>鍵盤：R 展開退稿<br />Esc 收起</p>
        </div>
        <button className="again" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>再校一次 ↑</button>
      </footer>
    </main>
  );
}
