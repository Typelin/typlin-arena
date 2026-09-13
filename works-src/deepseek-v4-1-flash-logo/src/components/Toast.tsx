import { useEffect, useState } from 'react'
import { TOAST_EVENT } from '../lib/toast'
import type { ToastDetail, ToastTone } from '../lib/toast'

type Item = {
  id: number
  message: string
  tone: ToastTone
}

let sequence = 0

export function Toast() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail
      if (!detail?.message) return

      const id = ++sequence
      setItems((prev) => [
        ...prev.slice(-1),
        { id, message: detail.message, tone: detail.tone ?? 'sakura' },
      ])

      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }, 4600)
    }

    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((item) => (
        <p key={item.id} className={`toast toast--${item.tone}`}>
          <span className="toast__mark" aria-hidden="true" />
          <span>{item.message}</span>
        </p>
      ))}
    </div>
  )
}
