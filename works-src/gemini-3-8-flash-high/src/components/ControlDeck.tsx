import React from 'react';
import { Sliders, RefreshCw, Volume2, VolumeX, Compass, Activity, Sparkles, Orbit, ChevronDown, ChevronUp } from 'lucide-react';
import { soundEngine } from '../lib/sound';

interface ControlDeckProps {
  entropy: number;
  setEntropy: (val: number) => void;
  tension: number;
  setTension: (val: number) => void;
  phaseIndex: number;
  setPhaseIndex: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  onProbePing: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  entropy,
  setEntropy,
  tension,
  setTension,
  phaseIndex,
  setPhaseIndex,
  isMuted,
  setIsMuted,
  onProbePing
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const handleMuteToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.triggerChime('probe');
    }
  };

  const handleReset = () => {
    setEntropy(0.35);
    setTension(0.65);
    soundEngine.triggerChime('probe');
  };

  const phases = [
    { label: '01 熵增漲落', desc: 'Quantum Entropy' },
    { label: '02 拓撲織造', desc: 'Manifold Weaving' },
    { label: '03 光學折射', desc: 'Prismatic Refraction' },
    { label: '04 晶格凝固', desc: 'Crystalline State' },
  ];

  return (
    <aside 
      aria-label="思維維度調變控制台"
      className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 pointer-events-auto"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Orbit className="w-4 h-4 text-chamber-amber animate-spin" style={{ animationDuration: '14s' }} />
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate-200 font-semibold">
            維度調變陣列 · INSTRUMENT
          </h2>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title={isCollapsed ? '展開面版' : '收合面板'}
            aria-label={isCollapsed ? '展開面版' : '收合面板'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleMuteToggle}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              !isMuted 
                ? 'bg-chamber-amber/20 border-chamber-amber/50 text-chamber-amber' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={isMuted ? '開啟聲學諧波' : '靜音'}
            aria-label={isMuted ? '開啟聲學諧波' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="復位基準參數"
            aria-label="復位基準參數"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Sliders */}
      {!isCollapsed && (
        <div className="mt-4 space-y-4">
        {/* Entropy / Temperature Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              思維熵值 (Entropy / Temp)
            </span>
            <span className="text-amber-400 font-semibold">{entropy.toFixed(2)}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={entropy}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEntropy(val);
                soundEngine.modulate(val, tension, phaseIndex);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              aria-label="思維熵值滑桿"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>精密秩序 (Strict)</span>
            <span>發散狂想 (Creative)</span>
          </div>
        </div>

        {/* Tension / Constraint Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-teal-400" />
              流形張力 (Manifold Tension)
            </span>
            <span className="text-teal-400 font-semibold">{tension.toFixed(2)}</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={tension}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTension(val);
                soundEngine.modulate(entropy, val, phaseIndex);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              aria-label="流形張力滑桿"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>流體放鬆 (Relaxed)</span>
            <span>高維收束 (Compact)</span>
          </div>
        </div>

        {/* Phase Selector Tabs */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-indigo-400" />
              相態相位躍遷 (Phase Matrix)
            </span>
            <span className="text-[10px] text-slate-500">Phase {phaseIndex + 1}/4</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {phases.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPhaseIndex(idx);
                  soundEngine.triggerChime('phase');
                  soundEngine.modulate(entropy, tension, idx);
                }}
                className={`text-left p-2 rounded-lg border transition-all text-xs font-mono ${
                  phaseIndex === idx
                    ? 'bg-white/15 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/40'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold truncate">{p.label}</div>
                <div className="text-[9px] text-slate-500 truncate">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Probe Ping Action */}
        <button
          onClick={onProbePing}
          className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Sliders className="w-3.5 h-3.5" />
          發射高維探針脈衝 (Emit Latent Probe)
        </button>
      </div>
      )}
    </aside>
  );
};
