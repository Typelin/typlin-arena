import React from 'react';
import {
  QUERY_DATE,
  OFFICIAL_SPECS,
  AA_BENCHMARKS,
  OFFICIAL_EVALS,
  COMPETITORS_TABLE,
  DATA_SOURCES,
} from '../data/benchmarkData';
import { Database, Award, GitCompare, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

export const DossierSection: React.FC = () => {
  return (
    <div className="w-full space-y-12">
      {/* Table 1: Model Specifications & Technical Card */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>官方模型規格與架構參數</span>
          </div>
          <div className="text-xs text-slate-400 code-mono">
            資料來源：Google AI Docs / DeepMind Model Card（查詢日期：{QUERY_DATE}）
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">正式模型名稱</span>
            <p className="text-white font-bold">{OFFICIAL_SPECS.modelName}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">API 端點代碼</span>
            <p className="text-sky-300 font-mono font-bold">{OFFICIAL_SPECS.apiModelId}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">開發者 / 機構</span>
            <p className="text-white font-bold">{OFFICIAL_SPECS.developer}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">公開發布時間 / 狀態</span>
            <p className="text-white font-bold">{OFFICIAL_SPECS.releaseDate}（{OFFICIAL_SPECS.status}）</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">底層架構 / 參數量</span>
            <p className="text-white">
              {OFFICIAL_SPECS.architecture} / 參數規模：<span className="text-amber-300 font-semibold">{OFFICIAL_SPECS.parameterScale}</span>
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">上下文輸入限制</span>
            <p className="text-white font-mono">{OFFICIAL_SPECS.contextWindow}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">單次最大輸出限制</span>
            <p className="text-white font-mono">{OFFICIAL_SPECS.maxOutputTokens}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">支援輸入模態</span>
            <p className="text-white">{OFFICIAL_SPECS.inputModalities.join('、')}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">支援輸出模態</span>
            <p className="text-white">{OFFICIAL_SPECS.outputModalities.join('、')}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-1">
            <span className="text-rose-400 font-medium code-mono">不支持項目 (Limitations)</span>
            <p className="text-rose-200">{OFFICIAL_SPECS.unsupportedOutputs.join('；')}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">推理檔位支援 (Thinking Level)</span>
            <p className="text-white">支援 low, medium, high。<span className="text-rose-300 font-medium">{OFFICIAL_SPECS.minimalSupport}</span></p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">定價與快取優惠</span>
            <p className="text-white">輸入 {OFFICIAL_SPECS.pricingInput}；輸出 {OFFICIAL_SPECS.pricingOutput}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">開源權重狀態</span>
            <p className="text-white font-medium">{OFFICIAL_SPECS.weightsStatus}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400 font-medium code-mono">訓練知識截止時間</span>
            <p className="text-white">{OFFICIAL_SPECS.knowledgeCutoff}</p>
          </div>
        </div>
      </div>

      {/* Table 2: Benchmark Scores (Artificial Analysis & Official) */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Artificial Analysis 基準成績表（版本、推理強度與實測分數）</span>
          </div>
          <div className="text-xs text-amber-300 code-mono">
            收錄版本：Gemini 3.8 Flash (High) | 查詢日期：{QUERY_DATE}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 code-mono uppercase">
                <th className="py-3 px-3">評測項目 (Benchmark)</th>
                <th className="py-3 px-3">版本號</th>
                <th className="py-3 px-3">領域類別</th>
                <th className="py-3 px-3 text-amber-300">收錄成績 (High)</th>
                <th className="py-3 px-3">評測目標與驗證規範</th>
                <th className="py-3 px-3">檢驗來源</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {AA_BENCHMARKS.map((b, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-bold text-white code-mono">{b.benchmark}</td>
                  <td className="py-3 px-3 text-slate-400 code-mono">{b.version}</td>
                  <td className="py-3 px-3 text-slate-300">{b.category}</td>
                  <td className="py-3 px-3 font-bold text-amber-300 code-mono text-sm">{b.score}</td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">{b.description}</td>
                  <td className="py-3 px-3 text-slate-400 code-mono">{b.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Self-Published Evals */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 code-mono">
            官方模型公告公布項目 (由 Google DeepMind 評測)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OFFICIAL_EVALS.map((e, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                <div className="text-xs text-sky-400 font-bold code-mono">{e.name}</div>
                <div className="text-base font-bold text-white code-mono">{e.score}</div>
                <div className="text-[11px] text-slate-400">{e.note}</div>
                <div className="text-[10px] text-slate-400 code-mono pt-1">測評者：{e.evaluator}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table 3: Competitor Comparison (Strict Published Numbers Only) */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <GitCompare className="w-5 h-5 text-purple-400" />
            <span>相鄰排名模型與同開發者旗艦比較表</span>
          </div>
          <div className="text-xs text-purple-300 code-mono">
            資料來源：Artificial Analysis LLM Leaderboard（查詢日期：{QUERY_DATE}）
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          取 Artificial Analysis 智力排行榜上緊鄰前一名 Grok 4.7 (low)、緊鄰後一名 Claude Sonnet 5.5 (medium with fallback)，以及 Google 同廠旗艦 Gemini 4 Argon (high) 進行嚴格公開數據對照。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 code-mono uppercase">
                <th className="py-3 px-3">對比模型名稱</th>
                <th className="py-3 px-3">開發者</th>
                <th className="py-3 px-3">智力指數 (v5.0.1)</th>
                <th className="py-3 px-3">單次任務成本</th>
                <th className="py-3 px-3">輸出速度</th>
                <th className="py-3 px-3">首字延遲 (TTFT)</th>
                <th className="py-3 px-3">上下文長度</th>
                <th className="py-3 px-3">開放權重 (Weights)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPETITORS_TABLE.map((comp, idx) => {
                const isSelf = comp.model.includes('Gemini 3.8 Flash');
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelf ? 'bg-amber-500/10 font-medium' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className={`py-3 px-3 code-mono font-bold ${isSelf ? 'text-amber-300' : 'text-white'}`}>
                      {comp.model}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{comp.creator}</td>
                    <td className={`py-3 px-3 font-bold code-mono ${isSelf ? 'text-amber-300' : 'text-white'}`}>
                      {comp.intelligenceIndex}
                    </td>
                    <td className="py-3 px-3 code-mono text-slate-300">{comp.costPerTask}</td>
                    <td className="py-3 px-3 code-mono text-slate-300">{comp.outputSpeed}</td>
                    <td className="py-3 px-3 code-mono text-slate-300">{comp.ttft}</td>
                    <td className="py-3 px-3 code-mono text-slate-300">{comp.contextWindow}</td>
                    <td className="py-3 px-3 text-slate-300">{comp.openWeights}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Limitations & Tradeoffs Callout */}
      <div className="glass-card p-6 md:p-8 space-y-4 border-rose-500/30 bg-rose-950/10">
        <div className="flex items-center gap-2 text-base font-bold text-rose-300">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>查證限制與不擅長領域（真實瓶頸歸納）</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1 p-3 rounded-lg bg-slate-950/40 border border-rose-500/20">
            <span className="font-bold text-rose-300 block">1. 高推理檔位下的延遲與記號成本暴增</span>
            <p>
              在 High 推理強度下，平均任務產出記號高達 99,000（其中思維記號佔 60,000），導致首字延遲長達 25.27 秒，單次任務基準成本飆升至 $7.77 美元（同級 Flash 競品通常低於 $0.50）。
            </p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-slate-950/40 border border-rose-500/20">
            <span className="font-bold text-rose-300 block">2. 不支援 minimal 零推理純直覺輸出</span>
            <p>
              Gemini 3.8 Flash 強制要求最少需運行 low 思考層次，API 明確封鎖 minimal 參數並返回 ValidationError，無法做無思考延遲的純直覺輸出。
            </p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-slate-950/40 border border-rose-500/20">
            <span className="font-bold text-rose-300 block">3. 專案級程式碼生成（FrontierCode）存在天花板</span>
            <p>
              在無執行沙盒即時測試反饋的真實專案重構（FrontierCode 2.0）僅取得 18.7%，終端排錯（Terminal-Bench 4.0）為 19.7%，顯著落後於 Claude Opus 5.5 (46.0%) 與同廠旗艦 Gemini 4 Argon (65.0%)。
            </p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-slate-950/40 border border-rose-500/20">
            <span className="font-bold text-rose-300 block">4. 權重閉源與輸出僅限純文字</span>
            <p>
              權重為官方商業閉源（官方未公開），無法私有化離線部署；輸入支援圖音視多模態，但輸出僅支援純文字（不支持圖像與音訊生成，Live 雙向 API 亦未開放）。
            </p>
          </div>
        </div>
      </div>

      {/* Sources / References */}
      <div className="glass-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-white">
          <Database className="w-5 h-5 text-sky-400" />
          <span>資料來源與文獻出處清單</span>
        </div>
        <p className="text-xs text-slate-400">
          全頁所有數據、參數、版本規範與比較表均遵循 2026 年 11 月 4 日官方文檔與第三方權威評測收錄結果：
        </p>

        <div className="space-y-3">
          {DATA_SOURCES.map((source, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-sky-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-sky-300 flex items-center gap-1.5">
                  <span className="text-slate-400 font-mono">[{index + 1}]</span>
                  <span>{source.title}</span>
                </div>
                <div className="text-slate-400">{source.description}</div>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-950/40 text-sky-400 hover:text-white border border-sky-500/20 hover:border-sky-400/50 code-mono shrink-0 transition-colors"
              >
                <span>官方連結</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
