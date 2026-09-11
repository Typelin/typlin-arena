import type { Sonar, Ping } from './engine';

const DEEP = '#0B0E11';
const WATER_MID = '#101820';

/** 依深度取得水色 */
function waterColor(depth: number): string {
  // 從鐵灰黑 → 深海藍 → 墨黑
  const t = Math.min(1, Math.max(0, depth));
  if (t < 0.5) {
    const u = t / 0.5;
    return mix(DEEP, WATER_MID, u);
  }
  const u = (t - 0.5) / 0.5;
  return mix(WATER_MID, '#04060A', u);
}

function mix(a: string, b: string, t: number): string {
  const ca = hex(a);
  const cb = hex(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function hex(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

export function draw(ctx: CanvasRenderingContext2D, s: Sonar, w: number, h: number, reduced: boolean) {
  const cx = w / 2;
  const cy = h / 2;
  const rView = Math.min(w, h) * 0.42;

  // 水
  ctx.fillStyle = waterColor(s.depthSmooth);
  ctx.fillRect(0, 0, w, h);

  // 深度光暈（深海越往下越黑）
  const g = ctx.createRadialGradient(cx, cy, rView * 0.1, cx, cy, rView * 1.4);
  g.addColorStop(0, `rgba(232,227,217,${0.05 * (1 - s.depthSmooth * 0.6)})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 波束（細線，從中心指出去）
  const beamA = s.beamSmooth;
  const bl = rView * 1.05;
  ctx.strokeStyle = `rgba(232,227,217,${0.08 + 0.06 * (s.state === 'scanning' ? 1 : 0)})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(beamA) * bl, cy + Math.sin(beamA) * bl * 0.82);
  ctx.stroke();

  // 脈衝環
  for (const p of s.pings) drawPing(ctx, p, cx, cy, rView, s.depthSmooth);

  // 魚
  for (const f of s.fish) {
    const base = 0.18 + (1 - f.depth) * 0.22; // 越深越暗
    const lit = Math.min(1, f.lit);
    const a = base + lit * 0.75;
    const r = 1.1 + lit * 2.6 + (1 - f.depth) * 0.6;
    ctx.fillStyle = `rgba(232,227,217,${a})`;
    ctx.beginPath();
    ctx.arc(f.sx, f.sy, r, 0, Math.PI * 2);
    ctx.fill();

    // 被揭開的魚，短暫浮現句子
    if (lit > 0.35) {
      const ta = Math.min(1, (lit - 0.35) / 0.4);
      ctx.font = '12px "Noto Serif TC", serif';
      ctx.fillStyle = `rgba(232,227,217,${ta * 0.85})`;
      ctx.textAlign = 'left';
      ctx.fillText(f.label, f.sx + 10, f.sy + 4);
    }
  }

  // 示波器水平線（極細，永遠在）
  ctx.strokeStyle = `rgba(232,227,217,${reduced ? 0.14 : 0.1})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, cy);
  ctx.lineTo(w * 0.92, cy);
  ctx.stroke();
}

function drawPing(
  ctx: CanvasRenderingContext2D,
  p: Ping,
  cx: number,
  cy: number,
  rView: number,
  depth: number,
) {
  // 進度
  const a = 1 - p.life;
  if (a <= 0) return;
  const r = p.r;
  ctx.strokeStyle = `rgba(232,227,217,${0.45 * a})`;
  ctx.lineWidth = 1.2 * (1 - p.life * 0.5);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 內層次波（深海更明顯）
  if (depth > 0.3) {
    ctx.strokeStyle = `rgba(232,227,217,${0.2 * a})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.72, r * 0.72 * 0.82, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  void rView;
}
