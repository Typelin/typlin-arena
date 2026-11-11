import './style.css';
import { Renderer, STRIDE } from './gl';

type V3 = [number, number, number];
interface WP { x: number; y: number; z?: number; r?: number; c?: V3; knot?: boolean }
interface Rect { x: number; y: number; w: number; h: number; cx: number; cy: number; r: number; b: number }
interface Strand {
  name: string; data: Float32Array; count: number; n: number; len: number;
  X: Float32Array; Y: Float32Array; S: Float32Array; M: Float32Array; rev: number; wpS: number[];
}

const RED: V3 = [0.8, 0.2, 0.115];
const TEAL: V3 = [0.13, 0.38, 0.45];
const OCHRE: V3 = [0.76, 0.53, 0.14];
const SLATE: V3 = [0.33, 0.42, 0.56];
const MOSS: V3 = [0.4, 0.48, 0.34];
const LINEN: V3 = [0.9, 0.85, 0.73];

const EFFORT = [
  { name: 'low', idx: 54, cost: '$3.10', time: '6.3 分', gap: 15 },
  { name: 'medium', idx: 56, cost: '$3.80', time: '7.7 分', gap: 11.5 },
  { name: 'high', idx: 62, cost: '$9.08', time: '16.9 分', gap: 7.2 },
  { name: 'xhigh', idx: 62, cost: '$14.83', time: '25.8 分', gap: 5.4 },
  { name: 'max', idx: 65, cost: '$26.54', time: '45.0 分', gap: 3.5 },
];

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 11.7) * 43758.5453; return s - Math.floor(s); };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

function pageRect(el: Element): Rect {
  const b = el.getBoundingClientRect();
  const x = b.left + window.scrollX, y = b.top + window.scrollY;
  return { x, y, w: b.width, h: b.height, cx: x + b.width / 2, cy: y + b.height / 2, r: x + b.width, b: y + b.height };
}

/* ---------- geometry ---------- */

function sampleSpline(w: WP[], step: number) {
  const X: number[] = [], Y: number[] = [], Z: number[] = [], R: number[] = [], C: number[] = [], wpI: number[] = [];
  const P = [w[0], ...w, w[w.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const d = (a: WP, b: WP) => Math.sqrt(Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1e-3));
    const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
    const seg = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const n = Math.max(2, Math.ceil(seg / step));
    const last = i === P.length - 3;
    wpI.push(X.length);
    const c = p1.c ?? RED;
    for (let k = 0; k < (last ? n + 1 : n); k++) {
      const f = k / n, t = t1 + (t2 - t1) * f;
      const L = (a: number, b: number, ta: number, tb: number) => ((tb - t) / (tb - ta)) * a + ((t - ta) / (tb - ta)) * b;
      const a1x = L(p0.x, p1.x, t0, t1), a1y = L(p0.y, p1.y, t0, t1);
      const a2x = L(p1.x, p2.x, t1, t2), a2y = L(p1.y, p2.y, t1, t2);
      const a3x = L(p2.x, p3.x, t2, t3), a3y = L(p2.y, p3.y, t2, t3);
      const b1x = L(a1x, a2x, t0, t2), b1y = L(a1y, a2y, t0, t2);
      const b2x = L(a2x, a3x, t1, t3), b2y = L(a2y, a3y, t1, t3);
      X.push(L(b1x, b2x, t1, t2)); Y.push(L(b1y, b2y, t1, t2));
      const e = smooth(f);
      Z.push((p1.z ?? -1) + ((p2.z ?? -1) - (p1.z ?? -1)) * e);
      R.push((p1.r ?? 1) + ((p2.r ?? 1) - (p1.r ?? 1)) * e);
      C.push(c[0], c[1], c[2]);
    }
  }
  wpI.push(X.length - 1);
  return { X, Y, Z, R, C, wpI };
}

/** Writes triangle-strip ribbons into a growable float buffer. */
class Batch {
  data: Float32Array;
  n = 0;
  constructor(cap: number) { this.data = new Float32Array(cap * STRIDE); }
  reset() { this.n = 0; }
  private v(x: number, y: number, z: number, sx: number, sy: number, t: number, u: number, r: number, c0: number, c1: number, c2: number) {
    if ((this.n + 1) * STRIDE > this.data.length) {
      const nd = new Float32Array(this.data.length * 2); nd.set(this.data); this.data = nd;
    }
    const d = this.data; let o = this.n * STRIDE;
    d[o++] = x; d[o++] = y; d[o++] = z; d[o++] = sx; d[o++] = sy; d[o++] = t; d[o++] = u; d[o++] = r; d[o++] = c0; d[o++] = c1; d[o] = c2;
    this.n++;
  }
  /** Polyline -> ribbon. r and col may be per-point arrays. Returns cumulative length array if requested. */
  line(X: ArrayLike<number>, Y: ArrayLike<number>, cnt: number, r: number | ArrayLike<number>, col: V3 | ArrayLike<number>, z: number | ArrayLike<number>, S?: Float32Array) {
    if (cnt < 2) return;
    let u = 0;
    const perPtCol = (col as ArrayLike<number>).length > 3;
    for (let i = 0; i < cnt; i++) {
      const a = Math.max(0, i - 1), b = Math.min(cnt - 1, i + 1);
      let tx = X[b] - X[a], ty = Y[b] - Y[a];
      const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      if (i > 0) u += Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]);
      if (S) S[i] = u;
      const rr = typeof r === 'number' ? r : r[i];
      const zz = typeof z === 'number' ? z : z[i];
      const c0 = perPtCol ? (col as ArrayLike<number>)[i * 3] : (col as V3)[0];
      const c1 = perPtCol ? (col as ArrayLike<number>)[i * 3 + 1] : (col as V3)[1];
      const c2 = perPtCol ? (col as ArrayLike<number>)[i * 3 + 2] : (col as V3)[2];
      if (i === 0 && this.n > 0) {
        const d = this.data, o = (this.n - 1) * STRIDE;
        this.v(d[o], d[o + 1], d[o + 2], d[o + 3], d[o + 4], d[o + 5], d[o + 6], d[o + 7], d[o + 8], d[o + 9], d[o + 10]);
        this.v(X[i], Y[i], zz, -ty, tx, -1, u, rr, c0, c1, c2);
      }
      this.v(X[i], Y[i], zz, -ty, tx, -1, u, rr, c0, c1, c2);
      this.v(X[i], Y[i], zz, -ty, tx, 1, u, rr, c0, c1, c2);
    }
  }
}

