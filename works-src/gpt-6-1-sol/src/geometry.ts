export type Point = { x: number; y: number; z: number };
export type LoomState = {
  progress: number;
  tension: number;
  direction: number;
  rotation: number;
  tilt: number;
  separation: number;
  time: number;
};
export type View = {
  width: number;
  height: number;
  mobile: boolean;
  print?: boolean;
  field?: { x: number; y: number; width: number; height: number };
};
export type Band = {
  points: Point[];
  depth: number;
  light: number;
  index: number;
};

export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

function surface(u: number, v: number, state: LoomState): Point {
  const { progress: p, tension, direction: d, separation, time } = state;
  const exploration = smooth((p - 0.12) / 0.27);
  const opening = smooth((p - 0.36) / 0.25);
  const finishing = smooth((p - 0.73) / 0.25);
  const phase = d * 0.48 + time * 0.055;
  const theta = u * (1 - finishing * 0.13) + finishing * 0.38;
  const radius =
    1 +
    Math.cos(u * 3 + phase) * (0.04 + exploration * 0.13) +
    finishing * 0.08 * Math.sin(u);
  const twist = theta * (1.5 - finishing) + tension * 0.75 + phase;
  const width = 0.44 + tension * 0.22;
  const pleat = Math.sin(v * Math.PI * 8 + u * 2) * 0.015 * tension;
  const spread = v * width * (1 + separation * 0.65);
  const r = radius + spread * Math.cos(twist);
  const closed = {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
    z:
      spread * Math.sin(twist) +
      pleat +
      exploration * Math.sin(u * 3 + phase) * 0.14,
  };
  const open = {
    x: (u / Math.PI - 1) * 2.2,
    y:
      Math.sin(u * 1.25 + phase) * (0.14 + tension * 0.1) +
      spread * 0.78 * Math.cos(u * 1.45 + phase),
    z:
      Math.cos(u * 0.9 + phase) * 0.23 +
      spread * 0.78 * Math.sin(u * 1.45 + phase),
  };
  const amount = opening * (1 - finishing);
  return {
    x: mix(closed.x, open.x, amount),
    y: mix(closed.y, open.y, amount),
    z: mix(closed.z, open.z, amount),
  };
}

export function getLayout(state: LoomState, view: View) {
  const open =
    smooth((state.progress - 0.38) / 0.25) *
    (1 - smooth((state.progress - 0.73) / 0.25));
  const final = smooth((state.progress - 0.76) / 0.2);
  const compact = view.mobile && view.height < 740;
  const boxHeight =
    view.height *
    (view.mobile
      ? mix(compact ? 0.25 : 0.275, compact ? 0.225 : 0.25, final)
      : mix(0.5, 0.25, open));
  if (view.print)
    return {
      cx: view.width / 2,
      cy: view.height * 0.55,
      boxWidth: view.width * 0.8,
      boxHeight: view.height * 0.54,
      scale: view.height * 0.27,
      open,
    };
  if (view.field) {
    const field = view.field;
    const wide = !view.mobile && view.height >= 600;
    const expandedHeight = wide
      ? Math.min(field.height, view.height * 0.18)
      : field.height;
    return {
      cx: mix(
        field.x + field.width / 2,
        wide ? view.width * 0.55 : field.x + field.width / 2,
        open,
      ),
      cy: mix(
        field.y + field.height / 2,
        field.y + field.height - expandedHeight / 2,
        open,
      ),
      boxWidth: mix(field.width, wide ? view.width * 0.88 : field.width, open),
      boxHeight: mix(field.height, expandedHeight, open),
      scale: mix(field.height, expandedHeight, open) / 2,
      open,
    };
  }
  if (view.height < 600 && view.width > view.height * 1.35)
    return {
      cx: view.width * 0.725,
      cy: view.height * 0.405,
      boxWidth: view.width * 0.42,
      boxHeight: view.height * 0.34,
      scale: view.height * 0.17,
      open,
    };
  return {
    cx: view.width * (view.mobile ? 0.5 : mix(0.705, 0.55, open)),
    cy:
      view.height *
      (view.mobile
        ? mix(compact ? 0.545 : 0.523, compact ? 0.585 : 0.565, final)
        : mix(0.442, 0.575, open)),
    boxWidth:
      view.width *
      (view.mobile ? mix(0.82, 0.93, open) : mix(0.43, 0.88, open)),
    boxHeight,
    scale: boxHeight / 2,
    open,
  };
}

function projector(state: LoomState, view: View) {
  const layout = getLayout(state, view);
  const yaw = -0.3 + state.rotation + Math.sin(state.time * 0.13) * 0.08;
  const pitch = 0.72 + state.tilt * 0.2 - layout.open * 0.35;
  const roll = -0.3 + layout.open * 0.22;
  const sy = Math.sin(yaw),
    cy = Math.cos(yaw),
    sp = Math.sin(pitch),
    cp = Math.cos(pitch),
    sr = Math.sin(roll),
    cr = Math.cos(roll);
  return (point: Point): Point => {
    const x1 = point.x * cy + point.z * sy;
    const z1 = -point.x * sy + point.z * cy;
    const y2 = point.y * cp - z1 * sp;
    const z2 = point.y * sp + z1 * cp;
    const x3 = x1 * cr - y2 * sr;
    const y3 = x1 * sr + y2 * cr;
    const perspective = 5.5 / (5.5 - z2);
    return { x: x3 * perspective, y: y3 * perspective, z: z2 };
  };
}

