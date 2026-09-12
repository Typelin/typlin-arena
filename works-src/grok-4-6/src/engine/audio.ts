/** WebAudio 合成，無音檔。弦、刻度、落鎖、紙、風——全是這條線上的重量。 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let longNoise: AudioBuffer | null = null;
let muted = false;

let humOsc: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let windSrc: AudioBufferSourceNode | null = null;
let windGain: GainNode | null = null;
let windFilt: BiquadFilterNode | null = null;

const PENTA = [392.0, 440.0, 493.88, 587.33, 659.25, 783.99];

function AC(): typeof AudioContext | undefined {
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function fillNoise(buf: AudioBuffer, decay: boolean): void {
  const d = buf.getChannelData(0);
  const n = d.length;
  let last = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    const env = decay ? 1 - i / n : 1;
    d[i] = (white * 0.35 + last * 0.65) * env;
  }
}

export function initAudio(): void {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const Ctor = AC();
  if (!Ctor) return;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.82;
    master.connect(ctx.destination);

    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    fillNoise(noiseBuf, true);
    longNoise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2.4), ctx.sampleRate);
    fillNoise(longNoise, false);

    humOsc = ctx.createOscillator();
    humOsc.type = 'triangle';
    humOsc.frequency.value = 82;
    const humLp = ctx.createBiquadFilter();
    humLp.type = 'lowpass';
    humLp.frequency.value = 420;
    humGain = ctx.createGain();
    humGain.gain.value = 0;
    humOsc.connect(humLp).connect(humGain).connect(master);
    humOsc.start();

    windSrc = ctx.createBufferSource();
    windSrc.buffer = longNoise;
    windSrc.loop = true;
    windFilt = ctx.createBiquadFilter();
    windFilt.type = 'bandpass';
    windFilt.frequency.value = 380;
    windFilt.Q.value = 0.7;
    windGain = ctx.createGain();
    windGain.gain.value = 0;
    windSrc.connect(windFilt).connect(windGain).connect(master);
    windSrc.start();
  } catch {
    ctx = null;
  }
}

export function setMuted(v: boolean): void {
  muted = v;
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.82, ctx.currentTime, 0.04);
  if (v) {
    setHum(0);
    setWind(0);
  }
}

export function isMuted(): boolean {
  return muted;
}

function alive(): boolean {
  return !!(ctx && master && !muted);
}

export function setHum(level: number, hz = 82): void {
  if (!ctx || !humGain || !humOsc) return;
  const lv = muted ? 0 : Math.max(0, Math.min(1, level)) * 0.058;
  const now = ctx.currentTime;
  humOsc.frequency.setTargetAtTime(hz, now, 0.06);
  humGain.gain.setTargetAtTime(lv, now, 0.09);
}

export function setWind(level: number): void {
  if (!ctx || !windGain || !windFilt) return;
  const lv = muted ? 0 : Math.max(0, Math.min(1, level)) * 0.075;
  const now = ctx.currentTime;
  windGain.gain.setTargetAtTime(lv, now, 0.18);
  windFilt.frequency.setTargetAtTime(280 + level * 220, now, 0.2);
}

export function tick(strength: number): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 880 + strength * 1500;
  bp.Q.value = 6.2;
  const g = ctx.createGain();
  const vol = Math.min(0.24, 0.04 + strength * 0.18);
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.09);
}

export function releaseThud(strength: number): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 86 + strength * 48;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.min(0.26, 0.06 + strength * 0.16), now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.3);
}

export function stamp(): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 196;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.14, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  const th = ctx.createOscillator();
  th.type = 'sine';
  th.frequency.value = 98;
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.09, now);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(g).connect(master);
  th.connect(tg).connect(master);
  osc.start(now);
  osc.stop(now + 0.24);
  th.start(now);
  th.stop(now + 0.18);
}

export function noteMark(): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 784;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.1, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.16);
}

export function notch(): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1540;
  bp.Q.value = 8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.07, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.05);
}

export function creak(strength: number): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 420 + strength * 260;
  bp.Q.value = 3.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.min(0.11, 0.025 + strength * 0.07), now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.12);
}

export function lock(slot: number): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const f = PENTA[slot % PENTA.length];
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = f;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.13, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
  const t = ctx.createOscillator();
  t.type = 'triangle';
  t.frequency.value = f * 2.01;
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.05, now);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(g).connect(master);
  t.connect(tg).connect(master);
  osc.start(now);
  osc.stop(now + 0.4);
  t.start(now);
  t.stop(now + 0.18);
}

export function rustle(strength: number): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.min(0.09, 0.018 + strength * 0.07), now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  src.connect(hp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.1);
}

export function pinClick(): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 1240;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.055, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function stringDraw(): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 240;
  bp.Q.value = 4;
  bp.frequency.exponentialRampToValueAtTime(720, now + 0.55);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.075, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.72);
}

export function refuse(): void {
  if (!alive() || !ctx || !master) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 196;
  osc.frequency.exponentialRampToValueAtTime(147, now + 0.16);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + 0.22);
}

export function knock(): void {
  if (!alive() || !noiseBuf || !ctx || !master) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'lowpass';
  bp.frequency.value = 520;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.16);
}
