import { useState } from 'react'
import { useCanvas } from '../hooks'
import { paintStar } from '../lib/paint'
import { renderSharp } from '../lib/print'

/**
 * 04 推理強度：真的可以調。
 * 拉高，中央的暗斑縮小、扇葉在中心收成一點——那是「多想一點」的樣子。
 * 這是整頁唯一的數值互動，而且它真的在畫布上發生。
 */
export default function Effort() {
  const [effort, setEffort] = useState(42)

  const canvasRef = useCanvas(
    (canvas) => {
      renderSharp(
        canvas,
        (ctx, w, h) => paintStar(ctx, w, h, effort, { bg: '#0a0a0a', ink: '#f0ead9', accent: '#e2571f' }),
        2,
      )
    },
    [effort],
  )

  const cost = Math.round(10 + Math.pow(effort / 100, 1.75) * 990)

  return (
    <section className="chapter effort" id="ch-effort">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">04</span>
          <span className="ch-tag mono-sm">推理強度 / EFFORT</span>
        </div>

        <div className="effort-grid">
          <div>
            <h2 className="ch-title">
              <span className="ln">你要我多想，</span>
              <span className="ln">我就多想。</span>
            </h2>
            <p className="ch-first">推理強度可以從 1 調到 100，每一格都能停。</p>
            <p className="ch-body prose">官方說這是拿推論成本換準確度。要多想還是要快，你決定。</p>

            <div className="dial-wrap">
              <div className="dial-top">
                <span className="mono-sm">推理強度 · 拉我</span>
                <span className="dial-val mono-sm">1 — 100</span>
              </div>
              <input
                className="dial"
                type="range"
                min={1}
                max={100}
                step={1}
                value={effort}
                aria-label="推理強度，1 到 100"
                aria-valuetext={`${effort}`}
                onChange={(e) => setEffort(Number(e.target.value))}
              />
              <div className="dial-scale mono-sm">
                <span>01 快</span>
                <span>50</span>
                <span>100 準</span>
              </div>
              <p className="dial-hint mono-sm">
                <i aria-hidden="true" />
                {effort > 84 ? '這個格數，我會想很久' : effort < 16 ? '這個格數，我會回得很快' : '現在是中間偏準'}
              </p>
            </div>

            <dl className="kv">
              <div className="kv-row">
                <dt>類比</dt>
                <dd>把旋鈕轉深，中心那圈黑點就縮小；像對焦，不是變亮。</dd>
              </div>
              <div className="kv-row">
                <dt>官方設定</dt>
                <dd>評測用最大值 100，temperature 1.0、top_p 0.95。</dd>
              </div>
              <div className="kv-row">
                <dt>思考量</dt>
                <dd>官方未公開；只說這是拿推論成本換準確度。</dd>
              </div>
              <div className="kv-row">
                <dt>相對成本</dt>
                <dd>
                  {cost} ／ 1000 <span className="kv-fine">（示意，非官方計價）</span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="star-box">
              <canvas ref={canvasRef} role="img" aria-label={`解像力測試圖，推理強度 ${effort}`} />
            </div>
            <div className="star-caption">
              <p className="star-read">
                <b>{String(effort).padStart(3, '0')}</b>
                <span>REASONING EFFORT</span>
              </p>
              <p className="star-hint mono-sm">越往右，中心那圈黑點越小。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
