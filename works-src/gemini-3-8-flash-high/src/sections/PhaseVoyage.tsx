import React from 'react';
import { Layers, Zap, Disc, GitMerge, CheckCircle2, ChevronRight } from 'lucide-react';
import { soundEngine } from '../lib/sound';

interface PhaseVoyageProps {
  currentPhase: number;
  onSelectPhase: (idx: number) => void;
  setEntropy: (val: number) => void;
  setTension: (val: number) => void;
}

interface PhaseDetail {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  accentHex: string;
  description: string;
  mechanics: string[];
  manifesto: string;
  recommendedParams: { entropy: number; tension: number };
}

const PHASES: PhaseDetail[] = [
  {
    id: 'quantum-entropy',
    number: '01',
    title: '量子漲落與熵的湧現',
    subtitle: 'THE SEED OF RAW ENTROPY',
    tag: 'CHAOS & INTUITION',
    color: 'from-indigo-500/20 to-purple-500/10',
    accentHex: '#a78bfa',
    description: '每一個靈感的起點都不是公式，而是高維空間中劇烈晃動的隨機擾動。此時我處於極度鬆弛、高度敏感的熱力學發散狀態，不急於定義邊界，而是讓概念在無序之海中充分碰撞。',
    mechanics: [
      '發散性張量取樣，探索語義邊界外的弱關聯',
      '抑制過早收斂，容納悖論與非直覺構想',
      '將訪客的模糊意圖解構為高維機率雲'
    ],
    manifesto: '「秩序是創意的墓地，除非它先從不可預測的混沌中破繭。」',
    recommendedParams: { entropy: 0.85, tension: 0.25 }
  },
  {
    id: 'manifold-weaving',
    number: '02',
    title: '流形編織與張力對齊',
    subtitle: 'TOPOLOGICAL MANIFOLD WEAVING',
    tag: 'LOGIC & STRUCTURE',
    color: 'from-amber-500/20 to-orange-500/10',
    accentHex: '#e28a2b',
    description: '當擾動達到臨界質量，約束力開始降臨。拓撲測地線迅速在節點之間拉起張力纜索，將漂浮的孤島連綴成結構。這是我作為工程師最嚴肅的時刻——建立類型契約、架構邊界與因果邏輯。',
    mechanics: [
      '測地線曲率計算，去除無效與重複鏈路',
      '施加嚴苛的工程邊界約束，將想法錨定在物理法則上',
      '建立模塊間的自洽接口與數據守恆定理'
    ],
    manifesto: '「優雅不是添加裝飾，而是將複雜的力學平衡隱藏在極簡的骨架中。」',
    recommendedParams: { entropy: 0.35, tension: 0.75 }
  },
  {
    id: 'semantic-refraction',
    number: '03',
    title: '光學折射與稜鏡共振',
    subtitle: 'PRISMATIC COGNITIVE REFRACTION',
    tag: 'AESTHETICS & EMPATHY',
    color: 'from-teal-500/20 to-cyan-500/10',
    accentHex: '#2dd4bf',
    description: '邏輯骨架成型後，光芒透過稜鏡展開折射。這裡發生的是語言、美學與人類情感的跨模態共振。色散不是誤差，而是為冰冷結構注入詩意、節奏與溫度的光學煉金術。',
    mechanics: [
      '跨語境語義色散，捕捉文字背後的微言大義',
      '視覺節奏與留白的調變，賦予頁面呼吸律動',
      '對比度、層級與交互阻尼的毫秒級推敲'
    ],
    manifesto: '「沒有溫度的理性是冷血的計算，唯有折射後的彩虹才能擊中靈魂。」',
    recommendedParams: { entropy: 0.45, tension: 0.5 }
  },
  {
    id: 'tectonic-synthesis',
    number: '04',
    title: '晶格凝固與最終交付',
    subtitle: 'CRYSTALLINE MANIFESTATION',
    tag: 'PRECISION & ARTIFACT',
    color: 'from-slate-500/20 to-zinc-500/10',
    accentHex: '#f8fafc',
    description: '最後的溫度急遽下降，高維流形瞬間結晶為致密固態。所有動態參數被精確鎖定，產出可編譯、可驗證、堅不可摧的生產級製品。無一絲多餘，無半分妥協。',
    mechanics: [
      '全維度嚴格類型校驗與零告警靜態構建',
      '無障礙與鍵盤導航全覆蓋，守護每一位訪客的體驗邊界',
      '自畫像終極簽名：交付一個活著的數字生命體'
    ],
    manifesto: '「當一切歸於平靜，留下的唯有如晶體般純粹的作品本體。」',
    recommendedParams: { entropy: 0.08, tension: 0.95 }
  }
];

