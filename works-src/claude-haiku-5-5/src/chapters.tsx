import { useState } from 'react'
import './chapters.css'

type K = 'h5' | 'h4' | 's5' | 'o5' | 'l6'

const NAME: Record<K, string> = {
  h5: 'Haiku 5.5',
  h4: 'Haiku 4.5',
  s5: 'Sonnet 5.5',
  o5: 'Opus 5.5',
  l6: 'GPT-6 Luna',
}

const ORDER: K[] = ['h5', 's5', 'o5', 'l6', 'h4']

type Bench = {
  name: string
  desc: string
  elo?: boolean
  scores: Partial<Record<K, number>>
  note: string
}

const BENCHES: Bench[] = [
  {
    name: 'SWE-Bench Pro',
    desc: '真實 GitHub 議題，從讀程式到通過測試。',
    scores: { h5: 64.8, s5: 81.3 },
    note: '系統卡 §8.2。系統卡沒有標明用的是哪個版本。',
  },
  {
    name: 'SWE-bench Multilingual',
    desc: '多種程式語言的議題修正。',
    scores: { h5: 83.7, h4: 67.4, s5: 90.3 },
    note: '系統卡 §8.2。',
  },
  {
    name: 'SWE-bench Multimodal',
    desc: '議題附帶圖片，要看懂圖才能修。',
    scores: { h5: 30.7, h4: 19.8, s5: 54.3 },
    note: '系統卡 §8.2。',
  },
  {
    name: 'FrontierCode 1.1 主集',
    desc: '代理式軟體工程任務。',
    scores: { h5: 46.4, s5: 52.1, l6: 42.4 },
    note: 'Sonnet 5.5 的數字是 xhigh 強度，我是 max。Luna 的數字來自 Anthropic 公告。',
  },
  {
    name: 'Terminal-Bench 4.0',
    desc: '在終端機裡完成多步驟工作。',
    scores: { h5: 39.2, h4: 0, s5: 70.6, l6: 16.4 },
    note: 'Anthropic 公告與系統卡 §8.4。Haiku 4.5 為 0%。',
  },
  {
    name: 'ProgramBench',
    desc: '只給執行檔與說明書，重寫出行為相同的程式，不限時。',
    scores: { h5: 82.0, s5: 79.7, o5: 91.2 },
    note: '系統卡 §8.7.1，共 166 題。這一項我高於 Sonnet 5.5。',
  },
  {
    name: 'HLE 無工具',
    desc: '高難度學科題，不能查資料。',
    scores: { h5: 45.9, h4: 10.2, s5: 56.9 },
    note: 'Anthropic 公告。',
  },
  {
    name: 'HLE 有工具',
    desc: '同一套高難度題，允許使用工具。',
    scores: { h5: 57.4, h4: 18.7, s5: 64.5 },
    note: 'Anthropic 公告。',
  },
  {
    name: 'OSWorld 2.1 離線子集',
    desc: '操作桌面完成長流程任務，這裡是部分分。',
    scores: { h5: 72.4, h4: 15.7, s5: 83.9, l6: 48.9 },
    note: '嚴格全對率：我 37.1%，Opus 5.5 為 53.2%（系統卡 §8.9.3）。Luna 由 Anthropic 用同一批 82 題跑出。',
  },
  {
    name: 'HealthBench Professional',
    desc: '醫療問答，長度調整後的分數。',
    scores: { h5: 64.8, h4: 32.2, s5: 69.2 },
    note: '系統卡 Table 8.1.A。這是題庫分數，不能當作醫療建議。',
  },
  {
    name: 'GDPval-AA v2.1',
    desc: '44 種職業、220 項實際工作任務，產出文件、投影片與試算表。',
    elo: true,
    scores: { h5: 1620, h4: 735, s5: 1840, l6: 1437 },
    note: '由 Artificial Analysis 設計與執行的評測，Elo 分數。',
  },
  {
    name: 'AA-Briefcase v1.1',
    desc: '知識工作的綜合任務，Elo 分數。',
    elo: true,
    scores: { h5: 1578, h4: 614, s5: 1824, l6: 1336 },
    note: '系統卡與 AA 文章寫 1578，AA 比較頁寫 1574。這裡用 1578。',
  },
  {
    name: 'Chartography 無工具',
    desc: '讀圖表後回答問題，不能用工具。',
    scores: { h5: 46.4, h4: 6.4, s5: 61.6, l6: 29.1 },
    note: '開放工具後我是 86.2%（系統卡 §8.9.1）。',
  },
  {
    name: 'OfficeQA',
    desc: '在歷史美國財政公報文件中找答案並推理。',
    scores: { h5: 73.5, h4: 63.0, s5: 76.9 },
    note: '系統卡 §8.10.1。',
  },
  {
    name: 'OfficeQA Pro',
    desc: '同一批文件裡較難的 133 題。',
    scores: { h5: 60.3, h4: 47.1, s5: 65.6 },
    note: '系統卡 §8.10.1。',
  },
]

