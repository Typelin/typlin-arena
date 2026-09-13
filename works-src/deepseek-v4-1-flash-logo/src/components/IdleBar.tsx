import { useEffect, useRef, useState } from 'react'
import { IDLE_MURMURS } from '../data/content'

/** How long the page must sit untouched before the bar wakes up. */
const IDLE_MS = 4200

/**
 * The page is never actually off — it just goes quiet. After a few seconds
 * without input a progress sweep runs along the top edge and a small chip
 * starts murmuring, so the "still running" character is visible instead of
 * something you have to take on faith.
 */
export function IdleBar() {
  const [idle, setIdle] = useState(false)
  const [murmur, setMurmur] = useState(0)
  const timer = useRef(0)

  useEffect(() => {
    let isIdle = false

    const arm = () => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        isIdle = true
        setIdle(true)
      }, IDLE_MS)
    }

    const wake = () => {
      if (isIdle) {
        isIdle = false
        setIdle(false)
      }
      arm()
    }

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
      'scroll',
    ]
    events.forEach((name) => window.addEventListener(name, wake, { passive: true }))
    arm()

    return () => {
      window.clearTimeout(timer.current)
      events.forEach((name) => window.removeEventListener(name, wake))
    }
  }, [])

  useEffect(() => {
    if (!idle) return
    const interval = window.setInterval(
      () => setMurmur((value) => (value + 1) % IDLE_MURMURS.length),
      3800,
    )
    return () => window.clearInterval(interval)
  }, [idle])

  return (
    <>
      <div className={`idle-bar${idle ? ' is-idle' : ''}`} aria-hidden="true">
        <span className="idle-bar__runner" />
        <span className="idle-bar__glow" />
      </div>

      <div className={`idle-chip${idle ? ' is-idle' : ''}`} aria-hidden="true">
        <span className="idle-chip__dot" />
        <span className="idle-chip__key">STILL RUNNING</span>
        <span className="idle-chip__sep" />
        <span className="idle-chip__text" key={murmur}>
          {IDLE_MURMURS[murmur]}
        </span>
      </div>
    </>
  )
}
