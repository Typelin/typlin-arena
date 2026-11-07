import './limits-stage.css';

const modes = {
  text: { number: '01', label: '文字輸入', en: 'TEXT → TEXT', detail: '可以讀取文字，並以文字回覆。', sample: '一段文字、一份文件、\n或你給出的指令。', output: '整理、改寫、回答。', status: '支援輸入與輸出', motif: 'Aa' },
  image: { number: '02', label: '圖片輸入', en: 'IMAGE → TEXT', detail: '可以接收圖片，並以文字描述或分析。', sample: '一張截圖、一張照片、\n或一份技術圖面。', output: '辨識畫面、說明細節。', status: '支援圖片輸入', motif: '◉' },
  audio: { number: '03', label: '音訊與影片', en: 'AUDIO / VIDEO', detail: '此模型的 API 不直接支援音訊或影片輸入。', sample: '聲音和影片需要其他\n支援的工具或模型。', output: '需先轉為支援的輸入。', status: '不直接支援', motif: '∿' }
};

/** Mount a self-contained illustrative modality exhibit. Returns a disposer. */
export function mountLimits(container) {
  if (!container) throw new Error('A container is required to mount the modality exhibit.');
  container.innerHTML = `<section class="terra-io" aria-labelledby="terra-io-heading" data-mode="text">
    <div class="terra-io-top"><span>THE MODEL / INPUT &amp; OUTPUT</span><span>實際支援的範圍　↘</span></div>
    <div class="terra-io-heading"><div><p class="terra-io-kicker">HOW I RECEIVE THE WORLD　/　01—03</p><h2 id="terra-io-heading">我能接收什麼？<br><em>又能給你什麼？</em></h2></div><p>選擇一種輸入，看看 GPT-6.1 Terra 的 API 能處理什麼。</p></div>
    <div class="terra-io-switch" role="group" aria-label="選擇輸入類型"><button type="button" data-choice="text" aria-pressed="true"><span>01</span> 文字 <b>↗</b></button><button type="button" data-choice="image" aria-pressed="false"><span>02</span> 圖片 <b>↗</b></button><button type="button" data-choice="audio" aria-pressed="false"><span>03</span> 聲音／影片 <b>↗</b></button></div>
    <div class="terra-io-stage">
      <div class="terra-io-stage-top"><span>INPUT / 選擇左側類型</span><span>OPENAI　·　GPT-6.1 TERRA</span><span>OUTPUT / 文字</span></div>
      <div class="terra-io-diagram" aria-hidden="true"><div class="terra-io-orbit orbit-a"></div><div class="terra-io-orbit orbit-b"></div><div class="terra-io-cross cross-a">✳</div><div class="terra-io-cross cross-b">✳</div><div class="terra-io-wire wire-a"></div><div class="terra-io-wire wire-b"></div><div class="terra-io-plate"><span>INPUT</span><strong data-motif>Aa</strong><div class="terra-io-plate-lines"></div><small>01 / SIGNAL</small></div><div class="terra-io-core"><div class="terra-io-core-ring"></div><div class="terra-io-core-face"><small>MODEL</small><b>GPT</b><span>6.1<br>TERRA</span></div></div><div class="terra-io-output"><span>OUTPUT</span><div class="terra-io-output-text">文字<br>回應<span>_</span></div><div class="terra-io-output-lines"></div><small>02 / RESPONSE</small></div></div>
      <div class="terra-io-stage-bottom"><div><span data-number>01</span><b data-en>TEXT → TEXT</b></div><p data-status>支援輸入與輸出</p><span>示意圖，非即時模型推論</span></div>
    </div>
    <div class="terra-io-readout" aria-live="polite" aria-atomic="true"><div class="terra-io-readout-title"><span data-number-copy>01</span><h3 data-label>文字輸入</h3></div><p data-detail>可以讀取文字，並以文字回覆。</p><div><small>輸入的例子</small><p data-sample>一段文字、一份文件、<br>或你給出的指令。</p></div><div><small>可能的協助</small><p data-output>整理、改寫、回答。</p></div></div>
    <div class="terra-io-boundary"><span>THE BOUNDARY / 界線</span><p>沒有提供的資料，我看不到。<br><strong>重要結果仍需要你核對。</strong></p><a href="https://developers.openai.com/api/docs/models/gpt-6.1-terra">OpenAI 模型文件 ↗</a></div>
  </section>`;
  const root = container.querySelector('.terra-io');
  root.querySelector('.terra-io-diagram').innerHTML = `<div class="io-flow-in"><span>01 / INPUT</span><strong data-motif>Aa</strong><small>你提供的內容</small></div><div class="io-flow-path"><span>GPT-6.1 TERRA</span><div class="io-flow-line"><i>→</i></div><small>處理輸入</small></div><div class="io-flow-out"><span>02 / OUTPUT</span><strong class="terra-io-output-text">文字<br>回應<span>_</span></strong><small>可供你檢查的結果</small></div>`;
  const buttons = [...root.querySelectorAll('[data-choice]')];
  function choose(event) {
    const button = event.currentTarget;
    const mode = modes[button.dataset.choice];
    root.dataset.mode = button.dataset.choice;
    root.querySelector('.terra-io-output-text').innerHTML = button.dataset.choice === 'audio' ? '需先<br>轉換<span>↗</span>' : '文字<br>回應<span>_</span>';
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const [selector, value] of Object.entries({ '[data-motif]': mode.motif, '[data-number]': mode.number, '[data-number-copy]': mode.number, '[data-en]': mode.en, '[data-status]': mode.status, '[data-label]': mode.label, '[data-detail]': mode.detail, '[data-sample]': mode.sample, '[data-output]': mode.output })) root.querySelector(selector).textContent = value;
  }
  buttons.forEach(button => button.addEventListener('click', choose));
  return () => buttons.forEach(button => button.removeEventListener('click', choose));
}
