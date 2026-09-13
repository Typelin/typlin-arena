import { clamp } from "./state.js";
export const THREADS = 96;
export const SAMPLES = 88;
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;

function project(x, y, z, tilt = 0.88, turn = -0.48) {
  const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
  const zz = y * Math.sin(tilt) + z * Math.cos(tilt);
  const xx = x * Math.cos(turn) - yy * Math.sin(turn);
  const y2 = x * Math.sin(turn) + yy * Math.cos(turn);
  const perspective = 950 / (950 - zz);
  return [400 + xx * perspective, 329 + y2 * perspective];
}

export function pointAt(stage, i, t, state, phase = 0, reverse = false) {
  const q = i / (THREADS - 1);
  const v = (q - 0.5) * 2;
  const phi = q * TAU;
  const open = state.tension;
  const wild = state.direction === "wonder" ? 1 : 0;
  const ax = (state.anchor.x - 0.5) * 2;
  const ay = (state.anchor.y - 0.5) * 2;
  const memory = state.traces.length ? state.traces.reduce((s, p) => s + p.x - p.y, 0) / state.traces.length : 0;
  const other = reverse !== state.alternate ? -1 : 1;
  let x, y;
  if (stage === 0) {
    const u = t * TAU;
    const twist = phi + u;
    const radius = 202 + 9 * Math.sin(u * 3 + phase);
    const tube = 63 + 10 * Math.sin(phi * 2);
    const ring = project((radius + tube * Math.cos(twist)) * Math.cos(u), (radius + tube * Math.cos(twist)) * Math.sin(u), tube * Math.sin(twist) * other, .79, -.55);
    const branch = Math.floor(i / 32) - 1;
    const lane = ((i % 32) / 31 - .5) * 2;
    const expansion = Math.pow(Math.sin(t * Math.PI * .5), 1.45);
    const route = [60 + 680 * t, 330 + branch * 170 * expansion + lane * (48 - 26 * Math.sin(t * Math.PI)) + Math.sin(t * Math.PI) * (branch * 22 + ay * 18)];
    const focused = [60 + 680 * t, 330 + v * (8 + 116 * Math.pow(Math.abs(t * 2 - 1), 2)) + Math.sin(t * Math.PI) * ay * 24];
    const amount = Math.min(1, Math.abs(ax) * 1.55);
    const shape = ax < 0 ? focused : route;
    x = lerp(ring[0], shape[0], amount);
    y = lerp(ring[1], shape[1], amount);
  } else if (stage === 1) {
    const branch = Math.floor(i / 32) - 1;
    const lane = ((i % 32) / 31 - .5) * 2;
    const spread = Math.pow(state.anchor.x, 1.35);
    const split = Math.pow(Math.sin(t * Math.PI * .5), 1.7);
    x = 52 + 696 * t;
    y = 330 + v * 135 * Math.pow(1 - t, 3) + branch * 191 * spread * split + lane * (10 + 26 * spread) + Math.sin(t * Math.PI) * (ay * 30 + branch * 19 * spread);
  } else if (stage === 2) {
    if (!state.scars.length) return pointAt(1, i, t, state, phase, reverse);
    const left = t < .5;
    const local = left ? t * 2 : (t - .5) * 2;
    const scar = state.scars[0] || { x: .5, y: .5 };
    const gap = 42 + state.scars.length * 10;
    x = left ? 48 + (310 - gap) * local : 442 + gap + (310 - gap) * local;
    const spread = left ? Math.pow(local, 2) : Math.pow(1 - local, 2);
    y = 330 + v * (200 - spread * 80) + (left ? -1 : 1) * spread * (66 + q * 43) * other;
    x += spread * Math.sin(phi * 2 + open * 3) * 26;
    y += Math.sin(t * TAU) * ay * 50 + (scar.y - .5) * spread * 80;
  } else if (stage === 3) {
    const bank = i < THREADS / 2;
    const n = bank ? i / 47 : (i - 48) / 47;
    const ribbon = (n - .5) * 220;
    const u = t * Math.PI * 1.72 - Math.PI * .86;
    const curl = Math.sin(u) * 280;
    const depth = Math.cos(u) * (135 + ribbon * .5);
    x = 400 + curl * (bank ? .77 : -.77) + ribbon * .53;
    y = 340 + curl * .64 + depth * (bank ? -1 : 1) * other + ribbon * .25;
    x += Math.sin(t * TAU) * (ax * 40 + memory * 70) + open * 18 * Math.sin(n * 10 + t * 4);
    y += Math.sin(t * Math.PI) * ay * 40 + wild * Math.cos(n * Math.PI) * 24;
    for (const scar of state.scars) {
      const center = .2 + scar.x * .6;
      const force = Math.exp(-Math.pow((t - center) / .15, 2)) * (22 + scar.y * 26);
      x += Math.cos(scar.angle) * force * (bank ? 1 : -1);
      y += Math.sin(scar.angle) * force * other;
    }
  } else {
    const warp = i < 48;
    const lane = ((i % 48) / 47 - .5) * 2;
    const travel = t * 2 - 1;
    const px = warp ? lane : travel;
    const py = warp ? travel : lane;
    const envelope = Math.sin(t * Math.PI);
    const wave = Math.sin(px * 3.3 + memory * 2) * Math.cos(py * 2.4);
    x = 400 + px * 302 + Math.sin(py * 3 + lane * 1.3) * (18 + open * 38) * envelope;
    y = 327 + py * 195 + wave * (45 + open * 42) * other + ax * 19 * envelope;
    if (state.traces.length) {
      const trace = state.traces[Math.min(state.traces.length - 1, Math.floor(t * state.traces.length))];
      x += (trace.x - .5) * 13 * envelope;
      y += (trace.y - .5) * 17 * envelope;
    }
    x += ay * 25 * Math.cos(lane * Math.PI) + wild * Math.sin(py * 6) * 14;
    for (const scar of state.scars) {
      const sx = 180 + scar.x * 440;
      const sy = 187 + scar.y * 280;
      const dx = x - sx, dy = y - sy;
      const dist = Math.hypot(dx, dy);
      const influence = Math.exp(-dist * dist / 7500) * 32;
      x += (dx / Math.max(18, dist)) * influence + Math.cos(scar.angle) * influence * .5;
      y += (dy / Math.max(18, dist)) * influence + Math.sin(scar.angle) * influence * .5;
    }
    y += memory * 35 * Math.sin(t * Math.PI) * other;
  }
  if (stage === 3) { x = 400 + (x - 400) * .94; y = 330 + (y - 330) * .84; }
  return [x, y];
}

