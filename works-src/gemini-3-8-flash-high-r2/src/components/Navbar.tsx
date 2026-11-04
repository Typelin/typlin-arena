import React, { useState } from 'react';
import { ThinkingLevel } from '../types';
import { Sparkles, Terminal, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  thinkingLevel: ThinkingLevel;
}

export const Navbar: React.FC<NavbarProps> = ({ thinkingLevel }) => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFx.enabled = next;
    if (next) {
      soundFx.playBurst();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-white/10 transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-sky-400 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div className="truncate">
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide code-mono flex items-center gap-1.5 whitespace-nowrap">
              <span>Gemini 3.8 Flash</span>
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                (high)
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase code-mono truncate">
              Google DeepMind · Model Dossier
            </div>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav className="hidden lg:flex items-center gap-6 text-xs code-mono">
          <a
            href="#hero"
            onClick={() => soundFx.playBlip(500)}
            className="text-slate-400 hover:text-sky-400 transition-colors"
          >
            01 核心定位
          </a>
          <a
            href="#scale"
            onClick={() => soundFx.playBlip(550)}
            className="text-slate-400 hover:text-sky-400 transition-colors"
          >
            02 極端尺度
          </a>
          <a
            href="#thinking"
            onClick={() => soundFx.playBlip(600)}
            className="text-slate-400 hover:text-amber-400 transition-colors"
          >
            03 思維躍遷
          </a>
          <a
            href="#benchmarks"
            onClick={() => soundFx.playBlip(650)}
            className="text-slate-400 hover:text-purple-400 transition-colors"
          >
            04 基準差距
          </a>
          <a
            href="#dossier"
            onClick={() => soundFx.playBlip(700)}
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            05 驗證檔案
          </a>
        </nav>

        {/* Live Status indicator & Sound FX switch */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs code-mono transition-all flex items-center gap-1 cursor-pointer ${
              audioEnabled
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={audioEnabled ? '關閉程序音效' : '開啟程序音效 (Web Audio 震盪合成)'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10px]">{audioEnabled ? 'FX ON' : 'FX OFF'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] code-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">THINKING:</span>
            <span className="text-amber-300 font-bold uppercase">{thinkingLevel}</span>
          </div>

          <a
            href="#dossier"
            onClick={() => soundFx.playBlip(750)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-bold code-mono border border-sky-400/30 transition-all flex items-center gap-1.5 shrink-0"
            title="查閱技術檔案"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">查閱規格</span>
          </a>
        </div>
      </div>
    </header>
  );
};
