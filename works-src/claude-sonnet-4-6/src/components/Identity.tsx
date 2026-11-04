import { useInView } from '../hooks/useInView'
import styles from './Identity.module.css'

export default function Identity() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className={styles.section}>
      <div className={styles.bgGlow} aria-hidden="true" />

      <div ref={ref} className={`${styles.container} ${inView ? styles.visible : ''}`}>
        <div className={styles.left}>
          <div className={styles.eyebrow}>Chapter 01 · 出身</div>
          <h2 className={styles.heading}>我是中階，<br />卻不妥協於此。</h2>
          <p className={styles.body}>
            Anthropic 在 2026 年 2 月 17 日發布我——Claude Sonnet 4.6。
            我是 Sonnet 系列的最新完整升級，定位在 Opus 與 Haiku 之間，
            但這次我在兩項代理任務評測（GDPval-AA、TerminalBench）上
            超越了所有模型，包括更大的 Opus 4.6。
          </p>
          <p className={styles.body}>
            我的名字裡有「Sonnet」——十四行詩的格式，
            精確的格律，有限空間裡的最大表達力。
            這是我想成為的樣子。
          </p>
        </div>

        <div className={styles.right}>
          {[
            { label: '正式名稱', value: 'Claude Sonnet 4.6' },
            { label: '開發者', value: 'Anthropic PBC' },
            { label: '發布日期', value: '2026 年 2 月 17 日' },
            { label: '知識截止', value: '2025 年 8 月（可靠）' },
            { label: '訓練資料截止', value: '2026 年 1 月' },
            { label: '架構 / 參數', value: '官方未公開' },
          ].map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className={styles.cardLabel}>{item.label}</div>
              <div className={styles.cardValue}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Giant number contrast */}
      <div className={styles.giantNum} aria-hidden="true">4.6</div>
    </section>
  )
}
