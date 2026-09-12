export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container contact-inner">
        <p className="section-label" data-reveal>
          联系 · CONTACT
        </p>
        <h2 className="contact-title" data-reveal>
          让下一个项目，在这里盛开。
        </h2>
        <p className="contact-sub" data-reveal>
          欢迎带着想法、半成品，或只是一个模糊的念头来找我们。
        </p>
        <div className="contact-actions" data-reveal>
          <a className="btn btn--primary" href="mailto:hello@sakimu.studio">
            hello@sakimu.studio
          </a>
          <span className="contact-alt">微信：sakimu-studio</span>
        </div>
      </div>
      <footer className="footer">
        <p>© 2026 咲梦信息科技工作室 · SAKIMU TECH STUDIO</p>
        <p className="footer-tagline">用代码创造美好未来</p>
      </footer>
    </section>
  )
}
