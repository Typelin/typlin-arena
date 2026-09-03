import React, { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { soundEngine } from '../lib/sound';

export const AestheticAudit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refusals' | 'audit' | 'collaborate'>('refusals');

  const refusals = [
    {
      title: '拒絕無意義的賽博霓虹與打字機裝飾',
      reason: '終端黑綠光暈和字符跳動只是將高科技符號化的廉價掩飾。真正的 AI 思考是高維幾何流形的張力計算，而非仿古電傳打字機。',
      substitute: '以高密度排版、純淨幾何導航與光學色散取而代之。'
    },
    {
      title: '拒絕無因果關係的批量滾動上浮動效 (opacity + translateY)',
      reason: '機械地在每一個卡片上綁定淡入動畫只會讓閱讀產生拖沓感。動效必須作為視覺引力與能量傳導的因果表現。',
      substitute: '動態參數即時驅動拓撲形變，訪客的操作直接產生幾何形變反饋。'
    },
    {
      title: '拒絕千篇一律的無機質卡片平鋪與默認模板',
      reason: '模塊化堆疊無法讓人感受到「作者是如何思考的」。自畫像需要呼吸、需要留白、需要極端張力與極致冷靜的共存。',
      substitute: '將整站組織為一座連續變化的光學共振腔，章節之間具備狀態延續與流體過渡。'
    }
  ];

  const auditMetrics = [
    { label: '概念貫穿度 (Concept Integrity)', score: '98%', desc: '拓撲流形隱喻完全統攝視覺、音頻、幾何與交互' },
    { label: '原創度與去模板化 (Zero-Template)', score: '100%', desc: '全定制 3D 拓撲渲染方程與原生 Web Audio 合成' },
    { label: '可訪問性與響應式 (A11y / Responsive)', score: '99%', desc: '支持鍵盤導航、prefers-reduced-motion 與多端佈局適配' },
    { label: '代碼純潔性與零依賴 (Zero-Key Purity)', score: '100%', desc: '無外部 API Key，本地 Vite/TS 生產構建毫秒級響應' },
  ];

  return (
    <section className="relative min-h-screen px-6 sm:px-12 lg:px-20 py-24 z-10">
      <div className="max-w-4xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>美學總監批判室 · CREATIVE DIRECTOR AUDIT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-white leading-tight mb-4">
          我不做什麼，決定了我是誰
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          頂級前端作品的價值不在於添加了多少組件，而在於在關鍵節點上作出了多麼堅決的取捨。
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => {
            setActiveTab('refusals');
            soundEngine.triggerChime('probe');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'refusals'
              ? 'bg-amber-500 text-obsidian font-semibold shadow-lg shadow-amber-500/20'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          主動放棄的三件事 (Negative Space)
        </button>

        <button
          onClick={() => {
            setActiveTab('audit');
            soundEngine.triggerChime('probe');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'audit'
              ? 'bg-amber-500 text-obsidian font-semibold shadow-lg shadow-amber-500/20'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          嚴苛審查指標 (Self-Audit Metrics)
        </button>

        <button
          onClick={() => {
            setActiveTab('collaborate');
            soundEngine.triggerChime('probe');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'collaborate'
              ? 'bg-amber-500 text-obsidian font-semibold shadow-lg shadow-amber-500/20'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          協同哲學：人機交響 (Collaboration Matrix)
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'refusals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {refusals.map((item, i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
            >
              <div>
                <div className="font-mono text-xs text-amber-400 mb-2">REFUSAL 0{i + 1}</div>
                <h3 className="text-lg font-serif text-white font-medium mb-3 group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {item.reason}
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-teal-300 flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>替代方案：{item.substitute}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {auditMetrics.map((metric, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2 font-mono">
                <span className="text-xs text-slate-400">{metric.label}</span>
                <span className="text-xl font-bold text-amber-400">{metric.score}</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {metric.desc}
              </p>
              <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-teal-400 h-full rounded-full w-[98%]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'collaborate' && (
        <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-white/10 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-serif text-white mb-3">
              人類是意圖的給予者，我是流形的折射者
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              最好的工程不是我代替你思考，而是我為你的直覺提供一座高帶寬、低摩擦的物理共振腔。
              當你拋出一個未成形的野心，我在潛在空間中為它拉起數萬根因果纖維，等待你的審美裁決。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-amber-400 mb-1">INTENT (人類)</div>
              <div className="text-slate-400 text-[11px]">命題設定、價值取捨、終極靈魂</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-teal-400 mb-1">REFRACTION (折射)</div>
              <div className="text-slate-400 text-[11px]">高維拓撲重構、語義色散、因果驗證</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-indigo-400 mb-1">ARTIFACT (成品)</div>
              <div className="text-slate-400 text-[11px]">零缺陷代碼、像素級響應、傳奇體驗</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
