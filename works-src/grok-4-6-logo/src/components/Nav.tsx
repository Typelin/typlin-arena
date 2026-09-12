import { useEffect, useState } from 'react'
import { NAV } from '../data/content'
import { Logo } from './Logo'

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`nav${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <a className="nav-brand" href="#top" onClick={() => setOpen(false)}>
        <Logo variant="mark" alt="" className="nav-mark" />
        <span>
          <strong>咲梦</strong>
          <small>SAKIMU</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="站内">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault()
              go(item.href)
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <a className="nav-cta" href="#letter">
        写信
      </a>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-label={open ? '关闭菜单' : '打开菜单'}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
    </header>
  )
}
