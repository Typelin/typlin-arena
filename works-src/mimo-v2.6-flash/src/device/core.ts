import { TAU, angDiff, clamp, damp, lerp, makeRnd } from "../lib/math";
import {
  ACCENT,
  ACCENT_NIGHT,
  GROUNDS,
  INK,
  INK_NIGHT,
  css,
  mixRGB,
  type RGB,
} from "../lib/palette";

export const MAX_RINGS = 46;

const N = 148; // 等高線取樣數
const H = [0.42, 0.28, 0.18, 0.11]; // 諧波振幅，和 0.99
const SP = [1, -0.7, 0.45, -0.3]; // 各諧波自轉速率

const R_MIN_N = 0.055; // 內圈半徑 / R
const R_MAX_N = 0.98; // 外圈半徑 / R
const POW = 0.72; // <1：內圈疏、外圈密 —— 橫切面而非靶紙

/** 出生時的外徑比，到終幕長到 R_MAX_N */
const OUTER_BIRTH = 0.62;

export type Pointer = { x: number; y: number; on: boolean };

export type View = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  R: number;
};

export type Frame = {
  progress: number;
  vel: number;
  pointer: Pointer;
  act: number;
  reduced: boolean;
};

type Pluck = { ring: number; ang: number; t: number };
type Notch = { ring: number; ang: number };

const norm = (i: number) => Math.pow(clamp(i, 0, MAX_RINGS - 1) / (MAX_RINGS - 1), POW);

/**
 * 一枚「這一個我」的核。
 * 中心是出生，最外圈是此刻；只往外長，永不回頭。
 * 全部狀態走指數阻尼，與幀率無關。
 */
export class CoreField {
  visible = 20;
  energy = 0;
  amp = 0.12;
  ox = 0;
  oy = 0;
  bulgeAmp = 0;
  bulgeAng = 0;
  contract = 0;
  holdTarget = 0;
  night = 0;
  presence = 1;
  presenceTarget = 1;
  t = 0;
  spin = 0;
  breath = 1;
  message = "";
  messageAlpha = 0;
  messageAge = 99;
  ground: RGB = [...GROUNDS[0]];
  rings: { jit: number }[];
  plucks: Pluck[] = [];
  notches: Notch[] = [];

  private hi = 0; // 生長高水位：捲回去也不縮
  private reduced = false;
  private born: number[];
  private lastCount: number;
  private ph: number[];
  private shape = new Float32Array(N);

  constructor(seed = 20261018) {
    const rnd = makeRnd(seed);
    this.ph = [0, 1, 2, 3].map(() => rnd() * TAU);
    this.rings = [];
    for (let i = 0; i < MAX_RINGS; i++) {
      this.rings.push({ jit: rnd() * 0.6 - 0.3 }); // ±0.3 個間距，不破嵌套
    }
    this.born = new Array<number>(MAX_RINGS).fill(-999);
    this.lastCount = Math.floor(this.visible);
  }

  pluck(ring: number, ang: number) {
    this.plucks.push({ ring, ang, t: 0 });
    if (this.plucks.length > 10) this.plucks.shift();
    this.notches.push({ ring, ang });
    if (this.notches.length > 44) this.notches.shift();
  }

  setMessage(text: string) {
    this.message = text;
    this.messageAge = 0;
  }

