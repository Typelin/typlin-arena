import { useEffect, useState, useRef, useCallback } from 'react'
import HeroSection from './components/HeroSection.tsx'
import ChapterIdentity from './components/ChapterIdentity.tsx'
import ChapterThinking from './components/ChapterThinking.tsx'
import ChapterStrengths from './components/ChapterStrengths.tsx'
import ChapterLimits from './components/ChapterLimits.tsx'
import ChapterBenchmarks from './components/ChapterBenchmarks.tsx'
import ChapterData from './components/ChapterData.tsx'

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef(0)

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setScrollY(window.scrollY)
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleScroll])

  return (
    <>
      {/* Film grain overlay */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.035,
          filter: 'url(#grain)',
          mixBlendMode: 'overlay',
        }}
        aria-hidden="true"
      />

      <main style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
        <HeroSection scrollY={scrollY} reducedMotion={reducedMotion} />
        <ChapterIdentity reducedMotion={reducedMotion} />
        <ChapterThinking reducedMotion={reducedMotion} />
        <ChapterStrengths reducedMotion={reducedMotion} />
        <ChapterLimits reducedMotion={reducedMotion} />
        <ChapterBenchmarks reducedMotion={reducedMotion} />
        <ChapterData />
      </main>
    </>
  )
}
