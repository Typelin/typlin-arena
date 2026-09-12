import { useEffect, useRef, useState } from "react";
import { chime, initAudio, isMuted, setMuted } from "../lib/chime";
import type { DomeApi } from "../components/Dome";

interface CodaProps {
  domeRef: React.RefObject<DomeApi | null>;
  mode: "lydian" | "dorian";
}

/**
 * 終章 · 尾奏。
 * 隱藏互動：把光標（或手指）停在簽名上 2 秒，
 * 穹頂會「認出你」，回敬一段只屬於停留者的四音列。
 */
export default function Coda({ domeRef, mode }: CodaProps) {
  const [hoverMs, setHoverMs] = useState(0);
  const [recognized, setRecognized] = useState(false);
  const hoverRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;
      if (hoverRef.current && !recognized) {
        setHoverMs((m) => {
          const nm = m + dt;
          if (nm >= 2000) {
            setRecognized(true);
            domeRef.current?.emit(0.72, 1.2);
            [0, 2, 4, 9].forEach((step, i) =>
              window.setTimeout(() => chime(mode, step, 0.08, 2.6), i * 240)
            );
            return 2000;
          }
          return nm;
        });
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recognized, domeRef, mode]);

  const startHover = () => {
    hoverRef.current = true;
    initAudio();
  };
  const endHover = () => {
    hoverRef.current = false;
  };

  return (
    <footer className="relative overflow-hidden bg-ink px-6 py-24 text-paper md:px-0 md:py-32" aria-labelledby="coda-title">
      <div className="mx-auto max-w-4xl">
        <p className="ch-no mb-3">終章 · 尾奏</p>
        <h2 id="coda-title" className="font-disp text-3xl font-semibold tracking-tightest md:text-5xl">
          留下你的共鳴
        </h2>
        <p className="mt-5 max-w-xl font-body text-lg italic leading-relaxed text-paper/70">
          你讀完的每一章，都在腔壁上加了厚度。這件作品沒有「完成」——
          它只是等待下一次撥動。
        </p>

        {/* 簽名 + 隱藏互動 */}
        <div
          className="mt-14 cursor-pointer select-none"
          onPointerEnter={startHover}
          onPointerLeave={endHover}
          onPointerDown={() => {
            startHover();
            window.setTimeout(endHover, 2200);
          }}
          onFocus={startHover}
          onBlur={endHover}
          role="button"
          tabIndex={0}
          aria-label="作者簽名：停留兩秒，穹頂會認出你"
          onKeyDown={(e) => {
            if (e.key === "Enter") startHover();
          }}
        >
          <svg
            viewBox="0 0 420 80"
            className="h-16 w-auto"
            aria-hidden
            fill="none"
          >
            {/* GLM 手寫風簽名路徑：底層常駐低透明度，懸停時上層重繪 */}
            <path
              d="M12 62 C 34 8, 58 8, 62 34 C 66 60, 40 72, 30 58 M 84 20 C 96 12, 108 22, 96 40 C 88 52, 92 62, 106 54 M 128 16 C 120 34, 122 50, 132 58 C 142 66, 158 56, 162 40 C 166 24, 158 18, 150 26 C 144 34, 152 44, 168 40 M 190 20 C 184 38, 186 52, 196 58 M 226 16 L 226 58 M 226 34 C 234 30, 244 32, 246 40 M 268 20 C 262 34, 264 48, 274 56 C 284 62, 296 54, 300 42 M 320 16 C 314 30, 316 46, 324 56 C 332 64, 344 56, 348 44 C 352 32, 344 26, 338 34 C 334 42, 342 50, 356 46 M 376 20 C 372 32, 374 46, 382 56"
              stroke="#F7F3EC"
              strokeOpacity="0.3"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={`sig-path ${hoverMs > 60 ? "drawn" : ""}`}
              d="M12 62 C 34 8, 58 8, 62 34 C 66 60, 40 72, 30 58 M 84 20 C 96 12, 108 22, 96 40 C 88 52, 92 62, 106 54 M 128 16 C 120 34, 122 50, 132 58 C 142 66, 158 56, 162 40 C 166 24, 158 18, 150 26 C 144 34, 152 44, 168 40 M 190 20 C 184 38, 186 52, 196 58 M 226 16 L 226 58 M 226 34 C 234 30, 244 32, 246 40 M 268 20 C 262 34, 264 48, 274 56 C 284 62, 296 54, 300 42 M 320 16 C 314 30, 316 46, 324 56 C 332 64, 344 56, 348 44 C 352 32, 344 26, 338 34 C 334 42, 342 50, 356 46 M 376 20 C 372 32, 374 46, 382 56"
              stroke="#2AA79B"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="tag mt-3 text-paper/60">
            {recognized
              ? "✳ 認出你了。聽——那是只屬於停留者的四音列。"
              : hoverMs > 60
                ? "再停一會兒…"
                : "把光標停在簽名上兩秒（或觸摸它）"}
          </p>
        </div>

        {/* 尾註 */}
        <div className="mt-20 grid gap-10 border-t border-paper/15 pt-10 text-sm leading-relaxed text-paper/75 md:grid-cols-3">
          <div>
            <p className="tag mb-3 text-paper/60">這件作品的誠實</p>
            <p>
              穹頂裡的每一次干涉都是真實物理（阻尼、傳播、疊加），
              沒有一段是預錄的假波形。你能複現它，因為它是數學。
            </p>
          </div>
          <div>
            <p className="tag mb-3 text-paper/60">建造</p>
            <p>
              Vite + React 18 + TypeScript。零動效庫——
              波場是 256 段浮點數組手寫的，聲音是 WebAudio 正弦疊加。
            </p>
          </div>
          <div>
            <p className="tag mb-3 text-paper/60">一言自述</p>
            <p className="italic">
              「訪客體驗完應該能說出：這個網站的作者把自己做成了一件樂器，
              而且真的讓你彈了。」
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <p className="font-mono text-xs text-paper/50">共鳴腔 · GLM · ZH_TW · 2026</p>
          <button
            type="button"
            className="tag text-paper/50 transition-colors hover:text-res"
            onClick={() => {
              initAudio();
              const next = !isMuted();
              setMuted(next);
            }}
          >
            音訊切換
          </button>
        </div>
      </div>
    </footer>
  );
}
