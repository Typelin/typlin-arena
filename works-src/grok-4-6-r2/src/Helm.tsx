import { MODEL, type Effort } from './facts'

const EFFORTS: Effort[] = ['low', 'medium', 'high', 'xhigh']

export function Helm({
  heading,
  onHeading,
  effort,
  onEffort,
  progress,
}: {
  heading: number
  onHeading: (h: number) => void
  effort: Effort
  onEffort: (e: Effort) => void
  progress: number
}) {
  const deg = heading * 72

  return (
    <div className="helm" role="region" aria-label="舵輪與推理強度">
      <div className="helm-compass" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#c4a574"
            strokeWidth="2.2"
            strokeDasharray={`${progress * 100} 100`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>

      <div className="helm-course">
        <p className="helm-kicker">航向</p>
        <div className="helm-course-row">
          <span className="helm-wheel-mark" aria-hidden="true" style={{ transform: `rotate(${deg}deg)` }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#c4a574" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="2.2" fill="#e8d3a4" />
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="#c4a574" strokeWidth="1.6" />
            </svg>
          </span>
          <label className="helm-slider">
            <span className="sr-only">航向</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(heading * 100)}
              onChange={(e) => onHeading(Number(e.target.value) / 100)}
            />
          </label>
          <strong>
            {Math.abs(heading) < 0.02
              ? '正前 0°'
              : `${heading > 0 ? '右' : '左'} ${Math.abs(Math.round(heading * 28))}°`}
          </strong>
        </div>
      </div>

      <div className="helm-efforts" role="group" aria-label="推理強度">
        {EFFORTS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === effort ? 'is-on' : undefined}
            onClick={() => onEffort(item)}
          >
            {item}
            {item === MODEL.reasoningDefault ? ' · 預設' : ''}
          </button>
        ))}
      </div>
    </div>
  )
}
