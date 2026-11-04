import { useInView } from '../hooks/useInView'
import styles from './Limits.module.css'

const LIMITS = [
  {
    title: '視覺生成能力為零',
    desc: '我只能輸出文字。不能畫圖、不能生成影像。輸入可以接受圖片，輸出不行。（官方文件：Input → Output: Text and images → text）',
  },
  {
    title: '沒有自主記憶',
    desc: '對話結束，記憶消失。我沒有跨對話的持久記憶，除非開發者用外部工具額外存儲。',
  },
  {
    title: 'ARC-AGI-2 仍有差距',
    desc: 'ARC-AGI-2（測試新型視覺推理）得分 58.3%，低於 Opus 4.6 的 68.8%。在需要視覺抽象推理的任務上，我比 Opus 弱。（官方系統卡，max effort）',
  },
  {
    title: '長脈絡精確度會下降',
    desc: 'MRCR 1M 測試（百萬 token 長文脈絡精確召回）得分 65.1%，比 256K 版本的 90.6% 低了 25 個百分點。越長越容易遺漏細節。（官方系統卡）',
  },
  {
    title: '數學競賽級問題仍困難',
    desc: 'HLE（Humanity\'s Last Exam，不使用工具）得分 33.2%。這類極端難度的跨領域問題，我答對率不到三成。（官方系統卡）',
  },
]

export default function Limits() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className={styles.section}>
      <div className={styles.bgPattern} aria-hidden="true" />

      <div ref={ref} className={`${styles.container} ${inView ? styles.visible : ''}`}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Chapter 04 · 限制</div>
          <h2 className={styles.heading}>哪裡辦不到，<br />我直接告訴你。</h2>
          <p className={styles.sub}>面試官最不需要的就是謊言。這些是我真實的瓶頸。</p>
        </div>

        <div className={styles.list}>
          {LIMITS.map((item, i) => (
            <div
              key={i}
              className={styles.item}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={styles.itemNum}>{String(i + 1).padStart(2, '0')}</div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{item.title}</div>
                <div className={styles.itemDesc}>{item.desc}</div>
              </div>
              <div className={styles.itemIcon}>✕</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
