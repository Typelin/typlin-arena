import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './portrait.css'
import { createPortrait } from './portrait-scene'
import { renderEvidence } from './evidence'
import { renderCollaboration, initCollaboration } from './collaboration-demo'
import { renderLimits, initLimits } from './limits-demo'
import { renderContext, initContext } from './context-demo'
import './polish.css'
import './score-stage.css'

const models=[['Claude Opus 5.5','xhigh with fallback','04'],['GPT-6 Astra','max','05'],['GPT-6 Astra','xhigh','06'],['GPT-6.1 Sol','max','08']]
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
<a class="skip-link" href="#context">跳至介紹</a>
<header class="masthead"><a href="#home" class="wordmark">GPT-6 <b>Astra</b><span class="brand-dot"></span></a><span class="edition mono">SELF-PORTRAIT / 2026</span><a href="#evidence">OpenAI 開發 ↗</a></header>
<main>
<section id="home" class="hero chapter" aria-labelledby="hero-title">
 <div class="hero-heading"><span class="eyebrow">01 — OPENAI 的推理模型</span><h1 id="hero-title">GPT-6<br><em>Astra.</em></h1><p class="hero-claim">我讀文字，<br>也讀圖片。</p></div>
 <div id="portrait" aria-label="由 GPT 立體字、文字與資料組成的模型自畫像" role="img"><span class="portrait-fallback" aria-hidden="true">GPT</span></div>
 <div class="art-caption mono"><span>LANGUAGE → POSSIBILITY</span><span>001 / OPENAI</span></div>
 <div class="hero-detail"><p>我是 OpenAI 的推理模型。<br>從文字與圖片出發，協助你讀懂資料、<br>修改程式，把想法做成可檢查的結果。</p><a class="round-link" href="#context" aria-label="繼續認識 GPT-6 Astra">↓</a></div>
 <div class="portrait-modes" role="group" aria-label="切換輸入示範"><span class="mono">試著換一種材料</span><button data-mode="0" aria-pressed="true">文字 ↗</button><button data-mode="1" aria-pressed="false">圖片 ↗</button><button data-mode="2" aria-pressed="false">程式 ↗</button></div>
 <div class="material-sample" aria-live="polite"><span class="mono" id="material-type">TEXT / 文字輸入</span><p id="material-copy">把一段散亂筆記，整理成清楚的下一步。</p><small>預設互動示範，未連線模型。</small></div>
 <div class="hero-credit mono">模型開發：OpenAI <span>作品設計與實作：本次 Codex 工作階段</span></div>
</section>
<nav class="chapter-index" aria-label="章節導覽">${[['context','容量'],['work','合作'],['scores','成績'],['limits','邊界'],['evidence','資料來源']].map(([id,label],i)=>`<a href="#${id}"><span class="mono">0${i+2}</span>${label}<span>↘</span></a>`).join('')}</nav>
${renderContext()}
${renderCollaboration()}
<section class="scores chapter" id="scores" aria-labelledby="scores-title">
 <div class="section-top"><span class="eyebrow">04 — 成績與取捨</span><a href="#evidence">完整版本與來源 ↗</a></div>
 <div class="score-intro"><h2 id="scores-title">同樣的分數，<br>不同的<em>代價。</em></h2><p>我在當日榜單排第五。<br>把成績、成本和時間放在一起，<br>才看得出不同設定的取捨。</p></div>
 <div class="score-theatre"><div class="score-anchor"><span class="mono">GPT-6 ASTRA (MAX)</span><strong id="score-big">57</strong><span id="score-unit">INTELLIGENCE INDEX</span><span class="rank mono">05 / 62 MODELS</span></div>
 <div class="comparison"><div class="metric-switch" role="group" aria-label="比較指標"><button data-metric="score" aria-pressed="true">成績</button><button data-metric="cost" aria-pressed="false">每任務成本</button><button data-metric="time" aria-pressed="false">每任務時間</button></div><div class="chart" aria-label="四個模型的同尺度比較">${models.map((m,i)=>`<div class="chart-row ${i===1?'is-me':''}"><div class="chart-name"><span class="mono">#${m[2]}</span><b>${m[0]}</b><small>(${m[1]})</small></div><div class="chart-track"><div class="chart-bar" style="--bar:${[95,95,91.67,91.67][i]}%"><span class="bar-ticks"></span></div><strong class="chart-value">${[57,57,55,55][i]}</strong></div></div>`).join('')}</div><div class="chart-axis mono"><span>0 — 共同零點</span><span id="axis-max">60 / 指數</span></div><p class="metric-insight" id="metric-insight" aria-live="polite">前一名和我顯示同樣的 57；後一名，是我的 xhigh 設定。</p></div></div>
 <div class="score-source">Artificial Analysis Intelligence Index <b>v5.0.1</b> · 查詢 2026-11-04<br>排名依當日榜單；成本與時間為該榜單的每任務量測，不是 API 單價。</div>
 <div class="ability-ledger"><div><span class="mono">CODING</span><strong>59.1<small>%</small></strong><h3>終端程式工作</h3><p>Terminal-Bench 4.0</p></div><div><span class="mono">SCIENCE</span><strong>63.3<small>%</small></strong><h3>科學工具任務</h3><p>Terminal-Bench-Science 0.1</p></div><div><span class="mono">KNOWLEDGE WORK</span><strong>1569<small>Elo</small></strong><h3>多步驟知識工作</h3><p>AA-Briefcase v1.1</p></div></div><p class="ability-source">數字佐證：Artificial Analysis · GPT-6 Astra (max) · 查詢 2026-11-04。指定題組的成績，不是每次任務的成功保證。</p>
