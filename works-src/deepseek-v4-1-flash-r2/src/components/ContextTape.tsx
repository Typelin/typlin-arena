import { useCanvas, useScrollProgress } from '../hooks'
import { paintTape } from '../lib/paint'
import { renderSharp } from '../lib/print'

const DEEP = '#0d1b30'

/**
 * 02 上下文：一百萬個 token 攤成一條尺。
 * 捲動時尺會自己往左跑，游標固定在中間，像在看一份很長的文件。
 */
export default function ContextTape() {
  const { ref, progress } = useScrollProgress<HTMLElement>(true)

  const canvasRef = useCanvas(
    (canvas) => {
      renderSharp(
        canvas,
        (ctx, w, h) =>
          paintTape(ctx, w, h, progress * 1.7, { bg: DEEP, ink: '#e6eef6', accent: '#f0884a' }),
        2,
      )
    },
    [Math.round(progress * 180)],
  )

  return (
    <section className="chapter context" id="ch-context" ref={ref}>
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">02</span>
          <span className="ch-tag mono-sm">上下文 / CONTEXT</span>
        </div>

        <div className="context-top">
          <div>
            <h2 className="ch-title">
              <span className="ln">一百萬個 token，</span>
              <span className="ln">我一次讀完。</span>
            </h2>
            <p className="ch-first">官方標示的上下文上限是 1,048,576 個 token。</p>
            <p className="ch-body prose">
              每個 token 的快取只佔 890 bytes，是上一代的四分之一。長對話的帳單，多半省在這種地方。
            </p>
          </div>

          <div className="ctx-right">
            <p className="ctx-million" aria-label="1,048,576 個 token">
              1<span className="m-c">,</span>048<span className="m-c">,</span>576
              <small>TOKENS</small>
            </p>

            <div className="cache-block">
              <p className="cache-title mono-sm">每 token 的 KV 快取 · 以我為 1 倍</p>
              <div className="cache-rows">
                {[
                  { name: 'V1', ratio: 437, w: 100, cls: 'c-old' },
                  { name: 'V4-Flash', ratio: 4, w: 34, cls: 'c-mid' },
                  { name: 'V4.1-Flash', ratio: 1, w: 13, cls: 'c-now' },
                ].map((r) => (
                  <div className="cache-row" key={r.name}>
                    <span className="cache-name mono-sm">{r.name}</span>
                    <span className="cache-track">
                      <i className={r.cls} style={{ width: `${r.w}%` }} />
                    </span>
                    <span className="cache-val mono-sm">{r.ratio}×</span>
                  </div>
                ))}
              </div>
              <p className="cache-note mono-sm">倍率取自官方模型卡。</p>
            </div>
          </div>
        </div>

        <div className="tape-box">
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
        <div className="tape-cap mono-sm">
          <span>從 0 開始</span>
          <span>捲動＝往前讀</span>
          <span>1,048,576</span>
        </div>
      </div>
    </section>
  )
}
