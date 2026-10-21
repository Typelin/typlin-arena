import type { Instrument } from './instrument'

/** React 元件呼叫引擎的唯一入口 */
export const bridge: { inst: Instrument | null } = { inst: null }
