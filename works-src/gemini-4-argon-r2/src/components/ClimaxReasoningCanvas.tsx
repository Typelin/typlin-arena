import React, { useEffect, useRef } from 'react';

export type ThinkingLevelKey = 'LOW' | 'MEDIUM' | 'HIGH';

interface ClimaxReasoningCanvasProps {
  level: ThinkingLevelKey;
  longDecode: boolean;
  pulseTrigger: number;
  reducedMotion: boolean;
}

interface Node3D {
  x: number;
  y: number;
  z: number;
  shell: number;
  phase: number;
}

export const ClimaxReasoningCanvas: React.FC<ClimaxReasoningCanvasProps> = ({
  level,
  longDecode,
  pulseTrigger,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    rotY: 0.4,
    rotX: 0.28,
    velY: 0,
    velX: 0,
    shockwave: 0,
  });

  useEffect(() => {
    dragRef.current.shockwave = 1.0;
  }, [level, longDecode, pulseTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const nodes: Node3D[] = [];
    const totalMax = 72;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < totalMax; i++) {
      const shell = i < 14 ? 0 : i < 34 ? 1 : 2;
      const shellOffset = shell === 0 ? 0 : shell === 1 ? 14 : 34;
      const shellCount = shell === 0 ? 14 : shell === 1 ? 20 : 38;
      const idx = i - shellOffset;

      const theta = (2 * Math.PI * idx) / goldenRatio;
      const phi = Math.acos(1 - (2 * (idx + 0.5)) / shellCount);
      const radiusFactor = shell === 0 ? 0.38 : shell === 1 ? 0.70 : 1.0;

      nodes.push({
        x: Math.cos(theta) * Math.sin(phi) * radiusFactor,
        y: Math.sin(theta) * Math.sin(phi) * radiusFactor,
        z: Math.cos(phi) * radiusFactor,
        shell,
        phase: i * 0.618,
      });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 280);
      height = Math.max(rect.height, 300);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current.isDragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.shockwave = 0.9;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.velY = dx * 0.007;
      dragRef.current.velX = dy * 0.007;
      dragRef.current.rotY += dragRef.current.velY;
      dragRef.current.rotX = Math.max(-1.1, Math.min(1.1, dragRef.current.rotX + dragRef.current.velX));
    };

    const onPointerUp = () => {
      dragRef.current.isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    const start = performance.now();

    const render = (now: number) => {
      const t = reducedMotion ? 1.8 : (now - start) * 0.001;
      const d = dragRef.current;

      if (!d.isDragging && !reducedMotion) {
        const autoSpeed = level === 'HIGH' ? 0.01 : level === 'MEDIUM' ? 0.0055 : 0.0025;
        d.rotY += autoSpeed + d.velY;
        d.rotX += d.velX;
        d.velY *= 0.92;
        d.velX *= 0.92;
      }

      if (d.shockwave > 0.005) {
        d.shockwave *= reducedMotion ? 0 : 0.93;
      } else {
        d.shockwave = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const theme =
        level === 'LOW'
          ? {
              activeLimit: 14,
              bgTop: '#061224',
              bgBot: '#030812',
              coreRgb: '56, 189, 248',
              edgeRgb: '129, 140, 248',
              accentRgb: '45, 212, 191',
              nodeHex: '#E0F2FE',
              connectDist: 0.75,
            }
          : level === 'HIGH'
            ? {
                activeLimit: 72,
                bgTop: '#210915',
                bgBot: '#090309',
                coreRgb: '245, 158, 11',
                edgeRgb: '236, 72, 153',
                accentRgb: '56, 232, 255',
                nodeHex: '#FFFBEB',
                connectDist: 0.58,
              }
            : {
                activeLimit: 34,
                bgTop: '#120A2A',
                bgBot: '#060410',
                coreRgb: '139, 92, 246',
                edgeRgb: '56, 232, 255',
                accentRgb: '244, 114, 182',
                nodeHex: '#F3E8FF',
                connectDist: 0.65,
              };

      // 1. Dynamic Phase-Transition Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, theme.bgTop);
      bgGrad.addColorStop(1, theme.bgBot);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.48;
      const baseR = Math.min(width, height) * (level === 'HIGH' ? 0.39 : 0.35);

      // Volumetric Reactor Core Glow
      const reactorGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, baseR * 1.48);
      reactorGlow.addColorStop(0, '#FFFFFF');
      reactorGlow.addColorStop(0.14, `rgba(${theme.coreRgb}, ${level === 'HIGH' ? 0.68 : 0.42})`);
      reactorGlow.addColorStop(0.52, `rgba(${theme.edgeRgb}, 0.22)`);
      reactorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = reactorGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Tilted Astrolabe Gimbal Rings & Long Decode Halo
      ctx.save();
      ctx.translate(cx, cy);
      const ringCount = longDecode ? 3 : 2;
      for (let rIdx = 0; rIdx < ringCount; rIdx++) {
        ctx.save();
        ctx.rotate(t * (0.2 + rIdx * 0.14) * (rIdx % 2 === 0 ? 1 : -1) + rIdx * 0.8);
        ctx.scale(1, 0.36 + rIdx * 0.24);
        ctx.beginPath();
        ctx.arc(0, 0, baseR * (1.02 + rIdx * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle =
          rIdx === 0
            ? `rgba(${theme.coreRgb}, 0.55)`
            : rIdx === 1
              ? `rgba(${theme.edgeRgb}, 0.42)`
              : `rgba(${theme.accentRgb}, 0.38)`;
        ctx.lineWidth = rIdx === 0 ? 1.8 : 1.2;
        if (rIdx === 2) ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      if (d.shockwave > 0.01) {
        const swRadius = baseR * (0.22 + (1 - d.shockwave) * 1.18);
        ctx.beginPath();
        ctx.arc(0, 0, swRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${d.shockwave * 0.85})`;
        ctx.lineWidth = 2.8 * d.shockwave;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Project 3D Geodesic Reasoning Nodes
      const cosY = Math.cos(d.rotY);
      const sinY = Math.sin(d.rotY);
      const cosX = Math.cos(d.rotX);
      const sinX = Math.sin(d.rotX);

      const projected: Array<{
        px: number;
        py: number;
        pz: number;
        x3: number;
        y3: number;
        z3: number;
        shell: number;
        idx: number;
      }> = [];

      for (let i = 0; i < theme.activeLimit; i++) {
        const n = nodes[i];
        const pulse =
          1 +
          Math.sin(t * (level === 'HIGH' ? 3.8 : 2.0) + n.phase) *
            (level === 'HIGH' ? 0.065 : 0.03) +
          d.shockwave * 0.14;

        const nx = n.x * pulse;
        const ny = n.y * pulse;
        const nz = n.z * pulse;

        const rx = nx * cosY - nz * sinY;
        const rz1 = nx * sinY + nz * cosY;
        const ry = ny * cosX - rz1 * sinX;
        const rz = ny * sinX + rz1 * cosX;

        const fov = 2.5 / (2.5 - rz * 0.85);
        projected.push({
          px: cx + rx * baseR * fov,
          py: cy + ry * baseR * fov,
          pz: rz,
          x3: rx,
          y3: ry,
          z3: rz,
          shell: n.shell,
          idx: i,
        });
      }

      projected.sort((a, b) => a.pz - b.pz);

      // 4. Draw Synaptic Reasoning Verification Edges & Traveling Photons
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      let edgeCounter = 0;
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const dist3d = Math.hypot(a.x3 - b.x3, a.y3 - b.y3, a.z3 - b.z3);
          if (dist3d < theme.connectDist) {
            edgeCounter++;
            const alpha = (1 - dist3d / theme.connectDist) * (level === 'HIGH' ? 0.62 : 0.42);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle =
              (a.idx + b.idx) % 3 === 0
                ? `rgba(${theme.edgeRgb}, ${alpha})`
                : `rgba(${theme.coreRgb}, ${alpha})`;
            ctx.lineWidth = level === 'HIGH' && dist3d < 0.36 ? 1.85 : 1.1;
            ctx.stroke();

            // Traveling verification photon packets along active reasoning edges
            if (!reducedMotion && edgeCounter % 5 === 0) {
              const travel = (t * (level === 'HIGH' ? 1.6 : 0.9) + edgeCounter * 0.23) % 1;
              const tx = a.px + (b.px - a.px) * travel;
              const ty = a.py + (b.py - a.py) * travel;
              ctx.beginPath();
              ctx.arc(tx, ty, 2.1, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
            }
          }
        }
      }

      // 5. Draw Projected Reasoning Nodes
      for (const p of projected) {
        const depthAlpha = 0.4 + ((p.pz + 1) / 2) * 0.6;
        const r = (p.shell === 2 ? 3.4 : p.shell === 1 ? 4.4 : 5.6) * (0.8 + (p.pz + 1) * 0.25);

        const glow = ctx.createRadialGradient(p.px, p.py, 0.5, p.px, p.py, r * 3.4);
        glow.addColorStop(0, theme.nodeHex);
        glow.addColorStop(0.42, `rgba(${theme.coreRgb}, ${depthAlpha * 0.9})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
      ctx.restore();

      // 6. Responsive Bottom Telemetry Bar inside Canvas (Never clips on 390px mobile!)
      const isNarrow = width < 420;
      ctx.fillStyle = 'rgba(6, 5, 14, 0.82)';
      ctx.fillRect(0, height - 38, width, 38);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = `${isNarrow ? '600 9.5px' : '600 10.5px'} "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(
        `THINKING: ${level} (${theme.activeLimit} NODES)`,
        14,
        height - 22
      );

      ctx.fillStyle = `rgb(${theme.coreRgb})`;
      ctx.fillText(
        longDecode
          ? isNarrow
            ? 'DECODE: 1,048,576 LONG_DECODE (v1beta1)'
            : 'DECODE: 1,048,576 LONG_DECODE (continuation_token)'
          : 'DECODE: 65,536 SYNCHRONOUS DEFAULT',
        14,
        height - 8
      );

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [level, longDecode, pulseTrigger, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="climax-reasoning-canvas"
      aria-label="三段思考強度 LOW MEDIUM HIGH 3D 推演晶格互動畫布（可拖曳旋轉）"
    />
  );
};
