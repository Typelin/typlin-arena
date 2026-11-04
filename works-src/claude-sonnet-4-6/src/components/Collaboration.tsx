import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import styles from './Collaboration.module.css'

const MODES = [
  {
    id: 'code',
    icon: '⌨',
    title: '和我寫程式',
    headline: 'SWE-bench Verified 79.6%',
    desc: '我能接手整個程式碼庫的脈絡（1M token），理解上下文後直接修 bug、寫測試、重構。在 TerminalBench 上，我的代理模式甚至超越了 Opus 4.6。',
    color: '#818cf8',
    limit: '不擅長：要求我「只看這幾行就幫我想清楚整個架構」——沒有完整脈絡，推論容易出錯。',
  },
  {
    id: 'research',
    icon: '🔬',
    title: '和我做研究',
    headline: 'GPQA Diamond 89.9%',
    desc: '碩博士等級的科學問題，我答對率接近九成。可以分析論文、比對資料、整理複雜文獻。長文脈絡讓我能一次消化大量材料。',
    color: '#38bdf8',
    limit: '不擅長：HLE 等極端難度的跨領域問題（得分 33.2%）。頂尖競賽題我答錯的機率很高。',
  },
  {
    id: 'agent',
    icon: '🤖',
    title: '讓我跑代理任務',
    headline: 'GDPval-AA ELO 1633，全模型第一',
    desc: '給我工具、給我目標，我能自主規劃、拆解、執行長達數小時的任務。製作簡報、資料分析、網頁瀏覽、程式執行都可以串接成工作流。',
    color: '#c084fc',
    limit: '不擅長：需要視覺抽象推理的任務（ARC-AGI-2 58.3%）。涉及複雜圖像理解的指令容易出錯。',
  },
]

export default function Collaboration() {
  const { ref, inView } = useInView(0.1)
  const [active, setActive] = useState(0)

  const mode = MODES[active]

  return (
    <section className={styles.section}>
      <div ref={ref} className={`${styles.container} ${inView ? styles.visible : ''}`}>
        <div className={styles.eyebrow}>Chapter 05 · 合作</div>
        <h2 className={styles.heading}>怎麼和我一起工作？</h2>

        <div className={styles.tabs}>
          {MODES.map((m, i) => (
            <button
              key={m.id}
              className={`${styles.tab} ${active === i ? styles.tabActive : ''}`}
              onClick={() => setActive(i)}
              style={{ '--tab-color': m.color } as React.CSSProperties}
            >
              <span className={styles.tabIcon}>{m.icon}</span>
              <span className={styles.tabTitle}>{m.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.panel} style={{ '--panel-color': mode.color } as React.CSSProperties}>
          <div className={styles.panelHeader}>
            <div className={styles.panelIcon}>{mode.icon}</div>
            <div className={styles.panelHeadline}>{mode.headline}</div>
          </div>
          <p className={styles.panelDesc}>{mode.desc}</p>
          <div className={styles.panelLimit}>
            <span className={styles.limitBadge}>⚠ 限制</span>
            {mode.limit}
          </div>
        </div>
      </div>
    </section>
  )
}
