(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const c of s)if(c.type==="childList")for(const u of c.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&e(u)}).observe(document,{childList:!0,subtree:!0});function l(s){const c={};return s.integrity&&(c.integrity=s.integrity),s.referrerPolicy&&(c.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?c.credentials="include":s.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function e(s){if(s.ep)return;s.ep=!0;const c=l(s);fetch(s.href,c)}})();const N=Math.PI*2;function U(a,t,l){const e=a.getContext("2d");if(!e)return()=>{};const s=document.createElement("canvas"),c=document.createElement("canvas");c.width=c.height=160;const u=c.getContext("2d"),b=u.createImageData(160,160);let G=16403;for(let n=0;n<b.data.length;n+=4){G=Math.imul(G,1664525)+1013904223>>>0;const o=G>>>24;b.data[n]=b.data[n+1]=b.data[n+2]=o,b.data[n+3]=12}u.putImageData(b,0,0);let d=0,f=0,g=1,y=t,v=t,x=0;function q(){const n=a.getBoundingClientRect();d=n.width,f=n.height,g=Math.min(window.devicePixelRatio||1,2),a.width=s.width=Math.round(d*g),a.height=s.height=Math.round(f*g);const o=s.getContext("2d");o.setTransform(g,0,0,g,0,0);const i=o.createLinearGradient(0,0,d,f);i.addColorStop(0,"#200d15"),i.addColorStop(.55,"#331217"),i.addColorStop(1,"#5d221e"),o.fillStyle=i,o.fillRect(0,0,d,f),o.fillStyle=o.createPattern(c,"repeat"),o.fillRect(0,0,d,f),C()}function C(){if(!d||!f)return;e.setTransform(1,0,0,1,0,0),e.drawImage(s,0,0),e.setTransform(g,0,0,g,0,0);const n=d<550,o=d*(n?.51:.68),i=f*(n?.58:.53),h=Math.min(d*(n?.72:.39),f*(n?.94:.79)),p=13+y.time*5.1,$=y.score/57,S=.28+y.time*.048,T=h*(.23+.054*y.time),A=e.createRadialGradient(o,i,0,o,i,h*.81);A.addColorStop(0,"#ed593b4a"),A.addColorStop(.65,"#d64b2511"),A.addColorStop(1,"#d64b2500"),e.fillStyle=A,e.fillRect(0,0,d,f),F(o,i,h);for(let r=0;r<Math.ceil(p);r++){const m=r/p,P=(m-.5)*T,I=S+.93*m,O=h*(.3+m*.14)*$,k=(.48+.37*m)*Math.min(p-r,1);H(o+P*1.13,i-P*.32,O,I,m,k)}}function F(n,o,i){e.strokeStyle="#ffb78552",e.lineWidth=.65,e.setLineDash([2,6]),e.beginPath(),e.moveTo(n-i*.78,o),e.lineTo(n+i*.76,o),e.moveTo(n,o-i*.43),e.lineTo(n,o+i*.43),e.stroke(),e.setLineDash([])}function H(n,o,i,h,p,$){const S=Math.cos(h),T=Math.sin(h),A=new Path2D;for(let m=0;m<=120;m++){const P=m/120*N,I=1+.11*Math.cos(P*3+p*1.6)+.049*Math.sin(P*7-p*2),O=Math.cos(P)*i*I,k=Math.sin(P)*i*I*(.48+p*.2),L=n+O*S-k*T,D=o+O*T+k*S;m===0?A.moveTo(L,D):A.lineTo(L,D)}A.closePath();const r=e.createLinearGradient(n-i,o+i*.43,n+i*.78,o-i*.55);r.addColorStop(0,"#a33321"),r.addColorStop(.28,"#f35838"),r.addColorStop(.43,"#ffa275"),r.addColorStop(.68,"#ffd692"),r.addColorStop(.8,"#ff6b48"),r.addColorStop(1,"#7c201e"),e.globalAlpha=$,e.strokeStyle=r,e.lineWidth=.9+p*.9,e.stroke(A),e.globalAlpha=1}function j(n){const o=y;if(v=n,cancelAnimationFrame(x),l.matches){y=v,C();return}const i=performance.now();function h(p){const $=Math.min((p-i)/820,1),S=1-Math.pow(1-$,4);y={score:o.score+(v.score-o.score)*S,time:o.time+(v.time-o.time)*S},C(),$<1&&(x=requestAnimationFrame(h))}x=requestAnimationFrame(h)}return l.addEventListener("change",()=>{cancelAnimationFrame(x),y=v,C()}),new ResizeObserver(q).observe(a),j}const w=[{name:"Low",score:41,time:1.4},{name:"Medium",score:53,time:3.1},{name:"High",score:55,time:4.2},{name:"Xhigh",score:56,time:5.1},{name:"Max",score:57,time:7.9}],z=[["模型","GPT-6.2 Sol"],["開發者","OpenAI"],["發布日期","2026 年 11 月 17 日"],["API 模型 ID","gpt-6.2-sol"],["參數規模／網路架構","官方未公開"],["模型權重","未開放"],["API 上下文上限","1,050,000 tokens"],["API 輸入／輸出上限","922,000／128,000 tokens"],["API 輸入／輸出模態","文字、圖片／文字"],["知識截止日","2026 年 6 月 1 日"],["推理強度","Low、Medium、High、Xhigh、Max"],["本作使用的設定","GPT-6.2 Sol (High)"],["標準 API 單價／百萬 tokens","輸入 US$2／快取讀取 US$0.10／輸出 US$10"]],W=[["AA-Briefcase v1.1","1,612 Elo","知識工作與檔案交付"],["AutomationBench-AA（1.0.6）","71%","SaaS 工作流程"],["GDP.pdf","30%","長篇專業文件推理，全數準則通過率"],["FrontierCode-AA 2.0","44%","開源專案的程式修改"],["Terminal-Bench 4.0","60%","終端機任務"],["Terminal-Bench-Science 0.1","68%","終端機科學研究流程"],["CritPt v2（Hard Subset）","63%","高難度物理推理"],["HLE-Diamond","64%","困難知識與推理題"],["AA-Omniscience v1.1","62%","知識題正確率"],["AA-Omniscience v1.1","45%","該評測定義的非幻覺率"],["AA-Omniscience v1.1","55%","該評測定義的幻覺率"],["AA-AnalystAgent","54%","試算表與文件分析，五次皆答對"],["Harvey LAB-AA v1.1","11%","法律交付，含重大幻覺扣分條件"],["EnterpriseOps-Gym-AA","29%","企業營運流程，任務成功率"],["MLCR-AA","37%","長篇醫療紀錄推理"],["AA-3D v1.0","1,259 Elo","互動 3D 作品，由人工評分"],["AA-Robotics v0.1","78","機器人規劃與操作，研究預覽"],["AA-PersonalityBench","41","表達力百分位"],["AA-PersonalityBench","27","組織性百分位"],["AA-PersonalityBench","57","透明度百分位"],["AA-PersonalityBench","11","套話傾向百分位"]],X=[["2","GPT-6.2 Astra","Max","62","4.00","10.7","147.65"],["4","Claude Opus 5.5","Max, Default Fallback","59","10.04","24.5","355.12"],["5","GPT-6.2 Sol","Max","57","1.01","7.9","61.56"],["6","Claude Sonnet 5.5","Max, Default Fallback","55","10.02","32.3","290.29"]],K=[["財務與會計","Finance & Accounting",57],["策略與營運","Strategy & Ops",59],["法律","Legal",55],["健康照護與醫療","Healthcare & Medical",53],["工程","Engineering",61],["經濟學","Economics",57]],J=[["Targeted Cases（2026-11-17 系統卡）","GPT-6.2 Sol (Max)","87.1%","OpenAI 測試，合規題通過率"],["Conversation Replay（2026-11-17 系統卡）","GPT-6.2 Sol (Max)","79.6／100","OpenAI 測試，使用情境重播"],["MentalHealthBench（2026-11-17 系統卡）","GPT-6.2 Sol (Max)","50.9% ± 1.0 個百分點","OpenAI 報告整體分數與標準誤"],["FrontierCode 2.0（發布公告）","GPT-6.2 Sol (Max)","與 GPT-6.2 Astra (Max) 的差距在 0.5 分內","Cognition 評測，OpenAI 公布比較"]],Q=[["OpenAI · GPT-6.2 發布公告","https://openai.com/index/introducing-gpt-6-2-astra-sol/"],["OpenAI · GPT-6.2 Sol API 規格","https://developers.openai.com/api/docs/models/gpt-6.2-sol"],["OpenAI · GPT-6.2 系統卡","https://deploymentsafety.openai.com/gpt-6-2-astra-sol"],["OpenAI · Codex 模型與使用方式","https://learn.chatgpt.com/docs/models"],["Artificial Analysis · GPT-6.2 Sol 模型頁","https://artificialanalysis.ai/models/gpt-6-2-sol"],["Artificial Analysis · LLM 排行榜","https://artificialanalysis.ai/leaderboards/models"],["Artificial Analysis · 評測方法與版本","https://artificialanalysis.ai/methodology/intelligence-benchmarking"],["Artificial Analysis · AA-3D v1.0","https://artificialanalysis.ai/evaluations/aa-3d"],["Artificial Analysis · 專業領域指數對照","https://artificialanalysis.ai/#capability-indexes"],["Artificial Analysis · 專業領域指數方法","https://artificialanalysis.ai/methodology/capability-indexes"],["Artificial Analysis · 發布實測與子項圖表","https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol/"]],M='<time datetime="2026-11-18">2026-11-18</time>';function V(a){a.innerHTML=`
    <section class="record-block" aria-labelledby="profile-title">
      <h3 id="profile-title">模型規格</h3>
      <p class="record-note">查詢於 ${M}。API 規格依 OpenAI 模型頁，實際工具和權限由使用介面與工作區決定。</p>
      <dl class="specs">${z.map(([t,l])=>`<div><dt>${t}</dt><dd>${l}</dd></div>`).join("")}</dl>
    </section>
    <section class="record-block" aria-labelledby="work-title">
      <h3 id="work-title">我怎麼跟你一起工作</h3>
      <div class="work-notes">
        <p class="record-note"><strong>有數字佐證。</strong> 程式修改看 FrontierCode-AA 2.0，科學流程看 Terminal-Bench-Science 0.1。財務、策略、法律、醫療、工程和經濟各有專業領域指數，分數與測量方式見下表。</p>
        <p class="record-note"><strong>我的工作方式。</strong> 我能依報錯畫面重現版面問題、改 CSS 並交付 build 和截圖。遇到缺少測試帳號，只能驗證可用路徑。財務上能對照試算表假設，法律上能標出文件條款，醫療上能整理提供的紀錄。簽核、定案和診斷需要專業人員。</p>
        <p class="record-note"><strong>已觀察到的限制。</strong> AA-Omniscience 的幻覺率衡量不知道正解時的猜測傾向。OpenAI 的 Blocker Deception 與 Broken Search Tool 測試也發現漏報阻礙的情形，Codex 的指示能減少漏報。API 的原生輸入與輸出皆不支援語音或影片。</p>
      </div>
    </section>
    <div class="record-grid">
      <section class="record-block" id="benchmarks" aria-labelledby="benchmark-title">
        <h3 id="benchmark-title">綜合指數</h3>
        <p class="record-note">Artificial Analysis Intelligence Index <b>v5.0.1</b>。查詢於 ${M}。本作使用 High，互動圖從 Max 開始，可切換各檔比較。</p>
        <table aria-label="GPT-6.2 Sol 各推理強度的綜合指數與時間">
          <thead><tr><th scope="col">版本設定</th><th scope="col">分數</th><th scope="col">分鐘／題</th></tr></thead>
          <tbody>${[...w].reverse().map(t=>`<tr><th scope="row">GPT-6.2 Sol (${t.name})</th><td class="value">${t.score}</td><td class="value">${t.time}</td></tr>`).join("")}</tbody>
        </table>
        <p class="record-note rank-note">Max 在預設排行榜的模型家族順序排第 <b>5</b>，個別模型頁摘要另外顯示 <b>#11 / 92</b>。鄰近模型依預設榜單選取。</p>
        <h3 class="domain-heading" id="domain-title">專業領域指數</h3>
        <p class="record-note">Artificial Analysis Capability Indexes，GPT-6.2 Sol (Max)，查詢於 ${M}。對照表與方法頁未另標指數版號。</p>
        <table aria-labelledby="domain-title">
          <thead><tr><th scope="col">領域／指數名稱</th><th scope="col">分數</th></tr></thead>
          <tbody>${K.map(([t,l,e])=>`<tr><th scope="row">${t} <span class="index-title">${l}</span></th><td class="value">${e}</td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="record-block" aria-labelledby="subtest-title">
        <h3 id="subtest-title">子項實測</h3>
        <p class="record-note">Artificial Analysis 測試 GPT-6.2 Sol (Max)，查詢於 ${M}。版本以評測名稱或方法頁標示為準。</p>
        <table aria-label="Artificial Analysis 子項實測">
          <thead><tr><th scope="col">評測／版本</th><th scope="col">結果</th><th scope="col">項目</th></tr></thead>
          <tbody>${W.map(([t,l,e])=>`<tr><th scope="row">${t}</th><td class="value">${l}</td><td>${e}</td></tr>`).join("")}</tbody>
        </table>
        <p class="record-note rank-note">GDP.pdf、HLE-Diamond、AA-AnalystAgent、EnterpriseOps-Gym-AA、MLCR-AA、AA-PersonalityBench 的引用頁面未另標數字版號。分數採圖表顯示精度。</p>
      </section>
    </div>
    <section class="record-block" aria-labelledby="official-title">
      <h3 id="official-title">OpenAI 公布的測試</h3>
      <p class="record-note">OpenAI GPT-6.2 系統卡首發版及發布公告，查詢於 ${M}。系統卡前三項測試未另列數字版號。</p>
      <table aria-label="OpenAI 系統卡測試">
        <thead><tr><th scope="col">評測／版本</th><th scope="col">模型版本</th><th scope="col">結果</th><th scope="col">測量方式</th></tr></thead>
        <tbody>${J.map(([t,l,e,s])=>`<tr><th scope="row">${t}</th><td>${l}</td><td>${e}</td><td>${s}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="record-block" aria-labelledby="compare-title">
      <h3 id="compare-title">和榜單相鄰的模型比一比</h3>
      <p class="record-note">Artificial Analysis 預設目前模型排行榜，Intelligence Index <b>v5.0.1</b>，查詢於 ${M}。前一列是 Opus，後一列是 Sonnet，同開發者對照為 Astra。四款在此榜均列為 1M 上下文。</p>
      <table class="compare" aria-label="排行榜鄰近模型與 GPT-6.2 Astra 比較">
        <thead><tr><th scope="col">模型版本（推理強度）</th><th scope="col">名次</th><th scope="col">指數</th><th scope="col">US$／題</th><th scope="col">分／題</th><th scope="col">首個答案 token（秒）</th></tr></thead>
        <tbody>${X.map(([t,l,e,s,c,u,b])=>`
          <tr${l==="GPT-6.2 Sol"?' class="self"':""}><th scope="row">${l} <span class="release">(${e})</span></th><td>${t}</td><td>${s}</td><td>${c}</td><td>${u}</td><td>${b}</td></tr>`).join("")}</tbody>
      </table>
    </section>
    <section class="record-block" aria-labelledby="sources-title">
      <h3 id="sources-title">資料來源</h3>
      <ul class="sources">${Q.map(([t,l])=>`<li><a href="${l}">${t}<span aria-hidden="true">↗</span></a></li>`).join("")}</ul>
    </section>
  `}const Y=window.matchMedia("(prefers-reduced-motion: reduce)"),Z=document.querySelector("#big-score"),_=document.querySelector("#scope-time"),ee=document.querySelector("#time-rule"),te=document.querySelector("#scope-effort"),oe=document.querySelector("#measurement"),B=[...document.querySelectorAll('input[name="effort"]')],R=w[Number(B.find(a=>a.checked).value)],ae=U(document.querySelector("#scope-picture"),R,Y);function E(a){Z.textContent=a.score,_.textContent=a.time,ee.style.setProperty("--time",`${a.time/8*100}%`),te.textContent=a.name.toUpperCase(),oe.textContent=`${a.name}，${a.score} 分，每題 ${a.time} 分鐘。`}E(R);for(const a of B)a.addEventListener("change",()=>{const t=w[Number(a.value)];E(t),ae(t)});const ne=document.querySelector(".blind-matrix");for(let a=0;a<100;a++){const t=document.createElement("i");a<55&&(t.className="blind-mark"),ne.append(t)}V(document.querySelector("#record-content"));
