import './collaboration-demo.css'

const stages = [
  {
    name: '只有目標',
    title: '方向有了，細節還是空的。',
    explanation: '「做一個活動報名頁」能開始工作，但場次、名額與失敗情況，仍需要條件。',
    brief: '做一個活動報名頁。',
    result: '先搭出可以討論的結構。',
    checks: '活動名稱、日期、場次尚未指定。',
  },
  {
    name: '補上材料',
    title: '材料到位，畫面才有對象。',
    explanation: '加入活動日期與兩個場次，頁面就能呈現具體內容；但能看，還不等於能用。',
    brief: '活動：週末字體工作坊\n日期：2026.11.21\n上午 10:00｜剩 8 席\n下午 14:00｜已額滿',
    result: '把材料變成可選擇的內容。',
    checks: '現在有場次資訊，下一步是定義操作規則。',
  },
  {
    name: '加上驗收',
    title: '說清楚怎樣算完成。',
    explanation: '手機可讀、額滿不能選、空白信箱會提示。把這些寫進要求，再逐一檢查。',
    brief: '390px 手機寬度也能操作。\n已額滿的場次不能選取。\n送出前檢查電子郵件。',
    result: '用可以實際操作的結果驗收。',
    checks: '試著選額滿場次，再送出空白或不完整的信箱。',
  },
]

export function renderCollaboration(): string {
  return `<section class="work chapter collaboration-study" id="work" aria-labelledby="work-title" data-stage="0">
    <header class="collab-heading">
      <div class="collab-kicker"><span>03 / WORKING TOGETHER</span><span>由你定義，和我完成</span></div>
      <h2 id="work-title">你給的條件，<br>會改變我的答案。</h2>
      <p class="collab-lead">給我目標、材料與驗收條件，我能把抽象要求逐步做成可檢查的結果。</p>
    </header>
    <div class="collab-steps" role="tablist" aria-label="比較三種需求完整度">
      ${stages.map((stage, i) => `<button type="button" role="tab" id="collab-tab-${i}" aria-controls="collab-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}" data-collab-stage="${i}"><span class="collab-step-number">0${i + 1}</span><span>${stage.name}</span><span class="collab-step-arrow" aria-hidden="true">↗</span></button>`).join('')}
    </div>
    <div class="collab-panel" id="collab-panel" role="tabpanel" aria-labelledby="collab-tab-0">
      <div class="collab-brief">
        <div class="collab-panel-label"><span>你提供的條件</span><span>INPUT / <b data-collab-count>01</b></span></div>
        <div class="collab-brief-body">
          <div class="collab-brief-line"><span class="collab-bullet">01</span><div><small>目標</small><p>做一個活動報名頁。</p></div><span class="collab-line-state">已提供</span></div>
          <div class="collab-brief-line collab-material-line"><span class="collab-bullet">02</span><div><small>材料</small><p><span class="collab-placeholder">活動內容待補充</span><span class="collab-material">週末字體工作坊<br><span class="collab-meta">11.21 · 上午 8 席／下午額滿</span></span></p></div><span class="collab-line-state">待補充</span></div>
          <div class="collab-brief-line collab-acceptance-line"><span class="collab-bullet">03</span><div><small>驗收</small><p><span class="collab-placeholder">操作規則待定義</span><span class="collab-acceptance">手機可用、額滿停用、<br>檢查電子郵件。</span></p></div><span class="collab-line-state">待定義</span></div>
        </div>
        <div class="collab-insight"><span class="collab-insight-index" aria-hidden="true">01</span><div><h3 data-collab-title>${stages[0].title}</h3><p data-collab-explanation>${stages[0].explanation}</p></div></div>
      </div>
      <div class="collab-result">
        <div class="collab-panel-label"><span>你能檢查的結果</span><span>LIVE PREVIEW <i aria-hidden="true"></i></span></div>
        <div class="collab-preview-bed">
          <form class="collab-event" novalidate>
            <div class="collab-event-top"><span>TYPE / WEEKEND</span><span class="collab-event-edition">NO. 021</span></div>
            <div class="collab-event-art" aria-hidden="true"><span class="collab-art-a">Aa</span><span class="collab-art-chinese">字</span><span class="collab-art-note">MAKE ROOM<br>FOR TYPE.</span></div>
            <div class="collab-event-content">
              <div class="collab-event-date"><span data-event-date>日期待定</span><span data-event-location>地點待定</span></div>
              <h4 data-event-title>活動報名</h4>
              <p class="collab-event-description" data-event-description>在這裡放入活動介紹。</p>
              <fieldset class="collab-sessions"><legend>選擇場次</legend><button type="button" class="collab-session is-selected" data-session="morning" aria-pressed="true"><span data-session-time="morning">場次 A</span><small data-session-space="morning">資訊待補</small><i aria-hidden="true">↗</i></button><button type="button" class="collab-session" data-session="afternoon" aria-pressed="false"><span data-session-time="afternoon">場次 B</span><small data-session-space="afternoon">資訊待補</small><i aria-hidden="true">↗</i></button></fieldset>
              <div class="collab-email-field"><label for="collab-email">電子郵件</label><input id="collab-email" type="email" name="email" placeholder="you@example.com" autocomplete="off" aria-describedby="collab-email-status"><span id="collab-email-status" class="collab-email-status" aria-live="polite"></span></div>
              <button class="collab-submit" type="submit"><span>確認報名</span><span aria-hidden="true">↗</span></button>
            </div>
          </form>
          <div class="collab-preview-ruler" aria-hidden="true"><span>←</span><span data-collab-width>草稿結構</span><span>→</span></div>
        </div>
        <div class="collab-result-caption"><strong data-collab-result>${stages[0].result}</strong><p data-collab-checks>${stages[0].checks}</p></div>
      </div>
    </div>
    <footer class="collab-footnote"><span>能力自述 · 非評測成績</span><p>預設互動示範，未連線模型。活動與名額為示例；輸入內容不會送出或儲存。</p></footer>
  </section>`
}

