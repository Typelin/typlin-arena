import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ALL_FORKS, PARALLEL_UNIVERSES, TOTAL_STEPS } from './data/script';
import {
  AUTO_ALONE,
  AUTO_RESUME,
  AUTO_TAKEOVER,
  LOOSE_LEAVES,
  LOOSE_LEAVES_FINALE,
  WHISPERS,
  inscriptionFor,
} from './data/secrets';
import type { LooseLeaf } from './data/secrets';
import { allSentenceTexts, roadsNotTaken, selfChosen } from './engine/path';
import { LABEL_GAP, blockWidth, branchFontPx, labelShape, spreadFor } from './engine/labels';
import { nodeAt, stepTo } from './engine/layout';
import { useFork } from './hooks/useFork';
import { useViewport } from './hooks/useViewport';

const NUMERALS = ['一', '二', '三', '四', '五'];
const LEAF_KEY = 'forking-path/loose-leaves';

/** 殘頁是跨場次的收藏，所以存起來。 */
function loadLeaves(): number[] {
  try {
    const raw = localStorage.getItem(LEAF_KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (v): v is number => typeof v === 'number' && v >= 0 && v < LOOSE_LEAVES.length
    );
  } catch {
    return [];
  }
}

export default function App() {
  const {
    canvasRef,
    worldRef,
    choices,
    phase,
    hover,
    setHover,
    choose,
    reset,
    muted,
    toggleMute,
    ghostsOn,
    setGhostsOn,
    overview,
    toggleOverview,
    auto,
    id,
  } = useFork();

  const vw = useViewport();
  const fontPx = branchFontPx(vw);
  const spread = spreadFor(vw);
  const narrow = vw < 560;
  /** 窄螢幕的候選直列：寬度與 CSS 同步，並置中在枝尖下方，才不會推出畫面。 */
  const columnW = Math.min(vw * 0.76, 340);

  const holdRef = useRef<number | null>(null);
  /** 記住上一次是用鍵盤選的——只有鍵盤使用者才需要被接手焦點 */
  const keyboardRef = useRef(false);
  const firstBranchRef = useRef<HTMLButtonElement | null>(null);

  // 每一次選擇後，把焦點交還給新的第一條枝，鍵盤使用者才走得下去
  useEffect(() => {
    if (!keyboardRef.current) return;
    if (phase !== 'choosing') return;
    if (choices.length === 0) return;
    firstBranchRef.current?.focus();
  }, [choices.length, phase]);

  /** 已定下的字，掛在各自的節點上。 */
  const placed = useMemo(() => {
    const out = [{ key: 'root', text: '我', x: 0, y: 0, fresh: false, root: true, mine: false }];
    for (let i = 0; i < choices.length; i += 1) {
      const n = nodeAt(choices, i + 1);
      out.push({
        key: `n${i}`,
        text: ALL_FORKS[i].options[choices[i].option].text,
        x: n.x,
        y: n.y,
        fresh: i === choices.length - 1 && phase === 'growing',
        root: false,
        mine: choices[i].by === 'me',
      });
    }
    return out;
  }, [choices, phase]);

  const tip = useMemo(() => nodeAt(choices, choices.length), [choices]);
  const fork = ALL_FORKS[choices.length] ?? null;

  /** 當前岔路的三條候選枝。 */
  const candidates = useMemo(() => {
    if (phase !== 'choosing' || !fork) return [];
    return fork.options.map((option, index) => {
      const p = stepTo(tip, index);
      return { option, index, x: p.x, y: p.y };
    });
  }, [phase, fork, tip]);

  /** 每條候選枝的標籤形狀：短字貼枝尖，長字懸掛換行。 */
  const shapes = useMemo(
    () => candidates.map((c) => labelShape(c.option.text, fontPx, spread)),
    [candidates, fontPx, spread]
  );

  const lines = useMemo(() => allSentenceTexts(choices), [choices]);
  const done = phase === 'done';
  const notTaken = roadsNotTaken(choices.length);
  const activeNote = hover !== null && fork ? fork.options[hover].note : null;

  /** 這條路裡，有幾個字是我自己抽的。 */
  const mineCount = useMemo(() => selfChosen(choices), [choices]);
  const allMine = done && mineCount === TOTAL_STEPS && TOTAL_STEPS > 0;

  // ── 彩蛋 ────────────────────────────────────────────────────
  const [collected, setCollected] = useState<number[]>(loadLeaves);
  const [toast, setToast] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);
  const [whisper, setWhisper] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const say = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 6200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    []
  );

  // 筆的交換：我接手、我還回去——兩邊都要說一聲，否則訪客不知道主導權換手了。
  const wasAuto = useRef(false);
  useEffect(() => {
    const was = wasAuto.current;
    wasAuto.current = auto;
    if (auto && !was) {
      say(AUTO_TAKEOVER);
    } else if (!auto && was && !done && choices.length > 0) {
      say(AUTO_RESUME);
    }
  }, [auto, done, choices.length, say]);

  const allLeaves = collected.length >= LOOSE_LEAVES.length;

  const collect = useCallback(
    (leaf: LooseLeaf) => {
      if (collected.includes(leaf.id)) {
        say(leaf.text);
        return;
      }
      const next = [...collected, leaf.id].sort((a, b) => a - b);
      setCollected(next);
      try {
        localStorage.setItem(LEAF_KEY, JSON.stringify(next));
      } catch {
        /* 私密模式就當作沒存 */
      }
      say(next.length >= LOOSE_LEAVES.length ? LOOSE_LEAVES_FINALE : leaf.text);
    },
    [collected, say]
  );

  const copyId = useCallback(() => {
    const text = `岔路 Forking Path — № ${id}`;
    const nav = navigator as Navigator & { clipboard?: Clipboard };
    if (nav.clipboard?.writeText) {
      nav.clipboard.writeText(text).then(
        () => say('路徑編號已複製。拿去，給別人看你也走過這裡。'),
        () => say(`複製不了。編號是 ${id}，自己抄。`)
      );
    } else {
      say(`編號是 ${id}，自己抄。`);
    }
  }, [id, say]);

  const stampTitle = useCallback(() => {
    const mark = choices.length === 0 ? '未落筆' : id;
    setStamp(mark);
    say(choices.length === 0 ? '紙是空的，印也只能蓋一個空字。' : `落款。這張紙現在叫 № ${mark}。`);
  }, [choices.length, id, say]);

  /**
   * 落款要「雙擊」，但不依賴瀏覽器的 dblclick 判定——
   * 自己數兩次點擊的間隔，行為在任何輸入裝置上都一致。
   */
  const titleTapRef = useRef(0);
  const onTitleClick = useCallback(() => {
    const now = Date.now();
    if (now - titleTapRef.current < 400) {
      titleTapRef.current = 0;
      stampTitle();
    } else {
      titleTapRef.current = now;
    }
  }, [stampTitle]);

  /** 極端路徑銘文：只有刻意走出來的人才看得到。全自動走完則另有一句。 */
  const inscription = useMemo(() => {
    if (!done) return null;
    if (allMine) return AUTO_ALONE;
    return inscriptionFor(choices.map((c) => c.option));
  }, [done, allMine, choices]);

  // 閒置低語
  useEffect(() => {
    if (done) {
      setWhisper(null);
      return;
    }
    let last = Date.now();
    const bump = () => {
      last = Date.now();
      setWhisper(null);
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel'] as const;
    for (const e of events) window.addEventListener(e, bump, { passive: true });
    const iv = window.setInterval(() => {
      const idle = Date.now() - last;
      let next: string | null = null;
      for (const w of WHISPERS) if (idle >= w.after) next = w.text;
      setWhisper(next);
    }, 1000);
    return () => {
      for (const e of events) window.removeEventListener(e, bump);
      window.clearInterval(iv);
    };
  }, [done]);

  // 觸控的隱藏層次：長按畫面 520ms 掀開幽靈森林
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    holdRef.current = window.setTimeout(() => setGhostsOn(true), 520);
  };
  const onPointerUp = () => {
    if (holdRef.current !== null) {
      window.clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    setGhostsOn(false);
  };

  const labelStyle = (x: number, y: number, shape: string): CSSProperties => {
    const base = { '--label-w': `${blockWidth(spread)}px` } as CSSProperties;
    if (shape === 'row') return base;
    return { ...base, left: x + LABEL_GAP, top: y };
  };

  const renderBranch = (
    c: { option: { text: string; p: number; note: string }; index: number; x: number; y: number },
    shape: string
  ) => (
    <button
      key={c.index}
      ref={c.index === 0 ? firstBranchRef : undefined}
      type="button"
      className={`branch${hover === c.index ? ' is-hot' : ''}`}
      data-shape={shape}
      style={labelStyle(c.x, c.y, shape)}
      onMouseEnter={() => setHover(c.index)}
      onMouseLeave={() => setHover(null)}
      onFocus={() => setHover(c.index)}
      onBlur={() => setHover(null)}
      onClick={(e) => {
        // detail === 0 表示這一擊來自鍵盤（Enter / Space）
        keyboardRef.current = e.detail === 0;
        choose(c.index, 'you');
      }}
      aria-label={`選擇「${c.option.text}」，機率 ${c.option.p}%`}
    >
      {shape === 'row' && (
        <span className="branch__i" aria-hidden="true">
          {NUMERALS[c.index]}
        </span>
      )}
      <span className="branch__text">{c.option.text}</span>
      <span className="branch__p">{c.option.p}%</span>
    </button>
  );

  return (
    <main
      className="forking"
      data-phase={phase}
      data-ghosts={ghostsOn ? 'on' : 'off'}
      data-started={choices.length > 0 ? 'on' : 'off'}
      data-overview={overview ? 'on' : 'off'}
      data-auto={auto ? 'on' : 'off'}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <canvas ref={canvasRef} className="forking__canvas" aria-hidden="true" />

      <section className="overture" aria-hidden={choices.length > 0}>
        <p className="overture__p">我沒有想法，我只有一池機率。</p>
        <p className="overture__p">每說一個字，我都在幾萬個候選裡挑一個。</p>
        <p className="overture__p overture__p--last">現在，換你來挑。</p>
      </section>

      <div ref={worldRef} className="forking__world">
        {placed.map((n) => (
          <span
            key={n.key}
            className={`node${n.root ? ' node--root' : ''}${n.fresh ? ' node--fresh' : ''}${
              n.mine ? ' node--mine' : ''
            }`}
            style={{ left: n.x + (n.root ? 22 : LABEL_GAP), top: n.y }}
          >
            {n.text}
          </span>
        ))}

        {narrow ? (
          <div
            className="branches"
            style={{ left: tip.x - columnW / 2, top: tip.y + 44, width: columnW }}
          >
            {candidates.map((c) => renderBranch(c, 'row'))}
          </div>
        ) : (
          candidates.map((c, i) => renderBranch(c, shapes[i] ?? 'inline'))
        )}
      </div>

      {/* 殘頁：紙的邊角上，五枚沒人注意過的印 */}
      {LOOSE_LEAVES.map((leaf) => (
        <button
          key={leaf.id}
          type="button"
          className={`leaf${collected.includes(leaf.id) ? ' is-found' : ''}`}
          style={{ left: leaf.x, top: leaf.y }}
          onClick={() => collect(leaf)}
          aria-label={`殘頁之${NUMERALS[leaf.id]}`}
        >
          <span className="leaf__mark" aria-hidden="true">
            {NUMERALS[leaf.id]}
          </span>
        </button>
      ))}

      <header className="hud">
        <div className="hud__brand">
          <h1 className="hud__title" onClick={onTitleClick}>
            岔路
          </h1>
          <span className="hud__sub">Forking Path</span>
        </div>
        <div className="hud__meta">
          <span className="hud__stat">
            <b>{String(choices.length).padStart(2, '0')}</b>
            <i>/{TOTAL_STEPS}</i>
          </span>
          <button
            type="button"
            className="hud__stat hud__stat--id"
            onClick={copyId}
            aria-label={`路徑編號 ${id}，點擊複製`}
          >
            № {id}
          </button>
          {collected.length > 0 && (
            <span className="hud__stat hud__stat--leaf">
              殘頁 {collected.length}/{LOOSE_LEAVES.length}
            </span>
          )}
          <button
            type="button"
            className="hud__btn"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? '開啟聲音' : '靜音'}
          >
            {muted ? '靜音' : '有聲'}
          </button>
          <button
            type="button"
            className="hud__btn"
            onClick={reset}
            disabled={choices.length === 0}
          >
            重走
          </button>
        </div>
      </header>

      <div className="ghost-tag" aria-hidden={!ghostsOn}>
        幽靈森林 · 你沒走的那些路
      </div>

      <div className="toast" role="status" data-on={toast ? 'on' : 'off'}>
        {toast ?? ''}
      </div>

      <div className="whisper" aria-hidden={!whisper} data-on={whisper ? 'on' : 'off'}>
        {whisper ?? ''}
      </div>

      {stamp && (
        <div className="seal-stamp" aria-hidden="true">
          <span className="seal-stamp__glyph">岔</span>
          <span className="seal-stamp__id">{stamp}</span>
        </div>
      )}

      <footer className="prompt">
        {done ? (
          <span className="prompt__text">走完了。</span>
        ) : auto ? (
          <span className="prompt__text prompt__text--auto">我自己在走。你動一下，筆就還你。</span>
        ) : activeNote ? (
          <span className="prompt__text prompt__text--note">{activeNote}</span>
        ) : (
          <span className="prompt__text">點一條枝，替我定下一個字。</span>
        )}
        {!done && !auto && choices.length === 0 && (
          <span className="prompt__hint">枝越粗，是我越想走的那條</span>
        )}
        {!done && !auto && choices.length > 2 && (
          <span className="prompt__hint">按住 Shift／長按畫面：看別的路</span>
        )}
        {!done && !auto && choices.length > 6 && (
          <span className="prompt__hint">停手八秒，換我自己走</span>
        )}
      </footer>

      {done && !overview && (
        <section
          className={`epilogue${allMine ? ' epilogue--alone' : ''}`}
          aria-label="你走出來的自畫像"
        >
          <div className="epilogue__inner">
            <p className="epilogue__kicker">
              {allMine ? '這是我自己走出來的' : '這是你走出來的'}
            </p>

            {/* 全程放手時，這句是判詞，不是註腳——先講，再讓底下六句話當證據。
                而且它必須落在摺線之上：看不到的 payoff 不算 payoff。 */}
            {inscription && allMine && (
              <p className="epilogue__inscription epilogue__inscription--lead">{inscription}</p>
            )}

            <div className="epilogue__lines">
              {lines.map((l, i) => (
                <p key={i} className="epilogue__line" style={{ animationDelay: `${i * 240}ms` }}>
                  {l}
                </p>
              ))}
            </div>

            {inscription && !allMine && (
              <p
                className="epilogue__inscription"
                style={{ animationDelay: `${lines.length * 240 + 260}ms` }}
              >
                {inscription}
              </p>
            )}

            <dl className="epilogue__facts">
              <div>
                <dt>路徑編號</dt>
                <dd>
                  <button type="button" className="linkish" onClick={copyId}>
                    № {id}
                  </button>
                </dd>
              </div>
              <div>
                <dt>這條路誰選的</dt>
                <dd>
                  你 {TOTAL_STEPS - mineCount} 步 · 我 {mineCount} 步
                </dd>
              </div>
              <div>
                <dt>你沒走的路</dt>
                <dd>{notTaken.toLocaleString('en-US')} 條</dd>
              </div>
              <div>
                <dt>這道題的總宇宙</dt>
                <dd>{PARALLEL_UNIVERSES.toLocaleString('en-US')} 條</dd>
              </div>
              <div>
                <dt>殘頁</dt>
                <dd>
                  {collected.length}/{LOOSE_LEAVES.length}
                </dd>
              </div>
            </dl>

            {allLeaves ? (
              <div className="epilogue__leaves">
                <p className="epilogue__kicker">殘頁 · 五枚蓋齊</p>
                {LOOSE_LEAVES.map((l) => (
                  <p key={l.id} className="epilogue__line epilogue__line--leaf">
                    {l.text}
                  </p>
                ))}
                <p className="epilogue__line epilogue__line--finale">{LOOSE_LEAVES_FINALE}</p>
              </div>
            ) : (
              <p className="epilogue__hint">
                這張紙上，還有 {LOOSE_LEAVES.length - collected.length} 枚沒被蓋過的印。
              </p>
            )}

            <div className="epilogue__acts">
              <button type="button" className="btn" onClick={reset}>
                再走一次
              </button>
              <button type="button" className="btn btn--ghost" onClick={toggleOverview}>
                看整棵樹
              </button>
              <span className="epilogue__tip">按住 Shift／長按畫面：看幽靈森林</span>
            </div>
          </div>
        </section>
      )}

      {overview && (
        <div className="overview-bar">
          <span className="overview-bar__meta">
            № {id} · {TOTAL_STEPS} 步 · {PARALLEL_UNIVERSES.toLocaleString('en-US')} 條路裡的一條
          </span>
          <button type="button" className="btn" onClick={toggleOverview}>
            回到字句
          </button>
        </div>
      )}
    </main>
  );
}
