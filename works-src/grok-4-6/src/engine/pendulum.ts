/** 角擺：θ = 0 為鉛直向下。半隱 RK4，像素長度只用於繪製。 */

export const G_OVER_L = 12.55;
export const DAMP = 0.64;
export const DAMP_REDUCED = 9.2;
export const TRUE_EPS = 0.012;
export const HOLD_OFF_RAD = 0.22;
export const HOLD_OFF_MS = 2400;
export const STAMP_STILL_MS = 3200;

export type Mode = 'intro' | 'free' | 'drag';

export type Note = { theta: number; at: number };

export type Reject = {
  id: string;
  label: string;
  theta: number;
  fallen: boolean;
  fallY: number;
  fallV: number;
};

export type PlumbSim = {
  theta: number;
  omega: number;
  stretch: number;
  mode: Mode;
  introT: number;
  introLen: number;
  introBob: number;
  touched: boolean;
  swings: number;
  maxAbs: number;
  lastCrossT: number;
  movingSince: number | null;
  stillSince: number | null;
  offSince: number | null;
  settleMs: number | null;
  heldOff: boolean;
  stamped: boolean;
  pinClicks: number;
  lastPinAt: number;
  notes: Note[];
  trail: Float32Array;
  trailI: number;
  fan: number[];
  shadowTheta: number;
  lastTheta: number;
  bow: number;
  lastBucket: number;
  rejects: Reject[];
  introDrew: boolean;
};

const TRAIL_N = 96;

export function createSim(): PlumbSim {
  return {
    theta: 0,
    omega: 0,
    stretch: 1,
    mode: 'intro',
    introT: 0,
    introLen: 0,
    introBob: 0,
    touched: false,
    swings: 0,
    maxAbs: 0,
    lastCrossT: -1,
    movingSince: null,
    stillSince: 0,
    offSince: null,
    settleMs: null,
    heldOff: false,
    stamped: false,
    pinClicks: 0,
    lastPinAt: 0,
    notes: [],
    trail: new Float32Array(TRAIL_N * 2),
    trailI: 0,
    fan: [],
    shadowTheta: 0,
    lastTheta: 0,
    bow: 0,
    lastBucket: 0,
    introDrew: false,
    rejects: [
      { id: 'neon', label: '霓虹', theta: -0.34, fallen: false, fallY: 0, fallV: 0 },
      { id: 'particle', label: '粒子', theta: 0.42, fallen: false, fallY: 0, fallV: 0 },
      { id: 'glass', label: '玻璃擬態', theta: 0.16, fallen: false, fallY: 0, fallV: 0 },
    ],
  };
}

function wrapPi(a: number): number {
  const t = a + Math.PI;
  return t - Math.floor(t / (2 * Math.PI)) * (2 * Math.PI) - Math.PI;
}

function accel(theta: number, omega: number, gOverL: number, damp: number, wind: number): number {
  return -gOverL * Math.sin(theta) - damp * omega + wind;
}

function rk4(
  theta: number,
  omega: number,
  dt: number,
  gOverL: number,
  damp: number,
  wind: number,
): { theta: number; omega: number } {
  const k1t = omega;
  const k1w = accel(theta, omega, gOverL, damp, wind);
  const k2t = omega + k1w * dt * 0.5;
  const k2w = accel(theta + k1t * dt * 0.5, omega + k1w * dt * 0.5, gOverL, damp, wind);
  const k3t = omega + k2w * dt * 0.5;
  const k3w = accel(theta + k2t * dt * 0.5, omega + k2w * dt * 0.5, gOverL, damp, wind);
  const k4t = omega + k3w * dt;
  const k4w = accel(theta + k3t * dt, omega + k3w * dt, gOverL, damp, wind);
  return {
    theta: theta + (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t),
    omega: omega + (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w),
  };
}

export function pointerTheta(originX: number, originY: number, x: number, y: number): number {
  return Math.atan2(x - originX, y - originY);
}

export function bobPos(originX: number, originY: number, L: number, theta: number, stretch: number): { x: number; y: number } {
  const len = L * stretch;
  return { x: originX + Math.sin(theta) * len, y: originY + Math.cos(theta) * len };
}

function pushTrail(s: PlumbSim, x: number, y: number): void {
  const i = s.trailI % TRAIL_N;
  s.trail[i * 2] = x;
  s.trail[i * 2 + 1] = y;
  s.trailI++;
}

