/**
 * FieldEngine — a framework-free physics engine for the "token field".
 *
 * The field is one continuous state: scroll progress sets its temperature,
 * pointer acts as an attention head (hold = gaze), and chapter checkpoints
 * bind tokens into sentences. Everything on screen derives from this single
 * system, which is what gives sections visual causality.
 */

export interface FieldConfig {
  /** Bound sentence per chapter index (0..3). */
  sentences: string[];
  /** Extra character pool source (CJK chars only matter). */
  corpus: string;
}

interface Tok {
  x: number; y: number; vx: number; vy: number;
  c: string; s: number; id: number;
  bound: boolean; tx: number; ty: number;
  flash: number; bindAt: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const INK = '#211d18';
const VERM = '#be3e2c';
const FONT_MAIN = '"Noto Serif TC", serif';
const FONT_MONO = 'ui-monospace, "Cascadia Code", Consolas, monospace';

export class FieldEngine {
  t = 0.85;            // smoothed temperature (1 = pure noise)
  prog = 0;            // scroll progress 0..1
  boundIdx = -1;       // active chapter index (-1 none)
  gazeMs = 0;          // cumulative gaze time (hidden layer feedback)
  readChars = 0;       // chars whose sentences formed in front of you (stat)
  readingSecs = 0;     // seconds from first scroll to reaching the ending (stat)
  lockedFlags: boolean[] = [];
  onLocked?: () => void;
  onGazeStart?: () => void;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: FieldConfig;
  private toks: Tok[] = [];
  private W = 0; private H = 0; private dpr = 1; private size = 16;
  private tg = 0; private last = performance.now(); private raf = 0;
  private ptr = { x: -9999, y: -9999, down: false, t0: 0, sx: 0, sy: 0, gaze: false };
  private wcache = new Map<string, number>();
  private rm = false;
  private endingOn = false;
  private lockInfo: { left: number; right: number; y: number } | null = null;
  private lockAt = 0;
  private countedFlags: boolean[] = [];
  private readStarted = false;
  private readStartTg = 0;
  private recorded = false;
  private ripples: { x: number; y: number; t0: number }[] = [];
  private dead = false;

  constructor(canvas: HTMLCanvasElement, cfg: FieldConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    this.ctx = ctx;
    this.cfg = cfg;
    this.lockedFlags = cfg.sentences.map(() => false);
    this.countedFlags = cfg.sentences.map(() => false);

    this.onResize();
    this.buildTokens();
    this.onScroll();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);

    const rmq = matchMedia('(prefers-reduced-motion: reduce)');
    this.rm = rmq.matches;
    rmq.addEventListener?.('change', (e) => { this.rm = e.matches; });

    // Wait for the real font so metrics & drawing are final.
    document.fonts.load(`${this.size}px ${FONT_MAIN}`).then(() => {
      if (this.dead) return;
      this.wcache.clear();
      if (this.boundIdx >= 0) this.assignTargets(false);
    });

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /* ---------------- public API ---------------- */

  setBound(i: number | null) {
    const idx = i === null ? -1 : i;
    if (idx === this.boundIdx) return;
    this.release(true);
    this.boundIdx = idx;
    this.lockInfo = null;
    if (this.boundIdx >= 0) {
      this.assignTargets(false);
      // a sentence counts as "read" the moment it forms in front of you —
      // fast scrollers still get their full record.
      const i2 = this.boundIdx;
      if (!this.countedFlags[i2]) {
        this.countedFlags[i2] = true;
        this.readChars += this.cfg.sentences[i2].length;
      }
    }
  }

  setEnding(on: boolean) {
    this.endingOn = on;
    if (on && !this.recorded) {
      this.recorded = true;
      this.readingSecs = Math.max(0, this.tg - this.readStartTg);
    }
  }

  /** Small touch feedback: a ripple ring + gentle push of nearby tokens. */
  pulseAt(x: number, y: number) {
    this.ripples.push({ x, y, t0: this.tg });
    if (this.ripples.length > 6) this.ripples.shift();
    const R = 200;
    for (const tk of this.toks) {
      const dx = tk.x - x, dy = tk.y - y;
      const d = Math.hypot(dx, dy);
      if (d < R && d > 1) {
        const imp = (1 - d / R) * 90 * (this.rm ? 0.5 : 1);
        tk.vx += (dx / d) * imp;
        tk.vy += (dy / d) * imp;
      }
    }
  }

