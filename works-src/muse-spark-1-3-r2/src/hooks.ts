import { useEffect, useRef, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Adds `.is-in` to elements with `.rv` inside the returned ref's subtree. */
export function useRevealRoot<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll('.rv')
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])
  return ref
}

/** Scroll progress (0..1) of an element travelling through the viewport. */
export function useSectionProgress<T extends HTMLElement>(sticky = false) {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      let p: number
      if (sticky) {
        // progress while a taller-than-viewport section scrolls past
        const total = rect.height - vh
        p = total > 0 ? -rect.top / total : 1
      } else {
        p = (vh - rect.top) / (rect.height + vh)
      }
      setProgress(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sticky])
  return { ref, progress }
}

/** Smoothly animates a displayed number toward `target`. */
export function useTweenedNumber(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)
  useEffect(() => {
    const from = valueRef.current
    const to = target
    if (from === to) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 4)
      const v = from + (to - from) * eased
      valueRef.current = v
      setValue(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return value
}
