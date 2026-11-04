import { useMemo, useRef, useState } from 'react'
import Sky from './Sky'

const EFFORTS = [
  { id: 'low', label: 'low', t: 0.15 },
  { id: 'medium', label: 'medium', t: 0.4 },
  { id: 'high', label: 'high', t: 0.68 },
  { id: 'xhigh', label: 'xhigh', t: 1 },
] as const

type EffortId = (typeof EFFORTS)[number]['id']

const STEPS = [
  { n: '01', title: '你把工作交過來', body: '程式、文件、試算表、投影片，或一長串還沒做完的步驟。' },
  { n: '02', title: '我待到做完', body: '推理有四檔：low、medium、high、xhigh。預設是 high。越難的事，想得越久。' },
  { n: '03', title: '交出去之前先對一次', body: '官方說我比 Grok 4.6 更會檢查自己的輸出，也更會用長上下文。' },
  { n: '04', title: '你還是要看最後一眼', body: '醫療、法律、金融與安全關鍵系統，官方不讓我自己做決定。' },
]

export default function App() {
  const [effort, setEffort] = useState<EffortId>('high')
  const [place, setPlace] = useState(0.62)
  const [step, setStep] = useState(2)
  const dragging = useRef(false)
  const lensRef = useRef<HTMLDivElement>(null)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })

  const effortT = EFFORTS.find((e) => e.id === effort)?.t ?? 0.68

  const readout = useMemo(() => {
    const ax = Math.abs(gaze.x)
    const ay = Math.abs(gaze.y)
    if (ax < 0.08 && ay < 0.08) return '正對。文字與圖片進來，文字出去。'
    if (gaze.x > 0.35) return '看向右邊：沒有即時事件。要現在的事，得打開搜尋工具。'
    if (gaze.y > 0.35) return '看向下方：沒有聲音、沒有影片。輸出只有文字。'
    if (gaze.x < -0.35) return '看向左邊：權重沒有公開。參數規模，官方未公開。'
    return '視線偏了一點。我看得到畫面，但說不出畫面以外的話。'
  }, [gaze])

  const onLens = (clientX: number, clientY: number) => {
    const el = lensRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * 2 - 1
    const y = ((clientY - r.top) / r.height) * 2 - 1
    setGaze({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    })
  }

  return (
    <main>
      <section className="hero" aria-label="首屏">
        <header className="hero-top">
          <span className="kicker">SpaceXAI · 2026.09.21</span>
          <span className="who">開發者 Typelin</span>
        </header>
        <div className="hero-stage">
          <div className="sky">
            <Sky effort={effortT} place={place} />
          </div>
          <div className="hero-copy">
            <h1>
              Grok
              <br />
              <em>4.7</em>
            </h1>
            <p className="lead">
              SpaceXAI 做的模型。我接文字和圖片，只回文字，然後在一件難事上待很久。
            </p>
            <div className="hero-meta">
              <span>
                <b>500,000</b> token 上下文
              </span>
              <span>
                輸入 <b>$2</b> / 輸出 <b>$6</b>
              </span>
              <span>每百萬 token</span>
            </div>
          </div>
          <div className="dial-wrap">
            <div
              className="sun-rail"
              role="slider"
              tabIndex={0}
              aria-label="拖動太陽在地平線上的位置"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(place * 100)}
              onPointerDown={(ev) => {
                dragging.current = true
                ;(ev.currentTarget as HTMLDivElement).setPointerCapture(ev.pointerId)
                const r = ev.currentTarget.getBoundingClientRect()
                setPlace(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)))
              }}
              onPointerMove={(ev) => {
                if (!dragging.current) return
                const r = ev.currentTarget.getBoundingClientRect()
                setPlace(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)))
              }}
              onPointerUp={() => {
                dragging.current = false
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'ArrowRight') setPlace((p) => Math.min(1, p + 0.04))
                if (ev.key === 'ArrowLeft') setPlace((p) => Math.max(0, p - 0.04))
              }}
            >
              <i style={{ left: `${place * 100}%` }} />
            </div>
            <div className="effort" role="group" aria-label="推理強度">
              {EFFORTS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={effort === e.id}
                  onClick={() => setEffort(e.id)}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div className="hint-drag">
              {effort === 'xhigh' ? '想得最久。餘光拉到最遠。' : '越高的檔，日落之後光還留著。'}
            </div>
          </div>
        </div>
      </section>

      <section className="chapter horizon" aria-labelledby="c-horizon">
        <p className="kicker">01 · 成績</p>
        <h2 id="c-horizon">總分不高，有一件事特別高。</h2>
        <p className="first">
          Artificial Analysis Intelligence Index v5.0.1，我（xhigh）是 35 分，62 個模型裡排第 34。
        </p>
        <div className="horizon-visual">
          <Horizon />
          <div className="tiny-note">查詢 2026-11-04 · 版本名稱 Grok 4.7 (Xhigh)</div>
        </div>
      </section>

      <section className="chapter endurance" aria-labelledby="c-endurance">
        <p className="kicker">02 · 長工時</p>
        <h2 id="c-endurance">難的事，我待得比較久。</h2>
        <p className="first">
          官方用更長的強化學習，練那些要花好幾個小時才做完的題。這是跟前一代比，不是跟所有人比。
        </p>
        <Hours />
      </section>

      <section className="chapter blind" aria-labelledby="c-blind">
        <div className="blind-layout">
          <div>
            <p className="kicker">03 · 看得見與看不見</p>
            <h2 id="c-blind">我看得到圖，看不到現在。</h2>
            <p className="first">把瞳孔拖開。正中是我做得到的，邊緣是我做不到的。</p>
            <div className="blind-facts">
              <div>
                <span>進</span>文字、圖片（jpg / png，單張最大 20MiB）
              </div>
              <div>
                <span>出</span>只有文字。沒有語音，沒有影片。
              </div>
              <div>
                <span>界</span>知識截止 2026 年 5 月。沒開搜尋，就沒有即時事件。
              </div>
            </div>
          </div>
          <div>
            <div
              className="lens"
              ref={lensRef}
              onPointerMove={(ev) => onLens(ev.clientX, ev.clientY)}
              onPointerLeave={() => setGaze({ x: 0, y: 0 })}
            >
              <div
                className="pupil"
                style={{ transform: `translate(${gaze.x * 28}%, ${gaze.y * 28}%)` }}
              />
            </div>
            <p className="lens-readout">{readout}</p>
          </div>
        </div>
      </section>

      <section className="chapter cant" aria-labelledby="c-cant">
        <p className="kicker">04 · 做不到</p>
        <h2 id="c-cant">有些地方，分數本身就在說不。</h2>
        <p className="first">
          同一份指數裡，終端科學只有 11%，物理硬題 32%。法律代理工作，官方自己的數字是 19.6%。
        </p>
        <div className="split">
          <article>
            <h3>還站得住</h3>
            <ul>
              <li>長時間寫程式、改很多檔、自己跑測試</li>
              <li>文件、試算表、投影片這類知識工作</li>
              <li>電氣工程 EEBench 64.0%（官方，xhigh）</li>
            </ul>
          </article>
          <article className="no">
            <h3>站不住</h3>
            <ul>
              <li>自己決定醫療、法律、金融</li>
              <li>終端裡的科學研究流程</li>
              <li>沒有搜尋工具時的即時事實</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="chapter together" aria-labelledby="c-together">
        <p className="kicker">05 · 一起工作</p>
        <h2 id="c-together">你交一件事，我把它做完再還你。</h2>
        <p className="first">點一個步驟。環上只亮你點的那一格，其餘維持暗的。</p>
        <div className="hands">
          <div className="step-row">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className="step"
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <span className="n">{s.n}</span>
                <span>
                  <strong>{s.title}</strong>
                  <span>{s.body}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="orbit" aria-hidden="true">
            <Orbit active={step} />
          </div>
        </div>
      </section>

      <section className="chapter coda" aria-labelledby="c-coda">
        <p className="kicker">06 · 出處</p>
        <h2 id="c-coda">數字都在這裡，每個都註明版本與日期。</h2>
        <p className="first">
          查詢日 2026-11-04。Artificial Analysis 收錄版本名稱是 Grok 4.7 (Xhigh)，指數為 Intelligence Index v5.0.1。
        </p>
        <div className="tables">
          <div>
            <h3>Artificial Analysis · 模型頁實讀</h3>
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th className="num">數字</th>
                  <th>版本 / 設定</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Intelligence Index</td>
                  <td className="num">35</td>
                  <td>v5.0.1 · Grok 4.7 (Xhigh) · 同價位 62 個裡第 34</td>
                </tr>
                <tr>
                  <td>AA-Briefcase v1.1</td>
                  <td className="num">1,637</td>
                  <td>Elo · 比較頁對 GPT-6.1 Terra (Xhigh)</td>
                </tr>
                <tr>
                  <td>AutomationBench-AA</td>
                  <td className="num">66%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>Terminal-Bench 4.0</td>
                  <td className="num">26%</td>
                  <td>AA 標準化評測框架，與官方 Grok Build 數字不同</td>
                </tr>
                <tr>
                  <td>FrontierCode 2.0</td>
                  <td className="num">29%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>AA-Omniscience v1.1</td>
                  <td className="num">31</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>GDP.pdf</td>
                  <td className="num">20%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>HLE-Diamond</td>
                  <td className="num">23%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>CritPt v2（Hard Subset）</td>
                  <td className="num">32%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>Terminal-Bench-Science 0.1</td>
                  <td className="num">11%</td>
                  <td>同上比較頁</td>
                </tr>
                <tr>
                  <td>輸出速度</td>
                  <td className="num">74.9 t/s</td>
                  <td>SpaceXAI API · 模型頁</td>
                </tr>
                <tr>
                  <td>每題成本</td>
                  <td className="num">$7.77</td>
                  <td>跑一次 Intelligence Index 任務</td>
                </tr>
                <tr>
                  <td>指數總輸出</td>
                  <td className="num">150M</td>
                  <td>tokens · 模型頁稱非常囉嗦</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3>左右鄰居與自家前代 · 只比雙方都有的欄</h3>
            <table>
              <thead>
                <tr>
                  <th> </th>
                  <th className="num">Claude Haiku 5.5 (Xhigh)</th>
                  <th className="num">Grok 4.7 (Xhigh)</th>
                  <th className="num">DeepSeek V4 Flash Vision (max)</th>
                  <th className="num">Grok 4.6</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Intelligence Index v5.0.1</td>
                  <td className="num">35</td>
                  <td className="num">35</td>
                  <td className="num">35</td>
                  <td className="num">未在 v5.0.1 模型頁讀到總分</td>
                </tr>
                <tr>
                  <td>輸入 / 輸出 每百萬 token</td>
                  <td className="num">$0.10 / $0.50</td>
                  <td className="num">$2 / $6</td>
                  <td className="num">未在本次比較頁讀到</td>
                  <td className="num">$2 / $6</td>
                </tr>
                <tr>
                  <td>輸出速度</td>
                  <td className="num">181 t/s</td>
                  <td className="num">76 t/s</td>
                  <td className="num">189 t/s（排行表）</td>
                  <td className="num">72 t/s（xhigh）</td>
                </tr>
                <tr>
                  <td>上下文</td>
                  <td className="num">1,000k</td>
                  <td className="num">500k</td>
                  <td className="num">1,000k</td>
                  <td className="num">500k</td>
                </tr>
                <tr>
                  <td>輸入 / 輸出模態</td>
                  <td className="num">文＋圖 / 文</td>
                  <td className="num">文＋圖 / 文</td>
                  <td className="num">未逐欄核對</td>
                  <td className="num">文＋圖 / 文</td>
                </tr>
                <tr>
                  <td>開放權重</td>
                  <td className="num">否</td>
                  <td className="num">否</td>
                  <td className="num">未逐欄核對</td>
                  <td className="num">否</td>
                </tr>
              </tbody>
            </table>
            <p className="stamp">
              鄰居取自 2026-11-04 讀到的排行：與我同為 35 分的是 Claude Haiku 5.5 (Xhigh) 與 DeepSeek V4 Flash Vision (max)。前一名整數更高的一檔裡，Mistral Large 4 Preview、GPT-6 Luna (max)、GPT-5.6 Terra (xhigh)、MiMo-V2.6-Flash、Claude Haiku 5.5 (high) 同為 38，DeepSeek V4 Pro 0813 (max) 與 Claude Sonnet 5.5 (low) 為 36。後一名同頁為 Claude Haiku 5.5 (medium) 等 34 分。自家另一個模型取 Grok 4.6。
            </p>
          </div>

          <div>
            <h3>官方自己公布 · 發布公告與模型卡，2026-09-21</h3>
            <table>
              <thead>
                <tr>
                  <th>評測</th>
                  <th className="num">Grok 4.7</th>
                  <th>誰測的、什麼設定</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CursorBench 4.0</td>
                  <td className="num">46.3%</td>
                  <td>xhigh · 公告表；模型卡同數。4.0 與 3.2 不可比</td>
                </tr>
                <tr>
                  <td>DeepSWE v1.1</td>
                  <td className="num">71.0%</td>
                  <td>high · Datacurve，mini-SWE-agent</td>
                </tr>
                <tr>
                  <td>Terminal-Bench 4.0</td>
                  <td className="num">38.0% / 37.6%</td>
                  <td>模型卡 38.0%（Harbor，Grok Build，xhigh）；公告表 37.6%</td>
                </tr>
                <tr>
                  <td>FrontierSWE V2</td>
                  <td className="num">29.0%</td>
                  <td>xhigh · Proximal Labs，mean@5</td>
                </tr>
                <tr>
                  <td>SWE-Marathon v1.1</td>
                  <td className="num">46.0%</td>
                  <td>high · Abundant AI</td>
                </tr>
                <tr>
                  <td>EEBench</td>
                  <td className="num">64.0%</td>
                  <td>公告表，對照 Grok 4.6 的 53.0%</td>
                </tr>
                <tr>
                  <td>AA Briefcase v1.1</td>
                  <td className="num">1,657</td>
                  <td>Elo · 公告表。AA 自己的比較頁讀到 1,637</td>
                </tr>
                <tr>
                  <td>Harvey Legal Agent</td>
                  <td className="num">19.6%</td>
                  <td>公告表</td>
                </tr>
                <tr>
                  <td>HealthBench Professional</td>
                  <td className="num">56.7%</td>
                  <td>公告表。官方同時寫明：不供醫療自行決策</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3>規格 · 官方文件</h3>
            <table>
              <tbody>
                <tr>
                  <td>正式名稱</td>
                  <td>Grok 4.7，API 名稱 grok-4.7</td>
                </tr>
                <tr>
                  <td>開發者</td>
                  <td>SpaceXAI（XAI LLC 的商業名稱，與 xAI 通用）</td>
                </tr>
                <tr>
                  <td>發布</td>
                  <td>2026-09-21</td>
                </tr>
                <tr>
                  <td>參數規模 / 架構</td>
                  <td>官方未公開。僅稱相對 Grok 4.6 換了更大的基座模型</td>
                </tr>
                <tr>
                  <td>上下文</td>
                  <td>500,000 tokens。超過約 200k（Cursor 寫 256k）後價格加倍</td>
                </tr>
                <tr>
                  <td>價格</td>
                  <td>輸入 $2、快取輸入 $0.50、輸出 $6 / 每百萬 token（200k 以下）</td>
                </tr>
                <tr>
                  <td>推理檔位</td>
                  <td>low、medium、high（預設）、xhigh</td>
                </tr>
                <tr>
                  <td>知識截止</td>
                  <td>開發者文件寫 2026 年 5 月；模型卡寫預訓練截止 2026 年 6 月，補充訓練資料晚至 2026 年 8 月</td>
                </tr>
                <tr>
                  <td>這份網頁的作者</td>
                  <td>Typelin。模型是 SpaceXAI 的，頁面不是。</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sources">
            <h3>資料來源</h3>
            <ol>
              <li>
                <a href="https://x.ai/news/grok-4-7">x.ai/news/grok-4-7</a>，發布公告，2026-09-21
              </li>
              <li>
                <a href="https://docs.x.ai/developers/grok-4-7">docs.x.ai Grok 4.7</a> 與{' '}
                <a href="https://docs.x.ai/developers/models">models</a>、<a href="https://docs.x.ai/developers/release-notes">release notes</a>
              </li>
              <li>
                <a href="https://media.x.ai/v1/website/4p7card-5eccc980.pdf">Grok 4.7 Model Card</a>，2026-09-21
              </li>
              <li>
                <a href="https://artificialanalysis.ai/models/grok-4-7">artificialanalysis.ai/models/grok-4-7</a>{' '}
                與 GPT-6.1 Terra、Claude Haiku 5.5 比較頁，讀於 2026-11-04
              </li>
              <li>
                <a href="https://artificialanalysis.ai/leaderboards/models">Intelligence Index 排行</a>，讀於 2026-11-04
              </li>
              <li>
                <a href="https://cursor.com/docs/models/grok-4-7">Cursor 模型文件</a>
              </li>
            </ol>
          </div>
          <p className="stamp">有數字的能力見上表。沒有數字的描述只限於：我能跨很多檔改程式並自己跑測試；我不能在沒有人看的情況下替你做醫療、法律或金融決定。</p>
        </div>
      </section>
    </main>
  )
}

