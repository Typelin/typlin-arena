import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const LINKS = [
  ['#name', '名字'],
  ['#bloom', '開花'],
  ['#services', '服務'],
  ['#process', '流程'],
]

/** Top bar: the emblem cropped from the original logo artwork, section links, contact. */
export function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(scrollY > 40)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <nav className="nav" data-solid={solid || undefined} aria-label="主導航">
      <a className="nav-brand" href="#top" aria-label="咲夢信息科技工作室，回到頂部">
        <span className="nav-emblem" style={{ backgroundImage: `url(${logo})` }} aria-hidden="true" />
        <span className="nav-name">
          咲夢<small>SAKIMU</small>
        </span>
      </a>
      <ul className="nav-links">
        {LINKS.map(([h, t]) => (
          <li key={h}>
            <a href={h}>{t}</a>
          </li>
        ))}
      </ul>
      <a className="btn btn-ink btn-sm" href="#wish">
        許一個夢
      </a>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-moon">
        <img className="footer-logo" src={logo} alt="咲夢信息科技工作室標誌" width={800} height={800} loading="lazy" />
      </div>
      <p className="footer-motto">用代碼創造美好未來</p>
      <p className="footer-meta">
        © {new Date().getFullYear()} 咲夢信息科技工作室 · Sakimu Tech Studio
        <a href="#top">回到頂部 ↑</a>
      </p>
    </footer>
  )
}