  update(dt: number, frame: Frame, view: View) {
    const reduced = frame.reduced;
    const d = reduced ? 26 : 1;
    this.reduced = reduced;

    this.t += dt;
    this.messageAge += dt;

    // 年歲：外徑比例只增不減（捲回去也不縮，進度提前 16% 飽和）
    const g = clamp(frame.progress * 1.16, 0, 1);
    if (g > this.hi) this.hi = g;
    const outer = lerp(OUTER_BIRTH, R_MAX_N, this.hi);
    const tInv = Math.pow((outer - R_MIN_N) / (R_MAX_N - R_MIN_N), 1 / POW);
    const target = 1 + tInv * (MAX_RINGS - 1);
    this.visible = damp(this.visible, target, reduced ? 30 : 5, dt);

    // 一圈一環整圈長出來：記下誕生時刻，讓它淡入
    const c = Math.floor(this.visible);
    if (c > this.lastCount) {
      for (let i = this.lastCount; i < c && i < MAX_RINGS; i++) this.born[i] = this.t;
      this.lastCount = c;
    }

    // 躁動：捲得越快，形變越大
    const eTarget = clamp(Math.abs(frame.vel), 0, 1);
    this.energy = damp(
      this.energy,
      eTarget,
      eTarget > this.energy ? (reduced ? 30 : 5) : reduced ? 30 : 1.5,
      dt,
    );
    this.amp = damp(this.amp, 0.135 + this.energy * 0.17 + this.night * 0.04, 5 * d, dt);

    // 注意力：核朝你傾、朝你鼓起；夜幕下增益最高
    const gain = lerp(0.55, 1, this.night);
    const px = (frame.pointer.x - view.cx) / view.R;
    const py = (frame.pointer.y - view.cy) / view.R;
    const dist = Math.hypot(px, py);
    let infl = 0;
    if (frame.pointer.on && dist < 2.4) infl = 1 - dist / 2.4;
    infl = infl * infl;

    const oxT = clamp(px, -2, 2) * 0.11 * infl * gain * view.R;
    const oyT = clamp(py, -2, 2) * 0.11 * infl * gain * view.R;
    this.ox = damp(this.ox, oxT, 6 * d, dt);
    this.oy = damp(this.oy, oyT, 6 * d, dt);

    this.bulgeAmp = damp(this.bulgeAmp, 0.14 * infl * gain, 7 * d, dt);
    if (infl > 0.01) this.bulgeAng = Math.atan2(py, px);

    // 按住 → 收成一疊
    this.contract = damp(this.contract, this.holdTarget, reduced ? 30 : 11, dt);

    // 夜幕：果斷的一刀，不在中間色停留（可讀性優先於緩慢漸變）
    this.night = damp(this.night, frame.act === 3 ? 1 : 0, reduced ? 40 : 20, dt);

    // 存在感（手機上文字區讓位）
    this.presence = damp(this.presence, this.presenceTarget, 6, dt);

    // 自主呼吸與自轉（reduced-motion 全部關閉）
    if (reduced) {
      this.breath = 1;
    } else {
      this.breath =
        1 + 0.015 * Math.sin(this.t * 0.85) + this.energy * 0.012 * Math.sin(this.t * 6.1);
      this.spin += dt * (0.06 + this.energy * 0.45);
    }

    // 漣漪
    if (this.plucks.length) {
      for (const p of this.plucks) p.t += dt;
      this.plucks = this.plucks.filter((p) => p.t < 2.7);
    }

    this.messageAlpha = damp(this.messageAlpha, this.message ? 1 : 0, 5 * d, dt);

    const targetGround = GROUNDS[clamp(frame.act, 0, GROUNDS.length - 1)];
    const gl = reduced ? 40 : 20;
    this.ground = [
      damp(this.ground[0], targetGround[0], gl, dt),
      damp(this.ground[1], targetGround[1], gl, dt),
      damp(this.ground[2], targetGround[2], gl, dt),
    ];

    this.computeShape();
  }

