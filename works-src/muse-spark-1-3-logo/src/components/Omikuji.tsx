import { useRef, useState } from 'react';
import { fortunes, hiddenFortune, type Fortune } from '../data/content';

/**
 * 花籤 — 整站唯一需要「動手」的占卜。
 * 連抽五次會見到隱藏籤「滿開」。每次開籤都掀起一陣花吹雪。
 */
export function Omikuji() {
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [count, setCount] = useState(0);
  const [seenFull, setSeenFull] = useState(false);
  const [stampKey, setStampKey] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const burst = (power: number) => {
    const r = btnRef.current?.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('sakimu:burst', {
        detail: {
          x: r ? r.left + r.width / 2 : window.innerWidth / 2,
          y: r ? r.top : window.innerHeight * 0.4,
          power,
        },
      }),
    );
  };

  const draw = () => {
    if (drawing) return;
    setDrawing(true);
    window.setTimeout(() => {
      const next = count + 1;
      setCount(next);
      let f: Fortune;
      if (next >= 5 && !seenFull) {
        f = hiddenFortune;
        setSeenFull(true);
      } else {
        f = fortunes[Math.floor(Math.random() * fortunes.length)];
      }
      setFortune(f);
      setStampKey((k) => k + 1);
      setDrawing(false);
      burst(f.hidden ? 2.2 : 1.3);
    }, 620);
  };

  return (
    <div className="omikuji">
      <div className="omikuji__box">
        <div className={`omikuji__tube${drawing ? ' is-shaking' : ''}`} aria-hidden="true">
          <span className="omikuji__tube-kanji">咲</span>
        </div>
        <button
          ref={btnRef}
          type="button"
          className="btn btn--ink omikuji__draw"
          onClick={draw}
          disabled={drawing}
        >
          {drawing ? '搖籤中……' : fortune ? '再抽一張' : '抽一張花籤'}
        </button>
        <p className="omikuji__hint">
          {seenFull
            ? '滿開已至，春天常在。'
            : count === 0
              ? '今日運勢，免費。'
              : `已抽 ${count} 次，再抽 ${Math.max(0, 5 - count)} 次，或見滿開。`}
        </p>
      </div>

      <div className="omikuji__result" aria-live="polite">
        {fortune && (
          <article key={stampKey} className="fortune">
            <div className={`fortune__stamp${fortune.hidden ? ' fortune__stamp--full' : ''}`}>
              {fortune.luck}
            </div>
            <p className="fortune__poem">{fortune.poem}</p>
            <p className="fortune__code">
              <code>{fortune.code}</code>
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
