export default function ChapterData() {
  return (
    <section style={{
      position: 'relative',
      padding: 'clamp(100px, 14vh, 160px) clamp(16px, 4vw, 80px)',
      background: 'linear-gradient(180deg, #0d0b06, var(--dark-950) 100%)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span style={{
          display: 'inline-block', fontFamily: 'var(--font-mono)',
          fontSize: 11, letterSpacing: '0.18em', color: 'var(--amber-500)',
          textTransform: 'uppercase', marginBottom: 16,
          padding: '4px 14px', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 4,
        }}>06 — 完整資料</span>

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700,
          color: 'var(--amber-100)', marginBottom: 36, letterSpacing: '-0.01em',
        }}>
          事實彙整與資料來源
        </h2>

        <DT title="模型規格" rows={[
          ['正式名稱', 'Claude Opus 4.6'],
          ['開發者', 'Anthropic'],
          ['發布日期', '2026 年 2 月 5 日'],
          ['模型 ID', 'claude-opus-4-6'],
          ['參數規模', '官方未公開'],
          ['架構', '官方未公開'],
          ['上下文窗口', '1M tokens'],
          ['最大輸出', '128K tokens（Batch 最高 300K）'],
          ['可靠知識截止', '2025 年 5 月'],
          ['訓練資料截止', '2025 年 8 月'],
          ['輸入模態', '文字、圖片、PDF'],
          ['輸出模態', '純文字'],
          ['推理模式', 'Adaptive Thinking（預設 high）'],
          ['輸入 / 輸出價格', '$5 / $25 per MTok'],
          ['Cache 讀取', '$0.50 / MTok（90% 折扣）'],
          ['開放權重', '否（純 API）'],
          ['狀態', '仍在服務（已標為 Legacy）'],
        ]} />

        <DT title="基準成績（Anthropic 官方系統卡）"
          sub="發布日期 2026-02-05・Adaptive Thinking, Max Effort, 5 次平均・查詢日 2026-11-06"
          rows={[
            ['SWE-bench Verified（25 次重複）', '80.84%'],
            ['SWE-bench Multilingual', '77.83%'],
            ['Terminal-Bench 2.0（15×89 tasks）', '65.4%'],
            ['τ²-bench Retail', '91.9%'],
            ['τ²-bench Telecom', '99.3%'],
            ['MCP-Atlas（Max Effort）', '59.5%'],
            ['OSWorld-Verified', '72.7%'],
            ['ARC-AGI-2 Verified', '68.8%'],
            ['GPQA Diamond', '91.3%'],
            ['MMMU-Pro（無工具 / 有工具）', '73.9% / 77.3%'],
            ['MMMLU', '91.1%'],
            ['BrowseComp（單 / 多代理）', '84.0% / 86.8%'],
            ['MRCR v2 八針 1M', '76%'],
            ['HLE（有工具, max effort）', '53.0%'],
          ]} />

        <DT title="Artificial Analysis Intelligence Index"
          sub="Index v4.0（2026 年 2 月）｜收錄版本：Claude Opus 4.6 (Adaptive)｜查詢日 2026-11-06"
          rows={[
            ['v4.0 Intelligence Index 總分', '53（發布時排名 #1）'],
            ['v4.0 評測（10 項）', 'GDPval-AA, τ²-Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, HLE, GPQA Diamond, CritPt'],
            ['領先的 3 項', 'GDPval-AA・Terminal-Bench Hard・CritPt'],
            ['執行成本', '$2,486（Adaptive, Max Effort）'],
          ]} />

        <DT title="Artificial Analysis — 最新排名（BenchLM 引用）"
          sub="BenchLM 彙整的 Index 分數可能來自不同版本・查詢日 2026-11-06"
          rows={[
            ['Opus 4.6 (Adaptive)', '#42・31.9%'],
            ['Opus 4.6 (Non-reasoning)', '#62・26.4%'],
            ['緊鄰前一名 (Index v5.0.1)', 'Gemini 3.8 Flash — 30.9%'],
            ['緊鄰後一名 (Index v5.0.1)', 'GLM-5.3 — 31.6%'],
            ['同開發者', 'Claude Opus 5.5 — #2・59.1%'],
            ['版本差異', 'v4.0→v5.0.1 評測組合已換，分數不直接可比'],
          ]} />

        <DT title="對手比較（系統卡公開數字）"
          sub="Opus 4.5＝前代｜GPT-5.2＝同期競品｜查詢日 2026-11-06"
          header={['評測', 'Opus 4.6', 'Opus 4.5', 'GPT-5.2']}
          rows={[
            ['SWE-bench Verified', '80.8%', '80.9%', '80.0%'],
            ['Terminal-Bench 2.0', '65.4%', '59.8%', '64.7%'],
            ['τ²-bench Retail', '91.9%', '88.9%', '82.0%'],
            ['ARC-AGI-2', '68.8%', '37.6%', '54.2%'],
            ['GPQA Diamond', '91.3%', '87.0%', '93.2%'],
            ['MMMLU', '91.1%', '90.8%', '89.6%'],
            ['OSWorld Verified', '72.7%', '66.3%', '—'],
            ['上下文窗口', '1M', '200K', '1M'],
            ['價格（入/出）', '$5 / $25', '$5 / $25', '—'],
            ['輸出速度 (AA)', '~50 tok/s', '~63 tok/s', '—'],
            ['開放權重', '否', '否', '否'],
          ]} />

        <DT title="Sonar 靜態分析"
          sub="sonarsource.com・查詢日 2026-11-06"
          header={['指標', 'Opus 4.6', 'Opus 4.5', '變化']}
          rows={[
            ['通過率', '82.38%', '83.62%', '−1.5%'],
            ['Issue 密度 (/1K 行)', '18.33', '15.15', '+21%'],
            ['認知複雜度', '6.20', '4.13', '+50%'],
          ]} />

        {/* Sources */}
        <div style={{ marginTop: 56 }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
            color: 'var(--amber-400)', marginBottom: 16, letterSpacing: '0.04em',
          }}>資料來源</h3>
          <ol style={{
            fontSize: 12, lineHeight: 2.2, color: 'var(--dark-400)',
            paddingLeft: 20, fontFamily: 'var(--font-mono)',
          }}>
            <li>Anthropic 官方公告 — anthropic.com/news/claude-opus-4-6（2026-02-05）</li>
            <li>Anthropic 系統卡 PDF — www-cdn.anthropic.com（2026-02-05）</li>
            <li>Anthropic 模型文件 — platform.claude.com/docs/en/models/opus-4-6</li>
            <li>Artificial Analysis — artificialanalysis.ai/articles/opus-4-6-everything-you-need-to-know（2026-02-06）</li>
            <li>Artificial Analysis 模型頁 — artificialanalysis.ai/models/claude-opus-4-6</li>
            <li>BenchLM 排行榜 — benchlm.ai/benchmarks/artificialanalysis（更新 2026-11-05）</li>
            <li>Sonar — sonarsource.com/blog/why-claude-opus-4-6-requires-verification（2026-02-20）</li>
            <li>Benchgap — benchgap.net/model/claude-opus-4-6（更新 2026-11-05）</li>
            <li>AWS Bedrock 模型卡 — docs.aws.amazon.com/bedrock（2026）</li>
            <li>deeplearning.ai 摘要 — deeplearning.ai/the-batch/anthropic-updates（2026-02-13）</li>
          </ol>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 80, paddingTop: 32,
          borderTop: '1px solid rgba(251,191,36,0.08)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--dark-600)', lineHeight: 1.9,
          }}>
            此頁面由 Claude Opus 4.6 自行設計與撰寫<br />
            所有事實均經 Web Search 查證，數字僅引用頁面上實際讀到的值<br />
            Typelin Arena · 2026
          </p>
        </div>
      </div>
    </section>
  )
}

function DT({ title, sub, header, rows }: {
  title: string; sub?: string; header?: string[]; rows: string[][]
}) {
  return (
    <div style={{ marginTop: 44 }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontSize: 'clamp(15px, 2vw, 19px)',
        fontWeight: 600, color: 'var(--amber-200)', marginBottom: sub ? 5 : 12,
      }}>{title}</h3>
      {sub && <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--dark-500)',
        marginBottom: 12, lineHeight: 1.5,
      }}>{sub}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.2vw, 12px)',
        }}>
          {header && (
            <thead><tr>
              {header.map((h, i) => (
                <th key={i} style={{
                  textAlign: i === 0 ? 'left' : 'right',
                  padding: '8px 10px', color: 'var(--amber-400)', fontWeight: 600,
                  borderBottom: '1px solid rgba(251,191,36,0.12)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr></thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    textAlign: ci === 0 ? 'left' : 'right',
                    padding: '6px 10px',
                    color: ci === 0 ? 'var(--dark-400)' : 'var(--amber-200)',
                    borderBottom: '1px solid rgba(255,255,255,0.025)',
                    whiteSpace: ci === 0 ? 'normal' : 'nowrap',
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
