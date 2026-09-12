import type { ReactNode } from 'react'
import Reveal from './Reveal'
import SecHead from './SecHead'

type Item = {
  icon: ReactNode
  t: string
  d: string
  tags: string[]
}

const ICON = (paths: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
)

const ITEMS: Item[] = [
  {
    icon: ICON(
      <>
        <rect x="3" y="4.5" width="18" height="12.5" rx="2" />
        <path d="M8.5 21h7M12 17v4" />
      </>,
    ),
    t: '網站與前端工程',
    d: '官方網站、活動頁與電商前端。以現代工程化開發，兼顧美感、效能與可維護性。',
    tags: ['React', 'Vue', 'TypeScript'],
  },
  {
    icon: ICON(
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
        <path d="M10.8 18.5h2.4" />
      </>,
    ),
    t: '應用程式開發',
    d: '從 MVP 驗證到正式上架，橫跨 iOS、Android 與桌面端的一站式開發旅程。',
    tags: ['App', '桌面端', 'MVP'],
  },
  {
    icon: ICON(
      <>
        <path d="M13.5 6.5l4 4L8 20H4v-4z" />
        <path d="M12 8l4 4" />
      </>,
    ),
    t: 'UI / UX 設計',
    d: '資訊架構、互動原型與設計系統，讓「好用」與「好看」在同一個介面裡成立。',
    tags: ['設計系統', '原型', '可用性'],
  },
  {
    icon: ICON(
      <>
        <circle cx="8.5" cy="8.5" r="4.5" />
        <rect x="12.5" y="12.5" width="8" height="8" rx="1.6" />
      </>,
    ),
    t: '品牌與視覺',
    d: 'LOGO、識別系統與宣傳素材，讓品牌從第一眼開始，就被人好好記住。',
    tags: ['品牌識別', '插畫', '動態'],
  },
]

export default function Services() {
  return (
    <section className="sec" id="services">
      <div className="wrap">
        <SecHead no="02" zh="服務" en="SERVICES" lead="從一頁官網到一整個產品線——我們把每一個需求，都當成一株植物來照顧。" />
        <div className="cards-4">
          {ITEMS.map((it, i) => (
            <Reveal key={it.t} delay={i * 100} className="card sv-card">
              <span className="sv-icon">{it.icon}</span>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
              <div className="tags">
                {it.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