  breathAt(x?: number, y?: number) {
    const cx = x ?? this.W / 2, cy = y ?? this.H / 2;
    const mul = this.rm ? 0.45 : 1;
    for (const tk of this.toks) {
      const dx = tk.x - cx, dy = tk.y - cy;
      const d = Math.hypot(dx, dy);
      if (d < 2) continue;
      const imp = (26 + Math.min(230, d * 0.22)) * mul;
      tk.vx += (dx / d) * imp;
      tk.vy += (dy / d) * imp;
    }
  }

  reset() {
    this.buildTokens();
    this.t = 0.85;
    this.boundIdx = -1;
    this.lockInfo = null;
    this.gazeMs = 0;
    this.readChars = 0;
    this.readingSecs = 0;
    this.lockedFlags = this.cfg.sentences.map(() => false);
    this.countedFlags = this.cfg.sentences.map(() => false);
    this.readStarted = false;
    this.recorded = false;
    this.ripples = [];
    this.onScroll();
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
  }

  /* ---------------- setup ---------------- */

  private onResize = () => {
    const w = Math.floor(window.innerWidth), h = Math.floor(window.innerHeight);
    if (w === this.W && h === this.H) return;
    this.W = w; this.H = h;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.size = w < 720 ? 14 : 16;
    this.wcache.clear();
    if (this.boundIdx >= 0) this.assignTargets(false);
  };

  private onScroll = () => {
    const docH = document.documentElement.scrollHeight;
    const vh = window.innerHeight;
    this.prog = docH > vh ? clamp(window.scrollY / (docH - vh), 0, 1) : 0;
    if (!this.readStarted && window.scrollY > 8) {
      this.readStarted = true;
      this.readStartTg = this.tg;
    }
  };

  private buildTokens() {
    // Count must cover every sentence's character multiset.
    const N = Math.round(clamp((this.W * this.H) / 1600, 340, 760));
    const required = this.cfg.sentences.join('');
    const poolChars = uniqueChars(this.cfg.corpus);
    const chars: string[] = [];
    for (const ch of required) if (!/\s|，。、；：！？—…「」『』（）/.test(ch)) chars.push(ch);
    while (chars.length < N) {
      chars.push(poolChars[Math.floor(Math.random() * poolChars.length)] || '字');
    }
    this.toks = chars.slice(0, N).map((c, id) => ({
      x: Math.random() * this.W, y: Math.random() * this.H,
      vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
      c, s: Math.random(), id: id + 1, bound: false, tx: 0, ty: 0, flash: 0, bindAt: 0,
    }));
  }

  private zone() {
    const W = this.W, H = this.H;
    if (W >= 1024) {
      // Right margin column — geometry guarantees no overlap with .wrap.
      const zw = Math.min(420, W * 0.26);
      return { left: W - 36 - zw, right: W - 36, y: H * 0.5 };
    }
    // Mobile: bottom band of the viewport (sections keep it empty).
    const zw = Math.min(W - 48, 620);
    return { left: (W - zw) / 2, right: (W + zw) / 2, y: H * 0.8 };
  }

  private charWidth(ch: string): number {
    const hit = this.wcache.get(ch);
    if (hit !== undefined) return hit;
    this.ctx.font = `${this.size}px ${FONT_MAIN}`;
    const w = this.ctx.measureText(ch).width;
    this.wcache.set(ch, w);
    return w;
  }

  private assignTargets(impulse: boolean) {
    const text = this.cfg.sentences[this.boundIdx];
    const z = this.zone();
    // CJK full-width advance == font size; layout at the bound (larger) size.
    const adv = this.size * 1.28;
    let total = text.length * adv;
    if (total > z.right - z.left) {
      const scale = (z.right - z.left) / total;
      // fall back to shrinking via virtual widths: approximate by reducing size
      void scale;
    }
    let x = z.left + (z.right - z.left - total) / 2;
    const pts: { x: number; y: number; c: string }[] = [];
    for (const ch of text) {
      pts.push({ x: x + adv / 2, y: z.y, c: ch });
      x += adv;
    }
    // pick tokens by character identity so the sentence renders exactly
    const pools = new Map<string, Tok[]>();
    for (const tk of this.toks) {
      if (tk.bound) continue;
      let arr = pools.get(tk.c);
      if (!arr) { arr = []; pools.set(tk.c, arr); }
      arr.push(tk);
    }
    for (const arr of pools.values()) arr.sort((a, b) => a.x - b.x || a.y - b.y);
    const used = new Set<Tok>();
    for (let k = 0; k < pts.length; k++) {
      const arr = pools.get(pts[k].c) ?? [];
      const tk = arr.find((t) => !used.has(t));
      if (!tk) continue; // should not happen: pool counts guaranteed at build
      used.add(tk);
      tk.bound = true;
      tk.tx = pts[k].x; tk.ty = pts[k].y;
      tk.bindAt = this.tg;
      tk.flash = 0;
    }
    void impulse;
    this.lockInfo = { left: pts[0].x - adv / 2, right: pts[pts.length - 1].x + adv / 2, y: z.y };
  }

