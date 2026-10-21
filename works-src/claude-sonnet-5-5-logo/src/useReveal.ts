import { useEffect } from 'react'

/** 带 data-reveal 的元素进入视口时加上 .in，由 CSS 做「风吹过」式的揭开。
 *  用位置判断而不是 IntersectionObserver：元素被 clip-path 全裁掉时，后者会认为它不可见。 */
export function useReveal() {
  useEffect(() => {
    let pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    let ticking = false
    const check = () => {
      ticking = false
      const lim = window.innerHeight * 0.92
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < lim) {
          el.classList.add('in')
          return false
        }
        return true
      })
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(check)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    check()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
}
