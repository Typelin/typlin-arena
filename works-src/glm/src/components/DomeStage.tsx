import { useEffect, useRef } from "react";
import Dome, { type DomeApi } from "./Dome";
import { clamp } from "../lib/motion";

/**
 * 全站唯一穹頂的「舞台」：
 * 穹頂不再屬於首屏，而是 fixed 懸浮於頁面右側，
 * 依滾動進度在三個站位之間連續移動與變形——
 *   站位 A（首屏）：中央，全尺寸，主角
 *   站位 B（中段樂章）：右緣縮小側立，像樂池裡的獨奏者
 *   站位 C（壓強章）：偏中、繃緊，回應壓強訊號
 * 這是「概念貫穿」的修正式：裝置永遠在場，只是換位呼吸。
 */
export default function DomeStage({
  domeRef,
  powered,
  pressureSignal,
  mode,
  onFirstTouch,
}: {
  domeRef: React.RefObject<DomeApi | null>;
  powered: boolean;
  pressureSignal: React.MutableRefObject<number>;
  mode: "lydian" | "dorian";
  onFirstTouch: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0.5, y: 0.5, scale: 1, alpha: 1 });

  useEffect(() => {
    const el = stageRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    let raf = 0;
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = (e: MediaQueryListEvent) => {
      reduced = e.matches;
    };
    mq.addEventListener("change", onMq);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight - vh;
      const sy = docH > 0 ? clamp(window.scrollY / docH, 0, 1) : 0;

      // 站位關鍵影格（滾動進度 → 位置/尺寸/透明度）
      // 0.00 首屏中央 | 0.22 開始退位 | 0.30-0.62 右緣側立 | 0.66-0.85 壓強偏中 | 0.9+ 收暗
      const keyframes = [
        { p: 0.0, x: 0.5, y: 0.52, s: 1.0, a: 1 },
        { p: 0.16, x: 0.5, y: 0.5, s: 0.92, a: 1 },
        { p: 0.3, x: 0.78, y: 0.44, s: 0.42, a: 0.85 },
        { p: 0.52, x: 0.8, y: 0.5, s: 0.38, a: 0.8 },
        { p: 0.68, x: 0.5, y: 0.5, s: 0.78, a: 1 },
        { p: 0.84, x: 0.5, y: 0.5, s: 0.74, a: 0.9 },
        { p: 0.95, x: 0.5, y: 0.56, s: 0.6, a: 0.07 },
      ];

      let k0 = keyframes[0];
      let k1 = keyframes[keyframes.length - 1];
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (sy >= keyframes[i].p && sy <= keyframes[i + 1].p) {
          k0 = keyframes[i];
          k1 = keyframes[i + 1];
          break;
        }
      }
      if (sy > keyframes[keyframes.length - 1].p) {
        k0 = k1 = keyframes[keyframes.length - 1];
      }
      const span = k1.p - k0.p;
      const t = span > 0 ? clamp((sy - k0.p) / span, 0, 1) : 0;
      // smoothstep
      const te = t * t * (3 - 2 * t);

      const tx = k0.x + (k1.x - k0.x) * te;
      const ty = k0.y + (k1.y - k0.y) * te;
      const ts = k0.s + (k1.s - k0.s) * te;
      const ta = k0.a + (k1.a - k0.a) * te;

      const st = state.current;
      // 手機：永遠置中偏上、縮小（避免遮內容）
      const isNarrow = window.innerWidth < 768;
      const fx = isNarrow ? 0.5 : tx;
      const fy = isNarrow ? 0.34 : ty;
      const fs = isNarrow ? Math.min(ts, 0.5) : ts;
      const fa = isNarrow ? Math.min(ta, sy < 0.14 ? 1 : 0.34) : ta;

      // 平滑追蹤（物理感）
      const k = reduced ? 1 : 1 - Math.exp(-0.12);
      st.x += (fx - st.x) * k;
      st.y += (fy - st.y) * k;
      st.scale += (fs - st.scale) * k;
      st.alpha += (fa - st.alpha) * k;

      el.style.left = `${(st.x * 100).toFixed(2)}%`;
      el.style.top = `${(st.y * 100).toFixed(2)}%`;
      const size = isNarrow
        ? Math.min(window.innerWidth * 0.72, 420)
        : Math.min(window.innerWidth, window.innerHeight) * 0.62;
      el.style.width = `${size.toFixed(0)}px`;
      el.style.height = `${size.toFixed(0)}px`;
      el.style.transform = `translate(-50%, -50%) scale(${st.scale.toFixed(3)})`;
      el.style.opacity = st.alpha.toFixed(3);
      // 指針事件策略：只有當穹頂是主角（大且亮）時才可點
      const interactive = !isNarrow ? st.alpha > 0.55 : st.alpha > 0.9;
      inner.style.pointerEvents = interactive ? "auto" : "none";
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="pointer-events-none fixed z-30"
      style={{ left: "50%", top: "52%", transform: "translate(-50%, -50%)" }}
      aria-hidden={false}
    >
      <div ref={innerRef} className="h-full w-full">
        <Dome
          ref={domeRef as React.Ref<DomeApi>}
          powered={powered}
          pressureSignal={pressureSignal}
          mode={mode}
          className="h-full w-full"
          onFirstTouch={onFirstTouch}
        />
      </div>
    </div>
  );
}
