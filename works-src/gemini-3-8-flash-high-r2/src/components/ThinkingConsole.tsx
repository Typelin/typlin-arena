import React, { useState } from 'react';
import { ThinkingLevel } from '../types';
import { ThinkingOscilloscope } from './ThinkingOscilloscope';
import { Activity, Clock, DollarSign, Cpu, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ThinkingConsoleProps {
  currentLevel: ThinkingLevel;
  onLevelChange: (level: ThinkingLevel) => void;
}

export const ThinkingConsole: React.FC<ThinkingConsoleProps> = ({ currentLevel, onLevelChange }) => {
  const [minimalError, setMinimalError] = useState(false);

  const handleMinimalClick = () => {
    soundFx.playBlip(220, 0.12);
    setMinimalError(true);
    setTimeout(() => {
      setMinimalError(false);
    }, 4500);
  };

  const handleSelectLevel = (level: ThinkingLevel) => {
    soundFx.playShift(level);
    onLevelChange(level);
  };

  const levelConfigs = {
    high: {
      name: 'High (高階深度推理)',
      badge: '當前模型設定',
      intelligenceScore: '31 分',
      ttft: '25.27 秒',
      ttftRatio: '100%',
      tokensPerTask: '99k tokens (推理 60k)',
      tokensRatio: '95%',
      costPerTask: '$7.77 / 任務',
      speed: '137 tokens/s',
      color: 'amber',
      accentColor: '#fbbf24',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      description: '深入展開長鏈驗證、多步工具排錯與深度審查，大幅提升複雜問題命中率。',
      tradeoff: '缺點：首次記號延遲達 25.27 秒，單次任務代價暴增至 $7.77 美元。',
    },
    medium: {
      name: 'Medium (官方預設均衡)',
      badge: 'API 預設檔位',
      intelligenceScore: '30 分',
      ttft: '~3.5 秒',
      ttftRatio: '20%',
      tokensPerTask: '82k tokens (推理 47k)',
      tokensRatio: '80%',
      costPerTask: '$6.26 / 任務',
      speed: '135 tokens/s',
      color: 'sky',
      accentColor: '#38bdf8',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      description: '兼顧推論質量與響應時間，適用於絕大多數企業自主代理與代碼檢索。',
      tradeoff: '特點：平衡檔位，單次任務依然消耗 82k 記號。',
    },
    low: {
      name: 'Low (極速輕量響應)',
      badge: '延遲優化檔位',
      intelligenceScore: '22 分',
      ttft: '~0.8 秒',
      ttftRatio: '8%',
      tokensPerTask: '~25k tokens',
      tokensRatio: '25%',
      costPerTask: '$0.24 / 任務',
      speed: '140 tokens/s',
      color: 'emerald',
      accentColor: '#10b981',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      description: '極速首字響應，大幅節省算力開銷，適合即時對話與一般摘要任務。',
      tradeoff: '特點：智力指數降至 22 分，無法支撐長鏈複雜工程邏輯。',
    },
  };

  const active = levelConfigs[currentLevel];

  return (
    <div className="w-full glass-card p-6 md:p-8 flex flex-col gap-6">
      {/* Console Header & Level Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-bold code-mono mb-1">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>核心互動：推理躍遷控制台 (Interactive Thinking Console)</span>
          </div>
          <div className="text-sm text-slate-300">
            請點擊切換檔位，觀察全域 3D 核心、示波器波形與任務成本的實時聯動：
          </div>
        </div>

        {/* Level Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {(['high', 'medium', 'low'] as ThinkingLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => handleSelectLevel(level)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider code-mono transition-all flex items-center gap-2 cursor-pointer ${
                currentLevel === level
                  ? level === 'high'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                    : level === 'medium'
                    ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25 scale-105'
                    : 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {currentLevel === level && <CheckCircle2 className="w-3.5 h-3.5" />}
              {level}
            </button>
          ))}

          {/* Minimal button (unsupported trigger) */}
          <button
            onClick={handleMinimalClick}
            className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider code-mono text-rose-400/80 hover:text-rose-300 bg-rose-950/20 border border-rose-500/30 hover:border-rose-400/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="點擊測試官方 minimal 檔位"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            minimal
          </button>
        </div>
      </div>

      {/* Error alert toast if minimal clicked */}
      {minimalError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs code-mono flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-rose-300 block mb-1">
              [API 規格驗證錯誤 / Unsupported Thinking Level]
            </span>
            Google 官方規範明訂：Gemini 3.8 Flash 不支援 <code className="text-white bg-rose-900/60 px-1 py-0.5 rounded">minimal</code> 檔位。若在 API 請求中傳入將返回驗證錯誤。模型強制要求至少以 low 等級運行基礎思考。
          </div>
        </div>
      )}

      {/* Dynamic Synaptic Reasoning Oscilloscope (Visual Climax) */}
      <ThinkingOscilloscope thinkingLevel={currentLevel} />

      {/* Active Tier Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Intelligence */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 code-mono mb-2">
            <span>AA 智力指數</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white code-mono">
            {active.intelligenceScore}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Intelligence Index v5.0.1
          </div>
        </div>

        {/* Metric 2: TTFT Latency */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 code-mono mb-2">
            <span>首字延遲 (TTFT)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 code-mono">
            {active.ttft}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: active.ttftRatio }}
            />
          </div>
        </div>

        {/* Metric 3: Output Tokens */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 code-mono mb-2">
            <span>任務輸出記號</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-300 code-mono truncate">
            {active.tokensPerTask}
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-500"
              style={{ width: active.tokensRatio }}
            />
          </div>
        </div>

        {/* Metric 4: Cost per Task */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 code-mono mb-2">
            <span>評測任務成本</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 code-mono">
            {active.costPerTask}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            每百萬輸出 $3.75 計費
          </div>
        </div>
      </div>

      {/* Description & Concrete Limitation callout */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${currentLevel === 'high' ? 'bg-amber-400' : currentLevel === 'medium' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
            {active.name}
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            {active.description}
          </div>
        </div>
        <div className="text-xs text-amber-300/90 font-medium code-mono bg-amber-950/30 border border-amber-500/20 px-3 py-2 rounded-lg shrink-0 max-w-sm">
          {active.tradeoff}
        </div>
      </div>
    </div>
  );
};
