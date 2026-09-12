import { useEffect, useState } from 'react'
import { BRAND, NAV_LINKS } from '../data/content'

/** Small SVG ring mark echoing the circular device in the logo. */
function RingMark() {
  return (
    <svg className="nav__mark" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="navRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0a0b6" />
          <stop offset="55%" stopColor="#7e8fcb" />
          <stop offset="100%" stopColor="#2b3a6b" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="16.5" fill="none" stroke="url(#navRing)" strokeWidth="1.4" />
      <path
        d="M20 10.5c3.4 3.2 5.2 6.1 5.2 9.1 0 3.6-2.4 6.4-5.2 6.4s-5.2-2.8-5.2-6.4c0-3 1.8-5.9 5.2-9.1Z"
        fill="#f0a0b6"
        opacity="0.9"
      />
      <path d="M20 26v5" stroke="#4c5da8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    )
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="nav__inner shell">
        <a className="nav__brand" href="#top" onClick={() => setOpen(false)}>
          <RingMark />
          <span className="nav__wordmark">
            <span className="nav__name">{BRAND.name}</span>
            <span className="nav__latin">{BRAND.latin}</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="主要導覽">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              className={`nav__link${current === link.id ? ' is-current' : ''}`}
              href={`#${link.id}`}
              aria-current={current === link.id ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__tail">
          <a className="btn btn--solid nav__cta" href="#contact">
            聊聊你的專案
          </a>
          <button
            className="nav__burger"
            type="button"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? '關閉選單' : '開啟選單'}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="nav__drawer" id="nav-drawer" hidden={!open}>
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.id}
            className="nav__drawer-link"
            href={`#${link.id}`}
            style={{ animationDelay: `${index * 55}ms` }}
            onClick={() => setOpen(false)}
          >
            <span className="nav__drawer-index">{`0${index + 1}`}</span>
            {link.label}
          </a>
        ))}
        <a className="btn btn--solid nav__drawer-cta" href="#contact" onClick={() => setOpen(false)}>
          聊聊你的專案
        </a>
      </div>
    </header>
  )
}
