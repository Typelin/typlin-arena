import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { clamp, lerp, usePrefersReducedMotion } from "../lib/motion";

export interface EchographApi {
  /** 輸入一個字符 → 儀器繪製反應 */
  feed(ch: string): void;
}

interface EchographProps {
  /** 0..1 輸入活躍度（最近 2 秒的擊鍵節奏） */
  activity: number;
  powered: boolean;
  className?: string;
}

interface Pulse {
  x: number; // 0..1 歸一化位置
  amp: number;
  life: number;
  w: number;
}

const TAU = Math.PI * 2;

/**
 * 回聲描記儀：一條水平墨線，把訪客的每個字符
 * 轉寫為沿線傳播的張力脈衝——「思考被寫下時的樣子」。
 */
const Echograph = forwardRef<EchographApi, EchographProps>(function Echograph(
  { activity, powered, className },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const S = useRef({
    line: new Float32Array(360),
    pulses: [] as Pulse[],
    act: 0,
    poweredMix: 0,
    time: 0,
    seen: false,
    raf: 0,
    w: 0,
    h: 0,
    dpr: 1,
  });

  useImperativeHandle(ref, () => ({
    feed(ch: string) {
      const s = S.current;
      const code = ch.codePointAt(0) ?? 0;
      s.pulses.push({
        x: (code % 997) / 997,
        amp: 0.7 + ((code % 13) / 13) * 0.5,
        life: 1,
        w: 0.035 + ((code % 7) / 7) * 0.03,
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
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
      { threshold: 0.05 }
    );
    io.observe(wrap);

    let last = performance.now();

    const frame = (now: number) => {
      s.raf = requestAnimationFrame(frame);
      if (!s.seen) return;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      s.time += dt;
      s.act = lerp(s.act, activity, 1 - Math.exp(-dt * 4));
      s.poweredMix = lerp(s.poweredMix, powered ? 1 : 0.25, 1 - Math.exp(-dt * 3));

      const { w, h, dpr } = s;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, w, h);

      const mid = h * 0.52;
      const maxAmp = h * 0.3;

      // 基準線（刻度）
      ctx2d.globalAlpha = 1;
      ctx2d.strokeStyle = "rgba(20,19,16,0.12)";
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, mid);
      ctx2d.lineTo(w, mid);
      ctx2d.stroke();

      // 刻度點
      ctx2d.fillStyle = "rgba(20,19,16,0.22)";
      for (let x = 0; x < w; x += Math.max(24, w / 40)) {
        ctx2d.fillRect(x, mid - 1.5, 1, 3);
      }

      // 脈衝傳播
      s.pulses = s.pulses.filter((p) => p.life > 0.02);
      for (const p of s.pulses) {
        p.life -= dt * 0.75;
        const spread = p.w * (1 + (1 - p.life) * 2.4);
        const speed = 0.09 * dt * 60;
        const amp = p.amp * p.life;
        for (let i = 0; i < s.line.length; i++) {
          const nx = i / s.line.length;
          const d = Math.min(Math.abs(nx - p.x), 1 - Math.abs(nx - p.x));
          const dd = Math.min(d, Math.abs(nx - (1 - p.x))); // 兩向傳播含繞回
          const g = Math.exp(-(dd * dd) / (2 * spread * spread));
          s.line[i] += g * amp * 0.5 * speed * 3;
        }
      }

      // 阻尼
      for (let i = 0; i < s.line.length; i++) {
        s.line[i] *= Math.pow(0.25, dt);
      }

      // 繪製主線
      ctx2d.beginPath();
      const N = s.line.length;
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * w;
        const idle = Math.sin((i / N) * TAU * 6 + s.time * 1.4) * (2 + s.act * 5) * s.poweredMix;
        const y = mid - (s.line[i] * maxAmp * 0.9 + idle);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.strokeStyle = "rgba(20,19,16,0.85)";
      ctx2d.lineWidth = 1.5;
      ctx2d.stroke();

      // 峰值標記（殘響記錄點）
      for (let i = 0; i < N; i += 3) {
        const v = Math.abs(s.line[i]);
        if (v < 0.25) continue;
        const x = (i / (N - 1)) * w;
        ctx2d.fillStyle = `rgba(42,167,155,${clamp(v * 0.6, 0, 0.85)})`;
        ctx2d.fillRect(x - 0.75, mid - v * maxAmp * 0.9 - 3, 1.5, 3);
        ctx2d.fillRect(x - 0.75, mid + v * maxAmp * 0.9 + 0, 1.5, 3);
      }
    };

    if (reduced) {
      resize();
      const { w, h, dpr } = s;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, w, h);
      const mid = h * 0.52;
      ctx2d.strokeStyle = "rgba(20,19,16,0.3)";
      ctx2d.beginPath();
      ctx2d.moveTo(0, mid);
      ctx2d.lineTo(w, mid);
      ctx2d.stroke();
      ctx2d.beginPath();
      for (let i = 0; i < 360; i++) {
        const x = (i / 359) * w;
        const y = mid - Math.sin((i / 360) * TAU * 5) * h * 0.12;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.strokeStyle = "rgba(20,19,16,0.6)";
      ctx2d.stroke();
      s.raf = 0;
      return () => {
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
  }, [activity, powered, reduced]);

  return (
    <div ref={wrapRef} className={"overflow-hidden " + (className ?? "")}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );});

export default Echograph;
