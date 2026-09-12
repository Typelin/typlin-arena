import { WORKS } from '../data/content'
import { Reveal } from './Reveal'

export function Works() {
  return (
    <Reveal as="section" className="section" id="works">
      <p className="kicker">
        <span>{WORKS.kicker}</span>
        <i />
        LEDGER
      </p>
      <h2>{WORKS.title}</h2>
      <p className="lead">{WORKS.lead}</p>
      <ol className="works">
        {WORKS.items.map((item) => (
          <li key={item.no}>
            <span className="works-no">{item.no}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.line}</p>
            </div>
            <ul className="tags">
              {item.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
