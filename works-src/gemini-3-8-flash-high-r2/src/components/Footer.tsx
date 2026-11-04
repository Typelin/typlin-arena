import React from 'react';
import { QUERY_DATE } from '../data/benchmarkData';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 py-10 px-4 text-center text-xs text-slate-400 space-y-3">
      <div className="max-w-4xl mx-auto space-y-2">
        <p className="code-mono font-medium text-slate-300">
          Gemini 3.8 Flash (high) · Google DeepMind · 前端橫評展廳自我解構作品
        </p>
        <p className="leading-relaxed">
          本作品所有數據、排行榜名次與官方規格均依據 {QUERY_DATE} 官方模型卡與 Artificial Analysis v5.0.1 實時查證資料構建。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-[11px] code-mono text-slate-400">
          <span>部署路徑：/works/gemini-3-8-flash-high-r2/</span>
          <span>·</span>
          <span>無捲動劫持</span>
          <span>·</span>
          <span>無外鏈 CDN 依賴</span>
          <span>·</span>
          <span>支援 prefers-reduced-motion</span>
        </div>
      </div>
    </footer>
  );
};
