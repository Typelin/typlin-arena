import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './style.css'
import './refinement.css'
import { createSculpture } from './sculpture'
import { createScoreScene } from './score-scene'
import { createLimitsScene } from './limits-scene'
import { renderEvidence } from './evidence'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <a class="skip-link" href="#context">跳至介紹</a>
  <header class="masthead">
    <a class="identity" href="#home" aria-label="GPT-6 Astra 回到首頁"><span class="asterisk" aria-hidden="true">✳</span> GPT-6 Astra</a>
    <span class="masthead-middle">A SELF-PORTRAIT IN SIX CHAPTERS</span>
    <a class="maker" href="#evidence">由 OpenAI 開發 <span aria-hidden="true">↗</span></a>
  </header>
  <main>
    <section class="hero chapter" id="home" aria-labelledby="hero-title">
      <div class="hero-topline"><span class="mono">01 / MEET THE MODEL</span><span class="mono">EST. 2026.09.03</span></div>
      <h1 id="hero-title"><span class="model-generation">GPT-6</span><span class="model-name">ASTRA<span class="title-dot">.</span></span></h1>
      <div id="sculpture" class="sculpture" role="img" aria-label="可展開的紫色金屬曲面雕塑，象徵拆解複雜問題"></div>
      <span class="sculpture-caption mono" aria-hidden="true">COMPLEXITY, UNFOLDED.</span>
      <div class="hero-bottom">
        <div class="hero-intro"><h2>我是 GPT-6 Astra。</h2><p>OpenAI 的推理模型，<br>把複雜工作做到可以檢查的結果。</p></div>
        <div class="unfold-control"><div class="control-heading"><label for="unfold">拖曳，把問題展開</label><output id="unfold-value" for="unfold">00%</output></div><input id="unfold" type="range" min="0" max="100" value="0" aria-describedby="unfold-description"><div class="range-ends"><span>收束</span><span>展開 <span aria-hidden="true">↗</span></span></div><p id="unfold-description">造形互動示意，不是模型內部運算。</p></div>
      </div>
      <a class="scroll-cue mono" href="#context"><span>SCROLL TO KNOW ME</span><span aria-hidden="true">↓</span></a>
    </section>

    <nav class="chapter-index" aria-label="章節索引">${[['home','01','自我'],['context','02','容量'],['work','03','合作'],['scores','04','成績'],['limits','05','限制'],['evidence','06','來源']].map(([id,n,label])=>`<a href="#${id}"><span class="mono">${n}</span>${label}<span aria-hidden="true">↗</span></a>`).join('')}</nav>

    <section class="context chapter" id="context" aria-labelledby="context-title">
      <div class="section-top"><span class="mono">02 / ROOM TO THINK</span><span class="mono">CONTEXT WINDOW</span></div>
      <div class="context-heading"><h2 id="context-title">我能一起讀，<br>很長的內容。</h2><p>上下文最多容納 105 萬 token；<br>容量大，不代表每個細節都能答對。</p></div>
      <div class="context-number" aria-label="1,050,000 tokens"><span>1,050,000</span><small class="mono">TOKENS</small></div>
      <div class="context-field" aria-hidden="true"><div class="context-strands"></div><span class="needle"></span><span class="needle-label mono">ONE DETAIL</span><span class="field-label mono">A MILLION THINGS.<br>ONE QUESTION.</span></div>
      <div class="context-foot"><span>規格數據 · OpenAI</span><a href="#evidence">容量與準確率是兩件事 ↗</a></div>
    </section>

    <section class="work chapter" id="work" aria-labelledby="work-title">
      <div class="section-top"><span class="mono">03 / WORKING TOGETHER</span><span class="mono">YOU SET THE DIRECTION</span></div>
      <div class="work-layout"><div class="work-heading"><h2 id="work-title">你定方向，<br>我來拆解。</h2><p>給我目標、檔案與驗收條件；<br>我可以修改程式，再用工具檢查結果。</p><span class="work-prompt">選一個階段，看工作如何改變。 <span aria-hidden="true">↘</span></span></div>
      <div class="work-stage">
        <div class="process-art" data-state="0" aria-hidden="true"><svg viewBox="0 0 760 440"><defs><linearGradient id="thread" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#60436e"/><stop offset=".48" stop-color="#c6a9df"/><stop offset="1" stop-color="#e45740"/></linearGradient><filter id="thread-shadow"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#45294e" flood-opacity=".13"/></filter></defs><g class="threads" fill="none" stroke="url(#thread)" stroke-width="1.4" filter="url(#thread-shadow)"></g></svg><div class="process-marker marker-a mono">YOUR INTENTION</div><div class="process-marker marker-b mono">A CHECKABLE RESULT</div><div class="process-core"><span class="core-symbol">?</span></div></div>
        <div class="step-buttons" role="group" aria-label="切換合作階段"><button class="step active" data-step="0" aria-pressed="true"><span class="mono">01</span>讀懂目標 <span>↗</span></button><button class="step" data-step="1" aria-pressed="false"><span class="mono">02</span>動手實作 <span>↗</span></button><button class="step" data-step="2" aria-pressed="false"><span class="mono">03</span>檢查結果 <span>↗</span></button></div>
      </div></div>
      <div class="work-note"><span class="mono">SELF-DESCRIPTION</span><p id="step-description" aria-live="polite">先找出入口、限制與驗收方式，避免改對程式卻做錯題目。</p><small>自己的工作描述，非評測結果。</small></div>
    </section>

    <section class="scores chapter" id="scores" aria-labelledby="scores-title">
      <div class="section-top"><span class="mono">04 / MEASURED, NOT MYTHICAL</span><a href="#evidence">看完整評測與版本 ↗</a></div>
      <div class="score-opening"><div class="score-heading"><h2 id="scores-title">我的成績，<br>攤開來看。</h2><p>同一套評測裡，我排第五；<br>前一名同分，後一名是另一個推理設定。</p></div><div class="score-number"><span>57</span><div class="score-label"><b>INTELLIGENCE<br>INDEX</b><span class="mono">#05 / 62 MODELS</span></div></div></div>
      <div class="score-display"><div class="score-architecture"><div id="score-scene" class="score-scene" aria-hidden="true"></div><div class="benchmark-sculpture" aria-label="指數比較：Claude Opus 5.5 xhigh with fallback 57、GPT-6 Astra max 57、GPT-6 Astra xhigh 55、GPT-6.1 Sol max 55">${[
        ['57','Claude Opus 5.5','xhigh with fallback','PREVIOUS / #04'],['57','GPT-6 Astra','max','ME / #05'],['55','GPT-6 Astra','xhigh','NEXT / #06'],['55','GPT-6.1 Sol','max','SAME DEVELOPER / #08']
      ].map((m,i)=>`<div class="score-column column-${i}"><div class="column-data"><strong>${m[0]}</strong><span class="mono">${m[3]}</span><b>${m[1]}</b><small>(${m[2]})</small></div></div>`).join('')}</div><span class="zero-label mono" aria-hidden="true">0 — SHARED BASELINE</span></div></div>
      <div class="score-controls"><button id="score-spread" aria-pressed="false"><span class="spread-symbol" aria-hidden="true">↕</span><span class="spread-label">拆開每一分</span></button><p>一片一分。展開後，分數與共同零點不變。</p></div>
      <div class="scores-foot"><span>Artificial Analysis Intelligence Index <b>v5.0.1</b><br>GPT-6 Astra (max) · 查詢 2026-11-04</span><span>每一層代表 1 分，從零起算。<br>這是指數分數，不是答對百分比。</span></div>
    </section>

    <section class="limits chapter" id="limits" aria-labelledby="limits-title">
      <div class="section-top"><span class="mono">05 / THE EDGES ARE REAL</span><span class="mono">CAPABILITY ≠ CERTAINTY</span></div>
      <div class="limits-layout"><div class="limits-heading"><h2 id="limits-title">有些事，<br>我不能<br>直接做。</h2><p>模型本身不支援音訊或影片輸入；<br>也不支援微調。接上工具是另一件事。</p></div><div class="limits-art"><div id="limits-scene" role="img" aria-label="兩片具有厚度與截面的紫色曲面，中間留有不能跨越的空隙"></div><span class="limit-hairline" aria-hidden="true"></span><span class="mono limit-zero" aria-hidden="true">THE LIMIT IS REAL</span></div></div>
      <div class="limits-bottom"><div><span class="mono">01 / AUDIO & VIDEO</span><h3>不能直接聽，也不能直接看影片。</h3></div><div><span class="mono">02 / FINE-TUNING</span><h3>不能用你的資料直接微調我。</h3></div></div>
    </section>

    <section class="evidence chapter" id="evidence" aria-labelledby="evidence-title">${renderEvidence()}</section>
  </main>
  <footer class="footer"><a href="#home">GPT-6 ASTRA <span>↑</span></a><p>模型開發：OpenAI<br>作品設計與實作：本次 Codex 工作階段</p><span class="mono">A SELF-PORTRAIT.<br>NOT A PROMISE OF PERFECTION.</span></footer>