function makeStrand(name: string, wps: WP[], baseR: number, step = 5): Strand {
  const s = sampleSpline(wps, step);
  const n = s.X.length;
  const X = Float32Array.from(s.X), Y = Float32Array.from(s.Y), S = new Float32Array(n), M = new Float32Array(n);
  const R = s.R.map((r) => r * baseR);
  // knot bulges
  const tmp = new Float32Array(n);
  for (let i = 1; i < n; i++) tmp[i] = tmp[i - 1] + Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]);
  wps.forEach((w, k) => {
    if (!w.knot) return;
    const sk = tmp[s.wpI[k]], rk = R[s.wpI[k]];
    for (let i = 0; i < n; i++) R[i] *= 1 + 0.2 * Math.exp(-(((tmp[i] - sk) / (rk * 1.1)) ** 2));
  });
  const b = new Batch(n * 2 + 4);
  b.line(X, Y, n, R, s.C, s.Z, S);
  let m = -1e9;
  for (let i = 0; i < n; i++) { m = Math.max(m, Y[i]); M[i] = m; }
  return { name, data: b.data, count: b.n, n, len: S[n - 1], X, Y, S, M, rev: 0, wpS: s.wpI.map((i) => S[i]) };
}

function lenAtY(s: Strand, y: number) {
  let lo = 0, hi = s.n - 1;
  if (s.M[hi] <= y) return s.len;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (s.M[mid] > y) hi = mid; else lo = mid + 1; }
  return s.S[lo];
}

function pointAt(s: Strand, len: number) {
  let lo = 0, hi = s.n - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (s.S[mid] >= len) hi = mid; else lo = mid + 1; }
  const i = clamp(lo, 1, s.n - 1);
  const f = clamp((len - s.S[i - 1]) / Math.max(1e-3, s.S[i] - s.S[i - 1]), 0, 1);
  const a = Math.max(0, i - 3), b = Math.min(s.n - 1, i + 1);
  let tx = s.X[b] - s.X[a], ty = s.Y[b] - s.Y[a];
  const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  return { x: s.X[i - 1] + (s.X[i] - s.X[i - 1]) * f, y: s.Y[i - 1] + (s.Y[i] - s.Y[i - 1]) * f, tx, ty };
}

/* ---------- setup ---------- */

let back: Renderer | null = null, front: Renderer | null = null;
try {
  back = new Renderer($<HTMLCanvasElement>('gl-back'));
  front = new Renderer($<HTMLCanvasElement>('gl-front'));
  document.documentElement.classList.add('gl');
} catch {
  back = front = null;
}

