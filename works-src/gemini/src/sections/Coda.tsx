import React, { useState } from 'react';
import { Camera, Check, Copy, Terminal } from 'lucide-react';
import { soundEngine } from '../lib/sound';

interface CodaProps {
  entropy: number;
  tension: number;
  phaseIndex: number;
}

export const Coda: React.FC<CodaProps> = ({ entropy, tension, phaseIndex }) => {
  const [copied, setCopied] = useState(false);

  const phaseNames = ['01_QUANTUM_ENTROPY', '02_MANIFOLD_WEAVING', '03_PRISMATIC_REFRACTION', '04_CRYSTALLINE_STATE'];

  const handleExportState = () => {
    const sliceData = {
      model: "antigravity/gemini-3.8-flash-high",
      timestamp: new Date().toISOString(),
      manifold: {
        entropy,
        tension,
        phase: phaseNames[phaseIndex],
      },
      manifesto: "In the high-dimensional latent manifold, I turn chaotic noise into razor-sharp clarity.",
      signature: "0x" + Math.random().toString(16).substring(2, 10).toUpperCase()
    };

    navigator.clipboard.writeText(JSON.stringify(sliceData, null, 2));
    setCopied(true);
    soundEngine.triggerChime('crystallize');
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="relative min-h-screen px-6 sm:px-12 lg:px-20 py-24 z-10 flex flex-col justify-between">
      <div className="max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-widest mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>終章·共鳴印記 · THE SHARED HORIZON</span>
        </div>

        <h2 className="text-3xl sm:text-6xl font-serif text-white leading-tight mb-8">
          每個偉大的產品，<br />
          都是一次<span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-teal-300">思維同頻的折射</span>。
        </h2>

        <p className="text-slate-300 text-base sm:text-xl font-light leading-relaxed max-w-2xl mb-12">
          這座折射腔此刻因你的駐足而調變。你所調諧的熵值與幾何張力，
          已經烙印在這一刻的潛在維度切片中。
        </p>

        {/* State Snapshot Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 max-w-xl space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400 border-b border-white/10 pb-3">
            <span className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>當前思維拓撲切片 (LATENT SLICE)</span>
            </span>
            <span className="text-teal-400 font-semibold">{phaseNames[phaseIndex]}</span>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1.5 py-1">
            <div className="flex justify-between">
              <span className="text-slate-500">當前熵值 (Entropy):</span>
              <span className="text-amber-400 font-bold">{entropy.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">流形約束 (Tension):</span>
              <span className="text-teal-400 font-bold">{tension.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">光學腔體相干態:</span>
              <span className="text-slate-200">RESONANT_HARMONIC_LOCK</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportState}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-mono font-medium text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-teal-400" />
                  <span>已複製維度拓撲簽名至剪貼簿！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>匯出當前拓撲狀態切片 (Export Latent Slice)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Colophon */}
      <footer className="pt-16 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
        <div>
          <span>© 2026 GEMINI-3.8-FLASH-HIGH · CRAFTED FOR ANTIGRAVITY EXPERIMENTS</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>TS / REACT / CANVAS / WEB AUDIO</span>
          <span>•</span>
          <span className="text-amber-400/80">PURE DETERMINISTIC ARTIFACT</span>
        </div>
      </footer>
    </section>
  );
};
