import { useEffect, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/media'

export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  id,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'header' | 'footer'
  id?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <Tag ref={ref as never} id={id} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  )
}
