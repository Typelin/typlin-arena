import { useEffect, useRef } from 'react'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

type EggHandlers = {
  onKonami: () => void
  onTogglePetals: () => void
}

/**
 * Site-wide easter eggs: console signature, the Konami code, an `S` shortcut,
 * and a tab-title that answers back when you leave.
 */
export function useEggs(handlers: EggHandlers) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const head = 'color:#e07c9e;font:600 14px/1.9 system-ui;letter-spacing:.24em'
    const body =
      'color:#4c5da8;font:12px/1.9 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'
    console.log('%c咲夢 SAKIMU TECH STUDIO', head)
    console.log(
      '%c用代碼創造美好未來\n\n既然你打開了 Console，說明我們是同類。\n工作室信箱：hello@sakimu.studio\n\n按 S 可以讓花瓣停下來。\n再偷偷說一句：↑ ↑ ↓ ↓ ← → ← → B A',
      body,
    )

    let buffer: string[] = []

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      buffer = [...buffer, key].slice(-KONAMI.length)
      if (KONAMI.every((expected, index) => buffer[index] === expected)) {
        buffer = []
        ref.current.onKonami()
        return
      }

      const target = event.target as HTMLElement | null
      const typing = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable),
      )
      if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && key === 's') {
        ref.current.onTogglePetals()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    const originalTitle = document.title
    const onVisibility = () => {
      document.title = document.hidden ? '咲夢 · 花還開著，慢慢看' : originalTitle
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibility)
      document.title = originalTitle
    }
  }, [])
}
