export interface Vec {
  x: number
  y: number
}

/** A candidate word at a fork — live while the fork is open, frozen as a ghost afterwards. */
export interface CandState {
  w: string
  weight: number
  invented: boolean
  width: number
  /** Ring position: 0 centre, then -1, +1, -2, +2 … */
  ord: number
  x: number
  y: number
  ty: number
  /** Displayed probability (smoothed) and its target. */
  p: number
  pt: number
  /** Display scale and alpha (smoothed). */
  s: number
  a: number
  /** 0..1 share of this word's pull that comes from the visitor. */
  bias: number
  /** How many times the ink tip visited this word while deciding. */
  votes: number
}

export interface RiverNode {
  index: number
  chapter: number
  slotInChapter: number
  word: string
  width: number
  x: number
  y: number
  row: number
  newRow: boolean
  prevEnd: Vec
  fork: boolean
  cands: CandState[]
  chosen: number
  p: number
  /** Chosen differently than the river would have without the visitor. */
  mine: boolean
  invented: boolean
  T: number
  bornAt: number
  s0: number
  /** Erosion 0..1 (smoothed). */
  e: number
  stampAt: number
  tilt: number
}

export interface OpenSlot {
  g: number
  c: number
  i: number
  fork: boolean
  x: number
  yc: number
  row: number
  newRow: boolean
  prevEnd: Vec
  cands: CandState[]
  needleY: number
  needleV: number
  glance: number
  nextGlance: number
  commitAt: number | null
  decideAt: number | null
  decided: number | null
  mine: boolean
  pinned: number | null
  born: number
}

export interface Fossil {
  pts: number[]
  word: string
  x: number
  y: number
  mine: boolean
  at: number
}

export interface Camera {
  /** World point placed at the anchor. */
  fx: number
  fy: number
  s: number
  /** Screen anchor. */
  ax: number
  ay: number
}

export interface Token {
  w: string
  mine: boolean
  invented: boolean
}

export interface Hover {
  x: number
  y: number
  word: string
  p: number
  prefix: string
  invented: boolean
}

/** Values that change every scroll frame: delivered straight to DOM styles, never through React. */
export interface FrameInfo {
  hero: number
  titleChapter: number
  titleU: number
  finaleU: number
  heat: number
  forkX: number
  forkY: number
}

export interface Snapshot {
  forkX: number
  forkY: number
  ready: boolean
  hero: number
  chapter: number
  titleChapter: number
  titleU: number
  finaleU: number
  T: number
  heat: number
  influence: number
  invented: number
  rewinds: number
  written: number
  forks: number
  revealInfluence: boolean
  transcriptChapter: number
  transcript: Token[]
  hover: Hover | null
  keyboard: boolean
  sound: boolean
  soundPending: boolean
  done: boolean
  progress: number
  announce: string
}

/** A point of the visitor's pointer path, in world space. */
export interface TrailPoint {
  x: number
  y: number
  t: number
}

/** A speck of silt drifting off an eroded word. */
export interface Silt {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  r: number
}

/** One channel of the delta at the river's mouth. */
export interface DeltaSeg {
  x0: number
  y0: number
  c1x: number
  c1y: number
  c2x: number
  c2y: number
  x1: number
  y1: number
  depth: number
  /** 0..1: when in the growth this channel appears. */
  at: number
  w: number
  mine: boolean
}
