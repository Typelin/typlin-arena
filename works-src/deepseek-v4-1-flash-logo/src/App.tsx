import { useCallback, useRef, useState } from 'react'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { IdleBar } from './components/IdleBar'
import { Manifesto } from './components/Manifesto'
import { Nav } from './components/Nav'
import { Process } from './components/Process'
import { SakuraCanvas } from './components/SakuraCanvas'
import { Services } from './components/Services'
import { Stats } from './components/Stats'
import { Toast } from './components/Toast'
import { Works } from './components/Works'
import { EGG_MESSAGES } from './data/content'
import { useEggs } from './hooks/useEggs'
import { useScrollReveal } from './hooks/useScrollReveal'
import { toast } from './lib/toast'

export default function App() {
  useScrollReveal()
  const [petals, setPetals] = useState(true)
  const [burst, setBurst] = useState(false)
  const petalsRef = useRef(true)
  const burstTimer = useRef(0)

  /** Short, dense flurry — the reward for finding an easter egg. */
  const triggerBurst = useCallback(() => {
    window.clearTimeout(burstTimer.current)
    petalsRef.current = true
    setPetals(true)
    setBurst(true)
    burstTimer.current = window.setTimeout(() => setBurst(false), 7000)
  }, [])

  const togglePetals = useCallback(() => {
    const next = !petalsRef.current
    petalsRef.current = next
    setPetals(next)
    toast(next ? EGG_MESSAGES.petalsOn : EGG_MESSAGES.petalsOff, 'iris')
  }, [])

  useEggs({
    onKonami: useCallback(() => {
      triggerBurst()
      toast(EGG_MESSAGES.konami)
    }, [triggerBurst]),
    onTogglePetals: togglePetals,
  })

  return (
    <>
      <SakuraCanvas active={petals} burst={burst} />

      <IdleBar />

      <Nav />

      <main>
        <Hero onBloom={triggerBurst} />
        <Manifesto />
        <Services />
        <Process />
        <Works />
        <Stats />
        <Contact />
      </main>

      <Footer />

      <Toast />

      <button
        type="button"
        className={`petal-toggle${petals ? ' is-on' : ''}`}
        aria-pressed={petals}
        title={petals ? '關閉花瓣飄落（快捷鍵 S）' : '開啟花瓣飄落（快捷鍵 S）'}
        onClick={togglePetals}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.5c3.1 3.3 4.7 6.1 4.7 8.7 0 3.1-2.1 5.4-4.7 5.4s-4.7-2.3-4.7-5.4c0-2.6 1.6-5.4 4.7-8.7Z"
            fill="currentColor"
          />
          <path
            d="M12 17v4.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="visually-hidden">{petals ? '關閉花瓣飄落' : '開啟花瓣飄落'}</span>
      </button>
    </>
  )
}
