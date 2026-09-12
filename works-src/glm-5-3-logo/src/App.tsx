import { useEffect, useRef, useState, useCallback } from 'react'
import SakuraCanvas from './components/SakuraCanvas'
import badgeCircle from './assets/badge-circle.png'

const NAV_LINKS: Array<[string, string]> = [
  ['about', '咲与梦'],
  ['craft', '手艺'],
  ['creed', '宣言'],
  ['contact', '联络'],
]

const CRAFTS = [
  {
    tag: '<dev/>',
    title: '全栈应用开发',
    text: '从界面到底层，从原型到上线。我们交付完整运转的产品，而非半成品的技术演示。',
  },
  {
    tag: '<ui/>',
    title: '品牌与界面设计',
    text: '让气质被看见。视觉语言、交互细节与动效节奏，都为品牌量身定制。',
  },
  {
    tag: '<ops/>',
    title: '数据与自动化',
    text: '把重复交给机器。流程编排、数据管道与效率工具，把时间还给创造。',
  },
  {
    tag: '<care/>',
    title: '长期技术呵护',
    text: '上线只是开始。持续迭代、性能守护与稳健运维，陪你走过每一个版本。',
  },
]

const CREEDS = [
  { k: '01', line: '代码是这个时代的樱花——', sub: '短暂编译，长久绽放。' },
  { k: '02', line: '我们在深夜里写下白昼的梦，', sub: '再把它变成千万人的日常。' },
  { k: '03', line: '每一次交付，', sub: '都是一次绽放。' },
]

