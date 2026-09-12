import SakuraMark from './SakuraMark'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <SakuraMark className="footer-mark" />
          <div>
            <p className="footer-name">
              <b>咲夢</b> 信息科技工作室
            </p>
            <p className="footer-en">SAKIMU TECH STUDIO</p>
          </div>
        </div>
        <p className="footer-slogan">用代碼創造美好未來</p>
        <p className="footer-copy">© 2026 Sakimu Tech Studio. All rights reserved.</p>
      </div>
    </footer>
  )
}