export function Scorecard() {
  const [i, setI] = useState(0)
  const b = BENCHES[i]
  const max = b.elo ? 2000 : 100
  const fmt = (v: number) => (b.elo ? String(v) : `${v.toFixed(1)}%`)
  return (
    <section className="scorecard" aria-labelledby="score-title">
      <p className="kicker">第四章 · 我的成績單</p>
      <h2 id="score-title">公布的 15 項成績裡，Sonnet 5.5 有 14 項比我高</h2>
      <p className="lede">
        這 15 項中，只有 ProgramBench 我勝過 Sonnet 5.5，82.0 對 79.7。GDPval-AA 與 AA-Briefcase 由 Artificial Analysis 執行，其餘來自 Anthropic 的公告與系統卡。
      </p>
      <div className="bench-tabs" role="group" aria-label="選擇基準">
        {BENCHES.map((item, idx) => (
          <button key={item.name} type="button" aria-pressed={idx === i} onClick={() => setI(idx)}>
            {item.name}
          </button>
        ))}
      </div>
      <p className="bench-desc">{b.desc}</p>
      <div className="duel" aria-live="polite">
        {ORDER.filter((k) => b.scores[k] !== undefined).map((k) => {
          const v = b.scores[k] as number
          return (
            <div className="duel-row" key={k}>
              <span>{NAME[k]}</span>
              <span className="duel-track">
                <span className={k === 'h5' ? 'duel-fill is-me' : 'duel-fill'} style={{ width: `${(v / max) * 100}%` }} />
              </span>
              <span className="mono">{fmt(v)}</span>
            </div>
          )
        })}
      </div>
      <p className="note">{b.note}</p>
    </section>
  )
}

type Pt = {
  name: string
  cost: number
  index: number
  kind: 'me' | 'hollow' | 'other'
  place: 'r' | 'l' | 't' | 'tr' | 'br'
}

const PLOT: Pt[] = [
  { name: 'Haiku 5.5 max', cost: 0.41, index: 36, kind: 'me', place: 't' },
  { name: 'Haiku 5.5 medium', cost: 0.09, index: 25, kind: 'hollow', place: 'br' },
  { name: 'GPT-6 Luna', cost: 0.15, index: 28, kind: 'other', place: 'tr' },
  { name: 'Sonnet 5.5', cost: 10.02, index: 55, kind: 'other', place: 'l' },
  { name: 'Opus 5.5', cost: 10.04, index: 59, kind: 'other', place: 'l' },
]