function recordFan(s: PlumbSim, theta: number): void {
  const w = wrapPi(theta);
  if (Math.abs(w) < 0.04) return;
  const last = s.fan[s.fan.length - 1];
  if (last != null && Math.abs(last - w) < 0.03) {
    s.fan[s.fan.length - 1] = Math.abs(w) > Math.abs(last) ? w : last;
    return;
  }
  s.fan.push(w);
  if (s.fan.length > 28) s.fan.shift();
}

export function registerNote(s: PlumbSim, now: number): boolean {
  if (s.notes.length >= 12) return false;
  const th = wrapPi(s.theta);
  s.notes.push({ theta: th, at: now });
  return true;
}

export function tapPin(s: PlumbSim, now: number): boolean {
  if (now - s.lastPinAt > 700) s.pinClicks = 0;
  s.lastPinAt = now;
  s.pinClicks += 1;
  if (s.pinClicks >= 3) {
    s.pinClicks = 0;
    return true;
  }
  return false;
}

export type StepInfo = {
  crossed: boolean;
  crossStrength: number;
  confession: boolean;
  stamped: boolean;
  introDone: boolean;
  introString: boolean;
  notch: boolean;
  knocked: string | null;
};

export function stepSim(
  s: PlumbSim,
  dt: number,
  now: number,
  reduced: boolean,
  dragTheta: number | null,
  dragStretch: number,
  originX: number,
  originY: number,
  L: number,
  wind: number,
  knockable = false,
): StepInfo {
  const info: StepInfo = {
    crossed: false,
    crossStrength: 0,
    confession: false,
    stamped: false,
    introDone: false,
    introString: false,
    notch: false,
    knocked: null,
  };

  const prevWrap = wrapPi(s.theta);
  s.lastTheta = s.theta;

  if (s.mode === 'intro') {
    s.introT += dt;
    const t = s.introT;
    if (reduced && t > 1.05) {
      s.introLen = 1;
      s.introBob = 1;
      s.theta = 0;
      s.omega = 0;
      s.stretch = 1;
      s.mode = 'free';
      s.stillSince = now;
      info.introDone = true;
      return info;
    }
    if (t < 0.38) {
      s.introLen = 0;
      s.introBob = 0;
    } else if (t < 1.18) {
      if (!s.introDrew) {
        s.introDrew = true;
        info.introString = true;
      }
      const u = (t - 0.38) / 0.8;
      const e = 1 - Math.pow(1 - u, 3);
      s.introLen = e;
      s.introBob = 0;
    } else if (t < 1.55) {
      s.introLen = 1;
      s.introBob = (t - 1.18) / 0.37;
    } else if (t < 2.15) {
      s.introLen = 1;
      s.introBob = 1;
      if (!reduced) s.theta = 0.31;
      s.omega = 0;
    } else {
      s.introLen = 1;
      s.introBob = 1;
      s.mode = 'free';
      s.theta = reduced ? 0 : 0.31;
      s.omega = 0;
      s.stillSince = reduced ? now : null;
      s.movingSince = reduced ? null : now;
      info.introDone = true;
    }
    s.stretch = 1;
    s.shadowTheta += (s.theta - s.shadowTheta) * Math.min(1, dt * 10);
    const p = bobPos(originX, originY, L * Math.max(0.001, s.introLen), s.theta, 1);
    if (s.introBob > 0.2) pushTrail(s, p.x, p.y);
    return info;
  }

  if (s.mode === 'drag' && dragTheta != null) {
    const target = dragTheta;
    const k = 18;
    const a = 1 - Math.exp(-dt * k);
    s.omega = (target - s.theta) / Math.max(dt, 1 / 120);
    s.theta = s.theta + (target - s.theta) * a;
    s.stretch += (dragStretch - s.stretch) * (1 - Math.exp(-dt * 14));
    s.bow += ((target - s.theta) * 0.8 - s.bow) * (1 - Math.exp(-dt * 8));
    s.touched = true;
    s.stamped = false;
    s.stillSince = null;
    if (s.movingSince == null) s.movingSince = now;
  } else {
    s.bow += (0 - s.bow) * Math.min(1, dt * 6);
    s.stretch += (1 - s.stretch) * Math.min(1, dt * 10);
    const damp = reduced ? DAMP_REDUCED : DAMP;
    const gOverL = reduced ? G_OVER_L * 0.55 : G_OVER_L;
    let rest = dt;
    const h = 1 / 120;
    while (rest > 0) {
      const step = Math.min(h, rest);
      const n = rk4(s.theta, s.omega, step, gOverL, damp, reduced ? 0 : wind);
      s.theta = n.theta;
      s.omega = n.omega;
      rest -= step;
    }
    if (s.omega > 28) s.omega = 28;
    if (s.omega < -28) s.omega = -28;
  }

  const wrapped = wrapPi(s.theta);
  const abs = Math.abs(wrapped);
  if (abs > s.maxAbs) s.maxAbs = abs;

  const bucket = Math.floor((abs * 180) / Math.PI / 10);
  if (s.mode === 'drag' && bucket !== s.lastBucket && bucket > 0) info.notch = true;
  s.lastBucket = bucket;

  for (const r of s.rejects) {
    if (r.fallen) {
      r.fallV += 2100 * dt;
      r.fallY += r.fallV * dt;
      continue;
    }
    if (
      knockable &&
      s.mode === 'free' &&
      Math.abs(wrapped - r.theta) < 0.075 &&
      Math.abs(s.omega) > 1.25
    ) {
      r.fallen = true;
      r.fallY = 0;
      r.fallV = 80;
      info.knocked = r.id;
    }
  }

  const crossedBottom =
    Math.sign(prevWrap) !== Math.sign(wrapped) &&
    Math.sign(prevWrap) !== 0 &&
    Math.abs(prevWrap) + Math.abs(wrapped) < 0.8;
  if (crossedBottom && s.mode === 'free') {
    s.swings += 1;
    s.lastCrossT = now;
    info.crossed = true;
    info.crossStrength = Math.min(1, Math.abs(s.omega) / 4.2);
    recordFan(s, prevWrap > 0 ? Math.max(prevWrap, wrapped) : Math.min(prevWrap, wrapped));
  }

  const moving = Math.abs(s.omega) > 0.18 || abs > TRUE_EPS * 1.8 || s.mode === 'drag';
  if (moving) {
    if (s.movingSince == null) s.movingSince = now;
    s.stillSince = null;
  } else {
    if (s.stillSince == null) {
      if (s.movingSince != null && s.touched) {
        s.settleMs = now - s.movingSince;
      }
      s.stillSince = now;
      s.movingSince = null;
      recordFan(s, wrapped);
    }
  }

  if (s.mode === 'drag' && abs > HOLD_OFF_RAD) {
    if (s.offSince == null) s.offSince = now;
    if (!s.heldOff && now - s.offSince > HOLD_OFF_MS) {
      s.heldOff = true;
      info.confession = true;
    }
  } else if (s.mode !== 'drag') {
    s.offSince = null;
  }

  if (
    !s.stamped &&
    s.touched &&
    s.mode === 'free' &&
    s.stillSince != null &&
    now - s.stillSince > STAMP_STILL_MS &&
    abs < TRUE_EPS
  ) {
    s.stamped = true;
    info.stamped = true;
  }

  s.shadowTheta += (s.theta - s.shadowTheta) * Math.min(1, dt * 7);
  const p = bobPos(originX, originY, L, s.theta, s.stretch);
  if (s.trailI % 2 === 0 || moving) pushTrail(s, p.x, p.y);
  return info;
}

