import { TRAIL_LEN, type PlumbSim } from './pendulum';

const INK = '#1c1814';
const INK_SOFT = 'rgba(28, 24, 20, 0.55)';
const INK_FAINT = 'rgba(28, 24, 20, 0.18)';
const INK_HAIR = 'rgba(28, 24, 20, 0.10)';
const CINNABAR = '#b33a2b';
const BRASS = '#6e5428';

export type DrawView = {
  w: number;
  h: number;
  originX: number;
  originY: number;
  L: number;
  bobX: number;
  bobY: number;
  flash: number;
  reduced: boolean;
  bobSize: number;
  chapter: number;
  holding: boolean;
};

function crisp(n: number): number {
  return Math.round(n) + 0.5;
}

const CHAPTER_GLYPHS = ['垂', '思', '造', '協', '性', '飲'];

export function drawPlate(ctx: CanvasRenderingContext2D, sim: PlumbSim, view: DrawView): void {
  const { w, h, originX, originY, L, bobX, bobY, flash, reduced, bobSize, chapter, holding } = view;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const along = bobSize * 1.22;
  const ringX = bobX - Math.sin(sim.theta) * along;
  const ringY = bobY - Math.cos(sim.theta) * along;

  drawFan(ctx, sim, originX, originY, L);
  if (!reduced) drawTrail(ctx, sim);
  drawArc(ctx, originX, originY, L, sim, flash);
  drawRejects(ctx, sim, originX, originY, L, h, chapter);
  drawShadow(ctx, sim, originX, originY, L, bobSize);
  drawString(ctx, sim, originX, originY, ringX, ringY);
  if (sim.mode !== 'intro' || sim.introBob > 0) {
    const appear = sim.mode === 'intro' ? Math.min(1, sim.introBob) : 1;
    drawBob(ctx, ringX, ringY, sim.theta, appear, bobSize);
  }
  drawPin(ctx, originX, originY, sim.mode === 'intro' ? Math.min(1, sim.introT / 0.32) : 1);
  drawSpine(ctx, originY, L, chapter);
  if (holding) drawWindMark(ctx, originX, originY, L);

  ctx.strokeStyle = INK_HAIR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(crisp(16), crisp(16));
  ctx.lineTo(crisp(w - 16), crisp(16));
  ctx.lineTo(crisp(w - 16), crisp(h - 16));
  ctx.lineTo(crisp(16), crisp(h - 16));
  ctx.closePath();
  ctx.stroke();
}

