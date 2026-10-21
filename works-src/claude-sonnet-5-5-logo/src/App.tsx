import { useEffect, useRef } from 'react'
import { Bloom } from './components/Bloom'
import { Letter } from './components/Letter'
import { MoonDial } from './components/MoonDial'
import { bridge, reducedMotion } from './engine/bridge'
import { PetalField } from './engine/petals'
import { applyTone } from './engine/tone'
import { useReveal } from './useReveal'

const LOGO = './logo.png'

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  useReveal()

  useEffect(() => {
    if (!canvas.current || !box.current || !img.current) return
    const reduced = reducedMotion()
    const field = new PetalField(canvas.current, box.current, img.current, reduced)
    const logo = img.current
    field.onImg = (a, fy) => {
      logo.style.opacity = a.toFixed(3)
      logo.style.transform = `translate3d(0,${fy.toFixed(2)}px,0)`
    }
    bridge.field = field
    const root = document.documentElement
    let ticking = false
    const tone = () => {
      ticking = false
      const t = applyTone(root)
      field.setNight(t.night)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(tone)
      }
    }
    const onResize = () => {
      field.resize()
      tone()
    }
    const onMove = (e: PointerEvent) => field.setPointer(e.clientX, e.clientY)
    const onLeave = () => field.setPointer(-9999, -9999)
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest('button, a, textarea, [role="slider"]')) return
      field.gust(e.clientX, e.clientY)
    }
    tone()
    field.start()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready.then(tone)
    return () => {
      field.destroy()
      bridge.field = null
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <>
      <canvas ref={canvas} className="sky" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top" aria-label="咲梦信息科技工作室，回到顶部">
          <span className="seal">
            <img src={LOGO} alt="" width="40" height="40" />
          </span>
          <span className="brand-t">
            <strong>咲梦</strong>
            <em>SAKIMU</em>
          </span>
        </a>
        <nav aria-label="页内导航">
          <a href="#bloom">咲</a>
          <a href="#moon">梦</a>
          <a href="#letter">信</a>
        </nav>
      </header>

      <main>
        <section id="top" className="hero">
          <div className="hero-logo" ref={box}>
            <img ref={img} src={LOGO} alt="咲梦信息科技工作室 LOGO：樱花、月环、云与代码括号" className="hero-img" />
          </div>
          <div className="hero-text">
            <p className="eyebrow">SAKIMU TECH STUDIO</p>
            <h1>
              <span className="h1-a">咲梦</span>
              <span className="h1-b">信息科技工作室</span>
            </h1>
            <p className="slogan">用代码创造美好未来</p>
            <p className="hero-note">花瓣取自这枚 LOGO 的每一个像素。点一下，风就来；等一会，它们会自己回来。</p>
          </div>
          <a className="down" href="#bloom" aria-label="向下，看我们做什么">
            <span />
          </a>
        </section>

        <section id="bloom" className="sec sec-bloom">
          <div className="wrap">
            <p className="kicker" data-reveal>
              01 · 咲 · 做什么
            </p>
            <h2 data-reveal>想法先是一颗花苞。<br />时候到了，就让它开。</h2>
            <div data-reveal>
              <Bloom />
            </div>
          </div>
        </section>

        <section id="dusk" className="dusk" aria-label="日落">
          <p data-reveal>日落之后。</p>
        </section>

        <section id="moon" className="sec sec-moon">
          <div className="wrap">
            <p className="kicker" data-reveal>
              02 · 梦 · 怎么做
            </p>
            <h2 data-reveal>梦是在夜里做完的。<br />拨动月亮，看一件事如何成形。</h2>
            <div data-reveal>
              <MoonDial />
            </div>
          </div>
        </section>

        <section id="letter" className="sec sec-letter">
          <div className="wrap">
            <p className="kicker" data-reveal>
              03 · 信 · 天亮之后
            </p>
            <h2 data-reveal>把梦写成一封短信。</h2>
            <p className="lead" data-reveal>
              选一选，写一两句。我们会生成一页需求简述，点按钮复制，发给我们就行。
            </p>
            <div data-reveal>
              <Letter />
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-in">
          <img src={LOGO} alt="咲梦信息科技工作室 LOGO" width="96" height="96" />
          <div>
            <strong>咲梦信息科技工作室</strong>
            <span>SAKIMU TECH STUDIO · 用代码创造美好未来</span>
          </div>
          <a href="#top">回到花开之前 ↑</a>
        </div>
      </footer>
    </>
  )
}