export function release(s: PlumbSim, flickOmega: number): void {
  s.mode = 'free';
  s.omega = flickOmega;
  s.stretch = Math.min(s.stretch, 1.08);
  s.touched = true;
  s.stamped = false;
  s.stillSince = null;
  s.movingSince = performance.now();
}

export function impulse(s: PlumbSim, dir: number, reduced: boolean): void {
  if (s.mode === 'intro') return;
  s.mode = 'free';
  s.touched = true;
  s.stamped = false;
  s.omega += dir * (reduced ? 1.1 : 2.35);
  s.stillSince = null;
  if (s.movingSince == null) s.movingSince = performance.now();
}

export function home(s: PlumbSim, reduced: boolean): void {
  if (s.mode === 'intro') return;
  s.mode = 'free';
  if (reduced) {
    s.theta = 0;
    s.omega = 0;
  } else {
    s.omega += -Math.sign(wrapPi(s.theta) || s.omega || 1) * 0.4;
    s.omega -= wrapPi(s.theta) * 0.8;
  }
}

export function visualShearDeg(theta: number): number {
  const w = wrapPi(theta);
  const scaled = (w * 180) / Math.PI * 0.22;
  return Math.max(-8.5, Math.min(8.5, scaled));
}

export function wrapAngle(theta: number): number {
  return wrapPi(theta);
}

export const TRAIL_LEN = TRAIL_N;
