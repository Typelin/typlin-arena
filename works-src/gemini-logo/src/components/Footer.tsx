import React from 'react';
import { Github, Twitter, Code2, Heart, ArrowUp } from 'lucide-react';
import { sound } from '../lib/sound';

export const Footer: React.FC<{ onBackToTop: () => void }> = ({ onBackToTop }) => {
  return (
    <footer className="border-t border-[#3e4c84]/12 bg-white/70 backdrop-blur-md pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#3e4c84]/10 items-start">
          {/* Brand Intro */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#f1a5ba] to-[#3f4e86]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <img src="/logo.png" alt="咲梦" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#1f253d]">
                  咲梦信息科技工作室
                </span>
                <span className="text-xs font-mono block text-[#6c77a7]">
                  SAKIMU TECH STUDIO &bull; 用代码创造美好未来
                </span>
              </div>
            </div>
            <p className="text-xs text-[#5f6b94] leading-relaxed max-w-md">
              以东方美学之灵性，赋能现代工程严密逻辑。致力于打造兼具温润心意与极速性能的下一代数字界面与智能系统。
            </p>
          </div>

          {/* Nav quicklinks */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold text-[#2d3864] uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#556087]">
              <li><a href="#philosophy" className="hover:text-[#e85383] transition-colors">设计哲学 (Philosophy)</a></li>
              <li><a href="#craft" className="hover:text-[#e85383] transition-colors">工程阵列 (Architecture)</a></li>
              <li><a href="#portfolio" className="hover:text-[#e85383] transition-colors">代表作品 (Portfolio)</a></li>
              <li><a href="#manifesto" className="hover:text-[#e85383] transition-colors">品牌源流 (Origins)</a></li>
            </ul>
          </div>

          {/* Colophon & Status */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold text-[#2d3864] uppercase tracking-wider">
              Engineering Colophon
            </h4>
            <div className="text-xs font-mono text-[#556087] space-y-1">
              <div>Vite 6 &bull; React 18 &bull; TypeScript</div>
              <div>Canvas 2D Particle Fluid</div>
              <div>Web Audio API Pentatonic Chimes</div>
              <div className="text-[#e85383] pt-1 flex items-center gap-1">
                <span>Handcrafted with precision</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#7985ad]">
          <div>
            &copy; {new Date().getFullYear()} 咲梦信息科技工作室 (SAKIMU TECH STUDIO). All rights reserved.
          </div>

          <button
            onClick={() => {
              sound.playDrop('high');
              onBackToTop();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#3e4c84]/15 hover:border-[#e8648c] text-[#3e4c84] hover:text-[#e85383] transition-all shadow-sm cursor-pointer"
          >
            <span>返回云端顶部</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
