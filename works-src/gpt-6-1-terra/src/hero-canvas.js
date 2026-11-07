import './hero-canvas.css';

// A deliberately illustrative scene, not a model visualisation or live inference.
export function mountHero(container) {
  if (!container) return () => {};
  container.classList.add('terra-signal');
  container.innerHTML = `
    <canvas class="signal-canvas" aria-hidden="true"></canvas>
    <div class="signal-grain" aria-hidden="true"></div>
    <div class="signal-overline"><span>OPENAI / GPT-6.1 TERRA</span><span>AN EXPERIMENT IN UNDERSTANDING</span></div>
    <div class="signal-art" aria-hidden="true"><span class="signal-ghost">GENERATIVE</span><span class="signal-gpt">GPT</span><span class="signal-sub">TEXT · IMAGE · ACTION</span></div>
    <div class="signal-side"><span>01 / INPUT</span><span class="signal-side-line"></span><span>02 / RESPONSE</span></div>
    <div class="signal-panel">
      <div class="signal-copy"><h1>GPT-6.1 Terra <span>by OpenAI</span></h1><strong>從你的問題開始。</strong><p>選擇一種情境，看看畫面如何回應。</p></div>
      <div class="signal-controls" role="group" aria-label="選擇示意輸入類型"><button type="button" data-signal="text" aria-pressed="true">01 文字</button><button type="button" data-signal="image" aria-pressed="false">02 圖像</button><button type="button" data-signal="code" aria-pressed="false">03 程式</button></div>
      <div class="signal-note"><span>VISUAL METAPHOR / 非即時推論</span><span>SCROLL TO EXPLORE ↓</span></div>
    </div>`;
  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const modes = {
    text: { hue: '#c6f27b', words: ['context', '意思', 'why', '人', 'what', '語句', 'together', 'question', '→', '▧', 'reply', '目的'] },
    image: { hue: '#98d6ef', words: ['image', '細節', 'look', '圖像', 'shape', 'contrast', '辨識', '◒', 'colour', '→', '畫面', 'notice'] },
    code: { hue: '#ffd592', words: ['function', '{ }', '程式', 'read', 'fix', '→', 'verify', '檢查', '()', 'result', 'file', 'build'] }
  };
  let mode = 'text', width = 1, height = 1, dpr = 1, tick = 0, last = 0, raf = 0, visible = true;
  let targetX = 0, targetY = 0, x = 0, y = 0, scroll = 0, smoothScroll = 0;
  let seed = 8943;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const points = Array.from({length: 82}, (_, i) => ({
    angle: random() * Math.PI * 2, lane: random(), speed: .04 + random() * .12,
    phase: random() * 7, size: 1 + random() * 2, index: i, weight: random()
  }));
  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  const rounded = (x, y, w, h, r) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  };
  function draw() {
    if (!ctx) return;
    const palette = modes[mode], mobile = width < 700;
    const cx = width * .5 + x * (mobile ? 12 : 35), cy = height * (mobile ? .39 : .43) + y * 18 - smoothScroll * 28;
    const rx = Math.min(width * (mobile ? .53 : .37), 560), ry = Math.min(height * (mobile ? .17 : .24), 240);
    ctx.clearRect(0, 0, width, height);
    const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx,ry)*1.45);
    wash.addColorStop(0, 'rgba(74,109,94,.34)'); wash.addColorStop(.5, 'rgba(32,59,54,.20)'); wash.addColorStop(1, 'rgba(12,24,24,0)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
    // Rings vary in perspective and weight so there is an implied camera depth.
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * (.48+i*.105), ry * (.48+i*.105), -.17 + i * .015, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(190,225,204,${.035 + (i % 3 === 0 ? .07 : 0)})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
    const pieces = points.map(p => {
      const a = p.angle + tick * p.speed + smoothScroll * .22;
      const lane = .55 + p.lane * .5;
      const depth = (Math.sin(a) + 1) / 2;
      let px = cx + Math.cos(a) * rx * lane;
      let py = cy + Math.sin(a) * ry * lane + Math.sin(a * 2 + p.phase) * 15;
      if (mode === 'image') {
        const col = p.index % 10, row = Math.floor(p.index / 10);
        px = cx + (col - 4.5) * rx * .19 + Math.sin(tick*.3+p.phase)*4;
        py = cy + (row - 4) * ry * .20 + Math.cos(tick*.3+p.phase)*4;
      } else if (mode === 'code') {
        const col = p.index % 12, row = Math.floor(p.index / 12);
        px = cx + (col - 5.5) * rx * .15 + (row % 2) * rx * .10;
        py = cy + (row - 3) * ry * .28 + Math.sin(tick*.4+p.phase)*3;
      }
      return { ...p, a, depth, px, py };
    }).sort((a, b) => a.depth - b.depth);
    for (const p of pieces) {
      const alpha = .18 + p.depth * .65;
      if (p.index % 4 !== 0) {
        ctx.fillStyle = `rgba(216,241,206,${alpha})`;
        ctx.beginPath(); ctx.arc(p.px, p.py, p.size * (.5 + p.depth), 0, Math.PI * 2); ctx.fill();
        continue;
      }
      const word = palette.words[Math.floor(p.index / 4) % palette.words.length];
      const fs = (mobile ? 9 : 11) + p.depth * (mobile ? 2 : 3);
      ctx.font = `${p.depth > .6 ? 650 : 500} ${fs}px Studio, "Microsoft JhengHei", "PingFang TC", sans-serif`;
      const tw = ctx.measureText(word).width, pad = mobile ? 8 : 11, th = fs + 13;
      const px = Math.max((tw + pad*2)/2 + 7, Math.min(width - (tw + pad*2)/2 - 7, p.px));
      ctx.globalAlpha = .35 + p.depth * .65;
      ctx.fillStyle = p.depth > .65 ? '#fff3d8' : '#d0dfd4';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, px, p.py + .5);
      ctx.globalAlpha = 1;
    }
    // Signal line conveys arrival rather than claiming to show model weights.
    ctx.beginPath(); ctx.moveTo(width*.03, cy + ry*.85);
    ctx.bezierCurveTo(width*.25,cy + ry*.85,width*.25,cy + ry*1.25,cx,cy+ry*1.25);
    ctx.bezierCurveTo(width*.75,cy + ry*1.25,width*.75,cy+ry*.85,width*.97,cy+ry*.85);
    ctx.strokeStyle='rgba(213,240,203,.19)'; ctx.lineWidth=1; ctx.stroke();
  }
  function frame(now) {
    raf = 0;
    if (!visible || motion.matches || document.hidden) return;
    const dt = Math.min((now - (last || now)) / 1000, .04); last = now; tick += dt;
    x += (targetX-x) * .045; y += (targetY-y) * .045; smoothScroll += (scroll-smoothScroll) * .04;
    container.style.setProperty('--camera-x', (x * 7).toFixed(2) + 'deg');
    container.style.setProperty('--camera-y', (y * -6).toFixed(2) + 'deg');
    container.style.setProperty('--camera-scroll', (smoothScroll * -45).toFixed(2) + 'px');
    draw(); raf = requestAnimationFrame(frame);
  }
  const animate = () => { if (!raf && visible && !motion.matches && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  const pointer = e => { const r = container.getBoundingClientRect(); targetX = (e.clientX-r.left)/r.width-.5; targetY = (e.clientY-r.top)/r.height-.5; if (motion.matches) { x=targetX; y=targetY; draw(); } };
  const onScroll = () => { const r=container.getBoundingClientRect(); scroll=Math.max(0,Math.min(1,-r.top/Math.max(r.height,1))); if(motion.matches){smoothScroll=scroll;draw();} };
  const buttons = container.querySelectorAll('[data-signal]');
  const copy = { text:['從你的問題開始。','輸入文字，讓想法有了方向。'], image:['從畫面找線索。','圖片可以成為理解的起點。'], code:['把問題變成步驟。','程式與工具讓想法走向行動。'] };
  const choose = e => { mode = e.currentTarget.dataset.signal; container.dataset.signalMode = mode; buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===e.currentTarget))); container.querySelector('.signal-copy strong').textContent = copy[mode][0]; container.querySelector('.signal-copy p').textContent = copy[mode][1]; draw(); };
  buttons.forEach(b=>b.addEventListener('click',choose));
  container.addEventListener('pointermove',pointer,{passive:true});
  container.addEventListener('pointerdown',pointer,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',animate);
  motion.addEventListener('change',animate);
  const observer = new ResizeObserver(resize); observer.observe(container);
  const intersection = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible) animate();}); intersection.observe(container);
  resize(); animate();
  return () => { cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect(); buttons.forEach(b=>b.removeEventListener('click',choose)); container.removeEventListener('pointermove',pointer); container.removeEventListener('pointerdown',pointer); window.removeEventListener('scroll',onScroll); document.removeEventListener('visibilitychange',animate); motion.removeEventListener('change',animate); };
}
