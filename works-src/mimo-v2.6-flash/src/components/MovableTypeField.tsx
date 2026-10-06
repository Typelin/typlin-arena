import { useEffect, useRef, type RefObject } from "react";
import { MANIFESTO, NOTES, POOL } from "../lib/glyphs";
import { clamp, lerp, phaseFromProgress, smoothstep } from "../lib/scroll";

type Block = {
  ch: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  /** 相位 0：字盤格初排 */
  sx: number;
  sy: number;
  srot: number;
  dAmp: number;
  dSpd: number;
  dPh: number;
  /** 相位 1：揀字雲 */
  gx: number;
  gy: number;
  k: number;
  ink: number;
  flash: number;
  note: string;
};

export type HitInfo = { x: number; y: number; note: string; ch: string };

type Props = {
  progressRef: RefObject<number>;
  reduced: boolean;
  onHit: (hit: HitInfo) => void;
};

type SpriteKind = "wood" | "ink" | "flash";

const SPRITE = 112;
const spriteCache = new Map<string, HTMLCanvasElement>();

function spriteKey(ch: string, kind: SpriteKind) {
  return `${kind}:${ch}`;
}

function rounded(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

function buildSprite(ch: string, kind: SpriteKind): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SPRITE;
  c.height = SPRITE;
  const g = c.getContext("2d");
  if (!g) return c;

  const pad = 5;
  const r = Math.max(4, SPRITE * 0.1);
  const w = SPRITE - pad * 2;

  const wood = kind === "wood";
  const flash = kind === "flash";

  g.fillStyle = wood ? "rgb(234,226,208)" : flash ? "rgb(178,58,43)" : "rgb(26,20,16)";
  rounded(g, pad, pad, w, w, r);
  g.fill();
  g.strokeStyle = wood ? "rgba(23,19,15,0.18)" : "rgba(23,19,15,0.32)";
  g.lineWidth = 2;
  g.stroke();

  g.font = `700 ${Math.round(SPRITE * 0.58)}px "Noto Serif TC", "Songti TC", serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const cx = SPRITE / 2;
  const cy = SPRITE / 2 + SPRITE * 0.03;

  if (wood) {
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillText(ch, cx, cy + 2);
    g.fillStyle = "rgb(23,19,15)";
    g.fillText(ch, cx, cy);
  } else {
    g.fillStyle = "rgb(243,239,230)";
    g.fillText(ch, cx, cy);
  }

  spriteCache.set(spriteKey(ch, kind), c);
  return c;
}

function getSprite(ch: string, kind: SpriteKind): HTMLCanvasElement {
  const key = spriteKey(ch, kind);
  const hit = spriteCache.get(key);
  if (hit) return hit;
  return buildSprite(ch, kind);
}

function warmSprites() {
  const chars = Array.from(new Set([...Array.from(MANIFESTO), ...POOL]));
  for (const ch of chars) {
    getSprite(ch, "wood");
    getSprite(ch, "ink");
    getSprite(ch, "flash");
  }
}

const isMobile = () => window.innerWidth < 768;

function caseLayout(n: number, w: number, h: number) {
  const cols = isMobile() ? 10 : 18;
  const rows = Math.ceil(n / cols);
  const m = Math.min(w, h) * 0.07;
  const cell = Math.min((w - m * 2) / cols, (h - m * 2) / rows);
  const ox = w / 2 - (cols * cell) / 2;
  const oy = h / 2 - (rows * cell) / 2;
  return { cols, rows, cell, ox, oy };
}

function makeBlocks(n: number, w: number, h: number): Block[] {
  const blocks: Block[] = [];
  const manifesto = MANIFESTO;
  const lay = caseLayout(n, w, h);
  for (let i = 0; i < n; i++) {
    const col = i % lay.cols;
    const row = Math.floor(i / lay.cols);
    const jx = (Math.random() - 0.5) * lay.cell * 0.12;
    const jy = (Math.random() - 0.5) * lay.cell * 0.12;
    blocks.push({
      ch: manifesto[i % manifesto.length] || POOL[i % POOL.length],
      x: lay.ox + col * lay.cell + lay.cell / 2 + jx,
      y: lay.oy + row * lay.cell + lay.cell / 2 + jy,
      vx: 0,
      vy: 0,
      rot: (Math.random() - 0.5) * 0.25,
      vrot: 0,
      size: lay.cell * 0.88,
      sx: lay.ox + col * lay.cell + lay.cell / 2 + jx,
      sy: lay.oy + row * lay.cell + lay.cell / 2 + jy,
      srot: (Math.random() - 0.5) * 0.2,
      dAmp: 6 + Math.random() * 16,
      dSpd: 0.3 + Math.random() * 0.7,
      dPh: Math.random() * Math.PI * 2,
      gx: w * 0.5 + (Math.random() - 0.5) * w * 0.92,
      gy: h * 0.5 + (Math.random() - 0.5) * h * 0.94,
      k: 0.92 + Math.random() * 0.16,
      ink: 0,
      flash: 0,
      note: NOTES[i % NOTES.length],
    });
  }
  return blocks;
}

export default function MovableTypeField({ progressRef, reduced, onHit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, on: false });
  const blocksRef = useRef<Block[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const rafRef = useRef(0);
  const onHitRef = useRef(onHit);

  useEffect(() => {
    onHitRef.current = onHit;
  }, [onHit]);

  /* 字型就緒後重建 sprite（避免 fallback 字形被快取） */
  useEffect(() => {
    let alive = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (!alive) return;
        spriteCache.clear();
        warmSprites();
      });
    } else {
      warmSprites();
    }
    return () => {
      alive = false;
    };
  }, []);

  /* 建立／重建字模 + 尺寸 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const prevW = sizeRef.current.w;
      const prevH = sizeRef.current.h;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      sizeRef.current = { w: rect.width, h: rect.height, dpr };

      const n = isMobile() ? 180 : 360;
      if (blocksRef.current.length !== n) {
        blocksRef.current = makeBlocks(n, rect.width, rect.height);
      } else if (prevW > 0 && prevH > 0 && (prevW !== rect.width || prevH !== rect.height)) {
        const rx = rect.width / prevW;
        const ry = rect.height / prevH;
        for (const b of blocksRef.current) {
          b.sx *= rx;
          b.sy *= ry;
          b.gx *= rx;
          b.gy *= ry;
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* 指標：拂過字盤的壓力；點擊＝朱閃與旁註 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const set = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = cx - rect.left;
      mouseRef.current.y = cy - rect.top;
      mouseRef.current.on = true;
    };
    const move = (e: PointerEvent) => set(e.clientX, e.clientY);
    const leave = () => {
      mouseRef.current.on = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const down = (e: PointerEvent) => {
      set(e.clientX, e.clientY);
      const { x, y } = mouseRef.current;
      let best: Block | null = null;
      let bestD = Infinity;
      for (const b of blocksRef.current) {
        const d = Math.hypot(b.x - x, b.y - y);
        if (d < b.size * 0.8 && d < bestD) {
          best = b;
          bestD = d;
        }
      }
      if (best) {
        best.flash = 1;
        onHitRef.current({ x: best.x, y: best.y, note: best.note, ch: best.ch });
      }
    };

    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  /* 主迴圈：可見才跑；sprite drawImage；墨浪；壓印白閃 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t0 = performance.now();
    let running = false;
    let inView = true;
    let pageVisible = !document.hidden;
    let prevPhase = 0;
    let strike = 0;

    const draw = (now: number) => {
      const dt = Math.min(48, now - t0);
      t0 = now;
      const time = now / 1000;

      const { w, h, dpr } = sizeRef.current;
      if (w === 0 || h === 0) return;

      const phase = phaseFromProgress(progressRef.current ?? 0);
      if (prevPhase < 3.9 && phase >= 3.9) strike = 1;
      prevPhase = phase;
      if (strike > 0) strike = Math.max(0, strike - dt / 480);

      const blocks = blocksRef.current;
      const n = blocks.length;
      if (n === 0) return;

      const mob = isMobile();
      const base = Math.min(w, h) * 0.038;
      const cols = mob ? 12 : 24;
      const rows = Math.ceil(n / cols);
      const gw = w * (mob ? 0.94 : 0.7);
      const gh = h * (mob ? 0.62 : 0.74);
      const sGrid = Math.min(gw / cols, gh / rows);
      const gridX = w / 2 - (cols * sGrid) / 2;
      const gridY = h / 2 - (rows * sGrid) / 2;

      const side = Math.ceil(Math.sqrt(n));
      const sForm = (Math.min(w, h) * 0.54) / side;
      const formX = w / 2 - (side * sForm) / 2;
      const formY = h / 2 - (side * sForm) / 2 - h * 0.03;

      const caseLay = caseLayout(n, w, h);
      const heroW = 1 - clamp(phase, 0, 1);
      const pressA = smoothstep(clamp(phase - 3, 0, 1));
      const t1 = clamp(phase, 0, 1);
      const t2 = clamp(phase - 1, 0, 1);
      const t3 = clamp(phase - 2, 0, 1);
      const t4 = clamp(phase - 3, 0, 1);

      const vibrate = !reduced && phase > 2.4 && phase < 2.98 && t2 > 0.5;
      const spring = reduced ? 1 : 1 - Math.pow(0.86, dt / 16.67);
      const rotSpring = reduced ? 1 : 1 - Math.pow(0.82, dt / 16.67);
      const R = mob ? 90 : 130;
      const R2 = R * R;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseOn = mouseRef.current.on && !reduced && phase < 2.2;
      const maxWave = Math.max(1, cols - 1 + (rows - 1));

      for (let i = 0; i < n; i++) {
        const b = blocks[i];
        const gCol = i % cols;
        const gRow = Math.floor(i / cols);
        const fCol = i % side;
        const fRow = Math.floor(i / side);

        let tx = b.sx;
        let ty = b.sy;
        let trot = b.srot;
        let tSize = caseLay.cell * 0.88 * b.k;

        if (t1 > 0) {
          tx = lerp(tx, b.gx, t1);
          ty = lerp(ty, b.gy, t1);
          trot = lerp(trot, b.srot * 0.35, t1);
          tSize = lerp(tSize, base * b.k, t1);
        }

        const gtx = gridX + gCol * sGrid + sGrid / 2;
        const gty = gridY + gRow * sGrid + sGrid / 2;
        const gridSize = sGrid * 0.94 * b.k;
        if (t2 > 0) {
          tx = lerp(tx, gtx, t2);
          ty = lerp(ty, gty, t2);
          trot = lerp(trot, 0, t2);
          tSize = lerp(tSize, gridSize, t2);
        }
        if (t3 > 0) {
          tx = lerp(tx, w / 2 + (gtx - w / 2) * 0.97, t3);
          ty = lerp(ty, h / 2 + (gty - h / 2) * 0.97, t3);
        }

        const ftx = formX + fCol * sForm + sForm / 2;
        const fty = formY + fRow * sForm + sForm / 2;
        const formSize = sForm * 0.94;
        if (t4 > 0) {
          tx = lerp(tx, ftx, t4);
          ty = lerp(ty, fty, t4);
          tSize = lerp(tSize, formSize, t4);
        }

        if (heroW > 0.01 && !reduced) {
          tx += Math.sin(time * b.dSpd + b.dPh) * b.dAmp * heroW;
          ty += Math.cos(time * b.dSpd * 0.83 + b.dPh * 1.7) * b.dAmp * heroW;
          trot += Math.sin(time * b.dSpd * 0.6 + b.dPh) * 0.1 * heroW;
        }
        if (vibrate) {
          tx += Math.sin(time * 31 + b.dPh * 5) * 1.7;
          ty += Math.cos(time * 27 + b.dPh * 3) * 1.7;
        }

        if (reduced) {
          b.x = tx;
          b.y = ty;
          b.rot = trot;
          b.size = tSize;
          b.vx = 0;
          b.vy = 0;
          b.vrot = 0;
        } else {
          b.vx = (b.vx + (tx - b.x) * spring * 0.62) * 0.85;
          b.vy = (b.vy + (ty - b.y) * spring * 0.62) * 0.85;
          b.x += b.vx;
          b.y += b.vy;
          b.vrot = (b.vrot + (trot - b.rot) * rotSpring * 0.45) * 0.78;
          b.rot += b.vrot;
          b.size += (tSize - b.size) * 0.14;
        }

        if (mouseOn) {
          const dx = b.x - mx;
          const dy = b.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 1.9;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
            b.vrot += (Math.random() - 0.5) * 0.12 * (1 - d / R);
          }
        }

        /* 墨浪：由左上向右下掃過，phase 2.0 起、3.0 前飽和 */
        const wave = (gCol + gRow) / maxWave;
        const inkT = smoothstep(clamp((phase - 2.0 - wave * 0.4) / 0.6, 0, 1));
        b.ink += (inkT - b.ink) * (reduced ? 1 : 0.12);
        if (b.flash > 0) b.flash = Math.max(0, b.flash - dt / 1200);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (pressA > 0.01) {
        const pad = sForm * 1.2;
        const bw = side * sForm + pad;
        const bh = side * sForm + pad;
        ctx.save();
        ctx.translate(w / 2, formY + (side * sForm) / 2);
        ctx.fillStyle = `rgba(178, 58, 43, ${pressA * 0.13})`;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
        ctx.fill();
        ctx.strokeStyle = `rgba(178, 58, 43, ${pressA * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = `rgba(178, 58, 43, ${pressA * 0.35})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10);
        ctx.restore();
      }

      for (let i = 0; i < n; i++) {
        const b = blocks[i];
        const s = b.size;
        const ink = b.ink;
        const half = s / 2;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);

        if (ink < 0.02) {
          ctx.drawImage(getSprite(b.ch, "wood"), -half, -half, s, s);
        } else if (ink > 0.98 && b.flash <= 0.01) {
          ctx.drawImage(getSprite(b.ch, "ink"), -half, -half, s, s);
        } else {
          ctx.drawImage(getSprite(b.ch, "wood"), -half, -half, s, s);
          ctx.globalAlpha = ink;
          ctx.drawImage(getSprite(b.ch, "ink"), -half, -half, s, s);
          if (b.flash > 0.01) {
            ctx.globalAlpha = b.flash;
            ctx.drawImage(getSprite(b.ch, "flash"), -half, -half, s, s);
          }
          ctx.globalAlpha = 1;
        }

        if (b.flash > 0.01 && ink <= 0.02) {
          ctx.globalAlpha = b.flash;
          ctx.drawImage(getSprite(b.ch, "flash"), -half, -half, s, s);
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      if (strike > 0.01) {
        ctx.fillStyle = `rgba(243, 239, 230, ${strike * 0.52})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const tick = (now: number) => {
      if (!inView || !pageVisible) {
        running = false;
        return;
      }
      draw(now);
      rafRef.current = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (running || !inView || !pageVisible) return;
      running = true;
      t0 = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) ensureLoop();
        else stopLoop();
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);

    const onVis = () => {
      pageVisible = !document.hidden;
      if (pageVisible) ensureLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    ensureLoop();

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [progressRef, reduced]);

  return <canvas ref={canvasRef} className="type-field" aria-hidden="true" />;
}
