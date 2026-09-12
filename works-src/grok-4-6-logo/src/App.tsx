import { Craft } from './components/Craft'
import { Compiler } from './components/Compiler'
import { Etymology } from './components/Etymology'
import { Footer } from './components/Footer'
import { Garden } from './components/Garden'
import { Hero } from './components/Hero'
import { Letter } from './components/Letter'
import { LogoProvider } from './components/Logo'
import { Nav } from './components/Nav'
import { Season } from './components/Season'
import { Works } from './components/Works'
import { useHashScroll } from './hooks/media'

export default function App() {
  useHashScroll()

  return (
    <LogoProvider>
      <a className="skip" href="#main">
        跳到内容
      </a>
      <Garden />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Hero />
        <div className="day">
          <div className="gate-break" aria-hidden="true" />
          <Etymology />
          <Craft />
          <Season />
          <Works />
          <Compiler />
          <Letter />
        </div>
      </main>
      <Footer />
    </LogoProvider>
  )
}
