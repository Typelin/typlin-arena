import { useState } from 'react'
import { useCanvas } from '../hooks'
import { renderSharp } from '../lib/print'
import { LIMITS } from '../content'

const ORANGE = '#e2571f'
const PAPER = '#f2ecdd'

/** 兩塊版：深藍滿版 + 橘色方塊。偏移量由滑桿控制，錯開的地方露出橘邊與紙白。 */
function paintMarks(ctx: CanvasRenderingContext2D, W: number, H: number, off: number) {
  ctx.save()
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  const cols = 13
  const cw = W / cols
  const cy = H / 2
  const s = Math.min(cw, H) * 0.3
  const shift = off * cw * 0.28

  // 藍版
  ctx.fillStyle = '#17305a'
  for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) * cw
    ctx.fillRect(x - s, cy - s, s * 2, s * 2)
  }

  // 橘版：印刷時疊上去，錯開的地方就吃不到藍
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = ORANGE
  for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) * cw
    ctx.fillRect(x - s + shift, cy - s - shift * 0.8, s * 2, s * 2)
  }
  ctx.globalCompositeOperation = 'source-over'

  ctx.restore()
}

/**
 * 03 短處：這一頁最吵。
 * 滿版橘、一組對不準的套印方塊，還有三個輸掉的數字。
 * 中間的小互動是真的：你可以把兩塊版對齊，但分數不會因此變好
 * ——這是限制，不是失誤。
 */
export default function Limits() {
  const [reg, setReg] = useState(1.8)

  const canvasRef = useCanvas(
    (canvas) => {
      renderSharp(canvas, (ctx, w, h) => paintMarks(ctx, w, h, reg), 2)
    },
    [Math.round(reg * 10)],
  )

  return (
    <section className="chapter limits" id="ch-limits">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">04</span>
          <span className="ch-tag mono-sm">短處 / WHAT I MISS</span>
        </div>

        <div className="limits-grid">
          <div>
            <h2 className="ch-title">
              <span className="ln">有三件事，</span>
              <span className="ln">我確實輸給別人。</span>
            </h2>
            <p className="ch-first">冷知識問答、長文細讀、多語數學，官方分數都比 V4-Pro 低。</p>
            <p className="ch-body prose">多語數學連上一代的 V4-Flash 也贏我。</p>

            <div className="reg-box">
              <div className="reg-canvas-wrap">
                <canvas ref={canvasRef} aria-hidden="true" />
              </div>
              <div className="reg-ctrl">
                <div className="reg-top">
                  <span className="mono-sm">套印偏移 · 拖看看</span>
                  <span className="reg-val mono-sm">{reg.toFixed(1)} mm</span>
                </div>
                <input
                  className="reg-range"
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={reg}
                  aria-label="套印偏移量，單位公釐"
                  onChange={(e) => setReg(Number(e.target.value))}
                />
              </div>
            </div>
            <p className="band-cap mono-sm">
              {reg < 0.4 ? '對齊了。分數不會因此變好。' : '板子歪了，紙白就從縫裡露出來。'}
            </p>

            <div className="miss-note">
              <p className="mn-title mono-sm">共同點</p>
              <p className="mn-body">
                這三項比的是三種底子：一個靠記得住，一個靠讀得細，一個靠換一種語言還算得對。
              </p>
            </div>
          </div>

          <div>
            <ol className="score-list">
              {LIMITS.map((l) => (
                <li className="score-row" key={l.en}>
                  <div>
                    <p className="sc-name">{l.name}</p>
                    <p className="sc-en mono-sm">
                      {l.en} · {l.shots}
                    </p>
                    <span className="sc-gap">
                      輸 {l.who} {(l.rival - l.score).toFixed(1)} 分
                    </span>
                  </div>
                  <div className="sc-scores">
                    <span className="sc-mine">{l.score.toFixed(1)}</span>
                    <span className="sc-vs">我</span>
                    <span className="sc-rival">
                      <b>{l.rival.toFixed(1)}</b>
                      <span>{l.who}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="sc-note mono-sm">數字取自官方模型卡的 Base 模型評測。</p>

            <div className="loss-block">
              <p className="loss-label mono-sm">三項加起來，總共差</p>
              <p className="loss">
                24.7<small>POINTS</small>
              </p>
              <p className="loss-note">12.9 ＋ 6.3 ＋ 5.5。同一張表上，我跟領先者的距離。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
