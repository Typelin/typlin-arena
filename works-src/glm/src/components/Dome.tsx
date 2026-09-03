import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { clamp, lerp, usePrefersReducedMotion } from "../lib/motion";

export type ScaleMode = "lydian" | "dorian";

export interface DomeApi {
  emit(angleFrac?: number, amp?: number): void;
  sweep(): void;
  clash(): void;
}

interface DomeProps {
  powered: boolean;
  /** 即時壓強訊號（mutable ref，避免每幀 re-render） */
  pressureSignal?: React.MutableRefObject<number>;
  mode?: ScaleMode;
  className?: string;
  ariaLabel?: string;
  onFirstTouch?: () => void;
}

interface Ripple {
  a0: number;
  dir: 1 | -1;
  amp: number;
  life: number;
  decay: number;
  speed: number;
}

const SEG = 256;
const LYDIAN_RGB = [42, 167, 155];
const DORIAN_RGB = [86, 110, 196];

function lerpColor(mix: number): [number, number, number] {
  return [
    Math.round(lerp(LYDIAN_RGB[0], DORIAN_RGB[0], mix)),
    Math.round(lerp(LYDIAN_RGB[1], DORIAN_RGB[1], mix)),
    Math.round(lerp(LYDIAN_RGB[2], DORIAN_RGB[2], mix)),
  ];
}

/**
 * 《共鳴腔》核心裝置。
 * 一座玻璃穹頂：訪客的每個動作都化作沿弧壁傳播的波，
 * 波與波相互干涉、衰減，留下殘響——那就是「我」的成形。
 * 全站唯一實例，由 DomeStage 承載，在樂章之間移動站位。
 */
