import { useEffect, useRef, useState, useCallback } from 'react'
import SakuraPetals from './components/SakuraPetals'

/* ============================================================
   SAKIMU TECH STUDIO — Landing Page
   Design language: Spring morning — soft, warm, elegant
   ============================================================ */

function App() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const fadeRefs = useRef<(HTMLElement | null)[]>([])

  const registerFade = useCallback((el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) {
      fadeRefs.current.push(el)
    }
  }, [])

  useEffect(() => {
    // Nav scroll effect
    const handleScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Intersection observer for fade-in sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    // Small delay to ensure refs are collected
    const timer = setTimeout(() => {
      fadeRefs.current.forEach((el) => {
        if (el) observer.observe(el)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <SakuraPetals />

      {/* ───── NAV ───── */}
      <nav className={`nav${navScrolled ? ' scrolled' : ''}`}>
        <div className="nav-brand">
          <img src="/logo.png" alt="Sakimu" />
          <span>咲梦科技</span>
        </div>
        <ul className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
          {[
            ['about', '关于我们'],
            ['services', '服务'],
            ['philosophy', '理念'],
            ['contact', '联络'],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(id)
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className={`nav-mobile-toggle${mobileMenuOpen ? ' open' : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ───── HERO ───── */}
      <section className="hero">
        <img className="hero-logo" src="/logo.png" alt="咲梦信息科技工作室" />
        <h1 className="hero-title">咲梦信息科技工作室</h1>
        <p className="hero-title-en">SAKIMU TECH STUDIO</p>
        <p className="hero-tagline">用代码创造美好未来</p>
        <div className="hero-scroll-hint">
          <span>SCROLL</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ───── ABOUT ───── */}
      <div className="about-wrapper" id="about">
        <section className="section fade-section" ref={registerFade}>
          <div className="about-content">
            <div>
              <p className="section-label">About Us</p>
              <h2 className="section-title">以匠心，筑梦想</h2>
              <hr className="section-divider" />
              <p className="section-text">
                咲梦信息科技工作室，名取自日语「咲く」——绽放。我们相信，
                每一行精心编写的代码都如花苞般蕴含着绽放的能量。
              </p>
              <br />
              <p className="section-text">
                我们是一支小而精的技术团队，专注于将创意与技术完美融合。
                不追求规模，只追求每一个项目都能像樱花一样，
                在恰当的时刻绽放出最美的姿态。
              </p>
            </div>
            <div className="about-visual">
              <div className="about-circle">
                <div className="about-icon-grid">
                  <div className="about-icon-cell">
                    <svg viewBox="0 0 36 36" fill="none" stroke="var(--indigo-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 8h20v20H8z" />
                      <path d="M13 16l4 4 6-8" />
                    </svg>
                    <span>品质</span>
                  </div>
                  <div className="about-icon-cell">
                    <svg viewBox="0 0 36 36" fill="none" stroke="var(--sakura-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="18" r="10" />
                      <path d="M18 12v6l4 4" />
                    </svg>
                    <span>效率</span>
                  </div>
                  <div className="about-icon-cell">
                    <svg viewBox="0 0 36 36" fill="none" stroke="var(--sakura-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6l3.5 7 7.5 1-5.5 5.5L24.5 27 18 23.5 11.5 27l1-7.5L7 14l7.5-1z" />
                    </svg>
                    <span>创新</span>
                  </div>
                  <div className="about-icon-cell">
                    <svg viewBox="0 0 36 36" fill="none" stroke="var(--indigo-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 28s-8-5.5-8-12a8 8 0 0116 0c0 6.5-8 12-8 12z" />
                    </svg>
                    <span>用心</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ───── SERVICES ───── */}
      <div className="services-wrapper" id="services">
        <section className="section fade-section" ref={registerFade}>
          <p className="section-label">Services</p>
          <h2 className="section-title">我们的服务</h2>
          <hr className="section-divider" />
          <p className="section-text">
            从构思到落地，从设计到运维——我们提供完整的数字化解决方案。
          </p>

          <div className="services-grid">
            {[
              {
                title: 'Web 应用开发',
                desc: '基于现代前端框架与云原生架构，打造高性能、可扩展的 Web 应用。从企业官网到复杂 SaaS 平台，我们都能胜任。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                ),
              },
              {
                title: '移动端开发',
                desc: '跨平台移动应用解决方案，一套代码覆盖 iOS 与 Android。注重用户体验与交互流畅度，让每一次触控都恰到好处。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                ),
              },
              {
                title: 'UI/UX 设计',
                desc: '以用户为中心的设计哲学，将美学与功能性完美结合。我们相信好的设计不是装饰，而是让复杂的事物变得简单自然。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ),
              },
              {
                title: '小程序开发',
                desc: '微信 / 支付宝 / 抖音等平台小程序定制开发。轻量级触达，让您的服务随时随地在用户指尖绽放。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
              },
              {
                title: '技术咨询',
                desc: '技术选型困惑？架构瓶颈？我们提供专业的技术顾问服务，帮助团队做出最适合当下与未来的技术决策。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                ),
              },
              {
                title: '系统运维与优化',
                desc: '持续的性能监控、安全加固与系统优化。像园丁呵护花园一样，我们精心维护每一个线上系统的健康成长。',
                icon: (
                  <svg viewBox="0 0 24 24">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91A6 6 0 016.7 2.53l3.77 3.77z" />
                  </svg>
                ),
              },
            ].map((service, i) => (
              <div
                className="service-card fade-section"
                ref={registerFade}
                key={i}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ───── PHILOSOPHY ───── */}
      <div className="philosophy-wrapper" id="philosophy">
        <section className="section fade-section" ref={registerFade}>
          <div className="philosophy-content">
            <p className="section-label" style={{ textAlign: 'center' }}>Philosophy</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>我们的信念</h2>
            <hr className="section-divider" style={{ margin: '0 auto 48px' }} />
            <blockquote className="philosophy-quote">
              代码不仅仅是逻辑的排列，<br />
              更是对美好未来的一封情书。<br />
              每一次编译，都是一朵花的绽放。
            </blockquote>
            <div className="philosophy-values">
              {[
                { label: '精益求精', sub: 'Craftsmanship' },
                { label: '以人为本', sub: 'Human-Centered' },
                { label: '持续进化', sub: 'Evolution' },
                { label: '温柔坚定', sub: 'Gentle & Firm' },
              ].map((v, i) => (
                <div className="philosophy-value" key={i}>
                  <div className="philosophy-value-dot" />
                  <span className="philosophy-value-label">{v.label}</span>
                  <span className="philosophy-value-sub">{v.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ───── CONTACT ───── */}
      <div className="contact-wrapper" id="contact">
        <section className="section fade-section" ref={registerFade}>
          <div className="contact-inner">
            <p className="section-label" style={{ textAlign: 'center' }}>Contact</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>一起创造些什么吧</h2>
            <hr className="section-divider" style={{ margin: '0 auto 20px' }} />
            <p className="section-text" style={{ textAlign: 'center', margin: '0 auto' }}>
              无论是一个想法的雏形，还是一个明确的需求——<br />
              我们都期待聆听你的故事，然后用代码帮你讲述。
            </p>

            <div className="contact-cta-box">
              <p className="contact-email">hello@sakimu.tech</p>
              <p className="contact-hint">期待你的来信</p>
              <a className="contact-btn" href="mailto:hello@sakimu.tech">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
                发送邮件
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ───── FOOTER ───── */}
      <footer className="footer">
        <p className="footer-brand">咲梦信息科技工作室</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} SAKIMU TECH STUDIO. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App
