const STEPS = [
  {
    num: '01',
    title: '倾听',
    en: 'Listen',
    desc: '先听懂品牌的心事，再谈方案。我们喜欢从问题本身开始，而不是从模板开始。',
  },
  {
    num: '02',
    title: '构思',
    en: 'Design',
    desc: '把想法画成可以走进去的形状：结构、视觉与动效的雏形在这里成形。',
  },
  {
    num: '03',
    title: '雕琢',
    en: 'Build',
    desc: '代码如刻木，慢一点，准一点。每一处交互都经过反复打磨才肯放行。',
  },
  {
    num: '04',
    title: '绽放',
    en: 'Launch',
    desc: '上线不是结束，而是花期的开始。我们持续维护、观察与微调。',
  },
]

export default function Process() {
  return (
    <section className="section" id="process">
      <div className="container">
        <p className="section-label" data-reveal>
          历程 · PROCESS
        </p>
        <h2 className="section-title" data-reveal>
          从种子到花期
        </h2>
        <ol className="process-list">
          {STEPS.map((s, i) => (
            <li key={s.num} className="step" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="step-rail">
                <span className="step-num">{s.num}</span>
                {i < STEPS.length - 1 && <span className="step-line" aria-hidden="true" />}
              </div>
              <div className="step-body">
                <h3>
                  {s.title}
                  <span className="step-en">{s.en}</span>
                </h3>
                <p>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