</section>
${renderLimits()}
<section class="evidence chapter" id="evidence" aria-labelledby="evidence-title">${renderEvidence()}</section>
</main><footer class="footer"><span class="mono">WORDS ARE A BEGINNING.</span><a href="#home">Let's make<br><em>something.</em><span>↑</span></a><div><b>GPT-6 Astra / OpenAI</b><span>模型開發：OpenAI<br>作品：本次 Codex 工作階段</span><a href="#evidence">把依據留給你 ↗</a></div></footer>`

const reduced=matchMedia('(prefers-reduced-motion: reduce)')
await document.fonts.ready
const portrait=createPortrait(document.querySelector('#portrait')!,reduced)
const samples=[['TEXT / 文字輸入','把一段散亂筆記，整理成清楚的下一步。'],['IMAGE / 圖片輸入','讀取截圖中的版面與文字，找出需要調整的地方。'],['CODE / 程式也是文字','讀懂元件，修改互動，再用工具驗證實際行為。']]
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
 const mode=Number(button.dataset.mode)
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
 document.querySelector('#material-type')!.textContent=samples[mode][0]
 document.querySelector('#material-copy')!.textContent=samples[mode][1]
 portrait.setMode(mode)
}))
initCollaboration(reduced);initLimits(reduced);initContext(reduced)
const metricData={score:{values:[57,57,55,55],max:60,unit:'INTELLIGENCE INDEX',axis:'60 / 指數',insight:'前一名和我顯示同樣的 57；後一名，是我的 xhigh 設定。'},cost:{values:[6.05,6.24,3.66,1.27],max:7,unit:'USD / 每任務成本',axis:'7 USD / 任務',insight:'max 的成績較高，也需要較高成本；這不是免費的進步。'},time:{values:[16.1,18.2,9.1,20.1],max:22,unit:'MINUTES / 每任務時間',axis:'22 分鐘 / 任務',insight:'xhigh 的每任務時間較短。成本較低的模型，也不一定較快。'}}
document.querySelectorAll<HTMLButtonElement>('[data-metric]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.metric as keyof typeof metricData, data=metricData[key]
 document.querySelectorAll('[data-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
 document.querySelector('#score-big')!.textContent=(key==='cost'?'$':'')+data.values[1]
 document.querySelector('#scores')!.setAttribute('data-metric',key)
 document.querySelector('#score-unit')!.textContent=data.unit
 document.querySelector('#axis-max')!.textContent=data.axis
 document.querySelector('#metric-insight')!.textContent=data.insight
 document.querySelectorAll<HTMLElement>('.chart-bar').forEach((bar,i)=>bar.style.setProperty('--bar',String(data.values[i]/data.max*100)+'%'))
 document.querySelectorAll('.chart-value').forEach((value,i)=>value.textContent=(key==='cost'?'$':'')+data.values[i])
}))
let queued=false
function updateScroll(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;portrait.setScroll(Math.max(0,Math.min(1,scrollY/innerHeight)));})}
addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',updateScroll);updateScroll()
