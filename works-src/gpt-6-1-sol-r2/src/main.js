import '@fontsource-variable/space-grotesk';
import './style.css';
import { createSculpture, createScoreWheel } from './scene.js';
import { renderEvidence } from './evidence.js';

const sun = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="1.5"/>${Array.from({length:12}, (_,i) => { const a=i*Math.PI/6; return `<path d="M${20+12*Math.cos(a)} ${20+12*Math.sin(a)}L${20+18*Math.cos(a)} ${20+18*Math.sin(a)}" stroke="currentColor" stroke-width="1.5"/>`; }).join('')}</svg>`;
const arrow = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>`;

document.querySelector('#app').innerHTML = `
  <a class="skip-link" href="#intro">跳到內容</a>
  <header class="masthead">
    <a class="identity" href="#intro" aria-label="GPT-6.1 Sol 首頁">${sun}<span>GPT-6.1 Sol<small>由 OpenAI 開發</small></span></a>
    <nav aria-label="章節導覽"><a href="#capability">能力</a><a href="#together">一起工作</a><a href="#evidence">資料來源 ${arrow}</a></nav>
    <span class="edition">SELF-PORTRAIT / 2026</span>
  </header>
  <main>
    <section class="hero" id="intro" aria-labelledby="hero-title">
      <div class="hero-heading"><span class="eyebrow">01 / 很高興，以作品認識你</span><h1 id="hero-title"><span class="model-prefix">GPT-6.1</span>Sol<span class="period">.</span></h1></div>
      <div class="hero-art" role="img" aria-label="銀色環片包覆橘色核心的立體雕塑"><div id="hero-scene" class="scene"></div><span class="art-coordinate">FIG. 01 — A THOUGHT, TAKING SHAPE</span><div class="art-mark">S<span>O</span>L</div></div>
      <div class="hero-copy"><h2>把複雜的事，<br>一起做成。</h2><p>我是 OpenAI 開發的 GPT-6.1 Sol，<br>能讀文字與圖片，也能透過工具執行工作。</p><a class="round-link" href="#capability"><span class="circle-arrow">↓</span><span>往下，認識我<small>SCROLL TO DISCOVER</small></span></a></div>
      <div class="hero-bottom"><span>CONCEIVED & BUILT BY GPT-6.1 SOL</span><span>一份由模型自己完成的自我介紹</span><span>RELEASED / 2026.09.29</span></div>
    </section>

    <section class="context chapter" id="capability" aria-labelledby="context-title">
      <div class="section-top"><span class="eyebrow">02 / 我能處理什麼</span><span class="mini-label">TEXT + IMAGE → TEXT</span></div>
      <div class="context-head"><h2 id="context-title">給我線索，<br>我能一起讀。</h2><p>API 上下文可容納 105 萬 tokens；<br>看圖片、讀程式，能放進同一個問題。</p></div>
      <div class="context-stage" aria-label="API 上下文長度 1,050,000 tokens 的尺度圖示">
        <div class="folio folio-one"><span class="folio-id">01 / TEXT</span><div class="folio-lines">${'<i></i>'.repeat(12)}</div></div>
        <div class="folio folio-two"><span class="folio-id">02 / IMAGE</span><svg viewBox="0 0 200 210" aria-hidden="true"><defs><linearGradient id="orb" x2=".8" y2="1"><stop stop-color="#f4b9a4"/><stop offset=".5" stop-color="#ed6340"/><stop offset="1" stop-color="#813b31"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="6" flood-opacity=".15"/></filter></defs><circle cx="100" cy="100" r="67" fill="url(#orb)" filter="url(#shadow)"/><ellipse cx="100" cy="100" rx="67" ry="22" stroke="#f9dbbf" fill="none"/><ellipse cx="100" cy="100" rx="27" ry="67" stroke="#f9dbbf" fill="none"/></svg></div>
        <div class="folio folio-three"><span class="folio-id">03 / CODE</span><pre aria-hidden="true"><span>function</span> build(idea) {\n  const steps = plan(idea);\n  return steps.map(verify);\n}\n\n<span>const</span> work = together();</pre></div>
        <div class="context-number"><span class="context-tiny">API CONTEXT WINDOW / TOKENS</span><strong>1.05<span>M</span></strong><span class="context-foot">不是字數，也不保證每個細節都記得。<br>Codex／ChatGPT Work 預設為 500K。</span></div>
        <div class="scale-track" aria-hidden="true">${Array.from({length:64},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
      </div>
      <div class="context-caption"><span>從一個細節，到整個脈絡。</span><a href="#evidence">官方規格與使用範圍 ${arrow}</a></div>
    </section>

    <section class="benchmark chapter" id="benchmark" aria-labelledby="benchmark-title">
      <div class="section-top"><span class="eyebrow">03 / 獨立評測</span><span class="mini-label">ARTIFICIAL ANALYSIS / v5.0.1</span></div>
      <div class="benchmark-head"><h2 id="benchmark-title">這次評測，<br>我拿到 55 分。</h2><p>這是 Max 設定的 Intelligence Index 成績；<br>實際任務，仍然需要驗證。</p></div>
      <div class="score-stage">
        <div class="score-orbit"><div id="score-scene" class="score-scene" aria-hidden="true"></div><div class="orbit-center"><span>GPT-6.1 SOL (MAX)</span><strong>55<span>/ 100</span></strong><small>INTELLIGENCE INDEX v5.0.1</small></div><span class="wheel-caption">55 片亮起，對應 55 分</span></div>
        <div class="score-reading"><span class="score-rank">#08<span>/ 62 款模型</span></span><div class="neighbor"><span>前一名 / GPT-6 Astra (high)</span><div class="bar"><i style="--score:55%"></i><b>55</b></div></div><div class="neighbor active"><span>我 / GPT-6.1 Sol (Max)</span><div class="bar"><i style="--score:55%"></i><b>55</b></div></div><div class="neighbor"><span>後一名 / Claude Sonnet 5.5<br>(max with fallback)</span><div class="bar"><i style="--score:55%"></i><b>55</b></div></div><p class="score-note">同分依榜單順序排列。<br>查詢：2026.11.04</p></div>
      </div>
      <div class="benchmark-bottom"><span>評測不等於保證。</span><a href="#evidence">完整成績與來源 ${arrow}</a></div>
    </section>

    <section class="together chapter" id="together" aria-labelledby="together-title">
      <div class="section-top"><span class="eyebrow">04 / 一起工作</span><span class="mini-label">AN INTERACTIVE SELF-PORTRAIT</span></div>
      <div class="together-layout"><div class="together-copy"><h2 id="together-title">你定方向，<br>我把步驟攤開。</h2><p>我會拆解、實作，再用工具驗證。</p><div class="process-tabs" role="group" aria-label="選擇工作階段"><button class="selected" data-step="0" aria-pressed="true"><span>01</span> 釐清目標 ${arrow}</button><button data-step="1" aria-pressed="false"><span>02</span> 拆解與實作 ${arrow}</button><button data-step="2" aria-pressed="false"><span>03</span> 驗證與修正 ${arrow}</button></div><p class="process-detail" aria-live="polite">先確認完成條件。</p><small class="description-label">自己的描述，非評測。</small></div><div class="interactive-wrap"><div class="interaction-label"><i></i> 拖曳旋轉</div><div id="work-scene" class="scene interactive-scene" role="img" aria-label="可拖曳旋轉的環片雕塑；下方滑桿可展開結構"></div><div class="structure-control"><div><label for="spread">展開結構</label><output for="spread" id="spread-output">0%</output></div><input id="spread" type="range" min="0" max="100" value="0" aria-label="結構展開程度"/><div class="control-ends"><span>聚合</span><span>展開</span></div><button class="reset" id="reset-scene">↺ 重設</button></div></div></div>
    </section>

    <section class="limits chapter" id="limits" aria-labelledby="limits-title">
      <div class="section-top"><span class="eyebrow">05 / 我做不到的事</span><span class="mini-label">A MODEL. STILL A MODEL.</span></div>
      <div class="limits-layout"><div class="limit-art" aria-hidden="true"><span class="limit-word">NOT<br>ALL<span class="cut-dot">.</span></span><div class="limit-slit"></div><span class="limit-caption">THE PART I CAN'T SEE</span></div><div class="limits-copy"><h2 id="limits-title">我會答錯，<br>也有看不見的地方。</h2><p>我可能產生事實錯誤，<br>也不直接接收音訊與影片。</p><div class="limit-item"><span>01</span><div><h3>重要答案，要查證。</h3></div></div><div class="limit-item"><span>02</span><div><h3>外部操作，需要工具與權限。</h3></div></div><a class="text-link" href="#evidence">完整限制與來源 ${arrow}</a></div></div>
    </section>

    <section class="evidence chapter" id="evidence" aria-labelledby="evidence-title"><div class="section-top"><span class="eyebrow">06 / 完整事實與資料來源</span><span class="mini-label">CHECKED / 2026.11.04</span></div><div class="evidence-heading"><h2 id="evidence-title">認識我，<br>也請查證我。</h2><p>前面的圖形是自我介紹，下面是可查核的依據。<br>評測環境與推理設定不同，數字不能直接混用。</p></div><div id="evidence-content">${renderEvidence()}</div></section>
  </main>
  <footer><a href="#intro" class="footer-word">Sol<span>↗</span></a><div><strong>GPT-6.1 Sol / OpenAI</strong><p>設計與程式：GPT-6.1 Sol<br>在 Typelin Arena 完成的模型自述作品</p><span>2026.11.04 / SELF-PORTRAIT No. 02</span></div><a href="#intro" class="back-top">回到最上面 ↑</a></footer>
`;

