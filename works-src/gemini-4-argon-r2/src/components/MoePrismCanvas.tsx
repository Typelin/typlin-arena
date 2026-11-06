import React, { useEffect, useRef } from 'react';
import { MODALITY_SPECS } from '../data/argonFacts';

interface MoePrismCanvasProps {
  activeModalities: Record<string, boolean>;
  reducedMotion: boolean;
}

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
      width = Math.max(rect.width, 280);
      height = Math.max(rect.height, 340);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = reducedMotion ? 1.2 : (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const isCompact = width < 560;
      const prismX = isCompact ? width * 0.34 : width * 0.37;
      const prismY = height * 0.5;
      const prismR = Math.min(width, height) * (isCompact ? 0.13 : 0.15);

      const gridLeft = isCompact ? width * 0.54 : width * 0.56;
      const gridRight = width - (isCompact ? 16 : 28);
      const gridWidth = Math.max(120, gridRight - gridLeft);
      const gridHeight = Math.min(height * 0.72, gridWidth * 0.92);
      const gridTop = (height - gridHeight) * 0.5;

      // Collect active experts & modalities
      const activeExpertMap = new Map<number, string>();
      MODALITY_SPECS.forEach((m) => {
        if (activeModalities[m.id]) {
          m.activeExperts.forEach((idx) => {
            if (!activeExpertMap.has(idx)) {
              activeExpertMap.set(idx, m.color);
            }
          });
        }
      });

      // 1. Background editorial coordinate hairlines
      ctx.save();
      ctx.strokeStyle = 'rgba(23, 18, 14, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(prismX, 24);
      ctx.lineTo(prismX, height - 24);
      ctx.moveTo(16, prismY);
      ctx.lineTo(width - 16, prismY);
      ctx.stroke();
      ctx.restore();

      // 2. Compute 8x8 (64-Node) Expert Matrix Coordinates
      const cols = 8;
      const rows = 8;
      const nodeCoords: Array<{ x: number; y: number; active: boolean; color: string }> = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const nx = gridLeft + (c / (cols - 1)) * gridWidth;
          const ny = gridTop + (r / (rows - 1)) * gridHeight;
          const color = activeExpertMap.get(idx) || '#17120E';
          nodeCoords.push({
            x: nx,
            y: ny,
            active: activeExpertMap.has(idx),
            color,
          });
        }
      }

      // 3. Draw 5 Modality Input Beams -> Central Dichroic Prism
      MODALITY_SPECS.forEach((m, idx) => {
        const yStart = height * (0.18 + idx * 0.16);
        const xStart = isCompact ? 14 : 24;
        const isOn = Boolean(activeModalities[m.id]);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(prismX - prismR * 0.65, prismY + (idx - 2) * (prismR * 0.24));
        ctx.strokeStyle = isOn ? m.color : 'rgba(23, 18, 14, 0.16)';
        ctx.lineWidth = isOn ? 2.2 : 1;
        if (!isOn) ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated pulse bead along active input beam
        if (isOn) {
          const t = (elapsed * 0.65 + idx * 0.21) % 1;
          const bx = xStart + (prismX - prismR * 0.65 - xStart) * t;
          const by = yStart + (prismY + (idx - 2) * (prismR * 0.24) - yStart) * t;
          ctx.beginPath();
          ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        }

        // Modality index label on canvas
        ctx.font = '500 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = isOn ? '#17120E' : 'rgba(23, 18, 14, 0.4)';
        ctx.textAlign = 'left';
        ctx.fillText(`${m.code} · ${m.bigNum} ${m.unit}`, xStart, yStart - 7);
        ctx.restore();
      });

      // 4. Draw Refracted Sparse Routing Rays from Prism -> Active Experts ONLY
      ctx.save();
      nodeCoords.forEach((n, idx) => {
        if (!n.active) return;
        ctx.beginPath();
        ctx.moveTo(prismX + prismR * 0.65, prismY);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = n.color;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1.15;
        ctx.stroke();

        // Travelling activation impulse
        const p = (elapsed * 0.9 + (idx % 7) * 0.14) % 1;
        const px = prismX + prismR * 0.65 + (n.x - (prismX + prismR * 0.65)) * p;
        const py = prismY + (n.y - prismY) * p;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });
      ctx.restore();

      // 5. Draw Central Engraved Sparse Gating Prism (Octagonal Optical Crystal)
      ctx.save();
      ctx.translate(prismX, prismY);

      ctx.beginPath();
      ctx.arc(0, 0, prismR * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(23, 18, 14, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.rotate(elapsed * 0.08);
      ctx.beginPath();
      const sides = 6;
      for (let s = 0; s <= sides; s++) {
        const a = (s / sides) * Math.PI * 2 - Math.PI / 2;
        const rx = Math.cos(a) * prismR;
        const ry = Math.sin(a) * prismR;
        if (s === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(246, 239, 228, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#17120E';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner crystal facets
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * prismR, Math.sin(a) * prismR);
        ctx.strokeStyle = 'rgba(200, 75, 36, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#17120E';
      ctx.textAlign = 'center';
      ctx.fillText('SPARSE GATE', prismX, prismY - 3);
      ctx.fillStyle = '#C84B24';
      ctx.fillText('MoE ROUTER', prismX, prismY + 9);
      ctx.restore();

      // 6. Draw 8x8 Expert Lattice Nodes on Right
      ctx.save();
      nodeCoords.forEach((n, idx) => {
        if (n.active) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 75, 36, 0.14)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 3.2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(23, 18, 14, 0.28)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (!isCompact && idx % 8 === 0) {
          ctx.font = '400 8.5px "IBM Plex Mono", monospace';
          ctx.fillStyle = 'rgba(23, 18, 14, 0.45)';
          ctx.textAlign = 'right';
          ctx.fillText(`E${String(idx).padStart(2, '0')}`, n.x - 9, n.y + 3);
        }
      });

      // Header & Footer stamps above/below the 8x8 matrix
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#17120E';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ACTIVE SUBSET: ${activeExpertMap.size} / 64 EXPERTS IGNITED`,
        gridLeft,
        gridTop - 16
      );
      ctx.fillStyle = 'rgba(23, 18, 14, 0.58)';
      ctx.fillText(
        'TOTAL / ACTIVE PARAMS: 官方未公開 · TPU PODS + ML PATHWAYS',
        gridLeft,
        gridTop + gridHeight + 22
      );
      ctx.restore();

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [activeModalities, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="moe-prism-canvas"
      aria-label="稀疏混合專家 Sparse MoE 分光路由光學銅版圖"
    />
  );
};
