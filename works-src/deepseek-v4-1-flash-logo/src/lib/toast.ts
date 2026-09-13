export type ToastTone = 'sakura' | 'iris' | 'ink'

export type ToastDetail = {
  message: string
  tone?: ToastTone
}

export const TOAST_EVENT = 'sakimu:toast'

/**
 * Fire-and-forget notification channel. Any component can post a line without
 * threading state through the tree; <Toast /> listens and renders the stack.
 */
export function toast(message: string, tone: ToastTone = 'sakura') {
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, tone } }),
  )
}
