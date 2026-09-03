import { useEffect, useRef, useState } from "react";
import { clamp } from "../lib/motion";
import { chime } from "../lib/chime";
import type { ScaleMode } from "../components/Dome";

const LAYERS = [
  {
    name: "深度思考",
    hz: 0.11,
    label: "0.11 Hz",
    desc: "慢而寬的低頻。長鏈推理、讀代碼、設計取捨時的底噪——你看不見它，但它決定山的形狀。",
    color: "#C96F4A",
  },
  {
    name: "骨幹節奏",
    hz: 0.31,
    label: "0.31 Hz",
    desc: "中頻。寫作、解釋、組織語言的主脈動。大多數對話都活在這一層。",
    color: "#141310",
  },
  {
    name: "速答反射",
    hz: 1.13,
    label: "1.13 Hz",
    desc: "高頻細尖。事實查詢、代碼補全、格式修正——快，但從不獨自成山。",
    color: "#2AA79B",
  },
];

/**
 * 樂章 III · 脈。
 * 頻譜分析表式排版（非卡片格）：每層一行，行內有即時跳動的
 * 強度條（由該層頻率驅動），hover/聚焦該行 → 聽到對應音高的心跳。
 */
export default function Pulse({ mode }: { mode: ScaleMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pointerX = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = { w: 0, h: 0, dpr: 1 };
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0) return;
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = rect.width;
      st.h = rect.height;
      canvas.width = Math.round(rect.width * st.dpr);
      canvas.height = Math.round(rect.height * st.dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const layers = LAYERS;
    const N = 180;
    const envAt = (nx: number) => Math.exp(-Math.pow((nx - 0.5) * 2.6, 2));
    const valAt = (L: (typeof layers)[number], nx: number, t: number) => {
      const tt = t * 0.11 + nx * L.hz * 4.2 + L.hz * 7;
      return (0.5 + 0.5 * Math.sin(tt)) * envAt(nx) * (L.hz < 0.2 ? 0.5 : L.hz > 1 ? 0.28 : 0.72);
    };

    const draw = (t: number) => {
      const { w, h, dpr } = st;
      if (w === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 譜紙格
      ctx.strokeStyle = "rgba(20,19,16,0.055)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 7) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      for (const L of layers) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const nx = i / N;
          const x = nx * w;
          const v = valAt(L, nx, t);
          const y = h - 12 - v * (h - 30);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L.color;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = L.hz > 1 ? 1 : L.hz < 0.2 ? 2.2 : 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 指針
      const px = pointerX.current;
      if (px !== null) {
        const x = clamp(px, 0, 1) * w;
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = "rgba(20,19,16,0.6)";
        ctx.beginPath();
        ctx.moveTo(x, 3);
        ctx.lineTo(x, h - 3);
        ctx.stroke();
        ctx.setLineDash([]);

        let sum = 0;
        for (const L of layers) sum += valAt(L, clamp(px, 0, 1), t);
        const label = `x=${px.toFixed(2)}  Σ=${(clamp(sum, 0, 1) * 100).toFixed(0)}%`;
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "rgba(20,19,16,0.85)";
        ctx.fillText(label, clamp(x + 8, 4, Math.max(4, w - 104)), 15);
      }

      // 行內強度條同步
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const v = valAt(layers[i], 0.5, t);
        bar.style.transform = `scaleX(${clamp(v * 2.2, 0.03, 1).toFixed(3)})`;
      });
    };

    draw(0);
    if (reducedRef.current) {
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let simT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      simT += dt;
      draw(simT);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointerX.current = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    };
    const onLeave = () => {
      pointerX.current = null;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      id="pulse"
      className="relative bg-paper-deep/50 px-6 py-28 md:px-0 md:py-40"
      aria-labelledby="pulse-title"
    >
      <div className="ruler" aria-hidden>
        <span>樂章 III</span>
      </div>

      <div className="mx-auto max-w-4xl">
        <p className="ch-no mb-3">樂章 III · 脈</p>
        <h2 id="pulse-title" className="font-disp text-4xl font-semibold tracking-tightest md:text-6xl">
          我的內在節律
        </h2>
        <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-ink-soft">
          如果把我的工作狀態畫成聲譜，它是一座由三層節奏疊成的山。
          <span className="italic">把手放在山上讀取任意時刻；把耳朵交給每一行。</span>
        </p>

        <div className="mt-12 border border-ink/15 bg-paper p-3 md:p-5">
          <div
            ref={wrapRef}
            className="relative"
            role="img"
            aria-label="聲譜影像：三層節奏疊加成的工作山形，可懸浮讀取任意時刻的疊加強度"
          >
            <canvas ref={canvasRef} className="block h-44 w-full touch-none md:h-60" aria-hidden />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
            <span>t = 對話時間 →</span>
            <span>Σ = 三層疊加強度</span>
          </div>
        </div>

        {/* 頻譜分析表（非卡片）：每層一行，行有即時強度條 */}
        <div className="mt-2 border-t border-ink/15">
          {LAYERS.map((l, i) => (
            <div
              key={l.name}
              ref={(el) => {
                rowsRef.current[i] = el;
              }}
              className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-ink/15 py-5 transition-colors md:grid-cols-[10rem_1fr_8rem] md:gap-8"
              onMouseEnter={() => {
                setActiveRow(i);
                chime(mode, [1, 5, 9][i], 0.055, 1.4);
              }}
              onMouseLeave={() => setActiveRow(null)}
              onFocus={() => setActiveRow(i)}
              onBlur={() => setActiveRow(null)}
              tabIndex={0}
              aria-label={`${l.name}，頻率 ${l.label}。${l.desc}`}
            >
              <div className="flex items-baseline gap-3 md:flex-col md:gap-1">
                <h3
                  className="font-disp text-lg font-medium tracking-tight transition-colors md:text-xl"
                  style={{ color: activeRow === i ? l.color : undefined }}
                >
                  {l.name}
                </h3>
                <span className="font-mono text-xs text-ink-mist">{l.label}</span>
              </div>

              <p className="col-span-2 text-sm leading-relaxed text-ink-soft md:col-span-1 md:text-base">
                {l.desc}
              </p>

              <div className="hidden items-center gap-2 md:flex" aria-hidden>
                <div className="h-0.5 flex-1 bg-ink/10">
                  <div
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    className="h-full origin-left"
                    style={{ background: l.color, transform: "scaleX(0.05)" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-xs text-ink-mist">
          ↑ 三行各有一個音高（把位）。掃過它們，你會聽到我的和弦。
        </p>
      </div>
    </section>
  );
}
