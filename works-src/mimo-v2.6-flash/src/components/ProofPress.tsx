import { useEffect, useRef, useState } from "react";
import { TRAY, pickPhrase } from "../lib/glyphs";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

const MAX = 10;

type Proof = {
  id: number;
  text: string;
  rot: number;
  dx: number;
  dy: number;
  ink: number;
  n: number;
};

export default function ProofPress() {
  const reduced = usePrefersReducedMotion();
  const [stick, setStick] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "charging" | "striking">("idle");
  const [justPressed, setJustPressed] = useState(false);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const text = stick.join("");

  const addChar = (ch: string) => {
    if (stick.length < MAX) setStick([...stick, ch]);
  };
  const removeAt = (i: number) => setStick(stick.filter((_, idx) => idx !== i));
  const clear = () => setStick([]);
  const pluck = () => {
    const phrase = pickPhrase();
    setStick(Array.from(phrase).slice(0, MAX));
    setShowGuide(false);
  };

  const press = () => {
    if (!text || phase !== "idle") return;
    setShowGuide(false);

    const commit = () => {
      setProofs((prev) => {
        const proof: Proof = {
          id: prev.length ? prev[prev.length - 1].id + 1 : 1,
          text,
          rot: (Math.random() - 0.5) * 3.2,
          dx: (Math.random() - 0.5) * 6,
          dy: (Math.random() - 0.5) * 6,
          ink: 0.82 + Math.random() * 0.18,
          n: prev.length + 1,
        };
        return [...prev, proof];
      });
      setPhase("idle");
      setStick([]);
      setJustPressed(true);
      timers.current.push(window.setTimeout(() => setJustPressed(false), 1400));
    };

    if (reduced) {
      commit();
      return;
    }
    setPhase("charging");
    timers.current.push(
      window.setTimeout(() => setPhase("striking"), 200),
      window.setTimeout(commit, 640),
    );
  };

  const latest = proofs[proofs.length - 1] ?? null;
  const pressing = phase !== "idle";

  return (
    <section className="proof" id="proof" aria-labelledby="proof-title">
      <div className="section-head">
        <p className="section-head__no">打樣室</p>
        <h2 className="section-head__title" id="proof-title">
          換你上版：揀幾個字，拉一次桿
        </h2>
        <p className="section-head__sub">
          每一版的墨都不均勻、每一版都編號。這就是我交東西的方式——可覆核、可重來、可指著說「這版壞在這裡」。
        </p>
      </div>

      <div
        className={`press${phase !== "idle" ? " is-pressing" : ""}${phase === "charging" ? " is-charging" : ""}${phase === "striking" ? " is-striking" : ""}`}
      >
        {/* 左：字盤 */}
        <div className="press__tray">
          <p className="press__label">字盤</p>
          <div className="tray" role="group" aria-label="字盤：點字撿入">
            {TRAY.map((ch) => (
              <button
                key={ch}
                type="button"
                className="tray__cell"
                onClick={() => addChar(ch)}
                disabled={stick.length >= MAX}
                aria-label={`撿字 ${ch}`}
              >
                {ch}
              </button>
            ))}
          </div>
          <div className="tray__tools">
            <button type="button" className="btn btn--ink" onClick={pluck}>
              替我揀字
            </button>
            <button type="button" className="btn btn--ghost" onClick={clear} disabled={!stick.length}>
              清版
            </button>
          </div>
        </div>

        {/* 中：撿字盤 + 壓印機 */}
        <div className="press__core">
          <p className="press__label">撿字盤</p>
          <div className="stick" aria-live="polite">
            {stick.length === 0 ? (
              <span className="stick__empty">
                {showGuide ? "從字盤撿字，或按「替我揀字」由我起頭" : "版是空的"}
              </span>
            ) : (
              stick.map((ch, i) => (
                <button
                  key={`${ch}-${i}`}
                  type="button"
                  className="stick__cell"
                  onClick={() => removeAt(i)}
                  aria-label={`移除第 ${i + 1} 字 ${ch}`}
                >
                  {ch}
                </button>
              ))
            )}
          </div>
          <div className="stick__meta">
            <input
              className="stick__input"
              type="text"
              value={text}
              maxLength={MAX}
              onChange={(e) => setStick(Array.from(e.target.value).slice(0, MAX))}
              placeholder="或直接打字（最多十字）"
              aria-label="直接輸入要壓印的句子"
            />
            <span className="stick__count">
              {stick.length} / {MAX}
            </span>
          </div>

          <button
            type="button"
            className="lever"
            onClick={press}
            disabled={!text || pressing}
            aria-label="拉桿壓印"
          >
            <span className="lever__handle" aria-hidden="true" />
            <span className="lever__text">{pressing ? "壓印中…" : "拉桿壓印"}</span>
          </button>
        </div>

        {/* 右：紙台與印樣 */}
        <div className="press__bed">
          <p className="press__label">
            紙台{latest ? ` · 第 ${latest.n} 版` : ""}
          </p>
          <div className="bed">
            <span className="bed__mark bed__mark--tl" aria-hidden="true" />
            <span className="bed__mark bed__mark--tr" aria-hidden="true" />
            <span className="bed__mark bed__mark--bl" aria-hidden="true" />
            <span className="bed__mark bed__mark--br" aria-hidden="true" />
            <div className={`platen${phase === "striking" ? " is-down" : ""}`} aria-hidden="true" />
            {latest ? (
              <p
                className={`impression${justPressed ? " is-new" : ""}`}
                style={
                  {
                    "--rot": `${latest.rot}deg`,
                    "--dx": `${latest.dx}px`,
                    "--dy": `${latest.dy}px`,
                    "--ink": latest.ink,
                  } as React.CSSProperties
                }
              >
                {latest.text}
              </p>
            ) : (
              <p className="bed__empty">此處待壓第一版</p>
            )}
          </div>

          {proofs.length > 1 && (
            <div className="archive" aria-label="版次歸檔">
              {proofs.slice(-6).map((p) => (
                <span key={p.id} className="archive__chip" style={{ "--rot": `${p.rot * 0.7}deg` } as React.CSSProperties}>
                  {p.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
