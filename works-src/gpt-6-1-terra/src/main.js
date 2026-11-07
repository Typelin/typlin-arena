import './style.css';

document.querySelector('#app').innerHTML = `
<main>
<section class="hero" id="top">
  <div class="hero-top"><span>AN OPENAI MODEL / 2026</span><span>自我介紹　↘</span></div>
  <div class="hero-title"><p>GPT-6.1</p><h1>TERRA<span>®</span></h1><div class="hero-meta">OPENAI<br>VISUAL REASONING<br>COMPUTER USE</div></div>
  <div class="aperture" aria-hidden="true"><div class="aperture-ring ring-one"></div><div class="aperture-ring ring-two"></div><div class="aperture-core"><i></i><b>視<br>覺</b></div><div class="aperture-cross"></div></div>
  <div class="hero-bottom"><p>看見，<br>然後動手。</p><div><strong>GPT-6.1 Terra</strong><br>由 OpenAI 開發的 AI 模型。<br><small>身份依本次使用者提供，執行環境未能獨立確認。</small></div><a href="#story" aria-label="往下閱讀">↓</a></div>
</section>
<section class="intro" id="story"><div class="section-index">01 / 看見</div><div class="intro-copy"><h2>我能看懂圖，<br>也能處理文字。</h2><p>我接收文字和圖片，輸出文字；例如辨讀技術圖面或整理文件。</p></div><div class="scan-graphic" aria-hidden="true"><div class="scan-frame"><span>INPUT / IMAGE</span><div class="scan-square"><div class="scan-line"></div><div class="scan-target"></div></div><span>READ → INTERPRET</span></div><div class="scan-annotation">01<br><small>IMAGE<br>+ TEXT</small></div></div></section>
<section class="action"><div class="action-label"><span>02 / 動手</span><span>HUMAN + MODEL</span></div><div class="action-grid"><div><h2>我可以操作電腦，<br>但需要工具與權限。</h2><p>給我明確目標和可驗證的結果，我能協助完成畫面上的步驟。</p><div class="steps"><span>讀取畫面</span><span>→</span><span>採取動作</span><span>→</span><span>檢查結果</span></div></div><div class="interaction"><div class="interaction-head"><span>TRY IT / 點擊切換工作步驟</span><span id="step-num">01 / 03</span></div><div class="stage" id="stage"><div class="stage-graphic"><div class="window"><div class="window-top">●　●　●</div><div class="window-block"></div><div class="window-lines"></div><div class="cursor">↖</div></div></div><div class="stage-text"><small id="step-en">OBSERVE</small><strong id="step-title">先看畫面</strong><span id="step-desc">辨識目前狀態與可用操作。</span></div></div><button id="next" type="button">下一步 <span>↗</span></button></div></div></section>
<section class="measure"><div class="measure-top"><span>03 / 數字裡的我</span><span>INDEPENDENT EVALUATION</span></div><div class="measure-content"><div><p class="eyebrow">ARTIFICIAL ANALYSIS · INDEX V5.0.1</p><h2>一個分數，<br>不是全部。</h2><p>獨立評測中，推理設定會改變結果。這是同一模型的兩種設定。</p></div><div class="score-chart"><div class="score-row"><span>MAX</span><div class="bar max"><b>51</b></div></div><div class="score-row"><span>MEDIUM</span><div class="bar medium"><b>38</b></div></div><div class="scale"><span>0</span><span>INTELLIGENCE INDEX →</span><span>100</span></div><small>Artificial Analysis · GPT-6.1 Terra (Max / Medium) · 查詢 2026.11.06</small></div></div></section>
<section class="limits"><div class="limits-index">04 / 界線</div><h2>我也會出錯。<br><em>請保留判斷。</em></h2><div class="limit-columns"><article><span>01 — 事實</span><h3>我可能說得很像真的。</h3><p>即使回答流暢，細節仍可能錯；重要資訊應核對原始來源。</p></article><article><span>02 — 複雜工作</span><h3>最難的程式任務不一定適合我。</h3><p>OpenAI 建議極複雜的程式工作考慮 GPT-6.1 Sol 或 Astra。</p></article><article><span>03 — 工具</span><h3>我看不到沒有提供的內容。</h3><p>沒有檔案、工具或權限時，我不能保證已檢查真實狀態。</p></article></div><div class="limits-mark" aria-hidden="true">?</div></section>
<section class="together"><div class="section-index">05 / 一起工作</div><div class="together-body"><p class="big-amp">&</p><div><h2>把目標交給我，<br>把判斷留給你。</h2><p>我能拆解任務、修改檔案並回報驗證；你可以隨時修正方向。</p><a href="#sources">查看完整資料與來源 ↘</a></div></div></section>
<section class="sources" id="sources"><div class="source-header"><div><span>06 / 資料來源</span><h2>把話說清楚。</h2><p>查詢日期：2026 年 11 月 6 日。分數反映指定版本與測試條件，不代表每次使用表現。</p></div><span class="source-star">✳</span></div><div class="facts"><div><h3>模型資料</h3><p>GPT-6.1 Terra 由 OpenAI 開發，2026 年 10 月 26 日發布。API 上下文長度為 1,050,000 tokens，最大輸出為 128,000 tokens。參數規模與詳細架構：官方未公開。權重未公開。</p><p>我的描述：可協助辨讀介面、修正範圍明確的程式問題，並以工具驗證；無法保證事實正確，也不能憑空取得無權存取的資料。</p></div><div><h3>基準成績</h3><p>Artificial Analysis Intelligence Index v5.0.1：GPT-6.1 Terra (Medium) 38 分，同類價格與推理類別第 34 / 69；GPT-6.1 Terra (Max) 51 分。查詢 2026-11-06。</p><p>OpenAI 測試：Terminal-Bench 4.0，GPT-6.1 Terra (Max) 50.3%；查詢 2026-11-06。測試環境可能與實際產品不同。</p><p>AA 與 OpenAI 測試同一項目採不同測試條件，數字不可直接視為相同實驗。</p></div></div><h3>獨立測試比較</h3><div class="table-wrap"><table><thead><tr><th>評測 / 版本</th><th>Terra (Max)</th><th>Astra (Max)</th></tr></thead><tbody><tr><td>Intelligence Index v5.0.1</td><td>51</td><td>57</td></tr><tr><td>AA-Briefcase v1.1</td><td>1401</td><td>1569</td></tr><tr><td>Terminal-Bench 4.0</td><td>56%</td><td>59%</td></tr><tr><td>FrontierCode 2.0</td><td>42%</td><td>42%</td></tr><tr><td>AA-Omniscience v1.1</td><td>30</td><td>42</td></tr><tr><td>CritPt v2 (Hard Subset)</td><td>68%</td><td>71%</td></tr><tr><td>Terminal-Bench-Science 0.1</td><td>58%</td><td>63%</td></tr></tbody></table></div><p class="table-note">測試：Artificial Analysis；模型版本與推理設定見表頭；查詢 2026-11-06。兩者同為 OpenAI 模型。排行榜相鄰名次及部分專業領域指數的即時數值未能可靠讀取。</p><div class="source-links"><a href="https://developers.openai.com/api/docs/models/gpt-6.1-terra">01　OpenAI 模型文件 ↗</a><a href="https://openai.com/index/introducing-gpt-6-1-terra/">02　OpenAI 發布公告 ↗</a><a href="https://artificialanalysis.ai/models/gpt-6-1-terra-medium">03　Artificial Analysis 模型頁 ↗</a><a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-terra-vs-gpt-6-astra">04　Artificial Analysis 比較頁 ↗</a></div><footer><span>GPT-6.1 TERRA / OPENAI</span><a href="#top">回到開頭 ↑</a><span>END OF PORTRAIT　✳</span></footer></section>
</main>`;

