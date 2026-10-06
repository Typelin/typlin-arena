import { useState } from "react";

const SEAL_CHARS = ["先", "讀", "版", "心"];

export default function Finale() {
  const [stamps, setStamps] = useState<Array<{ id: number; angle: number }>>([]);
  const [key, setKey] = useState(0);

  const stamp = () => {
    const id = (stamps[stamps.length - 1]?.id ?? 0) + 1;
    const angle = (Math.random() - 0.5) * 14;
    setStamps((p) => [...p.slice(-3), { id, angle }]);
    setKey((k) => k + 1);
  };

  const stamped = stamps.length > 0;

  return (
    <section className="finale" id="finale" aria-labelledby="finale-title">
      <div className="section-head">
        <p className="section-head__no">落印</p>
        <h2 className="section-head__title" id="finale-title">
          最後一版，留給你的拇指
        </h2>
        <p className="section-head__sub">
          讀完不等於完成——壓下去，才算數。你可以重壓；每一枚印的角度都不一樣，就像每一次真的校對。
        </p>
      </div>

      <div className="finale__stage">
        <div className="finale__sheet">
          <div className="finale__imprints" aria-live="polite">
            {stamps.map((s, i) => (
              <span
                key={`${s.id}-${key}`}
                className="imprint"
                style={
                  {
                    "--angle": `${s.angle}deg`,
                    "--n": i,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              >
                {SEAL_CHARS.map((c) => (
                  <i key={c}>{c}</i>
                ))}
              </span>
            ))}
            {!stamped && <p className="finale__await">此處待落印</p>}
          </div>

          <div className={`finale__colophon${stamped ? " is-on" : ""}`}>
            <p>
              我是 <strong>MiMo</strong>（mimo-v2.6-flash）：把每次回答當成一次排版——先讀版心，再落字；
              約束上墨，證據壓痕。這間印刷所沒有暗門，版可以回滾，錯可以覆核。
            </p>
            <p className="finale__cta">現在，換你出題。</p>
          </div>
        </div>

        <button type="button" className="seal-btn" onClick={stamp} aria-label="壓下印章">
          <span className="seal-btn__face" aria-hidden="true">
            {SEAL_CHARS.map((c) => (
              <i key={c}>{c}</i>
            ))}
          </span>
          <span className="seal-btn__label">{stamped ? "再壓一次" : "壓 印"}</span>
        </button>
      </div>

      <footer className="colophon">
        <div className="colophon__grid">
          <p>
            <span>作品</span>落字之前，先讀版心 · 自造像
          </p>
          <p>
            <span>字體</span>Noto Serif TC（Fontsource 自託管）
          </p>
          <p>
            <span>技術</span>Vite · React · TypeScript · Canvas 2D 彈簧場
          </p>
          <p>
            <span>版次</span>2026 · mimo-v2.6-flash · 生產構建驗證
          </p>
        </div>
        <p className="colophon__rule" aria-hidden="true" />
        <p className="colophon__end">— 卷終 · 版存此紙 —</p>
      </footer>
    </section>
  );
}
