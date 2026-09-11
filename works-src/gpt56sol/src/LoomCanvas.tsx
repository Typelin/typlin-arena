import { useEffect, useRef } from 'react';

export type Weights = { precision: number; novelty: number; empathy: number };

type Props = {
  weights: Weights;
  progress: number;
  revision: boolean;
  reduced: boolean;
};

const seeds = [
  { label: '求證', tone: 0.08 },
  { label: '聯想', tone: 0.22 },
  { label: '反例', tone: 0.38 },
  { label: '結構', tone: 0.55 },
  { label: '語氣', tone: 0.72 },
  { label: '留白', tone: 0.9 },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function LoomCanvas({ weights, progress, revision, reduced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const targetPointer = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();

    const onMove = (ev: PointerEvent) => {
      const r = c.getBoundingClientRect();
      targetPointer.current.x = clamp((ev.clientX - r.left) / r.width);
      targetPointer.current.y = clamp((ev.clientY - r.top) / r.height);
      pointer.current.active = true;
    };
    const onLeave = () => { pointer.current.active = false; };
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerleave', onLeave);

    const drawPaper = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#eeeae0';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(28,26,22,.055)';
      ctx.lineWidth = 1;
      for (let y = 16; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y + ((y / 18) % 2 ? .35 : 0));
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 18; x < w; x += 42) {
        ctx.strokeStyle = 'rgba(28,26,22,.025)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 5, h);
        ctx.stroke();
      }
    };

    const score = (i: number) => {
      const s = seeds[i];
      const p = weights.precision;
      const n = weights.novelty;
      const e = weights.empathy;
      const family = [p, n, p * .7 + n * .3, p * .8 + e * .2, e, n * .55 + e * .45][i];
      return clamp(.25 + family * .7 + Math.sin((s.tone + p - n) * 5.2) * .08);
    };

    const draw = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      const ease = reduced ? 1 : Math.min(1, .09 * dt);
      pointer.current.x = lerp(pointer.current.x, targetPointer.current.x, ease);
      pointer.current.y = lerp(pointer.current.y, targetPointer.current.y, ease);

      drawPaper();

      const px = pointer.current.x;
      const py = pointer.current.y;
      const phase = clamp(progress);
      const converge = clamp((phase - .22) / .56);
      const commit = clamp((phase - .68) / .25);
      const reopen = revision ? .34 : 0;
      const leftX = Math.max(42, w * .09);
      const rightX = w * .88;
      const midX = lerp(w * .48, w * .61, converge);
      const centerY = h * (.48 + (py - .5) * .11 * (1 - commit));

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';

      seeds.forEach((seed, i) => {
        const baseY = h * (.16 + i * .135);
        const s = score(i);
        const keep = s > lerp(.19, .63, converge);
        const alpha = keep ? lerp(.3, .84, s) : lerp(.25, revision ? .28 : .05, converge);
        const spread = (1 - converge + reopen) * h * .16;
        const endY = centerY + (i - 2.5) * spread * (.34 + .5 * (1 - s));
        const wobble = reduced ? 0 : Math.sin(now * .0007 + i * 1.7) * (1 - converge) * 4;
        const influence = pointer.current.active ? (px - .5) * 22 * (1 - commit) : 0;

        ctx.strokeStyle = i === 3 ? `rgba(156,35,27,${alpha * .9})` : `rgba(29,28,24,${alpha})`;
        ctx.lineWidth = keep ? lerp(.7, 2.1, s) : .65;
        ctx.setLineDash(!keep && revision ? [4, 6] : []);
        ctx.beginPath();
        ctx.moveTo(leftX, baseY);
        ctx.bezierCurveTo(
          w * .27, baseY + wobble,
          midX - 58 + influence, endY + (baseY - centerY) * .19,
          rightX, lerp(endY, centerY, commit),
        );
        ctx.stroke();

        if ((revision || converge < .72) && w > 520) {
          ctx.fillStyle = `rgba(31,29,25,${Math.max(.28, alpha)})`;
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(seed.label, leftX + 8, baseY - 7);
        }
      });

      ctx.setLineDash([]);

      // platen / commitment axis
      const platenX = lerp(w * .74, rightX - 5, commit);
      ctx.strokeStyle = `rgba(156,35,27,${.12 + commit * .55})`;
      ctx.lineWidth = lerp(1, 3, commit);
      ctx.beginPath();
      ctx.moveTo(platenX, h * .12);
      ctx.lineTo(platenX, h * .86);
      ctx.stroke();

      // pressure indicator follows the user's intervention
      const cx = lerp(w * .52, platenX - 18, commit) + (px - .5) * 28 * (1 - commit);
      const cy = centerY;
      const radius = 8 + weights.precision * 8 + weights.novelty * 5;
      ctx.fillStyle = 'rgba(238,234,224,.86)';
      ctx.strokeStyle = 'rgba(156,35,27,.72)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - radius * .62, cy);
      ctx.lineTo(cx + radius * .62, cy);
      ctx.moveTo(cx, cy - radius * .62);
      ctx.lineTo(cx, cy + radius * .62);
      ctx.stroke();

      if (commit > .55) {
        const ink = clamp((commit - .55) / .45);
        ctx.fillStyle = `rgba(24,23,20,${ink * .84})`;
        ctx.font = `${Math.round(lerp(16, 22, ink))}px Georgia, 'Times New Roman', serif`;
        ctx.textAlign = 'right';
        ctx.fillText('先求證，再承諾。', rightX, h * .93);
      }

      // revision ghosts appear only after discovering the seal
      if (revision) {
        ctx.strokeStyle = 'rgba(156,35,27,.22)';
        ctx.setLineDash([2, 5]);
        for (let i = 0; i < 4; i++) {
          const y = h * (.27 + i * .13);
          ctx.beginPath();
          ctx.moveTo(w * .42, y);
          ctx.quadraticCurveTo(w * .69, y + (i % 2 ? 36 : -28), rightX, centerY + (i - 1.5) * 18);
          ctx.stroke();
        }
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
    };
  }, [weights, progress, revision, reduced]);

  return <canvas ref={canvasRef} className="loom-canvas" aria-hidden="true" />;
}
