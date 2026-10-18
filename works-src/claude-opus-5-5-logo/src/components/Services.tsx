import { useReveal } from '../hooks'

const ICONS = {
  code: (
    <>
      <path d="M17 14 L8 24 L17 34" />
      <path d="M31 14 L40 24 L31 34" />
      <path d="M27 11 L21 37" className="ic-pink" />
    </>
  ),
  cloud: (
    <>
      <path d="M12 34 h24 a7 7 0 0 0 0 -14 a10 10 0 0 0 -19 -2 a8 8 0 0 0 -5 16 z" />
      <path d="M18 27 h9 M18 31 h14" className="ic-pink" />
    </>
  ),
  moon: (
    <>
      <path d="M30 9 a15 15 0 1 0 9 26 a12 12 0 1 1 -9 -26 z" />
      <path d="M14 22 h10 M14 27 h7" className="ic-pink" />
    </>
  ),
  spark: (
    <>
      <path d="M24 6 C25.5 18 30 22.5 42 24 C30 25.5 25.5 30 24 42 C22.5 30 18 25.5 6 24 C18 22.5 22.5 18 24 6 Z" />
      <circle cx="38" cy="10" r="2.4" className="ic-pink ic-fill" />
    </>
  ),
}

const SERVICES = [
  { icon: 'code', t: '官網與品牌站', d: '把品牌氣質翻譯成可瀏覽、可互動的網站。響應式、快、經得起搜尋引擎。', tags: ['React / Vue', 'SEO', '動效'] },
  { icon: 'cloud', t: '小程式與 App', d: '微信小程式、H5 與跨端應用，從預約、點單到會員，把服務放進口袋。', tags: ['小程式', 'uni-app', 'Flutter'] },
  { icon: 'moon', t: '業務系統與資料', d: '後臺管理、排班、庫存、報表看板。讓每天重複的工作少一點，夜裡能早點收工。', tags: ['後臺', '資料看板', 'API'] },
  { icon: 'spark', t: '視覺與互動動效', d: '標誌延展、介面設計與動效方案。只在真正幫上忙的地方，讓介面「活」過來。', tags: ['UI', 'Canvas / WebGL', '品牌'] },
] as const

export function Services() {
  const ref = useReveal<HTMLElement>(0.15)
  return (
    <section className="services reveal" id="services" ref={ref} aria-labelledby="svc-h">
      <p className="eyebrow">03 · 我們做什麼</p>
      <h2 id="svc-h">四種花，同一種用心</h2>
      <ul className="svc-grid">
        {SERVICES.map((s, i) => (
          <li key={s.t} className="svc" style={{ '--i': i } as React.CSSProperties}>
            <svg className="svc-icon" viewBox="0 0 48 48" aria-hidden="true">
              {ICONS[s.icon]}
            </svg>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <ul className="svc-tags" aria-label="相關技術">
              {s.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="svc-petal" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  )
}
