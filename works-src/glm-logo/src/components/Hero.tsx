import Reveal from './Reveal'

function Emblem() {
  return (
    <svg className="emblem-svg" viewBox="0 0 600 600" role="img" aria-label="咲夢信息科技工作室標誌">
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#F2A9BC" />
          <stop offset="0.52" stopColor="#7D8CD0" />
          <stop offset="1" stopColor="#39477E" />
        </linearGradient>
        <linearGradient id="codeGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#E58BA6" />
          <stop offset="1" stopColor="#5C74B5" />
        </linearGradient>
        <radialGradient id="sakGrad" cx="0.5" cy="0.42" r="0.8">
          <stop offset="0" stopColor="#FBD9E2" />
          <stop offset="0.55" stopColor="#F2A9BC" />
          <stop offset="1" stopColor="#E187A2" />
        </radialGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <path id="petal" d="M0 8 C -24 0 -32 -32 -15 -54 L 0 -40 L 15 -54 C 32 -32 24 0 0 8 Z" />
      </defs>

      <circle cx="300" cy="300" r="250" fill="none" stroke="url(#arcGrad)" strokeWidth="26" opacity="0.16" filter="url(#soft)" />
      <circle
        className="ring-main"
        cx="300"
        cy="300"
        r="250"
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="78 22"
      />
      <circle
        className="ring-thin"
        cx="300"
        cy="300"
        r="276"
        fill="none"
        stroke="#F2A9BC"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
        pathLength={100}
        strokeDasharray="16 84"
        transform="rotate(126 300 300)"
      />

      <g transform="translate(150 318) rotate(-14) scale(1.5)">
        {[0, 72, 144, 216, 288].map((r) => (
          <use key={r} href="#petal" fill="url(#sakGrad)" stroke="#D97B96" strokeWidth="1.4" transform={`rotate(${r})`} />
        ))}
        <circle r="9" fill="#FBD9E2" />
        {[0, 72, 144, 216, 288].map((r) => (
          <g key={r} transform={`rotate(${r})`}>
            <line y2="-16" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.9" />
            <circle cy="-19" r="2.4" fill="#FFFFFF" opacity="0.95" />
          </g>
        ))}
      </g>
      <use href="#petal" fill="#F2A9BC" opacity="0.8" transform="translate(102 226) rotate(48) scale(0.3)" />
      <use href="#petal" fill="#E58BA6" opacity="0.7" transform="translate(214 428) rotate(-70) scale(0.26)" />

      <g transform="translate(436 214)" stroke="url(#codeGrad)" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 0 L-16 13 L0 26" />
        <path d="M14 32 L30 -6" />
        <path d="M44 0 L60 13 L44 26" />
      </g>
      <g transform="translate(452 330)">
        <rect width="46" height="6" rx="3" fill="#F2A9BC" />
        <rect y="12" width="30" height="6" rx="3" fill="#8F9BD8" />
        <rect y="24" width="38" height="6" rx="3" fill="#E58BA6" />
      </g>

      <g transform="translate(484 148)">
        <path
          className="sparkle"
          d="M0 -16 C 1.4 -5 5 -1.4 16 0 C 5 1.4 1.4 5 0 16 C -1.4 5 -5 1.4 -16 0 C -5 -1.4 -1.4 -5 0 -16 Z"
          fill="#F2F2F2"
        />
        <circle className="sparkle d2" cx="26" cy="20" r="3" fill="#F2A9BC" />
        <circle className="sparkle d3" cx="-22" cy="26" r="2" fill="#8F9BD8" />
      </g>

      <g fill="#F2F2F2" opacity="0.97">
        <circle cx="394" cy="436" r="15" />
        <circle cx="417" cy="424" r="21" />
        <circle cx="441" cy="436" r="14" />
        <rect x="386" y="432" width="64" height="17" rx="8.5" />
      </g>
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-inner">
        <Reveal>
          <div className="emblem">
            <Emblem />
            <div className="emblem-title">
              <h1>
                咲
                <br />
                夢
              </h1>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150} className="hero-copy">
          <p className="hero-en">SAKIMU TECH STUDIO</p>
          <p className="hero-tag">用代碼創造美好未來</p>
          <p className="hero-sub">一間把想像種成產品的信息科技工作室——網站、應用、品牌，從第一行代碼，到盛開的那一天。</p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#services">
              看看我們做什麼
            </a>
            <a className="btn btn-ghost" href="#contact">
              開啟合作
            </a>
          </div>
        </Reveal>
        <div className="scroll-cue" aria-hidden="true">
          <span>SCROLL</span>
          <i />
        </div>
      </div>
    </section>
  )
}
