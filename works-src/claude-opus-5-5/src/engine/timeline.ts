/**
 * Scroll is time. The page is a sequence of beats; scrolling past a slot beat
 * allows the river to commit that word, scrolling back un-writes it.
 */

export type BeatKind = 'title' | 'slot' | 'finale'

export interface Beat {
  kind: BeatKind
  chapter: number
  /** Global slot index (slot beats only). */
  slot: number
  start: number
  len: number
}

export interface TimelineQuery {
  /** Number of slots the river may have committed at this scroll position. */
  target: number
  /** Chapter of the beat under the scroll position. */
  chapter: number
  /** Chapter whose title beat is active, or -1. */
  titleChapter: number
  titleU: number
  finaleU: number
  /** True once the title beat of chapter c has been fully passed. */
  passedTitle: (c: number) => boolean
}

const LEN = {
  fork: 128,
  fixed: 34,
  title: 520,
  /** Chapter IV: the influence reveal. */
  titleReveal: 820,
  /** Chapter V: the key transition — erosion. */
  titleKey: 1250,
  finale: 1500,
}

/** Commit happens 30% into a slot beat. */
const COMMIT_AT = 0.3

export class Timeline {
  beats: Beat[] = []
  total = 0
  /** Scroll position at which slot g commits. */
  commitPos: number[] = []
  private titleEnd = new Map<number, number>()

  constructor(counts: number[], isFork: (c: number, i: number) => boolean) {
    let y = 0
    let g = 0
    // The opening run of fixed words is written on load (zero-length beats).
    let lead = true
    counts.forEach((n, c) => {
      if (c > 0) {
        const len = c === 4 ? LEN.titleKey : c === 3 ? LEN.titleReveal : LEN.title
        this.beats.push({ kind: 'title', chapter: c, slot: -1, start: y, len })
        y += len
        this.titleEnd.set(c, y)
      }
      for (let i = 0; i < n; i++) {
        const fork = isFork(c, i)
        if (fork) lead = false
        const len = lead ? 0 : fork ? LEN.fork : LEN.fixed
        this.beats.push({ kind: 'slot', chapter: c, slot: g, start: y, len })
        this.commitPos[g] = y + len * COMMIT_AT
        y += len
        g++
      }
    })
    this.beats.push({ kind: 'finale', chapter: counts.length - 1, slot: -1, start: y, len: LEN.finale })
    y += LEN.finale
    this.total = y
  }

  get leadCount(): number {
    return this.beats.filter((b) => b.kind === 'slot' && b.len === 0).length
  }

  query(scroll: number): TimelineQuery {
    let target = 0
    let chapter = 0
    let titleChapter = -1
    let titleU = 0
    let finaleU = 0
    for (const b of this.beats) {
      if (b.kind === 'slot') {
        if (scroll >= b.start + b.len * COMMIT_AT) target = b.slot + 1
      }
      if (scroll >= b.start) {
        chapter = b.chapter
        if (b.kind === 'title' && scroll < b.start + b.len) {
          titleChapter = b.chapter
          titleU = (scroll - b.start) / b.len
        }
        if (b.kind === 'finale') finaleU = Math.min(1, (scroll - b.start) / b.len)
      }
    }
    return {
      target,
      chapter,
      titleChapter,
      titleU,
      finaleU,
      passedTitle: (c) => scroll >= (this.titleEnd.get(c) ?? 0),
    }
  }
}
