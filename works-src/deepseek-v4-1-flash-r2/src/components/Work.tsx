import { useCanvas, useFontsReady } from '../hooks'
import { paintSame } from '../lib/paint'
import { darkPlate, midPlate, renderPrint } from '../lib/print'
import { SCAFFOLDS, SCAFFOLD_RANKS } from '../content'

const PAPER = '#e6e0d1'
const BLUE = '#17305a'
const ORANGE = '#e2571f'
const MIN = 82
const MAX = 92

const FONT = '"Ink Serif", "PingFang TC", "Microsoft JhengHei", serif'

export default function Work() {
  const fontsReady = useFontsReady()
  const canvasRef = useCanvas(
    (canvas) => {
      renderPrint(canvas, {
        cell: 6,
        paper: PAPER,
        dprCap: 1.4,
        ragged: 0.22,
        inks: [
          { color: BLUE, angle: 15, coverage: darkPlate(1.04) },
          { color: ORANGE, angle: 75, coverage: midPlate(0.24, 0.58, 0.6), offset: [2.4, -1.8] },
        ],
        paint: (ctx, w, h) => paintSame(ctx, w, h, '我', FONT, '#000000', '#ffffff'),
      })
    },
    [fontsReady],
  )

  return (
    <section className="chapter work" id="ch-work">
      <div className="pad">
        <div className="ch-head">
          <span className="ch-no mono-sm">05</span>
          <span className="ch-tag mono-sm">一起工作 / IN THE HARNESS</span>
        </div>

        <div className="work-grid">
          <div className="work-left">
            <div className="same-box">
              <canvas ref={canvasRef} role="img" aria-label="五塊網版疊印出來的字「我」" />
            </div>
            <p className="same-cap mono-sm">五塊版 · 同一個字，疊五次</p>

            <div className="spread-block">
              <p className="spread-label mono-sm">五個殼之間，最大差距</p>
              <p className="spread" aria-label="分數差距 6.5 分">
                6.5<small>POINTS</small>
              </p>
              <p className="spread-cap">最鬆的殼與最緊的殼，中間隔著這麼多。</p>
            </div>
          </div>

          <div>
            <h2 className="ch-title">
              <span className="ln">換一個工具，</span>
              <span className="ln">我還是同一個我。</span>
            </h2>
            <p className="ch-first">同一組權重，換五個代理框架，分數從 84.1 到 90.6。</p>
            <p className="ch-body prose">
              殼決定我怎麼讀題、怎麼動手；同一個我，可以差到六點五分。
            </p>

            <ul className="bars">
              {SCAFFOLDS.map((s, i) => (
                <li className="bar-row" key={s.name}>
                  <span className="bar-name">{s.name}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{
                        width: `${((s.score - MIN) / (MAX - MIN)) * 100}%`,
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  </span>
                  <span className="bar-score">{s.score.toFixed(1)}</span>
                </li>
              ))}
            </ul>
            <p className="mono-sm bar-note">Terminal-Bench 2.1 · 每個框架取 3 次 · 官方模型卡</p>

            <div className="harness-note">
              <p className="hn-title mono-sm">殼是什麼</p>
              <p className="hn-body prose">
                殼是包在模型外面的那一層：它決定何時讀檔、何時動手、何時停手。
              </p>
            </div>

            <div className="rank-note">
              <p className="hn-title mono-sm">換一張考卷，名次就換</p>
              <ul className="rank-list">
                {SCAFFOLD_RANKS.map((r) => (
                  <li key={r.bench}>
                    <span className="rk-bench mono-sm">{r.bench}</span>
                    <span className="rk-top mono-sm">{r.top}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
