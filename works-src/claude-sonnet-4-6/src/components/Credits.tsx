import { useInView } from '../hooks/useInView'
import styles from './Credits.module.css'

export default function Credits() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className={styles.section}>
      <div ref={ref} className={`${styles.container} ${inView ? styles.visible : ''}`}>
        <div className={styles.eyebrow}>Chapter 06 · 完整資料</div>
        <h2 className={styles.heading}>數字、出處、比較——全在這裡。</h2>

        {/* 規格表 */}
        <div className={styles.block}>
          <div className={styles.blockTitle}>基本規格</div>
          <table className={styles.table}>
            <tbody>
              <tr><td>正式名稱</td><td>Claude Sonnet 4.6</td><td>Anthropic 官方文件</td></tr>
              <tr><td>Model ID</td><td>claude-sonnet-4-6</td><td>Anthropic 官方文件</td></tr>
              <tr><td>開發者</td><td>Anthropic PBC</td><td>Anthropic 官方文件</td></tr>
              <tr><td>發布日期</td><td>2026 年 2 月 17 日</td><td>Anthropic 官方文件</td></tr>
              <tr><td>知識截止（可靠）</td><td>2025 年 8 月</td><td>Anthropic 官方文件</td></tr>
              <tr><td>訓練資料截止</td><td>2026 年 1 月</td><td>Anthropic 官方文件</td></tr>
              <tr><td>Context Window</td><td>1,000,000 tokens</td><td>Anthropic 官方文件</td></tr>
              <tr><td>Max Output</td><td>128,000 tokens</td><td>Anthropic 官方文件</td></tr>
              <tr><td>輸入價格</td><td>$3 / MTok</td><td>Anthropic 官方文件</td></tr>
              <tr><td>輸出價格</td><td>$15 / MTok</td><td>Anthropic 官方文件</td></tr>
              <tr><td>Thinking 模式</td><td>Adaptive（預設 high effort）</td><td>Anthropic 官方文件</td></tr>
              <tr><td>輸入模態</td><td>文字、圖像</td><td>Anthropic 官方文件</td></tr>
              <tr><td>輸出模態</td><td>文字</td><td>Anthropic 官方文件</td></tr>
              <tr><td>架構 / 參數規模</td><td>官方未公開</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

        {/* 基準成績 */}
        <div className={styles.block}>
          <div className={styles.blockTitle}>基準成績（官方系統卡，2026-02-17，adaptive thinking, max effort）</div>
          <table className={styles.table}>
            <thead>
              <tr><th>評測</th><th>得分</th><th>說明</th></tr>
            </thead>
            <tbody>
              <tr><td>SWE-bench Verified</td><td className={styles.highlight}>79.6%</td><td>10 試平均，Anthropic 內部評測</td></tr>
              <tr><td>SWE-bench Multilingual</td><td className={styles.highlight}>75.9%</td><td>9 種語言，300 題，官方系統卡</td></tr>
              <tr><td>Terminal-Bench 2.0</td><td className={styles.highlight}>59.1%</td><td>Terminus-2 harness，thinking off</td></tr>
              <tr><td>GPQA Diamond</td><td className={styles.highlight}>89.9%</td><td>198 題，10 試平均，官方系統卡</td></tr>
              <tr><td>HLE（無工具）</td><td>33.2%</td><td>官方系統卡</td></tr>
              <tr><td>HLE（有工具）</td><td className={styles.highlight}>49.0%</td><td>官方系統卡</td></tr>
              <tr><td>ARC-AGI-2（max effort）</td><td>58.3%</td><td>官方系統卡</td></tr>
              <tr><td>OSWorld-Verified</td><td className={styles.highlight}>72.5%</td><td>官方系統卡</td></tr>
              <tr><td>GDPval-AA</td><td className={styles.highlight}>1633 ELO</td><td>Artificial Analysis，2026-02-18，全模型第一</td></tr>
              <tr><td>MMMU-Pro（無工具）</td><td>74.5%</td><td>官方系統卡</td></tr>
              <tr><td>MRCR 256K（8-needles）</td><td className={styles.highlight}>90.6%</td><td>官方系統卡，64k thinking budget</td></tr>
              <tr><td>MRCR 1M（8-needles）</td><td>65.1%</td><td>官方系統卡，64k thinking budget</td></tr>
            </tbody>
          </table>
        </div>

        {/* Artificial Analysis */}
        <div className={styles.block}>
          <div className={styles.blockTitle}>Artificial Analysis 收錄資料</div>
          <table className={styles.table}>
            <tbody>
              <tr><td>Intelligence Index（v4.3.2，Max effort）</td><td>30 / 100</td><td>查詢日期：2026-11-04，artificialanalysis.ai</td></tr>
              <tr><td>Intelligence Index 發布時（v4.0，Max effort）</td><td>51 / 100</td><td>Artificial Analysis 文章，2026-02-18，當時排名第 2</td></tr>
              <tr><td>GDPval-AA v2.1</td><td>1,233 ELO</td><td>artificialanalysis.ai，查詢日期 2026-11-04</td></tr>
              <tr><td>輸出速度</td><td>64 tokens/s</td><td>artificialanalysis.ai</td></tr>
              <tr><td>GPQA Diamond（AA 測試）</td><td>79.9%</td><td>artificialanalysis.ai</td></tr>
              <tr><td>HLE（AA 測試）</td><td>13.2%</td><td>artificialanalysis.ai（非 max effort）</td></tr>
            </tbody>
          </table>
          <p className={styles.note}>⚠ 注意：Artificial Analysis Intelligence Index 分數隨時間改版（模型增加、評測版本更新），發布時的 v4.0 與目前 v4.3.2 版本評分不可直接比較。</p>
        </div>

        {/* 對手比較 */}
        <div className={styles.block}>
          <div className={styles.blockTitle}>對手比較（官方系統卡，adaptive thinking, max effort，2026-02-17）</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>評測</th>
                  <th>Sonnet 4.6（本模型）</th>
                  <th>Opus 4.6（同廠更大）</th>
                  <th>Sonnet 4.5（前代）</th>
                  <th>GPT-5.2</th>
                  <th>Gemini 3 Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SWE-bench Verified</td>
                  <td className={styles.highlight}>79.6%</td>
                  <td>80.8%</td>
                  <td>77.2%</td>
                  <td>80.0%</td>
                  <td>76.2%</td>
                </tr>
                <tr>
                  <td>GPQA Diamond</td>
                  <td>89.9%</td>
                  <td className={styles.highlight}>91.3%</td>
                  <td>83.4%</td>
                  <td>93.2%</td>
                  <td>91.9%</td>
                </tr>
                <tr>
                  <td>GDPval-AA</td>
                  <td className={styles.highlight}>1633</td>
                  <td>1606</td>
                  <td>1416</td>
                  <td>1462</td>
                  <td>1201</td>
                </tr>
                <tr>
                  <td>ARC-AGI-2</td>
                  <td>58.3%</td>
                  <td className={styles.highlight}>68.8%</td>
                  <td>13.6%</td>
                  <td>54.2%</td>
                  <td>31.1%</td>
                </tr>
                <tr>
                  <td>HLE（有工具）</td>
                  <td>49.0%</td>
                  <td className={styles.highlight}>53.0%</td>
                  <td>33.6%</td>
                  <td>50.0%</td>
                  <td>45.8%</td>
                </tr>
                <tr>
                  <td>Context Window</td>
                  <td className={styles.highlight}>1M tokens</td>
                  <td className={styles.highlight}>1M tokens</td>
                  <td>200K tokens</td>
                  <td>官方未公開</td>
                  <td>官方未公開</td>
                </tr>
                <tr>
                  <td>輸入價格 / MTok</td>
                  <td>$3</td>
                  <td>$5</td>
                  <td>$3</td>
                  <td>官方未公開</td>
                  <td>官方未公開</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.note}>數字以粗體標示該行最佳分數。GPT-5.2 以 xhigh effort、Gemini 3 Pro 以 high thinking 評測。</p>
        </div>

        {/* 資料來源 */}
        <div className={styles.sources}>
          <div className={styles.blockTitle}>資料來源</div>
          <ul className={styles.sourceList}>
            <li>Anthropic 官方發布公告：<em>Introducing Claude Sonnet 4.6</em>，2026-02-17，anthropic.com/news/claude-sonnet-4-6</li>
            <li>Anthropic 官方模型文件：platform.claude.com/docs/en/models/sonnet-4-6/overview，查詢日期 2026-11-04</li>
            <li>Claude Sonnet 4.6 System Card（PDF），Anthropic，2026-02-17（3月6日修訂），www-cdn.anthropic.com</li>
            <li>Artificial Analysis：<em>Sonnet 4.6 - Everything you need to know</em>，2026-02-18，artificialanalysis.ai/articles/sonnet-4-6-everything-you-need-to-know</li>
            <li>Artificial Analysis：<em>Claude Sonnet 4.6 - New leader in GDPval-AA</em>，2026-02-17，artificialanalysis.ai</li>
            <li>Anthropic 1M context GA 公告：<em>1M context is now generally available for Opus 4.6 and Sonnet 4.6</em>，2026-03-13，claude.com/blog/1m-context-ga</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerModel}>Claude Sonnet 4.6</div>
          <div className={styles.footerBy}>by Anthropic · 2026</div>
          <div className={styles.footerNote}>此頁由 Claude Sonnet 4.6 本人製作。</div>
        </div>
      </div>
    </section>
  )
}
