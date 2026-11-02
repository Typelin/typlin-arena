import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { makeDots, makeGrid, paintSpark, paintWindow } from './dotfield'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

function useInView(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(reduceMotion)
  useEffect(() => {
    if (reduceMotion()) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return seen
}

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvasRef.current) paintSpark(makeGrid(canvasRef.current))
  }, [])
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-field" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      <div className="hero-copy">
        <p className="kicker">Anthropic · 2026-10-07 發布</p>
        <h1 id="hero-title" className="hero-title">
          Claude
          <br />
          Haiku <span className="accent">5.5</span>
        </h1>
        <p className="lede">我是 Anthropic 推出的小型模型。請你當面試官，看看我能做什麼，也看看我做不到什麼。</p>
        <p className="scroll-hint">往下滑，開始面試 ↓</p>
      </div>
    </section>
  )
}

export function Identity() {
  return (
    <section className="identity" aria-labelledby="identity-title">
      <span className="identity-numeral" aria-hidden="true">5.5</span>
      <div className="identity-copy">
        <p className="kicker">第一章 · 我是誰</p>
        <h2 id="identity-title">我是 Claude 5.5 家族裡的小型模型</h2>
        <p className="lede">我和 Opus 5.5、Sonnet 5.5 同一代，是其中最快、最便宜的一個。</p>
        <dl className="facts">
          <div><dt>完整名稱</dt><dd>Claude Haiku 5.5</dd></div>
          <div><dt>開發者</dt><dd>Anthropic PBC</dd></div>
          <div><dt>發布日</dt><dd>2026-10-07</dd></div>
        </dl>
      </div>
    </section>
  )
}

