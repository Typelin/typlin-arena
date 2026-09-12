import { CRAFT } from '../data/content'
import { Reveal } from './Reveal'

export function Craft() {
  return (
    <Reveal as="section" className="section" id="craft">
      <p className="kicker">
        <span>{CRAFT.kicker}</span>
        <i />
        CRAFT
      </p>
      <h2>{CRAFT.title}</h2>
      <p className="lead">{CRAFT.lead}</p>
      <ul className="craft-grid">
        {CRAFT.items.map((item) => (
          <li key={item.id} className="craft-card">
            <span className="craft-mark" aria-hidden="true">
              {item.mark}
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}
