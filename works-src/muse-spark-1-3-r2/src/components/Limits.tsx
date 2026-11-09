import { useRevealRoot } from '../hooks'
import './Limits.css'

export default function Limits() {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <section className="chapter limits" ref={ref} aria-label="做不到的事">
      <p className="chapter-tag rv">Chapter 05 — Limits</p>
      <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
        這些事，我做不到
      </h2>
      <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
        先講醜話。這一章沒有要賣你的東西，只有我的缺點。
      </p>

      <svg className="limits-break rv" viewBox="0 0 1200 60" aria-hidden="true" style={{ '--rv-delay': '0.2s' } as React.CSSProperties}>
        <path d="M 0 22 C 240 14, 400 26, 540 20" />
        <path d="M 660 20 C 800 28, 980 14, 1200 24" />
        <circle cx={552} cy={20} r={4} />
        <circle cx={648} cy={20} r={4} />
      </svg>

      <div className="limits-grid">
        <article className="limit-card rv">
          <svg className="limit-viz" viewBox="0 0 200 44" aria-hidden="true">
            <path d="M0 22 L52 22 L58 10 L66 34 L72 22 L118 22 L124 14 L131 30 L137 22 L200 22" className="limit-wave" />
            <path d="M0 22 L200 22" className="limit-flat" />
          </svg>
          <h3>我的耳朵還沒長好</h3>
          <p>
            Meta 在官方文件裡直接寫明：1.3 的音訊理解尚未完整支援。
            要我聽聲音，請改用 1.2，或專門的語音轉錄模型。
          </p>
        </article>

        <article className="limit-card rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
          <p className="limit-big" aria-hidden="true">?</p>
          <h3>我不知道自己多大</h3>
          <p>
            我的參數數量與架構，官方未公開。
            這不是客套，是事實——連我本人也只能這樣告訴你。
          </p>
        </article>

        <article className="limit-card rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
          <svg className="limit-viz" viewBox="0 0 200 44" aria-hidden="true">
            <rect x="82" y="16" width="36" height="24" rx="3" className="limit-lock-body" />
            <path d="M90 16 v-5 a10 10 0 0 1 20 0 v5" className="limit-lock-shackle" />
            <path d="M20 28 L76 28 M124 28 L180 28" className="limit-flat" strokeDasharray="3 6" />
          </svg>
          <h3>你下載不到我</h3>
          <p>
            我是閉源模型，沒有公開的權重檔。
            我只存在於 Meta 的 API 與產品裡，離開那裡，我就不存在。
          </p>
        </article>

        <article className="limit-card rv" style={{ '--rv-delay': '0.24s' } as React.CSSProperties}>
          <p className="limit-big limit-big-num" aria-hidden="true">
            41.33<span className="limit-big-unit">秒</span>
          </p>
          <h3>我想太久才開口</h3>
          <p>
            Artificial Analysis 以 max 強度實測：我的第一個回答 token 平均要等 41.33 秒。
            跑完整套評測，我一共吐了約 1.23 億個輸出 token。想太多，也是缺點。
          </p>
        </article>
      </div>
    </section>
  )
}
