import type { Specimen } from '../data/specimens';

/** 聲納狀態機 */
export type SonarState = 'idle' | 'scanning' | 'pulse' | 'echo';

export type Ping = {
  /** 世界座標原點（波束發射點） */
  x: number;
  y: number;
  /** 當前半徑 */
  r: number;
  /** 目標最大半徑 */
  maxR: number;
  /** 0..1 生命週期 */
  life: number;
};

export type Fish = Specimen & {
  /** 螢幕座標（每幀換算） */
  sx: number;
  sy: number;
  /** 0..1 被點亮的強度 */
  lit: number;
  /** 是否已被發現（永久） */
  found: boolean;
};

export type SonarConfig = {
  /** 水下可視半徑（px，相對 canvas 短邊） */
  viewRadius: number;
};

export const DEFAULT_CONFIG: SonarConfig = { viewRadius: 0.42 };

/**
 * 聲納核心：把「深度、波束方向、脈衝、物件」四個量編成一場連續的舞。
 * 新增：波束自動掃描、當前層索引。
 */
export class Sonar {
  fish: Fish[];
  pings: Ping[] = [];
  state: SonarState = 'idle';

  /** 波束方向（弧度） */
  beam = 0;
  /** 平滑後的波束 */
  beamSmooth = 0;
  /** 自動掃描相位：即使沒有滑鼠，波束也會慢慢繞圈 */
  autoSweep = 0;
  /** 使用者最近是否動過滑鼠（1 秒內）— 決定是否用自動掃描 */
  pointerHold = 0;

  /** 深度 0..1（由滾動驅動） */
  depth = 0;
  /** 平滑深度 */
  depthSmooth = 0;
  /** 當前層 0..3 */
  layer = 0;

  /** 全域時間（秒） */
  t = 0;
  /** 最近一次脈衝後經過的時間 */
  sincePing = 99;

  constructor(specimens: Specimen[]) {
    this.fish = specimens.map((s) => ({ ...s, sx: 0, sy: 0, lit: 0, found: false }));
  }

  /** 送出一次脈衝（點擊或空白鍵）。回傳是否成功觸發 */
  emitPulse(): boolean {
    if (this.state === 'pulse') return false;
    this.pings.push({
      x: 0,
      y: 0,
      r: 0,
      maxR: 0, // 由 update 依 viewport 決定
      life: 0,
    });
    this.state = 'pulse';
    this.sincePing = 0;
    return true;
  }

  /**
   * 每幀推進。
   * viewport 提供畫布邏輯寬高；pointer 為波束目標角度。
   */
  update(dt: number, beamTarget: number, depthTarget: number, pointerActive: boolean) {
    this.t += dt;
    this.sincePing += dt;
    this.pointerHold = Math.max(0, this.pointerHold - dt);
    if (pointerActive) this.pointerHold = 1.2;

    // 自動掃描：沒有滑鼠時，波束慢慢繞圈（約 40 秒一圈）
    this.autoSweep += dt * 0.16;

    // 平滑
    const k = 1 - Math.pow(0.001, dt);
    const target = this.pointerHold > 0
      ? beamTarget
      : beamTarget * 0.15 + this.autoSweep * 0.85;
    this.beamSmooth += ((((target - this.beamSmooth) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * k;
    this.depthSmooth += (depthTarget - this.depthSmooth) * k;

    // 層索引：0..3
    this.layer = Math.min(3, Math.max(0, Math.floor(this.depthSmooth * 4 - 0.0001)));

    // 狀態機
    if (this.pings.length === 0) {
      this.state = this.pointerHold > 0 ? 'scanning' : 'idle';
    } else {
      this.state = this.pings.some((p) => p.life < 0.5) ? 'pulse' : 'echo';
    }

    // 衰減所有魚的光
    const decay = Math.pow(0.35, dt);
    for (const f of this.fish) f.lit *= decay;
  }

  /**
   * 幾何：把深度與角度投影到「水面圓盤」上。
   * 水面 = 螢幕中央的圓；深度把魚往內、往下拉，製造潛航感。
   */
  layout(w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const rView = Math.min(w, h) * DEFAULT_CONFIG.viewRadius;
    for (const f of this.fish) {
      // 角度固定；半徑由深度決定：越深越靠中心、越暗
      const r = rView * (1 - f.depth * 0.85);
      const a = f.angle + this.beamSmooth * 0.06;
      f.sx = cx + Math.cos(a) * r;
      f.sy = cy + Math.sin(a) * r * 0.82;
    }
  }
}
