import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, Sun } from 'lucide-react';
import { sound } from '../lib/sound';

export const ManifestoSection: React.FC = () => {
  return (
    <section id="manifesto" className="py-24 max-w-7xl mx-auto px-6">
      <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-white/95 via-[#fcfbfe] to-[#f9f5f9] border border-[#3e4c84]/15 shadow-xl ink-shadow relative overflow-hidden">
        {/* Background Watermark LOGO Silhouette */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-5 pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-3xl space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fde8ef] text-[#d0386c] text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>品牌起源与精神誓章 · Brand Manifesto</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1f253d] leading-tight">
            “咲”出新枝，“梦”见未来：
            <br />
            <span className="gradient-text-sakura">为什么我们需要有温度的工程？</span>
          </h2>

          <div className="space-y-6 text-base text-[#4a557b] font-light leading-relaxed">
            <p>
              在数字化狂飙突进的时代，人们常常被泛滥的冰冷荧光、千篇一律的暗黑赛博与虚无的科技术语包围。技术仿佛成了一道高耸的铁幕，让用户在其中感到迷茫与疲惫。
            </p>
            <p>
              <strong>咲梦信息科技工作室（SAKIMU TECH STUDIO）</strong>
              诞生的初衷，便是打破这种疏离。在古汉语与东方语境中，“咲”即是含苞初绽的喜悦；“梦”是人类对广阔世界最纯粹的想象。
            </p>
            <p>
              我们深信：真正卓越的软件，不仅在于高吞吐量与精巧的数据结构，更在于当用户每一次点击、每一次滑动屏幕时，内心感受到的沉静与愉悦。我们把代码当做诗歌来推敲，把系统当做园林来营造。
            </p>
          </div>

          {/* Three Core Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#3e4c84]/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif text-base font-bold text-[#222944]">
                <Sun className="w-4 h-4 text-[#e85383]" />
                <span>明澈克制</span>
              </div>
              <p className="text-xs text-[#6e779c] leading-relaxed">
                绝不塞入无效炫技与流氓冗余插件，守护用户终端纯粹与流畅。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif text-base font-bold text-[#222944]">
                <ShieldCheck className="w-4 h-4 text-[#3e4c84]" />
                <span>磐石品质</span>
              </div>
              <p className="text-xs text-[#6e779c] leading-relaxed">
                全链路类型覆盖、端到端自动化测试验证，承诺长效维护周期。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif text-base font-bold text-[#222944]">
                <HeartHandshake className="w-4 h-4 text-[#e85383]" />
                <span>共生伙伴</span>
              </div>
              <p className="text-xs text-[#6e779c] leading-relaxed">
                将客户当做共同织梦者，深度介入业务痛点，共创长期数字化价值。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