export function pathFrom(points, stage, cut = false) {
  let d = "";
  for (let j = 0; j < points.length; j++) {
    const p = points[j];
    const move = j === 0 || (stage === 2 && j === Math.floor(points.length / 2)) || (cut && j === Math.floor(points.length * .53));
    d += `${move ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  }
  return d;
}

export function createFrame(stage, state, phase = 0, reverse = false) {
  return Array.from({ length: THREADS }, (_, i) => Array.from({ length: SAMPLES + 1 }, (_, j) => pointAt(stage, i, j / SAMPLES, state, phase, reverse)));
}
export function blendFrame(from, to, t) {
  return to.map((line, i) => line.map((p, j) => [lerp(from[i][j][0], p[0], t), lerp(from[i][j][1], p[1], t)]));
}
export function springProgress(t) {
  return t >= 1 ? 1 : 1 - Math.exp(-7.5 * t) * Math.cos(8.8 * t);
}
export function normalizedPoint(event, element) {
  const rect = element.getBoundingClientRect();
  const scale = Math.min(rect.width / 800, rect.height / 660);
  const width = 800 * scale, height = 660 * scale;
  const left = rect.left + (rect.width - width) / 2, top = rect.top + (rect.height - height) / 2;
  return { x: clamp((event.clientX - left) / width), y: clamp((event.clientY - top) / height) };
}
