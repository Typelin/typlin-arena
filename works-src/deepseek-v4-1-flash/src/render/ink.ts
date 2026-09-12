import { mulberry32 } from '../engine/rng';

/**
 * 抖動快取：種子固定 → 形狀固定。
 * 所以同一條枝每幀都長得一模一樣，不會癢；但每條枝彼此不同。
 */
const cache = new Map<number, number[]>();

function jitter(seed: number, segs: number): number[] {
  const key = (seed % 99991) * 64 + segs;
  const hit = cache.get(key);
  if (hit) return hit;
  const rnd = mulberry32(seed);
  const arr: number[] = [];
  for (let i = 0; i <= segs; i += 1) {
    arr.push(i === 0 || i === segs ? 0 : rnd() - 0.5);
  }
  cache.set(key, arr);
  return arr;
}

/**
 * 畫一條手繪感的墨線。
 * progress < 1 時只畫到該比例——這是「生長」的唯一機制。
 */
export function inkStroke(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  seed: number,
  amp: number,
  progress = 1
): void {
  const p = progress <= 0 ? 0 : progress >= 1 ? 1 : progress;
  if (p <= 0) return;

  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const segs = Math.max(4, Math.min(14, Math.round(len / 22)));
  const j = jitter(seed, segs);

  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i <= segs; i += 1) {
    const u = i / segs;
    const off = j[i] * amp;
    px.push(ax + dx * u + nx * off);
    py.push(ay + dy * u + ny * off);
  }

  const limit = p * segs;
  ctx.beginPath();
  ctx.moveTo(px[0], py[0]);
  for (let i = 1; i <= segs; i += 1) {
    if (i <= limit) {
      ctx.lineTo(px[i], py[i]);
    } else {
      const f = limit - (i - 1);
      ctx.lineTo(
        px[i - 1] + (px[i] - px[i - 1]) * f,
        py[i - 1] + (py[i] - py[i - 1]) * f
      );
      break;
    }
  }
  ctx.stroke();
}

/** 一個墨點。 */
export function inkDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
): void {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 一滴墨：不規則邊緣，像筆尖落下的那一瞬。
 * 種子固定 → 形狀固定，不會每幀蠕動。
 */
export function inkBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  seed: number
): void {
  const rnd = mulberry32(seed);
  const n = 14;
  ctx.beginPath();
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.84 + rnd() * 0.3);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** 一條線的設定值集中管理，避免每處重複。 */
export function setStroke(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  dash: number[] = []
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
}
