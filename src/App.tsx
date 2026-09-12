import { useCallback, useEffect, useRef, useState } from 'react';
import { PLATES, CRITERIA, DOSSIER, type Plate } from './data';

/**
 * 標題用中文數字，但件數會變——寫死會在增減作品時說謊。
 * 只支援兩位數，這個榜單不會更多了。
 */
const CN_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function cnNum(n: number): string {
  if (n < 10) return CN_DIGITS[n];
  if (n === 10) return '十';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (tens === 1) return `十${ones ? CN_DIGITS[ones] : ''}`;
  return `${CN_DIGITS[tens]}十${ones ? CN_DIGITS[ones] : ''}`;
}

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

function WorkVerdict({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`work__verdictbox${expanded ? ' is-expanded' : ''}`}>
      <p className="work__verdict">{text}</p>
      <button
        type="button"
        className="work__verdict-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? '收起評語 ↑' : '展開完整評語 ↓'}
      </button>
    </div>
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
  const logoWorks = works.filter((w) => w.logoSrc).length;
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
            <button type="button" onClick={() => go('works')}>雙測作品</button>
            <button type="button" onClick={() => go('index')}>尺規</button>
            <button type="button" onClick={() => go('dossier')}>相關文章</button>
          </nav>
          <span className="topbar__right mono pct">{pct >= 2 ? `${pct}%` : 'VOL.01'}</span>
        </div>
        <div className="progress" style={{ width: `${pct >= 2 ? pct : 0}%` }} />
      </header>

      <main>
        {/* 首屏：講清楚這是什麼 + 本期主打對決 */}
        <section className="wrap hero" aria-labelledby="hero-title">
          <div className="hero__grid">
            <div>
              <p className="eyebrow">AI FRONTEND BENCHMARK · SELF INTRO × LOGO LANDING</p>
              <h1 id="hero-title">
                <span className="hero__line">兩道前端題，</span>
                <span className="hero__line">直接看模型</span>
                <em>怎麼做。</em>
              </h1>
              <p className="hero__sub">
                我們用兩種同題實作測 AI：第一題讓模型用前端作品介紹自己；第二題給所有模型同一張 LOGO，做完整品牌落地站。
                每件作品都能直接進獨立分頁實際操作，也可以留在 Arena 展開站內預覽。
              </p>
              <div className="hero__stats">
                <div><b>{works.length}<i>.</i></b><span>參賽模型</span></div>
                <div><b>2<i>.</i></b><span>實作題型</span></div>
                <div><b>{logoWorks}<i>.</i></b><span>LOGO 落地</span></div>
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
                    <a className="duel__thumb duel__thumb--link" href={d.src} target="_blank" rel="noreferrer" aria-label={`直接開啟 ${d.title} 完整作品`}>
                      <Visual kind={d.visual} />
                      <img src={d.thumb} alt={`${d.title}實機畫面`} loading="lazy" />
                      <span className="thumb__direct">完整作品 ↗</span>
                    </a>
                    <div className="duel__id">
                      <p className="duel__name"><a className="duel__titlelink" href={d.src} target="_blank" rel="noreferrer">{d.title} ↗</a></p>
                      <span className="duel__score">{d.score ?? '—'}</span>
                      <p className="duel__meta">{d.model}</p>
                    </div>
                    <div className="duel__row">
                      <a className="btn btn--small" href={d.src} target="_blank" rel="noreferrer">完整作品 ↗</a>
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => setOpen(d)}>▣ 站內預覽</button>
                    </div>
                  </div>
                ))}
                <div className="duel__vs" aria-hidden="true">VS</div>
              </div>
              <div className="duel__foot">
                <span className="mono">雙題實測：自我介紹 × LOGO 落地 · 「完整作品」直達獨立分頁</span>
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
              <h2 id="works-title">
                {cnNum(works.length)}件作品，<em>完整排名。</em>
              </h2>
              <p className="section__desc">點作品名稱或「自我介紹／LOGO 落地」可直接進獨立分頁實際操作；「站內預覽」才會留在 Arena 內展開互動視窗。</p>
            </div>
          </div>
          <div className="works">
            {works.map((pl, i) => (
              <article className={`work rv${i === 0 ? ' work--first' : ''}`} key={pl.id} aria-label={`第${i + 1}名 ${pl.title}`}>
                <span className="work__ranknum" aria-hidden="true">{i + 1}</span>
                <a className="thumb thumb--link" href={pl.src} target="_blank" rel="noreferrer" aria-label={`直接開啟 ${pl.title} 完整作品`}>
                  <Visual kind={pl.visual} />
                  <img src={pl.thumb} alt={`${pl.title}實機畫面`} loading="lazy" />
                  <span className="thumb__direct">完整作品 ↗</span>
                </a>
                <div className="work__copy">
                  <span className="work__rank">RANK {i + 1} · {pl.no} / PLATE</span>
                  <h3><a className="work__titlelink" href={pl.src} target="_blank" rel="noreferrer">{pl.title} ↗</a></h3>
                  <p className="work__model"><a className="work__modellink" href={pl.src} target="_blank" rel="noreferrer">{pl.model} · 直達作品頁 ↗</a></p>
                  <p className="work__prompt">{pl.prompt}</p>
                  <WorkVerdict text={pl.verdict} />
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
                  <div className="work__actions">
                    <a className="btn btn--small" href={pl.src} target="_blank" rel="noreferrer">自我介紹 ↗</a>
                    {pl.logoSrc && <a className="btn btn--ghost btn--small" href={pl.logoSrc} target="_blank" rel="noreferrer">LOGO 落地 ↗</a>}
                    <button type="button" className="btn btn--preview btn--small" onClick={() => setOpen(pl)}>▣ 站內預覽</button>
                  </div>
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
            <h2 id="index-title">五維尺規，<em>逐件衡量。</em></h2>
            <p className="section__desc">五個維度共用同一把尺，分數直接回到作品本身。</p>
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
      <div className={`overlay${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label={open ? `作品預覽：${open.title}` : '作品預覽'}>
        {open && (
          <>
            <div className="overlay__bg" onClick={() => setOpen(null)} />
            <div className="overlay__box">
              <div className="overlay__top">
                <span className="mono">站內預覽 · {open.no} · {open.model} · {open.title} · {open.score ?? '—'}/100</span>
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
                    直達目前作品分頁 ↗
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
          <div><h4>關於</h4><p>TYPELIN ARENA · 用「自我介紹」與「LOGO 落地」兩道前端實作題，直接比較 AI 的設計、工程與互動完成度。</p></div>
          <div><h4>觀看方式</h4><p>作品名稱與題型按鈕皆直達獨立分頁；「站內預覽」則在 Arena 內展開 iframe 實際操作。</p></div>
          <div><h4>標準</h4><p>分數只是索引。真正的比較方式，是把每一件作品打開、操作、看它能不能站得住。</p></div>
        </div>
        <p className="wordmark" aria-hidden="true">TYPELIN <b>ARENA</b></p>
      </footer>
    </div>
  );
}
