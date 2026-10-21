import { bridge } from '../engine/bridge'
import { useUi } from '../engine/store'

const SNAPS = [1 / 2, 2 / 3, 3 / 4, 1, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 2]

/** 第三章的調音尺：拖動你的弦的音高。吸附在簡單整數比上，像弦軸卡進去。 */
export function Tuner() {
  const { stage, logRatio, ratioLabel, coupling } = useUi()
  const on = stage === 2
  return (
    <div className="tuner" data-on={on} aria-hidden={!on}>
      <output className="tuner-ratio" aria-live="polite">
        {ratioLabel || '— : —'}
      </output>
      <div className="tuner-body">
        <label htmlFor="tune" className="tuner-label">
          調音 · 你的弦 : 我的弦
        </label>
        <div className="tuner-track">
          {SNAPS.map((v) => (
            <i key={v} className="tuner-tick" style={{ left: `${((Math.log2(v) + 1) / 2) * 100}%` }} aria-hidden="true" />
          ))}
          <input
            id="tune"
            type="range"
            min={-1}
            max={1}
            step={0.002}
            value={logRatio}
            tabIndex={on ? 0 : -1}
            aria-valuetext={ratioLabel ? `比值 ${ratioLabel}` : '沒有簡單的比值'}
            onChange={(e) => {
              const v = bridge.inst?.tune(Number(e.target.value))
              void v
            }}
            onPointerDown={() => bridge.inst?.tuning(true)}
            onPointerUp={() => bridge.inst?.tuning(false)}
            onPointerCancel={() => bridge.inst?.tuning(false)}
            onKeyDown={() => bridge.inst?.tuning(true)}
            onKeyUp={() => bridge.inst?.tuning(false)}
            onBlur={() => bridge.inst?.tuning(false)}
          />
        </div>
        <div className="tuner-meter" role="meter" aria-label="共振潛力" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(coupling * 100)}>
          <i style={{ transform: `scaleX(${coupling})` }} />
        </div>
      </div>
    </div>
  )
}
