import './token-stage.css';

export function mountTokens(container) {
  container.innerHTML = `<section class="token-stage" id="token-story"><div class="token-stage-top"><span>INSIDE THE CONVERSATION</span><span>你提供內容 → 我產生文字</span></div><div class="token-stage-intro"><div><p>GENERATIVE PRE-TRAINED TRANSFORMER</p><h2>片段接著片段，<br>回應逐漸成形。</h2></div><p>GPT 處理文字時使用稱為 token 的單位。輸入你的句子，看看內容如何被切成片段。</p></div><div class="token-lab"><div class="token-lab-caption"><span>TRY IT / 輸入你想說的話</span><span>概念示意，不是真實 tokenizer</span></div><div class="token-input-row"><label for="token-input">你的文字</label><input id="token-input" type="text" maxlength="42" value="幫我整理這份會議紀錄" autocomplete="off" spellcheck="false"><span>↗</span></div><div class="token-flow" aria-hidden="true"><div class="token-route"><i></i><i></i><i></i><i></i><i></i></div><div class="token-fragments"></div><div class="token-model"><small>OPENAI</small><strong>GPT</strong><span>6.1 TERRA</span></div><div class="token-arrival"><small>OUTPUT</small><strong>文字回應<span>_</span></strong><div></div></div></div><div class="token-lab-footer"><span>片段分割僅為視覺示意，實際 token 數與切分方式會不同。</span><a href="https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens">什麼是 token？ ↗</a></div></div></section>`;
  const originalField = container.querySelector('#token-input');
  const field = document.createElement('textarea');
  field.id = originalField.id;
  field.value = originalField.value;
  field.rows = 2;
  field.spellcheck = false;
  originalField.replaceWith(field);
  container.querySelector('.token-input-row > span').textContent = '↳';
  field.removeAttribute('maxlength');
  field.setAttribute('aria-describedby','token-count');
  container.querySelector('.token-input-row').insertAdjacentHTML('afterend','<p class="token-count" id="token-count" role="status"></p>');
  container.querySelector('.token-arrival').innerHTML = '<small>FIXED EXAMPLE / 固定示例</small><strong>會議重點<span>_</span></strong><div></div><p>摘要　·　決議　·　待辦</p>';
  container.querySelector('.token-lab-footer span').textContent = '片段為視覺示意；固定範例與輸入無關。文字只在本頁處理，不會傳送。';
  const fragments = container.querySelector('.token-fragments');
  const segment = value => typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('zh-Hant', {granularity:'grapheme'}).segment(value)].map(part => part.segment) : Array.from(value);
  const draw = () => {
    const entered = segment(field.value);
    const truncated = entered.length > 24;
    if (truncated) field.value = entered.slice(0,24).join('');
    container.querySelector('#token-count').textContent = truncated ? '已達上限：24 個字形' : `${entered.length} / 24 個字形`;
    const value = field.value.trim() || '輸入一些文字';
    const chunks = segment(value).slice(0,24);
    fragments.replaceChildren(...chunks.map((chunk, index) => {
      const item = document.createElement('span');
      item.textContent = chunk === ' ' ? '·' : chunk;
      item.style.setProperty('--i', index);
      item.style.setProperty('--count', chunks.length);
      return item;
    }));
  };
  field.addEventListener('input', event => {
    if (event.isComposing) return;
    draw();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) container.querySelector('.token-arrival strong').animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:850,easing:'steps(6,end)'});
  });
  field.addEventListener('compositionend', draw);
  draw();
}
