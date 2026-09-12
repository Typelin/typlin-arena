const SERVICES = [
  {
    num: '01',
    title: '网站与产品',
    en: 'Web & Product',
    desc: '官网、落地页、电商前台与产品界面。从信息架构到像素细节，一次做对。',
  },
  {
    num: '02',
    title: '品牌视觉',
    en: 'Brand Identity',
    desc: 'LOGO、色彩系统、插画与版式规范——让品牌拥有一张可被记住的脸。',
  },
  {
    num: '03',
    title: '交互与动效',
    en: 'Motion & Interaction',
    desc: '滚动叙事、微交互与 Canvas / WebGL 实验，把「好看」推进到「好体验」。',
  },
  {
    num: '04',
    title: '后端与云',
    en: 'Backend & Cloud',
    desc: 'API、数据库、部署与监控。安静可靠的根，托住上面盛开的花。',
  },
]

export default function Services() {
  return (
    <section className="section section--alt" id="services">
      <div className="container">
        <p className="section-label" data-reveal>
          服务 · SERVICES
        </p>
        <h2 className="section-title" data-reveal>
          我们能为你做什么
        </h2>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <article
              className="card"
              key={s.num}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="card-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p className="card-en">{s.en}</p>
              <p className="card-desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
