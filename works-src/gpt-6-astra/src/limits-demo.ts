import './limits-demo.css'

type InputKind = 'text' | 'image' | 'audio' | 'video'

const inputKinds: Record<InputKind, { label: string; code: string; supported: boolean; icon: string }> = {
  text: { label: '文字', code: 'TEXT', supported: true, icon: '<path d="M17 18h30M32 18v30M24 48h16" />' },
  image: { label: '圖片', code: 'IMAGE', supported: true, icon: '<rect x="14" y="16" width="36" height="32" rx="2"/><circle cx="25" cy="26" r="3"/><path d="m15 44 12-12 8 8 7-7 8 9"/>' },
  audio: { label: '音訊', code: 'AUDIO', supported: false, icon: '<path d="M15 28v8m8-15v22m9-30v38m9-30v22m8-15v8"/>' },
  video: { label: '影片', code: 'VIDEO', supported: false, icon: '<rect x="12" y="18" width="30" height="28" rx="2"/><path d="m42 27 11-7v24l-11-7M24 26l9 6-9 6Z"/>' },
}

function inputIcon(kind: InputKind): string {
  return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inputKinds[kind].icon}</svg>`
}

function readerFrame(): string {
  return ['left', 'right', 'top', 'bottom'].map(side => `<div class="limits-gate-beam limits-gate-${side}">${['front', 'back', 'side', 'edge', 'cap'].map(face => `<i class="limits-gate-${face}"></i>`).join('')}</div>`).join('')
}

function readableOutput(kind: InputKind): string {
  if (kind === 'image') return `<div class="limits-image-slices">${[0, 1, 2, 3].map(i => `<svg viewBox="0 ${i * 16} 64 16" aria-hidden="true"><rect width="64" height="64" fill="#e9ece5"/><circle cx="43" cy="20" r="8" fill="#102c27"/><path d="M0 58 24 27 42 48 54 33 64 45V64H0Z" fill="#6c866c"/><path d="m0 55 22-16 27 25H0Z" fill="#102c27"/></svg>`).join('')}</div>`
  return '<div class="limits-text-lines"><span>文字，是輸入。</span><span>可以閱讀，</span><span>也可以接著思考。</span></div>'
}

export function renderLimits(): string {
  return `<section id="limits" class="limits chapter" aria-labelledby="limits-title">
    <div class="limits-demo-top"><span class="mono">05 / KNOW THE BOUNDARY</span><a href="#evidence">查閱原始規格 <span aria-hidden="true">↗</span></a></div>
    <div class="limits-demo-heading"><h2 id="limits-title">我能讀什麼，<br>也有邊界。</h2><p>文字與圖片可輸入；<br>音訊與影片，原生不支援。</p></div>
    <div class="limits-demo-controls" role="group" aria-label="選擇要展示的輸入模態">
      ${(Object.keys(inputKinds) as InputKind[]).map((kind, index) => `<button type="button" data-input-kind="${kind}" aria-pressed="${kind === 'text'}"><span class="mono">0${index + 1}</span><span>${inputKinds[kind].label}</span><span class="limits-button-arrow" aria-hidden="true">↗</span></button>`).join('')}
    </div>
    <div class="limits-demo-stage" data-result="pass" data-phase="settled" aria-hidden="true">
      <div class="limits-route"><span></span><span></span><span></span></div>
      <div class="limits-source-object">${inputIcon('text')}<span class="mono">TEXT / INPUT</span></div>
      <div class="limits-boundary"><span class="limits-boundary-caption">原生輸入邊界</span><div class="limits-gateway">${readerFrame()}<div class="limits-gate-scan"></div></div><span class="limits-boundary-foot mono">GPT-6 ASTRA</span></div>
      <div class="limits-input-object"><div class="limits-input-symbol">${inputIcon('text')}</div><span class="limits-input-label mono">TEXT</span></div>
      <div class="limits-readout">${readableOutput('text')}<span class="limits-readout-label mono">READABLE / 可讀</span></div>
      <div class="limits-contact"><span></span><span></span><span></span></div>
    </div>
    <div class="limits-demo-outcome"><span class="limits-outcome-mark" aria-hidden="true">↗</span><div><span class="limits-outcome-kind">文字輸入</span><strong id="limits-outcome" role="status" aria-live="polite" aria-atomic="true">可讀</strong></div><p>點選上方模態，<br>看它是否能通過邊界。</p></div>
    <table class="limits-support-matrix"><caption>原生輸入支援一覽</caption><thead><tr><th scope="col">文字</th><th scope="col">圖片</th><th scope="col">音訊</th><th scope="col">影片</th></tr></thead><tbody><tr><td>支援</td><td>支援</td><td>不支援</td><td>不支援</td></tr></tbody></table>
    <p class="limits-demo-disclaimer">這是規格展示，沒有呼叫模型，也沒有讀取你的檔案。</p>
    <ul class="limits-other"><li><span class="mono">01 / FINE-TUNING</span><p>不支援用你的資料直接微調。</p></li><li><span class="mono">02 / LONG CONTEXT</span><p>上下文長，不代表每個細節都能答對。</p></li></ul>
  </section>`
}

export function initLimits(reduced: MediaQueryList): void {
  const root = document.querySelector<HTMLElement>('#limits')
  if (!root || root.dataset.limitsInitialized === 'true') return
  root.dataset.limitsInitialized = 'true'
  const stage = root.querySelector<HTMLElement>('.limits-demo-stage')!
  const packet = root.querySelector<HTMLElement>('.limits-input-object')!
  const symbol = root.querySelector<HTMLElement>('.limits-input-symbol')!
  const source = root.querySelector<HTMLElement>('.limits-source-object')!
  const readout = root.querySelector<HTMLElement>('.limits-readout')!
  const label = root.querySelector<HTMLElement>('.limits-input-label')!
  const outcome = root.querySelector<HTMLElement>('#limits-outcome')!
  const outcomeKind = root.querySelector<HTMLElement>('.limits-outcome-kind')!
  const outcomeMark = root.querySelector<HTMLElement>('.limits-outcome-mark')!
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-input-kind]')]
  let active: InputKind = 'text'
  let motion: Animation | null = null
  let sequence = 0
  const compact = matchMedia('(max-width: 700px)')
  let impact: Animation | null = null

  const settle = () => {
    const item = inputKinds[active]
    stage.dataset.phase = 'settled'
    outcome.textContent = item.supported ? '可讀' : '原生不支援'
    outcomeMark.textContent = item.supported ? '↗' : '⊣'
  }

  const placePacket = () => {
    const supported = inputKinds[active].supported
    packet.style.left = compact.matches ? '50%' : supported ? '82%' : 'calc(53% - var(--gate-width) / 2 - var(--input-size) / 2 - 14px)'
    packet.style.top = compact.matches ? supported ? '83%' : 'calc(48% - var(--gate-height) / 2 - var(--input-height) / 2 - 8px)' : '50%'
  }

  const select = (kind: InputKind) => {
    const turn = ++sequence
    motion?.cancel()
    impact?.cancel()
    active = kind
    const item = inputKinds[kind]
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.inputKind === kind)))
    symbol.innerHTML = inputIcon(kind)
    source.innerHTML = `${inputIcon(kind)}<span class="mono">${item.code} / INPUT</span>`
    readout.innerHTML = `${readableOutput(kind)}<span class="limits-readout-label mono">READABLE / 可讀</span>`
    label.textContent = item.code
    outcomeKind.textContent = `${item.label}輸入`
    stage.dataset.result = item.supported ? 'pass' : 'stop'
    placePacket()

    if (reduced.matches || typeof packet.animate !== 'function') {
      settle()
      return
    }
    stage.dataset.phase = 'travelling'
    outcome.textContent = '確認輸入規格'
    outcomeMark.textContent = '→'
    const origin = compact.matches ? { left: '50%', top: '14%' } : { left: '15%', top: '50%' }
    const destination = { left: packet.style.left, top: packet.style.top }
    const frames: Keyframe[] = item.supported
      ? [{ ...origin, transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0 },
         { left: compact.matches ? '50%' : '53%', top: compact.matches ? '48%' : '50%', transform: `translate(-50%,-50%) scale(.64) ${compact.matches ? 'rotateX(30deg)' : 'rotateY(-42deg)'}`, opacity: 1, offset: .63 },
         { ...destination, transform: 'translate(-50%,-50%) scale(.92)', opacity: 0, offset: 1 }]
      : [{ ...origin, transform: 'translate(-50%,-50%)', offset: 0 },
         { ...destination, transform: `translate(-50%,-50%) ${compact.matches ? 'translateY(9px)' : 'translateX(9px)'}`, offset: .8 },
         { ...destination, transform: 'translate(-50%,-50%)', offset: 1 }]
    motion = packet.animate(frames, { duration: item.supported ? 1400 : 900, easing: 'cubic-bezier(.33,.05,.23,1)', fill: 'none' })
    motion.finished.then(() => {
      if (turn !== sequence) return
      settle()
      if (!item.supported) {
        impact = root.querySelector<HTMLElement>('.limits-gateway')!.animate(
          [{ translate: '0 0' }, { translate: compact.matches ? '0 6px' : '6px 0' }, { translate: '0 0' }],
          { duration: 280, easing: 'ease-out' },
        )
      }
    }).catch(() => {})
  }

  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.inputKind as InputKind)))
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return
    sequence++
    motion?.cancel()
    impact?.cancel()
    settle()
  })
  compact.addEventListener('change', () => {
    sequence++
    motion?.cancel()
    impact?.cancel()
    placePacket()
    settle()
  })
  placePacket()
}
