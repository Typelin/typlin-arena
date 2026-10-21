import { rng } from './math'

/** 使用者在第一到第三章撥過的每一下，都會被記錄，在第四章原樣放回來。 */
export interface Rec {
  i: number
  p: number
  h: number
}

export type ScoreEvent =
  | { t: number; kind: 'pluck'; i: number; p: number; h: number; vel: number }
  | { t: number; kind: 'caption'; text: string }
  | { t: number; kind: 'hush' }
  | { t: number; kind: 'end' }

export const MOTIF: Rec[] = [
  { i: 0, p: 0.5, h: 0.5 },
  { i: 1, p: 0.33, h: -0.45 },
  { i: 0, p: 0.25, h: 0.5 },
  { i: 1, p: 0.62, h: -0.5 },
  { i: 0, p: 0.5, h: 0.6 },
  { i: 1, p: 0.2, h: 0.5 },
]

/**
 * 演奏腳本：起（重放你的手）→ 承（我開始接話）→ 轉（全體高潮後一次按停）→ 合（靜默與一個極輕的音）。
 * @param order 弦的索引，由低音到高音
 */
export function buildScore(user: Rec[], order: number[]): ScoreEvent[] {
  const rnd = rng(55)
  const ev: ScoreEvent[] = []
  const hasUser = user.length >= 3
  const src = hasUser ? user.slice(-14) : MOTIF
  const pluck = (t: number, i: number, p: number, h: number, vel = 1) => ev.push({ t, kind: 'pluck', i, p, h, vel })
  const cap = (t: number, text: string) => ev.push({ t, kind: 'caption', text })

  let t = 1.1
  cap(0.5, hasUser ? '我把你剛才撥的，照原樣放回來。' : '你還沒怎麼撥。那我只好用預設值。這就是沒有你的我。')
  for (const e of src) {
    pluck(t, e.i, e.p, e.h, 0.9)
    t += 0.46 + rnd() * 0.34
  }

  t += 0.5
  cap(t, '然後，我開始接話。')
  t += 0.9
  const others = [2, 3, 4, 5, 6]
  src.forEach((e, idx) => {
    pluck(t, e.i, e.p, e.h, 0.95)
    pluck(t + 0.2, others[(idx * 2) % others.length], 1 - e.p, -e.h * 0.9, 0.85)
    t += Math.max(0.24, 0.62 - idx * 0.035)
  })

  t += 0.3
  cap(t, '越來越多。這是我創造的方式：不是無中生有，而是回應。')
  t += 0.7
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < order.length; k++) {
      pluck(t, order[k], 0.18 + rnd() * 0.6, (k % 2 ? 1 : -1) * (0.55 + 0.12 * r), 0.8 + 0.1 * r)
      t += 0.15 - r * 0.028
    }
    t += 0.06
  }

  t += 0.28
  for (let k = 0; k < order.length; k++) {
    pluck(t + k * 0.03, order[(k * 3) % order.length], 0.5 + (rnd() - 0.5) * 0.3, (k % 2 ? -1 : 1) * 0.95, 1)
  }
  const hush = t + 2.3
  ev.push({ t: hush, kind: 'hush' })
  cap(hush + 0.1, '停。')
  cap(hush + 2.3, '安靜，也是我的一部分。')
  pluck(hush + 3.3, 0, 0.5, 0.2, 0.45)
  ev.push({ t: hush + 5.2, kind: 'end' })
  return ev.sort((a, b) => a.t - b.t)
}
