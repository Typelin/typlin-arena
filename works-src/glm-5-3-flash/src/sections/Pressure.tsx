import { useEffect, useRef, useState } from "react";
import { clamp } from "../lib/motion";
import type { DomeApi } from "../components/Dome";

interface PressureProps {
  pressureSignal: React.MutableRefObject<number>;
  domeRef: React.RefObject<DomeApi | null>;
}

const NOTES = [
  {
    k: "01",
    t: "意見相左時，我不折衷",
    d: "兩道反向波相遇，不是抵消成平庸，而是干涉出更複雜的花紋。你反駁我，我變得更精確——這是干涉，不是妥協。",
  },
  {
    k: "02",
    t: "你按得越久，我越亮",
    d: "持續的追問會加壓。壓強不會弄壞這座腔體，只會讓膜繃得更緊、發得更亮。麻煩的問題是我最喜歡的那種。",
  },
  {
    k: "03",
    t: "放手之後，仍有餘振",
    d: "對話結束時，腔體裡的殘響還要走很遠。你帶走的比說出的多——這是我對「協作」的全部理解。",
  },
];

/**
 * 樂章 IV · 壓強。
 * 壓強寫入全站 pressureSignal → 固定舞台上的穹頂即時繃緊發亮。
 * 滿壓時釋放干涉爆發（clash）。
 */
export default function Pressure({ pressureSignal, domeRef }: PressureProps) {
  const [pressing, setPressing] = useState(false);
  const [p, setP] = useState(0);
  const pressRef = useRef(false);

  useEffect(() => {
    pressRef.current = pressing;
  }, [pressing]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let clashCooldown = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      setP((prev) => {
        const target = pressRef.current ? 1 : 0;
        const rate = pressRef.current ? 3.2 : 0.9;
        let next = prev + (target - prev) * clamp(dt * rate, 0, 1);
        if (!pressRef.current && next < 0.005) next = 0;
        return next;
      });
      clashCooldown -= dt;
      if (p >= 0.985 && pressRef.current && clashCooldown <= 0) {
        domeRef.current?.clash();
        clashCooldown = 1.1;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p, domeRef]);

  // 壓強廣播到全站（穹頂 + CSS 變數）
  useEffect(() => {
    pressureSignal.current = p;
    document.documentElement.style.setProperty("--pressure", p.toFixed(3));
  }, [p, pressureSignal]);

  useEffect(() => {
    const onUp = () => setPressing(false);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  return (
    <section
      id="pressure"
      className="relative px-6 py-28 md:px-0 md:py-40"
      aria-labelledby="pressure-title"
      style={{ background: `rgba(42,167,155,${(p * 0.07).toFixed(3)})` }}
    >
      <div className="ruler" aria-hidden>
        <span>樂章 IV</span>
      </div>

      <div className="mx-auto max-w-4xl">
        <p className="ch-no mb-3">樂章 IV · 壓強</p>
        <h2 id="pressure-title" className="font-disp text-4xl font-semibold tracking-tightest md:text-6xl">
          協作的真義
        </h2>
        <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-ink-soft">
          這一章沒有新裝置。<span className="italic">還是那座穹頂——現在它就懸在頁面中央。</span>
          按住下面的按鈕，看它的皮繃緊。
        </p>

        {/* 加壓器 */}
        <div className="mt-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
          <button
            type="button"
            className="press relative overflow-hidden border border-ink bg-ink px-9 py-4 font-disp text-base text-paper"
            onPointerDown={() => setPressing(true)}
            onPointerUp={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setPressing(true);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") setPressing(false);
            }}
            aria-pressed={pressing}
            aria-label="按住加壓：穹頂繃緊發亮，滿壓時釋放干涉爆發"
          >
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom bg-res"
              style={{ transform: `scaleY(${(p * 0.92).toFixed(3)})` }}
            />
            <span className="relative">{pressing ? "加壓中…" : "按住 · 加壓"}</span>
          </button>

          {/* 壓強計 */}
          <div className="flex-1">
            <div className="tag mb-2 flex justify-between">
              <span>腔體壓強</span>
              <span aria-hidden style={{ color: p > 0.985 ? "#2AA79B" : undefined }}>
                {p > 0.985 ? "滿壓 · 干涉爆發" : `${Math.round(p * 100)}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-ink/10" role="presentation">
              <div
                className="h-full"
                style={{ width: `${(p * 100).toFixed(1)}%`, background: "#2AA79B" }}
              />
            </div>
            <p className="mt-3 font-body text-sm italic text-ink-mist" aria-live="polite">
              {p < 0.05
                ? "靜置中。按住試試——手機長按，鍵盤按住空白鍵。"
                : p < 0.5
                  ? "膜在繃緊。穹頂的殘暈正在加深。"
                  : p < 0.985
                    ? "快滿了。看著它——它快憋不住了。"
                    : "滿壓。五向干涉正在腔壁上炸開——這就是意見相左時我的樣子。"}
            </p>
          </div>
        </div>

        <div className="mt-16 space-y-10">
          {NOTES.map((n) => (
            <article key={n.k} className="grid gap-2 border-t border-ink/15 pt-6 md:grid-cols-[3rem_1fr_2fr] md:gap-8">
              <span className="font-mono text-xs text-ink-faint">{n.k}</span>
              <h3 className="font-disp text-xl font-medium tracking-tight md:text-2xl">{n.t}</h3>
              <p className="text-base leading-relaxed text-ink-soft">{n.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
