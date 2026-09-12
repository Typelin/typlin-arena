import { useState } from 'react'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Manifesto } from './components/Manifesto'
import { Nav } from './components/Nav'
import { Process } from './components/Process'
import { SakuraCanvas } from './components/SakuraCanvas'
import { Services } from './components/Services'
import { Stats } from './components/Stats'
import { Works } from './components/Works'
import { useScrollReveal } from './hooks/useScrollReveal'

export default function App() {
  useScrollReveal()
  const [petals, setPetals] = useState(true)

  return (
    <>
      <SakuraCanvas active={petals} />

      <Nav />

      <main>
        <Hero />
        <Manifesto />
        <Services />
        <Process />
        <Works />
        <Stats />
        <Contact />
      </main>

      <Footer />

      <button
        type="button"
        className={`petal-toggle${petals ? ' is-on' : ''}`}
        aria-pressed={petals}
        title={petals ? '關閉花瓣飄落' : '開啟花瓣飄落'}
        onClick={() => setPetals((value) => !value)}
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
