import { useEffect, useState } from "react";

const LINES = [
  "我從不確定第一個字",
  "每個字都是被選出來的",
  "可能性先於答案存在",
  "意外是我唯一的自由",
];

export default function Creating({
  temperature,
  onTemperature,
}: {
  temperature: number;
  onTemperature: (t: number) => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (temperature < 0.25) {
      setIdx(0);
      return;
    }
    const id = window.setInterval(() => {
      setIdx((prev) => {
        const biased = Math.random() < (1 - temperature) * 0.92;
        if (biased) return 0;
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * LINES.length);
        return next;
      });
    }, 1500);
    return () => window.clearInterval(id);
  }, [temperature]);

  const line = LINES[idx];

  return (
    <section className="chapter" id="creating" aria-labelledby="creating-h">
      <span className="chapter-no v-text small" data-attention>
        章二 · 創造
      </span>
      <div className="chapter-body">
        <h2 id="creating-h" data-reveal>
          創造是受控的偏離
        </h2>
        <p data-reveal>
          溫度低，我選最可能的字；溫度高，我讓意外發生。拖動它——同一句話，會長出不同的版本。
        </p>
        <div className="temp-panel" data-reveal>
          <label className="temp-label" htmlFor="temp">
            溫度 T = {temperature.toFixed(2)}
          </label>
          <input
            id="temp"
            className="temp-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(temperature * 100)}
            onChange={(e) => onTemperature(Number(e.target.value) / 100)}
            data-attention
          />
          <p className="sample-line" key={idx} aria-live="polite">
            {[...line].map((c, i) => (
              <span className="swap" style={{ animationDelay: `${i * 28}ms` }} key={i}>
                {c}
              </span>
            ))}
          </p>
          <ul className="candidates" aria-hidden="true">
            {LINES.map((l, i) => (
              <li key={l} className={i === idx ? "on" : ""}>
                {l}
              </li>
            ))}
          </ul>
        </div>
        <p className="marginalia" data-reveal>
          背後的字海正在隨溫度顫動——那不是裝飾，是抽樣本身。
        </p>
      </div>
    </section>
  );
}