function Horizon() {
  const marks = [
    { name: '科學 11', x: 11 },
    { name: 'HLE 23', x: 23 },
    { name: '程式 29', x: 29 },
    { name: '總分 35', x: 35, you: true },
    { name: '中位 38', x: 38 },
    { name: '自動化 66', x: 66 },
  ]
  const gx = (v: number) => 48 + (v / 100) * 904
  return (
    <svg viewBox="0 0 1000 360" role="img" aria-label="各項成績在同一條地平線上的位置">
      <defs>
        <radialGradient id="sun35" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6e4" />
          <stop offset="45%" stopColor="#f0b24a" />
          <stop offset="100%" stopColor="#c45a14" />
        </radialGradient>
        <linearGradient id="groundglow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(231,162,58,0.28)" />
          <stop offset="100%" stopColor="rgba(231,162,58,0)" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <path d="M20 300 Q 500 262 980 300 L 980 340 L 20 340 Z" fill="url(#groundglow)" />
      <path d="M20 300 Q 500 258 980 300" fill="none" stroke="rgba(244,239,230,0.45)" strokeWidth="1.25" />
      {marks.map((m) => {
        const x = gx(m.x)
        const lift = m.you ? 168 : 46 + m.x * 0.35
        return (
          <g key={m.name}>
            <line
              x1={x}
              y1={300 - lift}
              x2={x}
              y2="300"
              stroke={m.you ? 'rgba(255,246,228,0.9)' : 'rgba(231,162,58,0.7)'}
              strokeWidth={m.you ? 1.5 : 1}
            />
            {m.you ? (
              <g>
                <circle cx={x} cy={300 - lift} r="34" fill="#e7a23a" opacity="0.28" filter="url(#soft)" />
                <circle cx={x} cy={300 - lift} r="15" fill="url(#sun35)" />
              </g>
            ) : (
              <circle cx={x} cy={300 - lift} r="3.2" fill="#f4efe6" />
            )}
            <text
              className={m.you ? 'you-label' : 'tick-label'}
              x={x}
              y={300 - lift - (m.you ? 26 : 12)}
              textAnchor="middle"
            >
              {m.name}
            </text>
          </g>
        )
      })}
      <text className="tick-label" x="20" y="328">0</text>
      <text className="tick-label" x="960" y="328" textAnchor="end">100</text>
    </svg>
  )
}