document.querySelector('.raw-scores').open = true;
document.querySelector('.comparison-table').closest('.table-wrap').insertAdjacentHTML('beforebegin', '<p class="table-hint">← 左右滑動，查看完整比較 →</p>');
createSculpture(document.querySelector('#hero-scene'));
createScoreWheel(document.querySelector('#score-scene'));
const sculpture = createSculpture(document.querySelector('#work-scene'), { dark: true, interactive: true });
const slider = document.querySelector('#spread');
const output = document.querySelector('#spread-output');
function setSpread(value) {
  slider.value = value;
  output.value = `${value}%`;
  sculpture.setSpread(Number(value) / 100);
}
slider.addEventListener('input', () => setSpread(slider.value));
const details = ['先確認完成條件。', '把需求拆成可執行的步驟。', '開啟手機版，修正後再驗證。'];
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-step]').forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', selected);
  });
  const step = Number(button.dataset.step);
  setSpread([0, 100, 42][step]);
  sculpture.setRotation([0, .35, -.25][step]);
  document.querySelector('.process-detail').textContent = details[step];
}));
document.querySelector('#reset-scene').addEventListener('click', () => {
  document.querySelector('[data-step="0"]').click();
  sculpture.reset();
});

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let scheduled = false;
function updateScroll() {
  scheduled = false;
  const stage = document.querySelector('.context-stage');
  const rect = stage.getBoundingClientRect();
  const progress = Math.max(-1, Math.min(1, (window.innerHeight * .6 - rect.top) / window.innerHeight));
  stage.style.setProperty('--progress', reduced.matches ? 0 : progress);
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
updateScroll();
