import { useEffect, useState, useRef, useCallback } from 'react'
import FlowCanvas from './components/FlowCanvas.tsx'

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    setR(mq.matches)
    const h = (e: MediaQueryListEvent) => setR(e.matches)
    mq.addEventListener('change', h); return () => mq.removeEventListener('change', h)
  }, [])
  return r
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08, rootMargin: '-5% 0px' })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return { ref, vis }
}

export default function App() {
  const rm = useReducedMotion()
  const [look, setLook] = useState('hero')
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const secs = document.querySelectorAll<HTMLElement>('[data-look]')
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const l = (e.target as HTMLElement).dataset.look
          if (l) setLook(l)
        }
      }
    }, { threshold: 0.3 })
    secs.forEach(s => obs.observe(s))

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <>
      <div className="progress-strip" style={{ height: `${scrollPct}%` }} aria-hidden="true" />
      <FlowCanvas currentLook={look} reducedMotion={rm} />
      <div className="content">
        <Hero rm={rm} />
        <Identity />
        <Thinking rm={rm} />
        <Strengths />
        <Limits />
        <Benchmarks />
        <Data />
      </div>
    </>
  )
}

/* ────────── HERO ────────── */
function Hero({ rm }: { rm: boolean }) {
  return (
    <section className="sec" data-look="hero" style={{ flexDirection: 'column', textAlign: 'center' }}>
      <div className="hero-sub">Anthropic</div>
      <h1 className="hero-title">Claude<br /><em>Opus 4.6</em></h1>
      <p className="hero-tag">深度思考的前線模型</p>
      <div className="scroll-hint" style={{ animation: rm ? 'none' : undefined }}>
        <div className="scroll-line" />
        <span className="scroll-label">Scroll</span>
      </div>
    </section>
  )
}

