import { useEffect, useState } from 'react'
import SakuraMark from './SakuraMark'

const LINKS = [
  ['理念', '#philosophy'],
  ['服務', '#services'],
  ['作品', '#works'],
  ['流程', '#process'],
  ['聯絡', '#contact'],
] as const

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top">
          <SakuraMark className="brand-mark" />
          <span className="brand-text">
            <b>咲夢</b>
            <span className="en">SAKIMU TECH STUDIO</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="主導覽">
          {LINKS.map(([t, h]) => (
            <a key={h} href={h}>
              {t}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#contact">
          開啟合作
        </a>
      </div>
    </header>
  )
}
