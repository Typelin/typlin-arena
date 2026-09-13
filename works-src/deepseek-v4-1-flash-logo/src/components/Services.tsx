import { SERVICES, SERVICES_NOTE } from '../data/content'
import { delay } from '../lib/motion'

export function Services() {
  return (
    <section className="section services" id="services">
      <div className="shell">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow reveal">SERVICES</p>
            <h2 className="section-title reveal" style={delay(70)}>
              我們只做四件事
            </h2>
          </div>
          <p className="section-lead reveal" style={delay(140)}>
            做得慢一點，做得久一點。每一項都由同一個人從頭跟到尾——沒有業務窗口，也沒有轉包。
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map((service, index) => (
            <article
              key={service.title}
              className="service reveal"
              style={delay(index * 90)}
            >
              <span className="service__index" aria-hidden="true">
                {service.index}
              </span>
              <svg className="service__petal" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2c3.2 3.4 4.9 6.3 4.9 9 0 3.2-2.2 5.6-4.9 5.6S7.1 14.2 7.1 11c0-2.7 1.7-5.6 4.9-9Z"
                  fill="currentColor"
                />
              </svg>

              <h3 className="service__title">{service.title}</h3>
              <p className="service__latin">{service.latin}</p>
              <p className="service__body">{service.body}</p>

              <ul className="service__tags">
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="services__note reveal">
          <span className="petal-dot" aria-hidden="true" />
          {SERVICES_NOTE}
        </p>
      </div>
    </section>
  )
}
