import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Code2, Compass, Layers, Send } from 'lucide-react';
import { sound } from '../lib/sound';

interface NavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  isAudioOn,
  onToggleAudio
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'philosophy', label: '设计哲学', en: 'Philosophy', icon: Compass },
    { id: 'craft', label: '工程阵列', en: 'Architecture', icon: Code2 },
    { id: 'portfolio', label: '代表作品', en: 'Selected Works', icon: Layers },
    { id: 'manifesto', label: '品牌源流', en: 'Origins', icon: Sparkles },
    { id: 'contact', label: '联络合作', en: 'Inquiry', icon: Send },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-[#3e4c84]/10 shadow-[0_4px_30px_rgba(62,76,132,0.03)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand identity badge */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            sound.playDrop('high');
            onNavigate('hero');
          }}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="relative w-11 h-11 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#f1a5ba] via-[#8b97c6] to-[#3f4e86] shadow-sm group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden">
              <img
                src="/logo.png"
                alt="咲梦信息科技工作室"
                className="w-full h-full object-contain scale-110 group-hover:rotate-6 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#222944] group-hover:text-[#e85383] transition-colors">
                咲梦信息科技
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fde8ef] text-[#d0386c] font-medium tracking-wide">
                SAKIMU
              </span>
            </div>
            <span className="text-[11px] font-mono tracking-widest text-[#6c77a7] uppercase">
              Tech Studio &bull; Est. 2026
            </span>
          </div>
        </a>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#faf8f9]/80 border border-[#3e4c84]/10 p-1.5 rounded-full shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playDrop('mid');
                  onNavigate(item.id);
                }}
                className={`relative px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#e8648c] to-[#3e4c84] shadow-md shadow-[#e8648c]/20'
                    : 'text-[#48537c] hover:text-[#222944] hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8b97c6]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Ambient chime + CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const res = onToggleAudio();
              sound.playDrop('high');
            }}
            aria-label={isAudioOn ? '静音音效' : '开启水滴音效'}
            title={isAudioOn ? '和弦音效已开启（点击静音）' : '开启互动清鸣（点击开启）'}
            className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
              isAudioOn
                ? 'bg-[#fde8ef] border-[#f8a7c2] text-[#d0386c] shadow-sm'
                : 'bg-white/80 border-[#3e4c84]/15 text-[#6c77a7] hover:border-[#3e4c84]/40 hover:text-[#222944]'
            }`}
          >
            {isAudioOn ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playChord();
              onNavigate('contact');
            }}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#3e4c84] to-[#252f58] hover:from-[#e8648c] hover:to-[#3e4c84] transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-[#e8648c]/25 transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ffc8db]" />
            <span>启航立项</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-[#3e4c84]/15 bg-white/80 text-[#3e4c84]"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current transform transition ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 w-full bg-current transition ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-current transform transition ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-[#3e4c84]/10 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playDrop('mid');
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#2d3864] hover:bg-[#fde8ef]/60"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#e85383]" />
                  <span>{item.label}</span>
                </div>
                <span className="text-xs font-mono text-[#8b97c6]">{item.en}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
