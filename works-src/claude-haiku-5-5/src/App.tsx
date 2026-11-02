import { ContextWindow, Dial, Hero, Identity, Ledger, Limits, Price } from './scenes'
import './App.css'

function App() {
  return (
    <main>
      <Hero />
      <Identity />
      <ContextWindow />
      <Price />
      <Limits />
      <Dial />
      <Ledger />
    </main>
  )
}

export default App