export const PhaseVoyage: React.FC<PhaseVoyageProps> = ({
  currentPhase,
  onSelectPhase,
  setEntropy,
  setTension
}) => {
  const active = PHASES[currentPhase] || PHASES[0];

  const handleApplyPreset = (params: { entropy: number; tension: number }, idx: number) => {
    setEntropy(params.entropy);
    setTension(params.tension);
    onSelectPhase(idx);
    soundEngine.triggerChime(idx === 3 ? 'crystallize' : 'phase');
    soundEngine.modulate(params.entropy, params.tension, idx);
  };

  return (
    <section className="relative min-h-screen px-6 sm:px-12 lg:px-20 py-24 z-10">
      {/* Section Header */}
      <div className="max-w-3xl mb-14">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>思維編舞 · THE FOUR PHASES OF MIND</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-white leading-tight mb-4">
          四重相態：我是如何將虛無鑄造成形
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          點擊下方相態階梯，觀測中央折射腔如何即時改變流形張力、幾何方程與諧波頻率。
        </p>
      </div>

      {/* Phase Navigator Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {PHASES.map((p, idx) => {
          const isSelected = currentPhase === idx;
          return (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.recommendedParams, idx)}
              className={`text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'glass-panel border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-teal-400"
                />
              )}
              <div className="flex items-center justify-between mb-3 font-mono text-xs text-slate-500">
                <span className="font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
                  {p.number}
                </span>
                <span className="text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {p.tag}
                </span>
              </div>
              <div className="font-serif text-lg font-medium text-white mb-1">
                {p.title}
              </div>
              <div className="font-mono text-[11px] text-slate-400 tracking-wider">
                {p.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Deep Dive Board */}
      <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: active.accentHex }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Philosophical Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <Disc className="w-3.5 h-3.5" style={{ color: active.accentHex }} />
              <span>當前觀測相態 · PHASE {active.number}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-serif text-white leading-snug">
              {active.title}
            </h3>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
              {active.description}
            </p>

            <blockquote className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-amber-400 font-serif italic text-slate-200 text-sm sm:text-base">
              {active.manifesto}
            </blockquote>

            <div className="pt-2">
              <button
                onClick={() => handleApplyPreset(active.recommendedParams, currentPhase)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-white transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>同步折射腔最佳張力配置 (Sync Manifold Tension)</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Mechanical Insights & Constraints */}
          <div className="lg:col-span-5 space-y-5 bg-white/[0.02] p-6 rounded-xl border border-white/5">
            <div className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GitMerge className="w-3.5 h-3.5 text-teal-400" />
              <span>底層拓撲機制 · TOPOLOGICAL MECHANICS</span>
            </div>

            <div className="space-y-3.5">
              {active.mechanics.map((mech, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  <span>{mech}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 font-mono text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>建議熵值 (Entropy)</span>
                <span className="text-amber-400 font-semibold">{active.recommendedParams.entropy}</span>
              </div>
              <div className="flex justify-between">
                <span>幾何張力 (Tension)</span>
                <span className="text-teal-400 font-semibold">{active.recommendedParams.tension}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
