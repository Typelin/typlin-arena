import type { PetalField } from './petals'

/** 组件之间共享的一把引擎引用：按钮可以让花瓣从自己身上落下来 */
export const bridge: { field: PetalField | null } = { field: null }

export const shedFrom = (el: Element | null, n = 18) => {
  if (!el || !bridge.field) return
  const r = el.getBoundingClientRect()
  bridge.field.shed(r.left + r.width / 2, r.top + r.height / 2, n)
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
