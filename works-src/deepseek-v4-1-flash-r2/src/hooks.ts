import { useCallback, useEffect, useRef, useState } from 'react'

/** 系統是否要求減少動態。 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const FONTS = ['500 16px "Plex Mono"', '400 16px "Bodoni Moda"', '500 16px "Ink Serif"', '400 16px "Bodoni Moda"']

/**
 * 等字型真的載入再畫 canvas。
 * canvas 上的字不會觸發 @font-face 下載，所以要自己點名。
 */
export function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    if (typeof document === 'undefined' || !document.fonts) {
      setReady(true)
      return
    }
    const load = async () => {
      try {
        await Promise.all(FONTS.map((f) => document.fonts.load(f)))
      } catch {
        // 載不到就用後備字型，畫面仍然成立
      }
      await document.fonts.ready
      if (alive) setReady(true)
    }
    void load()
    return () => {
      alive = false
    }
  }, [])
  return ready
}

/**
 * 元素走過視窗的進度：0 剛進場，1 離開。
 * 拿來驅動捲動編舞，不是進場偵測。
 */
export function useScrollProgress<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    const read = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = r.height - vh
      const p = travel > 0 ? -r.top / travel : (vh - r.top) / (r.height + vh)
      const v = Math.min(1, Math.max(0, p))
      if (Math.abs(v - last) > 0.001) {
        last = v
        setProgress(v)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])

  return { ref, progress }
}

/** 畫布排程：掛載、尺寸變化、依賴變更時重畫，一個 frame 只畫一次。 */
export function useCanvas(draw: (canvas: HTMLCanvasElement) => void, deps: ReadonlyArray<unknown>) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  const paint = useCallback(() => {
    const canvas = ref.current
    if (!canvas) return
    drawRef.current(canvas)
  }, [])

  useEffect(() => {
    let raf = requestAnimationFrame(paint)
    const canvas = ref.current
    let ro: ResizeObserver | null = null
    if (canvas && typeof ResizeObserver !== 'undefined') {
      let lastW = 0
      let lastH = 0
      ro = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (!box) return
        // 只有尺寸真的變了才重畫，避免行動瀏覽器網址列伸縮時亂噴
        if (Math.abs(box.width - lastW) < 2 && Math.abs(box.height - lastH) < 2) return
        lastW = box.width
        lastH = box.height
        if (raf) cancelAnimationFrame(raf)
        raf = requestAnimationFrame(paint)
      })
      ro.observe(canvas)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [paint])

  useEffect(() => {
    const raf = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/** 目前捲到第幾章，給右側索引亮燈。 */
export function useActiveChapter(ids: ReadonlyArray<string>) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const vh = window.innerHeight
      let next = 0
      ids.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < vh * 0.55) next = i
      })
      setActive((prev) => (prev === next ? prev : next))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])
  return active
}
