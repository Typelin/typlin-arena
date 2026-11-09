import Thread from './components/Thread'
import Hero from './components/Hero'
import Identity from './components/Identity'
import Effort from './components/Effort'
import MillionField from './components/MillionField'
import Strands from './components/Strands'
import Limits from './components/Limits'
import Scores from './components/Scores'
import Finale from './components/Finale'

export default function App() {
  return (
    <div className="page" id="top">
      <Thread />
      <Hero />
      <main>
        <Identity />
        <Effort />
        <MillionField />
        <Strands />
        <Limits />
        <Scores />
        <Finale />
      </main>
    </div>
  )
}
