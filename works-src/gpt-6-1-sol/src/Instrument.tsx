import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  buildBands,
  clamp,
  createPrint,
  getLayout,
  ink,
  mix,
} from "./geometry";
import type { LoomState, View } from "./geometry";

export type InstrumentHandle = { save: () => void };
type Props = {
  progress: number;
  tension: number;
  direction: number;
  paused: boolean;
  reduced: boolean;
  separated: boolean;
  onDiscover: () => void;
  onHolding: (holding: boolean) => void;
};

export const Instrument = forwardRef<InstrumentHandle, Props>(
  function Instrument(props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const touchRef = useRef<HTMLDivElement>(null);
    const propsRef = useRef(props);
    propsRef.current = props;
    const rotation = useRef(0);
    const tilt = useRef(0);
    const pointer = useRef<{ x: number; y: number } | null>(null);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const state = useRef<LoomState>({
      progress: 0,
      tension: 0.56,
      direction: 0,
      rotation: 0,
      tilt: 0,
      separation: 0,
      time: 0,
    });

    useImperativeHandle(
      ref,
      () => ({
        save() {
          const svg = createPrint({
            ...state.current,
            tension: propsRef.current.tension,
            direction: propsRef.current.direction,
          });
          const url = URL.createObjectURL(
            new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `between-sol-${["clarity", "possibility", "together"][propsRef.current.direction]}-${Math.round(propsRef.current.tension * 100)}.svg`;
          a.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      let frame = 0;
      let last = 0;
      let running = true;
      let view: View = {
        width: window.innerWidth,
        height: window.innerHeight,
        mobile: window.innerWidth < 760,
      };
      let dpr = 1;
      let lastRender = 0;
      let dirty = true;
      let spinVelocity = 0;
      let tiltVelocity = 0;
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        view = {
          width: rect.width,
          height: rect.height,
          mobile: rect.width < 760,
        };
        const field = canvas.parentElement
          ?.querySelector(".sculpture-frame")
          ?.getBoundingClientRect();
        if (field)
          view.field = {
            x: field.x - rect.x,
            y: field.y - rect.y,
            width: Math.max(1, field.width),
            height: Math.max(1, field.height),
          };
        dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(view.width * dpr);
        canvas.height = Math.round(view.height * dpr);
        dirty = true;
      };
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      const fieldElement =
        canvas.parentElement?.querySelector(".sculpture-frame");
      if (fieldElement) observer.observe(fieldElement);
      resize();

      const draw = (now: number) => {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
        last = now;
        const p = propsRef.current;
        const s = state.current;
        const targetProgress = p.reduced
          ? Math.round(p.progress * 3) / 3
          : p.progress;
        const easing = p.reduced ? 1 : 1 - Math.exp(-dt * 7);
        const before = { ...s };
        s.progress = mix(s.progress, targetProgress, easing);
        s.tension = mix(s.tension, p.tension, easing);
        s.direction = mix(s.direction, p.direction, easing * 0.7);
        if (p.reduced) {
          s.rotation = rotation.current;
          s.tilt = tilt.current;
        } else {
          spinVelocity +=
            ((rotation.current - s.rotation) * 74 - spinVelocity * 17) * dt;
          tiltVelocity +=
            ((tilt.current - s.tilt) * 74 - tiltVelocity * 17) * dt;
          s.rotation += spinVelocity * dt;
          s.tilt += tiltVelocity * dt;
        }
        s.separation = mix(
          s.separation,
          p.separated ? 1 : 0,
          p.reduced ? 1 : 1 - Math.exp(-dt * 4),
        );
        if (!p.paused && !p.reduced) s.time += dt;
        const changed =
          Math.abs(s.progress - before.progress) +
            Math.abs(s.tension - before.tension) +
            Math.abs(s.direction - before.direction) +
            Math.abs(s.rotation - before.rotation) +
            Math.abs(s.tilt - before.tilt) +
            Math.abs(s.separation - before.separation) >
          0.00004;
        dirty ||= changed;
        const shouldDraw = dirty || (!p.paused && !p.reduced);
        const fps = view.mobile ? 30 : 60;
        if (shouldDraw && now - lastRender > 1000 / fps - 1) {
          dirty = false;
          lastRender = now;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, view.width, view.height);
          const dark = s.progress > 0.48 && s.progress < 0.79;
          const layout = getLayout(s, view);
          const touch = touchRef.current;
          if (touch) {
            touch.style.left = `${layout.cx - layout.boxWidth / 2}px`;
            touch.style.top = `${layout.cy - layout.boxHeight / 2}px`;
            touch.style.width = `${layout.boxWidth}px`;
            touch.style.height = `${layout.boxHeight}px`;
          }
          // The ground shadow anchors the textile without an extra visual layer.
          ctx.save();
          ctx.translate(layout.cx, layout.cy + layout.scale * 1.12);
          ctx.scale(1, 0.12);
          const shadow = ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            layout.scale * 1.1,
          );
          shadow.addColorStop(
            0,
            dark ? "rgba(0,0,0,.22)" : "rgba(67,44,24,.13)",
          );
          shadow.addColorStop(1, "rgba(67,44,24,0)");
          ctx.fillStyle = shadow;
          ctx.fillRect(
            -layout.scale * 1.1,
            -layout.scale * 1.1,
            layout.scale * 2.2,
            layout.scale * 2.2,
          );
          ctx.restore();
          const detail = view.mobile ? 40 : 64;
          const bands = buildBands(s, view, detail);
          for (const band of bands) {
            const half = band.points.length / 2;
            const a = band.points.slice(0, half),
              b = band.points.slice(half);
            ctx.beginPath();
            ctx.moveTo(a[0].x, a[0].y);
            for (let j = 1; j < half; j++) ctx.lineTo(a[j].x, a[j].y);
            for (let j = half - 1; j >= 0; j--) ctx.lineTo(b[j].x, b[j].y);
            ctx.closePath();
            ctx.fillStyle = ink(band.light, false, dark);
            ctx.globalAlpha = 1 - s.separation * 0.97;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath();
            for (let j = 0; j < half; j++) {
              ctx.moveTo(a[j].x, a[j].y);
              ctx.lineTo(b[j].x, b[j].y);
            }
            ctx.lineWidth = view.mobile ? 0.7 : 0.72;
            ctx.strokeStyle =
              s.separation > 0.5
                ? dark
                  ? "rgba(247,191,143,.52)"
                  : "rgba(154,70,37,.53)"
                : ink(band.light, true, dark, band.index);
            ctx.stroke();
            if (band.index % 3 === 0) {
              ctx.beginPath();
              a.forEach((pt, i) =>
                i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y),
              );
              ctx.strokeStyle = dark
                ? "rgba(255,212,162,.22)"
                : "rgba(75,27,10,.17)";
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
          // Unweaving reveals a second reading, shared by pointer and keyboard input.
          if (s.separation > 0.05) {
            ctx.strokeStyle = dark
              ? `rgba(237,233,214,${s.separation * 0.45})`
              : `rgba(91,104,88,${s.separation * 0.5})`;
            ctx.lineWidth = 0.7;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.ellipse(
              layout.cx,
              layout.cy,
              layout.scale * 1.58,
              layout.scale * 0.79,
              -0.3,
              0,
              Math.PI * 2,
            );
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        frame = requestAnimationFrame(draw);
      };
      const visibility = () => {
        running = !document.hidden;
        if (running) {
          last = performance.now();
          dirty = true;
          frame = requestAnimationFrame(draw);
        } else cancelAnimationFrame(frame);
      };
      document.addEventListener("visibilitychange", visibility);
      frame = requestAnimationFrame(draw);
      return () => {
        running = false;
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        if (holdTimer.current) clearTimeout(holdTimer.current);
      };
    }, []);

    const release = () => {
      pointer.current = null;
      if (holdTimer.current) clearTimeout(holdTimer.current);
      props.onHolding(false);
    };
    return (
      <>
        <canvas className="loom-canvas" ref={canvasRef} aria-hidden="true" />
        <div
          ref={touchRef}
          className={`sculpture-touch ${props.separated ? "is-separated" : ""}`}
          tabIndex={0}
          role="group"
          aria-label="思考織體。左右拖曳或使用左右方向鍵旋轉；長按或按空白鍵，拆開觀察線的結構。"
          onPointerDown={(e) => {
            pointer.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
            holdTimer.current = setTimeout(() => {
              props.onDiscover();
              props.onHolding(true);
            }, 650);
          }}
          onPointerMove={(e) => {
            if (pointer.current) {
              const dx = e.clientX - pointer.current.x;
              const dy = e.clientY - pointer.current.y;
              rotation.current += dx * 0.006;
              tilt.current = clamp(tilt.current + dy * 0.006, -1.6, 1.6);
              if (Math.abs(dx) + Math.abs(dy) > 8 && holdTimer.current)
                clearTimeout(holdTimer.current);
              pointer.current = { x: e.clientX, y: e.clientY };
            } else if (e.pointerType === "mouse") {
              const rect = e.currentTarget.getBoundingClientRect();
              tilt.current =
                (e.clientY - rect.top - rect.height / 2) / rect.height;
            }
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onPointerLeave={() => {
            if (!pointer.current) tilt.current = 0;
          }}
          onKeyDown={(e) => {
            if (
              ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
                e.key,
              )
            )
              e.preventDefault();
            if (e.key === "ArrowLeft") rotation.current -= 0.15;
            if (e.key === "ArrowRight") rotation.current += 0.15;
            if (e.key === "ArrowUp")
              tilt.current = clamp(tilt.current - 0.2, -1.6, 1.6);
            if (e.key === "ArrowDown")
              tilt.current = clamp(tilt.current + 0.2, -1.6, 1.6);
            if (e.key === " " && !e.repeat) {
              props.onDiscover();
              props.onHolding(true);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " ") props.onHolding(false);
          }}
          onBlur={release}
        >
          <span className="touch-corner top-left" />
          <span className="touch-corner bottom-right" />
        </div>
      </>
    );
  },
);
