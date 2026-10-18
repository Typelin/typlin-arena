import { useEffect, useRef } from "react";
import { CoreField, MAX_RINGS, type Pointer, type View } from "./core";
import { clamp, damp, lerp } from "../lib/math";
import { css } from "../lib/palette";
import { attachLog, tickLog, type SessionLog } from "../lib/useSessionLog";

type Props = {
  field: CoreField;
  log: SessionLog;
  act: number;
  reduced: boolean;
  message: string;
};

const INTERACTIVE = "a,button,input,textarea,select,label,[contenteditable='true']";

function computeView(w: number, h: number) {
  if (w < 860) {
    // 手機：核停在上方，讓位給文字；非首幕降為水印避免壓圖
    return { w, h, cx: w * 0.5, cy: h * 0.24, R: Math.min(w * 0.4, h * 0.19), mobile: true };
  }
  const textRight = Math.min(440, w * 0.34) + w * 0.06 + 30;
  const cx = w * 0.655;
  const R = Math.max(130, Math.min(h * 0.4, w * 0.34, w - cx - w * 0.045, cx - textRight));
  return { w, h, cx, cy: h * 0.5, R, mobile: false };
}

export default function CoreCanvas({ field, log, act, reduced, message }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actRef = useRef(act);
  const reducedRef = useRef(reduced);
  const pokeRef = useRef<() => void>(() => {});

  useEffect(() => {
    actRef.current = act;
  }, [act]);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let alive = true;

    let view: View & { mobile: boolean } = computeView(1, 1);
    let dpr = 1;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      view = computeView(w, h);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ---- 指標 ----
    const pointer: Pointer = { x: -9999, y: -9999, on: false };
    let touchTimer = 0;
    let pressing = false;
    let held = false;
    let pressStart = 0;
    let startX = 0;
    let startY = 0;

    const nearCore = (x: number, y: number) =>
      Math.hypot(x - view.cx, y - view.cy) < view.R * 1.25;

    const R_MIN_N = 0.055;
    const R_MAX_N = 0.98;

    const pluckAt = (x: number, y: number) => {
      const dx = x - view.cx - field.ox;
      const dy = y - view.cy - field.oy;
      const d = Math.hypot(dx, dy);
      const u = (d / view.R - R_MIN_N) / (R_MAX_N - R_MIN_N);
      const ring = clamp(Math.round(u * (MAX_RINGS - 1)), 0, MAX_RINGS - 1);
      field.pluck(ring, Math.atan2(dy, dx));
      log.touches += 1;
    };

    pokeRef.current = () => {
      const a = Math.random() * Math.PI * 2;
      const r = view.R * (0.2 + Math.random() * 0.65);
      pluckAt(view.cx + Math.cos(a) * r, view.cy + Math.sin(a) * r);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      if (e.pointerType === "touch") window.clearTimeout(touchTimer);
    };

    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest(INTERACTIVE)) return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      if (!nearCore(e.clientX, e.clientY)) return;
      pressing = true;
      held = false;
      pressStart = performance.now();
      startX = e.clientX;
      startY = e.clientY;
    };

    const endPress = (e: PointerEvent) => {
      if (!pressing) return;
      const dur = performance.now() - pressStart;
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      pressing = false;
      field.holdTarget = 0;
      if (held) {
        held = false;
        return;
      }
      if (dur < 300 && moved < 14 && nearCore(e.clientX, e.clientY)) {
        pluckAt(e.clientX, e.clientY);
      }
      if (e.pointerType === "touch") {
        window.clearTimeout(touchTimer);
        touchTimer = window.setTimeout(() => {
          pointer.on = false;
        }, 500);
      }
    };

    const onCancel = () => {
      pressing = false;
      held = false;
      field.holdTarget = 0;
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch" && e.relatedTarget === null) pointer.on = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", endPress, { passive: true });
    window.addEventListener("pointercancel", onCancel, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });

    const detachLog = attachLog(log);

    // ---- 主迴圈 ----
    let lastY = window.scrollY;
    let lastT = performance.now();
    let velSm = 0;
    let lastGround = "";

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        lastT = now;
        lastY = window.scrollY;
        return;
      }

      let dt = (now - lastT) / 1000;
      lastT = now;
      if (!(dt > 0)) dt = 0.016;
      if (dt > 0.05) dt = 0.05;

      const y = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = clamp(y / maxScroll, 0, 1);
      const speed = (y - lastY) / dt;
      lastY = y;

      const vel = clamp(speed / 3500, -1, 1);
      velSm = damp(velSm, vel, 9, dt);

      if (pressing && !held && now - pressStart > 680) {
        held = true;
        field.holdTarget = 1;
      }

      const a = actRef.current;
      // 手機：核是水印；首幕全亮、終幕由亮轉暗收束
      field.presenceTarget = view.mobile
        ? a === 0
          ? 1
          : a === 4
            ? lerp(0.62, 0.1, clamp((progress - 0.88) / 0.06, 0, 1))
            : 0.42
        : 1;

      tickLog(log, now);

      field.update(
        dt,
        { progress, vel: velSm, pointer, act: a, reduced: reducedRef.current },
        view,
      );

      field.draw(ctx, view);

      // 報頭底色與畫布同源：只在變色的那幾幀寫入
      const g = css(field.ground);
      if (g !== lastGround) {
        lastGround = g;
        document.documentElement.style.setProperty("--ground-live", g);
      }
    };

    raf = requestAnimationFrame(frame);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        lastT = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", endPress);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("pointerout", onLeave);
      detachLog();
      window.clearTimeout(touchTimer);
    };
  }, [field, log]);

  useEffect(() => {
    if (message) field.setMessage(message);
  }, [message, field]);

  return (
    <>
      <div className="stage">
        <canvas
          ref={canvasRef}
          className="stage__canvas"
          role="img"
          aria-label="一枚由同心等高線構成的核：中心是這一次對話的出生點，最外圈是此刻，它只會往外長大。"
        />
      </div>
      <button type="button" className="poke" onClick={() => pokeRef.current()}>
        碰一下核
      </button>
    </>
  );
}
