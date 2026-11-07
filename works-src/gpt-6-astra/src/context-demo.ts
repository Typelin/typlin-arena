import './context-demo.css'

type Clue = 'date' | 'capacity' | 'acceptance'
const clues: Record<Clue, { label: string; heading: string; primary: string; secondary: string; detail: string; line: string }> = {
  date: { label: '日期', heading: '這次活動，什麼時候？', primary: '11.21', secondary: '2026 · SATURDAY', detail: '週末字體工作坊\n上午 10:00 ／ 下午 14:00', line: '需求文件 / 活動資訊 / 第 04 行' },
  capacity: { label: '名額', heading: '還能報哪一個場次？', primary: '08', secondary: '上午場剩餘席次', detail: '上午場還有 8 席。\n下午場已額滿，不能繼續接受報名。', line: '場次清單 / 名額狀態 / 第 12 行' },
  acceptance: { label: '驗收', heading: '做完之後，要檢查什麼？', primary: '390', secondary: 'PX · 手機驗收寬度', detail: '手機可操作、額滿不能選。\n送出前檢查電子郵件。', line: '驗收條件 / 操作檢查 / 第 23 行' },
}

const fragments: { title: string; body: string; clue?: Clue; layer: number; x: number; y: number; turn: number }[] = [
  { title: '活動簡介', body: '週末字體工作坊\n從一個字開始，\n做出自己的字體海報。', layer: -190, x: -345, y: -225, turn: -7 },
  { title: '時間資訊', body: '2026 年 11 月 21 日\n星期六\n上午場 10:00 開始', clue: 'date', layer: -155, x: -70, y: -240, turn: 4 },
  { title: '上午場', body: '場次 A / 10:00\n目前剩餘 8 席\n開放報名', clue: 'capacity', layer: -200, x: 210, y: -215, turn: 7 },
  { title: '作品產出', body: '一張字體海報\n保存為可分享的圖片\n附上自己的設計說明', layer: -215, x: 465, y: -250, turn: -6 },
  { title: '頁面結構', body: '活動介紹\n日期與場次\n聯絡信箱與報名按鈕', layer: -170, x: -390, y: -20, turn: 3 },
  { title: '報名流程', body: '先閱讀活動資訊\n選擇尚有名額的場次\n填寫電子郵件', layer: -230, x: 470, y: -10, turn: 4 },
  { title: '聯絡欄位', body: '欄位名稱：電子郵件\n提示：you@example.com\n不可空白送出', clue: 'acceptance', layer: -190, x: -370, y: 195, turn: -5 },
  { title: '版面要求', body: '主要文字必須可讀\n不要出現橫向捲動\n表單標籤保持可見', layer: -180, x: 450, y: 210, turn: -4 },
  { title: '場次清單', body: '10:00｜上午場\n14:00｜下午場\n兩個場次各自顯示狀態', clue: 'date', layer: -35, x: -180, y: -100, turn: -5 },
  { title: '名額狀態', body: '上午：剩餘 8 席\n下午：已額滿\n不接受額滿場次報名', clue: 'capacity', layer: -15, x: 110, y: -85, turn: 3 },
  { title: '內容順序', body: '先說明活動與日期\n再提供場次選擇\n最後確認報名資料', layer: -45, x: 365, y: -80, turn: -3 },
  { title: '驗收條件', body: '390px 手機寬度\n額滿場次停用\n檢查電子郵件格式', clue: 'acceptance', layer: 10, x: -165, y: 115, turn: 2 },
  { title: '錯誤提示', body: '請填寫電子郵件，\n才能確認報名。\n把提示放在欄位旁。', layer: -30, x: 130, y: 130, turn: -5 },
  { title: '確認畫面', body: '顯示選取的場次\n回報檢查結果\n不要真的送出示範資料', layer: -55, x: 395, y: 140, turn: 4 },
  { title: '日期原文', body: '活動：週末字體工作坊\n日期：2026.11.21\n地點：台北（示例）', clue: 'date', layer: 115, x: -215, y: -265, turn: -4 },
  { title: '操作規則', body: '已額滿的場次不能選。\n送出前先檢查信箱。\n手機也要能完整操作。', clue: 'acceptance', layer: 85, x: -250, y: 280, turn: 4 },
  { title: '名額原文', body: '上午 10:00｜剩 8 席\n下午 14:00｜已額滿\n名額為示範資料', clue: 'capacity', layer: 90, x: 85, y: 315, turn: -5 },
  { title: '資料備註', body: '這是一組活動頁需求。\n所有內容都是預設示例。\n本頁未連線模型。', layer: 60, x: 355, y: 330, turn: 3 },
]

