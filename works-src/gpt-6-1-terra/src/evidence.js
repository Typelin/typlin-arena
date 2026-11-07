import './evidence.css';

const datasets = {
  index: { title:'整體指數', version:'Artificial Analysis Intelligence Index v5.0.1', left:51, right:57, unit:'', note:'九項評測的綜合指數，反映知識工作、程式、科學與一般能力。' },
  code: { title:'命令列程式任務', version:'Terminal-Bench 4.0', left:55.6, right:59.1, unit:'%', note:'Artificial Analysis 使用自己的測試條件，評估代理在終端機完成工作。' },
  frontier: { title:'程式競賽題', version:'FrontierCode 2.0', left:42.3, right:42.4, unit:'%', note:'Artificial Analysis 測試同一評測版本下的程式解題表現。' },
  science: { title:'以程式執行研究', version:'Terminal-Bench-Science 0.1', left:57.6, right:63.3, unit:'%', note:'測試使用命令列與程式工具處理科學任務。' }
};

export function mountEvidence(container) {
  container.innerHTML = `<section class="evidence-world" id="evidence">
    <div class="evidence-top"><span>04 / THE EVIDENCE</span><span>數字有測試條件</span></div>
    <div class="evidence-intro"><div><p>實力，需要證據</p><h2>能力不只<br>一個分數。</h2></div><p class="evidence-lead">同一個模型，在不同工作與測試條件下會有不同結果。選一項看看。</p></div>
    <div class="evidence-switch" aria-label="選擇評測"><button class="active" type="button" data-evidence="index" aria-pressed="true">01　整體指數</button><button type="button" data-evidence="code" aria-pressed="false">02　程式任務</button><button type="button" data-evidence="frontier" aria-pressed="false">03　程式競賽</button><button type="button" data-evidence="science" aria-pressed="false">04　科學任務</button></div>
    <div class="evidence-stage"><div class="evidence-watermark" aria-hidden="true">51</div><div class="evidence-text"><span class="evidence-version">Artificial Analysis Intelligence Index v5.0.1</span><h3>整體指數</h3><p class="evidence-note"></p></div><div class="evidence-chart" role="img" aria-label="GPT-6.1 Terra 與 GPT-6 Astra 的評測比較"><div class="evidence-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div class="evidence-columns"><div class="evidence-column"><div class="evidence-number" data-number="left">51</div><div class="evidence-bar left"></div><div class="evidence-caption"><strong>GPT-6.1<br>Terra</strong><small>(MAX)</small></div></div><div class="evidence-column"><div class="evidence-number" data-number="right">57</div><div class="evidence-bar right"></div><div class="evidence-caption"><strong>GPT-6<br>Astra</strong><small>(MAX)</small></div></div></div></div></div>
    <div class="evidence-bottom"><span>資料：Artificial Analysis · 查詢 2026.11.06</span><a href="#sources">查看完整條件與來源 ↗</a></div>
  </section>`;
  const section = container.querySelector('.evidence-world');
  const change = key => {
    const data = datasets[key];
    section.style.setProperty('--left-ratio', data.left / 100);
    section.style.setProperty('--right-ratio', data.right / 100);
    section.querySelector('.evidence-version').textContent = data.version;
    section.querySelector('.evidence-text h3').textContent = data.title;
    section.querySelector('.evidence-note').textContent = data.note;
    section.querySelector('.evidence-watermark').textContent = data.left;
    section.querySelector('[data-number="left"]').textContent = `${data.left}${data.unit}`;
    section.querySelector('[data-number="right"]').textContent = `${data.right}${data.unit}`;
    section.querySelector('.evidence-chart').setAttribute('aria-label',`${data.version}：GPT-6.1 Terra（Max）${data.left}${data.unit}；GPT-6 Astra（Max）${data.right}${data.unit}。`);
    section.querySelectorAll('button').forEach(button => {
      const active = button.dataset.evidence === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  section.querySelectorAll('button').forEach(button => button.addEventListener('click', () => change(button.dataset.evidence)));
  change('index');
}
