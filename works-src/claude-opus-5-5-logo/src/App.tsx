import { useEffect, useRef } from 'react'
import { Footer, Nav } from './components/Chrome'
import { CodeBloom } from './components/CodeBloom'
import { Hero } from './components/Hero'
import { Name } from './components/Name'
import { Phases } from './components/Phases'
import { Services } from './components/Services'
import { Wish } from './components/Wish'
import { reducedMotion } from './hooks'
import { mountPetals, setPetalNight } from './petals'

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas.current) return
    return mountPetals(canvas.current, reducedMotion())
  }, [])

  // the sky turns to night once the wish section reaches the middle of the screen and stays
  // night through the footer, which sits under the same sky
  useEffect(() => {
    const els = ['wish', 'footer'].map((id) => document.getElementById(id)).filter((e) => e !== null)
    const seen = new Map<Element, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting)
        const night = [...seen.values()].some(Boolean)
        document.documentElement.toggleAttribute('data-night', night)
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#1d2350' : '#fbf6f4')
        setPetalNight(night)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="sky-layer" aria-hidden="true">
        <div className="sky-dawn" />
        <div className="sky-night" />
      </div>
      <canvas className="petals" ref={canvas} aria-hidden="true" />
      <a className="skip" href="#name">
        跳到正文
      </a>
      <Nav />
      <Hero />
      <main>
        <Name />
        <CodeBloom />
        <Services />
        <Phases />
        <Wish />
      </main>
      <Footer />
    </>
  )
}
