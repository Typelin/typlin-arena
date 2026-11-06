import React, { useEffect, useRef } from 'react';
import { THINKING_LEVELS } from '../data/argonFacts';

export type ThinkingLevelKey = keyof typeof THINKING_LEVELS;

interface ClimaxReasoningCanvasProps {
  level: ThinkingLevelKey;
  longDecode: boolean;
  pulseCount: number;
  reducedMotion: boolean;
}

interface StratumNode {
  x: number; // -1 to 1
  y: number; // stratum Y (-1 to 1)
  z: number; // -1 to 1
  stratum: number;
}

const STRATUM_LABELS = [
  'I · 1M CONTEXT INGEST',
  'II · SPARSE MoE DECOMPOSE',
  'III · HYPOTHESIS TREE',
  'IV · 68k PROOF & BACKTRACK',
  'V · GROUNDED SYNTHESIS',
];

export const ClimaxReasoningCanvas: React.FC<ClimaxReasoningCanvasProps> = ({
  level,
  longDecode,
  pulseCount,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotRef = useRef<{ yaw: number; pitch: number; dragging: boolean; lastX: number; lastY: number }>({
    yaw: 0.62,
    pitch: 0.36,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

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
      height = Math.max(rect.height, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const cfg = THINKING_LEVELS[level];
    const totalNodes = cfg.depthNodes;
    const strataCount = 5;

    // Distribute nodes across 5 horizontal architectural strata
    const nodes: StratumNode[] = [];
    for (let i = 0; i < totalNodes; i++) {
      const s = i % strataCount;
      const y = -0.82 + (s / (strataCount - 1)) * 1.64;
      const inLayerIdx = Math.floor(i / strataCount);
      const layerCap = Math.ceil(totalNodes / strataCount);
      const angle = (inLayerIdx / Math.max(1, layerCap)) * Math.PI * 2 + s * 0.55;
      const spread = s === 2 || s === 3 ? 0.86 : s === 1 ? 0.68 : 0.46;
      const rad = spread * (0.45 + ((i * 37) % 10) * 0.055);
      nodes.push({
        x: Math.cos(angle) * rad,
        y,
        z: Math.sin(angle) * rad,
        stratum: s,
      });
    }

    // Build inter-stratum & intra-stratum deduction edges
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ds = Math.abs(nodes[i].stratum - nodes[j].stratum);
        if (ds <= 1) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
          const threshold = level === 'HIGH' ? 0.72 : level === 'MEDIUM' ? 0.85 : 1.05;
          if (d < threshold && edges.length < 210) {
            edges.push([i, j]);
          }
        }
      }
    }

    const onDown = (e: PointerEvent) => {
      rotRef.current.dragging = true;
      rotRef.current.lastX = e.clientX;
      rotRef.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!rotRef.current.dragging) return;
      const dx = e.clientX - rotRef.current.lastX;
      const dy = e.clientY - rotRef.current.lastY;
      rotRef.current.yaw += dx * 0.008;
      rotRef.current.pitch = Math.max(0.12, Math.min(0.75, rotRef.current.pitch + dy * 0.007));
      rotRef.current.lastX = e.clientX;
      rotRef.current.lastY = e.clientY;
    };
    const onUp = () => {
      rotRef.current.dragging = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = reducedMotion ? 1.5 : (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.52;
      const cy = height * 0.51;
      const scale = Math.min(width, height) * 0.36;

      const autoSpeed = level === 'HIGH' ? 0.28 : level === 'MEDIUM' ? 0.16 : 0.08;
      const yaw = rotRef.current.yaw + (reducedMotion ? 0 : elapsed * autoSpeed);
      const pitch = rotRef.current.pitch;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;
        const persp = 2.8 / (2.8 - z2 * 0.65);
        return {
          px: cx + x1 * scale * persp,
          py: cy + y2 * scale * persp,
          z: z2,
          persp,
        };
      };

      // 1. Draw 5 Isometric Architectural Stratum Planes (Square Wireframe Plates)
      ctx.save();
      for (let s = 0; s < strataCount; s++) {
        const sy = -0.82 + (s / (strataCount - 1)) * 1.64;
        const plateHalf = s === 2 || s === 3 ? 0.92 : 0.72;
        const corners = [
          project(-plateHalf, sy, -plateHalf),
          project(plateHalf, sy, -plateHalf),
          project(plateHalf, sy, plateHalf),
          project(-plateHalf, sy, plateHalf),
        ];

        ctx.beginPath();
        corners.forEach((c, idx) => {
          if (idx === 0) ctx.moveTo(c.px, c.py);
          else ctx.lineTo(c.px, c.py);
        });
        ctx.closePath();
        ctx.fillStyle =
          level === 'HIGH'
            ? 'rgba(242, 207, 136, 0.045)'
            : 'rgba(247, 243, 235, 0.03)';
        ctx.fill();
        ctx.strokeStyle =
          s === 3 && level === 'HIGH'
            ? 'rgba(242, 207, 136, 0.55)'
            : 'rgba(247, 243, 235, 0.22)';
        ctx.lineWidth = s === 3 && level === 'HIGH' ? 1.4 : 0.9;
        ctx.stroke();

        // Stratum label on left-most projected corner
        ctx.font = '500 9.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(242, 207, 136, 0.78)';
        ctx.textAlign = 'left';
        ctx.fillText(STRATUM_LABELS[s], 12, cy + sy * scale * 0.88);
      }
      ctx.restore();

      // 2. Project All Reasoning Nodes
      const projectedNodes = nodes.map((n) => ({
        ...project(n.x, n.y, n.z),
        stratum: n.stratum,
      }));

      // 3. Draw Inter-Stratum Deduction Chords & Verification Pulses
      ctx.save();
      edges.forEach(([i, j], eIdx) => {
        const a = projectedNodes[i];
        const b = projectedNodes[j];
        const isCrossStratum = a.stratum !== b.stratum;

        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = isCrossStratum
          ? 'rgba(242, 207, 136, 0.42)'
          : 'rgba(247, 243, 235, 0.22)';
        ctx.lineWidth = isCrossStratum ? 1.15 : 0.8;
        ctx.stroke();

        if (eIdx % (level === 'HIGH' ? 2 : 4) === 0) {
          const t = (elapsed * (level === 'HIGH' ? 1.2 : 0.7) + eIdx * 0.17) % 1;
          const vx = a.px + (b.px - a.px) * t;
          const vy = a.py + (b.py - a.py) * t;
          ctx.beginPath();
          ctx.arc(vx, vy, level === 'HIGH' ? 2.2 : 1.7, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFDF9';
          ctx.fill();
        }
      });

      // 4. Draw Square / Diamond Architectural Nodes on Each Stratum
      projectedNodes.forEach((p) => {
        const side = Math.max(3.2, (p.stratum === 3 ? 5.2 : 3.8) * p.persp * 0.85);
        ctx.fillStyle = p.stratum === 3 ? '#F2CF88' : '#FFFDF9';
        ctx.fillRect(p.px - side * 0.5, p.py - side * 0.5, side, side);
      });
      ctx.restore();

      // 5. Top & Bottom Architectural Telemetry Stamps
      ctx.font = '500 10.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#F2CF88';
      ctx.textAlign = 'left';
      ctx.fillText(
        `5-STRATUM DEDUCTION TOWER · ${cfg.depthNodes} NODES · ${cfg.activeBranches} PARALLEL PROOFS`,
        12,
        20
      );
      ctx.fillStyle = 'rgba(247, 243, 235, 0.78)';
      ctx.textAlign = 'right';
      ctx.fillText(
        longDecode ? 'v1beta1 LONG DECODE · 1,048,576 MAX' : 'SYNC OUTPUT · 65,536 TOKENS',
        width - 12,
        height - 12
      );

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [level, longDecode, pulseCount, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="climax-reasoning-canvas"
      aria-label="Gemini 4 Argon 五層階梯式多步推演與驗證塔（可拖曳旋轉）"
    />
  );
};