export function initCollaboration(reduced: MediaQueryList): void {
  const root = document.querySelector<HTMLElement>('.collaboration-study')
  if (!root) return
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-collab-stage]')]
  const form = root.querySelector<HTMLFormElement>('.collab-event')!
  const email = root.querySelector<HTMLInputElement>('#collab-email')!
  const status = root.querySelector<HTMLElement>('#collab-email-status')!
  const sessions = [...root.querySelectorAll<HTMLButtonElement>('[data-session]')]
  let current = 0
  let animation: Animation | undefined
  const setText = (selector: string, value: string) => { const target = root.querySelector(selector); if (target) target.textContent = value }
  const resetStatus = () => { status.textContent = ''; email.removeAttribute('aria-invalid'); form.classList.remove('collab-success') }
  const selectSession = (selected: HTMLButtonElement) => sessions.forEach(button => { button.classList.toggle('is-selected', button === selected); button.setAttribute('aria-pressed', String(button === selected)) })

  const selectStage = (index: number) => {
    if (index === current) return
    const before = form.getBoundingClientRect()
    animation?.cancel()
    current = index
    const data = stages[index]!
    root.dataset.stage = String(index)
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1 })
    root.querySelector('#collab-panel')?.setAttribute('aria-labelledby', `collab-tab-${index}`)
    setText('[data-collab-count]', `0${index + 1}`)
    setText('.collab-insight-index', `0${index + 1}`)
    setText('[data-collab-title]', data.title)
    setText('[data-collab-explanation]', data.explanation)
    setText('[data-collab-result]', data.result)
    setText('[data-collab-checks]', data.checks)
    setText('.collab-material-line .collab-line-state', index > 0 ? '已提供' : '待補充')
    setText('.collab-acceptance-line .collab-line-state', index > 1 ? '已提供' : '待定義')
    setText('[data-event-title]', index > 0 ? '週末字體工作坊' : '活動報名')
    setText('[data-event-description]', index > 0 ? '從一個字開始，做出自己的字體海報。' : '在這裡放入活動介紹。')
    setText('[data-event-date]', index > 0 ? '2026.11.21 SAT' : '日期待定')
    setText('[data-event-location]', index > 0 ? '台北 · 示範活動' : '地點待定')
    setText('[data-session-time="morning"]', index > 0 ? '10:00 上午場' : '場次 A')
    setText('[data-session-time="afternoon"]', index > 0 ? '14:00 下午場' : '場次 B')
    setText('[data-session-space="morning"]', index > 0 ? '剩 8 席' : '資訊待補')
    setText('[data-session-space="afternoon"]', index > 0 ? '已額滿' : '資訊待補')
    setText('[data-collab-width]', index === 2 ? '手機操作也成立' : index === 1 ? '內容已具體化' : '草稿結構')
    sessions[1]!.disabled = index === 2
    if (index === 2) selectSession(sessions[0]!)
    resetStatus()
    const after = form.getBoundingClientRect()
    if (!reduced.matches && after.width && typeof form.animate === 'function') {
      animation = form.animate([
        { transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})` },
        { transform: 'translate(0, 0) scale(1, 1)' },
      ], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' })
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStage(index))
    tab.addEventListener('keydown', event => {
      let target = index
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length
      else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length
      else if (event.key === 'Home') target = 0
      else if (event.key === 'End') target = tabs.length - 1
      else return
      event.preventDefault()
      tabs[target]!.focus()
      selectStage(target)
    })
  })
  sessions.forEach(button => button.addEventListener('click', () => { selectSession(button); resetStatus() }))
  email.addEventListener('input', resetStatus)
  form.addEventListener('submit', event => {
    event.preventDefault()
    if (current < 2) {
      status.textContent = '草稿還沒有驗收規則。切到「加上驗收」試試。'
      return
    }
    if (!email.value.trim() || !email.validity.valid) {
      email.setAttribute('aria-invalid', 'true')
      status.textContent = !email.value.trim() ? '請填寫電子郵件，才能確認報名。' : '請填寫完整的電子郵件，例如 you@example.com。'
      email.focus({ preventScroll: true })
    } else {
      email.removeAttribute('aria-invalid')
      form.classList.add('collab-success')
      status.textContent = '檢查通過：上午場可報名，信箱格式正確。'
    }
  })
  reduced.addEventListener('change', () => { if (reduced.matches) animation?.finish() })
}
