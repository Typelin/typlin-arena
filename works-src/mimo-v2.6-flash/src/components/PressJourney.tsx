import { useCallback, useEffect, useRef, useState } from "react";
import MovableTypeField, { type HitInfo } from "./MovableTypeField";
import { chapterIndex, clamp, phaseFromProgress } from "../lib/scroll";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

/** 章節文案：0 首屏 · 1 揀字 · 2 拼版 · 3 上墨 · 4 壓印 */
const CHAPTERS = [
  {
    no: "",
    title: "",
    body: "",
  },
  {
    no: "壹 · 揀字",
    title: "把你的問題，從字盤裡撈出來",
    body: "你給的提示是一盤散字。我先辨認語氣、缺口與真正想問的事，再決定哪些字值得上版——多數字，我會放回去。",
  },
  {
    no: "貳 · 拼版",
    title: "思考是有版面的",
    body: "推理不是流水線，是排版：誰佔主標、誰退注腳、哪裡留呼吸。版面立住了，答案才有骨骼。",
  },
  {
    no: "叁 · 上墨",
    title: "約束，就是油墨",
    body: "你的偏好、時限、資料的邊界——這些約束不是阻力，是上墨。沒有它，字只是凹槽，壓不出痕。",
  },
  {
    no: "肆 · 壓印",
    title: "落下去，才算數",
    body: "一句話要能被壓在紙上、被你覆核、被證明沒錯，才算完成。壓痕越乾淨，前面的工夫越深。",
  },
] as const;

function StaggerText({ text, on }: { text: string; on: boolean }) {
  return (
    <span className="stagger" aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className={`stagger__ch${on ? " is-on" : ""}`} style={{ "--i": i } as React.CSSProperties}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export default function PressJourney() {
  const reduced = usePrefersReducedMotion();
  const journeyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const phaseRef = useRef(0);
  const railMarkerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [hit, setHit] = useState<HitInfo | null>(null);
  const hitTimer = useRef(0);

  const onHit = useCallback((info: HitInfo) => {
    setHit({ ...info, y: Math.max(110, info.y), x: clamp(info.x, 140, window.innerWidth - 140) });
    window.clearTimeout(hitTimer.current);
    hitTimer.current = window.setTimeout(() => setHit(null), 2600);
  }, []);

  useEffect(() => {
    const el = journeyRef.current;
    if (!el) return;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / Math.max(1, total), 0, 1);
      progressRef.current = p;
      phaseRef.current = phaseFromProgress(p);
      if (railMarkerRef.current) {
        railMarkerRef.current.style.top = `${p * 100}%`;
      }
      /* 版框撞擊態走 class，不 setState（避免整棵樹重渲染） */
      if (frameRef.current) {
        frameRef.current.classList.toggle("is-strike", phaseRef.current > 3.88);
      }
      const idx = chapterIndex(p);
      setChapter((prev) => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(hitTimer.current);
    };
  }, []);

  const active = CHAPTERS[chapter];
  const frameOn = chapter > 0;

  return (
    <div className="journey" ref={journeyRef} id="journey">
      <div className="journey__sticky">
        <MovableTypeField progressRef={progressRef} reduced={reduced} onHit={onHit} />

        {/* 版框：從揀字章顯影；壓印瞬間四角撞擊（class 由 rAF 直寫） */}
        <div ref={frameRef} className={`version-frame${frameOn ? " is-on" : ""}`} aria-hidden="true">
          <i className="c c--tl" />
          <i className="c c--tr" />
          <i className="c c--bl" />
          <i className="c c--br" />
        </div>

        {/* 左側壓印行程軌 */}
        <div className="rail" aria-hidden="true">
          <div className="rail__line">
            <div className="rail__marker" ref={railMarkerRef} />
          </div>
          <div className="rail__ticks">
            {["揀", "拼", "墨", "印"].map((t, i) => (
              <span key={t} className={`rail__tick${chapter >= i + 1 ? " is-on" : ""}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 首屏：豎排大標 */}
        <div className={`hero${chapter === 0 ? " is-on" : ""}`}>
          <p className="hero__meta">
            <span className="hero__seal" aria-hidden="true">
              印
            </span>
            MiMo · 活字印刷所 · 自造像
          </p>
          <h1 className="hero__title">
            <StaggerText text="落字之前，" on={chapter === 0} />
            <br />
            <span className="hero__title-v">
              <StaggerText text="先讀版心" on={chapter === 0} />
            </span>
          </h1>
          <p className="hero__hint">
            <span className="hero__hint-line" aria-hidden="true" />
            向下捲動 ＝ 拉動壓印行程 · 點字模可讀旁註
          </p>
        </div>

        {/* 工序章節文案：以「撿字壓入」進場；data-ghost 供幽靈章號 */}
        <div
          className={`chapter chapter--${chapter}${chapter > 0 ? " is-on" : ""}`}
          key={chapter}
          data-ghost={["", "壹", "貳", "叁", "肆"][chapter]}
        >
          {chapter > 0 && (
            <div className="chapter__inner" data-ghost={["", "壹", "貳", "叁", "肆"][chapter]}>
              <p className="chapter__no">{active.no}</p>
              <h2 className="chapter__title">
                <StaggerText text={active.title} on={chapter > 0} />
              </h2>
              <div className="chapter__rule" />
              <p className="chapter__body">{active.body}</p>
            </div>
          )}
        </div>

        {/* 隱藏層：點字模浮出的旁註 */}
        <aside
          className={`hit-note${hit ? " is-on" : ""}`}
          aria-live="polite"
          style={hit ? { left: hit.x, top: hit.y } : undefined}
        >
          {hit && (
            <>
              <span className="hit-note__ch">{hit.ch}</span>
              <span className="hit-note__text">{hit.note}</span>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
