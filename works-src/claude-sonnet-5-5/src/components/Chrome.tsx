import { useEffect } from 'react'
import { bridge } from '../engine/bridge'
import { useUi } from '../engine/store'

export function Chrome() {
  const { muted } = useUi()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target as HTMLElement | null
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
        bridge.inst?.setMuted(!muted)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [muted])

  return (
    <header className="chrome">
      <span className="chrome-name">Claude Sonnet 5.5</span>
      <button
        type="button"
        className="chrome-sound"
        aria-pressed={!muted}
        onClick={() => bridge.inst?.setMuted(!muted)}
        title="聲音（M）"
      >
        <span aria-hidden="true">{muted ? '聲音 · 關' : '聲音 · 開'}</span>
        <span className="sr-only">{muted ? '開啟聲音' : '關閉聲音'}</span>
      </button>
    </header>
  )
}