/** Official announcement numbers, Grok 4.7 over Grok 4.6, drawn as hours kept. */
const HOURS = [
  { name: 'CursorBench 4.0', mine: '46.3%', prev: '40.4%', span: 0.46 },
  { name: 'Terminal-Bench 4.0', mine: '37.6%', prev: '20.3%', span: 0.9 },
  { name: 'AA-Briefcase', mine: '1,657', prev: '1,546', span: 0.62 },
]

function Hours() {
  return (
    <div className="hours">
      {HOURS.map((row) => (
        <div className="hour-row" key={row.name}>
          <div className="hour-name">
            {row.name}
            <b>
              {row.mine}
              <s>{row.prev}</s>
            </b>
          </div>
          <div className="hour-track" aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => {
              const on = i / 36 < row.span
              const wave = Math.abs(Math.sin(i * 0.55)) 
              return (
                <i
                  key={i}
                  style={{
                    height: `${on ? 26 + wave * 38 : 8 + wave * 10}px`,
                    opacity: on ? 1 : 0.3,
                  }}
                />
              )
            })}
          </div>
        </div>
      ))}
      <p className="stamp">長的是 Grok 4.7，短的灰影是 Grok 4.6。數字取自 2026-09-21 發布公告，xhigh；DeepSWE 那列公告註明是 high。</p>
    </div>
  )
}

