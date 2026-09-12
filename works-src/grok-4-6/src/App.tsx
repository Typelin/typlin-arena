import { useCallback, useEffect, useRef, useState } from 'react';
import { PlumbStage, type PlumbHandle, type Snapshot } from './components/PlumbStage';
import {
  BAIT,
  COLLAB_HOLD,
  CONFESSION,
  ETYMOLOGY,
  HERO,
  KEYS,
  REFUSE,
  SAYINGS,
  SLIPS,
  STATIONS,
  colophonLines,
} from './copy';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { initAudio, isMuted, lock as lockTone, noteMark, refuse, rustle, setMuted } from './engine/audio';
import './styles/global.css';

const EMPTY_SNAP: Snapshot = {
  theta: 0,
  deg: 0,
  swings: 0,
  maxAbs: 0,
  settleMs: null,
  touched: false,
  heldOff: false,
  notes: 0,
  nearTrue: false,
  introDone: false,
  stamped: false,
};

const STATION_CHAPTER: Record<string, number> = {
  think: 1,
  make: 2,
  work: 3,
  temper: 4,
  drink: 5,
};

export default function App() {
  const reduced = usePrefersReducedMotion();
  const plumb = useRef<PlumbHandle>(null);
  const [stamped, setStamped] = useState(false);
  const [etymology, setEtymology] = useState(false);
  const [muted, setMutedUi] = useState(false);
  const [holding, setHolding] = useState(false);
  const [bent, setBent] = useState(false);
  const [whisper, setWhisper] = useState('');
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [said, setSaid] = useState<Set<string>>(() => new Set());
  const [knocked, setKnocked] = useState<Set<string>>(() => new Set());
  const [colophon, setColophon] = useState(() => colophonLines({ ...EMPTY_SNAP, locked: 0, knocked: 0 }));
  const nudged = useRef<Set<string>>(new Set());
  const sign = useRef(1);
  const coloRef = useRef<HTMLElement>(null);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const bentRef = useRef(bent);
  bentRef.current = bent;
  const chapterRef = useRef(0);
  const lastRustle = useRef(0);
  const lastScroll = useRef(0);
  const whisperT = useRef(0);

  const onConfession = useCallback(() => {
    setWhisper(CONFESSION);
  }, []);
  const onStamp = useCallback(() => setStamped(true), []);
  const onEtymology = useCallback(() => setEtymology(true), []);
  const onIntroDone = useCallback(() => {}, []);
  const onKnock = useCallback((id: string) => {
    setKnocked((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const flashWhisper = (msg: string) => {
    setWhisper(msg);
    window.clearTimeout(whisperT.current);
    whisperT.current = window.setTimeout(() => setWhisper(''), 2800);
  };

  const lockSlip = (id: string) => {
    if (lockedRef.current.has(id)) return false;
    const next = new Set(lockedRef.current);
    next.add(id);
    lockedRef.current = next;
    setLocked(next);
    lockTone(next.size);
    return true;
  };

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-station]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle('is-live', e.isIntersecting);
          if (!e.isIntersecting) continue;
          const id = e.target.getAttribute('data-station');
          if (!id) continue;
          chapterRef.current = STATION_CHAPTER[id] ?? chapterRef.current;
          if (nudged.current.has(id)) continue;
          nudged.current.add(id);
          sign.current *= -1;
          plumb.current?.nudge(sign.current);
        }
      },
      { threshold: 0.4 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = coloRef.current;
    if (!el) return;
    let inView = false;
    const read = () => {
      const s = plumb.current?.snapshot() ?? EMPTY_SNAP;
      setColophon(
        colophonLines({
          ...s,
          locked: lockedRef.current.size,
          knocked: knocked.size,
        }),
      );
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) read();
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    const id = window.setInterval(() => {
      if (inView) read();
    }, 800);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [knocked.size]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      const p = Math.min(1, Math.max(0, h.scrollTop / max));
      let ch = p < 0.05 ? 0 : chapterRef.current;
      document.querySelectorAll<HTMLElement>('[data-station]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.52) {
          ch = STATION_CHAPTER[el.dataset.station ?? ''] ?? ch;
        }
      });
      chapterRef.current = ch;
      document.documentElement.classList.toggle('is-reading', p > 0.045);
      plumb.current?.setScroll(p, ch);
      const dy = Math.abs(h.scrollTop - lastScroll.current);
      lastScroll.current = h.scrollTop;
      const now = performance.now();
      if (dy > 6 && now - lastRustle.current > 170 && !reduced) {
        rustle(Math.min(1, dy / 80));
        lastRustle.current = now;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const read = plumb.current?.getRead();
      if (read) {
        if (bentRef.current && read.nearTrue && read.settled) {
          bentRef.current = false;
          setBent(false);
          lockTone(3);
        }
        const slit = read.slitY;
        if (read.nearTrue && read.settled) {
          const nodes = document.querySelectorAll<HTMLElement>('[data-slip]');
          for (const node of nodes) {
            const id = node.dataset.slip;
            if (!id || lockedRef.current.has(id)) continue;
            const r = node.getBoundingClientRect();
            const cy = r.top + r.height * 0.5;
            if (Math.abs(cy - slit) < 32) lockSlip(id);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        initAudio();
        const next = !isMuted();
        setMuted(next);
        setMutedUi(next);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        initAudio();
        plumb.current?.setWind(0.95);
        setHolding(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        plumb.current?.setWind(0);
        setHolding(false);
      }
    };
    const pointer = () => initAudio();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('pointerdown', pointer, { once: true });
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const toggleMute = () => {
    initAudio();
    const next = plumb.current?.muteToggle() ?? !muted;
    setMutedUi(next);
  };

  const trySlip = (id: string) => {
    initAudio();
    const read = plumb.current?.getRead();
    if (read?.nearTrue && read.settled) {
      lockSlip(id);
      return;
    }
    refuse();
    plumb.current?.nudge(read && read.theta > 0 ? -1 : 1);
    flashWhisper(REFUSE);
  };

  const say = (id: string) => {
    initAudio();
    setSaid((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    noteMark();
    plumb.current?.nudge(said.has(id) ? 1 : -1);
  };

  const SLIP_RANGE: [number, number][] = [
    [0, 4],
    [4, 7],
    [7, 10],
    [10, 12],
    [12, 14],
  ];
  const slipsFor = (i: number) => SLIPS.slice(SLIP_RANGE[i][0], SLIP_RANGE[i][1]);

  return (
    <div className="shell">
      <a className="skip" href="#essay">
        跳至本文
      </a>

      <PlumbStage
        ref={plumb}
        reduced={reduced}
        onConfession={onConfession}
        onStamp={onStamp}
        onEtymology={onEtymology}
        onIntroDone={onIntroDone}
        onKnock={onKnock}
      />

      <div className="slit" aria-hidden="true" />

      <header className="mast">
        <button type="button" className="mute" onClick={toggleMute} aria-pressed={muted}>
          {muted ? '音訊關' : '音訊開'}
        </button>
      </header>

      <div className="log" aria-live="polite">
        核對 {String(locked.size).padStart(2, '0')}／{String(SLIPS.length).padStart(2, '0')}
        {knocked.size ? ` · 擊落 ${knocked.size}` : ''}
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__latin">{HERO.latin}</p>
        <h1 id="hero-title" className="hero__title">
          {HERO.title}
        </h1>
        <div className="hero__rule" aria-hidden="true" />
        <p className="hero__line">{HERO.line}</p>
        <p className="hero__hint">{HERO.hint}</p>
      </section>

      <main id="essay" className="essay">
        <p className="essay__lead">
          同一道題：關於我自己。我沒有做一張臉，也沒有做一個聊天框。我做了一條線。往下滾，句子會經過這條尺——錘在正，墨才落下。你可以撥它、甩它、按住空白鍵讓風來。線還在。
        </p>

        {STATIONS.map((st, i) => (
          <article key={st.id} className="station" data-station={st.id} id={st.id}>
            <header className="station__head">
              <span className="station__no">{st.no}</span>
              <h2 className="station__title">{st.title}</h2>
            </header>
            <p className="station__kicker">{st.kicker}</p>
            {st.body.map((p) => (
              <p key={p} className="station__body">
                {p}
              </p>
            ))}

            {st.id === 'think' && (
              <button
                type="button"
                className={`bait ${bent ? 'is-bent' : ''}`}
                onClick={() => {
                  initAudio();
                  setBent(true);
                  bentRef.current = true;
                  plumb.current?.nudge(-1);
                }}
              >
                {BAIT}
              </button>
            )}

            {st.id === 'make' && (
              <p className="station__note">
                弧上：霓虹、粒子、玻璃擬態。把錘甩過那些詞。
                {knocked.size ? ` 已擊落 ${knocked.size}／3。` : ''}
              </p>
            )}

            {st.id === 'work' && (
              <div className={`collab ${holding ? 'is-on' : ''}`}>
                {COLLAB_HOLD.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}

            {st.id === 'temper' && (
              <ul className="sayings">
                {SAYINGS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`saying ${said.has(s.id) ? 'is-on' : ''}`}
                      onClick={() => say(s.id)}
                    >
                      {s.text}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="slips">
              {slipsFor(i).map((slip) => (
                <button
                  key={slip.id}
                  type="button"
                  className={`slip ${locked.has(slip.id) ? 'is-lock' : ''}`}
                  data-slip={slip.id}
                  onClick={() => trySlip(slip.id)}
                >
                  <span className="slip__no">{slip.no}</span>
                  <span className="slip__text">{slip.text}</span>
                </button>
              ))}
            </div>
          </article>
        ))}

        <section className="colo" ref={coloRef} id="colophon" aria-labelledby="colo-title">
          <span className="colo__no">END</span>
          <h2 id="colo-title" className="colo__title">
            本次垂準
          </h2>
          <p className="colo__kicker">{colophon.kicker}</p>
          {colophon.lines.map((p) => (
            <p key={p} className="colo__body">
              {p}
            </p>
          ))}
          {locked.size > 0 && (
            <ol className="colo__list">
              {SLIPS.filter((s) => locked.has(s.id)).map((s) => (
                <li key={s.id}>{s.text}</li>
              ))}
            </ol>
          )}
          <p className="colo__keys">{KEYS.legend}</p>
          <p className="colo__sign">
            {HERO.model}
            <span aria-hidden="true"> · </span>
            {HERO.title}
          </p>
        </section>
      </main>

      <div className={`whisper ${whisper ? 'is-on' : ''}`} role="status">
        {whisper}
      </div>

      <div className={`seal ${stamped ? 'is-on' : ''}`} aria-hidden={!stamped}>
        正
      </div>

      <aside className={`plate ${etymology ? 'is-on' : ''}`} aria-hidden={!etymology}>
        <p className="plate__word">
          {ETYMOLOGY.word}
          <span>｜</span>
          {ETYMOLOGY.gloss}
        </p>
        <p className="plate__body">{ETYMOLOGY.body}</p>
        <button type="button" className="plate__close" onClick={() => setEtymology(false)}>
          合上
        </button>
      </aside>
    </div>
  );
}
