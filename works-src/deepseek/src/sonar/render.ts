import type { Sonar, Ping } from './engine';

const LAYER_TINTS: [string, string][] = [
  ['#0E2230', '#0A1A24'], // 0 水面：帶青
  ['#0A1D2E', '#071521'], // 1 透光：藍綠
  ['#071426', '#050E1C'], // 2 暮光：深藍
  ['#03080F', '#010407'], // 3 深海：近黑
];

/** 依深度取得水色（四層過渡） */
function waterColor(depth: number): string {
  const t = Math.min(0.9999, Math.max(0, depth));
  const seg = t * 4;
  const i = Math.floor(seg);
  const u = seg - i;
  const [a1, a2] = LAYER_TINTS[i] ?? LAYER_TINTS[3];
  const [b1] = LAYER_TINTS[Math.min(3, i + 1)] ?? LAYER_TINTS[3];
  return mix(a1, b1, u) || mix(a2, b1, u);
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

export function draw(ctx: CanvasRenderingContext2D, s: Sonar, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const rView = Math.min(w, h) * 0.42;

  // 水
  ctx.fillStyle = waterColor(s.depthSmooth);
  ctx.fillRect(0, 0, w, h);

  // 深度光暈
  const g = ctx.createRadialGradient(cx, cy, rView * 0.05, cx, cy, rView * 1.6);
  g.addColorStop(0, `rgba(180,220,235,${0.10 * (1 - s.depthSmooth * 0.7)})`);
  g.addColorStop(0.5, `rgba(120,170,200,${0.04 * (1 - s.depthSmooth * 0.7)})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 水體水平條紋（模擬光在水中衰減）
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const y = cy - rView * 1.2 + (rView * 2.4 / bands) * i;
    const a = 0.012 * (1 - s.depthSmooth * 0.8) * Math.abs(Math.sin(s.t * 0.2 + i));
    ctx.fillStyle = `rgba(180,220,235,${a})`;
    ctx.fillRect(0, y, w, 1);
  }

  // 同心刻度環（儀器感）
  const rings = [0.25, 0.5, 0.75, 1.0];
  for (const k of rings) {
    ctx.strokeStyle = `rgba(232,227,217,${0.05 + (1 - s.depthSmooth) * 0.05})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rView * k, rView * k * 0.82, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 方位標 N/E/S/W
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = `rgba(232,227,217,0.32)`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rLabel = rView * 1.13;
  ctx.fillText('000', cx, cy - rLabel * 0.82);
  ctx.fillText('090', cx + rLabel, cy);
  ctx.fillText('180', cx, cy + rLabel * 0.82);
  ctx.fillText('270', cx - rLabel, cy);

  // 波束（扇形，非單線）
  drawBeam(ctx, cx, cy, s.beamSmooth, rView, s.pointerHold > 0 ? 0.16 : 0.1);

  // 脈衝環
  for (const p of s.pings) drawPing(ctx, p, cx, cy, rView, s.depthSmooth);

  // 魚
  for (const f of s.fish) {
    const lit = Math.min(1, f.lit);
    const base = 0.22 + (1 - f.depth) * 0.28;
    const a = base + lit * 0.7;
    const r = 1.4 + lit * 3.4 + (1 - f.depth) * 0.8;

    // 光暈
    if (lit > 0.05) {
      const halo = ctx.createRadialGradient(f.sx, f.sy, 0, f.sx, f.sy, 28 + lit * 24);
      halo.addColorStop(0, `rgba(232,227,217,${lit * 0.35})`);
      halo.addColorStop(1, 'rgba(232,227,217,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(f.sx, f.sy, 28 + lit * 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // 本體
    ctx.fillStyle = `rgba(232,227,217,${a})`;
    ctx.beginPath();
    ctx.arc(f.sx, f.sy, r, 0, Math.PI * 2);
    ctx.fill();

    // 已發現：加十字標記
    if (f.found) {
      ctx.strokeStyle = `rgba(232,227,217,${0.4 + lit * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(f.sx - 8, f.sy);
      ctx.lineTo(f.sx - 3, f.sy);
      ctx.moveTo(f.sx + 3, f.sy);
      ctx.lineTo(f.sx + 8, f.sy);
      ctx.moveTo(f.sx, f.sy - 8);
      ctx.lineTo(f.sx, f.sy - 3);
      ctx.moveTo(f.sx, f.sy + 3);
      ctx.lineTo(f.sx, f.sy + 8);
      ctx.stroke();
    }

    // 被揭開的魚：句子
    if (lit > 0.35) {
      const ta = Math.min(1, (lit - 0.35) / 0.4);
      ctx.font = '13px "Noto Serif TC", serif';
      ctx.fillStyle = `rgba(232,227,217,${ta * 0.9})`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label, f.sx + 12, f.sy);
    }
  }

  // 中心十字準心
  ctx.strokeStyle = `rgba(232,227,217,0.45)`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.lineTo(cx + 6, cy);
  ctx.moveTo(cx, cy - 6);
  ctx.lineTo(cx, cy + 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBeam(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  rView: number,
  alpha: number,
) {
  const spread = 0.22;
  const len = rView * 1.15;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, len);
  grad.addColorStop(0, `rgba(200,230,240,${alpha * 1.4})`);
  grad.addColorStop(1, 'rgba(200,230,240,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, len, angle - spread, angle + spread);
  ctx.closePath();
  ctx.fill();
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
