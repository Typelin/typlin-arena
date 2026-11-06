import React, { useEffect, useRef } from 'react';

interface ScaleContrastCanvasProps {
  inputTokens: number;
  thinkingTokens: number;
  outputTokens: number;
  zoomMacro: boolean;
  reducedMotion: boolean;
}

const COLS = 32;
const ROWS = 32;
const TOTAL_BLOCKS = COLS * ROWS; // 1,024 blocks * 1,024 tokens = 1,048,576 tokens

export const ScaleContrastCanvas: React.FC<ScaleContrastCanvasProps> = ({
  inputTokens,
  thinkingTokens,
  outputTokens,
  zoomMacro,
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
      height = Math.max(rect.height, 320);
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
      const microX = isCompact ? width * 0.14 : width * 0.12;
      const microY = height * 0.5;

      const waferSize = Math.min(width * (isCompact ? 0.64 : 0.62), height * 0.78);
      const waferLeft = isCompact ? width * 0.31 : width * 0.32;
      const waferTop = (height - waferSize) * 0.5;

      const inputBlocks = Math.round((inputTokens / 1048576) * TOTAL_BLOCKS);
      const thinkingBlocks = Math.round((thinkingTokens / 1048576) * TOTAL_BLOCKS);
      const outputBlocks = Math.max(
        1,
        Math.min(
          TOTAL_BLOCKS - inputBlocks - thinkingBlocks,
          Math.round((outputTokens / 1048576) * TOTAL_BLOCKS)
        )
      );

      // 1. Projection Frustum Lines from 1px Specimen to 32x32 Wafer Matrix Corners
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 240, 232, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(microX, microY);
      ctx.lineTo(waferLeft, waferTop);
      ctx.moveTo(microX, microY);
      ctx.lineTo(waferLeft, waferTop + waferSize);
      ctx.moveTo(microX, microY);
      ctx.lineTo(waferLeft, microY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Left Origin: The Literal 1-Pixel Specimen in a Square Brass Vernier Frame
      ctx.save();
      const boxHalf = isCompact ? 20 : 28;
      ctx.strokeStyle = 'rgba(226, 190, 126, 0.62)';
      ctx.lineWidth = 1;
      ctx.strokeRect(microX - boxHalf, microY - boxHalf, boxHalf * 2, boxHalf * 2);

      // Corner ticks
      ctx.beginPath();
      ctx.moveTo(microX - boxHalf * 1.45, microY);
      ctx.lineTo(microX - 5, microY);
      ctx.moveTo(microX + 5, microY);
      ctx.lineTo(microX + boxHalf * 1.45, microY);
      ctx.moveTo(microX, microY - boxHalf * 1.45);
      ctx.lineTo(microX, microY - 5);
      ctx.moveTo(microX, microY + 5);
      ctx.lineTo(microX, microY + boxHalf * 1.45);
      ctx.strokeStyle = 'rgba(217, 83, 42, 0.68)';
      ctx.stroke();

      // THE LITERAL 1x1 PIXEL SPECIMEN
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(Math.round(microX), Math.round(microY), 1.5, 1.5);

      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#E2BE7E';
      ctx.textAlign = 'center';
      ctx.fillText('1 TOKEN', microX, microY - boxHalf - 12);
      ctx.fillStyle = 'rgba(243, 240, 232, 0.55)';
      ctx.fillText('(1×1 PX)', microX, microY + boxHalf + 16);
      ctx.restore();

      // 3. Right Stage: 32 × 32 (1,024-Block) Architectural Wafer Matrix
      ctx.save();
      // Outer architectural caliper frame
      ctx.strokeStyle = 'rgba(243, 240, 232, 0.32)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(waferLeft - 8, waferTop - 8, waferSize + 16, waferSize + 16);

      const cellStep = waferSize / COLS;
      const cellPad = zoomMacro ? 1.1 : 1.8;
      const cellSide = Math.max(1.8, cellStep - cellPad);

      const scanIdx = Math.floor((elapsed * 48) % TOTAL_BLOCKS);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c;
          const x = waferLeft + c * cellStep;
          const y = waferTop + r * cellStep;

          let fill = 'rgba(243, 240, 232, 0.1)';
          if (idx < inputBlocks) {
            fill = '#F3F0E8';
          } else if (idx < inputBlocks + thinkingBlocks) {
            fill = '#D9532A';
          } else if (idx < inputBlocks + thinkingBlocks + outputBlocks) {
            fill = '#E2BE7E';
          }

          ctx.fillStyle = fill;
          ctx.fillRect(x, y, cellSide, cellSide);

          if (!reducedMotion && Math.abs(idx - scanIdx) <= 2) {
            ctx.strokeStyle = '#FFFDF9';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 0.5, y - 0.5, cellSide + 1, cellSide + 1);
          }
        }
      }

      // Top & Bottom Wafer Axis Callouts
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#E2BE7E';
      ctx.textAlign = 'left';
      ctx.fillText(
        '32 × 32 WAFER MATRIX · 1,024 BLOCKS × 1,024 TOKENS = 1,048,576 POOL',
        waferLeft - 8,
        waferTop - 16
      );

      ctx.fillStyle = 'rgba(243, 240, 232, 0.62)';
      ctx.fillText(
        `INPUT: ${inputBlocks} BLKS · THINKING: ${thinkingBlocks} BLKS · LONG DECODE: ${outputBlocks} BLKS`,
        waferLeft - 8,
        waferTop + waferSize + 22
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
  }, [inputTokens, thinkingTokens, outputTokens, zoomMacro, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="scale-contrast-canvas"
      aria-label="1 Token 與 1,048,576 Token 晶圓矩陣極端尺度對比圖"
    />
  );
};
