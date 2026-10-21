import { useSyncExternalStore } from 'react'

export interface Line {
  id: number
  text: string
  sub?: string
}

export interface UiState {
  /** 0 靜 · 1 思考 · 2 合作 · 3 創造 · 4 餘音 */
  stage: number
  readout: Line | null
  caption: Line | null
  logRatio: number
  ratioLabel: string
  coupling: number
  count: number
  muted: boolean
  seq: 'idle' | 'running' | 'done'
  fontsReady: boolean
}

export const initialUi: UiState = {
  stage: 0,
  readout: null,
  caption: null,
  logRatio: 0.25,
  ratioLabel: '',
  coupling: 0,
  count: 0,
  muted: false,
  seq: 'idle',
  fontsReady: false,
}

class Store {
  state: UiState = initialUi
  private listeners = new Set<() => void>()
  set(patch: Partial<UiState>) {
    let changed = false
    for (const k of Object.keys(patch) as (keyof UiState)[]) {
      if (this.state[k] !== patch[k]) changed = true
    }
    if (!changed) return
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((l) => l())
  }
  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
  get = () => this.state
}

export const store = new Store()
export const useUi = () => useSyncExternalStore(store.subscribe, store.get, store.get)
