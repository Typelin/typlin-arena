import Header from './components/Header'
import PetalCanvas, { burstAt } from './components/PetalCanvas'
import WishCompiler from './components/WishCompiler'
import Works from './components/Works'
import { useActiveSection, useReveal } from './lib/hooks'

const SECTION_IDS = ['top', 'about', 'craft', 'works', 'process', 'contact']

const PRINCIPLES = [
  {
    kanji: '咲',
    title: '綻放 · Bloom',
    body: '好的介面像花開：不喧嘩，卻在對的時機展開。我們讓資訊在使用者需要它的那一刻出現。',
  },
  {
    kanji: '夢',
    title: '造夢 · Dream',
    body: '每一個案子從一句模糊的願望開始。我們負責把它編譯成可執行、可維護、可長大的結構。',
  },
  {
    kanji: '码',
    title: '成碼 · Craft',
    body: '詩意止於螢幕邊緣，工程從第一行開始。效能、無障礙、可訪問性，都是美的一部分。',
  },
]

const CRAFTS = [
  { n: '01', t: '品牌落地頁', d: '從 LOGO 氣質出發的敘事、視覺語言與前端實作，一站完成。' },
  { n: '02', t: '介面工程', d: 'React / TypeScript 組件化開發，設計系統與動效落地。' },
  { n: '03', t: '動態敘事', d: '捲動敘事、微互動、Canvas 與 SVG 動畫，服務內容而非搶走內容。' },
  { n: '04', t: '可訪問性', d: '鍵盤操作、螢幕閱讀器、降低動態偏好 — 美麗不該有門檻。' },
]

const STEPS = [
  { k: '聽', t: '聆聽', d: '讀懂你的 LOGO、受眾與那句沒說完的期待。' },
  { k: '繪', t: '描繪', d: '資訊架構、視覺方向、關鍵畫面，先對齊再動工。' },
  { k: '織', t: '編織', d: '元件化開發，每一層样式與狀態都可追溯。' },
  { k: '放', t: '綻放', d: '實測、調校、交付 — 桌機與手機一樣體面。' },
]

function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ ['--delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

export default function App() {
  const active = useActiveSection(SECTION_IDS)

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <PetalCanvas />
      <Header active={active} />

      <main>
        {/* ── HERO ───────────────────────────── */}
        <section id="top" className="hero">
          <div className="hero-inner">
            <Reveal className="hero-logo-wrap">
              <img
                src="./logo.png"
                alt="咲梦信息科技工作室 SAKIMU TECH STUDIO — 用代码创造美好未来"
                className="hero-logo"
                width={800}
                height={800}
              />
            </Reveal>

            <Reveal delay={140} className="hero-copy">
              <p className="kicker">SAKIMU TECH STUDIO · 咲 · 夢 · 码</p>
              <h1>
                用<span className="grad-text">代码</span>
                創造美好未來
              </h1>
              <p className="hero-sub">
                我們是一間以「咲（花開）」為名的信息科技工作室 —
                把品牌的氣質，編譯成可觸摸的網頁、介面與體驗。
                粉與藍之間，詩意與工程並行。
              </p>
              <div className="hero-actions">
                <button className="btn primary" onClick={() => go('works')}>
                  看看作品
                </button>
                <button className="btn ghost" onClick={() => go('contact')}>
                  和我們聊聊
                </button>
              </div>
            </Reveal>
          </div>

          <button
            className="scroll-cue"
            onClick={() => go('about')}
            aria-label="向下捲動"
          >
            <span />
            向下
          </button>

          <div className="hero-band" aria-hidden="true">
            <div className="band-track">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  咲梦信息科技工作室 · SAKIMU TECH STUDIO · 用代码创造美好未来 · Bloom
                  with code · 咲 · 夢 · 码 ·&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────── */}
        <section id="about" className="section about">
          <div className="container">
            <Reveal as="section" className="sec-head">
              <span className="kicker">01 · 理念</span>
              <h2>三個字，一句誓言</h2>
              <p>LOGO 裡藏著我們的工作方式：先讓它開花，再讓它做夢，最後一行行寫成代碼。</p>
            </Reveal>

            <div className="principles">
              {PRINCIPLES.map((p, i) => (
                <Reveal as="article" className="principle card" delay={i * 110} key={p.kanji}>
                  <span className="principle-kanji" aria-hidden="true">
                    {p.kanji}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className="quote-band" delay={80}>
              <blockquote>
                「設計不是把東西變漂亮，<br className="br-m" />
                而是把複雜留給自己，把從容還給使用的人。」
              </blockquote>
              <cite>— 咲梦工作室 · 工作守則第一条</cite>
            </Reveal>
          </div>
        </section>

        {/* ── CRAFT ──────────────────────────── */}
        <section id="craft" className="section craft">
          <div className="container">
            <Reveal className="sec-head">
              <span className="kicker">02 · 匠藝</span>
              <h2>我們如何做事</h2>
              <p>四件擅長的事，一種不變的標準。</p>
            </Reveal>

            <ul className="craft-list">
              {CRAFTS.map((c, i) => (
                <Reveal as="li" className="craft-row" delay={i * 90} key={c.n}>
                  <span className="craft-n">{c.n}</span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                  <span className="craft-arrow" aria-hidden="true">
                    →
                  </span>
                </Reveal>
              ))}
            </ul>

            <Reveal className="wish-wrap" delay={60}>
              <WishCompiler />
            </Reveal>
          </div>
        </section>

        {/* ── WORKS ──────────────────────────── */}
        <section id="works" className="section works">
          <div className="container">
            <Reveal className="sec-head">
              <span className="kicker">03 · 作品</span>
              <h2>開過的花</h2>
              <p>品牌、產品與視覺 — 可依分類篩選。</p>
            </Reveal>
            <Reveal delay={80}>
              <Works />
            </Reveal>
          </div>
        </section>

        {/* ── PROCESS ────────────────────────── */}
        <section id="process" className="section process">
          <div className="container">
            <Reveal className="sec-head">
              <span className="kicker">04 · 工序</span>
              <h2>從一句話到上線</h2>
              <p>四個階段，每一步都有可檢視的產出。</p>
            </Reveal>

            <ol className="steps">
              {STEPS.map((s, i) => (
                <Reveal as="li" className="step" delay={i * 120} key={s.k}>
                  <span className="step-kanji">{s.k}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CONTACT ────────────────────────── */}
        <section id="contact" className="section contact">
          <div className="container">
            <Reveal className="contact-card card">
              <span className="kicker">05 · 聯絡</span>
              <h2>下一朵花，由你命名</h2>
              <p>
                帶著你的 LOGO、你的願望，或只是一句「我想有個網站」來敲門。
                我們會把它編譯成真的。
              </p>
              <div className="contact-actions">
                <a className="btn primary" href="mailto:hello@sakimu.studio">
                  hello@sakimu.studio
                </a>
                <button
                  className="btn ghost"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    burstAt(r.left + r.width / 2, r.top)
                  }}
                >
                  撒一把花瓣
                </button>
              </div>
              <img src="./logo.png" alt="" className="contact-logo" aria-hidden="true" />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} 咲梦信息科技工作室 · SAKIMU TECH STUDIO</span>
          <span>用代码创造美好未来</span>
          <button className="to-top" onClick={() => go('top')}>
            回到頂部 ↑
          </button>
        </div>
      </footer>
    </>
  )
}