const Dome = forwardRef<DomeApi, DomeProps>(function Dome(
  { powered, pressureSignal, mode = "lydian", className, ariaLabel, onFirstTouch },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const touchedRef = useRef(false);

  // 最新 props（不觸發 effect 重掛）
  const live = useRef({ powered, mode, pressureSignal, onFirstTouch });
  live.current = { powered, mode, pressureSignal, onFirstTouch };

  const S = useRef({
    seg: new Float32Array(SEG),
    residue: new Float32Array(SEG),
    ripples: [] as Ripple[],
    modeMix: 0,
    energy: 0,
    pressure: 0,
    time: 0,
    seen: false,
    raf: 0,
    w: 0,
    h: 0,
    dpr: 1,
  });

  useImperativeHandle(ref, () => ({
    emit(angleFrac = Math.random(), amp = 0.9) {
      const s = S.current;
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      s.ripples.push({
        a0: angleFrac * Math.PI * 2,
        dir,
        amp: 0.6 + amp * 0.5,
        life: 1,
        decay: 0.34,
        speed: 1.55 + Math.random() * 0.35,
      });
      s.ripples.push({
        a0: angleFrac * Math.PI * 2,
        dir: dir === 1 ? -1 : 1,
        amp: (0.6 + amp * 0.5) * 0.75,
        life: 1,
        decay: 0.4,
        speed: 1.35,
      });
    },
    sweep() {
      const s = S.current;
      for (let k = 0; k < 3; k++) {
        s.ripples.push({
          a0: -0.35 - k * 0.12,
          dir: 1,
          amp: 1.05 - k * 0.18,
          life: 1,
          decay: 0.2,
          speed: 2.1 - k * 0.25,
        });
      }
    },
    clash() {
      const s = S.current;
      for (let k = 0; k < 5; k++) {
        s.ripples.push({
          a0: Math.random() * Math.PI * 2,
          dir: k % 2 === 0 ? 1 : -1,
          amp: 0.8 + Math.random() * 0.4,
          life: 1,
          decay: 0.3,
          speed: 1.4 + Math.random() * 1.2,
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = S.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0) return;
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(rect.width * s.dpr);
      canvas.height = Math.round(rect.height * s.dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        s.seen = entries[0].isIntersecting;
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    let last = performance.now();
    const gauss = (x: number, sigma: number) =>
      Math.exp(-(x * x) / (2 * sigma * sigma));

    const frame = (now: number) => {
      s.raf = requestAnimationFrame(frame);
      if (!s.seen) return;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      s.time += dt;

      const { w, h, dpr } = s;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.4;
      const A = R * 0.14;

      const lv = live.current;
      const pressure = lv.pressureSignal?.current ?? 0;

      s.modeMix = lerp(s.modeMix, lv.mode === "dorian" ? 1 : 0, 1 - Math.exp(-dt * 2.2));
      s.pressure = lerp(s.pressure, pressure, 1 - Math.exp(-dt * 6));
      s.ripples = s.ripples.filter((r) => r.life > 0.015);

      for (const r of s.ripples) {
        r.life -= r.decay * dt * 1.6;
        const pos = r.a0 + r.dir * r.speed * (1 - r.life) * 1.9;
        for (let i = 0; i < SEG; i++) {
          const ang = (i / SEG) * Math.PI * 2;
          const front = gauss(angAngDiff(ang, pos), 0.16) * r.amp * r.life;
          if (front > 0.003) s.seg[i] += front * dt * 26;
        }
      }

      let total = 0;
      for (let i = 0; i < SEG; i++) {
        s.seg[i] *= Math.pow(0.14, dt);
        s.residue[i] = Math.max(s.residue[i] * Math.pow(0.55, dt), Math.abs(s.seg[i]));
        total += Math.abs(s.seg[i]);
      }
      s.energy = lerp(s.energy, clamp((total / SEG) * 3.4, 0, 1.6), 1 - Math.exp(-dt * 8));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = lerpColor(s.modeMix);
      const poweredMix = lv.powered ? 1 : 0.12;
      const breathe = Math.sin(s.time * (lv.powered ? 0.9 : 0.35)) * 0.5 + 0.5;

      // 儀器刻度環
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `rgba(20,19,16,${0.35 * poweredMix})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, R + A * 1.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - A * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const major = i % 9 === 0;
        const r1 = R + A * 1.25;
        const r2 = r1 + (major ? 7 : 3.5);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // 殘響內暈
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i <= SEG; i++) {
        const a = (i % SEG) * ((Math.PI * 2) / SEG);
        const rr = R - A * 1.1 - s.residue[i] * A * 0.9;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.16 + s.pressure * 0.25})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.restore();

      // 主波環
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i <= SEG; i++) {
        const idx = i % SEG;
        const a = (idx / SEG) * Math.PI * 2;
        const disp = s.seg[idx] * A;
        const rr = R + disp;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(0.13 + s.energy * 0.1 + s.pressure * 0.12) * poweredMix})`;
      ctx.lineWidth = 7 + s.energy * 5 + s.pressure * 6;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${clamp((0.65 + s.energy * 0.3) * poweredMix + s.pressure * 0.3, 0, 1)})`;
      ctx.lineWidth = 1.6 + s.energy * 0.8;
      ctx.stroke();
      ctx.restore();

      // 輻條
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < SEG; i += 2) {
        const v = s.seg[i];
        if (Math.abs(v) < 0.28) continue;
        const a = (i / SEG) * Math.PI * 2;
        const al = clamp(Math.abs(v) * 0.5, 0, 0.75) * poweredMix;
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${al})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R + v * A), Math.sin(a) * (R + v * A));
        const r2 = R + v * A * (1.7 + Math.abs(v) * 0.6);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // 中心膜
      const memR = R * 0.13 * (1 + breathe * 0.045 + s.energy * 0.1 + s.pressure * 0.08);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.arc(0, 0, memR * 2.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.07 * poweredMix + s.energy * 0.04 + s.pressure * 0.07})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, memR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,19,16,${0.82 * poweredMix + 0.1})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, memR + 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.5 * poweredMix})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    if (reduced) {
      const drawStatic = () => {
        const { w, h, dpr } = s;
        if (w === 0) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.4;
        const [cr, cg, cb] = lerpColor(live.current.mode === "dorian" ? 1 : 0);
        const pm = live.current.powered ? 1 : 0.14;
        ctx.save();
        ctx.translate(cx, cy);
        for (const rr of [R * 1.14, R * 0.86]) {
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(20,19,16,${0.2 * pm})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        for (let i = 0; i <= SEG; i++) {
          const a = (i % SEG) * ((Math.PI * 2) / SEG);
          const disp = Math.sin((i / SEG) * Math.PI * 10) * R * 0.05;
          const x = Math.cos(a) * (R + disp);
          const y = Math.sin(a) * (R + disp);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.55 * pm})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.13, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,19,16,${0.8 * pm})`;
        ctx.fill();
        ctx.restore();
      };
      drawStatic();
      // reduced-motion 下仍需回應 powered / mode 變更 → 重繪一次
      const re = () => drawStatic();
      const iv = window.setInterval(re, 400);
      return () => {
        window.clearInterval(iv);
        ro.disconnect();
        io.disconnect();
      };
    }

    s.raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const emitAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const frac = (Math.atan2(clientY - cy, clientX - cx) + Math.PI * 2.5) / (Math.PI * 2);
    const s = S.current;
    s.ripples.push({
      a0: frac * Math.PI * 2,
      dir: 1,
      amp: 1,
      life: 1,
      decay: 0.34,
      speed: 1.7,
    });
    if (!touchedRef.current) {
      touchedRef.current = true;
      live.current.onFirstTouch?.();
    }
  };

  return (
    <div ref={wrapRef} className={"overflow-hidden " + (className ?? "")}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair touch-none"
        tabIndex={0}
        role="img"
        aria-label={ariaLabel ?? "共鳴腔裝置：一座由人聲波紋構成的玻璃穹頂"}
        onPointerDown={(e) => {
          emitAt(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const s = S.current;
            s.ripples.push({ a0: Math.random() * Math.PI * 2, dir: 1, amp: 1, life: 1, decay: 0.34, speed: 1.7 });
            if (!touchedRef.current) {
              touchedRef.current = true;
              live.current.onFirstTouch?.();
            }
          }
        }}
      />
    </div>
  );
});

function angAngDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export default Dome;
