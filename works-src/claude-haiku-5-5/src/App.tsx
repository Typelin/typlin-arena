import { ContextWindow, Dial, Hero, Identity, Ledger, Price } from './scenes'
import { AAPanel, Compare, Coding, Scorecard, Work } from './chapters'
import './App.css'

function App() {
  return (
    <main>
      <Hero />
      <Identity />
      <ContextWindow />
      <Price />
      <Scorecard />
      <AAPanel />
      <Coding />
      <Work />
      <Compare />
      <Dial />
      <Ledger />
    </main>
  )
}

export default App
