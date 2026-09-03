import Nav from './components/Nav'
import Hero from './components/Hero'
import Philosophy from './components/Philosophy'
import Services from './components/Services'
import Works from './components/Works'
import Process from './components/Process'
import Contact from './components/Contact'
import Footer from './components/Footer'
import PetalsCanvas from './components/PetalsCanvas'

export default function App() {
  return (
    <>
      <div className="bg-aura" aria-hidden="true" />
      <PetalsCanvas />
      <Nav />
      <main>
        <Hero />
        <Philosophy />
        <Services />
        <Works />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
