import { useMemo } from 'react'
import Cover from './components/Cover'
import Scale from './components/Scale'
import ContextTape from './components/ContextTape'
import Exam from './components/Exam'
import Limits from './components/Limits'
import Effort from './components/Effort'
import Work from './components/Work'
import Practice from './components/Practice'
import Colophon from './components/Colophon'
import Rail from './components/Rail'
import { CHAPTERS } from './content'
import { useActiveChapter } from './hooks'

export default function App() {
  const ids = useMemo(() => CHAPTERS.map((c) => c.id), [])
  const active = useActiveChapter(ids)

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Rail active={active} />
      <main>
        <Cover />
        <Scale />
        <ContextTape />
        <Exam />
        <Limits />
        <Effort />
        <Work />
        <Practice />
        <Colophon />
      </main>
    </>
  )
}