export function renderContext(): string {
  const clue = clues.date
  return `<section id="context" class="context chapter context-study" aria-labelledby="context-title" data-clue="date">
    <div class="context-study-heading"><div class="context-study-kicker"><span>02 / ROOM FOR CONTEXT</span><span>一起讀，也要讀對</span></div><div class="context-study-intro"><h2 id="context-title">放得下很多，<br>仍要找到重點。</h2><p>我能在一次請求中接收長篇材料，<br>但容量大，不代表每個細節都會答對。</p></div><div class="context-capacity"><strong>1,050,000</strong><div><span>TOKENS</span><span>官方上下文上限</span></div></div></div>
    <div class="context-reading-stage">
      <div class="context-field-label"><span>同一份活動需求</span><span>OVERVIEW → DETAIL</span></div>
      <div class="context-reading-field" aria-hidden="true"><div class="context-reading-world">${fragments.map((fragment, i) => `<div class="context-fragment ${fragment.clue ? `context-fragment-${fragment.clue}` : ''}" style="--card-x:${fragment.x}px;--card-y:${fragment.y}px;--card-z:${fragment.layer}px;--card-turn:${fragment.turn}deg"><div class="context-fragment-top"><span>BRIEF / ${String(i + 1).padStart(2, '0')}</span><span>↗</span></div><h3>${fragment.title}</h3><p>${fragment.body.replace(/\n/g, '<br>')}</p><div class="context-fragment-lines"><i></i><i></i></div></div>`).join('')}</div></div>
      <div class="context-field-coordinate" aria-hidden="true"><span>READ THE WHOLE.</span><span>KEEP THE DETAIL.</span></div>
      <article class="context-detail" aria-labelledby="context-detail-heading"><div class="context-detail-top"><span>找到的線索</span><span data-context-clue-label>日期</span></div><p class="context-detail-question" id="context-detail-heading" data-context-heading>${clue.heading}</p><div class="context-detail-primary" data-context-primary>${clue.primary}</div><p class="context-detail-secondary" data-context-secondary>${clue.secondary}</p><p class="context-detail-copy" data-context-detail>${clue.detail.replace(/\n/g, '<br>')}</p><div class="context-detail-source"><span aria-hidden="true">↳</span><span data-context-line>${clue.line}</span></div></article>
    </div>
    <div class="context-controls"><div class="context-zoom"><div class="context-control-label"><label for="context-zoom">拖曳，從全貌推近細節</label><output for="context-zoom" id="context-zoom-value">全貌 · 0%</output></div><input id="context-zoom" type="range" min="0" max="100" value="0" step="1" aria-valuetext="全貌，0%"><div class="context-range-ends" aria-hidden="true"><span>看見整份材料</span><span>靠近一筆細節</span></div></div><div class="context-clues"><span class="context-clue-label">換一個要找的線索</span><div role="group" aria-label="選擇閱讀線索">${(Object.keys(clues) as Clue[]).map(key => `<button type="button" data-context-clue="${key}" aria-pressed="${key === 'date'}"><span>${clues[key].label}</span><span aria-hidden="true">↗</span></button>`).join('')}</div></div></div>
    <div class="context-study-notes"><p><strong>能放下，不等於不會漏。</strong>長上下文仍可能遺漏或誤讀細節，也不是永久記憶；重要資訊需要回到原文核對。</p><p>畫面為預設閱讀示意，未連線模型；資料片段數量不代表 token 數。<a href="https://developers.openai.com/api/docs/models/gpt-6-astra" target="_blank" rel="noreferrer">容量來源：OpenAI 模型文件 ↗</a><span>查詢日期：2026-11-04</span></p></div>
  </section>`
}

export function initContext(reduced: MediaQueryList): void {
  const root = document.querySelector<HTMLElement>('.context-study')
  if (!root) return
  const field = root.querySelector<HTMLElement>('.context-reading-field')!
  const world = root.querySelector<HTMLElement>('.context-reading-world')!
  const range = root.querySelector<HTMLInputElement>('#context-zoom')!
  const output = root.querySelector<HTMLOutputElement>('#context-zoom-value')!
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-context-clue]')]
  let target = 0
  let shown = 0
  let frame = 0
  let previousTime = 0
  let active: Clue = 'date'
  let activeVisible = true
  const render = () => {
    const progress = shown / 100
    const mobile = field.clientWidth < 650
    const base = mobile ? .44 : .74
    const focusX = active === 'date' ? 18 : active === 'capacity' ? -90 : 24
    const focusY = active === 'date' ? 55 : active === 'capacity' ? 15 : -110
    world.style.transform = `translate3d(${focusX * progress}px,${focusY * progress}px,${progress * (mobile ? 105 : 180)}px) rotateX(${23 - progress * 16}deg) rotateY(${-15 + progress * 10}deg) rotateZ(${-7 + progress * 5}deg) scale(${base + progress * (mobile ? .1 : .07)})`
    root.style.setProperty('--context-progress', String(progress))
  }
  const tick = (time: number) => {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : .016
    previousTime = time
    shown += (target - shown) * (1 - Math.exp(-delta * 12))
    if (Math.abs(target - shown) < .05) shown = target
    render()
    if (shown !== target && activeVisible && !reduced.matches) frame = requestAnimationFrame(tick)
    else { frame = 0; previousTime = 0 }
  }
  const update = () => {
    target = Number(range.value)
    const state = target < 35 ? '全貌' : target < 75 ? '靠近' : '細節'
    output.value = `${state} · ${target}%`
    range.setAttribute('aria-valuetext', `${state}，${target}%`)
    range.style.setProperty('--range-progress', `${target}%`)
    if (reduced.matches || !activeVisible) { shown = target; render() }
    else if (!frame) frame = requestAnimationFrame(tick)
  }
  range.addEventListener('input', update)
  buttons.forEach(button => button.addEventListener('click', () => {
    active = button.dataset.contextClue as Clue
    root.dataset.clue = active
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    const clue = clues[active]
    const changes: [string, string][] = [['[data-context-clue-label]', clue.label], ['[data-context-heading]', clue.heading], ['[data-context-primary]', clue.primary], ['[data-context-secondary]', clue.secondary], ['[data-context-detail]', clue.detail], ['[data-context-line]', clue.line]]
    changes.forEach(([selector, value]) => { const element = root.querySelector(selector); if (element) element.textContent = value })
    render()
  }))
  new ResizeObserver(render).observe(field)
  new IntersectionObserver(entries => {
    activeVisible = entries[0]?.isIntersecting ?? true
    if (!activeVisible && frame) { cancelAnimationFrame(frame); frame = 0; shown = target; previousTime = 0; render() }
  }, { rootMargin: '100px' }).observe(root)
  reduced.addEventListener('change', () => { if (reduced.matches) { cancelAnimationFrame(frame); frame = 0; shown = target; render() } })
  render()
}
