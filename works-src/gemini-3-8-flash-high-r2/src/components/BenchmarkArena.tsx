import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, BarChart3, Compass } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MetricComparison {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  myScore: number;
  myLabel: string;
  competitors: {
    name: string;
    score: number;
    label: string;
  }[];
  certifiedNote: string;
  abilityBoundary: {
    canDo: string;
    cannotDo: string;
  };
}

interface DomainRadarPoint {
  axis: string;
  myScore: number;
  grokScore: number;
  sonnetScore: number;
}

export const BenchmarkArena: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'radar'>('benchmarks');
  const [activeMetricId, setActiveMetricId] = useState<string>('automation');

  const metrics: MetricComparison[] = [
    {
      id: 'automation',
      name: 'AutomationBench-AA (工具工作流)',
      category: 'SaaS 與 API 呼叫',
      description: '評測自主代理透過 REST API 工具執行複雜多步任務之完成率，防護欄違規直接零分。',
      unit: '%',
      myScore: 59.9,
      myLabel: '59.9%',
      competitors: [
        { name: 'Claude Sonnet 5.5 (med)', score: 40.5, label: '40.5%' },
        { name: 'Grok 4.7 (low)', score: 36.5, label: '36.5%' },
        { name: 'Gemini 4 Argon (high)', score: 78.0, label: '78.0% (旗艦引領)' },
      ],
      certifiedNote: 'Artificial Analysis Intelligence Index v5.0.1 實測數據',
      abilityBoundary: {
        canDo: '精準協調多端 API，在多層工具呼叫時嚴格依循 JSON Schema 結構約束。',
        cannotDo: '面對未定義在 Schema 內之隱性業務依賴時，難以主動推理隱含環境前提。',
      },
    },
    {
      id: 'terminal',
      name: 'Terminal-Bench 4.0 (終端工程執行)',
      category: 'Shell 與命令列運維',
      description: '在真實終端沙盒中執行依賴編譯、軟體包排錯與自動化腳本排障。',
      unit: '%',
      myScore: 19.7,
      myLabel: '19.7%',
      competitors: [
        { name: 'Grok 4.7 (low)', score: 10.1, label: '10.1%' },
        { name: 'Claude Sonnet 5.5 (med)', score: 2.5, label: '2.5%' },
        { name: 'Gemini 4 Argon (high)', score: 65.0, label: '65.0% (旗艦引領)' },
      ],
      certifiedNote: 'Artificial Analysis Intelligence Index v5.0.1 實測數據',
      abilityBoundary: {
        canDo: '能夠連續捕獲 stderr 報錯、精確執行 git 及 Linux 命令進行模組修復。',
        cannotDo: '面對深層底層 C 庫編譯或跨架構核心崩潰時，容易陷入重複嘗試的循環。',
      },
    },
    {
      id: 'frontiercode',
      name: 'FrontierCode 2.0 (專案級程式碼生成)',
      category: '真實專案工程重構',
      description: 'Cognition 獨立建構之私有難題庫，檢驗無公開洩漏下真實代碼重構實力。',
      unit: '%',
      myScore: 18.7,
      myLabel: '18.7%',
      competitors: [
        { name: 'Claude Sonnet 5.5 (med)', score: 12.8, label: '12.8%' },
        { name: 'Grok 4.7 (low)', score: 8.1, label: '8.1%' },
        { name: 'Claude Opus 5.5 (max)', score: 46.0, label: '46.0% (前沿標竿)' },
      ],
      certifiedNote: 'Artificial Analysis Intelligence Index v5.0.1 實測數據',
      abilityBoundary: {
        canDo: '能自主完成 5-10 個檔案的連帶型態修復、React 元件重構與 API 介面串聯。',
        cannotDo: '在缺乏執行測試反饋的單次通過（pass@1）場景下，難以完成演算法級超架構改寫。',
      },
    },
    {
      id: 'speed',
      name: 'Output Speed (輸出吞吐速度)',
      category: '記號生成速率',
      description: '衡量模型啟動輸出後的純文字吐字頻率（tokens 每秒）。',
      unit: ' t/s',
      myScore: 137,
      myLabel: '137 t/s',
      competitors: [
        { name: 'Claude Sonnet 5.5 (med)', score: 97, label: '97 t/s' },
        { name: 'Gemini 4 Argon (high)', score: 82, label: '82 t/s' },
        { name: 'Grok 4.7 (low)', score: 60, label: '60 t/s' },
      ],
      certifiedNote: 'Artificial Analysis Intelligence Index v5.0.1 官方 API 實測值',
      abilityBoundary: {
        canDo: '在長文本與程式碼區塊生成時保持 137 t/s 的高頻率文字流輸出。',
        cannotDo: '雖然生成速度極快，但在 high 檔位下必須先等待 25.27 秒的思考前置期。',
      },
    },
  ];

  // Authentic Domain Index Points from Artificial Analysis
  const domainRadar: DomainRadarPoint[] = [
    { axis: '財務與會計 (Finance)', myScore: 42, grokScore: 34, sonnetScore: 36 },
    { axis: '策略營運 (Strategy)', myScore: 47, grokScore: 35, sonnetScore: 38 },
    { axis: '法律合規 (Legal)', myScore: 42, grokScore: 33, sonnetScore: 34 },
    { axis: '醫療健康 (Medical)', myScore: 38, grokScore: 31, sonnetScore: 32 },
    { axis: '尖端工程 (Engineering)', myScore: 38, grokScore: 31, sonnetScore: 33 },
    { axis: '總體經濟 (Economics)', myScore: 41, grokScore: 34, sonnetScore: 35 },
  ];

  const activeMetric = metrics.find((m) => m.id === activeMetricId) || metrics[0];
  const maxScore = Math.max(activeMetric.myScore, ...activeMetric.competitors.map((c) => c.score));

  // Helper for Polygon coordinates in 280x280 SVG radar
  const getRadarPoint = (index: number, score: number, max = 50, center = 140, radius = 100) => {
    const angle = (index / domainRadar.length) * Math.PI * 2 - Math.PI / 2;
    const r = (score / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const myPolygonPoints = domainRadar.map((p, i) => getRadarPoint(i, p.myScore)).join(' ');
  const grokPolygonPoints = domainRadar.map((p, i) => getRadarPoint(i, p.grokScore)).join(' ');
  const sonnetPolygonPoints = domainRadar.map((p, i) => getRadarPoint(i, p.sonnetScore)).join(' ');

  return (
    <div className="w-full glass-card p-6 md:p-8 flex flex-col gap-6">
      {/* Header & Sub-view Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-bold code-mono mb-1">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>基準成績動態對比 / Benchmark Comparison Arena</span>
          </div>
          <div className="text-sm text-slate-300">
            以圖形化尺度呈現與相鄰排名及旗艦對手之實測差距：
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('benchmarks');
              soundFx.playBlip(520);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            基準條形指標
          </button>
          <button
            onClick={() => {
              setActiveTab('radar');
              soundFx.playBlip(680);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>專業領域雷達</span>
          </button>
        </div>
      </div>

      {activeTab === 'benchmarks' ? (
        <>
          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMetricId(m.id);
                  soundFx.playBlip(620);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold code-mono transition-all cursor-pointer ${
                  activeMetricId === m.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Description HUD */}
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-center justify-between">
            <span>{activeMetric.description}</span>
            <span className="text-slate-400 code-mono shrink-0 ml-4 hidden sm:inline">
              出處：{activeMetric.certifiedNote}
            </span>
          </div>

          {/* Visual Chart Bars */}
          <div className="space-y-4 py-2">
            {/* Gemini 3.8 Flash (High) - Target Model */}
            <div className="space-y-1.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent border border-amber-500/30">
              <div className="flex items-center justify-between text-xs code-mono">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  Gemini 3.8 Flash (high) [本模型]
                </span>
                <span className="font-bold text-amber-300 text-sm">{activeMetric.myLabel}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-sky-400 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.max(6, (activeMetric.myScore / maxScore) * 100)}%` }}
                />
              </div>
            </div>

            {/* Competitor Bars */}
            {activeMetric.competitors.map((comp, idx) => (
              <div key={idx} className="space-y-1.5 px-3 py-2 rounded-xl bg-slate-900/30 border border-white/5">
                <div className="flex items-center justify-between text-xs code-mono">
                  <span className="text-slate-300">{comp.name}</span>
                  <span className="text-slate-200 font-bold">{comp.label}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-slate-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(4, (comp.score / maxScore) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Disentangled Abilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 code-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>【實測佐證】具體做得到能力</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeMetric.abilityBoundary.canDo}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 code-mono">
                <AlertCircle className="w-4 h-4" />
                <span>【真實邊界】具體做不到或受限處</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeMetric.abilityBoundary.cannotDo}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Radar Chart Sub-view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-2">
          {/* Left: SVG Hexagonal Radar */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 280 280" className="w-full max-w-[320px] h-auto overflow-visible">
              {/* Background Concentric Webs */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => (
                <polygon
                  key={idx}
                  points={domainRadar.map((_, i) => getRadarPoint(i, level * 50)).join(' ')}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
              ))}

              {/* Spoke Axes */}
              {domainRadar.map((_, i) => {
                const angle = (i / domainRadar.length) * Math.PI * 2 - Math.PI / 2;
                const x2 = 140 + 100 * Math.cos(angle);
                const y2 = 140 + 100 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1="140"
                    y1="140"
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Competitor Grok Polygon */}
              <polygon
                points={grokPolygonPoints}
                fill="rgba(100, 116, 139, 0.2)"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Competitor Sonnet Polygon */}
              <polygon
                points={sonnetPolygonPoints}
                fill="rgba(168, 85, 247, 0.15)"
                stroke="#a855f7"
                strokeWidth="1.5"
              />

              {/* Gemini 3.8 Flash (High) Target Polygon */}
              <polygon
                points={myPolygonPoints}
                fill="rgba(224, 159, 62, 0.35)"
                stroke="#fbbf24"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              />

              {/* Vertex Nodes */}
              {domainRadar.map((p, i) => {
                const [x, y] = getRadarPoint(i, p.myScore).split(',').map(Number);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            <div className="flex items-center gap-4 text-xs code-mono mt-4">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Gemini 3.8 Flash
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                Sonnet 5.5
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Grok 4.7
              </span>
            </div>
          </div>

          {/* Right: Certified Sub-Index Points Breakdown */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider code-mono mb-2">
              Artificial Analysis 官方領域評估分
            </div>
            {domainRadar.map((p, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs code-mono"
              >
                <span className="text-slate-300">{p.axis}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-300 text-sm">{p.myScore} 分</span>
                  <span className="text-slate-400 text-[11px]">(Grok: {p.grokScore})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
