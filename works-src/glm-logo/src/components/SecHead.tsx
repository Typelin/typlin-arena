import Reveal from './Reveal'

type Props = {
  no: string
  zh: string
  en: string
  lead?: string
}

export default function SecHead({ no, zh, en, lead }: Props) {
  return (
    <Reveal className="sec-head">
      <span className="sec-no">{no}</span>
      <h2>
        {zh}
        <em>{en}</em>
      </h2>
      {lead && <p className="sec-lead">{lead}</p>}
    </Reveal>
  )
}