  private release(impulse: boolean) {
    for (const tk of this.toks) {
      if (!tk.bound) continue;
      tk.bound = false;
      if (impulse) {
        const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 70;
        tk.vx += Math.cos(a) * sp;
        tk.vy += Math.sin(a) * sp;
      }
    }
  }

  /* ---------------- pointer / gaze ---------------- */

  private onDown = (e: PointerEvent) => {
    this.ptr.down = true; this.ptr.t0 = performance.now();
    this.ptr.x = e.clientX; this.ptr.y = e.clientY;
    this.ptr.sx = e.clientX; this.ptr.sy = e.clientY;
  };
  private onMove = (e: PointerEvent) => {
    this.ptr.x = e.clientX; this.ptr.y = e.clientY;
  };
  private onUp = () => { this.ptr.down = false; this.ptr.gaze = false; };

  /* ---------------- frame loop ---------------- */

  private frame = (now: number) => {
    if (this.dead) return;
    const dt = Math.min((now - this.last) / 1000, 0.034);
    this.last = now;
    this.tg += dt;

    // temperature target from scroll progress + ending override
    const baseT = lerp(0.85, 0.24, smoothstep((this.prog - 0.03) / 0.72));
    const targetT = this.endingOn ? 0.06 : baseT;
    this.t += (targetT - this.t) * (1 - Math.exp(-dt * 2.4));

    // gaze detection: press & hold with little travel
    const p = this.ptr;
    if (p.down && !p.gaze && now - p.t0 > 450 && Math.hypot(p.x - p.sx, p.y - p.sy) < 16) {
      p.gaze = true;
      for (const tk of this.toks) tk.flash = 0;
      this.onGazeStart?.();
    }
    if (!p.down) p.gaze = false;
    if (p.gaze) this.gazeMs += dt * 1000;

    const T = this.t * (0.92 + 0.08 * Math.sin(this.tg * 0.55)); // slow autonomous breath
    const flowA = (this.rm ? 46 : 92) * T;
    const maxS = 26 + 130 * T;
    const R_PTR = 150, R_GAZE = 104;

    for (const tk of this.toks) {
      if (tk.bound) {
        const K = this.rm ? 10 : 24;
        tk.vx += (tk.tx - tk.x) * K * dt;
        tk.vy += (tk.ty - tk.y) * K * dt;
        const dmp = Math.exp(-dt * (this.rm ? 5.2 : 7.6));
        tk.vx *= dmp; tk.vy *= dmp;
      } else {
        const ang = Math.sin(tk.x * 0.0037 + this.tg * 0.43) + Math.cos(tk.y * 0.0041 - this.tg * 0.31);
        tk.vx += Math.cos(ang) * flowA * dt;
        tk.vy += Math.sin(ang) * flowA * dt;
        if (Math.random() < dt * 9) {
          const k = T * 320;
          tk.vx += (Math.random() - 0.5) * k;
          tk.vy += (Math.random() - 0.5) * k;
        }
        // attention head: gentle pull, stronger as coherence grows
        const dx = p.x - tk.x, dy = p.y - tk.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R_PTR * R_PTR && d2 > 1) {
          const d = Math.sqrt(d2), f = 1 - d / R_PTR;
          const a = (70 + 300 * T) * f;
          tk.vx += (dx / d) * a * dt;
          tk.vy += (dy / d) * a * dt;
        }
        if (p.gaze && d2 < R_GAZE * R_GAZE) {
          const gd = Math.sqrt(d2);
          const dampG = Math.exp(-dt * 6.8);
          tk.vx *= dampG; tk.vy *= dampG;
          void gd;
        }
        // speed cap keeps free tokens in a readable drift range (bound tokens fly freely)
        const sp = Math.hypot(tk.vx, tk.vy);
        if (sp > maxS) { const q = maxS / sp; tk.vx *= q; tk.vy *= q; }
      }

      // gaze flash (char -> weight index) lifecycle
      if (p.gaze) {
        const d2g = (p.x - tk.x) ** 2 + (p.y - tk.y) ** 2;
        if (d2g < R_GAZE * R_GAZE) tk.flash = Math.min(1, tk.flash + dt / 0.9);
      } else {
        tk.flash = Math.max(0, tk.flash - dt * 2);
      }

      tk.x += tk.vx * dt; tk.y += tk.vy * dt;

      // seamless wrap beyond soft margins
      const M = 56;
      if (tk.x < -M) tk.x = this.W + M - 20;
      else if (tk.x > this.W + M) tk.x = -M + 20;
      if (tk.y < -M) tk.y = this.H + M - 20;
      else if (tk.y > this.H + M) tk.y = -M + 20;
    }

