import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';

/* —— 同一個請求，三種織法：最小的協作證明 —— */
type Tone = '嚴謹' | '詩意' | '直率';
const REQUEST = '下週要跟老闆爭取兩週重構時間，幫我想一段說法。';
const ANSWERS: Record<Tone, { html: string; foot: string }> = {
  嚴謹: {
    html: '建議這樣開場：<mark>「這兩週能換回之後每個 sprint 兩天的除錯成本。」</mark>接著給三行數據：近月舊模組的 bug 數、平均修復時長、重構後的維護曲線。最後補一句可驗證的承諾：<mark>「兩週後交付前後對照表，做不到就先回滾。」</mark>',
    foot: '策略 › 數字先行、承諾可驗證。適合重視風險的老闆。',
  },
  詩意: {
    html: '可以這樣說：<mark>「這座房子我們住了很久，牆裡的水管開始漏水。」</mark>兩週不是停工，是換管——<mark>「之後的每場雨，我們都不必再半夜起來接水。」</mark>把重構講成照顧，而不是抱怨。',
    foot: '策略 › 隱喻承載情緒。適合重視團隊感受的老闆。',
  },
  直率: {
    html: '直接講：<mark>「舊程式碼每週吃掉我們兩天，不修就是每週燒錢。」</mark>兩週重構，第三週開始回本。<mark>「你選：付兩週，還是一直每週付兩天。」</mark>不鋪墊、不道歉。',
    foot: '策略 › 選擇題代替問答題。適合沒時間的老闆。',
  },
};

export const ToneAtelier: React.FC = () => {
  const [tone, setTone] = useState<Tone>('嚴謹');
  const [swap, setSwap] = useState(0);
  return (
    <section className="atelier-section" aria-label="協作試驗：同一束線的三種織法">
      <div className="section-header-editorial">
        <div className="editorial-eyebrow mono">INTERLUDE · 墨的一面</div>
        <h2 className="editorial-title">同一個請求，三種織法</h2>
        <p className="editorial-lead">
          紙翻到背面，是墨。上面的儀器證明我如何拉扯結構，這裡證明我如何選擇語氣——
          協作不是接單，是同桌重織。點一個語氣，看同一束線如何被織成不同的布。
        </p>
      </div>
      <div className="atelier-board">
        <div className="atelier-tones" role="group" aria-label="選擇語氣">
          {(Object.keys(ANSWERS) as Tone[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tone === t}
              className={`atelier-tone ${tone === t ? 'active' : ''}`}
              onClick={() => {
                setTone(t);
                setSwap((s) => s + 1);
                sound.playPluck(t === '嚴謹' ? 320 : t === '詩意' ? 440 : 240, 0.22);
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="atelier-weave" key={swap} aria-live="polite">
          <p className="atelier-req mono">你的線 › {REQUEST}</p>
          <p className="atelier-ans serif" dangerouslySetInnerHTML={{ __html: ANSWERS[tone].html }} />
        </div>
        <p className="atelier-foot mono">{ANSWERS[tone].foot} · 切換語氣，底線不變：永遠給你可說出口的一段話。</p>
      </div>
    </section>
  );
};

/* —— 隱藏層：留白處的手寫邊注 —— */
const NOTES = [
  { hand: '怕隨便', body: '其實我最怕的不是難題，是含糊的誇獎——「隨便弄弄就好」往往最難。' },
  { hand: '慢即快', body: '你在畫布上慢下來的那一下，對，就是那個速度。我平常也是那樣想事情的。' },
  { hand: '紙在休息', body: '這一頁幾乎沒有動畫，不是沒做，是紙在休息。留白也是設計。' },
  { hand: '謝謝停留', body: '集滿四則邊注的人，通常就是能跟我協作愉快的人：好奇，且願意停留。' },
];

export const Marginalia: React.FC = () => {
  const [found, setFound] = useState<boolean[]>([false, false, false, false]);
  const count = found.filter(Boolean).length;
  const reveal = (i: number) => {
    setFound((f) => {
      if (f[i]) return f;
      sound.playPluck(520 + i * 60, 0.18);
      return f.map((x, j) => (j === i ? true : x));
    });
  };
  const parts: React.ReactNode[] = [];
  const sentences = [
    '關於我，最後只剩一句話：我是那種會把你的草稿',
    '鋪平、對齊、再描深一遍的人。我不搶筆，我只負責讓那一筆',
    '落下去時不後悔。如果你願意，我們可以從來不談「AI」，只談紙、',
    '墨，和把事情做好的速度',
    '。',
  ];
  sentences.forEach((s, i) => {
    parts.push(<span key={`s${i}`}>{s}</span>);
    if (i < 4) {
      parts.push(
        <React.Fragment key={`h${i}`}>
          <button
            type="button"
            className={`margin-hot${found[i] ? ' found' : ''}`}
            aria-label={`邊注其${['一', '二', '三', '四'][i]}`}
            aria-expanded={found[i]}
            onClick={() => reveal(i)}
          >
            ※
          </button>
          {found[i] && <span className="margin-note">{NOTES[i].hand} —— {NOTES[i].body}</span>}
        </React.Fragment>
      );
    }
  });
  return (
    <section className="atelier-section" aria-label="隱藏層：邊注">
      <div className="section-header-editorial">
        <div className="editorial-eyebrow mono">HIDDEN LAYER · MARGINALIA</div>
        <h2 className="editorial-title">留白處有人寫字</h2>
        <p className="editorial-lead">這頁藏了四則手寫邊注。找到 ※ 就點開它——桌角、行縫、沒人看的地方。</p>
      </div>
      <div className="margin-sheet">
        <p className="margin-prose serif">{parts}</p>
        <p className="margin-count mono" aria-live="polite">已拾得邊注 {count} / 4</p>
        {count === 4 && (
          <p className="margin-unlock serif">「好奇，且願意停留。」——憑這句話，去結尾拓一枚屬於你的印契。</p>
        )}
      </div>
    </section>
  );
};
