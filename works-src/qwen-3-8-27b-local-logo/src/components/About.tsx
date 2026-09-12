const STATS = [
  { value: '12+', label: '已上线项目' },
  { value: '3', label: '核心成员 · 设计与工程一体' },
  { value: '100%', label: '用心交付，从第一行代码开始' },
]

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div>
          <p className="section-label" data-reveal>
            关于 · ABOUT
          </p>
          <h2 className="section-title" data-reveal>
            让技术，像樱花一样生长。
          </h2>
          <p className="about-lead" data-reveal>
            「咲」，是花开放的声音；「林」，是生长的地方；「梦」，是我们想带你去的地方。
          </p>
          <div className="about-copy" data-reveal>
            <p>
              我们是咲梦信息科技工作室（SAKIMU TECH STUDIO），一支由设计师与工程师组成的小型团队，专注于网站、品牌与数字产品的打造。
            </p>
            <p>
              我们相信代码不必冰冷：它可以像樱花一样精确而轻盈，像月光一样安静而有方向。从第一张草图到上线后的每一次维护，「用心」是我们最基础的语法。
            </p>
          </div>
        </div>
        <aside className="about-stats" data-reveal aria-label="工作室数据">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  )
}
