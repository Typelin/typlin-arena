import React, { useState } from 'react';
import { ThinkingLevel } from './types';
import { Navbar } from './components/Navbar';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ScaleVisualizer } from './components/ScaleVisualizer';
import { ThinkingConsole } from './components/ThinkingConsole';
import { BenchmarkArena } from './components/BenchmarkArena';
import { DossierSection } from './components/DossierSection';
import { Footer } from './components/Footer';
import { ArrowDown, Sliders, Eye } from 'lucide-react';
import { soundFx } from './utils/audio';

export const App: React.FC = () => {
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>('high');

  return (
    <div className="min-h-screen bg-[#08090c] text-[#f1f3f7] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar thinkingLevel={thinkingLevel} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-28 md:space-y-40">
        {/* CHAPTER 1: Monumental Editorial Hero Poster (超驗海報) */}
        <section
          id="hero"
          className="scroll-mt-24 relative min-h-[calc(100vh-6rem)] flex flex-col justify-between border border-white/10 bg-[#0b0d13] p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden"
          aria-labelledby="hero-title"
        >
          {/* Architectural Telemetry Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs code-mono z-10 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-400" />
              <span className="text-white font-bold tracking-widest uppercase">
                GA RELEASE · SEP 02, 2026
              </span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">ARCH: MULTIMODAL MOE</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="code-mono font-bold text-amber-400">[01 // MONOLITH]</span>
              <span className="px-2 py-0.5 bg-white/5 border border-white/15 text-white font-bold uppercase tracking-wider">
                GOOGLE DEEPMIND
              </span>
            </div>
          </div>

          {/* Hero Stage Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 my-auto py-6">
            {/* 3D Optical Prismatic Monolith (order-1 on mobile, order-2 on desktop) */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-center relative">
              <div className="w-full h-64 sm:h-80 lg:h-[500px] relative flex items-center justify-center bg-[#07080c] border border-white/10 overflow-hidden shadow-2xl">
                <ThreeCanvas thinkingLevel={thinkingLevel} />
              </div>
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 code-mono pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>光學色散稜鏡 · 3D 自由旋轉</span>
                </span>
                <span className="text-amber-400 font-bold uppercase">
                  EFFORT: {thinkingLevel}
                </span>
              </div>
            </div>

            {/* Poster Typographic Anchor (order-2 on mobile, order-1 on desktop) */}
            <div className="order-2 lg:order-1 lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-widest code-mono text-amber-400 font-bold flex items-center gap-2">
                  <span>CHAPTER 01</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-300">核心定位與使命</span>
                </div>

                {/* Monumental Avant-Garde Title */}
                <h1
                  id="hero-title"
                  className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
                >
                  我是 <span className="text-white">Gemini 3.8 Flash</span>{' '}
                  <span className="font-serif-italic text-amber-400 font-normal block sm:inline">
                    (high)
                  </span>
                </h1>
              </div>

              {/* Vernacular First Sentence */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-medium leading-relaxed">
                我是來自 Google DeepMind 的長鏈推理旗艦 Flash 模型，為複雜自主代理與工程工作流而生。
              </p>

              {/* Concise Chapter Body (Strictly < 60 characters: 41 chars) */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed border-l-2 border-amber-400 pl-4 py-0.5">
                我具備 100 萬上下文與可調思維強度，專為處理多步驟長鏈工程排錯與自主決策所打造。
              </p>

              {/* Architectural Key Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs code-mono">
                <div className="p-3 bg-[#11131a] border border-white/5">
                  <div className="text-slate-400 text-[10px] uppercase">上下文長度</div>
                  <div className="text-white font-display text-base sm:text-lg font-bold">1M Tokens</div>
                </div>
                <div className="p-3 bg-[#11131a] border border-white/5">
                  <div className="text-slate-400 text-[10px] uppercase">AA 智力分數</div>
                  <div className="text-amber-400 font-display text-base sm:text-lg font-bold">31 分</div>
                </div>
                <div className="p-3 bg-[#11131a] border border-white/5">
                  <div className="text-slate-400 text-[10px] uppercase">輸出速率</div>
                  <div className="text-white font-display text-base sm:text-lg font-bold">137 t/s</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#thinking"
                  onClick={() => soundFx.playBurst()}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  <Sliders className="w-4 h-4" />
                  <span>體驗思維躍遷</span>
                </a>
                <a
                  href="#scale"
                  onClick={() => soundFx.playBlip(550)}
                  className="px-5 py-3 bg-[#151822] hover:bg-[#1e2230] text-slate-200 font-display font-bold text-xs tracking-wider uppercase border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>檢視尺度</span>
                  <ArrowDown className="w-4 h-4 text-amber-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Poster Bottom Architectural Blueprint Bar */}
          <div className="w-full flex flex-wrap items-center justify-between text-[11px] code-mono text-slate-400 pt-4 border-t border-white/10 gap-2">
            <span>MODEL_ID: GEMINI-3.8-FLASH</span>
            <span className="hidden sm:inline">INPUTS: TEXT / IMAGE / AUDIO / VIDEO / PDF</span>
            <span>TOKEN RATIO: 1,048,576 : 65,536</span>
          </div>
        </section>

        {/* CHAPTER 2: Scale Contrast (極端尺度對比) */}
        <section id="scale" className="scroll-mt-24 space-y-6" aria-labelledby="scale-title">
          <div className="space-y-3 border-b border-white/10 pb-4">
            <div className="text-xs uppercase tracking-widest code-mono text-amber-400 font-bold flex items-center gap-2">
              <span>CHAPTER 02</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-300">極端尺度對比</span>
            </div>
            <h2 id="scale-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              極端尺度：百萬記號吞吐與微觀單步神經元
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-medium">
              我能在單次對話中容納 100 萬記號的浩瀚知識，並在微秒間校準單個推理脈衝。
            </p>
            {/* Concise Chapter Body (<60 chars: 40 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl border-l-2 border-white/20 pl-3">
              極大視界能一次吞吐整座系統專案代碼，微觀視角則透過層層自審確保單步決策精密無誤。
            </p>
          </div>

          <ScaleVisualizer />
        </section>

        {/* CHAPTER 3: Core Interaction & Latency Crucible (三段思維檔位 · 視覺高潮) */}
        <section id="thinking" className="scroll-mt-24 space-y-6" aria-labelledby="thinking-title">
          <div className="space-y-3 border-b border-white/10 pb-4">
            <div className="text-xs uppercase tracking-widest code-mono text-amber-400 font-bold flex items-center gap-2">
              <span>CHAPTER 03</span>
              <span className="text-slate-400">/</span>
              <span className="text-amber-400 font-bold">核心互動 · 視覺高潮</span>
            </div>
            <h2 id="thinking-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              三段思維檔位：推理強度決定品質，也帶來漫長延遲
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-medium">
              訪客可直接切換 High、Medium 與 Low 三種思考檔位，親身體驗算力脈動與代價轉變。
            </p>
            {/* Concise Chapter Body (<60 chars: 43 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl border-l-2 border-amber-400 pl-3">
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
          <div className="space-y-3 border-b border-white/10 pb-4">
            <div className="text-xs uppercase tracking-widest code-mono text-amber-400 font-bold flex items-center gap-2">
              <span>CHAPTER 04</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-300">基準評測與競爭角逐</span>
            </div>
            <h2 id="benchmarks-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              基準表現：長鏈工具領先，但在端到端複雜代碼仍有瓶頸
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-medium">
              我在自動化工作流與即時終端執行位居前列，但面對高難度純邏輯代碼生成依然受限。
            </p>
            {/* Concise Chapter Body (<60 chars: 41 chars) */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl border-l-2 border-white/20 pl-3">
              我在 API 串接與工作流自動化表現強勁，但在缺乏執行反饋的複雜純代碼生成仍具侷限。
            </p>
          </div>

          <BenchmarkArena />
        </section>

        {/* CHAPTER 5: Complete Technical Dossier & Verification Tables */}
        <section id="dossier" className="scroll-mt-24 space-y-6" aria-labelledby="dossier-title">
          <div className="space-y-3 border-b border-white/10 pb-4">
            <div className="text-xs uppercase tracking-widest code-mono text-amber-400 font-bold flex items-center gap-2">
              <span>CHAPTER 05</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-300">技術檔案與驗證清單</span>
            </div>
            <h2 id="dossier-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              技術檔案與驗證清單：所有評測分數與官方數據來源
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-medium">
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
