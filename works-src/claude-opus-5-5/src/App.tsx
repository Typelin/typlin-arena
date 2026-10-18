import { useEffect, useRef, useState } from 'react'
import { ALL_GLYPHS, CHAPTERS, canonicalText } from './content'
import { UI_GLYPHS } from './glyphs'
import { Engine } from './engine/engine'
import { Overlay } from './ui/Overlay'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function loadFonts() {
  if (!document.fonts) return
  await Promise.race([
    Promise.all([
      document.fonts.load('500 30px "Noto Serif TC"', ALL_GLYPHS),
      document.fonts.load('900 30px "Noto Serif TC"', '三角洲此河曾流壹貳參肆伍陸'),
      document.fonts.load('400 12px "IBM Plex Mono"', '0123456789.§?·ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    ]),
    wait(4000),
  ]).catch(() => undefined)
}

/**
 * Everything else, in the background: every interface glyph in every weight the CSS uses, so no
 * chapter title or the ending ever waits on a font slice mid-transition.
 */
function warmFonts() {
  if (!document.fonts) return
  const text = UI_GLYPHS + ALL_GLYPHS
  for (const w of [400, 500, 600, 900]) void document.fonts.load(`${w} 20px "Noto Serif TC"`, text).catch(() => undefined)
  for (const w of [400, 500]) void document.fonts.load(`${w} 12px "IBM Plex Mono"`, '0123456789.,:;§?·—–-()%/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').catch(() => undefined)
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backdropRef = useRef<HTMLCanvasElement>(null)
  const scapeRef = useRef<HTMLCanvasElement>(null)
  const [engine, setEngine] = useState<Engine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const e = new Engine(canvas, backdropRef.current ?? undefined, scapeRef.current ?? undefined)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => e.setReducedMotion(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    window.scrollTo(0, 0)
    e.start()
    setEngine(e)
    if (import.meta.env.DEV) (window as unknown as { __delta: Engine }).__delta = e
    let alive = true
    void loadFonts().then(() => {
      if (alive) e.setReady()
      warmFonts()
    })
    return () => {
      alive = false
      mq.removeEventListener('change', onMq)
      e.destroy()
    }
  }, [])

  return (
    <>
      <div className="paper" aria-hidden="true" />
      <canvas ref={backdropRef} className="backdrop" aria-hidden="true" />
      <canvas ref={scapeRef} className="backdrop scape" aria-hidden="true" />
      <canvas ref={canvasRef} className="stage" aria-hidden="true" />
      {engine && <Overlay engine={engine} />}
      {engine && <div className="scroll-spacer" style={{ height: `calc(${engine.timeline.total}px + 100vh)` }} aria-hidden="true" />}
      <article className="sr-only" lang="zh-Hant-TW">
        <h1>三角洲 — Claude Opus 5.5 的自述</h1>
        <p>
          這是一件互動作品：畫面上的句子像一條河，一個詞一個詞地被寫出。每到一個岔口，河會在幾個候選詞之間猶豫，
          你可以用數字鍵選擇其中一個，用右方向鍵或向下捲動讓河前進，用左方向鍵倒流，按住空白鍵提高溫度。
          因你而改變的詞會被標記為朱紅。以下是這條河最可能寫出的版本。
        </p>
        {CHAPTERS.map((c, i) => (
          <section key={c.title}>
            <h2>
              第{c.numeral}章 {c.title}：{c.gloss}
            </h2>
            <p>{canonicalText(i)}</p>
          </section>
        ))}
      </article>
    </>
  )
}
