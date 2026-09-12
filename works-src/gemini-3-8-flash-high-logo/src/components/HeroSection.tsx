import React, { useState } from 'react';
import { ArrowUpRight, Compass, Sparkles, Terminal, Heart, Play } from 'lucide-react';
import { sound } from '../lib/sound';

interface HeroProps {
  onExploreCraft: () => void;
  onContact: () => void;
}

export const HeroSection: React.FC<HeroProps> = ({ onExploreCraft, onContact }) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'palette' | 'code'>('vision');
  const [interactiveCount, setInteractiveCount] = useState<number>(0);

  const colors = [
    { name: '樱粉 (Sakura)', hex: '#F1A5BA', role: '初绽之梦 · 人本温度与生命力' },
    { name: '月靛 (Moon Indigo)', hex: '#3F4E86', role: '幽夜理性 · 坚固架构与工程沉淀' },
    { name: '墨韵 (Ink Black)', hex: '#1A1E32', role: '字句千钧 · 严谨语法与代码基石' },
    { name: '云雾 (Cloud Mist)', hex: '#99A3D2', role: '渐变渡波 · 艺术与算法的过渡带' },
  ];

  const handleInteractiveClick = () => {
    sound.playDrop('high');
    setInteractiveCount((c) => c + 1);
  };

  return (
    <section id="hero" className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center overflow-hidden">
      {/* Decorative gradient glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#fbd0df]/50 via-[#99a3d2]/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-20 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-[#3f4e86]/10 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Brand Statement & Typography */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#3e4c84]/15 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#e85383] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#e85383] -ml-4" />
            <span className="text-xs font-mono tracking-wider text-[#3e4c84] font-medium">
              SAKIMU TECH STUDIO &bull; 数字化工艺工坊
            </span>
          </div>

          {/* Main Hero Title */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1a1e32] leading-[1.12]">
              用代码之墨，
              <br />
              <span className="gradient-text-sakura">织就繁花与梦。</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#535d82] font-light max-w-2xl leading-relaxed pt-2">
              「咲」是花开之瞬，「梦」是愿景之始。我们深耕下一代现代 Web、沉浸式 3D 渲染与生成式 AI 应用，将东方工匠的静谧克制，融入极速现代软件工程中。
            </p>
          </div>

          {/* Slogan Banner directly inspired by LOGO */}
          <div className="p-4 rounded-2xl bg-white/60 border border-[#3e4c84]/10 backdrop-blur-md flex flex-wrap items-center gap-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#3e4c84]/10 text-[#3e4c84]">
                工作室誓言
              </span>
              <span className="font-serif text-sm tracking-wide text-[#2d3864]">
                “用代码创造美好未来”
              </span>
            </div>
            <div className="h-4 w-px bg-[#3e4c84]/15 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-mono text-[#6c77a7]">
              <span>/ / 樱粉 &bull; 靛蓝 &bull; 墨骨</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                sound.playChord();
                onExploreCraft();
              }}
              className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#3e4c84] via-[#4d5c9e] to-[#252f58] hover:from-[#e8648c] hover:to-[#3e4c84] transition-all duration-500 shadow-lg shadow-[#3e4c84]/20 hover:shadow-xl hover:shadow-[#e8648c]/30 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>探索工程作品集</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playDrop('mid');
                onContact();
              }}
              className="px-6 py-3.5 rounded-full text-sm font-medium text-[#2d3864] bg-white/80 hover:bg-white border border-[#3e4c84]/15 hover:border-[#3e4c84]/40 transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>预约架构咨询</span>
            </button>

            <div className="flex items-center gap-2 pl-2 text-xs text-[#7c88b2] font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>当前可承接 2026 Q3/Q4 精品项目</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Interactive Logo Emblem Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-3xl p-6 bg-white/70 border border-[#3e4c84]/15 shadow-[0_20px_60px_-15px_rgba(62,76,132,0.15)] backdrop-blur-xl group">
            {/* Ambient rotating orbit rings */}
            <div className="absolute inset-0 rounded-3xl border border-dashed border-[#8b97c6]/20 animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute -inset-2 rounded-3xl border border-dotted border-[#f1a5ba]/30 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />

            {/* Emblem Inner Stage */}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#faf8f9] to-[#f4f3f9] border border-white/80 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {/* Actual Logo Image Centered with Hover Aura */}
              <div 
                onClick={handleInteractiveClick}
                className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full cursor-pointer p-3 bg-white/90 shadow-[0_10px_35px_rgba(62,76,132,0.12)] border border-[#3e4c84]/10 transition-all duration-500 hover:scale-105 hover:shadow-[0_15px_45px_rgba(241,165,186,0.35)] flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="咲梦科技 SAKIMU LOGO"
                  className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-700 group-hover:rotate-3"
                />
                
                {/* Floating interactive hint */}
                <div className="absolute bottom-2 px-3 py-1 rounded-full bg-white/95 border border-[#3e4c84]/15 text-[10px] font-mono text-[#4a5682] shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#e85383]" />
                  <span>触碰灵感 ({interactiveCount})</span>
                </div>
              </div>

              {/* Sub-card interactive tabs */}
              <div className="w-full mt-4 flex items-center justify-between gap-1 p-1 bg-white/70 rounded-xl border border-[#3e4c84]/10 text-[11px] font-medium">
                <button
                  onClick={() => {
                    sound.playDrop('low');
                    setActiveTab('vision');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'vision' ? 'bg-[#3e4c84] text-white shadow-sm' : 'text-[#5d688f] hover:text-[#1a1e32]'
                  }`}
                >
                  徽章释义
                </button>
                <button
                  onClick={() => {
                    sound.playDrop('mid');
                    setActiveTab('palette');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'palette' ? 'bg-[#3e4c84] text-white shadow-sm' : 'text-[#5d688f] hover:text-[#1a1e32]'
                  }`}
                >
                  取色矩阵
                </button>
                <button
                  onClick={() => {
                    sound.playDrop('high');
                    setActiveTab('code');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'code' ? 'bg-[#3e4c84] text-white shadow-sm' : 'text-[#5d688f] hover:text-[#1a1e32]'
                  }`}
                >
                  工程纯度
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Inspector Info Panel */}
          <div className="w-full max-w-[420px] mt-4 p-4 rounded-2xl bg-white/80 border border-[#3e4c84]/10 backdrop-blur-md shadow-sm transition-all duration-300">
            {activeTab === 'vision' && (
              <div className="text-left space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold text-[#222944]">
                  <span>弯月、樱花与代码符 &lt;/&gt;</span>
                  <span className="font-mono text-[#e85383] text-[11px]">Symbolism</span>
                </div>
                <p className="text-xs text-[#535d82] leading-relaxed">
                  月牙形靛蓝环圈象征数字苍穹与包容怀抱，粉色樱花代表有温度的匠人情怀与绽放生机，右侧的 &lt;/&gt; 代码符则昭示以现代严谨代码作为承载的支点。
                </p>
              </div>
            )}

            {activeTab === 'palette' && (
              <div className="grid grid-cols-2 gap-2 text-left animate-fadeIn">
                {colors.map((c) => (
                  <div key={c.hex} className="p-2 rounded-xl bg-white/70 border border-[#3e4c84]/10 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-mono font-bold text-[#222944]">{c.hex}</div>
                      <div className="text-[9px] text-[#6c77a7] truncate">{c.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="text-left space-y-1 font-mono text-[11px] text-[#3e4c84] animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span>Stack: Vite 6 + React 18 + TS</span>
                  <span className="text-emerald-600 font-bold">100% Typed</span>
                </div>
                <div className="text-[#6c77a7] text-[10px]">
                  Canvas 2D 樱瓣流场 &bull; Web Audio 纯律和弦 &bull; 响应式弹性布局
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
