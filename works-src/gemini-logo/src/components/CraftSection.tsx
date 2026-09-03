import React, { useState } from 'react';
import { Terminal, Shield, Box, Sparkles, Binary, CheckCircle2, Copy, Check } from 'lucide-react';
import { sound } from '../lib/sound';

export const CraftSection: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const capabilities = [
    {
      id: 'frontend',
      name: '沉浸式全域前端',
      tag: 'Frontend Architecture',
      summary: '超低时延、极致流畅的微交互界面，融合 WebGL / Canvas / WebAudio 的感官体验。',
      techs: ['Vite / Next.js', 'React 19 / TypeScript', 'Tailwind CSS / PostCSS', 'Canvas 2D / Three.js', 'Web Audio API'],
      manifest: `// 咲梦前端工程基准 · 极致感官渲染管线
export const createSakuraViewport = (target: HTMLElement) => {
  return new HighPrecisionRenderer({
    antiAlias: true,
    alpha: true,
    colorSpace: 'display-p3',
    adaptiveFPS: true,
    onFrame: (metrics) => telemetry.audit(metrics.fcp)
  });
};`
    },
    {
      id: 'backend',
      name: '微内核高并发后端',
      tag: 'Distributed Backend',
      summary: '以 Rust / Go / Node 构建高韧性、低内存足迹的服务中枢与实时流式 WebSocket 网关。',
      techs: ['Rust (Actix/Axum)', 'Go 1.23+ microservices', 'PostgreSQL / TimescaleDB', 'Redis Cluster', 'Kafka / NATS'],
      manifest: `// 高并发分布式流式调度引擎
pub async fn dispatch_dream_pipeline(req: StreamRequest) -> Result<Response, StudioError> {
    let worker_pool = Arc::clone(&WORKER_REGISTRY);
    worker_pool.process_stream(req.into_stream())
        .instrument(tracing::info_span!("sakimu_trace"))
        .await
}`
    },
    {
      id: 'ai',
      name: '自主智能体与算法工程',
      tag: 'Generative Intelligence',
      summary: '私有化大模型微调、RAG 向量检索图谱与跨模态具身智能交互代理系统。',
      techs: ['Qwen / DeepSeek-V3 微调', 'FastAPI / vLLM', 'LangChain / AutoGen', 'Qdrant / Milvus', 'PyTorch / TensorRT'],
      manifest: `class DreamAgent(BaseWorkflowAgent):
    """自省式推理与记忆强化智能体"""
    def __init__(self, model_endpoint: str):
        self.context_memory = SlidingVectorMemory(window=32)
        self.verifier = StrictDeterministicChecker()
        
    async def run_cot(self, prompt: str) -> VerifiedOutput:
        reasoning_trace = await self.expand_tree(prompt)
        return self.verifier.synthesize(reasoning_trace)`
    }
  ];

  const handleCopy = () => {
    sound.playDrop('high');
    navigator.clipboard.writeText(capabilities[selectedDomain].manifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="craft" className="py-24 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef1ff] text-[#3e4c84] text-xs font-mono font-semibold">
            <Binary className="w-3.5 h-3.5 text-[#506194]" />
            <span>现代工程阵列 · Fullstack & AI Arsenal</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1e32]">
            精雕细琢的现代软件工程全栈
          </h2>
          <p className="text-sm sm:text-base text-[#59648c]">
            从像素级前端微交互，到底层分布式内核架构，我们只选用经过业界验证的现代技术栈。
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1.5 rounded-2xl bg-white/80 border border-[#3e4c84]/15 shadow-sm">
          {capabilities.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                sound.playDrop('mid');
                setSelectedDomain(i);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all ${
                selectedDomain === i
                  ? 'bg-gradient-to-r from-[#3e4c84] to-[#2d3864] text-white shadow-sm'
                  : 'text-[#5d688f] hover:text-[#1a1e32]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Specification Column */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-white/85 border border-[#3e4c84]/12 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#e85383] font-bold uppercase tracking-wider">
                Domain Specification
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#fde8ef] text-[#d0386c] font-mono">
                {capabilities[selectedDomain].tag}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#1f253d]">
              {capabilities[selectedDomain].name}
            </h3>

            <p className="text-sm text-[#556087] leading-relaxed">
              {capabilities[selectedDomain].summary}
            </p>

            {/* Tech chips */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-medium text-[#737da2]">标准装备组件:</span>
              <div className="flex flex-wrap gap-2">
                {capabilities[selectedDomain].techs.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#f4f6fc] text-[#3e4c84] border border-[#3e4c84]/10 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#3e4c84]/10 flex items-center gap-3 text-xs text-[#48537c]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>支持全自动化 CI/CD 测试流水线与严密安全白盒审计。</span>
          </div>
        </div>

        {/* Right Code Terminal Column */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0e111d] text-slate-200 border border-slate-800 shadow-2xl p-6 flex flex-col justify-between font-mono relative overflow-hidden group">
          {/* Subtle Sakura Ambient Glow in Terminal */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-[#e85383]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Terminal Window Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 ml-2">sakimu-core/{capabilities[selectedDomain].id}.ts</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制规范'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="py-6 overflow-x-auto text-xs leading-relaxed text-slate-300">
            <pre className="font-mono">{capabilities[selectedDomain].manifest}</pre>
          </div>

          {/* Terminal Footer Status */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pipeline: PASS (0 lint warnings, 100% tests)</span>
            </div>
            <span className="text-[#8b97c6]">V8/Turbofan Optimized</span>
          </div>
        </div>
      </div>
    </section>
  );
};
