import React, { useEffect, useRef, useState } from 'react';
import { ThinkingLevel } from '../types';
import { Play, RotateCcw, Activity, Terminal, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ThinkingOscilloscopeProps {
  thinkingLevel: ThinkingLevel;
}

interface TraceStep {
  timeSec: number;
  label: string;
  tokens: number;
}

export const ThinkingOscilloscope: React.FC<ThinkingOscilloscopeProps> = ({ thinkingLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [simElapsed, setSimElapsed] = useState(0);
  const [simTokens, setSimTokens] = useState(0);

  const simulationSteps: Record<ThinkingLevel, TraceStep[]> = {
    high: [
      { timeSec: 0, label: '01 載入百萬上下文：建構全域依賴圖譜', tokens: 4200 },
      { timeSec: 4.8, label: '02 第一層推演：多步驟工具排程與假設生成', tokens: 18500 },
      { timeSec: 11.2, label: '03 深度回溯：偵測潛在衝突並執行自我修正', tokens: 36200 },
      { timeSec: 18.5, label: '04 語法與型別交叉審查：消除幻覺路徑', tokens: 51800 },
      { timeSec: 25.27, label: '05 達成收斂共識：釋放首個輸出記號 (TTFT)', tokens: 60000 },
    ],
    medium: [
      { timeSec: 0, label: '01 檢索上下文焦點：提取核心意圖', tokens: 2100 },
      { timeSec: 1.6, label: '02 標準推演：工具呼叫驗證', tokens: 19400 },
      { timeSec: 3.5, label: '03 產出首記號：平衡品質與延遲', tokens: 47000 },
    ],
    low: [
      { timeSec: 0, label: '01 輕量意圖映射', tokens: 800 },
      { timeSec: 0.8, label: '02 極速首字吐出 (TTFT 0.8s)', tokens: 4500 },
    ],
  };

  const steps = simulationSteps[thinkingLevel];

  // Simulation timer
  useEffect(() => {
    if (!isSimulating) return;

    const maxTime = steps[steps.length - 1].timeSec;
    const interval = setInterval(() => {
      setSimElapsed((prev) => {
        const next = prev + 0.25;
        if (next >= maxTime) {
          setIsSimulating(false);
          setCurrentStepIndex(steps.length - 1);
          setSimTokens(steps[steps.length - 1].tokens);
          soundFx.playBlip(880, 0.1);
          return maxTime;
        }

        const stepIdx = steps.findIndex((s, idx) => {
          const nextStep = steps[idx + 1];
          return next && nextStep ? next < nextStep.timeSec : true;
        });
        if (stepIdx !== -1) {
          if (stepIdx !== currentStepIndex) {
            soundFx.playBlip(400 + stepIdx * 100, 0.05);
          }
          setCurrentStepIndex(stepIdx);
          const ratio = next / maxTime;
          setSimTokens(Math.floor(ratio * steps[steps.length - 1].tokens));
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, thinkingLevel, steps, currentStepIndex]);

  const handleStartSimulation = () => {
    soundFx.playBurst();
    setSimElapsed(0);
    setCurrentStepIndex(0);
    setSimTokens(0);
    setIsSimulating(true);
  };

  const handleReset = () => {
    soundFx.playBlip(300, 0.05);
    setIsSimulating(false);
    setSimElapsed(0);
    setCurrentStepIndex(0);
    setSimTokens(0);
  };

  // Oscilloscope Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      offset += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridCols = 20;
      const gridRows = 8;
      for (let i = 0; i <= gridCols; i++) {
        const x = (i / gridCols) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let j = 0; j <= gridRows; j++) {
        const y = (j / gridRows) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Dynamic Frequency & Amplitude
      let freq = 0.02;
      let amp = 24;
      let strokeColor = '#38bdf8';
      let harmonics = 2;

      if (thinkingLevel === 'high') {
        freq = 0.045;
        amp = 42;
        strokeColor = '#fbbf24';
        harmonics = 5;
      } else if (thinkingLevel === 'medium') {
        freq = 0.025;
        amp = 28;
        strokeColor = '#38bdf8';
        harmonics = 3;
      } else {
        freq = 0.012;
        amp = 14;
        strokeColor = '#10b981';
        harmonics = 1;
      }

      // Draw Waveform
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        let y = cy;
        for (let k = 1; k <= harmonics; k++) {
          const factor = k % 2 === 0 ? -1 : 1;
          const noise = isSimulating ? Math.sin(x * 0.12 + offset * 3.5) * 8 : 0;
          y +=
            Math.sin(x * freq * k + offset * (k * 0.8)) *
            (amp / (k * 0.75)) *
            factor +
            noise;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Scanline beam
      const beamX = (offset * 85) % w;
      const grad = ctx.createLinearGradient(beamX - 35, 0, beamX + 10, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, strokeColor);
      ctx.fillStyle = grad;
      ctx.fillRect(beamX - 35, 0, 35, h);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [thinkingLevel, isSimulating]);

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider code-mono">
            神經思維示波器 / SYNAPTIC REASONING OSCILLOSCOPE
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs code-mono">
          <div className="text-slate-400">
            即時頻寬：
            <span className="text-white font-bold">
              {thinkingLevel === 'high' ? '60k TOKENS DEPTH' : thinkingLevel === 'medium' ? '47k DEPTH' : 'LIGHT DEPTH'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isSimulating ? (
              <button
                onClick={handleStartSimulation}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>模擬長鏈推演</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重設</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Oscilloscope Canvas */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#060a12]">
        <canvas ref={canvasRef} width={800} height={180} className="w-full h-full object-cover" />

        {/* Live Counters Overlay */}
        <div className="absolute top-3 left-4 flex items-center gap-4 text-[11px] code-mono pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-slate-300">
            推演計時：
            <span className="text-amber-300 font-bold ml-1">
              {simElapsed.toFixed(2)}s / {steps[steps.length - 1].timeSec}s
            </span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-slate-300">
            思維記號：
            <span className="text-purple-300 font-bold ml-1">
              {simTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-3 right-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-[10px] code-mono text-slate-400 flex items-center gap-1.5 pointer-events-none">
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isSimulating ? 'REASONING BURST IN PROGRESS' : 'STANDBY IDLE'}</span>
        </div>
      </div>

      {/* Step by Step Trace HUD */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold code-mono flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>思維鏈執行軌跡 / Reasoning Trajectory</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {steps.map((st, i) => {
            const isCompleted = simElapsed >= st.timeSec;
            const isCurrent = currentStepIndex === i && isSimulating;

            return (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-lg border text-xs code-mono flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/40 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-400">
                      {i + 1}
                    </span>
                  )}
                  <span>{st.label}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  +{st.tokens.toLocaleString()} tokens
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
