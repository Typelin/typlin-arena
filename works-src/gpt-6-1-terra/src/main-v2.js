import './base.css';
import './v2.css';
import { mountHero } from './hero-canvas.js';
import { mountContext } from './context.js';
import { mountNarrative } from './narrative.js';
import { mountLimits } from './limits-stage.js';
import { mountEvidence } from './evidence.js';
import { mountTokens } from './token-stage.js';
import { mountChoreography } from './choreography.js';

document.querySelector('#app').innerHTML = `<main>
  <div id="hero-art"></div>
  <section class="v2-opening" id="story"><div class="v2-opening-top"><span>01 / WHAT IS GPT?</span><span>由 OPENAI 開發</span></div><div class="v2-opening-body"><div class="v2-opening-mark" aria-hidden="true">G<span>✳</span>T</div><div class="v2-opening-copy"><p class="v2-kicker">先認識我</p><h2>我是一個能處理<br>文字和圖片的 AI。</h2><p>我是 GPT-6.1 Terra。給我文件、圖片或問題，我會產生文字回應；搭配工具時，也能協助完成電腦上的工作。</p><a href="#context">往下看看我怎麼工作 <span>↓</span></a></div></div><div class="v2-opening-foot"><span>TEXT + IMAGE → TEXT</span><span>GPT-6.1 TERRA / OPENAI</span></div></section>
  <div id="tokens-art"></div><div id="context-art"></div><div id="narrative-art"></div><div id="limits-art"></div><div id="evidence-art"></div>
  <section class="v2-together"><div class="v2-together-top"><span>05 / HUMAN IN THE LOOP</span><span>一起完成，而不是放手不管</span></div><div class="v2-together-grid"><div class="v2-together-figure" aria-hidden="true"><div class="v2-hand h1">你</div><div class="v2-hand h2">我</div><span>↔</span></div><div class="v2-together-copy"><p class="v2-kicker">一起工作</p><h2>你給方向，<br>我把工作往前推。</h2><p>你決定目標和可接受的結果；我拆解任務、使用可用工具、檢查結果，並說明哪些事情還需要你確認。</p><div class="v2-responsibilities"><div><small>你</small><strong>目標與判斷</strong><span>指定需求、提供材料、做最後決定。</span></div><div><small>我</small><strong>執行與回報</strong><span>整理、修改、驗證，指出不確定的地方。</span></div></div></div></div></section>
  <section class="v2-sources" id="sources"><header><span>06 / NOTES & SOURCES</span><h2>資料攤開來看。</h2><p>以下資料查詢於 2026 年 11 月 6 日。評測分數反映指定模型版本、推理強度及測試條件，並不保證每一次實際使用的結果。</p></header>
  <div class="v2-facts"><article><h3>我是什麼</h3><p>GPT-6.1 Terra 由 OpenAI 開發，2026 年 10 月 26 日發布；API 模型 ID 為 <code>gpt-6.1-terra</code>。本作品依使用者提供的型號製作，執行環境沒有提供獨立確認完整型號的資訊。</p><p>API 上下文 1,050,000 tokens，最大輸出 128,000 tokens。文字、圖片可輸入，文字可輸出；音訊與影片不屬於模型頁列出的原生支援模態。參數規模及詳細架構官方未公開；權重未公開。</p></article><article><h3>我能做什麼，也會在哪裡失手</h3><p>官方定位包括圖像理解、電腦操作、清楚寫作和範圍明確的程式修改；能否使用工具取決於產品與授權。</p><p>我可能產生看似合理的錯誤、誤解圖片或操作失敗。高風險資訊與實際執行結果需要核對。官方指出最複雜的程式任務可考慮 GPT-6.1 Sol 或 Astra。</p></article></div>
  <h3 class="v2-table-heading">獨立基準成績與對照</h3><p class="v2-table-note">Artificial Analysis 測試，查詢 2026-11-06。所有數字是頁面顯示值；不同評測機構的結果不可直接視為相同實驗。</p><div class="v2-table-wrap"><table><thead><tr><th>評測版本</th><th>GPT-6.1 Terra (Max)</th><th>GPT-6 Astra (Max)</th></tr></thead><tbody><tr><th>Intelligence Index v5.0.1</th><td>51</td><td>57</td></tr><tr><th>AA-Briefcase v1.1</th><td>1401</td><td>1569</td></tr><tr><th>Terminal-Bench 4.0</th><td>56%</td><td>59%</td></tr><tr><th>FrontierCode 2.0</th><td>42%</td><td>42%</td></tr><tr><th>AA-Omniscience v1.1</th><td>30</td><td>42</td></tr><tr><th>CritPt v2，Hard Subset</th><td>68%</td><td>71%</td></tr><tr><th>Terminal-Bench-Science 0.1</th><td>58%</td><td>63%</td></tr></tbody></table></div>
  <p class="v2-table-note">Artificial Analysis Intelligence Index v5.0.1：GPT-6.1 Terra (Medium) 38 分，在模型頁的同類比較中第 34 / 69；GPT-6.1 Terra (Max) 51 分，第 14 / 69。OpenAI 自行測試 Terminal-Bench 4.0 的 GPT-6.1 Terra (Max) 為 50.3%。以上均查詢於 2026-11-06。</p>
  <h3 class="v2-table-heading">排行榜相鄰模型</h3><div class="v2-table-wrap"><table><thead><tr><th>Artificial Analysis Index v5.0.1</th><th>分數</th><th>每任務成本</th><th>上下文</th></tr></thead><tbody><tr><th>GPT-6 Astra (Medium)，前一列</th><td>52</td><td>US$2.73</td><td>1M</td></tr><tr><th>GPT-6.1 Terra (Max)</th><td>51</td><td>US$0.96</td><td>1M</td></tr><tr><th>Gemini 4 Argon (High)，後一列</th><td>50</td><td>US$9.95</td><td>1M</td></tr></tbody></table></div><p class="v2-table-note">依 2026-11-06 榜單顯示順序；同分模型可能並列。部分專業領域指數版本未查到，因此未將其分數當作可完整核對的基準。</p>
  <div class="v2-source-list"><a href="https://developers.openai.com/api/docs/models/gpt-6.1-terra">01　OpenAI 模型文件 ↗</a><a href="https://openai.com/index/introducing-gpt-6-1-terra/">02　OpenAI 發布公告 ↗</a><a href="https://artificialanalysis.ai/models/gpt-6-1-terra-medium">03　Artificial Analysis 模型頁 ↗</a><a href="https://artificialanalysis.ai/models/comparisons/gpt-6-1-terra-vs-gpt-6-astra">04　Artificial Analysis 比較頁 ↗</a><a href="https://artificialanalysis.ai/leaderboards/models">05　Artificial Analysis 排行榜 ↗</a><a href="https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens">06　OpenAI：認識 token ↗</a></div><footer><span>GPT-6.1 TERRA / OPENAI</span><a href="#top">回到開頭 ↑</a><span>END OF PORTRAIT ✳</span></footer></section>
</main>`;
mountHero(document.querySelector('#hero-art'));
const openingMark = document.querySelector('.v2-opening-mark');
document.querySelector('.v2-opening-copy a').setAttribute('href','#token-story');
openingMark.removeAttribute('aria-hidden');
openingMark.innerHTML = '<div><b>G</b><span>GENERATIVE<small>生成</small></span></div><div><b>P</b><span>PRE-TRAINED<small>預先訓練</small></span></div><div><b>T</b><span>TRANSFORMER<small>模型家族</small></span></div>';
const exactScores = { 'Terminal-Bench 4.0':['55.6%','59.1%'], 'FrontierCode 2.0':['42.3%','42.4%'], 'CritPt v2，Hard Subset':['68.0%','70.5%'], 'Terminal-Bench-Science 0.1':['57.6%','63.3%'] };
document.querySelectorAll('.v2-table-wrap tbody tr').forEach(row => { const values = exactScores[row.querySelector('th')?.textContent]; if(values) row.querySelectorAll('td').forEach((cell,index)=>cell.textContent=values[index]); });
document.querySelector('.v2-source-list').insertAdjacentHTML('beforebegin', `<h3 class="v2-table-heading">專業領域指數（版本未查到）</h3><p class="v2-table-note">Artificial Analysis 頁面有顯示以下數字，但未顯示指數版本；因此不能視為版本完整的基準紀錄。模型：GPT-6.1 Terra (Max) 與 GPT-6 Astra (Max)，查詢 2026-11-06。</p><div class="v2-table-wrap"><table><thead><tr><th>領域指數／版本未查到</th><th>Terra (Max)</th><th>Astra (Max)</th></tr></thead><tbody><tr><th>財務與會計</th><td>49</td><td>57</td></tr><tr><th>策略與營運</th><td>50</td><td>58</td></tr><tr><th>法律</th><td>46</td><td>56</td></tr><tr><th>醫療</th><td>45</td><td>54</td></tr></tbody></table></div><p class="v2-table-note"><a href="https://artificialanalysis.ai/models/releases/comparisons/gpt-6-1-terra-vs-gpt-6-astra">查看 Artificial Analysis 專業領域比較 ↗</a></p>`);
document.querySelector('.v2-source-list').insertAdjacentHTML('beforebegin', `<h3 class="v2-table-heading">其他可見子項（版本未查到）</h3><p class="v2-table-note">Artificial Analysis 列有分數，但這些子項的版本號未查到，故單獨列出且不當作版本完整的基準。模型為 GPT-6.1 Terra (Max)／GPT-6 Astra (Max)；查詢 2026-11-06。</p><div class="v2-table-wrap"><table><thead><tr><th>評測／版本未查到</th><th>Terra (Max)</th><th>Astra (Max)</th></tr></thead><tbody><tr><th>AutomationBench-AA</th><td>60.2%</td><td>68.5%</td></tr><tr><th>GDP.pdf</th><td>28.6%</td><td>31.0%</td></tr><tr><th>HLE-Diamond</th><td>47.3%</td><td>63.8%</td></tr></tbody></table></div>`);
document.querySelectorAll('.v2-table-wrap table').forEach(table => {
  const labels = [...table.querySelectorAll('thead th')].map(cell => cell.textContent);
  table.querySelectorAll('tbody tr').forEach(row => row.querySelectorAll('td').forEach((cell, index) => cell.dataset.label = labels[index + 1]));
});
mountTokens(document.querySelector('#tokens-art'));
mountContext(document.querySelector('#context-art'));
mountNarrative(document.querySelector('#narrative-art'));
mountLimits(document.querySelector('#limits-art'));
mountEvidence(document.querySelector('#evidence-art'));
document.querySelector('#hero-art').insertAdjacentHTML('afterbegin','<span id="top" aria-hidden="true"></span>');
for (const scene of document.querySelectorAll('.v2-opening,.token-stage,.narrative,.terra-io,.evidence-world,.v2-together')) scene.dataset.shot = '';
mountChoreography();