export function ContextWindow() {
  const trackRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const canvas = canvasRef.current
    if (!track || !canvas) return
    const ctx = makeDots(canvas)
    const reduce = reduceMotion()
    let last = -1
    let frame = 0
    const paint = () => {
      frame = 0
      const r = track.getBoundingClientRect()
      const travel = track.offsetHeight - window.innerHeight
      const p = reduce ? 1 : clamp(-r.top / travel)
      const q = Math.round(p * 50) / 50
      if (q !== last) {
        last = q
        paintWindow(ctx, q)
      }
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    paint()
    if (reduce) return
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="window" aria-labelledby="window-title">
      <div className="window-track" ref={trackRef}>
        <div className="window-stick">
          <div className="window-field" aria-hidden="true">
            <canvas ref={canvasRef} />
          </div>
          <div className="window-copy">
            <p className="kicker">第二章 · 一次能讀多少</p>
            <h2 id="window-title">我一次能讀 100 萬個 token</h2>
            <p className="lede">橘色方塊是上一代 Haiku 4.5 的 20 萬 token，整個方格是我的 100 萬。</p>
            <div className="stats">
              <div><span>上下文</span><strong>200K → 1M</strong></div>
              <div><span>最大輸出</span><strong>64K → 128K</strong></div>
            </div>
            <p className="note">每個點約 25 個 token，示意用。</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const PRICES = [
  { name: 'Claude Fable 5.1', value: 10 },
  { name: 'Claude Opus 5.5', value: 4 },
  { name: 'Claude Sonnet 5.5', value: 2 },
  { name: 'Claude Haiku 4.5', value: 1 },
  { name: 'Claude Haiku 5.5', value: 0.1 },
]

export function Price() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  return (
    <section className="price" ref={ref} aria-labelledby="price-title">
      <p className="kicker">第三章 · 便宜，但有門檻</p>
      <h2 id="price-title">10 萬 token 以內，我很便宜</h2>
      <p className="lede">每百萬輸入 token 0.10 美元，比上一代 Haiku 4.5 便宜約 90%。</p>
      <ul className="bars" data-in={inView}>
        {PRICES.map((m) => {
          const hero = m.name === 'Claude Haiku 5.5'
          return (
            <li key={m.name}>
              <span className="bar-label">{m.name}</span>
              <span className="bar-track">
                <span
                  className={hero ? 'bar-fill is-hero' : 'bar-fill'}
                  style={{ '--w': m.value / 10 } as CSSProperties}
                />
              </span>
              <span className="bar-value">${m.value.toFixed(2)}</span>
            </li>
          )
        })}
      </ul>
      <p className="note">價格為每百萬輸入 token。提示詞超過 10 萬 token 時，輸入價漲為 5 倍。</p>
    </section>
  )
}

const BENCHMARKS = [
  { name: 'Terminal-Bench 4.0', me: 39.2, sonnet: 70.6 },
  { name: 'OSWorld 2.1（離線子集）', me: 72.4, sonnet: 83.9 },
  { name: 'Humanity’s Last Exam（無工具）', me: 45.9, sonnet: 56.9 },
  { name: 'Humanity’s Last Exam（有工具）', me: 57.4, sonnet: 64.5 },
  { name: 'FrontierCode 1.1（主要）', me: 46.4, sonnet: 52.1 },
  { name: 'Chartography（無工具）', me: 46.4, sonnet: 61.6 },
]

export function Limits() {
  const [idx, setIdx] = useState(0)
  const b = BENCHMARKS[idx]
  return (
    <section className="limits" aria-labelledby="limits-title">
      <p className="kicker">第四章 · 我做不到的事</p>
      <h2 id="limits-title">公告的六項百分比基準，Sonnet 5.5 都比我高</h2>
      <p className="lede">我在多步驟終端機任務上明顯弱於 Sonnet 5.5：Terminal-Bench 4.0 我拿 39.2%，Sonnet 5.5 拿 70.6%。</p>
      <div className="bench-tabs" role="group" aria-label="選擇基準">
        {BENCHMARKS.map((item, i) => (
          <button key={item.name} type="button" aria-pressed={i === idx} onClick={() => setIdx(i)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="duel" aria-live="polite">
        <div className="duel-row">
          <span>Haiku 5.5</span>
          <span className="duel-track"><span className="duel-fill is-me" style={{ width: `${b.me}%` }} /></span>
          <span className="mono">{b.me.toFixed(1)}%</span>
        </div>
        <div className="duel-row">
          <span>Sonnet 5.5</span>
          <span className="duel-track"><span className="duel-fill" style={{ width: `${b.sonnet}%` }} /></span>
          <span className="mono">{b.sonnet.toFixed(1)}%</span>
        </div>
      </div>
      <ul className="limit-list">
        <li>官方建議複雜的 agentic coding 交給 Sonnet 5.5 或 Opus 5.5。</li>
        <li>網路安全防護會擋下滲透測試類的請求。</li>
      </ul>
    </section>
  )
}

const LEVELS = [
  { zh: '低', en: 'Low', text: '思考最少，回應最快。' },
  { zh: '中', en: 'Medium', text: '預設值。在回應品質、速度與成本之間取捨。' },
  { zh: '高', en: 'High', text: '高及以下的強度，可以用 thinking: disabled 關掉思考。' },
  { zh: '超高', en: 'Xhigh', text: '思考比高更深，成本也比高更高。' },
  { zh: '最高', en: 'Max', text: '思考最深，成本最高。' },
]

const SWEEP = 240

export function Dial() {
  const [level, setLevel] = useState(1)
  const [drag, setDrag] = useState(false)
  const knobRef = useRef<HTMLDivElement>(null)
  const frac = level / (LEVELS.length - 1)
  const current = LEVELS[level]

  const setFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = knobRef.current!.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const deg = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI
    const a = clamp(deg, -SWEEP / 2, SWEEP / 2)
    setLevel(Math.round(((a + SWEEP / 2) / SWEEP) * (LEVELS.length - 1)))
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = LEVELS.length - 1
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setLevel((v) => Math.min(last, v + 1))
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setLevel((v) => Math.max(0, v - 1))
    else if (e.key === 'Home') setLevel(0)
    else if (e.key === 'End') setLevel(last)
    else return
    e.preventDefault()
  }

  return (
    <section className="dial" aria-labelledby="dial-title" style={{ '--heat': frac } as CSSProperties}>
      <div className="dial-copy">
        <p className="kicker">第五章 · 和大模型一起工作</p>
        <h2 id="dial-title">我適合當 Opus 5.5 或 Sonnet 5.5 的子代理</h2>
        <p className="lede">大模型負責主要判斷，我接手摘要、上下文壓縮這類範圍小的工作。</p>
        <div className="dial-body">
          <div
            ref={knobRef}
            className={drag ? 'knob is-drag' : 'knob'}
            role="slider"
            tabIndex={0}
            aria-label="思考強度"
            aria-valuemin={0}
            aria-valuemax={LEVELS.length - 1}
            aria-valuenow={level}
            aria-valuetext={`${current.zh}（${current.en}）`}
            style={{ '--f': frac } as CSSProperties}
            onKeyDown={onKey}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setDrag(true)
              setFromPointer(e)
            }}
            onPointerMove={(e) => {
              if (drag) setFromPointer(e)
            }}
            onPointerUp={() => setDrag(false)}
            onPointerCancel={() => setDrag(false)}
          >
            <span className="knob-track" aria-hidden="true" />
            <span className="knob-arc" aria-hidden="true" />
            {LEVELS.map((_, i) => (
              <span
                key={i}
                className={i <= level ? 'knob-tick is-on' : 'knob-tick'}
                style={{ transform: `rotate(${-SWEEP / 2 + (i / (LEVELS.length - 1)) * SWEEP}deg)` }}
                aria-hidden="true"
              />
            ))}
            <span className="knob-pointer" style={{ transform: `rotate(${-SWEEP / 2 + frac * SWEEP}deg)` }} aria-hidden="true" />
            <span className="knob-center" aria-hidden="true">
              <b>{current.zh}</b>
              <small>{current.en}</small>
            </span>
          </div>
          <div className="dial-readout">
            <p className="hint">拖動旋鈕，或用方向鍵調整思考強度</p>
            <div className="levels">
              {LEVELS.map((l, i) => (
                <button key={l.en} type="button" aria-pressed={i === level} onClick={() => setLevel(i)}>
                  {l.zh}
                </button>
              ))}
            </div>
            <p className="level-text">{current.text}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const FACTS = [
  { item: '完整名稱與 API ID', value: 'Claude Haiku 5.5；claude-haiku-5-5', src: 'A' },
  { item: '開發者', value: 'Anthropic PBC', src: 'B' },
  { item: '發布日', value: '2026-10-07', src: 'A, B' },
  { item: '輸入與輸出', value: '文字與圖片進，文字出', src: 'A' },
  { item: '上下文與最大輸出', value: '1M tokens；128K tokens', src: 'A' },
  { item: '上一代 Haiku 4.5', value: '上下文 200K；最大輸出 64K', src: 'C' },
  { item: '知識截止', value: '2026 年 6 月', src: 'A' },
  { item: '最早退役日', value: '2027-10-07', src: 'A' },
  { item: '價格（每百萬 token）', value: '輸入 0.10 美元、輸出 0.50 美元；超過 10 萬 token 時為 0.50 與 2.50 美元', src: 'A, D' },
  { item: '相對 Haiku 4.5', value: '10 萬 token 以內的請求便宜約 90%', src: 'B' },
  { item: '思考強度', value: '低、中、高、超高、最高五級，預設中；思考 token 計入 max_tokens', src: 'A, B, C' },
  { item: '限制：採樣參數', value: '官方要求省略 temperature、top_p、top_k，傳入可能回錯誤', src: 'A, C' },
  { item: '限制：思考區塊', value: '只能在產生它的帳號或連結帳號內重送', src: 'C' },
  { item: '限制：網路安全', value: '防護會擋下滲透測試等攻擊者較常用的技術', src: 'B' },
  { item: '限制：複雜編碼', value: '官方建議複雜的 agentic coding 交給 Sonnet 5.5、Opus 5.5', src: 'B' },
  { item: '參數數量、架構、訓練資料比例', value: '已查的官方頁面未公開；系統卡 PDF 未能開啟', src: 'A, B' },
]

const SOURCES = [
  { id: 'A', url: 'https://platform.claude.com/docs/en/models/haiku-5-5/overview', label: 'Claude Haiku 5.5 模型總覽（ID、規格、價格、退役日）' },
  { id: 'B', url: 'https://www.anthropic.com/claude-haiku-5-5', label: 'Anthropic 發布公告（2026-10-07；基準、價格比較、安全說明）' },
  { id: 'C', url: 'https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5', label: '與 Haiku 4.5 的差異（上下文、採樣參數、思考區塊）' },
  { id: 'D', url: 'https://platform.claude.com/docs/en/about-claude/pricing', label: 'Anthropic 定價頁（各模型價格與 10 萬 token 分界）' },
]

export function Ledger() {
  return (
    <section className="ledger" aria-labelledby="ledger-title">
      <p className="kicker">第六章 · 完整事實與來源</p>
      <h2 id="ledger-title">參數、架構與訓練資料比例，查到的官方頁面都沒有公開</h2>
      <p className="lede">我的規模和內部結構，Anthropic 在已查的頁面裡沒有公開。下表列出我查到的事實與出處。</p>
      <table className="facts-table">
        <thead>
          <tr>
            <th scope="col">項目</th>
            <th scope="col">內容</th>
            <th scope="col">出處</th>
          </tr>
        </thead>
        <tbody>
          {FACTS.map((f) => (
            <tr key={f.item}>
              <th scope="row">{f.item}</th>
              <td>{f.value}</td>
              <td className="mono">{f.src}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="sources-title">資料來源</h3>
      <ol className="sources">
        {SOURCES.map((s) => (
          <li key={s.id}>
            <span className="src-id mono">{s.id}</span>
            <div>
              <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
              <p>{s.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
