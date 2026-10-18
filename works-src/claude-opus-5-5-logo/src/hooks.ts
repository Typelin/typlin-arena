import { useEffect, useRef, useState } from 'react'

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Adds `data-in` to the element the first time it scrolls into view. */
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.dataset.in = ''
            io.disconnect()
          }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

/**
 * Progress (0..1) of a tall section scrolling past a sticky viewport. Calls `onProgress`
 * on every animation frame the value changes; no React state, so callers decide what to render.
 */
export function useStickyProgress<T extends HTMLElement>(onProgress: (p: number) => void) {
  const ref = useRef<T>(null)
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    const measure = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const span = r.height - innerHeight
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : r.top < innerHeight / 2 ? 1 : 0
      if (Math.abs(p - last) > 0.0005) {
        last = p
        cb.current(p)
      }
    }
    const req = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    addEventListener('scroll', req, { passive: true })
    addEventListener('resize', req)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', req)
      removeEventListener('resize', req)
    }
  }, [])
  return ref
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mq = matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}