// linen grain
(function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 220;
  const g = c.getContext('2d'); if (!g) return;
  const im = g.createImageData(220, 220);
  for (let y = 0; y < 220; y++) for (let x = 0; x < 220; x++) {
    const warp = hash(x * 3.1) * 0.5 + hash(x * 0.37 + y * 91.7) * 0.5;
    const weft = hash(y * 5.3 + 2) * 0.5 + hash(y * 0.41 + x * 57.3) * 0.5;
    const v = 255 - (warp * 0.5 + weft * 0.5) * 34 - hash(x * 13.1 + y * 71.7) * 14;
    const o = (y * 220 + x) * 4; im.data[o] = v; im.data[o + 1] = v - 2; im.data[o + 2] = v - 6; im.data[o + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  $('grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

let W = 0, VH = 0, mob = false, r0 = 6, gut = 30;
let A: Strand, A2: Strand, B: Strand;
let heroLen = 0, heroBottom = 0;
let ball = { cx: 0, cy: 0, R: 0 };
let loom: Rect, apexT = { x: 0, y: 0 }, apexB = { x: 0, y: 0 };
let cloth: Rect, clothEdge = 0, clothSw = 12, clothProg = 0;
let scoreBox: Rect;
let sections: { top: number; bottom: number; rgb: V3 }[] = [];
let bars: { x: number; y: number; len: number; col: V3; p: number; hit: number; val: HTMLElement }[] = [];
let knotAt: number[] = [];
let laidOut = false;
let intro = reduce ? 1 : 0, introStart = 0;

const N = 1000;
const sd = new Float32Array(N), sv = new Float32Array(N), sg = new Float32Array(N).fill(0.5);
const sCol = new Float32Array(N * 3), sRad = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const h = hash(i * 1.37), h2 = hash(i * 7.91 + 3);
  const br = 0.55 + 0.6 * h;
  const warm = h2 > 0.9 ? 1 : 0;
  sCol[i * 3] = (warm ? 0.98 : 0.86) * br; sCol[i * 3 + 1] = (warm ? 0.78 : 0.25 + 0.1 * h2) * br; sCol[i * 3 + 2] = (warm ? 0.6 : 0.15 + 0.08 * h2) * br;
  sRad[i] = 0.5 + 0.35 * hash(i * 3.3 + 1);
}
const loomBatch = new Batch(N * 30);
const stitchBatch = new Batch(4000);
const barBatch = new Batch(9 * 60);
const needleBatch = new Batch(40);

function hexRgb(h: string): V3 {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function layout() {
  W = document.documentElement.clientWidth; VH = window.innerHeight; mob = W <= 760;
  r0 = clamp(W * 0.0046, 3.3, 6.8);
  gut = Math.max(mob ? 9 : 16, W * 0.022);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  back?.resize(W, VH, dpr); front?.resize(W, VH, dpr);

  sections = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]')).map((el) => {
    const r = pageRect(el); return { top: r.y, bottom: r.b, rgb: hexRgb(el.dataset.bg!) };
  });
  const sec = (i: number) => pageRect($(`s${i}`));

  /* hero weave */
  const hbig = $('hbig');
  const L = Array.from(hbig.querySelectorAll('i')).map((el) => pageRect(el));
  const S = parseFloat(getComputedStyle(hbig).fontSize);
  const base = pageRect($('hbl')).y;
  const xh = S * 0.47, ym = base - xh * 0.5;
  const gap = (i: number) => (L[i].r + L[i + 1].x) / 2;
  const E = pageRect($('heroEnd'));
  const ver = pageRect(document.querySelector('.h-ver')!);
  const HR = mob ? 1.25 : 1.5;
  heroBottom = sec(0).b;
  const s1 = sec(1), s2 = sec(2), s3 = sec(3), s4 = sec(4), s5 = sec(5), s6 = sec(6);
  const br = pageRect($('ball'));
  ball = { cx: br.cx, cy: br.cy, R: br.w / 2 };

  const wA: WP[] = [
    { x: -80, y: ym - S * 0.3, z: -1, r: HR },
    { x: L[0].x - S * 0.06, y: ym - xh * 0.34, z: -1, r: HR },
    { x: L[0].cx, y: ym + xh * 0.16, z: -1, r: HR },
    { x: gap(0), y: ym + xh * 0.02, z: 0, r: HR },
    { x: L[1].cx, y: ym - xh * 0.3, z: 1, r: HR },
    { x: gap(1), y: ym - xh * 0.04, z: 0, r: HR },
    { x: L[2].cx, y: ym + xh * 0.22, z: -1, r: HR },
    { x: gap(2), y: ym - xh * 0.02, z: 0, r: HR },
    { x: L[3].cx, y: ym - xh * 0.34, z: 1, r: HR },
    { x: gap(3), y: ym - xh * 0.06, z: 0, r: HR },
    { x: L[4].cx, y: ym + xh * 0.2, z: -1, r: HR },
    { x: L[4].r + S * 0.03, y: ym - xh * 0.3, z: -1, r: HR },
    { x: ver.cx, y: ver.y - S * 0.1, z: -1, r: HR },
    { x: Math.min(W - gut, ver.r + S * 0.1), y: ver.cy + S * 0.02, z: -1, r: HR },
  ];
  if (mob) {
    // a slow loop fills the tall phone poster before the needle comes to rest
    const lc = { x: W * 0.5, y: (ver.b + E.y) / 2 - VH * 0.01 }, lr = Math.min(W * 0.2, (E.y - ver.b) * 0.3);
    for (const deg of [-50, 30, 110, 190, 270, 345]) {
      const a = (deg * Math.PI) / 180;
      wA.push({ x: lc.x + Math.cos(a) * lr * 1.25, y: lc.y + Math.sin(a) * lr, z: -1, r: HR });
    }
    wA.push({ x: E.x + 16, y: E.y - VH * 0.09, z: -1, r: HR });
  } else {
    wA.push({ x: Math.min(W - gut, E.x + W * 0.05), y: E.y - VH * 0.22, z: -1, r: HR });
  }
  const eWp: WP = { x: E.x, y: E.y, z: -1 };
  wA.push(eWp);
  if (mob) {
    wA.push({ x: W - gut, y: s1.y + VH * 0.12 }, { x: W - gut, y: ball.cy - ball.R * 1.0 }, { x: W - gut - 26, y: ball.cy - ball.R * 0.5 });
  } else {
    wA.push({ x: ball.cx - ball.R * 0.3, y: ball.cy - ball.R * 1.06 }, { x: ball.cx - ball.R * 0.12, y: ball.cy - ball.R * 0.55 });
  }
  A = makeStrand('A', wA, r0);
  heroLen = A.wpS[wA.indexOf(eWp)];

  /* ball -> loom apex */
  loom = pageRect($('loom'));
  const fanGap = (mob ? 0.15 : 0.17) * VH;
  apexT = { x: loom.cx, y: loom.y - fanGap };
  apexB = { x: loom.cx, y: loom.b + fanGap };
  const xr = mob ? W - gut : W * 0.74;
  A2 = makeStrand('A2', [
    { x: ball.cx - ball.R * 0.42, y: ball.cy + ball.R * 0.5 },
    { x: ball.cx - ball.R * 0.8, y: ball.cy + ball.R * 1.0 },
    { x: mob ? W * 0.5 : W * 0.55, y: s1.b - VH * 0.03 },
    { x: xr, y: s2.y + VH * 0.04 },
    { x: mob ? xr : W * 0.8, y: apexT.y - VH * 0.24 },
    { x: mob ? W * 0.8 : W * 0.66, y: apexT.y - VH * 0.1 },
    { x: apexT.x + (mob ? 20 : 40), y: apexT.y - VH * 0.035 },
    { x: apexT.x, y: apexT.y },
  ], r0);

  /* loom -> end */
  const T = pageRect($('track'));
  const tcy = T.y + 23;
  const Q = pageRect($('route'));
  const f = (u: number, v: number) => ({ x: Q.x + u * Q.w, y: Q.y + v * Q.h });
  const rB = clamp(W * 0.021, 11, 30) / r0;
  cloth = pageRect($('cloth'));
  clothEdge = cloth.y + cloth.h * 0.55;
  clothSw = r0 * 2.05;
  const selv = cloth.x - Math.max(13, r0 * 2.6);
  const rightG = W - gut;
  const wB: WP[] = [
    { x: apexB.x, y: apexB.y },
    { x: apexB.x - (mob ? 10 : 40), y: apexB.y + VH * 0.06 },
    { x: W * 0.24, y: s3.y + VH * 0.06 },
    { x: gut, y: s3.y + VH * 0.15 },
    { x: gut, y: tcy - 90 },
    { x: gut + 3, y: tcy - 30 },
    { x: T.x + 6, y: tcy },
    { x: T.x + T.w * 0.33, y: tcy },
    { x: T.x + T.w * 0.66, y: tcy },
    { x: T.r + 4, y: tcy },
    mob ? { x: rightG, y: tcy + 44 } : { x: T.r + 70, y: tcy + 60 },
    mob ? { x: rightG, y: s3.b - VH * 0.05 } : { x: W * 0.62, y: s3.b - VH * 0.05 },
    { x: rightG, y: s4.y + VH * 0.12 },
    { x: rightG, y: s4.b - VH * 0.16 },
    { x: rightG, y: s5.y + VH * 0.05 },
    { ...f(0.95, -0.04), y: Math.max(f(0, -0.04).y, s5.y + VH * 0.12) },
    { ...f(0.82, 0.09), r: rB },
    { ...f(0.67, 0.17), r: rB, c: SLATE, knot: true },
    { ...f(0.43, 0.24), r: rB, c: SLATE },
    { ...f(0.22, 0.33), r: rB, c: SLATE },
    { ...f(0.12, 0.44), r: rB, knot: true },
    { ...f(0.14, 0.54), r: rB },
    { ...f(0.3, 0.63), r: rB, c: MOSS, knot: true },
    { ...f(0.55, 0.7), r: rB, c: MOSS },
    { ...f(0.8, 0.78), r: rB, knot: true },
    { ...f(0.9, 0.88), r: rB },
    { ...f(0.93, 1.0), r: 1 },
    ...(mob
      ? [{ x: W * 0.55, y: s6.y + VH * 0.02 }, { x: gut, y: s6.y + VH * 0.1 }, { x: gut, y: cloth.y - VH * 0.06 }]
      : [{ x: W * 0.78, y: s6.y + VH * 0.07 }, { x: selv + 90, y: cloth.y - VH * 0.09 }]),
    { x: selv, y: cloth.y + VH * 0.05 },
    { x: selv, y: clothEdge - 80 },
    { x: selv + 8, y: clothEdge - 22 },
    { x: cloth.x + 26, y: clothEdge - 3 },
    { x: cloth.x + cloth.w * 0.3, y: clothEdge - 3 },
    { x: cloth.x + cloth.w * 0.56, y: clothEdge - 3 },
  ];
  B = makeStrand('B', wB, r0);

  /* knot tails */
  const knotIdx = wB.map((w, i) => (w.knot ? i : -1)).filter((i) => i >= 0);
  knotAt = knotIdx.map((wi) => B.wpS[wi] + rB * r0 * 1.2);
  const knotCols: [V3, V3][] = [[RED, SLATE], [SLATE, RED], [RED, MOSS], [MOSS, RED]];
  knotIdx.forEach((wi, k) => {
    const miscBatch = new Batch(200);
    const p = pointAt(B, B.wpS[wi]);
    const rr = rB * r0;
    const nx = -p.ty, ny = p.tx;
    // loose ends: one from each thread, curling away from the knot
    for (let side = 0; side < 2; side++) {
      const sgn = side ? 1 : -1;
      const xs: number[] = [], ys: number[] = [], rs: number[] = [];
      const M = 9;
      for (let j = 0; j < M; j++) {
        const f = j / (M - 1);
        const out = rr * (0.5 + 1.9 * Math.sin(f * 1.35)), along = rr * (0.2 + 2.6 * f * f) * -sgn;
        xs.push(p.x + nx * out * sgn + p.tx * along);
        ys.push(p.y + ny * out * sgn + p.ty * along);
        rs.push(rr * 0.4 * (1 - 0.55 * f * f));
      }
      miscBatch.line(xs, ys, M, rs, knotCols[k][side], -1);
    }
    // binding wraps across the splice
    for (let j = -2; j <= 2; j++) {
      const o = j * rr * 0.36, slant = rr * 0.34;
      const c = knotCols[k][j < 0 ? 1 : 0];
      const M = 7, xs: number[] = [], ys: number[] = [], rs: number[] = [];
      for (let m = 0; m < M; m++) {
        const f = m / (M - 1) * 2 - 1;
        xs.push(p.x + p.tx * (o + slant * f) + nx * rr * 1.36 * f);
        ys.push(p.y + p.ty * (o + slant * f) + ny * rr * 1.36 * f);
        rs.push(rr * 0.2 * (1 - 0.5 * f * f * f * f));
      }
      miscBatch.line(xs, ys, M, rs, [c[0] * 1.08, c[1] * 1.08, c[2] * 1.08], -1);
    }
    back?.set(`knot${k}`, miscBatch.data, miscBatch.n);
  });

  /* token mark */
  const tk = pageRect($('tokMark'));
  const tokB = new Batch(8);
  tokB.line([tk.x, tk.x + tk.w * 0.5, tk.r], [tk.cy, tk.cy - 0.6, tk.cy], 3, [1.2, 2.2, 1.2], RED, -1);

  /* bars */
  const barR = mob ? 3.4 : 5;
  bars = [];
  document.querySelectorAll<HTMLElement>('#cmp .grp').forEach((g) => {
    const max = parseFloat(g.dataset.max!);
    g.querySelectorAll<HTMLElement>('.row').forEach((row) => {
      const trk = pageRect(row.querySelector('.trk')!);
      const fr = parseFloat(row.dataset.v!) / max;
      const val = row.querySelector<HTMLElement>('.val')!;
      val.style.setProperty('--f', String(fr));
      const col = row.classList.contains('me') ? RED : row.classList.contains('gm') ? TEAL : OCHRE;
      bars.push({ x: trk.x, y: trk.cy, len: trk.w * fr, col, p: reduce ? 1 : 0, hit: -10, val });
    });
  });
  barBatchR = barR;

  /* stitched score */
  scoreBox = pageRect($('score'));
  buildStitches(Number($<HTMLInputElement>('effort').value), true);

  if (back) {
    back.set('A', A.data, A.count); back.set('A2', A2.data, A2.count); back.set('B', B.data, B.count);
    back.set('tok', tokB.data, tokB.n);
  }
  front?.set('A', A.data, A.count);

  const tY = window.scrollY + VH * 0.7;
  for (const s of [A, A2, B]) s.rev = reduce ? s.len : lenAtY(s, tY);
  if (!reduce) A.rev = Math.max(A.rev, heroLen * intro);
  clothProg = reduce ? clothEdge : Math.min(clothEdge, tY);
  laidOut = true;
}
let barBatchR = 3.6;

/* ---------- stitched number ---------- */

interface Stitch { x0: number; y0: number; x1: number; y1: number; br: number }
let stitchCur: Stitch[] = [], stitchOld: Stitch[] = [];
let stitchT0 = -1, stitchOldT0 = -1, stitchR = 1.8, stitchStatic = false, stitchArmed = false;

function buildStitches(level: number, instant: boolean) {
  const e = EFFORT[level];
  const box = scoreBox;
  const txt = String(e.idx);
  const fs = Math.min(box.h * 0.98, box.w / 1.32);
  const num = $('scoreNum');
  num.textContent = txt; num.style.fontSize = `${fs}px`;
  const q = 0.5;
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(box.w * q)); c.height = Math.max(2, Math.round(box.h * q));
  const g = c.getContext('2d', { willReadFrequently: true });
  const out: Stitch[] = [];
  if (g) {
    g.font = `900 ${fs * q}px "Fraunces"`;
    g.textAlign = 'center';
    const m = g.measureText(txt);
    g.fillStyle = '#000';
    g.fillText(txt, c.width / 2, (c.height + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    const im = g.getImageData(0, 0, c.width, c.height).data;
    const inside = (x: number, y: number) => {
      const ix = Math.round(x * q), iy = Math.round(y * q);
      return ix >= 0 && iy >= 0 && ix < c.width && iy < c.height && im[(iy * c.width + ix) * 4 + 3] > 110;
    };
    const k = fs / 420;
    const gapPx = Math.max(2.4, e.gap * Math.max(k, 0.55));
    stitchR = clamp(1.75 * Math.max(k, 0.6), 1.05, 2.3);
    const th = -0.36, dx = Math.cos(th), dy = Math.sin(th), px = -dy, py = dx;
    const D = Math.hypot(box.w, box.h) / 2, cx = box.w / 2, cy = box.h / 2;
    let row = 0;
    for (let v = -D; v <= D; v += gapPx, row++) {
      let start = NaN;
      const rowSt: Stitch[] = [];
      for (let u = -D; u <= D + 2; u += 1.5) {
        const x = cx + dx * u + px * v, y = cy + dy * u + py * v;
        const ins = inside(x, y);
        if (ins && Number.isNaN(start)) start = u;
        if (!ins && !Number.isNaN(start)) {
          if (u - start > 5) {
            const j0 = (hash(row * 9.1 + u) - 0.5) * 2.4, j1 = (hash(row * 4.3 + u * 1.7) - 0.5) * 2.4;
            rowSt.push({
              x0: box.x + cx + dx * (start + j0) + px * v, y0: box.y + cy + dy * (start + j0) + py * v,
              x1: box.x + cx + dx * (u + j1) + px * v, y1: box.y + cy + dy * (u + j1) + py * v,
              br: 0.86 + 0.28 * hash(row * 3.7 + u * 0.13),
            });
          }
          start = NaN;
        }
      }
      if (row % 2) { rowSt.reverse(); rowSt.forEach((s) => { [s.x0, s.x1] = [s.x1, s.x0]; [s.y0, s.y1] = [s.y1, s.y0]; }); }
      out.push(...rowSt);
    }
  }
  const now = performance.now() / 1000;
  if (instant || reduce) {
    stitchOld = []; stitchCur = out; stitchT0 = stitchArmed || reduce ? -100 : -1;
  } else {
    stitchOld = stitchCur; stitchOldT0 = now; stitchCur = out; stitchT0 = now + 0.16;
  }
  stitchStatic = false;
  $('rIdx').textContent = String(e.idx); $('rCost').textContent = e.cost; $('rTime').textContent = e.time;
  document.querySelectorAll('.stops li').forEach((li, i) => li.classList.toggle('on', i === level));
  $('track').style.setProperty('--p', String(level / 4));
}

function writeStitches(now: number) {
  if (stitchStatic) return;
  const b = stitchBatch; b.reset();
  let busy = false;
  const put = (s: Stitch, p: number) => {
    if (p <= 0.02) return;
    const x1 = s.x0 + (s.x1 - s.x0) * p, y1 = s.y0 + (s.y1 - s.y0) * p;
    const l = Math.hypot(x1 - s.x0, y1 - s.y0); if (l < 2) return;
    const ex = ((x1 - s.x0) / l) * Math.min(2.2, l * 0.3), ey = ((y1 - s.y0) / l) * Math.min(2.2, l * 0.3);
    const c: V3 = [RED[0] * s.br, RED[1] * s.br, RED[2] * s.br];
    b.line([s.x0, s.x0 + ex, x1 - ex, x1], [s.y0, s.y0 + ey, y1 - ey, y1], 4, [stitchR * 0.35, stitchR, stitchR, stitchR * 0.35], c, -1);
  };
  if (stitchOld.length) {
    const p = 1 - (now - stitchOldT0) / 0.22;
    if (p > 0) { busy = true; for (const s of stitchOld) put(s, p); } else stitchOld = [];
  }
  if (stitchT0 > -50 && stitchT0 >= 0) {
    const n = stitchCur.length, T = 1.0, dur = 0.16;
    const t = now - stitchT0;
    if (t < T + dur) busy = true;
    for (let i = 0; i < n; i++) put(stitchCur[i], clamp((t - (i / n) * T) / dur, 0, 1));
  } else if (stitchT0 <= -50) {
    for (const s of stitchCur) put(s, 1);
  }
  back?.set('stitch', b.data, b.n, true);
  if (!busy && (stitchT0 <= -50 || stitchT0 >= 0)) stitchStatic = true;
}

/* ---------- interaction ---------- */

const effortEl = $<HTMLInputElement>('effort');
const ping = document.createElement('span'); ping.className = 'ping'; $('track').appendChild(ping);
effortEl.addEventListener('input', () => {
  $('track').classList.add('used');
  if (!laidOut) return;
  stitchArmed = true;
  buildStitches(Number(effortEl.value), false);
});

let ptrX = NaN, ptrT = 0, sheenY = 0, plucked = false;
const loomEl = $('loom');
function pluck(x0: number, x1: number, y: number, power: number) {
  if (!loom) return;
  const sp = loom.w / (N - 1);
  let a = Math.floor((Math.min(x0, x1) - loom.x) / sp) - 2, b = Math.ceil((Math.max(x0, x1) - loom.x) / sp) + 2;
  a = clamp(a, 0, N - 1); b = clamp(b, 0, N - 1);
  const g = clamp((y - loom.y) / loom.h, 0.12, 0.88);
  for (let i = a; i <= b; i++) { sv[i] += power; sg[i] = g; }
}
loomEl.addEventListener('pointermove', (e) => {
  const now = performance.now();
  const x = e.pageX, y = e.pageY;
  sheenY = y;
  if (!Number.isNaN(ptrX) && now - ptrT < 120) {
    const dx = x - ptrX;
    if (Math.abs(dx) > 0.5) {
      pluck(ptrX, x, y, clamp(dx * 26, -900, 900));
      if (!plucked) { plucked = true; $('loomHint').classList.add('off'); }
    }
  }
  ptrX = x; ptrT = now;
});
loomEl.addEventListener('pointerdown', (e) => {
  pluck(e.pageX - 14, e.pageX + 14, e.pageY, 520);
  ptrX = e.pageX; ptrT = performance.now(); sheenY = e.pageY;
});
loomEl.addEventListener('pointerleave', () => { ptrX = NaN; });

let demoT = -1, demoDone = false;
let loomS = 0, loomV = 0, loomKey = '';

/* ---------- frame ---------- */

function writeLoom(time: number, dt: number) {
  const sp = loom.w / (N - 1);
  // physics
  const steps = Math.max(1, Math.ceil(dt / 0.006));
  const h = dt / steps;
  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < N; i++) {
      const l = i > 0 ? sd[i - 1] : 0, r = i < N - 1 ? sd[i + 1] : 0;
      sv[i] += (-760 * sd[i] - 2.6 * sv[i] + 520 * (l + r - 2 * sd[i])) * h;
    }
    for (let i = 0; i < N; i++) sd[i] = clamp(sd[i] + sv[i] * h, -70, 70);
  }
  // unfurl: one thread opens into a thousand, with a little overshoot
  const open = reduce ? 1 : A2.rev > A2.len - 6 ? 1 : 0;
  if (reduce) { loomS = 1; } else {
    loomV += (46 * (open - loomS) - 8.4 * loomV) * dt;
    loomS = Math.max(0, loomS + loomV * dt);
  }
  const sKey = loomS.toFixed(3);
  if (sKey !== loomKey) { loomKey = sKey; loomEl.style.setProperty('--s', sKey); }
  const b = loomBatch; b.reset();
  const K = 9;
  const xs = new Float32Array(K + 4), ys = new Float32Array(K + 4), cs = new Float32Array((K + 4) * 3), rs = new Float32Array(K + 4);
  for (let i = 0; i < N; i++) {
    const x = loom.cx + (loom.x + i * sp - loom.cx) * loomS;
    const idle = reduce ? 0 : Math.sin(time * 1.1 + i * 0.021) * 0.7 + Math.sin(time * 0.53 + i * 0.13) * 0.4;
    const d = sd[i] + idle, g = sg[i];
    const glow = Math.min(1, Math.abs(sd[i]) / 16);
    const c0 = sCol[i * 3] + glow * 0.5, c1 = sCol[i * 3 + 1] + glow * 0.5, c2 = sCol[i * 3 + 2] + glow * 0.36;
    xs[0] = apexT.x; ys[0] = apexT.y;
    xs[1] = x; ys[1] = loom.y;
    for (let k = 0; k < K; k++) {
      const yf = (k + 1) / (K + 1);
      const tri = yf < g ? yf / g : (1 - yf) / (1 - g);
      xs[2 + k] = x + d * Math.sin(tri * 1.5708);
      ys[2 + k] = loom.y + loom.h * yf;
    }
    xs[K + 2] = x; ys[K + 2] = loom.b;
    xs[K + 3] = apexB.x; ys[K + 3] = apexB.y;
    for (let k = 0; k < K + 4; k++) {
      const yf = k < 2 ? 0 : k > K + 1 ? 1 : (k - 1) / (K + 1);
      const dim = k === 0 || k === K + 3 ? 0.42 : 0.74 + 0.36 * Math.sin(yf * Math.PI);
      cs[k * 3] = c0 * dim; cs[k * 3 + 1] = c1 * dim; cs[k * 3 + 2] = c2 * dim; rs[k] = sRad[i];
    }
    b.line(xs, ys, K + 4, rs, cs, -1);
  }
  back!.set('loom', b.data, b.n, true);
}

