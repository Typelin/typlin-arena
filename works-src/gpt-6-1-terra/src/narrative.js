import './narrative.css';

const cases = [
  {
    key: 'vision', number: '01', name: '讀懂圖面', en: 'IMAGE → WORDS',
    heading: '從圖片找線索。',
    description: '把圖面交給我，我可以整理標註與看見的內容。',
    input: '輸入：一張有尺寸標註的平面圖',
    output: '可能的結果：整理尺寸、指出需要確認的細節',
    boundary: '模糊標註可能看錯；施工前仍須由專業人員核對。',
    art: `<div class="narrative-drawing" aria-hidden="true"><div class="drawing-paper"><div class="drawing-top"><span>PLAN / 04</span><span>VISUAL INPUT</span></div><svg viewBox="0 0 520 340" fill="none"><path d="M66 54H455V285H66z M66 154H244V285 M244 54V218H455 M66 213H151 M350 54V143" stroke="currentColor" stroke-width="5"/><path d="M95 24H425M95 17v15M425 17v15M27 80v175M20 80h15M20 255h15" stroke="currentColor" stroke-width="1.3"/><path d="M66 154a82 82 0 0 1 82 82 M350 54a88 88 0 0 0 88 88" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 5"/><circle cx="244" cy="154" r="39" stroke="#e5edb5" stroke-width="1"/><circle cx="244" cy="154" r="6" fill="#e5edb5"/><path d="M244 109v90M199 154h90" stroke="#e5edb5" stroke-width="1"/></svg><div class="drawing-bottom"><span>IMAGE / INTERPRETATION</span><span>尺寸 → 文字</span></div><span class="drawing-stamp">READ<br>THE<br>DETAIL</span></div></div>`
  },
  {
    key: 'code', number: '02', name: '修正程式', en: 'CODE → TEST',
    heading: '把修改跑一次。',
    description: '我可以讀取程式、提出修改，並在有工具時執行測試。',
    input: '輸入：重現方式、相關程式與預期結果',
    output: '可能的結果：修正檔案，並回報實際測試',
    boundary: '測試通過不代表所有情況都正確；看不到的環境仍需確認。',
    art: `<div class="narrative-code" aria-hidden="true"><div class="code-orbit orbit-a"></div><div class="code-orbit orbit-b"></div><div class="code-card"><div class="code-heading"><span>●　●　●</span><span>PATCH / EXAMPLE</span></div><div class="code-lines"><span><i>01</i> <b>function</b> layout(viewport) {</span><span><i>02</i>　<b>return</b> viewport &lt; <em>640</em></span><span class="code-highlight"><i>03</i>　　? <em>'stack'</em> : <em>'grid'</em>;</span><span><i>04</i> }</span><span><i>05</i></span><span><i>06</i> <u>test</u>('mobile fits', () =&gt; {</span><span><i>07</i>　expect(overflow).toBe(<b>false</b>);</span><span><i>08</i> });</span></div><div class="code-result"><span>✓　BUILD PASSED</span><span>CHECK / 01</span></div></div><div class="code-big">{ }</div></div>`
  },
  {
    key: 'verify', number: '03', name: '核對資料', en: 'CLAIM → SOURCE',
    heading: '答案要有出處。',
    description: '有搜尋工具時，我可以查找來源，再比對說法。',
    input: '輸入：一項需要驗證的具體主張',
    output: '可能的結果：標明資料來源、日期與不確定處',
    boundary: '搜尋結果也可能過時或錯誤；重要決策應回到原始資料。',
    art: `<div class="narrative-verify" aria-hidden="true"><div class="verify-rail"><span>CLAIM</span><span>COMPARE</span><span>SOURCE</span></div><div class="verify-sheet sheet-one"><span>01 / CLAIM</span><div class="verify-lines"><i></i><i></i><i></i></div><div class="verify-seal">?</div><small>CHECK THE DETAIL</small></div><div class="verify-link"><span>↗</span><span>TRACE<br>THE SOURCE</span></div><div class="verify-sheet sheet-two"><span>02 / EVIDENCE</span><div class="verify-lines"><i></i><i></i><i></i><i></i></div><div class="verify-seal">✓</div><small>DATE / CONTEXT / SOURCE</small></div></div>`
  }
];

export function mountNarrative(container) {
  container.innerHTML = `<section class="narrative" aria-labelledby="narrative-title">
    <div class="narrative-top"><span>FIELD NOTES / 03 TASKS</span><span>GPT-6.1 TERRA × HUMAN</span></div>
    <div class="narrative-intro"><div><p class="narrative-kicker">SELECT A TASK　↓</p><h2 id="narrative-title">給我一件事，<br>看看我怎麼協助。</h2></div><p>選擇任務，查看輸入、可能的結果與限制。<br><small>以下為示意，並非即時模型推論。</small></p></div>
    <div class="narrative-work"><div class="narrative-controls" role="group" aria-label="選擇任務">${cases.map((item, i) => `<button type="button" class="narrative-choice" data-case="${i}" aria-pressed="${i === 0}"><span>${item.number}</span><strong>${item.name}</strong><span class="narrative-arrow" aria-hidden="true">↗</span></button>`).join('')}<div class="narrative-control-note">THREE EXAMPLES<br>ONE MODEL<br><span>文字 · 圖片 · 工具</span></div></div>
      <div class="narrative-panel" data-scene="vision"><div class="narrative-panel-top"><span class="narrative-panel-index">CASE / 01</span><span class="narrative-panel-en">IMAGE → WORDS</span></div><div class="narrative-art" aria-hidden="true"></div><div class="narrative-caption" aria-live="polite"><div><h3></h3><p class="narrative-description"></p></div><div class="narrative-facts"><p class="narrative-input"></p><p class="narrative-output"></p><p class="narrative-boundary"></p></div></div></div></div>
  </section>`;

  const root = container.querySelector('.narrative');
  const panel = root.querySelector('.narrative-panel');
  const buttons = [...root.querySelectorAll('.narrative-choice')];
  const setCase = index => {
    const item = cases[index];
    panel.dataset.scene = item.key;
    panel.querySelector('.narrative-panel-index').textContent = `CASE / ${item.number}`;
    panel.querySelector('.narrative-panel-en').textContent = item.en;
    panel.querySelector('.narrative-art').innerHTML = item.art;
    panel.querySelector('h3').textContent = item.heading;
    panel.querySelector('.narrative-description').textContent = item.description;
    panel.querySelector('.narrative-input').textContent = item.input;
    panel.querySelector('.narrative-output').textContent = item.output;
    panel.querySelector('.narrative-boundary').textContent = item.boundary;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => setCase(i)));
  setCase(0);
}