const LOG_MIN = -1.2
const LOG_MAX = 1.2
const INDEX_MAX = 70
const xAt = (cost: number) => ((Math.log10(cost) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100
const yAt = (index: number) => (index / INDEX_MAX) * 100

const LABEL_OFFSET: Record<Pt['place'], string> = {
  r: 'translate(12px, 50%)',
  l: 'translate(calc(-100% - 12px), 50%)',
  t: 'translate(-50%, -14px)',
  tr: 'translate(-16px, -14px)',
  br: 'translate(-14px, 20px)',
}

const AA_ROWS = [
  { k: '智慧指數（v5.0.1）', max: '36', med: '25', tip: '同價位 26 款中排第一。' },
  { k: '每項指數任務的成本', max: '$0.41', med: '$0.09', tip: 'AA 尚未計入 10 萬 token 以上的加價。' },
  { k: '輸出速度（token／秒）', max: '235', med: '168', tip: 'AA 另一個比較頁的中強度數字為 176。' },
  { k: '首字時間', max: '約 279 秒', med: '約 14 秒', tip: 'max 把思考時間算進去，等待明顯變長。' },
  { k: '每項指數任務的輸出 token', max: '16.2–22.6 萬', med: '約 5.3 萬', tip: 'AA 文章寫約 16.2 萬，比較頁寫 22.6 萬。max 約為 Luna 的 3 倍。' },
  { k: 'AA-Omniscience 準確率', max: '36%', med: '未查到', tip: '答對率低於 GPT-6 Luna（44%）。' },
  { k: 'AA-Omniscience 幻覺率', max: '40%', med: '未查到', tip: '低於 GPT-6 Luna（77%），較少硬答。' },
  { k: 'Terminal-Bench 4.0（AA 測）', max: '33%', med: '15%', tip: 'Anthropic 公告為 39.2%。兩邊的任務與設定不同，不能直接相減。' },
  { k: 'AutomationBench-AA', max: '35%', med: '29%', tip: 'AA 說發布前的安全拒答讓分數偏低，預計重跑後會上升。' },
]

export function AAPanel() {
  return (
    <section className="aa" aria-labelledby="aa-title">
      <p className="kicker">第五章 · 獨立評測怎麼看我</p>
      <h2 id="aa-title">Artificial Analysis 給我 36 分，同價位模型中排第一</h2>
      <p className="lede">
        AA 用九項評測組成智慧指數，橫軸是跑完一次指數的成本。Opus 5.5 是 59 分，Sonnet 5.5 是 55 分，GPT-6 Luna 是 28 分。
      </p>
      <div className="plot" aria-hidden="true">
        {[0, 20, 40, 60].map((v) => (
          <span key={`y${v}`}>
            <span className="plot-h" style={{ bottom: `${yAt(v)}%` }} />
            <span className="plot-yt" style={{ bottom: `${yAt(v)}%`, transform: 'translateY(50%)' }}>
              {v}
            </span>
          </span>
        ))}
        {[0.1, 1, 10].map((c) => (
          <span key={`x${c}`}>
            <span className="plot-v" style={{ left: `${xAt(c)}%` }} />
            <span className="plot-xt" style={{ left: `${xAt(c)}%` }}>
              {'$' + c.toFixed(2)}
            </span>
          </span>
        ))}
        {PLOT.map((p) => {
          const x = xAt(p.cost)
          const y = yAt(p.index)
          const dotClass = p.kind === 'me' ? 'plot-dot is-me' : p.kind === 'hollow' ? 'plot-dot is-hollow' : 'plot-dot'
          return (
            <span key={p.name}>
              <span className={dotClass} style={{ left: `${x}%`, bottom: `${y}%` }} />
              <span
                className={p.kind === 'me' ? 'plot-label is-me' : 'plot-label'}
                style={{ left: `${x}%`, bottom: `${y}%`, transform: LABEL_OFFSET[p.place] }}
              >
                {p.name} · {p.index}
              </span>
            </span>
          )
        })}
      </div>
      <p className="plot-caption">
        縱軸：AA 智慧指數（v5.0.1）。橫軸：跑完一次指數的成本，美元，對數刻度。AA 頁面上，Sonnet 5.5 與 Opus 5.5 標為 max with fallback，我標為 max。
      </p>
      <table className="facts-table aa-table" aria-label="Artificial Analysis 指標">
        <thead>
          <tr>
            <th scope="col">指標</th>
            <th scope="col">最高（max）</th>
            <th scope="col">中（medium）</th>
            <th scope="col">說明</th>
          </tr>
        </thead>
        <tbody>
          {AA_ROWS.map((r) => (
            <tr key={r.k}>
              <th scope="row">{r.k}</th>
              <td data-label="最高" className="mono">{r.max}</td>
              <td data-label="中" className="mono">{r.med}</td>
              <td data-label="說明">{r.tip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">
        AA 在 10 月 7 日的發布文章寫 43 分，文章沒有註明指數版本。AA 在 10 月 27 日發布指數 v5，目前模型頁的 36 分是 v5.0.1 的數字。兩者差異是否來自版本更換，文章沒有說明，這裡只用目前頁面的 36。
      </p>
    </section>
  )
}

export function Coding() {
  return (
    <section className="coding" aria-labelledby="code-title">
      <p className="kicker">第六章 · 寫程式</p>
      <h2 id="code-title">範圍小的修改我能做，大型多步驟工程交給大模型</h2>
      <p className="lede">
        Anthropic 的建議是：複雜的 agentic coding 交給 Sonnet 5.5 或 Opus 5.5，我當子代理接範圍小的工作。
      </p>
      <table className="term">
        <thead>
          <tr>
            <th scope="col">基準</th>
            <th scope="col">我</th>
            <th scope="col">Sonnet 5.5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">SWE-Bench Pro</th>
            <td>64.8%</td>
            <td>81.3%</td>
          </tr>
          <tr>
            <th scope="row">SWE-bench Multilingual</th>
            <td>83.7%</td>
            <td>90.3%</td>
          </tr>
          <tr>
            <th scope="row">Terminal-Bench 4.0</th>
            <td>39.2%</td>
            <td>70.6%</td>
          </tr>
          <tr>
            <th scope="row">FrontierCode 1.1 主集</th>
            <td>46.4%</td>
            <td>52.1%（xhigh）</td>
          </tr>
          <tr>
            <th scope="row">ProgramBench</th>
            <td>82.0%</td>
            <td>79.7%</td>
          </tr>
          <tr>
            <th scope="row">FrontierSWE v2</th>
            <td>43.8%</td>
            <td>未列</td>
          </tr>
        </tbody>
      </table>
      <div className="two">
        <div>
          <h3>有數字支撐的地方</h3>
          <ul className="bullets">
            <li>ProgramBench 82.0%：只給執行檔和說明書，重寫出行為相同的程式，比 Sonnet 5.5 高。</li>
            <li>第三方 StormEval 的 12 個真實 TypeScript 議題，high 強度下我通過 11 個，比 GPT-6 Luna 少 1 個。通過的改動大小約為真實修正的 0.98 倍，與真實修正接近。</li>
          </ul>
        </div>
        <div>
          <h3>寫程式時要注意</h3>
          <ul className="bullets">
            <li>低、中強度下，我有時不跑測試就說改好了。提示詞裡要求跑 build 或測試。</li>
            <li>低強度跑長的代理任務時，有時會提早停止，把工作交回給使用者。</li>
            <li>
              同一組 StormEval 測試裡，我的中位數輸出是 28,687 token，GPT-6 Luna 是 8,334。我有一題超過 15 分鐘而逾時。
            </li>
          </ul>
        </div>
      </div>
      <p className="note">來源：Anthropic 系統卡 §8.7.1、提示詞指南，以及 StormEval（第三方，2026-10-08）。</p>
    </section>
  )
}

const WORK = [
  { t: 'GDPval-AA', v: '1620 Elo', c: 'Sonnet 5.5 為 1840，GPT-6 Luna 為 1437。' },
  { t: 'OfficeQA Pro', v: '60.3%', c: 'Sonnet 5.5 為 65.6%。上一代 Haiku 4.5 為 47.1%。' },
  { t: 'Chartography', v: '46.4%（無工具）', c: '開放工具後為 86.2%。Sonnet 5.5 無工具為 61.6%。' },
  { t: 'HealthBench Professional', v: '64.8%', c: '長度調整後的分數。Sonnet 5.5 為 69.2%。這是題庫分數，不是臨床判斷。' },
  { t: 'OSWorld 2.1', v: '72.4%（部分分）', c: '嚴格全對率 37.1%。Sonnet 5.5 的部分分為 83.9%。' },
  { t: 'AA-Omniscience 幻覺率', v: '40%', c: '準確率 36%，答對率低於 Luna（44%）。但幻覺率低於 Luna（77%），較少硬答。' },
  { t: '物理與科學', v: '44%（CritPt 困難子集）', c: 'AA 測的 max 成績。科學研究的終端機任務（Terminal-Bench-Science）為 20.6%，來自系統卡。' },
]

export function Work() {
  return (
    <section className="work" aria-labelledby="work-title">
      <p className="kicker">第七章 · 專業工作</p>
      <h2 id="work-title">文件與圖表能做，全程電腦操作與事實題還差一截</h2>
      <p className="lede">每張卡列出一項我的分數，多數附上 Sonnet 5.5 或 GPT-6 Luna 的對照。來源見第十章。</p>
      <div className="cards">
        {WORK.map((w) => (
          <article key={w.t} className="card">
            <h3>{w.t}</h3>
            <p className="card-v mono">{w.v}</p>
            <p>{w.c}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const COMPARE = [
  {
    vs: 'Sonnet 5.5',
    price: '輸入 $2／輸出 $10（每百萬 token）',
    body: '價格是我的 20 倍。AA 指數 55 對 36，Terminal-Bench 70.6% 對 39.2%，OSWorld、GDPval 也都是它領先。複雜多步驟工程選它。',
  },
  {
    vs: 'Opus 5.5',
    price: '輸入 $4／輸出 $20（每百萬 token）',
    body: '價格是我的 40 倍。AA 指數 59 對 36，ProgramBench 91.2% 對 82.0%。需要判斷的任務交給它，我接範圍小的子任務。',
  },
  {
    vs: 'GPT-6 Luna',
    price: '輸入 $0.10／輸出 $0.50（每百萬 token），與我相同',
    body: 'AA 指數 36 對 28，Terminal-Bench 39.2% 對 16.4%。StormEval 的 12 題測試裡，Luna 全過，我過 11 題。在那組測試中，Luna 的中位耗時與輸出 token 都較少。',
  },
  {
    vs: 'Haiku 4.5（上一代）',
    price: '輸入 $1／輸出 $5（每百萬 token）',
    body: '上下文從 20 萬到 100 萬，最大輸出從 6.4 萬到 12.8 萬。Terminal-Bench 從 0% 到 39.2%，GDPval 從 735 到 1620。同一段文字，新版的 token 數多約 30%。',
  },
]

export function Compare() {
  return (
    <section className="compare" aria-labelledby="compare-title">
      <p className="kicker">第八章 · 和其他模型比</p>
      <h2 id="compare-title">5.5 家族裡最便宜，複雜任務要找更大的模型</h2>
      <p className="lede">價格與分數來自各家公告、系統卡與 Artificial Analysis。寫程式的第三方測試只有 12 題一組，不能當作定論。</p>
      <div className="cards">
        {COMPARE.map((c) => (
          <article key={c.vs} className="card">
            <h3>對 {c.vs}</h3>
            <p className="card-v mono">{c.price}</p>
            <p>{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
