import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  rot: number;
  vrot: number;
  sway: number;
  phase: number;
  alpha: number;
};

export default function PetalsCanvas({ count = 26 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const make = (): Petal => ({
      x: rand(0, w),
      y: rand(-h, h),
      r: rand(5, 13),
      vy: rand(0.25, 0.75),
      vx: rand(-0.15, 0.35),
      rot: rand(0, Math.PI * 2),
      vrot: rand(-0.008, 0.008),
      sway: rand(0.4, 1.2),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.3, 0.75)
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      const g = ctx.createLinearGradient(0, -p.r, 0, p.r);
      g.addColorStop(0, "#f8cdd8");
      g.addColorStop(1, "#ef9ab3");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -p.r * 0.9);
      ctx.bezierCurveTo(p.r * 0.95, -p.r * 0.5, p.r * 0.7, p.r * 0.6, 0, p.r * 0.9);
      ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.6, -p.r * 0.95, -p.r * 0.5, 0, -p.r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    resize();
    const petals = Array.from({ length: count }, make);

    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * p.sway + p.phase) * 0.4;
        p.rot += p.vrot;
        if (p.y > h + 24) {
          Object.assign(p, make());
          p.y = -24;
        }
        if (p.x > w + 32) p.x = -32;
        if (p.x < -32) p.x = w + 32;
        drawPetal(p);
      }
      raf = requestAnimationFrame(tick);
    };

    if (reduced) {
      petals.forEach(drawPetal);
    } else {
      tick();
    }

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="petals" aria-hidden="true" />;
}
