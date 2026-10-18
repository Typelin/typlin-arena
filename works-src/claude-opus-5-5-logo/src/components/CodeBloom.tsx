import { useEffect, useMemo, useRef, useState } from 'react'
import { reducedMotion, useStickyProgress } from '../hooks'
import { burstAt } from '../petals'
import { Blossom, BlossomDefs } from './Blossom'

const CODE = [
  "import { 夢 } from './你'",
  '',
  'export async function bloom(seed: Idea) {',
  '  const heard  = await listen(seed)',
  '  const sketch = design(heard, { 克制: true })',
  '',
  '  const app = build(sketch)',
  '    .test({ 每一行: true })',
  "    .polish('直到順手')",
  '',
  '  await ship(app)',
  "  return grow(app, { 陪伴: '長期' })",
  '}',
]

const STAGES = [
  { from: 0, k: '種子', t: '你帶來一顆種子', d: '一個想法、一張草圖，甚至只是一句「我想要……」。都可以，我們從這裡開始。' },
  { from: 3, k: '聆聽', t: '先聽，再動手', d: '弄清楚誰會用、在什麼場景下用、最在意什麼。好的需求比好的程式碼更稀缺。' },
  { from: 4, k: '設計', t: '克制地設計', d: '去掉不必要的東西，讓剩下的每一處都經得起推敲。動效只在它真正幫上忙時出現。' },
  { from: 6, k: '打造', t: '一行一行地長', d: '型別安全、可測試、可維護。每一行都測過，打磨到用起來順手為止。' },
  { from: 10, k: '開花', t: '交付，然後陪它長大', d: '上線不是結束。我們會長期陪著產品迭代，看它一季一季地開花。' },
]

const KEYWORDS = new Set(['import', 'from', 'export', 'async', 'function', 'const', 'await', 'return', 'true'])

/** Split one line into highlighted tokens. */
function tokens(line: string) {
  const out: { s: string; c?: string }[] = []
  const re = /('[^']*')|([A-Za-z_]\w*|[一-鿿]+)|(\s+)|(.)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m[1]) out.push({ s: m[1], c: 'tk-str' })
    else if (m[2]) {
      const w = m[2]
      const next = line[re.lastIndex]
      if (KEYWORDS.has(w)) out.push({ s: w, c: 'tk-kw' })
      else if (next === '(') out.push({ s: w, c: 'tk-fn' })
      else if (/^[A-Z]/.test(w)) out.push({ s: w, c: 'tk-type' })
      else if (/[一-鿿]/.test(w)) out.push({ s: w, c: 'tk-cjk' })
      else out.push({ s: w })
    } else out.push({ s: m[3] ?? m[4], c: m[4] ? 'tk-p' : undefined })
  }
  return out
}

/* Geometry in SVG units: IBM Plex Mono advances 0.6em; CJK falls back to a 1em face. */
const FS = 16
const CH = FS * 0.6
const LH = 30
const X0 = 46
const TOP = 34
const cols = (s: string) => [...s].reduce((a, c) => a + (/[　-鿿＀-￯]/.test(c) ? 1 / 0.6 : 1), 0)

