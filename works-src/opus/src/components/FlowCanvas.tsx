import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { FlowFieldEngine, DEFAULT_CONFIG } from '../engine';
import type { FlowFieldConfig } from '../engine';

interface Props {
  reducedMotion: boolean;
}

export interface FlowCanvasHandle {
  setScrollProgress: (p: number) => void;
  setCursor: (x: number, y: number, active: boolean, idle: boolean, idleDuration: number) => void;
  addPulse: (x: number, y: number) => void;
  getStillnessRevealed: () => boolean;
}

/**
 * Maps scroll progress to flow field parameters.
 */
function getConfigForProgress(p: number): Partial<FlowFieldConfig> {
  if (p < 0.15) {
    return {
      noiseScale: 0.0025,
      speed: 1.0,
      turbulence: 0,
      convergence: 0,
      flowAngleOffset: Math.PI * 0.15,
      fadeAlpha: 0.025,
      strokeAlpha: 0.16,
      particleDrift: 0.12,
      accentRatio: 0.05,
      cursorStrength: 0.7,
      cursorRadius: 180,
    };
  }
  if (p < 0.35) {
    const t = (p - 0.15) / 0.2;
    return {
      noiseScale: 0.003 + t * 0.002,
      speed: 1.0 + t * 0.5,
      turbulence: t * 0.4,
      convergence: 0,
      flowAngleOffset: Math.PI * 0.15 - t * Math.PI * 0.1,
      fadeAlpha: 0.025 + t * 0.01,
      strokeAlpha: 0.16 + t * 0.06,
      particleDrift: 0.12 - t * 0.05,
      accentRatio: 0.05 + t * 0.03,
      cursorStrength: 0.7,
      cursorRadius: 180,
    };
  }
  if (p < 0.55) {
    const t = (p - 0.35) / 0.2;
    return {
      noiseScale: 0.005 - t * 0.002,
      speed: 1.5 - t * 0.3,
      turbulence: 0.4 - t * 0.3,
      convergence: t * 0.35,
      flowAngleOffset: Math.PI * 0.05,
      fadeAlpha: 0.035 - t * 0.01,
      strokeAlpha: 0.22,
      particleDrift: 0.07,
      accentRatio: 0.08 + t * 0.04,
      cursorStrength: 0.7,
      cursorRadius: 180,
    };
  }
  if (p < 0.75) {
    const t = (p - 0.55) / 0.2;
    return {
      noiseScale: 0.003,
      speed: 1.2 + t * 0.3,
      turbulence: 0.1 + t * 0.2,
      convergence: 0.35 - t * 0.35,
      flowAngleOffset: Math.PI * 0.05 + t * Math.PI * 0.1,
      fadeAlpha: 0.025,
      strokeAlpha: 0.2,
      particleDrift: 0.07 + t * 0.05,
      cursorStrength: 0.7 + t * 0.5,
      cursorRadius: 180 + t * 80,
      accentRatio: 0.12,
    };
  }
  const t = Math.min(1, (p - 0.75) / 0.25);
  return {
    noiseScale: 0.002,
    speed: 1.5 - t * 0.9,
    turbulence: 0.3 - t * 0.25,
    convergence: 0,
    flowAngleOffset: Math.PI * 0.15,
    fadeAlpha: 0.025 + t * 0.03,
    strokeAlpha: 0.2 - t * 0.1,
    particleDrift: 0.12 + t * 0.3,
    accentRatio: 0.12 - t * 0.08,
    cursorStrength: 0.7,
    cursorRadius: 180,
  };
}

function lerpConfig(
  current: Record<string, number>,
  target: Partial<FlowFieldConfig>,
  t: number
): Record<string, number> {
  const result: Record<string, number> = { ...current };
  for (const key of Object.keys(target)) {
    const a = current[key] ?? (DEFAULT_CONFIG as unknown as Record<string, number>)[key] ?? 0;
    const b = (target as Record<string, number>)[key] ?? a;
    result[key] = a + (b - a) * t;
  }
  return result;
}

export const FlowCanvas = forwardRef<FlowCanvasHandle, Props>(
  function FlowCanvas({ reducedMotion }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FlowFieldEngine | null>(null);
    const rafRef = useRef(0);
    const lastTimeRef = useRef(0);
    const currentConfigRef = useRef<Record<string, number>>({});
    const scrollProgressRef = useRef(0);
    const cursorRef = useRef({ x: -9999, y: -9999, active: false, idle: false, idleDuration: 0 });
    const stillnessRevealedRef = useRef(false);
    const [, forceUpdate] = useState(0);

    useImperativeHandle(ref, () => ({
      setScrollProgress(p: number) {
        scrollProgressRef.current = p;
      },
      setCursor(x: number, y: number, active: boolean, idle: boolean, idleDuration: number) {
        cursorRef.current = { x, y, active, idle, idleDuration };
      },
      addPulse(x: number, y: number) {
        engineRef.current?.addPulse(x, y);
      },
      getStillnessRevealed() {
        return stillnessRevealedRef.current;
      },
    }));

    useEffect(() => {
      if (!canvasRef.current) return;
      const engine = new FlowFieldEngine();
      engineRef.current = engine;
      const canvas = canvasRef.current;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        engine.resize(w, h, dpr);
      };
      resize();

      if (reducedMotion) {
        const ctx = canvas.getContext('2d');
        if (ctx) engine.renderStatic(ctx);
        const onResize = () => {
          resize();
          const ctx2 = canvas.getContext('2d');
          if (ctx2) engine.renderStatic(ctx2);
        };
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); };
      }

      window.addEventListener('resize', resize);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'rgba(245, 242, 237, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      lastTimeRef.current = performance.now();

      const loop = (now: number) => {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = now;

        const targetConfig = getConfigForProgress(scrollProgressRef.current);
        currentConfigRef.current = lerpConfig(currentConfigRef.current, targetConfig, 0.03);

        const finalConfig = { ...currentConfigRef.current };

        // Stillness override
        const cur = cursorRef.current;
        if (cur.idle && cur.idleDuration > 2) {
          const stillT = Math.min(1, (cur.idleDuration - 2) / 4);
          finalConfig.convergence = Math.max(finalConfig.convergence ?? 0, stillT * 0.7);
          finalConfig.speed = Math.min(finalConfig.speed ?? 1, 1.5 - stillT * 0.8);
          finalConfig.accentRatio = Math.max(finalConfig.accentRatio ?? 0, stillT * 0.3);
          if (stillT > 0.5 && !stillnessRevealedRef.current) {
            stillnessRevealedRef.current = true;
            forceUpdate(n => n + 1);
          }
        } else {
          if (stillnessRevealedRef.current && !cur.idle) {
            // Keep it revealed once found
          }
        }

        Object.assign(engine.config, finalConfig);

        engine.cursorX = cur.x;
        engine.cursorY = cur.y;
        engine.cursorActive = cur.active;

        engine.update(dt);
        engine.render(ctx);

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('resize', resize);
      };
    }, [reducedMotion]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
    );
  }
);
