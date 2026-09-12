/**
 * FlowField — the core visual engine.
 *
 * Renders thousands of flowing particles along a 2D vector field
 * driven by simplex noise. The field responds to:
 *   - time (continuous drift)
 *   - scroll position (changes noise frequency, turbulence, flow direction)
 *   - cursor position (creates a local attractor/repulsor vortex)
 *   - stillness (when cursor is idle, field converges toward concentric circles)
 *   - click pulses (radial shockwaves that perturb particles)
 */

import { SimplexNoise2D } from './noise';

// --- Types ---

export interface FlowFieldConfig {
  particleCount: number;
  lineLength: number;
  speed: number;
  noiseScale: number;
  noiseSpeed: number;
  turbulence: number;      // 0–1, mixes in secondary noise layer
  convergence: number;      // 0–1, pulls field toward concentric pattern
  fadeAlpha: number;        // per-frame canvas fade (trail length)
  strokeAlpha: number;
  strokeWidth: number;
  accentRatio: number;      // fraction of particles drawn in accent color
  flowAngleOffset: number;  // global rotation of field (radians)
  cursorRadius: number;
  cursorStrength: number;
  particleDrift: number;    // vertical bias (simulates gravity/current)
}

export interface Pulse {
  x: number;
  y: number;
  birth: number;      // timestamp
  strength: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  isAccent: boolean;
  angle: number;  // cached field angle from last update
}

// --- Defaults ---

export const DEFAULT_CONFIG: FlowFieldConfig = {
  particleCount: 2800,
  lineLength: 1,
  speed: 1.2,
  noiseScale: 0.003,
  noiseSpeed: 0.00015,
  turbulence: 0,
  convergence: 0,
  fadeAlpha: 0.03,
  strokeAlpha: 0.18,
  strokeWidth: 0.8,
  accentRatio: 0.06,
  flowAngleOffset: 0,
  cursorRadius: 180,
  cursorStrength: 0.7,
  particleDrift: 0.15,
};

// --- Engine ---

export class FlowFieldEngine {
  private noise1: SimplexNoise2D;
  private noise2: SimplexNoise2D;
  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private time = 0;
  private dpr = 1;

  config: FlowFieldConfig;
  cursorX = -9999;
  cursorY = -9999;
  cursorActive = false;
  pulses: Pulse[] = [];

  // colors
  private baseColor = '26, 26, 26';
  private accentColor = '196, 125, 59';

  constructor(config?: Partial<FlowFieldConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.noise1 = new SimplexNoise2D(42);
    this.noise2 = new SimplexNoise2D(137);
  }

  resize(width: number, height: number, dpr: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;

    // Scale particle count with screen area (base = 1920*1080)
    const areaRatio = (width * height) / (1920 * 1080);
    const targetCount = Math.round(this.config.particleCount * Math.min(areaRatio, 1.5));
    this.initParticles(targetCount);
  }