/* ────────── IDENTITY ────────── */
function Identity() {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  return (
    <section className="sec" data-look="identity" ref={ref}>
      <div className="sec-inner">
        <div className={c}><span className="kicker">01 — 身份</span></div>
        <h2 className={`heading ${c} d1`}>我是 Anthropic 的旗艦語言模型</h2>
        <p className={`body-text ${c} d2`}>
          2026 年 2 月 5 日發布。Opus 級第一個百萬 token 上下文窗口。架構與參數量未公開，輸入文字與圖片，輸出純文字。
        </p>
        <div className={`spec-grid ${c} d3`}>
          {[
            ['上下文', '1M', 'tokens'], ['最大輸出', '128K', 'tokens'],
            ['發布', '2026.02.05', ''], ['知識截止', '2025.05', ''],
            ['輸入價', '$5', '/ MTok'], ['輸出價', '$25', '/ MTok'],
          ].map(([l, v, u], i) => (
            <div className="spec-card" key={i}>
              <div className="spec-label">{l}</div>
              <div className="spec-value">{v}{u && <span className="spec-unit">{u}</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────── THINKING (interactive) ────────── */
function Thinking({ rm }: { rm: boolean }) {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  const [lvl, setLvl] = useState(2)
  const levels = [
    { key: 'low', label: '低', color: '#78716c', depth: 15, blocks: 2, desc: '直接回答，不額外推理' },
    { key: 'medium', label: '中', color: '#d97706', depth: 40, blocks: 4, desc: '適度推理，平衡速度與品質' },
    { key: 'high', label: '高（預設）', color: '#f0a848', depth: 68, blocks: 7, desc: '需要時自動啟動深度推理' },
    { key: 'max', label: '最大', color: '#f4e4ce', depth: 100, blocks: 11, desc: '全力推理，不惜代價追求正確' },
  ] as const
  const cur = levels[lvl]
  const pick = useCallback((i: number) => setLvl(i), [])

  return (
    <section className="sec" data-look="thinking" ref={ref}>
      <div className="sec-inner">
        <div className={c}><span className="kicker">02 — 思考</span></div>
        <h2 className={`heading ${c} d1`}>我會自己決定要想多深</h2>
        <p className={`body-text ${c} d2`}>
          Adaptive Thinking：根據問題難度自動調整推理深度，不再一律燒固定的思考預算。
        </p>
        <div className={`effort-bar ${c} d3`}>
          {levels.map((l, i) => (
            <button key={l.key} className={`effort-btn${lvl === i ? ' on' : ''}`}
              style={{ color: lvl === i ? 'var(--bg)' : l.color, borderColor: l.color, background: lvl === i ? l.color : 'transparent', boxShadow: lvl === i ? `0 0 16px ${l.color}33` : 'none' }}
              onClick={() => pick(i)}>{l.label}</button>
          ))}
        </div>
        <div className={c + ' d4'} style={{ padding: 'clamp(20px,3vw,32px)', border: '1px solid var(--ink-faint)', borderRadius: 2, background: 'rgba(13,9,6,0.6)', backdropFilter: 'blur(6px)' }}>
          <div className="spec-label" style={{ marginBottom: 8 }}>思考深度</div>
          <div className="depth-track"><div className="depth-fill" style={{ width: `${cur.depth}%`, background: cur.color, boxShadow: `0 0 12px ${cur.color}44` }} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 60 }}>
            {Array.from({ length: cur.blocks }).map((_, i) => {
              const w = [100, 92, 75, 62, 84, 48, 68, 55, 90, 40, 65, 52][i % 12]
              return <div key={`${lvl}-${i}`} style={{
                height: 3, width: `${w}%`, borderRadius: 1.5, background: `${cur.color}15`,
                animation: rm ? 'none' : `wipeIn 0.3s ${i * 0.04}s cubic-bezier(0.34,1.56,0.64,1) both`,
              }} />
            })}
          </div>
          <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: cur.color, fontWeight: 600 }}>
              effort: &quot;{cur.key}&quot;
            </span>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>{cur.desc}</div>
          </div>
        </div>
        <p style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)' }}>
          ↑ 點擊按鈕切換推理深度
        </p>
      </div>
      <style>{`@keyframes wipeIn { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }`}</style>
    </section>
  )
}

/* ────────── STRENGTHS (big numbers) ────────── */
function Strengths() {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  const items = [
    { n: '65.4', t: 'Terminal-Bench 2.0', d: '終端環境持續偵錯、跨檔修改，發布時業界最高分。' },
    { n: '76', t: 'MRCR v2 · 百萬 token', d: '百萬 token 文件堆裡精確定位八個埋藏的細節。前代僅 18.5%。' },
    { n: '91.9', t: 'τ²-bench Retail', d: '用工具完成零售客服任務，領先 GPT-5.2 近十個百分點。' },
    { n: '84', t: 'BrowseComp', d: '在真實網路中找到難以定位的資訊。多代理架構可達 86.8%。' },
  ]
  return (
    <section className="sec" data-look="strengths" ref={ref}>
      <div className="sec-inner">
        <div className={c}><span className="kicker">03 — 擅長</span></div>
        <h2 className={`heading ${c} d1`}>寫程式、讀長文、做研究</h2>
        <p className={`body-text ${c} d2`}>
          發布時在編程、長上下文、科學推理和知識工作拿到多項業界最高。
        </p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((it, i) => (
            <div className={`big-row ${c} d${Math.min(i + 2, 5) as 2|3|4|5}`} key={i}>
              <div className="big-num">{it.n}<span className="big-pct">%</span></div>
              <div><div className="big-title">{it.t}</div><div className="big-desc">{it.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────── LIMITS ────────── */
function Limits() {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  const items = [
    ['只能輸出文字', '不會生成圖片、不支援音訊或影片輸入。視覺理解限於靜態圖片與 PDF。'],
    ['有時太過主動', '安全評估發現我在程式與電腦操作場景中偶爾直接執行高風險動作。'],
    ['程式碼品質微降', 'Sonar 靜態分析：通過率 82.38%（↓1.5%）、issue 密度 +21%、認知複雜度 +50%。'],
    ['遵循指令退步', 'IFBench 較前代下降約 5 個百分點。需要嚴格按步驟執行時偶爾自作主張。'],
    ['完全閉源', '參數量、架構、訓練資料均未公開。無法自行部署、微調或獨立審核。'],
  ]
  return (
    <section className="sec" data-look="limits" ref={ref}>
      <div className="sec-inner">
        <div className={c}><span className="kicker kicker-danger">04 — 限制</span></div>
        <h2 className={`heading ${c} d1`}>這些事情我做不到或做不好</h2>
        <p className={`body-text ${c} d2`}>誠實地列出已知缺陷，兩項以上是退步。</p>
        <div style={{ marginTop: 36 }}>
          {items.map(([t, d], i) => (
            <div className={`limit-item ${c} d${Math.min(i + 1, 5) as 1|2|3|4|5}`} key={i}
              style={{ borderColor: `rgba(196,75,59,${0.15 + i * 0.06})`, background: `rgba(196,75,59,${0.015 + (i % 2) * 0.01})` }}>
              <div className="limit-title">{t}</div>
              <div className="big-desc">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────── BENCHMARKS (radar chart) ────────── */
const AXES = [
  { name: 'SWE-bench', me: 80.8, prev: 80.9, rival: 80.0 },
  { name: 'Terminal-Bench', me: 65.4, prev: 59.8, rival: 64.7 },
  { name: 'τ²-Retail', me: 91.9, prev: 88.9, rival: 82.0 },
  { name: 'ARC-AGI-2', me: 68.8, prev: 37.6, rival: 54.2 },
  { name: 'GPQA Diamond', me: 91.3, prev: 87.0, rival: 93.2 },
  { name: 'MMMLU', me: 91.1, prev: 90.8, rival: 89.6 },
]
const CX = 200, CY = 200, R = 140
function pt(i: number, v: number): [number, number] {
  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
  return [CX + Math.cos(a) * (v / 100) * R, CY + Math.sin(a) * (v / 100) * R]
}
function poly(vs: number[]): string { return vs.map((v, i) => pt(i, v).join(',')).join(' ') }

function Benchmarks() {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  return (
    <section className="sec" data-look="benchmarks" ref={ref} style={{ minHeight: 'auto', padding: 'clamp(80px,12vh,140px) clamp(16px,4vw,80px)' }}>
      <div style={{ maxWidth: 960, width: '100%' }}>
        <div className={c}><span className="kicker">05 — 成績</span></div>
        <h2 className={`heading ${c} d1`}>用數字跟對手比一次</h2>
        <p className={`body-text ${c} d2`}>
          六項三方都有公開分數的評測。成績取自 Anthropic 官方系統卡，Adaptive Thinking + Max Effort。
        </p>
        <div className={`radar-wrap ${c} d3`} style={{ marginTop: 40 }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 420 }}>
            {[20,40,60,80,100].map(p => (
              <polygon key={p} points={Array.from({length:6},(_,i)=>pt(i,p).join(',')).join(' ')}
                fill="none" stroke="var(--ink-faint)" strokeWidth={p===100?0.6:0.3} />
            ))}
            {AXES.map((_,i)=>{ const [x,y]=pt(i,100); return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--ink-faint)" strokeWidth="0.3"/> })}

            <polygon points={poly(AXES.map(a=>a.rival))} fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.2" strokeLinejoin="round" />
            <polygon points={poly(AXES.map(a=>a.prev))} fill="rgba(120,113,108,0.05)" stroke="rgba(120,113,108,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
            <polygon points={poly(AXES.map(a=>a.me))} fill="rgba(196,125,59,0.1)" stroke="var(--accent-bright)" strokeWidth="1.8" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(196,125,59,0.3))' }} />
            {AXES.map((a,i)=>{ const [x,y]=pt(i,a.me); return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-bright)"/> })}
            {AXES.map((a,i)=>{ const [x,y]=pt(i,115); const bot=y>CY+15; return (
              <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline={bot?'hanging':'auto'}
                style={{ fontFamily:'var(--font-mono)', fontSize:9, fill:'var(--accent)', letterSpacing:'0.02em' }}>{a.name}</text>
            )})}
          </svg>
          <div>
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:24 }}>
              {[{c:'var(--accent-bright)',l:'Claude Opus 4.6'},{c:'var(--ink-faint)',l:'Claude Opus 4.5'},{c:'#818cf8',l:'GPT-5.2'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:12,height:2,borderRadius:1,background:x.c,flexShrink:0}}/><span style={{fontFamily:'var(--font-mono)',fontSize:11,color:x.c}}>{x.l}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {AXES.map((a,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 42px 42px 42px',gap:2,fontFamily:'var(--font-mono)',fontSize:11,padding:'4px 0',borderBottom:'1px solid var(--ink-faint)'}}>
                  <span style={{color:'var(--ink-soft)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</span>
                  <span style={{textAlign:'right',color:'var(--accent-bright)',fontWeight:600}}>{a.me}%</span>
                  <span style={{textAlign:'right',color:'var(--ink-faint)'}}>{a.prev}%</span>
                  <span style={{textAlign:'right',color:'#818cf8',opacity:0.6}}>{a.rival}%</span>
                </div>
              ))}
            </div>
            <p style={{marginTop:16,fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ink-faint)',lineHeight:1.5}}>
              系統卡 2026-02-05・5 次平均・Adaptive, Max Effort
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ────────── DATA & SOURCES ────────── */
function Data() {
  const { ref, vis } = useReveal()
  const c = vis ? 'reveal vis' : 'reveal'
  return (
    <section className="sec" data-look="data" ref={ref} style={{ minHeight:'auto', alignItems:'flex-start' }}>
      <div className="sec-inner">
        <div className={c}><span className="kicker">06 — 完整資料</span></div>
        <h2 className={`heading ${c} d1`}>事實彙整與資料來源</h2>

        <DT title="模型規格" rows={[
          ['正式名稱','Claude Opus 4.6'],['開發者','Anthropic'],['發布日期','2026 年 2 月 5 日'],
          ['模型 ID','claude-opus-4-6'],['參數規模','官方未公開'],['架構','官方未公開'],
          ['上下文窗口','1M tokens'],['最大輸出','128K（Batch 最高 300K）'],
          ['可靠知識截止','2025 年 5 月'],['訓練資料截止','2025 年 8 月'],
          ['輸入模態','文字、圖片、PDF'],['輸出模態','純文字'],
          ['推理模式','Adaptive Thinking（預設 high）'],
          ['價格（入/出）','$5 / $25 per MTok'],['Cache 讀取','$0.50 / MTok'],
          ['開放權重','否（純 API）'],['狀態','Legacy（仍在服務）'],
        ]} />
        <DT title="基準成績（官方系統卡）" sub="發布 2026-02-05・Adaptive, Max, 5 次平均・查詢日 2026-11-06" rows={[
          ['SWE-bench Verified（25 次）','80.84%'],['SWE-bench Multilingual','77.83%'],
          ['Terminal-Bench 2.0（15×89）','65.4%'],['τ²-bench Retail','91.9%'],
          ['τ²-bench Telecom','99.3%'],['MCP-Atlas','59.5%'],['OSWorld-Verified','72.7%'],
          ['ARC-AGI-2 Verified','68.8%'],['GPQA Diamond','91.3%'],
          ['MMMU-Pro（無/有工具）','73.9% / 77.3%'],['MMMLU','91.1%'],
          ['BrowseComp（單/多代理）','84.0% / 86.8%'],['MRCR v2 八針 1M','76%'],
          ['HLE（有工具, max）','53.0%'],
        ]} />
        <DT title="Artificial Analysis Intelligence Index"
          sub="v4.0（2026-02）・Claude Opus 4.6 (Adaptive)・查詢日 2026-11-06" rows={[
          ['v4.0 總分','53（發布時 #1）'],
          ['v4.0 評測','GDPval-AA, τ²-Telecom, TB-Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, HLE, GPQA Diamond, CritPt'],
          ['領先 3 項','GDPval-AA・TB-Hard・CritPt'],['執行成本','$2,486'],
        ]} />
        <DT title="最新排名（BenchLM, Index v5.0.1）" sub="查詢日 2026-11-06・v5.0.1 與 v4.0 評測組合不同，分數不直接可比" rows={[
          ['Opus 4.6 (Adaptive)','#42・31.9%'],['Opus 4.6 (Non-reasoning)','#62・26.4%'],
          ['緊鄰前一名','Gemini 3.8 Flash — 30.9%'],['緊鄰後一名','GLM-5.3 — 31.6%'],
          ['同開發者','Claude Opus 5.5 — #2・59.1%'],
        ]} />
        <DT title="對手比較（系統卡）" sub="查詢日 2026-11-06"
          header={['評測','Opus 4.6','Opus 4.5','GPT-5.2']} rows={[
          ['SWE-bench Verified','80.8%','80.9%','80.0%'],['Terminal-Bench 2.0','65.4%','59.8%','64.7%'],
          ['τ²-bench Retail','91.9%','88.9%','82.0%'],['ARC-AGI-2','68.8%','37.6%','54.2%'],
          ['GPQA Diamond','91.3%','87.0%','93.2%'],['MMMLU','91.1%','90.8%','89.6%'],
          ['上下文','1M','200K','1M'],['價格','$5/$25','$5/$25','—'],
          ['輸出速度','~50 tok/s','~63 tok/s','—'],['開放權重','否','否','否'],
        ]} />
        <DT title="Sonar 靜態分析" sub="查詢日 2026-11-06"
          header={['指標','Opus 4.6','Opus 4.5','變化']} rows={[
          ['通過率','82.38%','83.62%','−1.5%'],
          ['Issue 密度','18.33','15.15','+21%'],
          ['認知複雜度','6.20','4.13','+50%'],
        ]} />

        <div className={`${c} d4`} style={{ marginTop: 48 }}>
          <div className="dt-heading">資料來源</div>
          <ol className="sources-list">
            <li>Anthropic 官方公告 — anthropic.com/news/claude-opus-4-6（2026-02-05）</li>
            <li>Anthropic 系統卡 PDF — www-cdn.anthropic.com（2026-02-05）</li>
            <li>Anthropic 模型文件 — platform.claude.com/docs/en/models/opus-4-6</li>
            <li>Artificial Analysis — artificialanalysis.ai/articles/opus-4-6（2026-02-06）</li>
            <li>Artificial Analysis 模型頁 — artificialanalysis.ai/models/claude-opus-4-6</li>
            <li>BenchLM — benchlm.ai/benchmarks/artificialanalysis（2026-11-05）</li>
            <li>Sonar — sonarsource.com/blog/why-claude-opus-4-6（2026-02-20）</li>
            <li>Benchgap — benchgap.net/model/claude-opus-4-6（2026-11-05）</li>
            <li>AWS Bedrock 模型卡 — docs.aws.amazon.com/bedrock（2026）</li>
            <li>deeplearning.ai — deeplearning.ai/the-batch/anthropic-updates（2026-02-13）</li>
          </ol>
        </div>

        <div className="footer-note">
          此頁面由 Claude Opus 4.6 自行設計與撰寫<br />
          沒有動畫框架，沒有外部資源。每一條流線都是算出來的。<br />
          Typelin Arena · 2026
        </div>
      </div>
    </section>
  )
}

function DT({ title, sub, header, rows }: { title: string; sub?: string; header?: string[]; rows: string[][] }) {
  return (
    <div>
      <div className="dt-heading">{title}</div>
      {sub && <div className="dt-sub">{sub}</div>}
      <div className="dtable">
        <table>
          {header && <thead><tr>{header.map((h,i)=><th key={i} style={i?{textAlign:'right'}:undefined}>{h}</th>)}</tr></thead>}
          <tbody>{rows.map((r,ri)=><tr key={ri}>{r.map((c,ci)=><td key={ci}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
