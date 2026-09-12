import type { Choice } from './path';

export type Vec = { x: number; y: number };

/** 一層的垂直間距。 */
export const LEVEL_H = 168;
/** 一條枝的水平展開量（桌面基準）。 */
export const SPREAD_X = 204;
/** 落選的旁枝只留這麼長，像被剪掉的枝。 */
export const STUB_LEN = 40;
/** 節點墨點半徑。 */
export const NODE_R = 4.2;
/** 水平偏移：左 / 中 / 右。 */
export const OFFSETS = [-1, 0, 1];

/** 窄螢幕收窄展開量，否則樹會橫向跑出畫面。 */
let spreadScale = 1;

export function setSpreadScale(v: number): void {
  spreadScale = v;
}

function spread(): number {
  return SPREAD_X * spreadScale;
}

/**
 * 沿選擇序列累積座標。
 * 帶輕度均值回歸（0.72），否則連續選同一側會無限外擴。
 */
export function nodeAt(choices: Choice[], upto: number): Vec {
  let x = 0;
  let y = 0;
  for (let i = 0; i < upto; i += 1) {
    const c = choices[i];
    if (!c) break;
    const off = OFFSETS[c.option] ?? 0;
    x = x * 0.72 + off * spread();
    y += LEVEL_H;
  }
  return { x, y };
}

/** 從某節點往第 option 條枝走一格之後會到哪。 */
export function stepTo(from: Vec, option: number): Vec {
  const off = OFFSETS[option] ?? 0;
  return { x: from.x * 0.72 + off * spread(), y: from.y + LEVEL_H };
}

/** 目前末端節點。 */
export function tipOf(choices: Choice[]): Vec {
  return nodeAt(choices, choices.length);
}

/** 整條路徑的包圍盒，給「看整棵樹」的總覽鏡頭用。 */
export function boundsOf(
  choices: Choice[],
  upto: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  for (let i = 0; i <= upto; i += 1) {
    const n = nodeAt(choices, i);
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  return { minX, maxX, minY, maxY };
}

export function lerp(a: number, b: number, t: number): number {
  const k = t < 0 ? 0 : t > 1 ? 1 : t;
  return a + (b - a) * k;
}

export function lerpVec(a: Vec, b: Vec, t: number): Vec {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** 緩出：起步快、收尾穩，像毛筆收鋒。 */
export function easeOutCubic(t: number): number {
  const k = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - k, 3);
}

/** 緩入緩出，給回放用。 */
export function easeInOutCubic(t: number): number {
  const k = t < 0 ? 0 : t > 1 ? 1 : t;
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}
