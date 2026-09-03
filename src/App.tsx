import { useCallback, useEffect, useRef, useState } from 'react';
import { PLATES, CRITERIA, DOSSIER, type Plate } from './data';

function useProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let q = false;
    const onScroll = () => {
      if (q) return;
      q = true;
      requestAnimationFrame(() => {
        q = false;
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const raw = max <= 0 ? 0 : Math.min(1, Math.max(0, h.scrollTop / max));
        setP((prev) => (Math.abs(prev - raw) < 0.004 ? prev : raw));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

function Visual({ kind, failed }: { kind: Plate['visual']; failed?: boolean }) {
  return (
    <>
      <div className={`v v--${kind}`} aria-hidden="true" />
      {failed && <div className="stamp">質檢不合格</div>}
    </>
  );
}

export default function App() {
  const progress = useProgress();
  const [open, setOpen] = useState<Plate | null>(null);
  const [itemSel, setItemSel] = useState<'self' | 'logo'>('self');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItemSel('self');
  }, [open?.id]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.rv');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const works = [...PLATES].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const openIdx = open ? works.findIndex((w) => w.id === open.id) : -1;

  const step = (d: number) => {
    if (openIdx < 0) return;
    setOpen(works[(openIdx + d + works.length) % works.length]);
  };

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (open && e.key === 'ArrowRight') step(1);
      else if (open && e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openIdx]);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const duelA = works[0];
  const duelB = works[1];
  const pct = Math.round(progress * 100);

  return (
    <div ref={rootRef}>
      <a className="skip-link" href="#works">跳到作品列表</a>

      <header className="topbar">
        <div className="wrap topbar__in">
          <span className="brand">
            <img className="brand__mark" src="/logo.svg" alt="" width="30" height="30" aria-hidden="true" />
            <span className="brand__name">TYPELIN ARENA<span className="rdot">.</span></span>
          </span>
          <nav className="nav" aria-label="主導航">
            <button type="button" onClick={() => go('works')}>作品</button>
            <button type="button" onClick={() => go('index')}>尺規</button>
            <button type="button" onClick={() => go('dossier')}>相關文章</button>
          </nav>
          <span className="topbar__right mono pct">{pct}%</span>
        </div>
        <div className="progress" style={{ width: `${pct}%` }} />
      </header>

      <main>
        {/* 首屏：講清楚這是什麼 + 本期主打對決 */}
        <section className="wrap hero" aria-labelledby="hero-title">
          <div className="hero__grid">
            <div>
              <p className="eyebrow">AI 實測展廳 · SAME PROMPT, DIFFERENT SOULS</p>
              <h1 id="hero-title">
                同一道題，<em>看看誰在裸泳。</em>
              </h1>
              <p className="hero__sub">
                同一個 prompt，丟給四個模型：有人交方程，有人交紙張，有人交整片黑夜。
                這裡只收能動手的東西——評分標準只有一個：能不能被手改變。
              </p>
              <div className="hero__stats">
                <div><b>6<i>.</i></b><span>參賽作品</span></div>
                <div><b>6<i>.</i></b><span>可點開</span></div>
                <div><b>6<i>.</i></b><span>已評分</span></div>
              </div>
              <div className="hero__cta">
                <button type="button" className="btn" onClick={() => go('works')}>↓ 看作品排名</button>
                <button type="button" className="btn btn--ghost" onClick={() => go('index')}>評分尺規</button>
              </div>
            </div>
            <div className="duel rv" aria-label="本期主打對決">
              <div className="duel__head">
                <span className="mono">本期對決 · 第一 vs 第二</span>
                <span className="mono">{duelA.score} — {duelB.score}</span>
              </div>
              <div className="duel__grid">
                {[duelA, duelB].map((d) => (
                  <div className="duel__cell" key={d.id}>
                    <div className="duel__thumb">
                      <Visual kind={d.visual} />
                      <img src={d.thumb} alt={`${d.title}實機畫面`} loading="lazy" />
                    </div>
                    <p className="duel__name">{d.title}</p>
                    <p className="duel__meta">{d.model}</p>
                    <div className="duel__row">
                      <span className="duel__score">{d.score ?? '—'}</span>
                      <button type="button" className="btn btn--small" onClick={() => setOpen(d)}>點開 →</button>
                    </div>
                  </div>
                ))}
                <div className="duel__vs" aria-hidden="true">VS</div>
              </div>
              <div className="duel__foot">
                <span className="mono">同題：關於你自己的前端作品</span>
              </div>
            </div>
          </div>
        </section>

        {/* 作品排名 */}
        <section className="wrap section" id="works" aria-labelledby="works-title">
          <div className="section__head rv">
            <div>
              <div className="secnum" aria-hidden="true">01</div>
              <p className="eyebrow">RANK · 作品排名（按評分排序）</p>
              <h2 id="works-title">六件作品，<em>首批分數。</em></h2>
              <p className="section__desc">首批分數已公布，評語待補。按「點開」全幅開啟，站內直接動手。</p>
            </div>
          </div>
          <div className="works">
            {works.map((pl, i) => (
              <article className={`work rv${i === 0 ? ' work--first' : ''}`} key={pl.id} aria-label={`第${i + 1}名 ${pl.title}`}>
                <span className="work__ranknum" aria-hidden="true">{i + 1}</span>
                <div className="thumb">
                  <Visual kind={pl.visual} />
                  <img src={pl.thumb} alt={`${pl.title}實機畫面`} loading="lazy" />
                </div>
                <div>
                  <span className="work__rank">RANK {i + 1} · {pl.no} / PLATE</span>
                  <h3>{pl.title}</h3>
                  <p className="work__model">{pl.model}</p>
                  <p className="work__prompt">{pl.prompt}</p>
                  <p className="work__verdict">{pl.verdict}</p>
                  <div className="work__spec">{pl.spec.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
                </div>
                <div className="work__side">
                  <span className="bignum">{pl.score ?? '—'}<small> / 100</small></span>
                  {pl.score != null && (
                    <div className={`bar${pl.score < 70 ? ' bar--low' : ''}`} aria-hidden="true">
                      <i style={{ width: `${pl.score}%` }} />
                    </div>
                  )}
                  {pl.logoSrc && <span className="mono">LOGO落地 · {pl.score2 ?? '—'}</span>}
                  <button type="button" className="btn btn--small" onClick={() => setOpen(pl)}>點開 →</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 天梯 */}
        <section className="wrap section" id="index" aria-labelledby="index-title">
          <div className="rv">
            <div className="secnum" aria-hidden="true">02</div>
            <p className="eyebrow">CRITERIA · 評分尺規</p>
            <h2 id="index-title">五維尺規，<em>首批已出。</em></h2>
            <p className="section__desc">尺在這裡，首批分數已經打在作品上。評論待補。</p>
          </div>
          <div className="criteria">
            {CRITERIA.map((c, ci) => (
              <div className="criterion rv" key={c.name}>
                <span className="work__ranknum" aria-hidden="true">0{ci + 1}</span>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 相關文章 */}
        <section className="wrap section" id="dossier" aria-labelledby="dossier-title">
          <div className="rv">
            <div className="secnum" aria-hidden="true">03</div>
            <p className="eyebrow">ARTICLES · 相關文章</p>
            <h2 id="dossier-title">先讀這兩篇，<em>再看展。</em></h2>
          </div>
          <div className="articles">
            {DOSSIER.map((a) => (
              <a className="article rv" key={a.no} href={a.url} target="_blank" rel="noreferrer">
                <span className="mono">{a.no} · TYPELIN 部落格</span>
                <h3>{a.title}</h3>
                <p className="body">{a.body}</p>
                <div className="insight"><b>核心洞察</b><span>{a.insight}</span></div>
                <span className="readmore">閱讀原文 ↗</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* 點開彈窗 */}
      <div className={`overlay${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label={open ? `點開 ${open.title}` : '點開'}>
        {open && (
          <>
            <div className="overlay__bg" onClick={() => setOpen(null)} />
            <div className="overlay__box">
              <div className="overlay__top">
                <span className="mono">{open.no} · {open.model} · {open.title} · {open.score ?? '—'}/100</span>
                <span className="overlay__nav">
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => step(-1)} aria-label="上一件">‹</button>
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => step(1)} aria-label="下一件">›</button>
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => setOpen(null)}>✕ 關閉</button>
                </span>
              </div>
              <div className="overlay__tabs" role="tablist" aria-label="切換作品">
                {works.map((w, i) => (
                  <button
                    key={w.id}
                    type="button"
                    role="tab"
                    aria-selected={w.id === open.id}
                    title={`${w.title} · ${w.score ?? '—'}分`}
                    className={`otab${w.id === open.id ? ' active' : ''}`}
                    onClick={() => setOpen(w)}
                  >
                    R{i + 1} {w.short} · {w.score ?? '—'}
                  </button>
                ))}
              </div>
              <div className="overlay__stage">
                <div className="overlay__art">
                  <iframe
                    className="frame"
                    key={`${open.id}-${itemSel}`}
                    src={itemSel === 'logo' && open.logoSrc ? open.logoSrc : open.src}
                    title={itemSel === 'logo' && open.logoSrc ? `${open.title} · LOGO落地` : open.title}
                    allow="autoplay; fullscreen"
                  />
                </div>
                <aside className="overlay__side">
                  <h3 className="spread__name">{open.title}</h3>
                  <p className="spread__prompt">{open.prompt}</p>
                  {open.logoSrc && (
                    <div className="seg" role="tablist" aria-label="切換子項">
                      <button
                        type="button" role="tab" aria-selected={itemSel === 'self'}
                        className={`segbtn${itemSel === 'self' ? ' active' : ''}`}
                        onClick={() => setItemSel('self')}
                      >
                        自我介紹 · {open.score ?? '—'}
                      </button>
                      <button
                        type="button" role="tab" aria-selected={itemSel === 'logo'}
                        className={`segbtn${itemSel === 'logo' ? ' active' : ''}`}
                        onClick={() => setItemSel('logo')}
                      >
                        LOGO落地 · {open.score2 ?? '—'}
                      </button>
                    </div>
                  )}
                  <ul className="spec">{open.spec.map((s) => <li key={s}>{s}</li>)}</ul>
                  <p className="verdict">{open.verdict}</p>
                  <a
                    className="btn"
                    href={itemSel === 'logo' && open.logoSrc ? open.logoSrc : open.src}
                    target="_blank" rel="noreferrer"
                  >
                    另開分頁 ↗
                  </a>
                  <p className="mono" style={{ marginTop: 12 }}>
                    站內分頁：{itemSel === 'logo' && open.logoSrc ? open.logoSrc : open.src}
                  </p>
                </aside>
              </div>
              <div className="overlay__foot">
                <span className="mono">ESC 關閉</span>
                <span className="mono">TYPELIN ARENA</span>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="colophon">
        <div className="wrap colophon__grid">
          <div><h4>關於</h4><p>TYPELIN ARENA · 同題實測展廳。六件參賽，六件已評分，評語待補。</p></div>
          <div><h4>規格</h4><p>React + Vite + 零依賴。淺色紙面，全系統字體，無外部請求。</p></div>
          <div><h4>標準</h4><p>能不能動手。不能被手改變的，不裝幀。</p></div>
        </div>
        <p className="wordmark" aria-hidden="true">TYPELIN <b>ARENA</b></p>
      </footer>
    </div>
  );
}