function writeBars(time: number, dt: number, tY: number) {
  const b = barBatch; b.reset();
  const P = 22;
  const xs = new Float32Array(P), ys = new Float32Array(P);
  for (const bar of bars) {
    const target = reduce || tY > bar.y + 20 ? 1 : 0;
    const before = bar.p;
    bar.p += (target - bar.p) * (1 - Math.exp(-dt * 4.2));
    if (before < 0.9 && bar.p >= 0.9) bar.hit = time;
    bar.val.classList.toggle('on', bar.p > 0.93);
    if (bar.p < 0.004) continue;
    const len = bar.len * bar.p;
    const amp = reduce ? 0 : 5 * Math.exp(-3.2 * (time - bar.hit)) * Math.sin((time - bar.hit) * 44);
    for (let k = 0; k < P; k++) {
      const f = k / (P - 1);
      xs[k] = bar.x + len * f; ys[k] = bar.y + amp * Math.sin(f * Math.PI);
    }
    b.line(xs, ys, P, barBatchR, bar.col, -1);
  }
  back!.set('bars', b.data, b.n, true);
}

let needleAng = Math.PI / 2, needleA = 1;
function writeNeedle(time: number, dt: number, sy: number) {
  let s: Strand | null = null;
  if (B.rev > 2) s = B;
  else if (A2.rev > 2 && A2.rev < A2.len - 2) s = A2;
  else if (A.rev < A.len - 2 && A2.rev <= 2) s = A;
  const want = s ? 1 : 0;
  needleA += (want - needleA) * (1 - Math.exp(-dt * 10));
  if (!s || needleA < 0.02) { front!.set('needle', needleBatch.data, 0, true); return; }
  const p = pointAt(s, Math.max(1, s.rev));
  let ang = Math.atan2(p.ty, p.tx);
  if (s === A && sy < 4 && !reduce) ang += Math.sin(time * 1.4) * 0.07;
  let dA = ang - needleAng; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
  needleAng += reduce ? dA : dA * (1 - Math.exp(-dt * 9));
  const Ln = clamp(W * 0.085, 74, 132), nr = Math.max(2.1, r0 * 0.5);
  const dx = Math.cos(needleAng), dy = Math.sin(needleAng);
  const K = 12, xs: number[] = [], ys: number[] = [], rs: number[] = [];
  for (let k = 0; k <= K; k++) {
    const f = k / K;
    xs.push(p.x + dx * Ln * (f - 0.04)); ys.push(p.y + dy * Ln * (f - 0.04));
    rs.push(f < 0.12 ? nr * (0.7 + 4.6 * f) * 0.86 : nr * Math.pow(1 - (f - 0.12) / 0.88, 0.62) * 1.08 + 0.1);
  }
  const b = needleBatch; b.reset();
  b.line(xs, ys, K + 1, rs, [1, 1, 1], 1);
  front!.set('needle', b.data, b.n, true);
}