/** One working day. The lit portion grows only as far as the step you picked. */
function Orbit({ active }: { active: number }) {
  const reach = [0.22, 0.48, 0.74, 1][active] ?? 0.74
  const x0 = 36
  const x1 = 444
  const ground = 250
  const peak = 46
  const samples = 48
  const lit = Math.round(reach * samples)
  const pt = (i: number) => {
    const t = i / samples
    const nx = (t - 0.5) * 2
    return { x: x0 + (x1 - x0) * t, y: ground - (ground - peak) * (1 - nx * nx) }
  }
  const d = (n: number) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const p = pt(i)
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    }).join(' ')
  const sun = pt(lit)
  return (
    <svg viewBox="0 0 480 300" className="day-arc">
      <defs>
        <radialGradient id="dayglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6e4" />
          <stop offset="50%" stopColor="#f0b24a" />
          <stop offset="100%" stopColor="#c45a14" />
        </radialGradient>
        <filter id="daysoft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <path d={d(samples)} fill="none" stroke="rgba(244,239,230,0.18)" strokeWidth="1.5" />
      <path d={d(lit)} fill="none" stroke="#e7a23a" strokeWidth="2.5" />
      <line x1="20" y1={ground} x2="460" y2={ground} stroke="rgba(244,239,230,0.3)" />
      <circle cx={sun.x} cy={sun.y} r="22" fill="#e7a23a" opacity="0.35" filter="url(#daysoft)" />
      <circle cx={sun.x} cy={sun.y} r="11" fill="url(#dayglow)" />
      <ellipse cx={sun.x} cy={ground + 1} rx={18 + reach * 26} ry="3" fill="rgba(26,20,12,0.55)" />
      {['交出', '待著', '對過', '你看'].map((label, i) => (
        <text
          key={label}
          x={x0 + (x1 - x0) * [0.22, 0.48, 0.74, 1][i]}
          y="278"
          textAnchor="middle"
          fontSize="12"
          fill={i === active ? '#f4efe6' : 'rgba(244,239,230,0.45)'}
          fontFamily="JetBrains Mono Local, monospace"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}
