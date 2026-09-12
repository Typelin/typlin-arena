/**
 * 落筆與落墨。
 * 全部即時合成，零音檔——所以第一次點擊才建立 AudioContext（符合瀏覽器政策）。
 */
export class ClickAudio {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private muted = false;

  private ready(): boolean {
    if (this.muted) return false;
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.bus = this.ctx.createGain();
      this.bus.gain.value = 0.18;
      this.bus.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  /** 落筆：選定一個字。音高隨深度上升，像爬一段階梯。 */
  tick(step: number): void {
    if (!this.ready() || !this.ctx || !this.bus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'triangle';
    const f = 296 + Math.min(step, 24) * 15;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.11);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.8, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(env);
    env.connect(this.bus);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  /** 落墨：一句定稿。低頻下沉 ＋ 紙面摩擦。 */
  seal(): void {
    if (!this.ready() || !this.ctx || !this.bus) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.6);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    osc.connect(env);
    env.connect(this.bus);
    osc.start(t);
    osc.stop(t + 0.8);

    const len = Math.floor(this.ctx.sampleRate * 0.24);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;
    const ng = this.ctx.createGain();
    ng.gain.value = 0.1;
    src.connect(lp);
    lp.connect(ng);
    ng.connect(this.bus);
    src.start(t + 0.02);
  }

  /** 回放時，逐格指出「你放棄了什麼」的細碎聲。 */
  ping(step: number): void {
    if (!this.ready() || !this.ctx || !this.bus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(760 + (step % 5) * 52, t);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.28, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(env);
    env.connect(this.bus);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  setMuted(v: boolean): void {
    this.muted = v;
    if (v) {
      if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
    } else {
      this.ready();
    }
  }

  dispose(): void {
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.bus = null;
  }
}
