import React, { useState } from 'react';
import { Send, Mail, MapPin, MessageSquare, Check, Sparkles, Phone, Clock } from 'lucide-react';
import { sound } from '../lib/sound';

export const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    projectType: 'Web 前端沉浸式重构',
    budget: '50k - 100k CNY',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playChord();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      sound.playDrop('high');
      setTimeout(() => {
        setIsSuccess(false);
        setFormState({
          name: '',
          email: '',
          projectType: 'Web 前端沉浸式重构',
          budget: '50k - 100k CNY',
          message: ''
        });
      }, 4000);
    }, 900);
  };

  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Information Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fde8ef] text-[#d0386c] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>联络共创 · Project Initiation</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1e32]">
              期待与您共赴下一程数字化春华
            </h2>
            <p className="text-sm sm:text-base text-[#59648c] leading-relaxed">
              无论您需要全新旗舰落地站、高精 3D 渲染界面，还是定制私有 AI 智能体应用，咲梦团队都愿倾听您的愿景。
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-[#3e4c84]/12 shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#fde8ef] text-[#d0386c]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#7c88b2] font-mono">官方商务直通信箱</div>
                <div className="text-sm font-semibold text-[#222944] select-all">contact@sakimu.tech</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-[#3e4c84]/12 shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#eef1ff] text-[#3e4c84]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#7c88b2] font-mono">响应时效承诺</div>
                <div className="text-sm font-semibold text-[#222944]">24 小时内首轮技术架构评估与反馈</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-[#3e4c84]/12 shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#fde8ef] text-[#d0386c]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#7c88b2] font-mono">工坊节点</div>
                <div className="text-sm font-semibold text-[#222944]">中国 · 全域分布式远程协同 & 线下工坊</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 rounded-3xl p-8 sm:p-10 bg-white/95 border border-[#3e4c84]/15 shadow-xl ink-shadow relative">
          {isSuccess ? (
            <div className="py-16 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#fde8ef] text-[#d0386c] mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#222944]">立项意向已如期投递</h3>
              <p className="text-sm text-[#59648c] max-w-md mx-auto">
                感谢您对咲梦信息科技工作室的信任。我们的主任工程师将在 24 小时内检阅您的需求并回复详细评估报告。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-medium text-[#48537c]">您的尊称 / 称谓 *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="例如：林总监 / 陈女士"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf8f9] border border-[#3e4c84]/15 text-sm text-[#1a1e32] focus:outline-none focus:border-[#e8648c] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-medium text-[#48537c]">联络邮箱 / 微信 *</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="yourname@domain.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf8f9] border border-[#3e4c84]/15 text-sm text-[#1a1e32] focus:outline-none focus:border-[#e8648c] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-medium text-[#48537c]">意向项目类别</label>
                  <select
                    value={formState.projectType}
                    onChange={(e) => setFormState({ ...formState, projectType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf8f9] border border-[#3e4c84]/15 text-sm text-[#1a1e32] focus:outline-none focus:border-[#e8648c] transition-colors"
                  >
                    <option>Web 前端沉浸式重构</option>
                    <option>WebGL / 3D 数字视界开发</option>
                    <option>企业级 AI 智能体与微调</option>
                    <option>高性能微服务与全栈架构</option>
                    <option>品牌视觉与设计系统总包</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-medium text-[#48537c]">预期预算区间</label>
                  <select
                    value={formState.budget}
                    onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf8f9] border border-[#3e4c84]/15 text-sm text-[#1a1e32] focus:outline-none focus:border-[#e8648c] transition-colors"
                  >
                    <option>30k - 50k CNY (敏捷精品单项)</option>
                    <option>50k - 100k CNY (标准旗舰平台)</option>
                    <option>100k - 250k CNY (全栈+AI深度定制)</option>
                    <option>250k+ CNY (年度长期战略伙伴)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-[#48537c]">项目需求简述 / 愿景 *</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="请简要介绍您的目标用户、关键功能要求或希望突破的体验瓶颈..."
                  className="w-full px-4 py-3 rounded-xl bg-[#faf8f9] border border-[#3e4c84]/15 text-sm text-[#1a1e32] focus:outline-none focus:border-[#e8648c] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#3e4c84] via-[#4d5c9e] to-[#252f58] hover:from-[#e8648c] hover:to-[#3e4c84] transition-all duration-500 shadow-lg shadow-[#3e4c84]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '正在传输加密工单...' : '呈递立项需求'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
