import { bridge } from '../engine/bridge'
import { useUi } from '../engine/store'

const STAGES = ['靜', '思考', '合作', '創造', '餘音']

/** 右緣的刻度尺：章節導覽，同時是這件作品的進度。 */
export function Ruler() {
  const { stage } = useUi()
  return (
    <nav className="ruler" aria-label="章節">
      {STAGES.map((name, i) => (
        <button
          key={name}
          type="button"
          className="ruler-tick"
          aria-current={stage === i ? 'step' : undefined}
          onClick={() => bridge.inst?.goto(i)}
        >
          <span className="ruler-label">{name}</span>
          <span className="ruler-mark" aria-hidden="true" />
          <span className="sr-only">前往第 {i} 章：{name}</span>
        </button>
      ))}
    </nav>
  )
}
