import React, { useEffect, useRef } from 'react';

interface BoundaryOscilloscopeCanvasProps {
  selectedBoundary: string;
  reducedMotion: boolean;
}

export const BoundaryOscilloscopeCanvas: React.FC<BoundaryOscilloscopeCanvasProps> = ({
  selectedBoundary,
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
      height = Math.max(rect.height, 260);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();

    const render = (now: number) => {
      const t = reducedMotion ? 1.2 : (now - start) * 0.001;
      ctx.clearRect(0, 0, width, height);

      // Dark Anodized Oscilloscope CRT Screen
      ctx.fillStyle = '#080A0F';
      ctx.fillRect(0, 0, width, height);

      // Oscilloscope graticule grid
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.08)';
      ctx.lineWidth = 1;
      const step = 32;
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

      const gateX = width * 0.52;

      if (selectedBoundary === 'limit-01') {
        // MODE 1: 5 Inputs -> Optical Filter Gate -> Text-Only Output (Image/Audio/Live Blocked)
        const inputs = [
          { label: 'IN: TEXT / CODE', color: '#38E8FF', pass: true },
          { label: 'IN: 3,000 IMAGES', color: '#8B5CF6', pass: false, outLabel: 'IMAGE_GEN: FALSE' },
          { label: 'IN: 60M VIDEO', color: '#2DD4BF', pass: false, outLabel: 'VIDEO_GEN: FALSE' },
          { label: 'IN: 8.4H AUDIO', color: '#F59E0B', pass: false, outLabel: 'AUDIO_GEN / LIVE_API: FALSE' },
        ];

        // Vertical Crimson Filter Barrier
        ctx.beginPath();
        ctx.moveTo(gateX, 24);
        ctx.lineTo(gateX, height - 24);
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FDA4AF';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OUTPUT GATE // TEXT-ONLY', gateX, 16);

        inputs.forEach((inp, idx) => {
          const y = height * (0.24 + idx * 0.19);

          // Left input wave
          ctx.beginPath();
          for (let x = 24; x <= gateX - 6; x += 4) {
            const u = (x - 24) / (gateX - 30);
            const wy = y + Math.sin(u * 16 - t * 5 + idx) * 6;
            if (x === 24) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
          }
          ctx.strokeStyle = inp.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(inp.label, 24, y - 10);

          if (inp.pass) {
            // Text output passes cleanly through the gate
            ctx.beginPath();
            for (let x = gateX + 6; x <= width - 24; x += 4) {
              const u = (x - gateX) / (width - gateX - 24);
              const wy = y + Math.sin(u * 18 - t * 6) * 5;
              if (x === gateX + 6) ctx.moveTo(x, wy);
              else ctx.lineTo(x, wy);
            }
            ctx.strokeStyle = '#38E8FF';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.fillStyle = '#38E8FF';
            ctx.fillText('OUT: 1M TEXT STREAM ALLOWED ✓', gateX + 16, y - 10);
          } else {
            // Blocked flatline with red X stamp
            ctx.beginPath();
            ctx.moveTo(gateX + 12, y);
            ctx.lineTo(width - 28, y);
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.28)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#F43F5E';
            ctx.fillText(`✕ ${inp.outLabel}`, gateX + 16, y - 6);
          }
        });
      } else if (selectedBoundary === 'limit-02') {
        // MODE 2: HTTP 400 Validation Error on MINIMAL & Ignored Sampling Params
        const cy = height * 0.5;
        ctx.beginPath();
        ctx.moveTo(gateX, 24);
        ctx.lineTo(gateX, height - 24);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FDE68A';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KERNEL VALIDATOR // STRICT SCHEMA', gateX, 16);

        const rules = [
          {
            inText: 'thinking_level: "MINIMAL"',
            outText: 'HTTP 400 VALIDATION_ERROR (REJECTED)',
            color: '#F43F5E',
            y: height * 0.27,
          },
          {
            inText: 'temperature: 0.2 | top_p: 0.8',
            outText: 'IGNORED BY KERNEL (FIXED INTERNAL SAMPLING)',
            color: '#F59E0B',
            y: cy,
          },
          {
            inText: 'Explicit Context Cache / Fine-Tuning',
            outText: 'UNSUPPORTED (IMPLICIT CACHE >= 4,096 ONLY)',
            color: '#FB7185',
            y: height * 0.74,
          },
        ];

        rules.forEach((r, idx) => {
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '600 10.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(r.inText, 22, r.y - 8);

          ctx.beginPath();
          ctx.moveTo(22, r.y + 4);
          ctx.lineTo(gateX - 10, r.y + 4);
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Deflection spark at gate
          ctx.beginPath();
          ctx.arc(gateX, r.y + 4, 5 + Math.sin(t * 6 + idx) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = r.color;
          ctx.fill();

          ctx.fillStyle = r.color;
          ctx.font = '700 10.5px "JetBrains Mono", monospace';
          ctx.fillText(r.outText, gateX + 16, r.y + 7);
        });
      } else if (selectedBoundary === 'limit-03') {
        // MODE 3: March 2026 Cutoff Wall & 116k Verbosity Cost Curve
        const cutoffX = width * 0.62;
        const axisY = height * 0.56;

        // Timeline knowledge wave up to March 2026
        ctx.beginPath();
        for (let x = 28; x <= cutoffX; x += 4) {
          const u = (x - 28) / (cutoffX - 28);
          const wy = axisY - Math.sin(u * 22 - t * 4) * (16 + u * 24);
          if (x === 28) ctx.moveTo(x, wy);
          else ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = '#38E8FF';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Cutoff Wall
        ctx.beginPath();
        ctx.moveTo(cutoffX, 24);
        ctx.lineTo(cutoffX, height - 24);
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#F43F5E';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KNOWLEDGE CUTOFF: MARCH 2026', cutoffX, 18);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('POST-2026.03 REQUIRES', cutoffX + 14, axisY - 12);
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('GOOGLE SEARCH GROUNDING', cutoffX + 14, axisY + 4);
        ctx.fillStyle = '#FDA4AF';
        ctx.fillText('AA VERBOSITY: 116K TOKENS/TASK', 28, height - 18);
        ctx.fillText('TTFT LATENCY: 40.5s – 47.7s', cutoffX - 90, height - 18);
      } else {
        // MODE 4: Benchmark Gaps (Where Opus 5.5 & GPT-6 Astra beat Argon)
        const gaps = [
          {
            label: 'Terminal-bench 4.0 (Shell)',
            argon: 57.4,
            rival: 66.4,
            rivalName: 'Claude Opus 5.5 (66.4%)',
          },
          {
            label: 'FrontierSWE v2 (Coding)',
            argon: 55.0,
            rival: 65.5,
            rivalName: 'GPT-6 Astra (65.5%)',
          },
          {
            label: 'Terminal-Bench Science 0.1',
            argon: 57.6,
            rival: 68.1,
            rivalName: 'GPT-6 Astra (68.1%)',
          },
          {
            label: 'OSWorld-2.0 (Offline Desktop)',
            argon: 69.2,
            rival: 72.6,
            rivalName: 'GPT-6 Astra (72.6%)',
          },
        ];

        const barLeft = 28;
        const barMaxW = width - 56;

        gaps.forEach((g, idx) => {
          const y = 32 + idx * ((height - 44) / 4);

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${g.label} — Argon: ${g.argon}% vs ${g.rivalName}`, barLeft, y);

          // Rival bar (background reference)
          ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
          ctx.fillRect(barLeft, y + 6, (g.rival / 100) * barMaxW, 8);

          // Argon bar
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(barLeft, y + 6, (g.argon / 100) * barMaxW, 8);
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
  }, [selectedBoundary, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="boundary-oscilloscope-canvas"
      aria-label="能力邊界與硬性拒絕示波器畫布"
    />
  );
};
