export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** 捲動進度 0..1 → 連續相位 0..4（散 → 揀 → 拼 → 墨 → 壓） */
const SEGMENTS: Array<[number, number, number, number]> = [
  // [p0, p1, phase0, phase1]
  [0.0, 0.12, 0, 0],
  [0.12, 0.32, 0, 1],
  [0.32, 0.52, 1, 2],
  [0.52, 0.7, 2, 3],
  [0.7, 0.88, 3, 4],
  [0.88, 1.0001, 4, 4],
];

export function phaseFromProgress(p: number): number {
  const x = clamp(p, 0, 1);
  for (const [a, b, pa, pb] of SEGMENTS) {
    if (x >= a && x < b) {
      if (pa === pb) return pa;
      /* 編舞節奏：段內前 55% 完成形變，後 45% 停靠，
         讓每個相位有「定版」時間，章節文案對齊穩定畫面 */
      const t = smoothstep(clamp((x - a) / (b - a) / 0.55, 0, 1));
      return lerp(pa, pb, t);
    }
  }
  return 4;
}

/** 章節文案索引：與相位段界對齊（0.12 / 0.32 / 0.52 / 0.70） */
export function chapterIndex(p: number): number {
  if (p < 0.12) return 0;
  if (p < 0.32) return 1;
  if (p < 0.52) return 2;
  if (p < 0.7) return 3;
  return 4;
}
