import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/audio';

type ScaleTier = 'input' | 'output' | 'single';

export const ScaleVisualizer: React.FC = () => {
  const [scaleTier, setScaleTier] = useState<ScaleTier>('input');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number }>({ x: 380, y: 160 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const handleCanvasMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    canvas.addEventListener('mousemove', handleCanvasMouse);

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (scaleTier === 'input') {
        // 1M Tokens: Infinite Attention Matrix with Spotlight Inspection
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, w, h);

        const cols = 48;
        const rows = 28;
        const cellW = w / cols;
        const cellH = h / rows;

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const cx = i * cellW + cellW / 2;
            const cy = j * cellH + cellH / 2;
            const dx = cx - mousePos.current.x;
            const dy = cy - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Spotlight attention radius
            const isHovered = dist < 110;
            const spotlightBoost = isHovered ? Math.max(0, 1 - dist / 110) : 0;

            const noise = Math.sin(i * 0.15 + frame * 0.02) * Math.cos(j * 0.15 + frame * 0.015);
            const baseAlpha = 0.12 + (noise + 1) * 0.2;

            if (spotlightBoost > 0) {
              ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(1, baseAlpha + spotlightBoost * 0.85)})`;
              ctx.fillRect(i * cellW + 1, j * cellH + 1, cellW - 2, cellH - 2);
            } else if ((i * 37 + j * 19 + Math.floor(frame * 0.08)) % 31 === 0) {
              ctx.fillStyle = 'rgba(224, 159, 62, 0.65)';
              ctx.fillRect(i * cellW + 1, j * cellH + 1, cellW - 2, cellH - 2);
            } else {
              ctx.fillStyle = `rgba(30, 41, 59, ${baseAlpha * 0.5})`;
              ctx.fillRect(i * cellW + 1, j * cellH + 1, cellW - 2, cellH - 2);
            }
          }
        }

        // Floating HUD
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('1,048,576 TOKENS UNIFORM BUFFER [~1,500 A4 PAGES]', 18, 26);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('ATTENTION SPOTLIGHT: 滑鼠游標可檢視注意力權重聚焦區', 18, 46);

      } else if (scaleTier === 'output') {
        // 64k Tokens: Multi-Module Code Synthesis Stream
        ctx.fillStyle = '#050911';
        ctx.fillRect(0, 0, w, h);

        const lines = 16;
        const lineH = h / (lines + 2);

        for (let l = 0; l < lines; l++) {
          const y = (l + 1.2) * lineH;
          const indent = (l % 4) * 28 + 24;
          const progress = (Math.sin(l * 1.4 + frame * 0.04) * 0.5 + 0.5);
          const lineLength = Math.max(70, progress * (w - indent - 48));

          const isCurrentActive = l === Math.floor((frame * 0.25) % lines);

          if (isCurrentActive) {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fillRect(indent, y, lineLength, 6);
            ctx.shadowBlur = 0;

            // Synthesis cursor
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(indent + lineLength + 2, y - 3, 6, 12);
          } else {
            ctx.fillStyle = l % 3 === 0 ? '#1e293b' : '#0f172a';
            ctx.fillRect(indent, y, lineLength, 5);
          }
        }

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('65,536 MAX OUTPUT TOKENS [MULTI-FILE SYNTHESIS]', 18, 26);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('AUTONOMOUS COMPILATION: 支援跨模組端到端完整寫入', 18, 46);

      } else {
        // 1 Token: Synaptic Gate & Logits Spectrum
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // Radiating pulse ring
        const radius = 45 + Math.sin(frame * 0.08) * 8;
        const gradient = ctx.createRadialGradient(cx, cy, 6, cx, cy, radius * 2.0);
        gradient.addColorStop(0, '#e09f3e');
        gradient.addColorStop(0.35, 'rgba(56, 189, 248, 0.45)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.0, 0, Math.PI * 2);
        ctx.fill();

        // Core gate
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Softmax Logits Radial Histogram
        const barCount = 24;
        for (let b = 0; b < barCount; b++) {
          const angle = (b / barCount) * Math.PI * 2 + frame * 0.01;
          const barLen = 16 + Math.sin(b * 0.75 + frame * 0.06) * 22;
          const bx1 = cx + Math.cos(angle) * (radius + 8);
          const by1 = cy + Math.sin(angle) * (radius + 8);
          const bx2 = cx + Math.cos(angle) * (radius + 8 + barLen);
          const by2 = cy + Math.sin(angle) * (radius + 8 + barLen);

          ctx.strokeStyle = b === 4 ? '#fbbf24' : 'rgba(56, 189, 248, 0.65)';
          ctx.lineWidth = b === 4 ? 3.5 : 2;
          ctx.beginPath();
          ctx.moveTo(bx1, by1);
          ctx.lineTo(bx2, by2);
          ctx.stroke();
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('1 TOKEN MICRO-SYNAPSE [HIGH EFFORT REASONING STEP]', 18, 26);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('CALCULATING LOGITS: 60,000 思維記號層層過濾', 18, 46);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleCanvasMouse);
    };
  }, [scaleTier]);

  return (
    <div className="w-full glass-card p-6 md:p-8 flex flex-col gap-6">
      {/* Tier selector buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold code-mono">
          尺度觀測模式 / Scale Spectrum
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScaleTier('input');
              soundFx.playBlip(480);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all cursor-pointer ${
              scaleTier === 'input'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            1,048,576 (輸入上下文)
          </button>
          <button
            onClick={() => {
              setScaleTier('output');
              soundFx.playBlip(620);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all cursor-pointer ${
              scaleTier === 'output'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            65,536 (最大輸出)
          </button>
          <button
            onClick={() => {
              setScaleTier('single');
              soundFx.playBlip(780);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all cursor-pointer ${
              scaleTier === 'single'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            1 Token (微觀決策閘)
          </button>
        </div>
      </div>

      {/* Dynamic Canvas HUD */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={320}
          className="w-full h-full object-cover cursor-crosshair"
        />
      </div>

      {/* Comparative Ratio Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border transition-all ${scaleTier === 'input' ? 'border-sky-400/40 bg-sky-950/20' : 'border-white/5 bg-slate-900/40'}`}>
          <div className="text-xs text-slate-400 code-mono mb-1">極大視界 / MACRO</div>
          <div className="text-2xl font-bold text-sky-400 code-mono">1M Tokens</div>
          <div className="text-xs text-slate-400 mt-1 leading-relaxed">
            單次對話容納 1,048,576 記號，相當於整套大型代碼庫或 1,500 頁 A4 文件。
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${scaleTier === 'output' ? 'border-amber-400/40 bg-amber-950/20' : 'border-white/5 bg-slate-900/40'}`}>
          <div className="text-xs text-slate-400 code-mono mb-1">連貫生成 / MESO</div>
          <div className="text-2xl font-bold text-amber-400 code-mono">64k Tokens</div>
          <div className="text-xs text-slate-400 mt-1 leading-relaxed">
            單次最多輸出 65,536 記號，支援自主代理端到端編寫整套跨模組工程代碼。
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${scaleTier === 'single' ? 'border-purple-400/40 bg-purple-950/20' : 'border-white/5 bg-slate-900/40'}`}>
          <div className="text-xs text-slate-400 code-mono mb-1">微觀突觸 / MICRO</div>
          <div className="text-2xl font-bold text-purple-300 code-mono">1 Token</div>
          <div className="text-xs text-slate-400 mt-1 leading-relaxed">
            High 思考檔位下每一步推理層層校驗，以 6 萬思維記號鑄造單一精確解。
          </div>
        </div>
      </div>
    </div>
  );
};