export function CodeBloom() {
  const [k, setK] = useState(reducedMotion() ? CODE.length : 0)
  const trunk = useRef<SVGRectElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const prevK = useRef(k)

  const geo = useMemo(() => {
    const ends = CODE.map((l) => X0 + cols(l) * CH)
    const maxEnd = Math.max(...ends)
    const tx = maxEnd + 78
    const H = TOP + CODE.length * LH + 30
    const W = tx + 46
    // trunk centre line leans left as it rises and tapers toward the tip
    const xAt = (y: number) => tx + Math.sin(y / 70) * 9 + (y / H) * 22
    const wAt = (y: number) => 2.5 + 13 * Math.max(0, y / H) ** 1.4
    const left: string[] = []
    const right: string[] = []
    for (let y = H + 12; y >= TOP - 16; y -= 6) {
      left.push(`${(xAt(y) - wAt(y) / 2).toFixed(1)} ${y.toFixed(1)}`)
      right.unshift(`${(xAt(y) + wAt(y) / 2).toFixed(1)} ${y.toFixed(1)}`)
    }
    const trunkD = `M${left.join(' L')} L${right.join(' L')} Z`
    const cubic = (a: number[], t: number) => {
      const u = 1 - t
      return [0, 1].map((j) => u * u * u * a[j] + 3 * u * u * t * a[2 + j] + 3 * u * t * t * a[4 + j] + t * t * t * a[6 + j])
    }
    const buds = CODE.map((l, i) => {
      if (!l.trim() || l.trim() === '}') return null
      const y = TOP + i * LH - 6
      const bx = ends[i] + 24
      // the bough leaves the trunk a little lower and arches out to the end of its line
      const y0 = Math.min(H - 10, y + 16)
      const sx = xAt(y0)
      const len = sx - bx
      const c = [sx, y0, sx - len * 0.35, y0 - 6, bx + len * 0.3, y - 20, bx, y]
      const f = c.map((v) => v.toFixed(1))
      const twig = `M${f[0]} ${f[1]} C${f[2]} ${f[3]} ${f[4]} ${f[5]} ${f[6]} ${f[7]}`
      const tone = (i % 4 === 3 ? 'lilac' : i % 3 === 0 ? 'pale' : 'pink') as 'pink' | 'pale' | 'lilac'
      const tones = ['pale', 'pink', 'pale', 'lilac'] as const
      // smaller blossoms ride the bough, opening from the trunk outward
      const kids = [0.2, 0.42, 0.64, 0.82].map((t, j) => {
        const [kx, ky] = cubic(c, t)
        const side = (i + j) % 2 ? -1 : 1
        return { x: kx, y: ky + side * (5 + (j % 2) * 3), r: 4.5 + ((i * 3 + j * 5) % 5), tone: tones[(i + j) % 4] as 'pink' | 'pale' | 'lilac', rot: (i * 31 + j * 17) % 72, delay: 0.25 + (1 - t) * 0.5 }
      })
      return {
        i,
        x: bx,
        y,
        twig,
        width: 1.8 + Math.min(2.6, len / 110),
        rot: (i * 47) % 72,
        r: 14 + ((i * 7) % 4),
        tone,
        kids,
      }
    }).filter((b) => b !== null)
    return { W, H, trunkD, buds }
  }, [])

  const ref = useStickyProgress<HTMLElement>((p) => {
    if (reducedMotion()) return
    if (trunk.current) trunk.current.setAttribute('y', String((geo.H + 40) * (1 - Math.min(1, p / 0.12)) - 20))
    // the trunk rises over the first eighth, then the code runs line by line
    setK(Math.max(0, Math.min(CODE.length, Math.floor(((p - 0.1) / 0.9) * (CODE.length + 1.5)))))
  })

  // each newly opened blossom lets a few petals go
  useEffect(() => {
    if (k > prevK.current && svg.current && !reducedMotion()) {
      for (const b of geo.buds) {
        if (b.i >= prevK.current && b.i < k) {
          const el = svg.current.querySelector<SVGGElement>(`[data-bud="${b.i}"]`)
          const r = el?.getBoundingClientRect()
          if (r && r.width) setTimeout(() => burstAt(r.left + r.width / 2, r.top + r.height / 2, 4, 0.35), 420)
        }
      }
    }
    prevK.current = k
  }, [k, geo])

  const stage = [...STAGES].reverse().find((s) => k > s.from) ?? STAGES[0]
  const stageIndex = STAGES.indexOf(stage)
  const opened = geo.buds.filter((b) => b.i < k).length

  return (
    <section className="bloom" id="bloom" ref={ref} aria-labelledby="bloom-h">
      <div className="bloom-sticky">
        <div className="bloom-copy">
          <p className="eyebrow">02 · 用程式碼開花</p>
          <h2 id="bloom-h">一段程式碼，怎樣長成一樹花</h2>
          <ol className="bloom-steps" aria-label="工作階段">
            {STAGES.map((s, i) => (
              <li key={s.k} data-on={i === stageIndex || undefined} data-done={i < stageIndex || undefined}>
                <span>{s.k}</span>
              </li>
            ))}
          </ol>
          <div className="bloom-stage" key={stage.k} aria-live="polite">
            <h3>{stage.t}</h3>
            <p>{stage.d}</p>
          </div>
          <p className="bloom-count">
            已開 <b>{opened}</b> / {geo.buds.length} 朵
          </p>
        </div>

        <figure className="bloom-card">
          <div className="bloom-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>sakimu.ts</span>
          </div>
          <svg ref={svg} viewBox={`0 0 ${geo.W} ${geo.H}`} role="img" aria-label="一段 TypeScript 程式碼，每執行一行，旁邊的櫻花枝就開出一朵花">
            <BlossomDefs />
            <defs>
              <linearGradient id="bark" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#3c4a8e" />
                <stop offset="1" stopColor="#8d86cf" />
              </linearGradient>
            </defs>
            <rect className="bloom-hl" x={X0 - 12} y={TOP - 21} width={geo.W - X0} height={LH} rx={6} style={{ transform: `translateY(${Math.max(0, k - 1) * LH}px)`, opacity: k > 0 && k <= CODE.length ? 1 : 0 }} />
            <g className="bloom-code" fontSize={FS}>
              {CODE.map((l, i) => (
                <g key={i} data-run={i < k || undefined}>
                  <text className="ln" x={X0 - 22} y={TOP + i * LH} textAnchor="end">
                    {i + 1}
                  </text>
                  <text x={X0} y={TOP + i * LH} xmlSpace="preserve">
                    {tokens(l).map((t, j) => (
                      <tspan key={j} className={t.c}>
                        {t.s}
                      </tspan>
                    ))}
                  </text>
                </g>
              ))}
            </g>
            <clipPath id="grow">
              <rect ref={trunk} x={0} y={reducedMotion() ? -20 : geo.H + 20} width={geo.W} height={geo.H + 60} />
            </clipPath>
            <path className="trunk" d={geo.trunkD} clipPath="url(#grow)" />
            {geo.buds.map((b) => (
              <g key={b.i} data-bud={b.i} className="bud" data-on={b.i < k || undefined}>
                <path className="twig" d={b.twig} pathLength={1} strokeWidth={b.width} />
                {b.kids.map((c, j) => (
                  <g key={j} className="bud-flower bud-kid" style={{ transformOrigin: `${c.x}px ${c.y}px`, transitionDelay: `${c.delay}s` }}>
                    <Blossom x={c.x} y={c.y} r={c.r} open={c.r < 6 ? 0.5 : 1} rot={c.rot} tone={c.tone} />
                  </g>
                ))}
                <g className="bud-flower" style={{ transformOrigin: `${b.x}px ${b.y}px` }}>
                  <Blossom x={b.x} y={b.y} r={b.r} open={1} rot={b.rot} tone={b.tone} />
                </g>
              </g>
            ))}
          </svg>
        </figure>
      </div>
    </section>
  )
}
