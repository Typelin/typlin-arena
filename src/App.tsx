import { useCallback, useEffect, useRef, useState } from 'react';
import { PLATES, CRITERIA, DOSSIER, LOGO_PROMPT, type Plate } from './data';

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

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const pad2 = (n: number) => String(n).padStart(2, '0');
/** 模型名稱主體與附註（例如「MUSE SPARK 1.3 · CONTRIBUTOR FREE」）。 */
const modelMain = (m: string) => m.split(' · ')[0];
const modelNote = (m: string) => m.split(' · ').slice(1).join(' · ');
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/** 分數進入視窗時從零數上來；減少動態時直接顯示。 */
function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(() => (reduced() ? to : 0));
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) {
      setV(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const x = Math.min(1, (now - t0) / 1100);
        setV(Math.round(to * (1 - Math.pow(1 - x, 3))));
        if (x < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref} className="count">{v}</span>;
}

function Stamp({ kind }: { kind: Plate['visual'] }) {
  return kind === 'fail' ? <div className="stamp">質檢不合格</div> : null;
}

/** 裱框作品圖：白色卡紙 + 細框，點擊直達作品。 */
function Mat({ pl, eager, size = 'l' }: { pl: Plate; eager?: boolean; size?: 'l' | 's' }) {
  return (
    <a className={`mat mat--${size}`} href={pl.src} target="_blank" rel="noreferrer" aria-label={`直接開啟 ${pl.model} 的作品《${pl.title}》`}>
      <span className="mat__frame">
        <img src={pl.thumb} alt={`${pl.model} 作品《${pl.title}》實機畫面`} loading={eager ? 'eager' : 'lazy'} width={960} height={600} />
        <Stamp kind={pl.visual} />
      </span>
      {size === 'l' && <span className="mat__hint">開啟作品 ↗</span>}
    </a>
  );
}

function Verdict({ text, clamp = true }: { text: string; clamp?: boolean }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 90;
  return (
    <div className={`verdictbox${open || !clamp || !long ? ' is-open' : ''}`}>
      <p className="verdictbox__text">{text}</p>
      {clamp && long && (
        <button type="button" className="textbtn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? '收起評語' : '完整評語'}
        </button>
      )}
    </div>
  );
}

function Attempts({ pl }: { pl: Plate }) {
  if (!pl.attempts || pl.attempts.length < 2) return null;
  return (
    <div className="attempts" aria-label={`${pl.model} 歷次重考`}>
      <span className="label">ATTEMPTS</span>
      {pl.attempts.map((a) => (
        <a key={a.id} href={a.src} target="_blank" rel="noreferrer">
          {a.label.replace('ATTEMPT ', 'A')} · {a.title} · {a.score ?? '待評'} ↗
        </a>
      ))}
    </div>
  );
}

function Scores({ pl }: { pl: Plate }) {
  return (
    <dl className="scores">
      <div>
        <dt>自我介紹</dt>
        <dd>
          {pl.score != null ? <Count to={pl.score} /> : <span className="count count--na">—</span>}
          <span className="gauge" aria-hidden="true"><i style={{ width: `${pl.score ?? 0}%` }} /></span>
        </dd>
      </div>
      {pl.logoSrc && (
        <div>
          <dt>LOGO 落地</dt>
          <dd>
            {pl.score2 != null ? <Count to={pl.score2} /> : <span className="count count--na">—</span>}
            <span className="gauge" aria-hidden="true"><i style={{ width: `${pl.score2 ?? 0}%` }} /></span>
          </dd>
        </div>
      )}
    </dl>
  );
}

function Actions({ pl, onPreview }: { pl: Plate; onPreview: (pl: Plate) => void }) {
  return (
    <div className="actions">
      <a className="btn" href={pl.src} target="_blank" rel="noreferrer">自我介紹 ↗</a>
      {pl.logoSrc && <a className="btn btn--line" href={pl.logoSrc} target="_blank" rel="noreferrer">LOGO 落地 ↗</a>}
      <button type="button" className="textbtn textbtn--preview" onClick={() => onPreview(pl)}>站內預覽</button>
    </div>
  );
}

/** 前三名：圖錄跨頁，一件一頁。 */
function Feature({ pl, rank, onPreview }: { pl: Plate; rank: number; onPreview: (pl: Plate) => void }) {
  return (
    <article className={`feature rv${rank % 2 === 0 ? ' feature--flip' : ''}`} aria-label={`第${rank}名 ${pl.model}：${pl.title}`}>
      <div className="feature__art">
        <Mat pl={pl} />
        {pl.logoSrc && pl.logoThumb && (
          <a className="pip" href={pl.logoSrc} target="_blank" rel="noreferrer" aria-label={`直接開啟 ${pl.model} 的 LOGO 落地站`}>
            <img src={pl.logoThumb} alt="" loading="lazy" width={960} height={600} />
            <span>LOGO 落地</span>
          </a>
        )}
      </div>
      <div className="feature__copy">
        <p className="lot">
          <span className="lot__no">No.{rank}</span>
          <span className="label">PLATE {pl.no} · {pl.prompt.replace('同一道題：', '')}</span>
        </p>
        <p className="label feature__kind">MODEL · 參賽模型</p>
        <h3 className="feature__model">
          {modelMain(pl.model)}
          {modelNote(pl.model) && <small>{modelNote(pl.model)}</small>}
        </h3>
        <p className="feature__work">
          <span className="label">作品</span>
          <a href={pl.src} target="_blank" rel="noreferrer">《{pl.title}》</a>
        </p>
        <Scores pl={pl} />
        <Verdict text={pl.verdict} />
        <ul className="specs" aria-label="技術">{pl.spec.map((s) => <li key={s}>{s}</li>)}</ul>
        <Attempts pl={pl} />
        <Actions pl={pl} onPreview={onPreview} />
      </div>
    </article>
  );
}

/** 第四名之後：目錄式索引，一列一件，點開看評語。 */
function Row({ pl, rank, onPreview, onHover }: {
  pl: Plate;
  rank: number | null;
  onPreview: (pl: Plate) => void;
  onHover: (pl: Plate | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = `row-${pl.id}`;
  return (
    <li className={`row${open ? ' is-open' : ''}${rank == null ? ' row--pending' : ''}`} onPointerEnter={() => onHover(pl)} onPointerLeave={() => onHover(null)}>
      <div className="row__main">
        <span className="row__rank" aria-hidden="true">{rank != null ? pad2(rank) : '—'}</span>
        <Mat pl={pl} size="s" />
        <div className="row__id">
          <h3><a href={pl.src} target="_blank" rel="noreferrer">{modelMain(pl.model)}</a></h3>
          <p>作品《{pl.title}》{modelNote(pl.model) ? ` · ${modelNote(pl.model)}` : ''}</p>
        </div>
        <span className="row__score" aria-label={`自我介紹 ${pl.score ?? '待評'}`}>
          <small>自我介紹</small>{pl.score ?? '—'}
        </span>
        <span className="row__score row__score--logo" aria-label={`LOGO 落地 ${pl.logoSrc ? pl.score2 ?? '待評' : '無'}`}>
          <small>LOGO</small>{pl.logoSrc ? pl.score2 ?? '—' : '—'}
        </span>
        <button type="button" className="row__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">{open ? '收起' : '展開'} {pl.model} 評語</span>
          <i aria-hidden="true" />
        </button>
      </div>
      <div className="row__more" id={id} hidden={!open}>
        <div>
          <Verdict text={pl.verdict} clamp={false} />
          <ul className="specs" aria-label="技術">{pl.spec.map((s) => <li key={s}>{s}</li>)}</ul>
          <Attempts pl={pl} />
        </div>
        <Actions pl={pl} onPreview={onPreview} />
      </div>
    </li>
  );
}

/** 滑過索引列時，作品大圖跟著游標浮出（僅桌面精準指標）。 */
function HoverPeek({ pl }: { pl: Plate | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fine] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches);
  useEffect(() => {
    if (!fine) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (ref.current) ref.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const on = (e: PointerEvent) => {
      tx = e.clientX + 28;
      ty = e.clientY - 120;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', on, { passive: true });
    return () => {
      removeEventListener('pointermove', on);
      cancelAnimationFrame(raf);
    };
  }, [fine]);
  if (!fine) return null;
  return (
    <div className={`peek${pl ? ' is-on' : ''}`} ref={ref} aria-hidden="true">
      {pl && <img src={pl.thumb} alt="" />}
    </div>
  );
}

export default function App() {
  const progress = useProgress();
  const [open, setOpen] = useState<Plate | null>(null);
  const [itemSel, setItemSel] = useState<'self' | 'logo'>('self');
  const [hover, setHover] = useState<Plate | null>(null);
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
  const ranked = works.filter((w) => w.score != null);
  const pending = works.filter((w) => w.score == null);
  const rankOf = (w: Plate) => (w.score != null ? ranked.indexOf(w) + 1 : null);
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
    document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const logoWorks = works.filter((w) => w.logoSrc).length;
  const top = ranked[0]?.score ?? 0;
  const pct = Math.round(progress * 100);
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div ref={rootRef}>
      <a className="skip-link" href="#works">跳到作品列表</a>

      <header className="topbar">
        <div className="wrap topbar__in">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); }}>
            <img className="brand__mark" src="/logo.svg" alt="" width="26" height="26" aria-hidden="true" />
            <span className="brand__name">TYPELIN ARENA</span>
          </a>
          <nav className="nav" aria-label="主導航">
            <button type="button" onClick={() => go('works')}>排名</button>
            <button type="button" onClick={() => go('index')}>尺規</button>
            <button type="button" onClick={() => go('dossier')}>文章</button>
          </nav>
          <span className="topbar__meta label">VOL.01 · {pad2(works.length)} WORKS</span>
        </div>
        <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" data-pct={pct} />
      </header>

      <main id="top">
        {/* 首屏：先說清楚這是什麼，再給出目前排名 */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="hero__badge"><b>AI 模型前端能力評測</b><span className="label">VOL.01 · {pad2(works.length)} MODELS</span></p>
              <h1 id="hero-title">
                <span className="hero__line">同一道前端題，</span>
                <span className="hero__line">哪個 <em>AI</em> 做得</span>
                <span className="hero__line hero__line--accent">最好？</span>
              </h1>
              <p className="hero__sub">
                TYPELIN ARENA 把同樣的前端題目交給 {works.length} 個 AI 模型，各自獨立完成。
                作品原樣上架、每一件都能直接打開操作，再由人用{cnNum(CRITERIA.length)}維尺規親手評分排名。
              </p>
              <div className="hero__cta">
                <button type="button" className="btn btn--lg" onClick={() => go('works')}>看完整排名 ↓</button>
                <button type="button" className="textbtn textbtn--lg" onClick={() => go('how')}>怎麼評的</button>
              </div>
            </div>

            {ranked.length > 0 && (
              <aside className="board rv" aria-labelledby="board-title">
                <header className="board__head">
                  <h2 id="board-title" className="label">LEADERBOARD · 目前排名</h2>
                  <span className="label">自我介紹題 / 100</span>
                </header>
                <a className="board__champ" href={ranked[0].src} target="_blank" rel="noreferrer" aria-label={`第 1 名 ${ranked[0].model}，作品《${ranked[0].title}》，${ranked[0].score} 分`}>
                  <span className="board__thumb"><img src={ranked[0].thumb} alt="" width={960} height={600} /></span>
                  <span className="board__champ-id">
                    <span className="board__rank">No.1</span>
                    <b>{modelMain(ranked[0].model)}</b>
                    <i>作品《{ranked[0].title}》</i>
                  </span>
                  <span className="board__score board__score--big">{ranked[0].score}</span>
                </a>
                <ol className="board__list">
                  {ranked.slice(1, 6).map((w, i) => (
                    <li key={w.id}>
                      <a href={w.src} target="_blank" rel="noreferrer">
                        <span className="board__rank">{pad2(i + 2)}</span>
                        <span className="board__id"><b>{modelMain(w.model)}</b><i>《{w.title}》</i></span>
                        <span className="board__bar" aria-hidden="true"><i style={{ width: `${w.score}%` }} /></span>
                        <span className="board__score">{w.score}</span>
                      </a>
                    </li>
                  ))}
                </ol>
                <button type="button" className="board__more" onClick={() => go('works')}>
                  看全部 {works.length} 個模型 <span aria-hidden="true">→</span>
                </button>
              </aside>
            )}
          </div>

          {/* 怎麼評：三步說完整個評測流程 */}
          <div className="wrap" id="how">
            <ol className="how">
              <li className="rv">
                <span className="how__no">01</span>
                <h3>同一道題</h3>
                <p>每個模型拿到完全相同的題目：<b>用前端作品介紹自己</b>，以及<b>用同一張 LOGO 做品牌落地站</b>。</p>
              </li>
              <li className="rv">
                <span className="how__no">02</span>
                <h3>獨立交卷，原樣上架</h3>
                <p>模型自己決定技術、版面與互動。成品不經人工修改，每一件都能直接打開實際操作。</p>
              </li>
              <li className="rv">
                <span className="how__no">03</span>
                <h3>人工評分</h3>
                <p>用{cnNum(CRITERIA.length)}維尺規逐件打分：{CRITERIA.map((c) => c.name).join('、')}，滿分 100。最看重的是第一眼的視覺表現力。</p>
              </li>
            </ol>
          </div>

          <div className="wrap">
            <dl className="stats">
              <div><dt>參賽模型</dt><dd>{pad2(works.length)}</dd></div>
              <div><dt>已評分</dt><dd>{pad2(ranked.length)}</dd></div>
              <div><dt>LOGO 落地站</dt><dd>{pad2(logoWorks)}</dd></div>
              <div><dt>本期最高分</dt><dd>{top}</dd></div>
            </dl>
          </div>

          <div className="ticker" aria-hidden="true">
            <div className="ticker__track">
              {[0, 1].map((k) => (
                <span className="ticker__set" key={k}>
                  {ranked.map((w, i) => (
                    <span key={w.id}><b>{pad2(i + 1)}</b>{modelMain(w.model)}<em>{w.score}</em></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 作品排名 */}
        <section className="section" id="works" aria-labelledby="works-title">
          <div className="wrap">
            <header className="section__head rv">
              <p className="label section__no">01 — RANKING</p>
              <h2 id="works-title">{cnNum(ranked.length)}個模型，<em>完整排名。</em></h2>
              <p className="section__desc">作品名稱與題型按鈕直達獨立分頁；「站內預覽」在 Arena 內展開互動視窗，可左右切換。</p>
            </header>

            <div className="podium">
              {podium.map((pl) => <Feature key={pl.id} pl={pl} rank={rankOf(pl)!} onPreview={setOpen} />)}
            </div>

            {rest.length > 0 && (
              <>
                <div className="index__head rv">
                  <p className="label">THE INDEX · 第 4 名起</p>
                  <p className="label index__cols" aria-hidden="true"><span>自我介紹</span><span>LOGO</span></p>
                </div>
                <ol className="index">
                  {rest.map((pl) => <Row key={pl.id} pl={pl} rank={rankOf(pl)} onPreview={setOpen} onHover={setHover} />)}
                </ol>
              </>
            )}

            {pending.length > 0 && (
              <>
                <div className="index__head rv">
                  <p className="label">PENDING · 已收件，待評分</p>
                  <p className="section__desc">作品已經可以操作，分數還沒打，所以不排名次。</p>
                </div>
                <ol className="index">
                  {pending.map((pl) => <Row key={pl.id} pl={pl} rank={null} onPreview={setOpen} onHover={setHover} />)}
                </ol>
              </>
            )}
          </div>
          <HoverPeek pl={hover} />
        </section>

        {/* 尺規 */}
        <section className="section section--tint" id="index" aria-labelledby="index-title">
          <div className="wrap">
            <header className="section__head rv">
              <p className="label section__no">02 — CRITERIA</p>
              <h2 id="index-title">{cnNum(CRITERIA.length)}維尺規，<em>逐件衡量。</em></h2>
              <p className="section__desc">{cnNum(CRITERIA.length)}個維度共用同一把尺，分數直接回到作品本身。第一把尺是視覺表現力，因為作品先要被看見，才有人想點開。</p>
            </header>
            <ol className="criteria">
              {CRITERIA.map((c, ci) => (
                <li className="criterion rv" key={c.name} style={{ '--i': ci } as React.CSSProperties}>
                  <span className="criterion__no" aria-hidden="true">{ROMAN[ci]}</span>
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 相關文章 */}
        <section className="section" id="dossier" aria-labelledby="dossier-title">
          <div className="wrap">
            <header className="section__head rv">
              <p className="label section__no">03 — ESSAYS</p>
              <h2 id="dossier-title">先讀這兩篇，<em>再看展。</em></h2>
            </header>
            <div className="essays">
              {DOSSIER.map((a) => (
                <a className="essay rv" key={a.no} href={a.url} target="_blank" rel="noreferrer">
                  <span className="label">{a.no} · TYPELIN 部落格</span>
                  <h3>{a.title}</h3>
                  <p className="essay__body">{a.body}</p>
                  <blockquote className="essay__quote">
                    <span className="label">核心洞察</span>
                    <p>{a.insight}</p>
                  </blockquote>
                  <span className="essay__more">閱讀原文 ↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 站內預覽 */}
      <div className={`overlay${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label={open ? `作品預覽：${open.title}` : '作品預覽'}>
        {open && (
          <>
            <div className="overlay__bg" onClick={() => setOpen(null)} />
            <div className="overlay__box">
              <div className="overlay__top">
                <span className="label">站內預覽 · No.{rankOf(open) ?? '—'} · {open.model}</span>
                <span className="overlay__nav">
                  <button type="button" className="iconbtn" onClick={() => step(-1)} aria-label="上一件">‹</button>
                  <button type="button" className="iconbtn" onClick={() => step(1)} aria-label="下一件">›</button>
                  <button type="button" className="iconbtn iconbtn--wide" onClick={() => setOpen(null)}>關閉 ✕</button>
                </span>
              </div>
              <div className="overlay__tabs" role="tablist" aria-label="切換作品">
                {works.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    role="tab"
                    aria-selected={w.id === open.id}
                    title={`${w.title} · ${w.score ?? '—'}分`}
                    className={`otab${w.id === open.id ? ' active' : ''}`}
                    onClick={() => setOpen(w)}
                  >
                    {rankOf(w) != null ? pad2(rankOf(w)!) : '待評'} {w.short}
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
                  <p className="label">{rankOf(open) != null ? `No.${rankOf(open)}` : '待評'} · 參賽模型</p>
                  <h3 className="spread__name">{open.model}</h3>
                  <p className="spread__work">作品《{open.title}》</p>
                  <p className="spread__prompt">{itemSel === 'logo' && open.logoSrc ? LOGO_PROMPT : open.prompt}</p>
                  {open.logoSrc && (
                    <div className="seg" role="tablist" aria-label="切換子項">
                      <button type="button" role="tab" aria-selected={itemSel === 'self'} className={`segbtn${itemSel === 'self' ? ' active' : ''}`} onClick={() => setItemSel('self')}>
                        自我介紹 · {open.score ?? '—'}
                      </button>
                      <button type="button" role="tab" aria-selected={itemSel === 'logo'} className={`segbtn${itemSel === 'logo' ? ' active' : ''}`} onClick={() => setItemSel('logo')}>
                        LOGO 落地 · {open.score2 ?? '—'}
                      </button>
                    </div>
                  )}
                  <ul className="specs">{open.spec.map((s) => <li key={s}>{s}</li>)}</ul>
                  <p className="verdict">{open.verdict}</p>
                  <a className="btn" href={itemSel === 'logo' && open.logoSrc ? open.logoSrc : open.src} target="_blank" rel="noreferrer">
                    直達目前作品分頁 ↗
                  </a>
                  <p className="label overlay__path">{itemSel === 'logo' && open.logoSrc ? open.logoSrc : open.src}</p>
                </aside>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="colophon">
        <div className="wrap colophon__grid">
          <div><h4 className="label">關於</h4><p>TYPELIN ARENA 用「自我介紹」與「LOGO 落地」兩道前端實作題，直接比較 AI 的設計、工程與互動完成度。</p></div>
          <div><h4 className="label">觀看方式</h4><p>作品名稱與題型按鈕皆直達獨立分頁；「站內預覽」則在 Arena 內展開 iframe 實際操作。</p></div>
          <div><h4 className="label">標準</h4><p>分數只是索引。真正的比較方式，是把每一件作品打開、操作、看它能不能站得住。</p></div>
        </div>
        <p className="wordmark" aria-hidden="true">TYPELIN <b>ARENA</b></p>
        <div className="wrap"><p className="colophon__end label">© {new Date().getFullYear()} TYPELIN · 同題，各表。</p></div>
      </footer>
    </div>
  );
}
