import { useEffect, useMemo, useState } from 'react'
import { ChartCanvas } from './ChartCanvas'
import { ContextCanvas } from './ContextCanvas'
import { Helm } from './Helm'
import { LimitCanvas } from './LimitCanvas'
import { StayCanvas } from './StayCanvas'
import { WakeCanvas } from './WakeCanvas'
import {
  AA_INDEX_LAUNCH,
  AA_NOW,
  MODEL,
  OFFICIAL_EVALS,
  PRICE,
  QUERY_DATE,
  SIBLING_47,
  SOURCES,
  type Effort,
} from './facts'
import { clamp } from './canvas'

const HATCHES = [
  {
    id: 0,
    title: '權重不開放',
    lead: '不能下載、不能自架。',
    body: 'Artificial Analysis 與官方文件都標 proprietary。每一條請求都得走 SpaceXAI 或轉售閘道。',
  },
  {
    id: 1,
    title: '輸出只有文字',
    lead: '看得懂圖，畫不出圖。',
    body: '輸入文字與影像，輸出文字。圖像、影片、語音是 Imagine 與 Voice 另一條產品線。',
  },
  {
    id: 2,
    title: '終端長程偏弱',
    lead: '官方 Terminal-Bench v3.0 只有 26%。',
    body: '同表 GPT-5.6 Sol Max 34.6%、Fable 5 Max 34.1%。DeepSWE v1.1 也落在 Sol 的 73% 之後，65.9%。',
  },
  {
    id: 3,
    title: '沒有即時世界',
    lead: '沒開搜尋就停在訓練截止日。',
    body: '開發者文件寫明：沒啟用 Web Search／X Search，就沒有訓練資料之後的時事。截止日文件寫 January 2026，總表寫 February 1, 2026。',
  },
] as const

function useScrollHeading() {
  const [scroll, setScroll] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const doc = document.documentElement.scrollHeight - window.innerHeight
      setScroll(clamp(y / Math.max(window.innerHeight, 1), 0, 1))
      setProgress(doc > 0 ? clamp(y / doc, 0, 1) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scroll, progress }
}

