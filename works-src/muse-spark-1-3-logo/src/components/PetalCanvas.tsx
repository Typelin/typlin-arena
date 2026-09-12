import { useEffect, useRef } from 'react';

interface Props {
  /** 0–1 全站捲動進度：捲動越深，季節越晚，瓣落得越急 */
  season: number;
  reducedMotion: boolean;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  angle: number;
  spin: number;
  fall: number;
  phase: number;
  amp: number;
  freq: number;
  shade: string;
  alpha: number;
}

interface Impulse {
  x: number;
  y: number;
  power: number;
  life: number;
}

const SHADES = [
  '239,163,190',
  '239,163,190',
  '217,106,148',
  '249,220,231',
  '255,251,253',
  '193,84,126',
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * 風與花 — 全站固定背景。
 * 櫻瓣即進度：游標是風，點擊是陣風，捲動是季節。
 * reduced-motion 時只畫六瓣靜止，不跑迴圈。
 */
export function PetalCanvas({ season, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seasonRef = useRef(season);
  seasonRef.current = season;

  // 游標風場（跨 effect 共享）
  const windRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const impulseRef = useRef<Impulse[]>([]);

  // —— 游標即風，點擊即陣風 ——
  useEffect(() => {
    if (reducedMotion) return;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let lastT = performance.now();

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      const vx = ((e.clientX - lastX) / dt) * 16;
      const vy = ((e.clientY - lastY) / dt) * 16;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      windRef.current.tx = clamp(vx * 0.55, -7, 7);
      windRef.current.ty = clamp(vy * 0.3, -3, 3);
    };

    const pushImpulse = (x: number, y: number, power: number) => {
      impulseRef.current.push({ x, y, power, life: 1 });
      if (impulseRef.current.length > 10) impulseRef.current.shift();
    };

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('a,button')) return;
      pushImpulse(e.clientX, e.clientY, 1);
    };

    const onBurst = (e: Event) => {
      const d = (e as CustomEvent<{ x?: number; y?: number; power?: number }>).detail;
      pushImpulse(
        d?.x ?? window.innerWidth / 2,
        d?.y ?? window.innerHeight * 0.35,
        d?.power ?? 1.4,
      );
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('sakimu:burst', onBurst);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('sakimu:burst', onBurst);
    };
  }, [reducedMotion]);

  // —— 主迴圈 ——
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let petals: Petal[] = [];
    let raf = 0;
    let t = rand(0, 1000);
    let running = true;

    const seed = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const n = reducedMotion
        ? 6
        : clamp(Math.floor((w * h) / 22000), 28, 88);
      petals = Array.from({ length: n }, () => spawn(w, h, true));
    };

    const spawn = (w: number, h: number, anywhere = false): Petal => {
      // 季節漂移：暮春（season→1）白瓣與淡粉漸多，如花筏
      const s = seasonRef.current;
      const roll = Math.random();
      let shade: string;
      if (s > 0.55 && roll < (s - 0.55) * 1.1) {
        shade = roll < (s - 0.55) * 0.5 ? '255,251,253' : '249,220,231';
      } else {
        shade = SHADES[Math.floor(Math.random() * SHADES.length)];
      }
      return {
        x: rand(-40, w + 40),
        y: anywhere ? rand(-40, h + 40) : rand(-80, -20),
        size: rand(5, 15),
        angle: rand(0, Math.PI * 2),
        spin: rand(-0.03, 0.03),
        fall: rand(0.35, 1.05),
        phase: rand(0, Math.PI * 2),
        amp: rand(0.4, 1.6),
        freq: rand(0.008, 0.022),
        shade,
        alpha: rand(0.45, 0.92),
      };
    };

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reducedMotion) drawStill();
    };

    const drawPetal = (p: Petal) => {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      // 花瓣：上圓下尖，帶一道缺刻
      ctx.fillStyle = `rgba(${p.shade},${p.alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.62, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.62, s * 0.6, -s * 0.95, -s * 0.55, 0, -s);
      ctx.fill();
      // 花心一點白
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(0, -s * 0.15, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStill = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      petals.forEach(drawPetal);
    };

    const frame = () => {
      if (!running) return;
      t += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = seasonRef.current; // 0 春初 → 1 暮春
      const wind = windRef.current;
      wind.x += (wind.tx - wind.x) * 0.04;
      wind.y += (wind.ty - wind.y) * 0.04;
      wind.tx *= 0.94;
      wind.ty *= 0.94;

      ctx.clearRect(0, 0, w, h);

      const baseFall = 0.55 + s * 0.85;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        // 陣風：徑向推力，隨 life 衰減
        let ix = 0;
        let iy = 0;
        for (const im of impulseRef.current) {
          const dx = p.x - im.x;
          const dy = p.y - im.y;
          const d = Math.hypot(dx, dy) + 24;
          const f = ((im.power * 2600) / (d * d)) * im.life;
          ix += (dx / d) * f;
          iy += (dy / d) * f - f * 0.35;
        }
        p.x += Math.sin(t * p.freq + p.phase) * p.amp + wind.x + ix + 0.25;
        p.y += p.fall * baseFall + wind.y * 0.4 + iy;
        p.angle += p.spin + wind.x * 0.004 + ix * 0.01;

        if (p.y > h + 50 || p.x > w + 60 || p.x < -70) {
          petals[i] = spawn(w, h);
        } else {
          drawPetal(p);
        }
      }
      for (const im of impulseRef.current) im.life *= 0.955;
      impulseRef.current = impulseRef.current.filter((im) => im.life > 0.05);

      raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reducedMotion) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    if (!reducedMotion) raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="petal-canvas"
      aria-hidden="true"
    />
  );
}
