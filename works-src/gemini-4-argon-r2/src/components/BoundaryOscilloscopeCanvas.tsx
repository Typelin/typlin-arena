import React, { useEffect, useRef } from 'react';

interface BoundaryOscilloscopeCanvasProps {
  focusedId: string;
  reducedMotion: boolean;
}

export const BoundaryOscilloscopeCanvas: React.FC<BoundaryOscilloscopeCanvasProps> = ({
  focusedId,
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
      height = Math.max(rect.height, 300);
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

      // Subtle architectural grid hairlines
      ctx.save();
      ctx.strokeStyle = 'rgba(240, 232, 220, 0.07)';
      ctx.lineWidth = 1;
      const step = 44;
      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      const padX = Math.max(20, width * 0.06);
      const midX = width * 0.52;

      if (focusedId === 'limit-01') {
        // 5-to-1 Mechanical Shutter Gate: 5 inputs -> Only TEXT_STREAM passes; Image/Audio/Live blocked
        const inLabels = ['TEXT 50k LOC', '3,000 IMAGES', '60m VIDEO', '8.4h AUDIO', '3,000p PDF'];
        const outLabels = [
          { name: 'TEXT STREAM OUTPUT', allowed: true },
          { name: 'NATIVE IMAGE GEN', allowed: false },
          { name: 'NATIVE AUDIO GEN', allowed: false },
          { name: 'GEMINI LIVE API', allowed: false },
        ];

        // Vertical shutter wall
        ctx.save();
        ctx.strokeStyle = '#E05A36';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(midX, 28);
        ctx.lineTo(midX, height - 28);
        ctx.stroke();

        ctx.font = '500 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#E05A36';
        ctx.textAlign = 'center';
        ctx.fillText('OUTPUT APERTURE GATE · TEXT-ONLY', midX, 18);

        inLabels.forEach((lbl, i) => {
          const y = height * (0.18 + i * 0.16);
          ctx.beginPath();
          ctx.moveTo(padX, y);
          ctx.lineTo(midX - 8, height * 0.25);
          ctx.strokeStyle = 'rgba(240, 232, 220, 0.52)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.fillStyle = '#F0E8DC';
          ctx.textAlign = 'left';
          ctx.fillText(lbl, padX, y - 6);
        });

        outLabels.forEach((out, i) => {
          const y = height * (0.25 + i * 0.18);
          ctx.beginPath();
          ctx.moveTo(midX + 8, y);
          ctx.lineTo(width - padX, y);
          ctx.strokeStyle = out.allowed ? '#E6A844' : 'rgba(224, 90, 54, 0.35)';
          ctx.lineWidth = out.allowed ? 2.4 : 1.2;
          if (!out.allowed) ctx.setLineDash([4, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = out.allowed ? '#FFF6E8' : '#E05A36';
          ctx.textAlign = 'right';
          ctx.fillText(
            out.allowed ? `${out.name} [OPEN]` : `${out.name} [BLOCKED]`,
            width - padX,
            y - 8
          );
        });
        ctx.restore();
      } else if (focusedId === 'limit-02') {
        // HTTP 400 Rejection & Ignored Sampling Parameters
        const tracks = [
          {
            label: 'thinking_level: "LOW" | "MEDIUM" | "HIGH"',
            status: '200 OK · ACTIVE',
            mode: 'pass',
          },
          {
            label: 'thinking_level: "MINIMAL" / thinking_budget',
            status: 'HTTP 400 VALIDATION ERROR',
            mode: 'reject',
          },
          {
            label: 'temperature / top_p / top_k',
            status: 'SILENTLY IGNORED BY KERNEL',
            mode: 'ignore',
          },
          {
            label: 'Explicit Caching & Model Fine-Tuning',
            status: 'UNSUPPORTED (IMPLICIT 4,096+ ONLY)',
            mode: 'reject',
          },
        ];

        tracks.forEach((tr, i) => {
          const y = height * (0.2 + i * 0.2);
          ctx.save();
          ctx.font = '500 10.5px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#F0E8DC';
          ctx.textAlign = 'left';
          ctx.fillText(tr.label, padX, y - 10);

          ctx.beginPath();
          if (tr.mode === 'pass') {
            for (let x = padX; x <= width - padX; x += 4) {
              const wy = y + Math.sin((x - padX) * 0.045 - elapsed * 3) * 6;
              if (x === padX) ctx.moveTo(x, wy);
              else ctx.lineTo(x, wy);
            }
            ctx.strokeStyle = '#E6A844';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (tr.mode === 'reject') {
            const stopX = midX + 18;
            ctx.moveTo(padX, y);
            ctx.lineTo(stopX, y);
            ctx.strokeStyle = '#E05A36';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hard vertical stop bar
            ctx.beginPath();
            ctx.moveTo(stopX, y - 9);
            ctx.lineTo(stopX, y + 9);
            ctx.strokeStyle = '#E05A36';
            ctx.lineWidth = 3;
            ctx.stroke();
          } else {
            ctx.moveTo(padX, y);
            ctx.lineTo(width - padX, y);
            ctx.setLineDash([3, 6]);
            ctx.strokeStyle = 'rgba(240, 232, 220, 0.38)';
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.fillStyle =
            tr.mode === 'pass' ? '#E6A844' : tr.mode === 'reject' ? '#E05A36' : 'rgba(240,232,220,0.6)';
          ctx.textAlign = 'right';
          ctx.fillText(tr.status, width - padX, y - 10);
          ctx.restore();
        });
      } else if (focusedId === 'limit-03') {
        // March 2026 Cutoff Wall & AA 116k Token Verbosity Comparison
        ctx.save();
        const wallX = width * 0.68;
        const axisY = height * 0.28;

        ctx.beginPath();
        ctx.moveTo(padX, axisY);
        ctx.lineTo(wallX, axisY);
        ctx.strokeStyle = '#F0E8DC';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(wallX, axisY);
        ctx.lineTo(width - padX, axisY);
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = 'rgba(224, 90, 54, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(wallX, axisY - 22);
        ctx.lineTo(wallX, axisY + 22);
        ctx.strokeStyle = '#E05A36';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '600 10.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#E05A36';
        ctx.textAlign = 'center';
        ctx.fillText('KNOWLEDGE CUTOFF · 2026.03', wallX, axisY - 28);

        // Verbosity & Cost per Task Comparison (AA Telemetry)
        const bars = [
          {
            model: 'Gemini 4 Argon (High)',
            tokens: '116k tok/task (68k reasoning) · $7.68/task',
            pct: 1.0,
            color: '#E05A36',
          },
          {
            model: 'Claude Opus 5.5 (High)',
            tokens: '60k tok/task (32k reasoning) · $3.46/task',
            pct: 60 / 116,
            color: '#E6A844',
          },
          {
            model: 'GPT-6 Astra (Xhigh)',
            tokens: '27k tok/task (15k reasoning) · $3.66/task',
            pct: 27 / 116,
            color: 'rgba(240, 232, 220, 0.55)',
          },
        ];

        const trackW = width - padX * 2;
        bars.forEach((b, idx) => {
          const y = height * (0.52 + idx * 0.16);
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#F0E8DC';
          ctx.textAlign = 'left';
          ctx.fillText(b.model, padX, y - 7);
          ctx.textAlign = 'right';
          ctx.fillStyle = 'rgba(240, 232, 220, 0.72)';
          ctx.fillText(b.tokens, width - padX, y - 7);

          ctx.fillStyle = 'rgba(240, 232, 220, 0.1)';
          ctx.fillRect(padX, y, trackW, 6);
          ctx.fillStyle = b.color;
          ctx.fillRect(padX, y, trackW * b.pct, 6);
        });
        ctx.restore();
      } else {
        // limit-04: Honest Rival Lead Comparison (5 Official Evaluations Where Argon Trails)
        const trails = [
          { name: 'Terminal-bench 4.0', argon: 57.4, rival: 66.4, rivalName: 'Opus 5.5 (66.4%)' },
          { name: 'FrontierSWE v2', argon: 55.0, rival: 65.5, rivalName: 'GPT-6 Astra (65.5%)' },
          { name: 'Terminal-Bench Science', argon: 57.6, rival: 68.1, rivalName: 'GPT-6 Astra (68.1%)' },
          { name: 'OSWorld-2.0 (Offline)', argon: 69.2, rival: 72.6, rivalName: 'GPT-6 Astra (72.6%)' },
          { name: 'PostTrainBench', argon: 45.3, rival: 49.3, rivalName: 'Opus 5.5 (49.3%)' },
        ];

        const trackW = width - padX * 2;
        trails.forEach((t, idx) => {
          const y = height * (0.16 + idx * 0.17);
          ctx.save();
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.fillStyle = '#F0E8DC';
          ctx.textAlign = 'left';
          ctx.fillText(`${t.name} · Argon ${t.argon}%`, padX, y - 7);

          ctx.fillStyle = '#E05A36';
          ctx.textAlign = 'right';
          ctx.fillText(`Leader: ${t.rivalName}`, width - padX, y - 7);

          ctx.fillStyle = 'rgba(240, 232, 220, 0.1)';
          ctx.fillRect(padX, y, trackW, 5);

          ctx.fillStyle = 'rgba(240, 232, 220, 0.65)';
          ctx.fillRect(padX, y, trackW * (t.argon / 100), 5);

          // Leader marker tick
          const rx = padX + trackW * (t.rival / 100);
          ctx.strokeStyle = '#E05A36';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rx, y - 4);
          ctx.lineTo(rx, y + 9);
          ctx.stroke();
          ctx.restore();
        });
      }

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [focusedId, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="boundary-oscilloscope-canvas"
      aria-label="Gemini 4 Argon 能力邊界與競品落差誠實檢視圖"
    />
  );
};