export function buildBands(state: LoomState, view: View, detail = 64): Band[] {
  const steps = view.mobile ? 136 : 176;
  const bands: Band[] = [];
  const project = projector(state, view);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let previous: Point[] | undefined;
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2;
    const row: Point[] = [];
    for (let j = 0; j <= detail; j++) {
      const point = project(surface(u, (j / detail) * 2 - 1, state));
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
      row.push(point);
    }
    if (previous) {
      const mid = Math.floor(detail / 2);
      const a = previous[0],
        b = previous[detail],
        c = row[mid];
      const nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
      const ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
      const nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      const len = Math.hypot(nx, ny, nz) || 1;
      const light = Math.abs((nx * -0.4 + ny * -0.6 + nz * 0.7) / len);
      bands.push({
        points: [...previous, ...row],
        depth: (previous[mid].z + row[mid].z) / 2,
        light,
        index: i,
      });
    }
    previous = row;
  }
  // Fit actual projected bounds, keeping every shape clear of text and controls.
  const layout = getLayout(state, view);
  const fit = Math.min(
    layout.boxWidth / (maxX - minX),
    layout.boxHeight / (maxY - minY),
  );
  const centerX = (minX + maxX) / 2,
    centerY = (minY + maxY) / 2;
  const seen = new Set<Point>();
  for (const band of bands)
    for (const point of band.points) {
      if (seen.has(point)) continue;
      seen.add(point);
      point.x = layout.cx + (point.x - centerX) * fit;
      point.y = layout.cy + (point.y - centerY) * fit;
    }
  return bands.sort((a, b) => a.depth - b.depth);
}

export function ink(
  light: number,
  edge: boolean,
  dark: boolean,
  index = 0,
): string {
  const gleam = clamp(light * 0.8 + (Math.sin(index * 1.7) + 1) * 0.06);
  if (edge)
    return dark
      ? `rgba(245,194,145,${0.35 + gleam * 0.5})`
      : `rgba(248,186,128,${0.28 + gleam * 0.5})`;
  return `rgb(${Math.round(112 + gleam * 95)}, ${Math.round(44 + gleam * 68)}, ${Math.round(24 + gleam * 38)})`;
}

export function createPrint(state: LoomState): string {
  const view = { width: 1200, height: 1400, mobile: false, print: true };
  const printState = {
    ...state,
    progress: 1,
    time: 0,
    rotation: state.rotation * 0.3,
  };
  const bands = buildBands(printState, view, 52);
  const paths = bands
    .map((b) => {
      const half = b.points.length / 2;
      const a = b.points.slice(0, half),
        c = b.points.slice(half);
      const outline =
        [...a, ...[...c].reverse()]
          .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
          .join("") + "Z";
      let lines = "";
      for (let j = 0; j < half; j++)
        lines += `M${a[j].x.toFixed(2)},${a[j].y.toFixed(2)}L${c[j].x.toFixed(2)},${c[j].y.toFixed(2)}`;
      return `<path d="${outline}" fill="${ink(b.light, false, false)}"/><path d="${lines}" fill="none" stroke="${ink(b.light, true, false, b.index)}" stroke-width=".65"/>`;
    })
    .join("");
  const dirs = ["CLARITY", "POSSIBILITY", "TOGETHER"];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1400" viewBox="0 0 1200 1400"><title>BETWEEN — a shape we made, GPT–6.1 Sol</title><rect width="1200" height="1400" fill="#f1efe7"/><g fill="#242923" font-family="Arial,sans-serif"><text x="90" y="100" font-size="17" letter-spacing="3">GPT–6.1 SOL / BETWEEN</text><text x="1110" y="100" text-anchor="end" font-size="14">A PORTRAIT IN PRACTICE</text><path d="M90 130H1110" stroke="#c8c7bb"/><text x="90" y="270" font-size="100" font-family="Georgia,serif" font-style="italic">A shape we made.</text></g>${paths}<g fill="#242923" font-family="Arial,sans-serif" font-size="16" letter-spacing="2"><path d="M90 1170H1110" stroke="#c8c7bb"/><text x="90" y="1220">061 / ${dirs[Math.round(state.direction)]} / T${Math.round(state.tension * 100)}</text><text x="90" y="1270" font-family="Georgia,serif" font-size="27" letter-spacing="0">An answer is a beginning. Leave a little room.</text><text x="1110" y="1340" text-anchor="end" font-size="13">MADE BETWEEN YOU &amp; SOL</text></g></svg>`;
}