    // click ripples (touch feedback) — expire after 0.7s
    this.ripples = this.ripples.filter((r) => this.tg - r.t0 < 0.7);

    // lock detection: bound tokens settled close to targets
    const bi = this.boundIdx;
    if (bi >= 0 && !this.lockedFlags[bi]) {
      let sum = 0, n = 0;
      for (const tk of this.toks) if (tk.bound) { sum += (tk.tx - tk.x) ** 2 + (tyDist(tk)); n++; }
      function tyDist(t: Tok) { return (t.ty - t.y) ** 2; }
      if (n > 0 && sum / n < 36) {
        this.lockedFlags[bi] = true;
        this.readChars += this.cfg.sentences[bi].length;
        this.lockAt = this.tg;
        this.onLocked?.();
      }
    }

    this.draw(T);
    this.raf = requestAnimationFrame(this.frame);
  };

  /* ---------------- drawing ---------------- */

  private draw(T: number) {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const s = this.size;
    const fontMain = `${s}px ${FONT_MAIN}`;
    const fontMono = `${Math.round(s * 0.62)}px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // pass 1: free tokens (normal glyphs)
    ctx.font = fontMain;
    for (const tk of this.toks) {
      if (tk.bound || tk.flash > 0.45) continue;
      const wob = Math.sin(this.tg * 1.25 + tk.s * Math.PI * 2) * (this.rm ? 0.6 : 1.3);
      const a = clamp(0.14 + 0.38 * (1 - T) + (tk.s - 0.5) * 0.1, 0.07, 0.62);
      ctx.globalAlpha = a;
      ctx.fillStyle = INK;
      ctx.fillText(tk.c, tk.x + wob, tk.y);
    }

    // pass 2: gaze flash — glyphs become weight indices (the hidden layer)
    let monoSet = false;
    for (const tk of this.toks) {
      if (!tk.bound && tk.flash > 0.45) {
        if (!monoSet) { ctx.font = fontMono; monoSet = true; }
        const k = Math.min(1, (tk.flash - 0.45) / 0.3);
        ctx.globalAlpha = k * 0.8;
        ctx.fillStyle = INK;
        ctx.fillText(String(tk.id).padStart(4, '0'), tk.x, tk.y + s * 0.9);
      }
    }

    // pass 3: bound tokens (full ink, press-in scale — a stamp being set)
    const sB = s * 1.28;
    for (const tk of this.toks) {
      if (!tk.bound) continue;
      const k = 1 + 0.13 * Math.max(0, 1 - easeOutCubic(Math.min(1, (this.tg - tk.bindAt) / 0.4)));
      ctx.font = `${(sB * k).toFixed(1)}px ${FONT_MAIN}`;
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = INK;
      const wob = Math.sin(this.tg * 1.25 + tk.s * Math.PI * 2) * (this.rm ? 0.3 : 0.7);
      ctx.fillText(tk.c, tk.x + wob, tk.y);
    }

    // underline sweep after lock — the "locked in" beat
    const bi = this.boundIdx;
    if (bi >= 0 && this.lockedFlags[bi] && this.lockInfo) {
      const fullW = this.lockInfo.right - this.lockInfo.left;
      const wgt = easeOutCubic(Math.min(1, (this.tg - this.lockAt) / 0.55));
      ctx.font = fontMain;
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = VERM;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const y = this.lockInfo.y + s * 0.52;
      ctx.moveTo(this.lockInfo.left, y);
      ctx.lineTo(this.lockInfo.left + fullW * wgt, y);
      ctx.stroke();
    }

    // gaze ring feedback
    if (this.ptr.gaze) {
      const r = R_GAZE_DRAW() * (0.9 + 0.06 * Math.sin(this.tg * 2.7));
      ctx.font = fontMain;
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.ptr.x, this.ptr.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // click ripples — "touching the field" feedback
    for (const rp of this.ripples) {
      const age = (this.tg - rp.t0) / 0.7;
      ctx.font = fontMain;
      ctx.globalAlpha = (1 - age) * 0.35;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 18 + age * 150, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    function R_GAZE_DRAW() { return 104; }
  }
}

function uniqueChars(src: string): string[] {
  const set = new Set<string>();
  for (const ch of src) if (!/\s|，。、；：！？—…「」『』（）\d/.test(ch)) set.add(ch);
  return [...set];
}