function App() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const fadeRef = useRef<Array<HTMLElement | null>>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLImageElement>(null)

  const registerFade = useCallback((el: HTMLElement | null) => {
    if (el && !fadeRef.current.includes(el)) fadeRef.current.push(el)
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('in-view')
            io.unobserve(en.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' },
    )
    const t = window.setTimeout(() => {
      for (const el of fadeRef.current) if (el) io.observe(el)
    }, 60)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  /* Hero badge parallax (fine pointers only) */
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      tx = nx * -14
      ty = ny * -10
    }
    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      if (badgeRef.current) {
        badgeRef.current.style.translate = `${cx.toFixed(2)}px ${cy.toFixed(2)}px`
      }
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const go = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <SakuraCanvas />
      <a className="skip-link" href="#main">跳到主要内容</a>

      <nav className={`nav${navScrolled ? ' nav--scrolled' : ''}`} aria-label="主导航">
        <div className="nav-inner">
          <button className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={badgeCircle} alt="咲梦徽章" width="40" height="40" />
            <span>咲梦<em>SAKIMU</em></span>
          </button>
          <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => { e.preventDefault(); go(id) }}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="nav-cta">
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); go('contact') }}
              >
                开始合作
              </a>
            </li>
          </ul>
          <button
            className={`nav-burger${menuOpen ? ' open' : ''}`}
            aria-label={menuOpen ? '收起菜单' : '展开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <main id="main">
        {/* ───────── HERO ───────── */}
        <header className="hero" id="top">
          <div className="hero-aura" aria-hidden="true" />
          <div className="hero-stage" ref={heroRef}>
            <div className="badge-orbit" aria-hidden="true">
              <img
                ref={badgeRef}
                className="hero-badge"
                src={badgeCircle}
                alt=""
                width="592"
                height="592"
                draggable={false}
              />
            </div>
            <p className="hero-kicker" aria-hidden="true">const future = await sakimu.build({`{ dream: true }`})</p>
            <h1 className="hero-title">
              <span className="t-saki">咲</span><span className="t-yume">梦</span>
              <span className="hero-title-rest">信息科技工作室</span>
            </h1>
            <p className="hero-en">SAKIMU TECH STUDIO</p>
            <p className="hero-tagline">用代码创造美好未来</p>
            <div className="hero-actions">
              <a className="btn btn--primary" href="#contact" onClick={(e) => { e.preventDefault(); go('contact') }}>
                与我们一起绽放
              </a>
              <a className="btn btn--ghost" href="#about" onClick={(e) => { e.preventDefault(); go('about') }}>
                认识咲梦
              </a>
            </div>
          </div>
          <div className="hero-hint" aria-hidden="true">
            <span>向下滚动 · 樱花不止于夜</span>
            <i className="hero-hint-line" />
          </div>
        </header>

        {/* ───────── ABOUT: 咲 / 梦 ───────── */}
        <section className="section about" id="about" aria-labelledby="about-title">
          <div className="section-head">
            <p className="kicker">// 01 · 咲与梦</p>
            <h2 className="section-title" id="about-title">一个名字，两段心事</h2>
          </div>
          <div className="about-grid">
            <article className="about-card fade" ref={registerFade}>
              <span className="about-glyph about-glyph--saki" aria-hidden="true">咲</span>
              <h3>咲 · 绽放</h3>
              <p>
                「咲」在日语里读作 saku，是花开的那个瞬间。樱花七日，
                从含苞到满开再到散落，短暂得近乎苛刻——可正因为短暂，
                每一帧都全力以赴。我们写代码时怀着同样的心事：
                每一行都认真，因为它们终将在某人的屏幕上绽放。
              </p>
            </article>
            <article className="about-card fade" ref={registerFade}>
              <span className="about-glyph about-glyph--yume" aria-hidden="true">梦</span>
              <h3>梦 · 所向</h3>
              <p>
                「梦」不是睡去，而是醒来后仍然相信的东西。
                它可以是把一家小店搬到云上，也可以是让一个笨重的流程
                轻盈如风。我们负责把「不可能」三个字，
                一个字符一个字符地，改写成现实。
              </p>
            </article>
          </div>
          <p className="about-note fade" ref={registerFade}>
            咲梦信息科技工作室——一支在夜色里种花的技术小队。
            深夜的黑、樱花的粉、代码的蓝，就是我们的全部色板。
          </p>
        </section>

        {/* ───────── CRAFT ───────── */}
        <section className="section craft" id="craft" aria-labelledby="craft-title">
          <div className="section-head">
            <p className="kicker">// 02 · 手艺</p>
            <h2 className="section-title" id="craft-title">我们做什么</h2>
            <p className="section-sub">四门手艺，一种匠心。</p>
          </div>
          <div className="craft-grid">
            {CRAFTS.map((c, i) => (
              <article
                className="craft-card fade"
                ref={registerFade}
                key={c.tag}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <p className="craft-tag" aria-hidden="true">{c.tag}</p>
                <h3>{c.title}</h3>
                <p className="craft-text">{c.text}</p>
                <span className="craft-petal" aria-hidden="true">✿</span>
              </article>
            ))}
          </div>
        </section>

        {/* ───────── CREED ───────── */}
        <section className="section creed" id="creed" aria-labelledby="creed-title">
          <div className="section-head">
            <p className="kicker">// 03 · 夜樱宣言</p>
            <h2 className="section-title sr-only" id="creed-title">夜樱宣言</h2>
          </div>
          <ol className="creed-list">
            {CREEDS.map((c, i) => (
              <li
                key={c.k}
                className={`creed-item fade${i % 2 === 1 ? ' creed-item--right' : ''}`}
                ref={registerFade}
              >
                <span className="creed-k" aria-hidden="true">{c.k}</span>
                <p className="creed-line">{c.line}</p>
                <p className="creed-sub">{c.sub}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ───────── CONTACT ───────── */}
        <section className="section contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-card fade" ref={registerFade}>
            <img className="contact-badge" src={badgeCircle} alt="" aria-hidden="true" width="92" height="92" />
            <h2 id="contact-title">让下一朵花，从你的想法开始</h2>
            <p>
              无论是一个尚在纸上的念头，还是一套等待重生的老系统——
              把它带来，我们一起把它种成花期。
            </p>
            <div className="contact-actions">
              <a className="btn btn--primary" href="mailto:hello@sakimu.studio">hello@sakimu.studio</a>
              <a className="btn btn--ghost" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                回到夜空
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-mark" aria-hidden="true">咲梦 — SAKIMU TECH STUDIO</p>
        <p className="footer-line">用代码创造美好未来 · 春夜里，樱自绽放</p>
        <p className="footer-copy">© 2026 咲梦信息科技工作室</p>
      </footer>
    </>
  )
}

export default App
