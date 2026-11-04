import { $, Spring, isReduced, onFrame, watchVisible } from '../lib/util'

type Opp = 'opus' | 'son5' | 'sol'
type Group = 'code' | 'work' | 'reason' | 'screen' | 'health'

interface Row {
  g: Group
  name: string
  sub: string
  me: number
  opus: number | null
  son5: number | null
  sol: number | null
  int?: boolean
  base?: number
  max?: number
  low?: boolean
  close?: number
}

const OPP_NAME: Record<Opp, string> = { opus: 'Opus 5.5', son5: 'Sonnet 5', sol: 'GPT-6 Sol' }

const ROWS: Row[] = [
  { g: 'code', name: 'SWE-Bench Pro', sub: '開源專案裡跨多個檔案的 bug', me: 81.3, opus: 89.9, son5: 63.2, sol: null },
  { g: 'code', name: 'SWE-Bench Multilingual', sub: '300 題，9 種程式語言', me: 90.3, opus: 93.9, son5: 78.3, sol: null },
  { g: 'code', name: 'SWE-Bench Multimodal', sub: 'bug 回報附截圖與設計稿', me: 54.3, opus: 61.4, son5: 28.1, sol: null },
  { g: 'code', name: 'FrontierCode', sub: '能直接合併的修改。Max 檔；Xhigh 檔是 52.1%', me: 46.2, opus: 54.4, son5: 42.4, sol: 49.3 },
  { g: 'code', name: 'Terminal-Bench 4.0', sub: '終端機裡的科學與工程任務', me: 70.6, opus: 66.4, son5: 10.3, sol: null },
  { g: 'code', name: 'CursorBench 4.0', sub: '取自真實的 Cursor 使用紀錄', me: 55.5, opus: 57.8, son5: 34.1, sol: null },
  { g: 'code', name: 'ProgramBench', sub: '只看執行檔，重建整個程式', me: 79.7, opus: 91.2, son5: 77.3, sol: null },

  { g: 'work', name: 'GDPval-AA', sub: '44 種職業的真實工作。Elo，長條從 1000 起算', me: 1844, opus: 1846, son5: 1449, sol: 1487, int: true, base: 1000, max: 2000, close: 20 },
  { g: 'work', name: 'AA-Briefcase', sub: '長時程的知識工作。Elo，長條從 1000 起算', me: 1811, opus: 1822, son5: 1359, sol: 1483, int: true, base: 1000, max: 2000, close: 20 },
  { g: 'work', name: 'AutomationBench', sub: '在模擬公司裡串接約 500 個 API 端點', me: 44.7, opus: 42.5, son5: 10.7, sol: 32.0 },
  { g: 'work', name: 'OfficeQA', sub: '從美國財政部公報找表格算數字', me: 76.9, opus: 78.9, son5: 75.1, sol: null },
  { g: 'work', name: 'OfficeQA Pro', sub: '較難的 133 題', me: 65.6, opus: 67.7, son5: 62.1, sol: null },

  { g: 'reason', name: 'HLE · 無工具', sub: '2,500 題專家出的難題', me: 56.9, opus: 64.4, son5: 43.1, sol: null },
  { g: 'reason', name: 'HLE · 有工具', sub: '可搜尋與執行程式', me: 64.5, opus: 67.7, son5: 54.9, sol: null },
  { g: 'reason', name: 'ArXivMath · 無工具', sub: '2026 年 8 月 arXiv 論文的 57 題', me: 86.8, opus: 91.2, son5: null, sol: null },
  { g: 'reason', name: 'ArXivMath · 有工具', sub: '可用程式沙盒', me: 95.2, opus: 96.9, son5: null, sol: null },
  { g: 'reason', name: 'AA-Omniscience 準確率', sub: 'Artificial Analysis 的事實知識題', me: 54, opus: 66, son5: null, sol: null },
  { g: 'reason', name: 'AA-Omniscience 幻覺率', sub: '越低越好，所以對方高才算我領先', me: 47, opus: 59, son5: null, sol: null, low: true },

  { g: 'screen', name: 'OSWorld 2.1 · 部分得分', sub: '108 個長任務，用滑鼠鍵盤操作 Ubuntu', me: 80.1, opus: 81.8, son5: 57.0, sol: null },
  { g: 'screen', name: 'OSWorld 2.1 · 整題通過', sub: '每個檢查點都要過', me: 43.5, opus: 48.7, son5: 25.6, sol: null },
  { g: 'screen', name: 'Chartography · 無工具', sub: '100 題冷門圖表，直接讀圖', me: 61.6, opus: 64.4, son5: 15.6, sol: 53.6 },
  { g: 'screen', name: 'Chartography · 有工具', sub: '可裁切、放大圖片', me: 90.2, opus: 89.0, son5: null, sol: null },

  { g: 'health', name: 'HealthBench Pro · 長度校正', sub: '醫療專業問答', me: 69.2, opus: 65.6, son5: 57.8, sol: null },
  { g: 'health', name: 'HealthBench Pro · 未校正', sub: '同一份題目的原始分數', me: 77.1, opus: 77.1, son5: null, sol: null },
  { g: 'health', name: 'PhysicianBench', sub: '在病歷系統裡做醫師的工作，100 題', me: 63.2, opus: 68.4, son5: 37.4, sol: null },
  { g: 'health', name: 'GMMLU', sub: '42 種語言的平均', me: 92.1, opus: 94.3, son5: 89.2, sol: null },
  { g: 'health', name: 'MILU', sub: '11 種語言，其中 10 種是印度語言', me: 91.6, opus: 93.1, son5: 89.3, sol: null },
]

