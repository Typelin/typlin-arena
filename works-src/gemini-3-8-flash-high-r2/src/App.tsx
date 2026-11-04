import React, { useState } from 'react';
import { ThinkingLevel } from './types';
import { Navbar } from './components/Navbar';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ScaleVisualizer } from './components/ScaleVisualizer';
import { ThinkingConsole } from './components/ThinkingConsole';
import { BenchmarkArena } from './components/BenchmarkArena';
import { DossierSection } from './components/DossierSection';
import { Footer } from './components/Footer';
import { ArrowDown, Sparkles, Scale, Sliders, BarChart2, BookOpen, Eye } from 'lucide-react';

export const App: React.FC = () => {
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('high');

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar thinkingLevel={thinkingLevel} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-28 md:space-y-36">
        {/* CHAPTER 1: Hero Poster (首屏海報 · 統一主角容器) */}
        <section
          id="hero"
          className="scroll-mt-24 relative min-h-[calc(100vh-5.5rem)] flex flex-col justify-between rounded-3xl p-5 sm:p-8 lg:p-10 border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-[#06090e] shadow-2xl overflow-hidden"
          aria-labelledby="hero-title"
        >
          {/* Ambient Lighting & Poster Background accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-sky-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Model Identification Badges Header */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 text-xs code-mono z-10 border-b border-white/10 pb-3.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                GA RELEASE · SEP 02, 2026
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-[11px] sm:text-xs">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold text-white">
                GOOGLE DEEPMIND
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                THINKING: HIGH
              </span>
            </div>
          </div>

          {/* Main Stage Grid: Order switches on mobile vs desktop */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center z-10 my-auto py-2">
            {/* 3D Visual Protagonist (order-1 on mobile so it is visible immediately, order-2 on desktop) */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-center relative">
              <div className="w-full h-56 sm:h-72 lg:h-[460px] relative flex items-center justify-center rounded-2xl bg-slate-950/40 border border-white/5 overflow-hidden shadow-inner">
                <ThreeCanvas thinkingLevel={thinkingLevel} />
              </div>
              <div className="text-[11px] text-slate-400 code-mono text-center mt-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>3D 量子神經核心：拖曳旋轉 / 當前思維檔位：{thinkingLevel.toUpperCase()}</span>
              </div>
            </div>

            {/* Poster Typography Anchor (order-2 on mobile, order-1 on desktop) */}
            <div className="order-2 lg:order-1 lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-bold code-mono uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CHAPTER 01 · 核心定位</span>
                </div>
                <h1
                  id="hero-title"
                  className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
                >
                  我是 <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-indigo-400">Gemini 3.8 Flash</span>{' '}
                  <span className="text-amber-300 text-2xl sm:text-4xl lg:text-5xl font-mono font-bold block sm:inline">
                    (high)
                  </span>
                </h1>
              </div>

              {/* Vernacular First Sentence */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium leading-relaxed">
                我是來自 Google DeepMind 的長鏈推理旗艦 Flash 模型，為複雜自主代理與工程工作流而生。
              </p>

              {/* Concise Chapter Body (Strictly < 60 characters: 41 chars) */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed border-l-2 border-amber-400/50 pl-3">
                我具備 100 萬上下文與可調思維強度，專為處理多步驟長鏈工程排錯與自主決策所打造。
              </p>

              {/* Key Quick Spec Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs code-mono pt-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <div className="text-slate-400 text-[10px]">上下文視界</div>
                  <div className="text-sky-300 font-bold text-xs sm:text-sm">1M Tokens</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <div className="text-slate-400 text-[10px]">AA 智力分數</div>
                  <div className="text-amber-300 font-bold text-xs sm:text-sm">31 分</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-white/10">
                  <div className="text-slate-400 text-[10px]">輸出吞吐</div>
                  <div className="text-emerald-300 font-bold text-xs sm:text-sm">137 t/s</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#thinking"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs code-mono shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>體驗思維躍遷</span>
                </a>
                <a
                  href="#scale"
                  className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs code-mono border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>向下檢視</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Poster Bottom Bar */}
          <div className="w-full flex items-center justify-between text-[11px] code-mono text-slate-400 pt-3 border-t border-white/5">
            <span>CODENAME: GEMINI-3.8-FLASH</span>
            <span className="hidden sm:inline">MULTIMODAL: TEXT / IMAGE / AUDIO / VIDEO / PDF</span>
            <span>TOKEN RATIO: 1M:64K</span>
          </div>
        </section>

        {/* CHAPTER 2: Scale Contrast (極端尺度對比) */}
        <section id="scale" className="scroll-mt-24 space-y-6" aria-labelledby="scale-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-bold code-mono uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>CHAPTER 02 · 極端尺度</span>
            </div>
            <h2 id="scale-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              極端尺度：百萬記號吞吐與微觀單步神經元
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium">
              我能在單次對話中容納 100 萬記號的浩瀚知識，並在微秒間校準單個推理脈衝。
            </p>
            {/* Concise Chapter Body (<60 chars: 40 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              極大視界能一次吞吐整座系統專案代碼，微觀視角則透過層層自審確保單步決策精密無誤。
            </p>
          </div>

          <ScaleVisualizer />
        </section>

        {/* CHAPTER 3: Core Interaction & Tradeoffs (三段思維檔位躍遷 · 視覺高潮) */}
        <section id="thinking" className="scroll-mt-24 space-y-6" aria-labelledby="thinking-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold code-mono uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>CHAPTER 03 · 核心互動 · 視覺高潮</span>
            </div>
            <h2 id="thinking-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              三段思維檔位：推理強度決定品質，也帶來漫長延遲
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium">
              訪客可直接切換 High、Medium 與 Low 三種思考檔位，親身體驗算力脈動與代價轉變。
            </p>
            {/* Concise Chapter Body (<60 chars: 43 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              切換檔位能調度不同算力深淺；High 模式雖然大幅增強推理，但也帶來 25 秒啟動延遲。
            </p>
          </div>

          <ThinkingConsole
            currentLevel={thinkingLevel}
            onLevelChange={(level) => setThinkingLevel(level)}
          />
        </section>

        {/* CHAPTER 4: Visualizing Benchmark Gaps (基準評測視覺化) */}
        <section id="benchmarks" className="scroll-mt-24 space-y-6" aria-labelledby="benchmarks-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-bold code-mono uppercase tracking-wider">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>CHAPTER 04 · 基準差距</span>
            </div>
            <h2 id="benchmarks-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              基準表現：長鏈工具領先，但在端到端複雜代碼仍有瓶頸
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium">
              我在自動化工作流與即時終端執行位居前列，但面對高難度純邏輯代碼生成依然受限。
            </p>
            {/* Concise Chapter Body (<60 chars: 41 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              我在 API 串接與工作流自動化表現強勁，但在缺乏執行反饋的複雜純代碼生成仍具侷限。
            </p>
          </div>

          <BenchmarkArena />
        </section>

        {/* CHAPTER 5: Complete Technical Dossier & Verification Tables */}
        <section id="dossier" className="scroll-mt-24 space-y-6" aria-labelledby="dossier-title">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold code-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CHAPTER 05 · 驗證檔案</span>
            </div>
            <h2 id="dossier-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              技術檔案與驗證清單：所有評測分數與官方數據來源
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium">
              本章集中收錄 2026 年 11 月 4 日查證的完整技術參數、基準成績表、對手比較與公開文獻出處。
            </p>
          </div>

          <DossierSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};