function drawFan(ctx: CanvasRenderingContext2D, sim: PlumbSim, ox: number, oy: number, L: number): void {
  ctx.save();
  ctx.strokeStyle = INK_HAIR;
  ctx.lineWidth = 1;
  for (const th of sim.fan) {
    const x = ox + Math.sin(th) * L;
    const y = oy + Math.cos(th) * L;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, sim: PlumbSim): void {
  const n = Math.min(TRAIL_LEN, sim.trailI);
  if (n < 3) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(28, 24, 20, 0.22)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  let started = false;
  for (let k = 0; k < n; k++) {
    const idx = (sim.trailI - n + k + TRAIL_LEN * 8) % TRAIL_LEN;
    const x = sim.trail[idx * 2];
    const y = sim.trail[idx * 2 + 1];
    if (!x && !y) continue;
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function polar(ox: number, oy: number, L: number, theta: number): { x: number; y: number } {
  return { x: ox + Math.sin(theta) * L, y: oy + Math.cos(theta) * L };
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  L: number,
  sim: PlumbSim,
  flash: number,
): void {
  const span = 0.72;
  ctx.save();

  ctx.strokeStyle = CINNABAR;
  ctx.globalAlpha = 0.2 + flash * 0.55;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(ox, oy - 12);
  ctx.lineTo(ox, oy + L + 36);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ox, oy, L, Math.PI / 2 - span, Math.PI / 2 + span);
  ctx.stroke();

  ctx.font = '500 10px "Noto Serif TC", serif';
  ctx.textBaseline = 'middle';
  for (let deg = -40; deg <= 40; deg += 5) {
    const th = (deg * Math.PI) / 180;
    const outer = polar(ox, oy, L, th);
    const inner = polar(ox, oy, L - (deg % 10 === 0 ? 11 : 6), th);
    ctx.strokeStyle = deg === 0 ? CINNABAR : INK_SOFT;
    ctx.lineWidth = deg === 0 ? 1.4 : 1;
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();
    if (deg % 10 === 0) {
      const lab = polar(ox, oy, L + 16, th);
      ctx.fillStyle = deg === 0 ? CINNABAR : INK_SOFT;
      ctx.textAlign = 'center';
      ctx.fillText(deg === 0 ? '正' : String(Math.abs(deg)), lab.x, lab.y);
    }
  }

  for (const n of sim.notes) {
    const p = polar(ox, oy, L + 4, n.theta);
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 9px "Noto Serif TC", serif';
    ctx.textAlign = n.theta >= 0 ? 'left' : 'right';
    ctx.fillText(
      `${((n.theta * 180) / Math.PI).toFixed(1)}°`,
      p.x + (n.theta >= 0 ? 6 : -6),
      p.y,
    );
  }

  ctx.restore();
}

function drawShadow(
  ctx: CanvasRenderingContext2D,
  sim: PlumbSim,
  ox: number,
  oy: number,
  L: number,
  bobSize: number,
): void {
  const th = sim.shadowTheta;
  const x = ox + Math.sin(th) * L * sim.stretch + bobSize * 0.35;
  const y = oy + Math.cos(th) * L * sim.stretch + bobSize * 0.45;
  ctx.save();
  ctx.fillStyle = 'rgba(28, 24, 20, 0.10)';
  ctx.beginPath();
  ctx.ellipse(x, y + bobSize * 0.55, bobSize * 0.72, bobSize * 0.34, th, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawString(
  ctx: CanvasRenderingContext2D,
  sim: PlumbSim,
  ox: number,
  oy: number,
  bx: number,
  by: number,
): void {
  const lenK = sim.mode === 'intro' ? sim.introLen : 1;
  if (lenK <= 0.001) return;
  const x2 = ox + (bx - ox) * lenK;
  const y2 = oy + (by - oy) * lenK;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  if (Math.abs(sim.bow) > 0.002 && sim.mode === 'drag') {
    const mx = (ox + x2) / 2;
    const my = (oy + y2) / 2;
    const nx = -(y2 - oy);
    const ny = x2 - ox;
    const nlen = Math.hypot(nx, ny) || 1;
    const bow = sim.bow * 26;
    ctx.quadraticCurveTo(mx + (nx / nlen) * bow, my + (ny / nlen) * bow, x2, y2);
  } else {
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theta: number,
  appear: number,
  size: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-theta);
  ctx.globalAlpha = appear;
  const r = size;
  const neck = size * 0.72;
  const tip = size * 3.15;

  ctx.strokeStyle = INK;
  ctx.fillStyle = '#f3eee4';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.28);
  ctx.lineTo(0, neck);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(0, tip);
  ctx.quadraticCurveTo(r, neck + size * 1.15, r, neck);
  ctx.quadraticCurveTo(r * 0.45, neck - size * 0.15, 0, neck - size * 0.08);
  ctx.quadraticCurveTo(-r * 0.45, neck - size * 0.15, -r, neck);
  ctx.quadraticCurveTo(-r, neck + size * 1.15, 0, tip);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f3eee4';
  ctx.globalAlpha = appear * 0.22;
  ctx.lineWidth = Math.max(0.8, size * 0.06);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size * 0.18, neck + size * 0.1);
    ctx.lineTo(i * size * 0.08, tip - size * 0.35);
    ctx.stroke();
  }
  ctx.globalAlpha = appear;

  ctx.fillStyle = '#f3eee4';
  ctx.globalAlpha = appear * 0.3;
  ctx.beginPath();
  ctx.ellipse(-size * 0.26, neck + size * 0.35, size * 0.2, size * 0.3, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRejects(
  ctx: CanvasRenderingContext2D,
  sim: PlumbSim,
  ox: number,
  oy: number,
  L: number,
  h: number,
  chapter: number,
): void {
  ctx.save();
  ctx.font = '600 13px "Noto Serif TC", serif';
  ctx.textBaseline = 'middle';
  for (const r of sim.rejects) {
    if (!r.fallen && chapter !== 2) continue;
    if (r.fallen && r.fallY > h) continue;
    const p = polar(ox, oy, L + 36, r.theta);
    const x = p.x;
    const y = p.y + (r.fallen ? r.fallY : 0);
    ctx.globalAlpha = r.fallen ? Math.max(0.12, 1 - r.fallY / 420) : 0.82;
    ctx.fillStyle = r.fallen ? INK_SOFT : CINNABAR;
    ctx.textAlign = r.theta >= 0 ? 'left' : 'right';
    ctx.fillText(r.label, x, y);
    if (!r.fallen) {
      ctx.strokeStyle = CINNABAR;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(ox + Math.sin(r.theta) * (L + 8), oy + Math.cos(r.theta) * (L + 8));
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSpine(ctx: CanvasRenderingContext2D, oy: number, L: number, chapter: number): void {
  ctx.save();
  ctx.font = '600 12px "Noto Serif TC", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const x = 28;
  const top = oy + 8;
  const span = Math.max(120, L * 0.72);
  for (let i = 0; i < CHAPTER_GLYPHS.length; i++) {
    const y = top + (span * i) / (CHAPTER_GLYPHS.length - 1);
    const on = i === chapter;
    ctx.fillStyle = on ? INK : INK_FAINT;
    ctx.fillText(CHAPTER_GLYPHS[i], x, y);
    if (on) {
      ctx.strokeStyle = CINNABAR;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x - 4, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawWindMark(ctx: CanvasRenderingContext2D, ox: number, oy: number, L: number): void {
  ctx.save();
  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = oy + L * 0.25 + i * 16;
    ctx.beginPath();
    ctx.moveTo(ox - 70, y);
    ctx.quadraticCurveTo(ox - 40, y + 6, ox - 18, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, appear: number): void {
  if (appear <= 0) return;
  ctx.save();
  ctx.globalAlpha = appear;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x, y, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BRASS;
  ctx.beginPath();
  ctx.arc(x, y, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
