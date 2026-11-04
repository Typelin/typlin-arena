import React, { useEffect, useRef } from 'react';

interface ScaleContrastCanvasProps {
  inputTokens: number;
  thinkingTokens: number;
  outputTokens: number;
  macroView: boolean;
  reducedMotion: boolean;
}

const TOTAL_TOKENS = 1_048_576;
const CLUSTER_NODES = 1024; // 1,024 clusters * 1,024 tokens = 1,048,576 tokens

export const ScaleContrastCanvas: React.FC<ScaleContrastCanvasProps> = ({
  inputTokens,
  thinkingTokens,
  outputTokens,
  macroView,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animStateRef = useRef({
    zoomLerp: macroView ? 1 : 0,
    inputRatio: inputTokens / TOTAL_TOKENS,
    thinkRatio: thinkingTokens / TOTAL_TOKENS,
    outRatio: outputTokens / TOTAL_TOKENS,
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
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 340);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();

    const draw = (now: number) => {
      const t = reducedMotion ? 1.0 : (now - start) * 0.001;
      const state = animStateRef.current;

      const targetZoom = macroView ? 1 : 0;
      state.zoomLerp += (targetZoom - state.zoomLerp) * (reducedMotion ? 1 : 0.08);
      state.inputRatio += (inputTokens / TOTAL_TOKENS - state.inputRatio) * 0.12;
      state.thinkRatio += (thinkingTokens / TOTAL_TOKENS - state.thinkRatio) * 0.12;
      state.outRatio += (outputTokens / TOTAL_TOKENS - state.outRatio) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Deep Ultramarine Optical Comparator Backdrop
      const bgGrad = ctx.createRadialGradient(
        width * 0.66,
        height * 0.5,
        16,
        width * 0.55,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#0F1B3D');
      bgGrad.addColorStop(0.52, '#070D20');
      bgGrad.addColorStop(1, '#040711');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Precision comparator grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < width; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 40; gy < height; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      const isCompact = width < 560;
      const loupeX = isCompact ? width * 0.22 : width * 0.18;
      const loupeY = isCompact ? height * 0.24 : height * 0.5;
      const loupeR = isCompact ? 42 : 58;

      const galaxyCx = isCompact ? width * 0.56 : width * 0.66;
      const galaxyCy = isCompact ? height * 0.62 : height * 0.5;
      const maxGalaxyR = isCompact
        ? Math.min(width, height) * 0.34
        : Math.min(width * 0.31, height * 0.42);

      // 1. Optical Projection Cone Connecting Micro (1px) to Macro (1,048,576)
      ctx.save();
      const coneGrad = ctx.createLinearGradient(loupeX, loupeY, galaxyCx, galaxyCy);
      coneGrad.addColorStop(0, 'rgba(56, 232, 255, 0.22)');
      coneGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
      coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(loupeX, loupeY - 2);
      ctx.lineTo(galaxyCx, galaxyCy - maxGalaxyR * 1.04);
      ctx.lineTo(galaxyCx, galaxyCy + maxGalaxyR * 1.04);
      ctx.lineTo(loupeX, loupeY + 2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(loupeX + loupeR * 0.85, loupeY - loupeR * 0.4);
      ctx.lineTo(galaxyCx - maxGalaxyR * 0.3, galaxyCy - maxGalaxyR * 0.98);
      ctx.moveTo(loupeX + loupeR * 0.85, loupeY + loupeR * 0.4);
      ctx.lineTo(galaxyCx - maxGalaxyR * 0.3, galaxyCy + maxGalaxyR * 0.98);
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.38)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Colossal 1,048,576-Token Golden Spiral Horizon (Giant Scale)
      ctx.save();
      ctx.translate(galaxyCx, galaxyCy);

      const scaleFactor = 0.84 + state.zoomLerp * 0.2;
      ctx.scale(scaleFactor, scaleFactor);

      // Outer partitioned arc gauge (Input Cyan / Thinking Violet / Output Amber)
      const gaugeR = maxGalaxyR * 1.08;
      const startAngle = -Math.PI * 0.5;
      const inEnd = startAngle + state.inputRatio * Math.PI * 2;
      const thEnd = inEnd + state.thinkRatio * Math.PI * 2;
      const outEnd = startAngle + Math.PI * 2;

      ctx.lineWidth = 5;
      ctx.lineCap = 'butt';

      ctx.beginPath();
      ctx.arc(0, 0, gaugeR, startAngle, inEnd);
      ctx.strokeStyle = '#38BDF8';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, gaugeR, inEnd, thEnd);
      ctx.strokeStyle = '#A855F7';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, gaugeR, thEnd, outEnd);
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      // Graduated perimeter ticks around the giant galaxy
      for (let k = 0; k < 96; k++) {
        const a = (k / 96) * Math.PI * 2;
        const r1 = gaugeR + 5;
        const r2 = gaugeR + (k % 8 === 0 ? 13 : 8);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = k % 8 === 0 ? 'rgba(226, 232, 240, 0.55)' : 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = k % 8 === 0 ? 1.4 : 0.8;
        ctx.stroke();
      }

      const inputNodeCut = Math.round(state.inputRatio * CLUSTER_NODES);
      const thinkNodeCut = inputNodeCut + Math.round(state.thinkRatio * CLUSTER_NODES);

      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const rot = t * 0.055;

      for (let i = 0; i < CLUSTER_NODES; i++) {
        const norm = i / CLUSTER_NODES;
        const r = maxGalaxyR * (0.24 + Math.sqrt(norm) * 0.74);
        const theta = i * goldenAngle + rot + (1 - norm) * 0.45;

        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;

        let color = '#F59E0B';
        if (i < inputNodeCut) {
          color = '#38BDF8';
        } else if (i < thinkNodeCut) {
          color = '#A855F7';
        }

        const pulse = 0.78 + 0.22 * Math.sin(t * 2.4 + i * 0.13);
        const dotR = i % 12 === 0 ? 2.8 : 1.65;

        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = (0.48 + norm * 0.5) * pulse;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Central Dark Core Readout inside the 1,048,576 Ring
      ctx.beginPath();
      ctx.arc(0, 0, maxGalaxyR * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 9, 22, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.5)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${isCompact ? 14 : 18}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('1,048,576', 0, -3);
      ctx.fillStyle = '#38E8FF';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillText('TOKENS (1024²)', 0, 12);

      ctx.restore();

      // 3. Micro 1-Pixel Single Token Loupe (Left side of stage, 100% unobstructed)
      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(4, 8, 19, 0.94)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38E8FF';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Reticle crosshairs
      ctx.beginPath();
      ctx.moveTo(loupeX - loupeR * 0.72, loupeY);
      ctx.lineTo(loupeX - 7, loupeY);
      ctx.moveTo(loupeX + 7, loupeY);
      ctx.lineTo(loupeX + loupeR * 0.72, loupeY);
      ctx.moveTo(loupeX, loupeY - loupeR * 0.72);
      ctx.lineTo(loupeX, loupeY - 7);
      ctx.moveTo(loupeX, loupeY + 7);
      ctx.lineTo(loupeX, loupeY + loupeR * 0.72);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // The literal 1-PIXEL SINGLE TOKEN
      const singleGlow = ctx.createRadialGradient(loupeX, loupeY, 0.5, loupeX, loupeY, 16);
      singleGlow.addColorStop(0, '#FFFFFF');
      singleGlow.addColorStop(0.35, 'rgba(56, 232, 255, 0.88)');
      singleGlow.addColorStop(1, 'rgba(56, 232, 255, 0)');
      ctx.fillStyle = singleGlow;
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(loupeX - 1, loupeY - 1, 2.5, 2.5);

      // Crisp Micro Labels
      ctx.fillStyle = '#38E8FF';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MICRO // 1 TOKEN (1px)', loupeX, loupeY - loupeR - 12);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText('≈ 4 CHARS OF CODE', loupeX, loupeY + loupeR + 18);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillText('RATIO 1 : 1,048,576', loupeX, loupeY + loupeR + 34);
      ctx.restore();

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [inputTokens, thinkingTokens, outputTokens, macroView, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="scale-contrast-canvas"
      aria-label="1 Token 微觀原點與 1,048,576 Tokens 巨觀星環的極端尺度對比儀"
    />
  );
};
