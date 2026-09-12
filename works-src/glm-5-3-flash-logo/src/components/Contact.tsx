import Reveal from './Reveal'
import SecHead from './SecHead'

export default function Contact() {
  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <SecHead no="05" zh="聯絡" en="CONTACT" />
        <div className="contact-grid">
          <Reveal className="contact-copy">
            <p className="contact-big">
              有個夢，
              <br />
              還沒開始盛開？
            </p>
            <p>
              把你的想法寄給我們。無論是一頁官網、一個 App，
              還是一個還在腦海裡的畫面——我們先聊聊，再報價。
            </p>
            <p className="contact-note">一般於 1–2 個工作天內回覆。</p>
          </Reveal>
          <Reveal delay={120} className="contact-card">
            <div className="c-row">
              <span className="c-label">Email</span>
              <a href="mailto:hello@sakimu.studio">hello@sakimu.studio</a>
            </div>
            <div className="c-row">
              <span className="c-label">SLOGAN</span>
              <span>用代碼創造美好未來</span>
            </div>
            <a className="btn btn-primary c-btn" href="mailto:hello@sakimu.studio?subject=%E5%90%B2%E5%A4%A2%20%E5%90%88%E4%BD%9C%E8%A9%A2%E5%95%8F">
              寫信給咲夢
            </a>
            <p className="c-tiny">* 本頁為展示站，信箱為範例位址。</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
