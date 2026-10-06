import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'top', label: '首頁' },
  { id: 'about', label: '理念' },
  { id: 'craft', label: '匠藝' },
  { id: 'works', label: '作品' },
  { id: 'process', label: '工序' },
  { id: 'contact', label: '聯絡' },
]

export default function Header({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <button className="brand" onClick={() => go('top')} aria-label="回到頂部">
          <img src="./logo.png" alt="咲梦信息科技工作室" className="brand-mark" />
          <span className="brand-text">
            <b>咲梦</b>
            <i>SAKIMU TECH STUDIO</i>
          </span>
        </button>

        <nav className={`site-nav ${open ? 'is-open' : ''}`}>
          {LINKS.map((l) => (
            <button
              key={l.id}
              className={active === l.id ? 'is-active' : ''}
              onClick={() => go(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="選單"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
