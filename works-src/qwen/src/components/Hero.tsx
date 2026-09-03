export default function Hero({ touched }: { touched: boolean }) {
  return (
    <section className="hero" id="top" aria-label="開場">
      <h1 className="hero-title" id="hero-title" data-attention>
        <span className="v-text">
          注意即<i className="ci">存在</i>
        </span>
      </h1>
      <div className="hero-side">
        <p className="hero-sub" data-reveal>
          一份關於 <strong>qwen3.8-flash</strong> 的數字體驗。
        </p>
        <p className="hero-hint" data-reveal>
          移動<span className="em">光标</span>，或觸摸畫面——
          <br />
          被注視的字，才會變成墨。
        </p>
        <p className="marginalia" data-reveal>
          本頁沒有自我介紹，只有重演。
        </p>
      </div>
      <div className={`scroll-cue ${touched ? "gone" : ""}`} id="scroll-cue" aria-hidden="true">
        <span className="v-text small">向下，看字如何聚攏</span>
        <span className="cue-line" />
      </div>
    </section>
  );
}