let lastT = 0, bgKey = '';
const rot = new Float32Array(9);

function frame(tms: number) {
  requestAnimationFrame(frame);
  if (!laidOut) return;
  const time = tms / 1000;
  const dt = Math.min(0.05, Math.max(0.001, time - lastT)); lastT = time;
  const sy = window.scrollY;
  const tY = sy + VH * 0.7;

  // background
  const c = sy + VH * 0.5;
  let rgb: V3 = sections[0].rgb;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (c >= s.top && (c < s.bottom || i === sections.length - 1)) {
      rgb = s.rgb;
      const z = VH * 0.17;
      const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      if (i > 0 && c - s.top < z) rgb = mix(sections[i - 1].rgb, s.rgb, smooth(0.5 + (c - s.top) / (2 * z)));
      else if (i < sections.length - 1 && s.bottom - c < z) rgb = mix(s.rgb, sections[i + 1].rgb, smooth(0.5 - (s.bottom - c) / (2 * z)));
      break;
    }
  }
  const key = `rgb(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0})`;
  if (key !== bgKey) { bgKey = key; document.body.style.backgroundColor = key; }

  if (!back || !front) return;

  if (!reduce) {
    if (intro < 1) intro = clamp((time - introStart) / 1.9, 0, 1);
    const ie = intro < 0.5 ? 4 * intro ** 3 : 1 - Math.pow(-2 * intro + 2, 3) / 2;
    const k = 1 - Math.exp(-dt * 6.5);
    // follow the scroll with some weight; after a long jump, catch up at once instead of replaying everything
    const follow = (cur: number, target: number) => (Math.abs(target - cur) > VH * 3 ? target : cur + (target - cur) * k);
    const tA = Math.max(heroLen * ie, lenAtY(A, tY));
    A.rev = intro < 1 && tA <= heroLen ? tA : follow(A.rev, tA);
    const tA2 = A.rev > A.len - 4 ? lenAtY(A2, tY) : 0;
    A2.rev = follow(A2.rev, tA2);
    const tB = tY > apexB.y ? lenAtY(B, tY) : 0;
    B.rev = follow(B.rev, tB);
    if (tB > 0 && loomS < 0.5 && A2.rev > A2.len - 6) { loomS = 1; loomV = 0; }
    clothProg += (Math.min(clothEdge, tY) - clothProg) * (1 - Math.exp(-dt * 5));
  }

  const vis = (y0: number, y1: number) => y1 > sy - 80 && y0 < sy + VH + 80;

  back.begin(sy);
  back.draw('A', { reveal: A.rev, layer: -1, shadow: 0.2, shadowOff: [r0 * 0.7, r0 * 1.2] });
  back.draw('A2', { reveal: A2.rev, shadow: 0.2, shadowOff: [r0 * 0.7, r0 * 1.2] });
  back.draw('tok', { shadow: 0.2, shadowOff: [1, 2] });

  if (vis(ball.cy - ball.R * 1.5, ball.cy + ball.R * 1.5)) {
    const a = reduce ? 0.6 : sy * 0.0011 + 0.6, bx = 0.42;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(bx), sb = Math.sin(bx);
    // Ry(a) * Rx(bx), column-major
    rot[0] = ca; rot[1] = 0; rot[2] = -sa;
    rot[3] = sa * sb; rot[4] = cb; rot[5] = ca * sb;
    rot[6] = sa * cb; rot[7] = -sb; rot[8] = ca * cb;
    back.drawBall(ball.cx, ball.cy, ball.R, rot, RED, ball.R / (r0 * 2.1));
  }

  if (vis(apexT.y, apexB.y)) {
    if (!demoDone && !reduce && loomS > 0.97 && sy + VH * 0.62 > loom.y) { demoDone = true; demoT = time; }
    if (demoT >= 0) {
      const p = (time - demoT) / 1.5;
      if (p < 1) {
        const x = loom.x + loom.w * (0.18 + 0.64 * smooth(p));
        pluck(x - 6, x + 6, loom.y + loom.h * (0.3 + 0.4 * p), 120);
      } else demoT = -1;
    }
    writeLoom(time, dt);
    back.draw('loom', { mode: 3, alpha: Math.min(1, loomS * 4), sheenY: sheenY > loom.y && sheenY < loom.b ? sheenY : loom.y + loom.h * (0.5 + 0.3 * Math.sin(time * 0.5)) });
  }

  if (vis(scoreBox.y, scoreBox.b)) {
    if (!stitchArmed && (reduce || tY > scoreBox.y + scoreBox.h * 0.45)) {
      stitchArmed = true; stitchT0 = reduce ? -100 : time; stitchStatic = false;
    }
    writeStitches(time);
    back.draw('stitch', { shadow: 0.18, shadowOff: [1.2, 2.2], shadowInfl: 1.5 });
  }

  if (bars.length && vis(bars[0].y - 40, bars[bars.length - 1].y + 40)) {
    writeBars(time, dt, tY);
    back.draw('bars', { shadow: 0.2, shadowOff: [2, 4] });
  }

  if (vis(cloth.y, cloth.b)) {
    back.drawCloth([cloth.x, cloth.y, cloth.w, cloth.h], clothEdge, clothProg, clothSw, reduce ? 0 : time, RED, LINEN);
  }

  back.draw('B', { reveal: B.rev, shadow: 0.22, shadowOff: [r0 * 0.8, r0 * 1.4] });
  knotAt.forEach((at, k) => {
    const a = reduce ? 1 : clamp((B.rev - at) / 40, 0, 1);
    if (a > 0) back!.draw(`knot${k}`, { alpha: a, shadow: 0.2 * a, shadowOff: [3, 6] });
  });

  front.begin(sy);
  if (sy < heroBottom) front.draw('A', { reveal: A.rev, layer: 1, shadow: 0.34, shadowOff: [r0 * 0.9, r0 * 1.5] });
  writeNeedle(time, dt, sy);
  front.draw('needle', { mode: 2, alpha: needleA, shadow: 0.26 * needleA, shadowOff: [5, 9], shadowInfl: 1.5 });
}

/* ---------- boot ---------- */

let rsT = 0;
function relayout() { clearTimeout(rsT); rsT = window.setTimeout(layout, 120); }

async function boot() {
  try {
    await Promise.all([
      document.fonts.load('560 100px "Fraunces"'), document.fonts.load('900 100px "Fraunces"'),
      document.fonts.load('500 12px "Plex Mono"'),
    ]);
    await document.fonts.ready;
  } catch { /* fall back to system fonts */ }
  layout();
  introStart = performance.now() / 1000;
  document.documentElement.classList.add('ready');
  window.addEventListener('resize', relayout);
  new ResizeObserver(relayout).observe($('page'));
  requestAnimationFrame(frame);
}
boot();
