import React, { useEffect, useRef } from 'react';
import { MODALITY_SPECS } from '../data/argonFacts';

interface MoePrismCanvasProps {
  activeModalities: string[];
  reducedMotion: boolean;
}

const TOTAL_EXPERTS = 64;

export const MoePrismCanvas: React.FC<MoePrismCanvasProps> = ({
  activeModalities,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();

    const draw = (now: number) => {
      const t = reducedMotion ? 1.5 : (now - start) * 0.001;
      ctx.clearRect(0, 0, width, height);

      // Warm Dichroic Optical Bench Backdrop
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#120B1D');
      bg.addColorStop(0.5, '#0B0814');
      bg.addColorStop(1, '#140C1C');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Subtle optical bench ruler lines
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.07)';
      ctx.lineWidth = 1;
      const step = 36;
      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const isCompact = width < 640;
      const prismX = isCompact ? width * 0.42 : width * 0.42;
      const prismY = height * 0.5;
      const prismSize = isCompact ? 54 : 78;

      // Collect active experts & their colors
      const expertColorMap = new Map<number, string>();
      const activeSpecs = MODALITY_SPECS.filter((m) => activeModalities.includes(m.id));
      activeSpecs.forEach((spec) => {
        spec.activeExperts.forEach((eIdx) => {
          if (!expertColorMap.has(eIdx)) {
            expertColorMap.set(eIdx, spec.color);
          }
        });
      });

      // 1. Incoming Multimodal Wave-Trains (Left -> Prism)
      const sourceX = isCompact ? 24 : 44;
      MODALITY_SPECS.forEach((spec, idx) => {
        const sy = height * (0.16 + idx * 0.17);
        const isActive = activeModalities.includes(spec.id);

        // Emitter Node
        ctx.beginPath();
        ctx.arc(sourceX, sy, isActive ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? spec.color : 'rgba(148, 163, 184, 0.25)';
        ctx.fill();

        if (!isActive) {
          ctx.beginPath();
          ctx.moveTo(sourceX + 8, sy);
          ctx.lineTo(prismX - prismSize * 0.65, prismY + (idx - 2) * 10);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          return;
        }

        // Modulated harmonic wave-train into the prism
        const targetX = prismX - prismSize * 0.52;
        const targetY = prismY + (idx - 2) * 11;
        const segments = 42;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const u = s / segments;
          const bx = sourceX + (targetX - sourceX) * u;
          const by = sy + (targetY - sy) * u;
          const envelope = Math.sin(u * Math.PI);
          const wave =
            Math.sin(u * (14 + idx * 3) - t * 6.5 + idx) * (isCompact ? 4 : 6.5) * envelope;
          if (s === 0) ctx.moveTo(bx, by + wave);
          else ctx.lineTo(bx, by + wave);
        }
        ctx.strokeStyle = spec.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      });

      // 2. Expert Grid Coordinates (Right Side: 8x8 Sparse MoE Crystal Lattice)
      const gridLeft = isCompact ? width * 0.62 : width * 0.58;
      const gridRight = width - (isCompact ? 18 : 38);
      const gridTop = height * 0.13;
      const gridBottom = height * 0.87;
      const cols = 8;
      const rows = 8;
      const cellW = (gridRight - gridLeft) / (cols - 1);
      const cellH = (gridBottom - gridTop) / (rows - 1);

      // 3. Refracted Sparse Routing Beams (Prism -> Active Experts Only)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      expertColorMap.forEach((color, eIdx) => {
        const col = eIdx % cols;
        const row = Math.floor(eIdx / cols);
        const ex = gridLeft + col * cellW;
        const ey = gridTop + row * cellH;

        const startX = prismX + prismSize * 0.48;
        const startY = prismY + ((row - 3.5) / 4) * (prismSize * 0.35);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(
          startX + (ex - startX) * 0.38,
          startY,
          startX + (ex - startX) * 0.62,
          ey,
          ex,
          ey
        );
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.28 + 0.14 * Math.sin(t * 3 + eIdx);
        ctx.lineWidth = 1.35;
        ctx.stroke();
      });
      ctx.restore();

      // 4. Central Dichroic MoE Routing Prism (Octagonal Precision Crystal)
      ctx.save();
      ctx.translate(prismX, prismY);
      ctx.rotate(Math.sin(t * 0.4) * 0.04);

      // Outer prism glow
      const pGlow = ctx.createRadialGradient(0, 0, 6, 0, 0, prismSize * 1.45);
      pGlow.addColorStop(0, 'rgba(236, 72, 153, 0.34)');
      pGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
      pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pGlow;
      ctx.beginPath();
      ctx.arc(0, 0, prismSize * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Diamond/Hexagonal Crystal Polygon
      ctx.beginPath();
      ctx.moveTo(0, -prismSize * 0.88);
      ctx.lineTo(prismSize * 0.68, -prismSize * 0.32);
      ctx.lineTo(prismSize * 0.68, prismSize * 0.32);
      ctx.lineTo(0, prismSize * 0.88);
      ctx.lineTo(-prismSize * 0.68, prismSize * 0.32);
      ctx.lineTo(-prismSize * 0.68, -prismSize * 0.32);
      ctx.closePath();

      const crystalFill = ctx.createLinearGradient(
        -prismSize * 0.6,
        -prismSize * 0.8,
        prismSize * 0.6,
        prismSize * 0.8
      );
      crystalFill.addColorStop(0, 'rgba(139, 92, 246, 0.36)');
      crystalFill.addColorStop(0.5, 'rgba(15, 23, 42, 0.88)');
      crystalFill.addColorStop(1, 'rgba(45, 212, 191, 0.34)');
      ctx.fillStyle = crystalFill;
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.78)';
      ctx.stroke();

      // Internal facet lines
      ctx.beginPath();
      ctx.moveTo(0, -prismSize * 0.88);
      ctx.lineTo(0, prismSize * 0.88);
      ctx.moveTo(-prismSize * 0.68, -prismSize * 0.32);
      ctx.lineTo(prismSize * 0.68, prismSize * 0.32);
      ctx.moveTo(-prismSize * 0.68, prismSize * 0.32);
      ctx.lineTo(prismSize * 0.68, -prismSize * 0.32);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MoE ROUTER', 0, -3);
      ctx.fillStyle = '#F472B6';
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(`${expertColorMap.size}/${TOTAL_EXPERTS} ACTIVE`, 0, 11);
      ctx.restore();

      // 5. Render the 64-Expert Sparse Crystal Lattice Nodes
      for (let eIdx = 0; eIdx < TOTAL_EXPERTS; eIdx++) {
        const col = eIdx % cols;
        const row = Math.floor(eIdx / cols);
        const ex = gridLeft + col * cellW;
        const ey = gridTop + row * cellH;
        const activeColor = expertColorMap.get(eIdx);

        if (activeColor) {
          const glow = ctx.createRadialGradient(ex, ey, 1, ex, ey, 11);
          glow.addColorStop(0, '#FFFFFF');
          glow.addColorStop(0.4, activeColor);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(ex, ey, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ex, ey, 3.6, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.fill();
        }
      }

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [activeModalities, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="moe-prism-canvas"
      aria-label="稀疏混合專家 Sparse MoE 多模態分光稜鏡互動畫布"
    />
  );
};
