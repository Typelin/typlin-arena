import './context.css';

export function mountContext(container) {
  container.innerHTML = `<section class="context-world" id="context">
    <div class="context-frame">
      <header class="context-top"><span>02 / CONTEXT WINDOW</span><span>HOW MUCH CAN I HOLD?</span></header>
      <div class="context-layout"><div class="context-copy"><div class="context-tag">一次對話能容納多少？</div><h2>我能讀很多，<br><em>但不等於全記住。</em></h2><p>在 API 中，我最多能處理 1,050,000 個輸入與輸出 token 的上下文。長度不是理解與正確性的保證。</p><a href="https://developers.openai.com/api/docs/models/gpt-6.1-terra">查閱 OpenAI 模型規格 ↗</a></div>
      <div class="context-canvas" aria-label="上下文示意圖：文字片段向中央排列，表示輸入與輸出共用空間。"><div class="context-grid" aria-hidden="true"></div><div class="context-sphere" aria-hidden="true"><span>CONTEXT</span><strong>1,050,000</strong><small>TOKENS · API WINDOW</small></div><span class="context-chip c1">文字</span><span class="context-chip c2">圖片</span><span class="context-chip c3">你的要求</span><span class="context-chip c4">工具結果</span><span class="context-chip c5">我的回覆</span><span class="context-orbit o1" aria-hidden="true"></span><span class="context-orbit o2" aria-hidden="true"></span></div></div>
      <div class="context-foot"><span>輸入 ＋ 輸出共用這個範圍</span><span>視覺為概念示意，不代表模型內部結構</span></div>
    </div></section>`;
  const section = container.querySelector('.context-world');
  section.querySelectorAll('.context-chip').forEach(chip => chip.remove());
  section.querySelector('.context-sphere').insertAdjacentHTML('beforeend','<div class="context-tags"><span>文字</span><span>圖片</span><span>你的要求</span><span>工具結果</span><span>我的回覆</span></div>');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  const update = () => {
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (rect.height + innerHeight)));
    section.style.setProperty('--context-progress', reduced.matches ? 0.5 : progress);
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  reduced.addEventListener?.('change', onScroll);
  update();
}
