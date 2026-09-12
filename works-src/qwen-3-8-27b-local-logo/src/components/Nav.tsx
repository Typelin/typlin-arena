import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'about', label: '关于' },
  { id: 'services', label: '服务' },
  { id: 'process', label: '历程' },
  { id: 'contact', label: '联系' },
] as const

function SakuraMark() {
  return (
    <svg className="nav-mark" viewBox="0 0 32 32" aria-hidden="true">
      <g fill="#f2a9bd">
        <ellipse cx="16" cy="8.5" rx="4.4" ry="7.4" />
        <ellipse cx="16" cy="8.5" rx="4.4" ry="7.4" transform="rotate(72 16 16)" />
        <ellipse cx="16" cy="8.5" rx="4.4" ry="7.4" transform="rotate(144 16 16)" />
        <ellipse cx="16" cy="8.5" rx="4.4" ry="7.4" transform="rotate(216 16 16)" />
        <ellipse cx="16" cy="8.5" rx="4.4" ry="7.4" transform="rotate(288 16 16)" />
      </g>
      <circle cx="16" cy="16" r="3" fill="#ffd9e2" />
    </svg>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const link of LINKS) {
      const el = document.getElementById(link.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav-inner">
        <a className="nav-brand" href="#top" aria-label="咲林梦，回到顶部">
          <SakuraMark />
          <span>咲林梦</span>
        </a>
        <nav id="primary-nav" className={`nav-links${open ? ' is-open' : ''}`} aria-label="主导航">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'is-active' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
      </div>
    </header>
  )
}
