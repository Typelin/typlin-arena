import Reveal from './Reveal'
import SecHead from './SecHead'

const ITEMS = [
  {
    ch: '夢',
    en: 'DREAM',
    t: '從一個畫面開始',
    d: '一切始於使用者微笑的瞬間。我們先認真做夢，把畫面寫成清楚的需求，再動工。',
  },
  {
    ch: '碼',
    en: 'CODE',
    t: '工藝是我們的手感',
    d: '乾淨的架構、穩定的測試、毫秒級的講究。工程不是魔法，是一刀一刀的雕琢。',
  },
  {
    ch: '咲',
    en: 'BLOOM',
    t: '上線，是盛開的開始',
    d: '發佈不是結束。我們陪產品走過每一個花期：迭代、修剪，然後再一次綻放。',
  },
]

export default function Philosophy() {
  return (
    <section className="sec" id="philosophy">
      <div className="wrap">
        <SecHead no="01" zh="理念" en="PHILOSOPHY" />
        <div className="ph-lead">
          <Reveal>
            <p className="ph-statement">
              「夢」是想像的形狀，
              <br />
              <em>「咲」是綻放的聲音。</em>
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="ph-copy">
              我們相信，好的軟體像花一樣——需要時間醞釀，也需要細心修剪。
              當想像遇上工藝，代碼便會開花，長成被人記住的產品。
            </p>
          </Reveal>
        </div>
        <div className="cards-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.ch} delay={i * 120} className="card ph-card">
              <span className="ph-ch">{it.ch}</span>
              <span className="ph-en">{it.en}</span>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