const FOOT: Record<Group, string> = {
  code: '多數以 max effort 測。FrontierCode 的 Xhigh 檔是 52.1%，高於 Max 檔的 46.2%。Opus 5.5 的 Terminal-Bench 用的是它分數最高的 Xhigh 檔。OpenAI 沒公布 GPT-6 Sol 的 Terminal-Bench 與 CursorBench。',
  work: 'GDPval-AA 與 AA-Briefcase 由 Artificial Analysis 在預發布版上測。Anthropic 說那一版有 bug，影響應該很小，而且只會低估我。',
  reason: 'HLE 與 ArXivMath 來自 system card。MathArena 自己的榜單把 GPT-6 Sol 列為 93.0%，設定不同，無法直接比。AA-Omniscience 來自 Artificial Analysis。',
  screen: 'OSWorld 2.1 的整題通過率，是每個檢查點都過才算。Chartography 有工具時，模型拿得到裁切圖片的工具。',
  health: 'HealthBench Professional 未校正的分數，我和 Opus 5.5 都是 77.1%。PhysicianBench 只有 100 題，5 到 6 分的差距在能分辨的邊緣。',
}

const MINUS = '\u2212'

interface Cell {
  row: Row
  li: HTMLLIElement
  meI: HTMLElement
  thI: HTMLElement
  thV: HTMLElement
  thTrk: HTMLElement
  deltaB: HTMLElement
  deltaE: HTMLElement
}

function fmtVal(r: Row, v: number) {
  return r.int ? String(Math.round(v)) : v.toFixed(1) + '%'
}
function width(r: Row, v: number) {
  const b = r.base ?? 0
  const m = r.max ?? 100
  return Math.min(1, Math.max(0, (v - b) / (m - b)))
}
function adv(r: Row, v: number) {
  const d = r.low ? v - r.me : r.me - v
  return Math.round(d * 10) / 10
}
function fmtDelta(r: Row, d: number) {
  if (d === 0) return '0'
  const a = r.int ? String(Math.round(Math.abs(d))) : Math.abs(d).toFixed(1)
  return (d > 0 ? '+' : MINUS) + a
}
function isClose(r: Row, d: number) {
  return Math.abs(d) <= (r.close ?? 2)
}

