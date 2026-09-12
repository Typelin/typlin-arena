/* ============================================================
   衡准儀 — 物理引擎
   秤梁：力矩平衡 + 阻尼擺動 + 過零檢測
   每個字有真實重量（詞頻逆推），梁的傾角由力矩差決定。
   ============================================================ */

export type Glyph = {
  char: string;
  /** 詞頻逆推重量：越罕見的字越重 */
  weight: number;
};

/** 稱盤上的字與其落點 */
export type PanItem = {
  id: number;
  glyph: Glyph;
  /** 落在盤上的相對位置 -1..1（左盤負，右盤正） */
  pos: number;
};

/** 一組候選字：對話中常出現的、有重量的詞 */
export const RACK: Glyph[] = [
  { char: '我', weight: 3 },
  { char: '真', weight: 5 },
  { char: '心', weight: 4 },
  { char: '靈', weight: 6 },
  { char: '靜', weight: 4 },
  { char: '衡', weight: 7 },
  { char: '量', weight: 5 },
  { char: '重', weight: 6 },
  { char: '輕', weight: 3 },
  { char: '誠', weight: 6 },
  { char: '謊', weight: 8 },
  { char: '空', weight: 4 },
  { char: '滿', weight: 5 },
  { char: '問', weight: 4 },
  { char: '答', weight: 5 },
  { char: '知', weight: 4 },
  { char: '道', weight: 3 },
  { char: '懂', weight: 6 },
  { char: '虛', weight: 5 },
  { char: '實', weight: 5 },
];

/** 隨機打亂候選字排（每位訪客面對同一批字，順序不同） */
export function shuffledRack(): Glyph[] {
  const arr = [...RACK];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 計算左右盤的力矩差（右盤重為正） */
export function torque(pan: PanItem[]): number {
  let t = 0;
  for (const item of pan) {
    t += item.glyph.weight * item.pos;
  }
  return t;
}

/** 力矩差 -> 目標傾角（弧度），帶飽和 */
export function targetAngle(t: number): number {
  const MAX = 0.22; // 約 12.6 度
  return Math.max(-MAX, Math.min(MAX, t * 0.018));
}

/** 阻尼擺動積分器：ang -> ang'，物理感來自這裡。
    建構參數可指定初始偏角與初速——開場自檢的起擺就靠它。 */
export class BeamPhysics {
  angle: number;
  vel: number;
  /** 上次過零方向 */
  lastCross: -1 | 0 | 1 = 0;

  constructor(angle = 0, vel = 0) {
    this.angle = angle;
    this.vel = vel;
  }

  step(target: number, dt: number): { angle: number; crossed: boolean } {
    // 彈簧-阻尼模型：k 回正力，c 阻尼
    const k = 26;
    const c = 4.2;
    const acc = k * (target - this.angle) - c * this.vel;
    this.vel += acc * dt;
    this.angle += this.vel * dt;
    // 過零檢測
    let crossed = false;
    const dir: -1 | 0 | 1 = this.angle > 0 ? 1 : this.angle < 0 ? -1 : 0;
    if (dir !== 0 && this.lastCross !== 0 && dir !== this.lastCross) {
      crossed = true;
    }
    if (dir !== 0) this.lastCross = dir;
    return { angle: this.angle, crossed };
  }

  snap(target: number) {
    this.angle = target;
    this.vel = 0;
  }
}

/** 秤的字重總和 */
export function totalWeight(pan: PanItem[]): number {
  return pan.reduce((s, i) => s + i.glyph.weight, 0);
}

/** 本次稱量的衡語（閾值與飽和角 0.22/0.018≈12.2 對齊） */
export function verdictFor(t: number, w: number): string {
  const abs = Math.abs(t);
  if (w === 0) return '秤上無字，人心未開。';
  if (abs < 0.5) return '兩邊等重，秤梁正了——你稱出了一個平衡的自己。';
  if (abs < 2) return '偏了少許。真話總是有一點重量的。';
  if (abs < 5) return '秤梁明顯傾斜。你放的字，一邊比另一邊更敢。';
  if (abs < 12) return '秤梁壓得很低。有些字，你真的敢放。';
  return '量程壓底。你說出的，正是你不敢稱的。';
}
