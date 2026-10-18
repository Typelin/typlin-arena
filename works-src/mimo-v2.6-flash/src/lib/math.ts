export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** 指數阻尼：lambda 越大收得越快，與幀率無關。 */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-lambda * dt));

/** 最短角距離，回傳 -PI..PI */
export const angDiff = (a: number, b: number) => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** 可重現的偽亂數（LCG），讓每一圈的「個性」固定 */
export function makeRnd(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
