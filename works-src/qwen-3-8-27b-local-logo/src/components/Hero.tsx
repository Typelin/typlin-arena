import Petals from './Petals'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`

/** Deterministic PRNG so star positions are stable across renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STARS = (() => {
  const rnd = mulberry32(20260415)
  return Array.from({ length: 26 }, () => ({
    left: rnd() * 100,
    top: rnd() * 78,
    size: 1 + rnd() * 1.6,
    delay: rnd() * 6,
    duration: 3 + rnd() * 5,
  }))
})()

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
      <Petals />
      <p className="hero-vertical" aria-hidden="true">
        夜樱 · 代码 · 梦境
      </p>
      <div className="hero-inner">
        <div className="hero-logo-wrap">
          <img
            src={LOGO_SRC}
            alt="咲林梦 SAKIMU TECH STUDIO — 用代码创造美好未来"
            width={800}
            height={800}
            className="hero-logo"
          />
        </div>
        <a className="scroll-cue" href="#about" aria-label="向下滚动，了解更多">
          <span className="scroll-cue-line" />
          <span className="scroll-cue-text">向下探索</span>
        </a>
      </div>
    </section>
  )
}