  private initParticles(count: number) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomAge = false): Particle {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      age: randomAge ? Math.random() * 200 : 0,
      maxAge: 150 + Math.random() * 150,
      isAccent: Math.random() < this.config.accentRatio,
      angle: 0,
    };
  }

  private resetParticle(p: Particle) {
    // Respawn on a random edge or random position
    const edge = Math.random();
    if (edge < 0.25) { p.x = 0; p.y = Math.random() * this.height; }
    else if (edge < 0.5) { p.x = this.width; p.y = Math.random() * this.height; }
    else if (edge < 0.75) { p.x = Math.random() * this.width; p.y = 0; }
    else { p.x = Math.random() * this.width; p.y = this.height; }
    p.age = 0;
    p.maxAge = 150 + Math.random() * 150;
    p.isAccent = Math.random() < this.config.accentRatio;
    p.angle = 0;
  }

  private getFieldAngle(x: number, y: number): number {
    const c = this.config;
    const t = this.time;

    // Primary laminar flow
    let angle = this.noise1.fbm(
      x * c.noiseScale,
      y * c.noiseScale + t * c.noiseSpeed * 800,
      3
    ) * Math.PI * 2;

    // Turbulence layer
    if (c.turbulence > 0.001) {
      const turb = this.noise2.fbm(
        x * c.noiseScale * 2.5 + 100,
        y * c.noiseScale * 2.5 + t * c.noiseSpeed * 1600,
        4
      ) * Math.PI * 2;
      angle = angle * (1 - c.turbulence) + turb * c.turbulence;
    }

    // Convergence toward concentric circles (stillness mode)
    if (c.convergence > 0.001) {
      const cx = this.cursorActive ? this.cursorX : this.width / 2;
      const cy = this.cursorActive ? this.cursorY : this.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const concentricAngle = Math.atan2(dx, -dy) + Math.PI * 0.5;
      angle = angle * (1 - c.convergence) + concentricAngle * c.convergence;
    }

    // Cursor vortex
    if (this.cursorActive) {
      const dx = x - this.cursorX;
      const dy = y - this.cursorY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < c.cursorRadius && dist > 1) {
        const influence = 1 - dist / c.cursorRadius;
        const vortexAngle = Math.atan2(dx, -dy) + Math.PI * 0.4;
        angle += (vortexAngle - angle) * influence * c.cursorStrength * 0.5;
      }
    }

    // Pulse perturbation
    for (const pulse of this.pulses) {
      const elapsed = this.time - pulse.birth;
      const radius = elapsed * pulse.speed;
      const dx = x - pulse.x;
      const dy = y - pulse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ringWidth = 80;
      const distFromRing = Math.abs(dist - radius);
      if (distFromRing < ringWidth) {
        const influence = (1 - distFromRing / ringWidth) * Math.max(0, 1 - elapsed / 3);
        const pushAngle = Math.atan2(dy, dx);
        angle += (pushAngle - angle) * influence * pulse.strength;
      }
    }

    angle += c.flowAngleOffset;

    return angle;
  }

  update(dt: number) {
    this.time += dt;

    // Clean expired pulses
    this.pulses = this.pulses.filter(p => this.time - p.birth < 4);

    const c = this.config;

    for (const p of this.particles) {
      const angle = this.getFieldAngle(p.x, p.y);
      p.angle = angle;
      const vx = Math.cos(angle) * c.speed;
      const vy = Math.sin(angle) * c.speed + c.particleDrift;

      p.x += vx;
      p.y += vy;
      p.age++;

      // Reset if out of bounds or too old
      if (p.age > p.maxAge || p.x < -20 || p.x > this.width + 20 || p.y < -20 || p.y > this.height + 20) {
        this.resetParticle(p);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const c = this.config;
    const w = this.width * this.dpr;
    const h = this.height * this.dpr;

    // Fade existing content
    ctx.fillStyle = `rgba(245, 242, 237, ${c.fadeAlpha})`;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = c.strokeWidth * this.dpr;
    ctx.lineCap = 'round';

    for (const p of this.particles) {
      // Lifecycle fade: fade in for first 20 frames, fade out for last 30
      let lifeFade = 1;
      if (p.age < 20) lifeFade = p.age / 20;
      else if (p.age > p.maxAge - 30) lifeFade = (p.maxAge - p.age) / 30;
      lifeFade = Math.max(0, Math.min(1, lifeFade));

      const alpha = c.strokeAlpha * lifeFade;
      if (alpha < 0.01) continue;

      const color = p.isAccent ? this.accentColor : this.baseColor;
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;

      const angle = p.angle;
      const len = c.lineLength * this.dpr * (0.8 + lifeFade * 0.4);

      ctx.beginPath();
      ctx.moveTo(p.x * this.dpr, p.y * this.dpr);
      ctx.lineTo(
        (p.x + Math.cos(angle) * len * 3) * this.dpr,
        (p.y + Math.sin(angle) * len * 3) * this.dpr
      );
      ctx.stroke();
    }
  }

  /** Render a static texture (for reduced-motion) */
  renderStatic(ctx: CanvasRenderingContext2D) {
    const w = this.width * this.dpr;
    const h = this.height * this.dpr;

    ctx.fillStyle = 'rgba(245, 242, 237, 1)';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 0.6 * this.dpr;
    ctx.lineCap = 'round';

    const step = 12;
    for (let x = 0; x < this.width; x += step) {
      for (let y = 0; y < this.height; y += step) {
        const angle = this.noise1.fbm(x * 0.003, y * 0.003, 3) * Math.PI * 2;
        const len = 6 * this.dpr;
        const alpha = 0.08 + this.noise2.noise(x * 0.005, y * 0.005) * 0.04;
        ctx.strokeStyle = `rgba(26, 26, 26, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x * this.dpr, y * this.dpr);
        ctx.lineTo(
          (x + Math.cos(angle) * len) * this.dpr,
          (y + Math.sin(angle) * len) * this.dpr
        );
        ctx.stroke();
      }
    }
  }

  addPulse(x: number, y: number) {
    this.pulses.push({
      x, y,
      birth: this.time,
      strength: 0.8,
      speed: 120,
    });
  }
}