`

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const sculpture = createSculpture(document.querySelector<HTMLDivElement>('#sculpture')!, reduceMotion)
const scoreScene=createScoreScene(document.querySelector<HTMLElement>('#score-scene')!, reduceMotion)
createLimitsScene(document.querySelector<HTMLElement>('#limits-scene')!, reduceMotion)
document.querySelector<HTMLButtonElement>('#score-spread')!.addEventListener('click',event=>{
  const button=event.currentTarget as HTMLButtonElement
  const open=button.getAttribute('aria-pressed')!=='true'
  button.setAttribute('aria-pressed',String(open))
  button.querySelector('.spread-label')!.textContent=open?'收回整體成績':'拆開每一分'
  scoreScene.setSpread(open?1:0)
})
const range = document.querySelector<HTMLInputElement>('#unfold')!
range.addEventListener('input', () => {
  const v = Number(range.value)
  document.querySelector<HTMLOutputElement>('#unfold-value')!.value = `${String(v).padStart(2,'0')}%`
  range.style.setProperty('--value', `${v}%`)
  sculpture.setUnfold(v / 100)
})

const strands = document.querySelector<HTMLDivElement>('.context-strands')!
strands.innerHTML = Array.from({length:48},(_,i)=>`<span style="--i:${i}"></span>`).join('')
const threadGroup = document.querySelector<SVGGElement>('.threads')!
const paths = Array.from({length:56},() => {
  const path = document.createElementNS('http://www.w3.org/2000/svg','path')
  threadGroup.append(path)
  return path
})
let phase = 0, targetPhase = 0, frame = 0
function drawThreads() {
  phase = reduceMotion.matches ? targetPhase : phase + (targetPhase-phase)*.075
  paths.forEach((path,i) => {
    const y = 55+i*6
    const gather=Math.min(phase,1),verify=Math.max(0,phase-1)
    const spread = Math.sin(i*.29)*130*(1-gather)
    const center = 220 + (i-27.5)*(.65+verify*.7)
    const right = y*(1-verify)+(220+(i-27.5)*3)*verify
    path.setAttribute('d',`M 20 ${y} C 160 ${y+spread}, 228 ${center+spread}, 380 ${center} S 600 ${right-spread}, 740 ${right}`)
  })
  if(Math.abs(phase-targetPhase)>.001) frame=requestAnimationFrame(drawThreads)
}
drawThreads()
const stepDescriptions = [
  '先找出入口、限制與驗收方式，避免改對程式卻做錯題目。',
  '例如把桌面版重排成手機版，修改樣式與互動；不能只憑程式碼宣稱畫面正確。',
  '執行建置、操作頁面、檢查截圖；沒有跑過的測試，不當成已通過。'
]
document.querySelectorAll<HTMLButtonElement>('.step').forEach(button=>button.addEventListener('click',()=>{
  targetPhase=Number(button.dataset.step)
  document.querySelectorAll('.step').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button))})
  document.querySelector<HTMLElement>('.process-art')!.dataset.state=String(targetPhase)
  document.querySelector('.core-symbol')!.textContent=['?','{ }','✓'][targetPhase]
  document.querySelector('#step-description')!.textContent=stepDescriptions[targetPhase]
  cancelAnimationFrame(frame);drawThreads()
}))

let scrollQueued = false
function onScroll() {
  if(scrollQueued) return
  scrollQueued=true
  requestAnimationFrame(()=>{
    const context=document.querySelector<HTMLElement>('.context')!
    const rect=context.getBoundingClientRect()
    const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)))
    context.style.setProperty('--progress',String(reduceMotion.matches ? .5 : progress))
    scrollQueued=false
  })
}
addEventListener('scroll',onScroll,{passive:true})
onScroll()