class Count {
  s = new Spring(110, 15, 0)
  target = 0
  constructor(public el: HTMLElement) {}
  set(n: number, instant: boolean) {
    this.target = n
    if (instant) {
      this.s.x = n
      this.s.v = 0
      this.el.textContent = String(n)
    }
  }
  tick(dt: number) {
    if (Math.abs(this.s.x - this.target) < 0.004 && this.s.settled) return
    this.s.step(this.target, dt)
    const shown = String(Math.max(0, Math.round(this.s.x)))
    if (this.el.textContent !== shown) this.el.textContent = shown
  }
}

export function initVersus() {
  const sec = $('#versus')
  const rowsEl = $('#vsRows')
  const tallyW = new Count($('#vsWin'))
  const tallyL = new Count($('#vsLose'))
  const noteEl = $('#vsNote')
  const legendEl = $('#vsLegend')
  const footEl = $('#vsFoot')
  const pickBtns = Array.from(sec.querySelectorAll<HTMLButtonElement>('.vs-pick button'))
  const tabBtns = Array.from(sec.querySelectorAll<HTMLButtonElement>('#vsTabs button'))
  const reduced = isReduced()

  let opp: Opp = 'opus'
  let group: Group = 'code'
  let started = false
  let cells: Cell[] = []
  let stamp: HTMLLIElement | null = null
  let stampKey = ''

  const tallyAll = () => {
    let w = 0
    let l = 0
    let t = 0
    let c = 0
    let n = 0
    for (const r of ROWS) {
      const v = r[opp]
      if (v === null) continue
      n++
      const d = adv(r, v)
      if (d > 0) w++
      else if (d < 0) {
        l++
        if (isClose(r, d)) c++
      } else t++
    }
    return { w, l, t, c, n }
  }

  const build = () => {
    rowsEl.textContent = ''
    cells = []
    const list = ROWS.filter((r) => r.g === group)
    list.forEach((r, i) => {
      const li = document.createElement('li')
      li.className = 'vs-row'
      li.innerHTML =
        '<div class="vs-name"><b></b><small></small></div>' +
        '<div class="vs-bars">' +
        '<div class="vs-bar me"><div class="trk"><i></i></div><span></span></div>' +
        '<div class="vs-bar them"><div class="trk"><i></i></div><span></span></div>' +
        '</div>' +
        '<div class="vs-delta"><b></b><em></em></div>'
      $('.vs-name b', li).textContent = r.name
      $('.vs-name small', li).textContent = r.sub
      const meI = $('.vs-bar.me i', li)
      $('.vs-bar.me span', li).textContent = fmtVal(r, r.me)
      meI.style.setProperty('--d', i * 0.06 + 's')
      const thI = $('.vs-bar.them i', li)
      thI.style.setProperty('--d', i * 0.06 + 0.07 + 's')
      cells.push({
        row: r,
        li,
        meI,
        thI,
        thV: $('.vs-bar.them span', li),
        thTrk: $('.vs-bar.them .trk', li),
        deltaB: $('.vs-delta b', li),
        deltaE: $('.vs-delta em', li),
      })
      rowsEl.appendChild(li)
    })
    stamp = document.createElement('li')
    stamp.className = 'vs-stamp'
    stamp.setAttribute('aria-hidden', 'true')
    rowsEl.appendChild(stamp)
    stampKey = ''
    footEl.textContent = FOOT[group]
  }

  const paintStamp = () => {
    if (!stamp) return
    let w = 0
    let l = 0
    let t = 0
    for (const c of cells) {
      const v = c.row[opp]
      if (v === null) continue
      const d = adv(c.row, v)
      if (d > 0) w++
      else if (d < 0) l++
      else t++
    }
    const n = w + l + t
    const p = document.createElement('p')
    if (n === 0) {
      p.textContent = `這一頁沒有 ${OPP_NAME[opp]} 的分數`
    } else {
      const tie = t ? `，持平 <b>${t}</b>` : ''
      p.innerHTML = `本頁 ${n} 項：領先 <b>${w}</b>，落後 <b>${l}</b>${tie}`
    }
    stamp.textContent = ''
    stamp.appendChild(p)
    const key = group + opp
    if (started && key !== stampKey) {
      stamp.classList.remove('hit')
      void stamp.offsetWidth
      stamp.classList.add('hit')
    }
    if (started) stampKey = key
  }

  const paint = () => {
    for (const c of cells) {
      const r = c.row
      const v = r[opp]
      c.meI.style.setProperty('--w', started ? String(width(r, r.me)) : '0')
      if (v === null) {
        c.li.classList.remove('win', 'lose', 'tie')
        c.li.classList.add('nr')
        c.thTrk.classList.add('na')
        c.thI.style.setProperty('--w', '0')
        c.thV.textContent = '未列出'
        c.deltaB.textContent = '—'
        c.deltaE.textContent = ''
        continue
      }
      const d = adv(r, v)
      c.li.classList.remove('nr')
      c.thTrk.classList.remove('na')
      c.li.classList.toggle('win', d > 0)
      c.li.classList.toggle('lose', d < 0)
      c.li.classList.toggle('tie', d === 0)
      c.thI.style.setProperty('--w', started ? String(width(r, v)) : '0')
      c.thV.textContent = fmtVal(r, v)
      c.deltaB.textContent = fmtDelta(r, d)
      c.deltaE.textContent = d === 0 ? '持平' : d < 0 && isClose(r, d) ? '差距小' : ''
    }
    paintStamp()
  }

  const updateText = (instant: boolean) => {
    const { w, l, t, c, n } = tallyAll()
    tallyW.set(w, instant)
    tallyL.set(l, instant)
    legendEl.textContent = ''
    const add = (html: string) => {
      const s = document.createElement('span')
      s.innerHTML = html
      legendEl.appendChild(s)
    }
    add('<i class="sw me"></i>Sonnet 5.5')
    add(`<i class="sw them"></i>${OPP_NAME[opp]}`)
    add('<i class="sw na"></i>對照表沒有這一格')
    if (opp === 'opus') {
      noteEl.textContent = `Opus 5.5 是同一代的大哥，多數基準比我高。我落後的 ${l} 項裡，有 ${c} 項差距很小。同一基準的不同設定會分開算，持平 ${t} 項。它的價格是我的兩倍。`
    } else if (opp === 'son5') {
      noteEl.textContent = `在有對照的 ${n} 項裡，我全部領先，最大的一項是 Terminal-Bench 4.0：70.6% 對 10.3%。兩代同價。Anthropic 說我通常用更少 token，但 Artificial Analysis 在 max 檔量到的輸出比 Sonnet 5 多約 60%。`
    } else {
      noteEl.textContent = `官方比較表裡，GPT-6 Sol 只有 ${n} 項有分數，這 ${n} 項我領先 ${w} 項。其餘 OpenAI 沒公布，我不自己補。`
    }
  }

  const setPressed = (btns: HTMLButtonElement[], on: HTMLButtonElement) => {
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b === on)))
  }

  pickBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const next = b.dataset.opp as Opp
      if (next === opp) return
      opp = next
      setPressed(pickBtns, b)
      paint()
      updateText(reduced)
    }),
  )
  tabBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const next = b.dataset.g as Group
      if (next === group) return
      group = next
      setPressed(tabBtns, b)
      const replay = started && !reduced
      build()
      if (replay) {
        started = false
        paint()
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            started = true
            paint()
          }),
        )
      } else {
        paint()
      }
    }),
  )

  build()
  paint()

  if (reduced) {
    started = true
    paint()
    updateText(true)
    return
  }

  updateText(true)
  tallyW.set(0, true)
  tallyL.set(0, true)
  let fired = false
  watchVisible(
    $('.vs-ledger', sec),
    (v) => {
      if (!v || fired) return
      fired = true
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          started = true
          paint()
          updateText(false)
        }),
      )
    },
    '-18% 0px',
  )
  onFrame((_t, dt) => {
    tallyW.tick(dt)
    tallyL.tick(dt)
  })
}
