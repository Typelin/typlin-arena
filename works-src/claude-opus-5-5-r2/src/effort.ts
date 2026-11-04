// One effort level shared by the dial and the AA chart, so choosing a level in
// either place moves both.
type Fn = () => void

let level = 1
const subs = new Set<Fn>()

export const effortStore = {
  get: () => level,
  set(v: number) {
    if (v === level) return
    level = v
    subs.forEach((f) => f())
  },
  subscribe(f: Fn) {
    subs.add(f)
    return () => {
      subs.delete(f)
    }
  },
}
