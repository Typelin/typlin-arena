import { BRAND, NAV_LINKS } from '../data/content'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <div className="footer__logo-crop">
            <img
              className="footer__logo"
              src={LOGO_SRC}
              alt="咲夢信息科技工作室 LOGO"
              width={800}
              height={800}
              loading="eager"
              decoding="async"
            />
          </div>
          <div>
            <p className="footer__name">{BRAND.full}</p>
            <p className="footer__latin">{BRAND.latin}</p>
            <p className="footer__tagline">{BRAND.tagline}</p>
          </div>
        </div>

        <nav className="footer__nav" aria-label="頁尾導覽">
          <p className="footer__col-title">索引</p>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__nav">
          <p className="footer__col-title">往來</p>
          <ul>
            <li>
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            </li>
            <li>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
            </li>
            <li>{BRAND.address}</li>
          </ul>
        </div>
      </div>

      <div className="shell footer__base">
        <p>© {new Date().getFullYear()} {BRAND.full}</p>
        <p className="footer__made">
          <span className="petal-dot" aria-hidden="true" />
          Designed &amp; built in Taipei
        </p>
      </div>
    </footer>
  )
}