  /** 所有圈共用同一個形狀函數 → 任意形變都維持嚴格嵌套，永不自交 */
  private computeShape() {
    const { amp, spin, bulgeAmp, bulgeAng, ph } = this;
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TAU;
      let w = 0;
      for (let j = 0; j < 4; j++) w += H[j] * Math.sin((j + 1) * th + spin * SP[j] + ph[j]);
      let s = 1 + amp * w;
      if (bulgeAmp > 0.0005) {
        const a = angDiff(th, bulgeAng) / 0.85;
        s += bulgeAmp * Math.exp(-a * a);
      }
      this.shape[k] = s < 0.3 ? 0.3 : s;
    }
  }

  draw(ctx: CanvasRenderingContext2D, view: View) {
    const { w, h, R } = view;
    ctx.globalAlpha = 1;
    ctx.fillStyle = css(this.ground);
    ctx.fillRect(0, 0, w, h);

    const nt = this.night;
    const ink = mixRGB(INK, INK_NIGHT, nt);
    const acc = mixRGB(ACCENT, ACCENT_NIGHT, nt);

    const rMax = R * R_MAX_N;
    const rMin = R * R_MIN_N;
    const contractF = lerp(1, 0.26, this.contract);
    const breath = this.breath;
    const count = Math.floor(this.visible);
    const full = Math.min(count, MAX_RINGS);

    ctx.save();
    ctx.globalAlpha = this.presence;
    ctx.translate(view.cx + this.ox, view.cy + this.oy);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 已定的圈：墨色；最外那一圈是「此刻」——朱紅，恆亮
    for (let i = 0; i < full; i++) {
      const u = i / (MAX_RINGS - 1);
      const isNow = i === full - 1;
      const f = this.reduced ? 1 : clamp((this.t - this.born[i]) / 0.34, 0, 1);
      if (f <= 0.002) continue;
      this.ringPath(ctx, i, rMin, rMax, contractF, breath);
      ctx.strokeStyle = css(isNow ? acc : ink);
      ctx.globalAlpha = this.presence * f * (isNow ? 1 : lerp(0.3, 0.82, u));
      ctx.lineWidth = isNow ? 2.2 : lerp(0.85, 1.5, u);
      ctx.stroke();
    }

    // 你留下的痕
    if (this.notches.length) {
      ctx.strokeStyle = css(acc);
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = this.presence * 0.95;
      ctx.beginPath();
      for (const n of this.notches) {
        if (n.ring >= MAX_RINGS) continue;
        const r = this.radiusAt(n.ring, rMin, rMax, contractF, breath);
        const sp = this.spacingAt(n.ring, rMin, rMax, contractF, breath) * 0.85;
        const x = Math.cos(n.ang) * r;
        const y = Math.sin(n.ang) * r;
        ctx.moveTo(x - Math.cos(n.ang) * sp, y - Math.sin(n.ang) * sp);
        ctx.lineTo(x + Math.cos(n.ang) * sp, y + Math.sin(n.ang) * sp);
      }
      ctx.stroke();
    }

    // 留給下一個我的那句話：一圈只屬於這一頁的朱紅
    if (this.messageAlpha > 0.01) {
      const pulse = 1 + 0.05 * Math.exp(-Math.max(0, this.messageAge) * 2.4);
      const rm =
        this.radiusAt(Math.min(count + 0.7, MAX_RINGS - 1), rMin, rMax, contractF, breath) *
        1.02 *
        pulse;
      ctx.beginPath();
      for (let k = 0; k <= N; k++) {
        const kk = k % N;
        const th = (kk / N) * TAU;
        const r = rm * this.shape[kk];
        const x = Math.cos(th) * r;
        const y = Math.sin(th) * r;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = css(acc);
      ctx.globalAlpha = this.presence * this.messageAlpha;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // 出生點
    const dot = Math.max(1.8, R * 0.012) * contractF;
    ctx.beginPath();
    ctx.arc(0, 0, dot, 0, TAU);
    ctx.fillStyle = css(acc);
    ctx.globalAlpha = this.presence * 0.75;
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private radiusAt(
    i: number,
    rMin: number,
    rMax: number,
    contractF: number,
    breath: number,
  ) {
    return (rMin + (rMax - rMin) * norm(i)) * contractF * breath;
  }

  private spacingAt(
    i: number,
    rMin: number,
    rMax: number,
    contractF: number,
    breath: number,
  ) {
    const a = this.radiusAt(i, rMin, rMax, contractF, breath);
    const b = this.radiusAt(Math.min(i + 1, MAX_RINGS - 1), rMin, rMax, contractF, breath);
    const s = b - a;
    return s > 0.6 ? s : 0.6;
  }

  private ringPath(
    ctx: CanvasRenderingContext2D,
    i: number,
    rMin: number,
    rMax: number,
    contractF: number,
    breath: number,
  ) {
    const rr = this.radiusAt(i, rMin, rMax, contractF, breath);
    const sp = this.spacingAt(i, rMin, rMax, contractF, breath);
    const ripAmp = sp * 0.55;
    const shape = this.shape;
    const plucks = this.plucks;

    ctx.beginPath();
    for (let k = 0; k <= N; k++) {
      const kk = k % N;
      const th = (kk / N) * TAU;
      let rip = 0;
      if (plucks.length) {
        for (let q = 0; q < plucks.length; q++) {
          const p = plucks[q];
          const dist = Math.abs(i - p.ring);
          const front = p.t * 16;
          const x = (dist - front) / 3.2;
          const env = Math.exp(-x * x) * Math.exp(-p.t * 1.5);
          if (env > 0.003) rip += env * ripAmp * Math.cos(angDiff(th, p.ang) + dist * 0.4);
        }
      }
      const r = rr * shape[kk] + rip;
      const x = Math.cos(th) * r;
      const y = Math.sin(th) * r;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}
