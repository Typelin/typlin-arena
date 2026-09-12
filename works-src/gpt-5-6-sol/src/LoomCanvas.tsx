import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';

export type Weights = { precision: number; novelty: number; empathy: number };

type Props = {
  weights: Weights;
  progress: MotionValue<number>;
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
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / Math.max(.0001, b - a));
  return t * t * (3 - 2 * t);
};

export default function LoomCanvas({ weights, progress, revision, reduced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const targetPointer = useRef({ x: 0.5, y: 0.5 });
  const weightsRef = useRef(weights);
  const revisionRef = useRef(revision);
  const reducedRef = useRef(reduced);

  weightsRef.current = weights;
  revisionRef.current = revision;
  reducedRef.current = reduced;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;
    let visible = true;

    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, r.width);
      const cssH = Math.max(1, r.height);
      const pixelW = Math.max(1, Math.round(cssW * dpr));
      const pixelH = Math.max(1, Math.round(cssH * dpr));

      // ResizeObserver may fire during sticky scrolling for sub-pixel changes.
      // Reassigning canvas.width clears the buffer, so only resize on a real pixel-size change.
      if (c.width === pixelW && c.height === pixelH && Math.abs(w - cssW) < .25 && Math.abs(h - cssH) < .25) return;

      w = cssW;
      h = cssH;
      c.width = pixelW;
      c.height = pixelH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();

    const onMove = (ev: PointerEvent) => {
      const r = c.getBoundingClientRect();
      targetPointer.current.x = clamp((ev.clientX - r.left) / Math.max(1, r.width));
      targetPointer.current.y = clamp((ev.clientY - r.top) / Math.max(1, r.height));
      pointer.current.active = true;
    };
    const onLeave = () => { pointer.current.active = false; };
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerleave', onLeave);

    const drawPaper = () => {
      ctx.fillStyle = '#eeeae0';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(28,26,22,.05)';
      ctx.lineWidth = 1;
      for (let y = 16; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y + ((y / 18) % 2 ? .35 : 0));
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 18; x < w; x += 42) {
        ctx.strokeStyle = 'rgba(28,26,22,.022)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 5, h);
        ctx.stroke();
      }
    };

    const score = (i: number, current: Weights) => {
      const s = seeds[i];
      const p = current.precision;
      const n = current.novelty;
      const e = current.empathy;
      const family = [p, n, p * .7 + n * .3, p * .8 + e * .2, e, n * .55 + e * .45][i];
      return clamp(.25 + family * .7 + Math.sin((s.tone + p - n) * 5.2) * .08);
    };

    const draw = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }

      const currentWeights = weightsRef.current;
      const isRevision = revisionRef.current;
      const isReduced = reducedRef.current;
      const phase = clamp(progress.get());
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      const pointerEase = isReduced ? 1 : Math.min(1, .1 * dt);
      pointer.current.x = lerp(pointer.current.x, targetPointer.current.x, pointerEase);
      pointer.current.y = lerp(pointer.current.y, targetPointer.current.y, pointerEase);

      drawPaper();

      // One continuous choreography: divergence → pressure → commitment → proof/revision.
      const pressure = smooth(.14, .58, phase);
      const converge = smooth(.24, .70, phase);
      const commit = smooth(.60, .90, phase);
      const settle = smooth(.84, 1, phase);
      const proofGhost = smooth(.76, .96, phase) * .22;
      const reopen = isRevision ? .36 : proofGhost;
      const px = pointer.current.x;
      const py = pointer.current.y;
      const leftX = Math.max(42, w * .09);
      const rightX = w * .88;
      const midX = lerp(w * .44, w * .63, converge);
      const centerY = h * (.48 + (py - .5) * .1 * (1 - commit));

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';

      // The press enters as a physical region, not a discrete scene cut.
      const bandX = lerp(w * .30, w * .82, pressure);
      const bandW = lerp(w * .16, w * .055, converge);
      const bandGradient = ctx.createLinearGradient(bandX - bandW, 0, bandX + bandW, 0);
      bandGradient.addColorStop(0, 'rgba(156,35,27,0)');
      bandGradient.addColorStop(.5, `rgba(156,35,27,${.025 + pressure * .055})`);
      bandGradient.addColorStop(1, 'rgba(156,35,27,0)');
      ctx.fillStyle = bandGradient;
      ctx.fillRect(bandX - bandW, h * .08, bandW * 2, h * .82);

      seeds.forEach((seed, i) => {
        const baseY = h * (.16 + i * .135);
        const s = score(i, currentWeights);
        const threshold = lerp(.18, .66, converge);
        const keep = s > threshold;
        const keepAlpha = lerp(.34, .9, s);
        const discardAlpha = lerp(.24, isRevision ? .3 : .035 + proofGhost, converge);
        const alpha = keep ? keepAlpha : discardAlpha;
        const spread = (1 - converge + reopen) * h * .16;
        const endY = centerY + (i - 2.5) * spread * (.32 + .52 * (1 - s));
        const breath = isReduced ? 0 : Math.sin(now * .00058 + i * 1.72) * (1 - converge) * 3.3;
        const pointerForce = pointer.current.active ? (px - .5) * 24 * (1 - commit) : 0;
        const pressDeflect = Math.sin((phase * 1.7 + seed.tone) * Math.PI) * pressure * (1 - commit) * 8;

        ctx.strokeStyle = i === 3 ? `rgba(156,35,27,${alpha * .92})` : `rgba(29,28,24,${alpha})`;
        ctx.lineWidth = keep ? lerp(.75, 2.35, s) + settle * .25 : .65;
        ctx.setLineDash(!keep && (isRevision || proofGhost > .06) ? [4, 7] : []);
        ctx.beginPath();
        ctx.moveTo(leftX, baseY);
        ctx.bezierCurveTo(
          w * .26, baseY + breath,
          midX - 62 + pointerForce + pressDeflect, endY + (baseY - centerY) * .18,
          rightX, lerp(endY, centerY, commit),
        );
        ctx.stroke();

        if ((isRevision || converge < .72) && w > 520) {
          ctx.fillStyle = `rgba(31,29,25,${Math.max(.25, alpha)})`;
          ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(seed.label, leftX + 8, baseY - 7);
        }
      });

      ctx.setLineDash([]);

      const platenX = lerp(w * .69, rightX - 4, commit);
      ctx.strokeStyle = `rgba(156,35,27,${.10 + pressure * .22 + commit * .42})`;
      ctx.lineWidth = lerp(1, 3.2, commit);
      ctx.beginPath();
      ctx.moveTo(platenX, h * .11);
      ctx.lineTo(platenX, h * .87);
      ctx.stroke();

      // The target mark gains weight as the answer commits.
      const cx = lerp(w * .50, platenX - 19, commit) + (px - .5) * 28 * (1 - commit);
      const cy = centerY;
      const radius = 8 + currentWeights.precision * 8 + currentWeights.novelty * 5 - commit * 3;
      ctx.fillStyle = `rgba(238,234,224,${.78 + settle * .18})`;
      ctx.strokeStyle = `rgba(156,35,27,${.55 + commit * .30})`;
      ctx.lineWidth = 1.4 + commit * .5;
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

      if (commit > .42) {
        const ink = smooth(.42, .93, commit);
        ctx.fillStyle = `rgba(24,23,20,${ink * .86})`;
        ctx.font = `${Math.round(lerp(15, 22, ink))}px Georgia, 'Times New Roman', serif`;
        ctx.textAlign = 'right';
        ctx.fillText('先求證，再承諾。', rightX, h * .93);
      }

      // A faint proof layer arrives before the explicit hidden interaction,
      // so chapter 04 feels like a turn rather than a cut.
      if (isRevision || proofGhost > .04) {
        const ghostAlpha = isRevision ? .24 : proofGhost;
        ctx.strokeStyle = `rgba(156,35,27,${ghostAlpha})`;
        ctx.setLineDash([2, 6]);
        for (let i = 0; i < 4; i++) {
          const y = h * (.27 + i * .13);
          ctx.beginPath();
          ctx.moveTo(w * .42, y);
          ctx.quadraticCurveTo(w * .69, y + (i % 2 ? 34 : -27), rightX, centerY + (i - 1.5) * 18);
          ctx.stroke();
        }
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      } else if (!visible && raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { rootMargin: '160px 0px' });
    io.observe(c);

    raf = requestAnimationFrame(draw);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
    };
  }, [progress]);

  return <canvas ref={canvasRef} className="loom-canvas" aria-hidden="true" />;
}
