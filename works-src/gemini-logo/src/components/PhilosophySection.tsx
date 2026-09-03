import React from 'react';
import { Feather, Cpu, ShieldCheck, Zap, Sparkles, Layers } from 'lucide-react';
import { sound } from '../lib/sound';

export const PhilosophySection: React.FC = () => {
  const pillars = [
    {
      icon: Feather,
      title: '樱落静谧 · 美学克制',
      en: 'Sublime Aesthetics',
      accent: 'from-[#fbd0df] to-[#f1a5ba]',
      textColor: 'text-[#d0386c]',
      desc: '拒绝廉价的炫技与喧闹的霓虹轰炸。我们遵循东方空间留白与精微排版准则，让每一个像素呼吸，带来如清泉击石般的安宁感与高质感。',
      quote: '“绚烂终归于平淡，繁复终溶于洗练。”'
    },
    {
      icon: Cpu,
      title: '月靛沉静 · 架构理性',
      en: 'Architectural Rigor',
      accent: 'from-[#c8ceeb] to-[#3f4e86]',
      textColor: 'text-[#3f4e86]',
      desc: '无论界面多么诗意，底层必须是经过严苛验证的现代软件工程架构：严格类型定义、零运行时垃圾收集抖动、秒级极速渲染与高并发高可用保障。',
      quote: '“每一行优雅逻辑，都是对用户时间的最高敬意。”'
    },
    {
      icon: Zap,
      title: '代码生花 · 赋能未来',
      en: 'Generative Empowerment',
      accent: 'from-[#f1a5ba] to-[#8b97c6]',
      textColor: 'text-[#506194]',
      desc: '将大语言模型、扩散感知与 WebGL 3D 渲染深度揉碎重组。科技不应让人感到冰冷疏离，而应像春风拂面，在指尖化作不可替代的生产力与愉悦感。',
      quote: '“用代码创造美好未来，是承诺，亦是修行。”'
    }
  ];

  return (
    <section id="philosophy" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-[#f8f6f8] to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fde8ef] text-[#d0386c] text-xs font-mono tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>三位一体 · 核心设计哲学</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1a1e32] tracking-tight">
            以东方诗意，解构现代工程
          </h2>
          <p className="text-[#59648c] text-base sm:text-lg font-light leading-relaxed">
            咲梦不仅仅是一个开发代号，更是一种软件产品哲思：当冰冷的代码遇上粉樱与夜月的灵性，数字化系统便拥有了灵魂。
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                onMouseEnter={() => sound.playDrop(idx === 0 ? 'low' : idx === 1 ? 'mid' : 'high')}
                className="relative group rounded-3xl p-8 bg-white/80 border border-[#3e4c84]/12 hover:border-[#e8648c]/40 transition-all duration-500 ink-shadow ink-shadow-hover hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Top Corner Glow Badge */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.accent} p-0.5 shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                      <div className="w-full h-full rounded-2xl bg-white/90 flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${pillar.textColor}`} />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#8b97c6] font-semibold tracking-widest uppercase">
                      0{idx + 1} //
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1f253d] group-hover:text-[#e85383] transition-colors">
                      {pillar.title}
                    </h3>
                    <div className="font-mono text-xs text-[#7d87ad] tracking-wide">
                      {pillar.en}
                    </div>
                  </div>

                  <p className="text-sm text-[#556087] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#3e4c84]/10">
                  <span className="font-serif italic text-xs text-[#6e779c]">
                    {pillar.quote}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-Disciplinary Metric Bar */}
        <div className="mt-16 p-8 rounded-3xl bg-white/70 border border-[#3e4c84]/15 shadow-sm backdrop-blur-md grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#3e4c84]">99.8%</div>
            <div className="text-xs text-[#6e779c] mt-1 font-mono">首屏光速交互标准 (FCP &lt; 0.4s)</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#e85383]">60 FPS</div>
            <div className="text-xs text-[#6e779c] mt-1 font-mono">流体渲染动效硬件加速</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#3e4c84]">100%</div>
            <div className="text-xs text-[#6e779c] mt-1 font-mono">严格全静态类型推导</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#e85383]">Zero</div>
            <div className="text-xs text-[#6e779c] mt-1 font-mono">零冗余依附 · 原生轻量化交付</div>
          </div>
        </div>
      </div>
    </section>
  );
};
