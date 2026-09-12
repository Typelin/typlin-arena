import React, { useState } from 'react';
import { ExternalLink, Github, Eye, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { sound } from '../lib/sound';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  metrics: string;
  description: string;
  color: string;
}

export const PortfolioSection: React.FC = () => {
  const [activeProject, setActiveProject] = useState<number>(0);

  const projects: Project[] = [
    {
      id: 'sakura-matrix',
      title: 'SakuraMatrix · 灵感流场',
      subtitle: '沉浸式生成型 3D 节点图谱工作台',
      category: 'WebGL & Canvas 3D',
      tags: ['Three.js', 'React', 'WebAudio', 'GLSL Shaders'],
      metrics: 'FPS: 60 | 延迟 < 8ms | 节点量 5,000+',
      description: '为创意设计师打造的次时代节点合成视界。以樱花粒子飘散算法模拟思维碰撞，通过多重触控与纯律和弦为灵感流转注入生命。',
      color: 'from-[#fbd0df] to-[#f1a5ba]'
    },
    {
      id: 'moon-indigo-engine',
      title: 'MoonIndigo · 幽月微内核',
      subtitle: '高性能私有知识库与极速向量检索服务',
      category: 'Enterprise AI & Vector Engine',
      tags: ['Rust', 'Tantivy', 'HNSW Vector', 'Axum'],
      metrics: 'P99 查询: 4.2ms | 吞吐量 18,000 QPS',
      description: '针对私域高密知识库自研的嵌入式轻量检索内核。彻底告别臃肿外部依赖，纯本地零网络外泄，坚守数据隐私的底线。',
      color: 'from-[#c8ceeb] to-[#3f4e86]'
    },
    {
      id: 'dream-canvas',
      title: 'DreamWeaver · 梦境织锦',
      subtitle: '多模态 Agent 协同创作与自动化发布平台',
      category: 'Autonomous Multi-Agent System',
      tags: ['TypeScript', 'FastAPI', 'DeepSeek-V3', 'WebSocket'],
      metrics: '产出提升 6.4x | 编排自动化 94%',
      description: '将文案、插画生成、排版引擎与自动审查串联为无缝流水线。用户仅需提供核心立意，智能体集群即可在幕后协同完成精致交付。',
      color: 'from-[#f1a5ba] to-[#8b97c6]'
    },
    {
      id: 'zen-craft-ui',
      title: 'ZenCraft UI · 东方雅物组件库',
      subtitle: '极简无冗余的现代 React 无障碍组件系统',
      category: 'Open Source Design System',
      tags: ['React 19', 'Tailwind', 'Radix Primitives', 'WCAG AAA'],
      metrics: 'Gzip: 8.4kb | GitHub 3.2k Stars',
      description: '融合日式工匠素雅美感与现代 Web 交互规范。深度针对移动端触控调优，自带柔和水滴触觉音效与流畅弹性形变。',
      color: 'from-[#99a3d2] to-[#2d3864]'
    }
  ];

  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-transparent via-[#f5f3f7] to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fde8ef] text-[#d0386c] text-xs font-mono font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>甄选代表作 · Flagship Projects</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1e32]">
              让灵感落地成诗的数字化作品
            </h2>
            <p className="text-sm sm:text-base text-[#59648c]">
              每一个案例，都是美学克制与严密工程的结晶。不堆砌概念，用作品的真实质感说话。
            </p>
          </div>

          <div className="text-xs font-mono text-[#8b97c6]">
            Showing 4 of 28 Selected Deployments
          </div>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              onMouseEnter={() => {
                sound.playDrop(idx % 2 === 0 ? 'mid' : 'high');
                setActiveProject(idx);
              }}
              className="group rounded-3xl p-8 bg-white/90 border border-[#3e4c84]/12 hover:border-[#e8648c]/40 transition-all duration-500 ink-shadow ink-shadow-hover flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top decorative ribbon */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.color}`} />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#f4f6fc] text-[#3e4c84] border border-[#3e4c84]/10 font-medium">
                    {project.category}
                  </span>
                  <span className="font-mono text-xs text-[#8b97c6] group-hover:text-[#e85383] transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-[#1f253d] group-hover:text-[#e85383] transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 text-[#e85383]" />
                  </h3>
                  <div className="text-xs text-[#506194] font-medium font-mono">
                    {project.subtitle}
                  </div>
                </div>

                <p className="text-sm text-[#556087] leading-relaxed">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-50 text-[#4c577f] border border-slate-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Performance Benchmark */}
              <div className="mt-8 pt-6 border-t border-[#3e4c84]/10 flex items-center justify-between">
                <div className="font-mono text-[11px] text-[#2d3864] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e85383]" />
                  <span>{project.metrics}</span>
                </div>

                <button
                  onClick={() => sound.playChord()}
                  className="text-xs text-[#3e4c84] hover:text-[#e85383] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>检视技术架构</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