export default function App() {
  const { scroll, progress } = useScrollHeading()
  const [heading, setHeading] = useState(0)
  const [effort, setEffort] = useState<Effort>(MODEL.reasoningDefault)
  const [zoom, setZoom] = useState(0.18)
  const [hatch, setHatch] = useState(2)
  const hatchItem = useMemo(() => HATCHES[hatch], [hatch])

  return (
    <div className="deck">
      <a className="skip" href="#who">
        跳到內文
      </a>

      <header className="mast">
        <p className="mast-mark">Grok 4.6 · SpaceXAI</p>
        <p className="mast-course">
          航程 {Math.round(progress * 100)}%
          <span aria-hidden="true"> · {effort}</span>
        </p>
      </header>

      <section className="hero" aria-label="首屏">
        <div className="hero-copy">
          <p className="eyebrow">SpaceXAI · 2026 年 8 月 12 日</p>
          <h1>
            <span className="hero-name">Grok 4.6</span>
            <span className="hero-sub">長航</span>
          </h1>
          <p className="hero-lead">
            我不是聊天氣泡。我是一艘被訓練去走很遠的船：研究、改程式、把想法做成能用的東西。
          </p>
          <p className="hero-meta">
            開發者 SpaceXAI　API <code>grok-4.6</code>　預設推理 high
          </p>
          <p className="hero-hint">拖底欄航向，或在海面上左右移動。</p>
        </div>
        <div className="hero-scene" aria-hidden="true">
          <WakeCanvas heading={heading} scroll={scroll} effort={effort} onHeading={setHeading} />
        </div>
      </section>

      <Helm
        heading={heading}
        onHeading={setHeading}
        effort={effort}
        onEffort={setEffort}
        progress={progress}
      />

      <section id="who" className="chapter chapter-who">
        <div className="chapter-inner">
          <p className="kicker">第 1 章</p>
          <h2>我是誰做的、哪一天下水</h2>
          <p className="lede">
            SpaceXAI 在 2026 年 8 月 12 日發布 Grok 4.6。它接在 Grok 4.5 後面，不是新底座，是更長的補訓。
          </p>
          <dl className="spec-grid">
            <div>
              <dt>開發者</dt>
              <dd>SpaceXAI</dd>
            </div>
            <div>
              <dt>API 名稱</dt>
              <dd>
                <code>{MODEL.apiName}</code>
              </dd>
            </div>
            <div>
              <dt>上下文</dt>
              <dd>500,000 token</dd>
            </div>
            <div>
              <dt>模態</dt>
              <dd>
                {MODEL.modalitiesIn} → {MODEL.modalitiesOut}
              </dd>
            </div>
            <div>
              <dt>參數</dt>
              <dd>官方未公開精確數字</dd>
            </div>
            <div>
              <dt>權重</dt>
              <dd>不開放</dd>
            </div>
          </dl>
          <p className="aside">{MODEL.developerNote}</p>
        </div>
      </section>

      <section className="chapter chapter-split chapter-stay">
        <div className="chapter-scene" aria-hidden="true">
          <StayCanvas heading={heading} effort={effort} />
        </div>
        <div className="chapter-copy">
          <p className="kicker">第 2 章 · SFT → RL</p>
          <h2>我被訓練去走很遠</h2>
          <p className="lede">
            官方說法：更長的補充訓練、用 Grok 4.5 重做 SFT 軌跡，再在知識工作、寫程式、網頁與 CAD 環境做 agentic RL。
          </p>
          <p className="body">
            我擅長把一個產品想法做成第一版：查陌生領域、排結構、做互動、再依回饋改。長軌跡上開始會先自測再往下走。這是官方描述，不是我自己加的形容。
          </p>
        </div>
      </section>

      <section className="chapter chapter-split chapter-chart">
        <div className="chapter-copy chart-copy">
          <p className="kicker">第 3 章</p>
          <h2>同一把尺上，我和誰並排</h2>
          <p className="lede">
            2026 年 8 月 12 日，Artificial Analysis Intelligence Index v4.1.1 給 Grok 4.6（high）61 分，與 GPT-5.6 Sol（max）同分。
          </p>
          <p className="body">
            前一名是 Claude Fable 5（max with fallback）62；再前是 Claude Opus 5（max）63。後一名評測文寫「稍落後的 Kimi K3」，沒給精確整數。同廠 Grok 4.5（high）56。
          </p>
          <p className="note">
            浮標高度依 v4.1.1 總分。查詢日 {QUERY_DATE}，現行 Index 已改 v5.0.1，Grok 4.6 頁面不再給總分。
          </p>
        </div>
        <div className="chapter-scene chart-scene" aria-hidden="true">
          <ChartCanvas heading={heading} />
        </div>
      </section>

      <section className="chapter chapter-split chapter-limit">
        <div className="chapter-copy">
          <p className="kicker">第 4 章</p>
          <h2>四道艙口，打開才看得到限制</h2>
          <p className="lede">點艙口。這四件事換成別的模型就不成立：權重、輸出模態、終端長程、即時世界。</p>
          <div className="hatches" role="tablist" aria-label="限制艙口">
            {HATCHES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={hatch === item.id}
                className={hatch === item.id ? 'is-on' : undefined}
                onClick={() => setHatch(item.id)}
              >
                <span className="hatch-index">0{item.id + 1}</span>
                {item.title}
              </button>
            ))}
          </div>
          <div className="hatch-panel" role="tabpanel">
            <h3>{hatchItem.title}</h3>
            <p>{hatchItem.lead}</p>
            <p className="body">{hatchItem.body}</p>
          </div>
        </div>
        <div className="chapter-scene" aria-hidden="true">
          <LimitCanvas heading={heading} lit={hatch} />
        </div>
      </section>

      <section className="chapter chapter-split chapter-scale">
        <div className="chapter-copy">
          <p className="kicker">第 5 章</p>
          <h2>船很小，海有五十萬 token</h2>
          <p className="lede">
            API 上下文 500,000 token。提示一到 200,000，整筆請求改收較高費率。
          </p>
          <label className="zoom-ctrl">
            <span>拉遠看海</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
            />
          </label>
          <p className="note">標準價 $2 / $0.50 / $6；長提示 $4 / $1 / $12。官方 API 頁寫 500,000 token。</p>
        </div>
        <div className="chapter-scene" aria-hidden="true">
          <ContextCanvas zoom={zoom} />
        </div>
      </section>

      <section className="chapter chapter-work">
        <div className="chapter-inner">
          <p className="kicker">第 6 章</p>
          <h2>怎麼跟我一起工作</h2>
          <p className="lede">
            推理強度 low、medium、high、xhigh，預設 high。目前是 {effort}。舵輪改航向，按鈕改推理檔，浪跟著變。
          </p>
          <ul className="work-list">
            <li>工具：函式呼叫、結構化輸出、Web Search、X Search、程式執行。</li>
            <li>通道：API、Cursor、Grok Build、GitHub Copilot，以及 OpenRouter、Vercel、Cloudflare 等閘道。</li>
            <li>長迴圈：官方建議 sticky prompt cache key，必要時做 context compaction。</li>
            <li>
              我做得到的例子：把產品構想做成可互動的第一版，再依回饋改幾輪。
            </li>
            <li>
              我做不到的例子：不開搜尋就講今天的新聞；不經 Imagine 就產出圖像。
            </li>
          </ul>
          <p className="aside">
            有數字佐證的能力見第 3 章與末章表格。本段其餘是官方產品描述與使用方式，不是基準分數。
          </p>
        </div>
      </section>

      <section className="chapter chapter-ledger" id="ledger">
        <div className="chapter-inner">
          <p className="kicker">第 7 章 · 航海日誌</p>
          <h2>數字、對手、出處</h2>
          <p className="lede ledger-lede">
            每個分數都寫評測版本、被收錄時的模型設定、查詢日期。沒在頁面上讀到的數字不寫。
          </p>

          <h3>規格</h3>
          <table>
            <tbody>
              <tr>
                <th>正式名稱</th>
                <td>Grok 4.6</td>
              </tr>
              <tr>
                <th>開發者</th>
                <td>SpaceXAI（XAI LLC 營業名稱；頁尾 SpaceX Super Intelligence LLC）</td>
              </tr>
              <tr>
                <th>發布</th>
                <td>2026-08-12</td>
              </tr>
              <tr>
                <th>架構／參數</th>
                <td>{MODEL.paramsOfficial} {MODEL.architecture}</td>
              </tr>
              <tr>
                <th>上下文</th>
                <td>500,000 token；≥200k 提示整筆加價</td>
              </tr>
              <tr>
                <th>知識截止</th>
                <td>
                  模型頁 January 2026；Models 總表 February 1, 2026；模型卡預訓練 January 2026、補訓至 June 2026
                </td>
              </tr>
              <tr>
                <th>價目（&lt;200k）</th>
                <td>
                  輸入 ${PRICE.input}／快取 ${PRICE.cached}／輸出 ${PRICE.output}（{PRICE.unit}）
                </td>
              </tr>
              <tr>
                <th>價目（≥200k）</th>
                <td>
                  輸入 ${PRICE.inputLong}／快取 ${PRICE.cachedLong}／輸出 ${PRICE.outputLong}
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Artificial Analysis Intelligence Index（發布當日）</h3>
          <p className="note">
            版本 {AA_INDEX_LAUNCH.version} · 收錄設定 Grok 4.6（{AA_INDEX_LAUNCH.effort}）· 文章日期 {AA_INDEX_LAUNCH.captured} · 本頁查詢 {AA_INDEX_LAUNCH.queried}
          </p>
          <table>
            <thead>
              <tr>
                <th>項目</th>
                <th>成績</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Intelligence Index 總分</th>
                <td>{AA_INDEX_LAUNCH.score}</td>
              </tr>
              <tr>
                <th>構成評測</th>
                <td>{AA_INDEX_LAUNCH.evals}</td>
              </tr>
              <tr>
                <th>{AA_INDEX_LAUNCH.agentic.gdpval.name}</th>
                <td>{AA_INDEX_LAUNCH.agentic.gdpval.value}</td>
              </tr>
              <tr>
                <th>{AA_INDEX_LAUNCH.agentic.tau.name}</th>
                <td>{AA_INDEX_LAUNCH.agentic.tau.value}</td>
              </tr>
              <tr>
                <th>{AA_INDEX_LAUNCH.agentic.terminal21.name}</th>
                <td>{AA_INDEX_LAUNCH.agentic.terminal21.value}</td>
              </tr>
              <tr>
                <th>{AA_INDEX_LAUNCH.agentic.briefcase.name}</th>
                <td>{AA_INDEX_LAUNCH.agentic.briefcase.value}</td>
              </tr>
              <tr>
                <th>{AA_INDEX_LAUNCH.agentic.costPerTask.name}</th>
                <td>{AA_INDEX_LAUNCH.agentic.costPerTask.value}</td>
              </tr>
            </tbody>
          </table>

          <h3>對手比較（以 2026-08-12 Index v4.1.1 排名為準）</h3>
          <p className="note">
            前一名 Claude Fable 5（max with fallback）62；並列 GPT-5.6 Sol（max）61；後一名 Kimi K3（評測文未列精確分數，故總分欄寫未查到）；同廠 Grok 4.5（high）56。只比兩邊都有公開數字的欄位。
          </p>
          <table className="wide">
            <thead>
              <tr>
                <th>欄位</th>
                <th>Grok 4.6 high</th>
                <th>Fable 5 max*</th>
                <th>GPT-5.6 Sol max</th>
                <th>Grok 4.5 high</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Intelligence Index v4.1.1</th>
                <td>61</td>
                <td>62</td>
                <td>61</td>
                <td>56</td>
              </tr>
              <tr>
                <th>輸入／輸出價（$/1M）</th>
                <td>2 / 6</td>
                <td>10 / 50</td>
                <td>發布文寫 5 / 30；2026-11-04 模型頁 4 / 20</td>
                <td>2 / 6（快取 0.30）</td>
              </tr>
              <tr>
                <th>上下文</th>
                <td>500k</td>
                <td>1M</td>
                <td>1M</td>
                <td>500k</td>
              </tr>
              <tr>
                <th>輸入／輸出模態</th>
                <td>文+圖 → 文</td>
                <td>文+圖 → 文</td>
                <td>文+圖 → 文</td>
                <td>文+圖 → 文</td>
              </tr>
              <tr>
                <th>開放權重</th>
                <td>否</td>
                <td>否</td>
                <td>否</td>
                <td>否</td>
              </tr>
              <tr>
                <th>輸出速度（2026-11-04 AA）</th>
                <td>67.1 t/s</td>
                <td>67.8 t/s</td>
                <td>125.5 t/s</td>
                <td>未在本頁重查</td>
              </tr>
            </tbody>
          </table>
          <p className="note">*Fable 5 價目與速度取 2026-11-04 Artificial Analysis 模型頁（Max, Opus 4.8 Fallback）。Kimi K3 上下文 1M、輸入 $3／輸出 $15、開放權重、2.8T／104B active；因 Index 精確分數未在評測文讀到，不把總分寫進比較表。</p>

          <h3>官方發布表（SpaceXAI，Grok 4.6 High）</h3>
          <p className="note">
            版本依各列名稱 · 收錄設定 Grok 4.6 High · 查詢 {QUERY_DATE} · 對手分數為官方「self-reported 或公開成績取最佳」
          </p>
          <table className="wide">
            <thead>
              <tr>
                <th>評測</th>
                <th>Grok 4.6</th>
                <th>Grok 4.5 High</th>
                <th>GPT-5.6 Sol Max</th>
                <th>Fable 5 Max</th>
              </tr>
            </thead>
            <tbody>
              {OFFICIAL_EVALS.map((row) => (
                <tr key={row.name}>
                  <th>{row.name}</th>
                  <td>{row.grok46}</td>
                  <td>{row.grok45}</td>
                  <td>{row.sol}</td>
                  <td>{row.fable}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>2026-11-04 Artificial Analysis 現況（Index v5.0.1）</h3>
          <p className="note">
            模型頁標 deprecated。Intelligence Index 顯示 N/A。下列子項來自 High vs Xhigh 比較頁，版本 {AA_NOW.indexVersion}，收錄設定如列，查詢 {AA_NOW.captured}。
          </p>
          <table className="wide">
            <thead>
              <tr>
                <th>評測</th>
                <th>設定</th>
                <th>成績</th>
              </tr>
            </thead>
            <tbody>
              {[...AA_NOW.subscoresHigh, ...AA_NOW.subscoresXhigh].map((row) => (
                <tr key={`${row.name}-${row.effort}`}>
                  <th>{row.name}</th>
                  <td>Grok 4.6（{row.effort}）</td>
                  <td>{row.value}</td>
                </tr>
              ))}
              <tr>
                <th>Output speed</th>
                <td>high / xhigh</td>
                <td>
                  {AA_NOW.speedHigh.value} / {AA_NOW.speedXhigh.value} {AA_NOW.speedHigh.unit}
                </td>
              </tr>
              <tr>
                <th>TTFT</th>
                <td>high / xhigh</td>
                <td>
                  {AA_NOW.ttftHigh.value}s / {AA_NOW.ttftXhigh.value}s
                </td>
              </tr>
            </tbody>
          </table>

          <h3>同開發者：Grok 4.7 發布表中的 Grok 4.6 High</h3>
          <p className="note">來源 Introducing Grok 4.7（2026-09-21）· 收錄設定 Grok 4.6 High · 查詢 {QUERY_DATE}</p>
          <table>
            <thead>
              <tr>
                <th>評測</th>
                <th>Grok 4.7 xHigh</th>
                <th>Grok 4.6 High</th>
              </tr>
            </thead>
            <tbody>
              {SIBLING_47.map((row) => (
                <tr key={row.name}>
                  <th>{row.name}</th>
                  <td>{row.grok47}</td>
                  <td>{row.grok46}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>資料來源</h3>
          <ol className="sources">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} rel="noreferrer">
                  {s.label}
                </a>
                <span> — {s.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
