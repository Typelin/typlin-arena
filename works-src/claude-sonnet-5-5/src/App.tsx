import { useEffect, useRef } from 'react'
import { Chrome } from './components/Chrome'
import { Mark } from './components/Mark'
import { Readouts } from './components/Readouts'
import { Ruler } from './components/Ruler'
import { Sections } from './components/Sections'
import { Title } from './components/Title'
import { Tuner } from './components/Tuner'
import { bridge } from './engine/bridge'
import { Instrument } from './engine/instrument'
import { useUi } from './engine/store'

export function App() {
  const { seq } = useUi()
  const canvas = useRef<HTMLCanvasElement>(null)
  const hits = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!canvas.current || !hits.current || !title.current || !main.current) return
    const sections = [...main.current.querySelectorAll<HTMLElement>('[data-section]')]
    const blocks = [...main.current.querySelectorAll<HTMLElement>('[data-block]')]
    const inst = new Instrument({
      canvas: canvas.current,
      hitHost: hits.current,
      title: title.current,
      sections,
      blocks,
    })
    bridge.inst = inst
    return () => {
      inst.destroy()
      bridge.inst = null
    }
  }, [])

  return (
    <>
      <canvas ref={canvas} className="stage-canvas" aria-hidden="true" />
      <div ref={hits} className="hits" />
      <Title ref={title} />
      <Mark />
      <Chrome />
      <Ruler />
      <Readouts />
      <Tuner />
      <div className="playhead" data-on={seq === 'running'} aria-hidden="true" />
      <Sections ref={main} />
    </>
  )
}
