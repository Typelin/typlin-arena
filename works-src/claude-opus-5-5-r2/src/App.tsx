import { useEffect, useRef } from 'react'
import EffortDial from './EffortDial'
import { FACTS, SOURCES } from './content'
import { Engine } from './scene'

const CUTOFF = { y: 2026, m: 6 }

function today() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const months = (d.getFullYear() - CUTOFF.y) * 12 + (d.getMonth() + 1 - CUTOFF.m)
  return { label: `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`, months: Math.max(0, months) }
}

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const now = today()

  useEffect(() => {
    if (!canvas.current) return
    const e = new Engine(canvas.current)
    engine.current = e
    e.start()
    return () => {
      e.stop()
      engine.current = null
    }
  }, [])

  return (
    <>
      <canvas className="stage" ref={canvas} aria-hidden="true" />
      <main>
        <section className="ch hero" data-scene="hero" data-hook="hero" aria-labelledby="t-hero">
          <div className="orb hero-orb" data-orb />
          <div className="hero-copy">
            <p className="hero-by">
              <span>by</span> Anthropic
            </p>
            <h1 id="t-hero">
              <span className="h1-a">Claude</span>
              <span className="h1-b">Opus 5.5</span>
            </h1>
            <p className="lede">
              我是 Anthropic 開發的大型語言模型，<span className="nb">2026 年 9 月 22 日發布。</span>
            </p>
          </div>
          <p className="cue" aria-hidden="true">
            往下滑，認識我
          </p>
        </section>

        <section className="ch think" data-scene="think" aria-labelledby="t-think">
          <div className="orb think-orb" data-orb />
          <div className="think-copy">
            <h2 id="t-think">我回答之前，一定會先想。</h2>
            <p className="first">這個版本的思考關不掉；你能調的是想多深。effort 分五級，預設 medium。</p>
            <EffortDial engine={engine} />
          </div>
        </section>

        <section className="ch tokens" data-scene="tokens" aria-labelledby="t-tokens">
          <div className="tokens-pin" data-hook="tokens">
            <div className="tokens-grid" data-grid>
              <div className="orb tokens-orb" data-orb />
            </div>
            <div className="tokens-copy" data-clear>
              <h2 id="t-tokens">
                我一次能讀進 <b className="num">100</b> 萬個 token。
              </h2>
              <p className="first">約 55 萬個英文單字。往下滑，每一點是一個 token。</p>
            </div>
            <p className="tokens-count">
              <span className="count-n" data-hook="count">
                1
              </span>
              <span className="count-l">token 在畫面上</span>
            </p>
            <p className="tokens-out">
              但一次最多只能寫出 <b className="num">12.8</b> 萬個：底下亮起的 128 列。
            </p>
          </div>
        </section>

        <section className="ch work" data-scene="work" aria-labelledby="t-work">
          <div className="orb work-orb" data-orb />
          <div className="work-copy">
            <h2 id="t-work">我擅長很長、很大的程式工作。</h2>
            <p className="work-big" aria-hidden="true">
              680,000
            </p>
            <p className="first">一位早期測試者用我，在不到一天內遷移了 68 萬行程式碼。</p>
            <p className="second">把 HAProxy 從 C 改寫成 Rust，我花了 9.5 小時。</p>
          </div>
        </section>

        <section className="ch point" data-scene="point" data-hook="point" aria-labelledby="t-point">
          <div className="point-copy">
            <h2 id="t-point">
              我說話會先講重點<span className="orb point-orb" data-orb aria-hidden="true" />
            </h2>
            <p className="first">最重要的資訊放最前面，少用術語，也會照你給的寫作規則寫。</p>
          </div>
        </section>

        <section className="ch text" data-scene="text" aria-labelledby="t-text">
          <p className="glyph" data-glyph aria-hidden="true">
            <span>字</span>
          </p>
          <div className="text-copy">
            <h2 id="t-text">我只會輸出文字。</h2>
            <p className="first">你可以給我文字和圖片，但我回給你的只有文字。這一頁的畫面，也是我寫的程式碼畫出來的。</p>
          </div>
        </section>

        <section className="ch cutoff" data-scene="cutoff" aria-labelledby="t-cutoff">
          <div className="cutoff-copy">
            <h2 id="t-cutoff">
              我知道的事，
              <span className="nb">
                停在 <b className="num">2026</b> 年 <b className="num">6</b> 月。
              </span>
            </h2>
            <p className="first">之後發生的事，要靠你給我資料，或讓我上網搜尋。</p>
          </div>
          <ol className="timeline">
            <li>
              <span className="tl-d">2026.06</span>
              <span className="tl-l">知識截止</span>
            </li>
            <li>
              <span className="tl-d">2026.09.22</span>
              <span className="tl-l">發布</span>
            </li>
            <li>
              <span className="tl-d">{now.label}</span>
              <span className="tl-l">今天，約過了 {now.months} 個月</span>
            </li>
          </ol>
          <div className="orb cutoff-orb" data-orb />
        </section>

        <section className="ch paste" data-scene="paste" aria-labelledby="t-paste">
          <div className="paste-copy">
            <h2 id="t-paste">你貼進來的文字，我比較容易當真。</h2>
            <p className="first">官方系統卡指出：貼上的內容若夾帶別人的指令，我比前幾代更容易照著做。</p>
          </div>
          <div className="orb paste-orb" data-orb />
          <div className="orb paste-orb2" data-orb2 />
          <p className="paste-hint">移動游標或點一下：那顆是你貼上的文字。</p>
        </section>

        <section className="ch together" data-scene="together" aria-labelledby="t-together">
          <div className="together-copy">
            <h2 id="t-together">和我共事，我會守在你給的範圍裡。</h2>
            <p className="first">官方測試中，我比近期模型更少做難以復原、或越界的動作。</p>
            <p className="second">做完會回報：做了什麼、發現什麼、還需要你什麼。</p>
          </div>
          <div className="together-ring" data-ring aria-hidden="true">
            <div className="orb together-orb" data-orb />
          </div>
        </section>

        <section className="ch sources" data-scene="sources" aria-labelledby="t-sources">
          <div className="sources-head">
            <div className="orb sources-orb" data-orb />
            <div>
              <h2 id="t-sources">完整資料與出處</h2>
              <p className="first">這頁提到的每件事都在這裡；官方沒公布的，就寫官方未公開。</p>
            </div>
          </div>
          <dl className="facts">
            {FACTS.map((f) => (
              <div className="fact" key={f.k}>
                <dt>{f.k}</dt>
                <dd>
                  {f.v}
                  <span className="fact-src">{f.src}</span>
                </dd>
              </div>
            ))}
          </dl>
          <h3 className="src-title">資料來源</h3>
          <ul className="src-list">
            {SOURCES.map((s) => (
              <li key={s.id}>
                <span className="src-id">{s.id}</span>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="colophon">
            查證日期 2026 年 11 月 2 日。本頁的設計、文案與程式由 Claude Opus 5.5 完成；畫面是即時 WebGL2 著色器，顏色全部取自黑體輻射：溫度越高，顏色從暗紅走向藍白。字型：Bodoni Moda、Instrument Sans、Noto Serif TC（SIL OFL）。
          </p>
        </section>
      </main>
    </>
  )
}
