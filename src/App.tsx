import { useCallback, useEffect, useRef, useState } from 'react';
import { PLATES, CRITERIA, DOSSIER, LOGO_PROMPT, type Plate } from './data';
import { REELS } from './reels';

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
const isNew = (p: Plate) => p.era === 'new';
/** 首屏印樣用的小圖（scripts/shots-mini.py 產生），保留原圖的版本參數。 */
const miniOf = (src: string) => src.replace('/shots/', '/shots/mini/').replace(/\.png(?=\?|$)/, '.webp');

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
function Count({ to, className = 'count' }: { to: number; className?: string }) {
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
  return <span ref={ref} className={className}>{v}</span>;
}

/** 數字換值時從舊值滾到新值；減少動態時直接顯示。 */
function Tween({ to, className }: { to: number; className?: string }) {
  const [v, setV] = useState(() => (reduced() ? to : 0));
  const from = useRef(v);
  useEffect(() => {
    if (reduced()) return;
    const a = from.current;
    const dur = Math.abs(to - a) > 20 ? 1100 : 600;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const x = Math.min(1, (now - t0) / dur);
      const val = Math.round(a + (to - a) * (1 - Math.pow(1 - x, 3)));
      from.current = val;
      setV(val);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className={className}>{reduced() ? to : v}</span>;
}

const BOARD_SIZE = 6;
const BOARD_DWELL = 5200;

/**
 * 首屏榜單：預覽框輪播前六名，滑過、聚焦或點刻度就換成那一件。
 * 只在卡片進入視窗、沒有被操作、且未要求減少動態時自動換。
 */
function Board({ zone, isNewZone, total, onMore, onShow }: {
  zone: ZoneData;
  isNewZone: boolean;
  total: number;
  onMore: () => void;
  onShow: (pl: Plate) => void;
}) {
  const top = zone.ranked.slice(0, BOARD_SIZE);
  const n = top.length;
  const ref = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(0);
  const [held, setHeld] = useState(false);
  const [live, setLive] = useState(false);
  /** 只載入看過與下一張的大圖，避免首屏一次拉六張全尺寸截圖。 */
  const [seen, setSeen] = useState<number[]>([0]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = live && !held && n > 1;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setSel((s) => (s + 1) % n), BOARD_DWELL);
    return () => clearTimeout(t);
  }, [playing, sel, n]);

  useEffect(() => {
    const next = (sel + 1) % n;
    setSeen((s) => (s.includes(sel) && s.includes(next) ? s : [...new Set([...s, sel, next])]));
    if (top[sel]) onShow(top[sel]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, n]);

  if (!n) return null;
  const cur = top[sel];

  return (
    <aside
      ref={ref}
      className="board rv"
      aria-labelledby="board-title"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
    >
      <header className="board__head">
        <h2 id="board-title" className="label">LEADERBOARD · {isNewZone ? '新題目' : '舊題目'}</h2>
        <span className="label">自我介紹 / 100</span>
      </header>
      <div className="board__rail" role="group" aria-label="切換預覽名次">
        {top.map((w, i) => (
          <button
            key={w.id}
            type="button"
            className={`board__seg${i === sel ? ' is-on' : ''}${i < sel ? ' is-past' : ''}`}
            aria-pressed={i === sel}
            aria-label={`預覽第 ${i + 1} 名 ${w.model}`}
            onClick={() => setSel(i)}
          >
            <span className="board__seg-no" aria-hidden="true">{pad2(i + 1)}</span>
            <span className="board__seg-line" aria-hidden="true">
              {i === sel && <i key={`${sel}-${playing ? 'run' : 'hold'}`} className={playing ? 'is-run' : ''} style={{ animationDuration: `${BOARD_DWELL}ms` }} />}
            </span>
          </button>
        ))}
      </div>
      <a className="board__champ" href={cur.src} target="_blank" rel="noreferrer" aria-label={`第 ${sel + 1} 名 ${cur.model}，作品《${cur.title}》，${cur.score} 分`}>
        <span className="board__thumb">
          {top.map((w, i) => seen.includes(i) && (
            <img key={w.id} className={i === sel ? 'is-on' : ''} src={w.thumb} alt="" width={960} height={600} />
          ))}
          <Reel key={cur.id} pl={cur} />
        </span>
        <span className="board__champ-id" key={cur.id}>
          <span className="board__rank">No.{sel + 1}</span>
          <b>{modelMain(cur.model)}</b>
          <i>作品《{cur.title}》</i>
        </span>
        <Tween to={cur.score ?? 0} className="board__score board__score--big" />
      </a>
      <ol className="board__list">
        {top.slice(1).map((w, i) => (
          <li key={w.id} className={i + 1 === sel ? 'is-sel' : ''} style={{ '--i': i } as React.CSSProperties}>
            <a href={w.src} target="_blank" rel="noreferrer" onPointerEnter={(e) => e.pointerType === 'mouse' && setSel(i + 1)} onFocus={() => setSel(i + 1)}>
              <span className="board__rank">{pad2(i + 2)}</span>
              <span className="board__id"><b>{modelMain(w.model)}</b><i>《{w.title}》</i></span>
              <span className="board__bar" aria-hidden="true"><i style={{ width: `${w.score}%` }} /></span>
              <Count to={w.score ?? 0} className="board__score" />
            </a>
          </li>
        ))}
      </ol>
      <button type="button" className="board__more" onClick={onMore}>
        看全部 {total} 件作品 <span aria-hidden="true">→</span>
      </button>
    </aside>
  );
}

/** 從同一區已評分的作品裡抽兩件分數不同的，避開上一組。 */
function drawPair(pool: Plate[], prev?: [Plate, Plate]): [Plate, Plate] | null {
  if (pool.length < 2) return null;
  for (let tries = 0; tries < 40; tries++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    const b = pool[Math.floor(Math.random() * pool.length)];
    if (a === b || a.score === b.score) continue;
    if (prev && (prev.includes(a) || prev.includes(b)) && tries < 30) continue;
    return [a, b];
  }
  return null;
}

/**
 * 盲猜對決：兩件同題作品並排，藏起模型與分數，讓訪客先猜哪件分數高。
 * 只抽同一區的作品，因為兩種題目的分數不能互比。
 */
function Duel({ pool, isNewZone, onOpen }: { pool: Plate[]; isNewZone: boolean; onOpen: (pl: Plate) => void }) {
  const [pair, setPair] = useState(() => drawPair(pool));
  const [pick, setPick] = useState<0 | 1 | null>(null);
  const [tally, setTally] = useState({ played: 0, right: 0, streak: 0 });
  if (!pair) return null;
  const win: 0 | 1 = (pair[0].score ?? 0) > (pair[1].score ?? 0) ? 0 : 1;
  const done = pick != null;

  const choose = (i: 0 | 1) => {
    if (done) return;
    setPick(i);
    const ok = i === win;
    setTally((t) => ({ played: t.played + 1, right: t.right + (ok ? 1 : 0), streak: ok ? t.streak + 1 : 0 }));
  };
  const next = () => {
    setPair((p) => drawPair(pool, p ?? undefined));
    setPick(null);
  };

  return (
    <section className="duel rv" aria-labelledby="duel-title">
      <header className="duel__head">
        <div>
          <p className="label duel__kicker">DUEL · 盲猜一局</p>
          <h2 id="duel-title" className="duel__title">先別看分數，<em>你覺得哪件比較好？</em></h2>
        </div>
        <p className="duel__tally label" aria-live="polite">
          第 {pad2(tally.played + (done ? 0 : 1))} 局 · 猜中 {tally.right} · 連勝 <b>{tally.streak}</b>
        </p>
      </header>
      <div className={`duel__ring${done ? ' is-done' : ''}`}>
        {pair.map((w, k) => {
          const i = k as 0 | 1;
          const verdict = done && pick === i ? (i === win ? '猜中' : '猜錯') : null;
          return (
            <article key={w.id} className={`duel__side${done && i === win ? ' is-win' : ''}${done && i !== win ? ' is-lose' : ''}`}>
              <button type="button" className="duel__art" onClick={() => choose(i)} disabled={done} aria-label={done ? `${w.model}《${w.title}》` : `猜《${w.title}》分數比較高`}>
                <span className="duel__frame">
                  <img src={w.thumb} alt={`作品《${w.title}》實機畫面`} loading="lazy" width={960} height={600} />
                  <Reel key={w.id} pl={w} />
                  {verdict && <span className={`duel__stamp${verdict === '猜錯' ? ' is-miss' : ''}`}>{verdict}</span>}
                </span>
                {!done && <span className="duel__cta">這件比較高 ↑</span>}
              </button>
              <div className="duel__id">
                <p className="label">{k === 0 ? 'LEFT' : 'RIGHT'} · 作品《{w.title}》</p>
                <h3 className="duel__model">{done ? modelMain(w.model) : <span className="duel__hidden">MODEL ？？？</span>}</h3>
              </div>
              <div className="duel__score" aria-hidden={!done}>
                {done ? <Tween key={`${w.id}-s`} to={w.score ?? 0} /> : <span className="duel__q">?</span>}
              </div>
            </article>
          );
        })}
        <span className="duel__vs" aria-hidden="true">vs.</span>
      </div>
      <footer className="duel__foot">
        <p className="duel__note">
          {done
            ? `差 ${Math.abs((pair[0].score ?? 0) - (pair[1].score ?? 0))} 分。${isNewZone ? '新題目' : '舊題目'}同一把尺規評出來的。`
            : `兩件都來自${isNewZone ? '新題目' : '舊題目'}，同一道題、同一把尺。點作品猜。`}
        </p>
        <div className="duel__actions">
          {done && pair.map((w) => (
            <button key={w.id} type="button" className="textbtn textbtn--preview" onClick={() => onOpen(w)}>{w.short}</button>
          ))}
          <button type="button" className={done ? 'btn' : 'btn btn--line'} onClick={next}>{done ? '再來一組 →' : '換一組'}</button>
        </div>
      </footer>
    </section>
  );
}

/** 紅筆圈註：評審親手批改的筆跡，載入時畫一次。 */
function PenCircle() {
  return (
    <svg className="pen" viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength={1} d="M120 14 C 70 2, 14 22, 10 56 C 6 92, 72 104, 120 98 C 170 92, 196 70, 190 44 C 184 18, 140 6, 92 12 C 70 15, 54 20, 44 27" />
    </svg>
  );
}

/**
 * 首屏接觸印樣：全部作品縮在一張紙上，滑過看是誰，點一下站內預覽。
 * 榜單卡正在預覽的那一件會被圈出來。
 */
function Sheet({ works, rankOf, shownId, onOpen }: {
  works: Plate[];
  rankOf: (pl: Plate) => number | null;
  shownId: string | null;
  onOpen: (pl: Plate) => void;
}) {
  const [cur, setCur] = useState<Plate | null>(null);
  const capRank = cur ? rankOf(cur) : null;
  return (
    <div className="sheet" onPointerLeave={() => setCur(null)}>
      <p className="sheet__head">
        <span className="label">CONTACT SHEET · 全部 {works.length} 件</span>
        <span className="label sheet__hint">點一下站內預覽</span>
      </p>
      <ul className="sheet__grid">
        {works.map((w, i) => {
          const r = rankOf(w);
          return (
            <li key={w.id} style={{ '--i': i } as React.CSSProperties}>
              <button
                type="button"
                className={`sheet__tile${cur?.id === w.id ? ' is-on' : ''}${shownId === w.id ? ' is-shown' : ''}`}
                aria-label={`站內預覽 ${w.model} 作品《${w.title}》，${r != null ? `${isNew(w) ? '新題目' : '舊題目'}第 ${r} 名` : '待評分'}`}
                onPointerEnter={() => setCur(w)}
                onFocus={() => setCur(w)}
                onBlur={() => setCur(null)}
                onClick={() => onOpen(w)}
              >
                <img src={miniOf(w.thumb)} alt="" width={320} height={222} loading="lazy" decoding="async" />
                <span className="sheet__no" aria-hidden="true">{r != null ? `${isNew(w) ? '新 ' : ''}${pad2(r)}` : '待評'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sheet__cap" aria-hidden="true">
        {cur ? (
          <span key={cur.id}>
            <b>{isNew(cur) ? '新題目' : '舊題目'} · {capRank != null ? `No.${capRank}` : '待評'}</b>
            {modelMain(cur.model)}<i>《{cur.title}》</i><em>{cur.score ?? '—'}</em>
          </span>
        ) : (
          <span key="idle" className="sheet__idle">滑過任一格，看是哪個模型交的卷</span>
        )}
      </p>
    </div>
  );
}

/** 與 scripts/reels-sprite.py、index.css 的 .reel 動畫一致：6 欄 × 12 列共 72 格。 */
const REEL_MS = 6000;
const REEL_DELAY = 280;
const reelOf = (pl: Plate) => `/reels/${pl.id}.webp`;

/**
 * 捲動影帶：滑鼠停在作品上，從頭播放整頁往下捲的過程（scripts/reels.mjs 錄製的格狀雪碧圖）。
 * 停留一下才下載，掃過去不會白抓；離開就停。觸控裝置與減少動態時不播。
 * 不給 active 時跟著父層（作品框）的滑鼠進出。
 */
function Reel({ pl, active }: { pl: Plate; active?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hover, setHover] = useState(false);
  const [ready, setReady] = useState(false);
  const on = active ?? hover;

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (active !== undefined || !host) return;
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && setHover(true);
    const leave = () => setHover(false);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    return () => {
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
    };
  }, [active]);

  useEffect(() => {
    if (!on || ready || reduced()) return;
    const img = new Image();
    const t = setTimeout(() => {
      img.onload = () => setReady(true);
      img.src = reelOf(pl);
    }, REEL_DELAY);
    return () => {
      clearTimeout(t);
      img.onload = null;
    };
  }, [on, ready, pl]);

  if (reduced() || !REELS.has(pl.id)) return null;
  const playing = on && ready;
  return (
    <span
      ref={ref}
      className={`reel${on ? ' is-on' : ''}${playing ? ' is-play' : ''}`}
      style={ready ? { backgroundImage: `url(${reelOf(pl)})` } : undefined}
      aria-hidden="true"
    >
      <span className="reel__tag">{playing ? '整頁捲動中' : '載入捲動預覽…'}</span>
      <i className="reel__bar" style={{ animationDuration: `${REEL_MS}ms` }} />
    </span>
  );
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
        {size === 'l' && <Reel key={pl.id} pl={pl} />}
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
    <div className="attempts" aria-label={`${pl.model} 歷次作答`}>
      <span className="label">ATTEMPTS</span>
      {pl.attempts.map((a) => (
        <a key={a.id} href={a.src} target="_blank" rel="noreferrer">
          {a.label.replace('ATTEMPT ', 'A')} · {a.title} · {a.score ?? '待評'} ↗
        </a>
      ))}
    </div>
  );
}

/** 同一模型在另一個題目下的作品（兩張卡互相連結）。 */
function Twin({ pl }: { pl: Plate }) {
  const other = pl.twin ? PLATES.find((p) => p.id === pl.twin) : undefined;
  if (!other) return null;
  return (
    <div className="attempts" aria-label={`${pl.model} 在另一個題目下的作品`}>
      <span className="label">同一模型</span>
      <a href={other.src} target="_blank" rel="noreferrer">
        {isNew(other) ? '新題目' : '舊題目'} · 《{other.title}》 · {other.score ?? '待評'} ↗
      </a>
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

const toneCache = new Map<string, string>();

/** 從小圖取作品的主色，給展廳的燈光用；飽和的像素權重較高，白底配藍字的作品也會打出藍光。 */
function useTone(pl: Plate): string | null {
  const [tone, setTone] = useState(() => toneCache.get(pl.id) ?? null);
  useEffect(() => {
    if (toneCache.has(pl.id)) return;
    let alive = true;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 20;
      const g = c.getContext('2d', { willReadFrequently: true });
      if (!g) return;
      g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let r = 0, gr = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) {
        const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
        const k = 1 + (sat / 32) ** 2;
        r += d[i] * k; gr += d[i + 1] * k; b += d[i + 2] * k; w += k;
      }
      const v = `rgb(${Math.round(r / w)} ${Math.round(gr / w)} ${Math.round(b / w)})`;
      toneCache.set(pl.id, v);
      if (alive) setTone(v);
    };
    img.src = miniOf(pl.thumb);
    return () => { alive = false; };
  }, [pl.id, pl.thumb]);
  return tone;
}

/** 前三名：展廳裡一件一面牆，牆上的光取自作品本身。 */
function Feature({ pl, rank, onPreview }: { pl: Plate; rank: number; onPreview: (pl: Plate) => void }) {
  const tone = useTone(pl);
  return (
    <article
      className={`feature rv${rank % 2 === 0 ? ' feature--flip' : ''}`}
      style={tone ? ({ '--tone': tone } as React.CSSProperties) : undefined}
      aria-label={`第${rank}名 ${pl.model}：${pl.title}`}
    >
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
        <Twin pl={pl} />
        <Actions pl={pl} onPreview={onPreview} />
      </div>
    </article>
  );
}

/** 第四名之後：目錄式索引，一列一件，點開看評語。 */
function Row({ pl, rank, logo, onPreview, onHover }: {
  pl: Plate;
  rank: number | null;
  logo: boolean;
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
        {logo && (
          <span className="row__score row__score--logo" aria-label={`LOGO 落地 ${pl.logoSrc ? pl.score2 ?? '待評' : '無'}`}>
            <small>LOGO</small>{pl.logoSrc ? pl.score2 ?? '—' : '—'}
          </span>
        )}
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
          <Twin pl={pl} />
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
      {pl && <Reel key={pl.id} pl={pl} active />}
    </div>
  );
}

type ZoneData = { ranked: Plate[]; pending: Plate[] };

/** 一種題目一區：自己的前三名跨頁、索引與待評，名次只在區內計算。 */
function Zone({ zone, tag, title, desc, logo, rankOf, onPreview, onHover }: {
  zone: ZoneData;
  tag: string;
  title: string;
  desc: string;
  logo: boolean;
  rankOf: (pl: Plate) => number | null;
  onPreview: (pl: Plate) => void;
  onHover: (pl: Plate | null) => void;
}) {
  const podium = zone.ranked.slice(0, 3);
  const rest = zone.ranked.slice(3);
  return (
    <div className="zone">
      <header className="zone__head rv">
        <p className="label">{tag}</p>
        <h3 className="zone__title">{title}</h3>
        <p className="section__desc">{desc}</p>
      </header>

      {podium.length > 0 && (
        <div className="stage">
          <div className="stage__head rv">
            <p className="label">THE HALL · 前 {podium.length} 名</p>
            <p className="label stage__note">每面牆的光，取自作品本身的顏色</p>
          </div>
          <div className="podium">
            {podium.map((pl) => <Feature key={pl.id} pl={pl} rank={rankOf(pl)!} onPreview={onPreview} />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <>
          <div className="index__head rv">
            <p className="label">THE INDEX · 第 4 名起</p>
            <p className={`label index__cols${logo ? '' : ' index__cols--nologo'}`} aria-hidden="true"><span>自我介紹</span>{logo && <span>LOGO</span>}</p>
          </div>
          <ol className={`index${logo ? '' : ' index--nologo'}`}>
            {rest.map((pl) => <Row key={pl.id} pl={pl} rank={rankOf(pl)} logo={logo} onPreview={onPreview} onHover={onHover} />)}
          </ol>
        </>
      )}

      {zone.pending.length > 0 && (
        <>
          <div className="index__head rv">
            <p className="label">PENDING · 已收件，待評分</p>
            <p className="section__desc">作品已經可以操作，分數還沒打，所以不排名次。</p>
          </div>
          <ol className={`index${logo ? '' : ' index--nologo'}`}>
            {zone.pending.map((pl) => <Row key={pl.id} pl={pl} rank={null} logo={logo} onPreview={onPreview} onHover={onHover} />)}
          </ol>
        </>
      )}
    </div>
  );
}

export default function App() {
  const progress = useProgress();
  const [open, setOpen] = useState<Plate | null>(null);
  const [itemSel, setItemSel] = useState<'self' | 'logo'>('self');
  const [hover, setHover] = useState<Plate | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const showOnBoard = useCallback((pl: Plate) => setShown(pl.id), []);
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

  const sorted = [...PLATES].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const zoneOf = (list: Plate[]): ZoneData => ({ ranked: list.filter((w) => w.score != null), pending: list.filter((w) => w.score == null) });
  const newZone = zoneOf(sorted.filter(isNew));
  const oldZone = zoneOf(sorted.filter((w) => !isNew(w)));
  const works = [...newZone.ranked, ...newZone.pending, ...oldZone.ranked, ...oldZone.pending];
  /** 首屏榜單：新題目有 3 件以上打分前，先顯示舊題目榜並標明。 */
  const boardZone = newZone.ranked.length >= 3 ? newZone : oldZone;
  const ranked = boardZone.ranked;
  const modelCount = PLATES.length - PLATES.filter((p) => p.twin).length / 2;
  const scoredCount = works.filter((w) => w.score != null).length;
  const rankOf = (w: Plate) => (w.score != null ? (isNew(w) ? newZone : oldZone).ranked.indexOf(w) + 1 : null);
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
          <span className="topbar__meta label">VOL.01</span>
        </div>
        <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" data-pct={pct} />
      </header>

      <main id="top">
        {/* 首屏：先說清楚這是什麼，再給出目前排名 */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="hero__badge"><b>AI 模型前端能力評測</b><span className="label">VOL.01 · {pad2(modelCount)} MODELS · {pad2(works.length)} WORKS</span></p>
              <h1 id="hero-title">
                <span className="hero__line">同一道前端題，</span>
                <span className="hero__line">哪個 <em className="hero__ai">AI<PenCircle /></em> 做得</span>
                <span className="hero__line hero__line--accent">最好？</span>
              </h1>
              <p className="hero__sub">
                TYPELIN ARENA 把前端題目交給 {modelCount} 個 AI 模型，各自獨立完成。<span className="nb">作品原樣上架</span>、每一件都能直接打開操作，再由人用{cnNum(CRITERIA.length)}維尺規親手<span className="nb">評分排名</span>。<span className="nb">題目</span>改版就另開一區，不跟舊的混排。
              </p>
              <div className="hero__cta">
                <button type="button" className="btn btn--lg" onClick={() => go('works')}>看完整排名 ↓</button>
                <button type="button" className="textbtn textbtn--lg" onClick={() => go('how')}>怎麼評的</button>
              </div>
              <Sheet works={works} rankOf={rankOf} shownId={shown} onOpen={setOpen} />
            </div>

            <Board zone={boardZone} isNewZone={boardZone === newZone} total={works.length} onMore={() => go('works')} onShow={showOnBoard} />
          </div>

          <div className="wrap">
            <Duel pool={ranked} isNewZone={boardZone === newZone} onOpen={setOpen} />
          </div>

          {/* 怎麼評：三步說完整個評測流程 */}
          <div className="wrap" id="how">
            <ol className="how">
              <li className="rv">
                <span className="how__no">01</span>
                <h3>同一道題</h3>
                <p>同一區的模型拿到同一道題目：<b>用前端作品介紹自己</b>（舊題目另有<b>用同一張 LOGO 做品牌落地站</b>）。題目改版就另開一區，不混排；少數例外會在作品上標明。</p>
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
              <div><dt>參賽模型</dt><dd>{pad2(modelCount)}</dd></div>
              <div><dt>已評分作品</dt><dd>{pad2(scoredCount)}</dd></div>
              <div><dt>LOGO 落地站</dt><dd>{pad2(logoWorks)}</dd></div>
              <div><dt>{boardZone === newZone ? '新題目最高分' : '舊題目最高分'}</dt><dd>{top}</dd></div>
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
              <h2 id="works-title">題目不同，<em>分開排名。</em></h2>
              <p className="section__desc">作品名稱與題型按鈕直達獨立分頁；「站內預覽」在 Arena 內展開互動視窗，可左右切換。新題目與舊題目的分數不能直接比較，所以各排各的名次。</p>
            </header>

            <Zone
              zone={newZone}
              tag="NEW BRIEF · 新題目"
              title="新題目"
              desc="視覺表現力佔七成、內容與寓意兩成、工程與測試一成。作品要先上網查證自己的資料，查不到的參數就照實寫「官方未公開」。"
              logo={false}
              rankOf={rankOf}
              onPreview={setOpen}
              onHover={setHover}
            />
            <Zone
              zone={oldZone}
              tag="PREVIOUS BRIEF · 舊題目"
              title="舊題目"
              desc="以更早的題目作答，前 16 件用舊的五維尺規評分，尚未用新題目重評。"
              logo
              rankOf={rankOf}
              onPreview={setOpen}
              onHover={setHover}
            />
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
                    {isNew(w) ? '新 ' : ''}{rankOf(w) != null ? pad2(rankOf(w)!) : '待評'} {w.short}
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
                  <p className="label">{isNew(open) ? '新題目 · ' : ''}{rankOf(open) != null ? `No.${rankOf(open)}` : '待評'} · 參賽模型</p>
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
          <div><h4 className="label">關於</h4><p>TYPELIN ARENA 用「自我介紹」與「LOGO 落地」兩道前端實作題（新題目目前只有自我介紹），直接比較 AI 的設計、工程與互動完成度。</p></div>
          <div><h4 className="label">觀看方式</h4><p>作品名稱與題型按鈕皆直達獨立分頁；「站內預覽」則在 Arena 內展開 iframe 實際操作。</p></div>
          <div><h4 className="label">標準</h4><p>分數只是索引。真正的比較方式，是把每一件作品打開、操作、看它能不能站得住。</p></div>
        </div>
        <p className="wordmark" aria-hidden="true">TYPELIN <b>ARENA</b></p>
        <div className="wrap"><p className="colophon__end label">© {new Date().getFullYear()} TYPELIN · 同題，各表。</p></div>
      </footer>
    </div>
  );
}