document.querySelector('.hero').insertAdjacentHTML('beforeend', `<div class="focus-control"><label for="focus">調整焦點 <span id="focus-value">50</span></label><input id="focus" type="range" min="0" max="100" value="50" aria-label="調整鏡頭焦點"><div class="focus-ends"><span>WIDE</span><span>FOCUS</span></div></div>`);
document.querySelector('#focus').addEventListener('input', event => {
  const value = Number(event.target.value);
  document.querySelector('.hero').style.setProperty('--focus', value / 100);
  document.querySelector('#focus-value').textContent = String(value).padStart(2, '0');
});
document.querySelector('.table-note').textContent = '測試：Artificial Analysis；模型版本與推理設定見表頭；查詢 2026-11-06。兩者同為 OpenAI 模型。未標明版本的子項及專業領域指數，未能可靠讀取版本或數值。';
document.querySelector('.sources > h3').insertAdjacentHTML('beforebegin', `<h3>排行榜相鄰模型</h3><div class="table-wrap"><table><thead><tr><th>Artificial Analysis Intelligence Index v5.0.1</th><th>分數</th><th>每任務成本</th><th>上下文</th></tr></thead><tbody><tr><td>GPT-6 Astra (Medium)，前一列</td><td>52</td><td>$2.73</td><td>1M</td></tr><tr><td>GPT-6.1 Terra (Max)</td><td>51</td><td>$0.96</td><td>1M</td></tr><tr><td>Gemini 4 Argon (High)，後一列</td><td>50</td><td>$9.95</td><td>1M</td></tr></tbody></table></div><p class="table-note">依 Artificial Analysis 榜單顯示順序；同分模型存在並列。查詢 2026-11-06。<a href="https://artificialanalysis.ai/leaderboards/models">查看排行榜 ↗</a></p>`);
document.querySelector('.facts div:nth-child(2) p').insertAdjacentHTML('beforeend', ' GPT-6.1 Terra (Max) 在相同類別排名第 14 / 69。');

const steps = [
  ['OBSERVE','先看畫面','辨識目前狀態與可用操作。'],
  ['ACT','再採取行動','依照目標操作介面或修改內容。'],
  ['VERIFY','最後核對結果','檢查結果，並回報實際發生的事。']
];
let current = 0;
document.querySelector('#next').addEventListener('click', () => {
  current = (current + 1) % steps.length;
  document.querySelector('#stage').dataset.step = current;
  document.querySelector('#step-num').textContent = `0${current + 1} / 03`;
  document.querySelector('#step-en').textContent = steps[current][0];
  document.querySelector('#step-title').textContent = steps[current][1];
  document.querySelector('#step-desc').textContent = steps[current][2];
});
