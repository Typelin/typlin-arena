import { FOOTER } from '../data/content'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="footer">
      <Logo variant="lockup" alt="咲梦信息科技工作室" className="footer-logo" />
      <p className="footer-studio">{FOOTER.studio}</p>
      <p className="footer-en">{FOOTER.en}</p>
      <p className="footer-tag">{FOOTER.tag}</p>
      <p className="footer-colo">{FOOTER.colophon}</p>
    </footer>
  )
}
