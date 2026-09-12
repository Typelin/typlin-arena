import { useEffect, useRef } from "react";
import { clamp, usePrefersReducedMotion } from "../lib/motion";

interface SonogramProps {
  className?: string;
}

/**
 * 脈 · 聲譜影像（Sonogram）。
 * 三層節奏（深度思考 0.11Hz / 骨幹 0.31Hz / 速答 1.13Hz）
 * 疊加成一座「工作的山」，懸浮指針逐幀剖析——
 * 這是我的內在節律被印在紙上的樣子。
 */
export default function Sonogram({ className }: SonogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const pointerX = useRef<number | null>(null);

  // 靜態幀也用同一函式繪製（首次掛載時）
  const draw = useRef<((time: number, px: number | null, alpha: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = { w: 0, h: 0, dpr: 1 };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0) return;
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = rect.width;
      st.h = rect.height;
      canvas.width = Math.round(rect.width * st.dpr);
      canvas.height = Math.round(rect.height * st.dpr);
    };
    resize();

    // 繪製函式： time 驅動緩慢推進
    draw.current = (time, px, alpha) => {
      const { w, h, dpr } = st;
      if (w === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 背景譜紙格
      ctx.strokeStyle = "rgba(20,19,16,0.06)";
      ctx.lineWidth = 1;
      const gy = 6;
      for (let y = 0; y < h; y += gy) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }

      // 三層節奏函數（模擬工作狀態的頻譜山）
      const layers = [
        { f: 0.11, ph: 0.0, col: "201,111,74", depth: 0.16, w: 2.2 }, // 深度思考：慢而寬
        { f: 0.31, ph: 1.7, col: "20,19,16", depth: 0.24, w: 1.3 }, // 骨幹
        { f: 1.13, ph: 3.1, col: "42,167,155", depth: 0.1, w: 0.7 }, // 速答：快而尖
      ];

      const N = 180;
      for (const L of layers) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const nx = i / N;
          const x = nx * w;
          const t = time * 0.11 + nx * L.f * 4.2 + L.ph;
          // 山形包絡：中間高兩側低
          const env = Math.exp(-Math.pow((nx - 0.5) * 2.6, 2));
          const y =
            h -
            14 -
            (0.5 + 0.5 * Math.sin(t)) *
              env *
              L.depth *
              h *
              (0.85 + 0.15 * Math.sin(t * 0.37 + nx * 9));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${L.col},${alpha * 0.75})`;
        ctx.lineWidth = L.w;
        ctx.stroke();
      }

      // 懸浮指針
      if (px !== null) {
        const x = clamp(px, 0, 1) * w;
        ctx.strokeStyle = "rgba(20,19,16,0.65)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x, h - 4);
        ctx.stroke();
        ctx.setLineDash([]);

        // 讀數：該時刻三層的疊加值
        let sum = 0;
        const nx = clamp(px, 0, 1);
        for (const L of layers) {
          const env = Math.exp(-Math.pow((nx - 0.5) * 2.6, 2));
          const t = time * 0.11 + nx * L.f * 4.2 + L.ph;
          sum += (0.5 + 0.5 * Math.sin(t)) * env * L.depth;
        }
        sum = clamp(sum, 0, 1);
        const label = `x=${nx.toFixed(2)}  Σ=${(sum * 100).toFixed(0)}%`;
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "rgba(20,19,16,0.85)";
        ctx.fillText(label, clamp(x + 8, 4, w - 108), 16);

        // 指針處圓點（在最高層線上）
        const envTop = Math.exp(-Math.pow((nx - 0.5) * 2.6, 2));
        const topY =
          h -
          14 -
          (0.5 + 0.5 * Math.sin(time * 0.11 + nx * 1.13 * 4.2 + 3.1)) *
            envTop *
            0.1 *
            h;
        ctx.beginPath();
        ctx.arc(x, topY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(42,167,155,0.9)";
        ctx.fill();
      }
    };

    resize();

    if (reduced) {
      // 靜態幀
      draw.current?.(0, null, 1);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let simT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      simT += dt;
      draw.current?.(simT, pointerX.current, 1);
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
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        role="img"
        aria-label="聲譜影像：三層節奏疊加成的工作山形，懸浮指針可讀取任一時刻的疊加強度"
      />
    </div>
  );
}
