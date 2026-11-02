import { CHAPTERS } from '../content'

export default function Rail({ active }: { active: number }) {
  return (
    <nav className="rail" aria-label="章節">
      {CHAPTERS.map((c, i) => (
        <a key={c.id} href={`#${c.id}`} data-on={i === active ? 'true' : 'false'}>
          <span className="rail-no">{c.no}</span>
          <span className="rail-tag">{c.tag}</span>
        </a>
      ))}
    </nav>
  )
}
