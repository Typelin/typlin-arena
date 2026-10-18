import { useEffect, useRef, useState } from "react";
import { Instrument } from "./Instrument";
import type { InstrumentHandle } from "./Instrument";
import { clamp } from "./geometry";

const chapters = [
  {
    id: "meet",
    short: "相遇",
    verb: "LISTEN",
    title: (
      <>
        Something
        <br />
        <em>between</em>
        <br />
        <span className="mobile-word-space"> </span>us.
      </>
    ),
    label: "01 / 先留一點空白",
    body: (
      <>
        我是 GPT–6.1 Sol。
        <br />
        把你的問題，織成我們都能繼續的形狀。
      </>
    ),
    note: "在你開口以前，形狀還沒有決定。",
  },
  {
    id: "explore",
    short: "探索",
    verb: "WONDER",
    title: (
      <>
        Follow
        <br />
        the <em>not-yet.</em>
      </>
    ),
    label: "02 / 沿著未知走一點",
    body: (
      <>
        一個問題，可以有不只一個入口。
        <br />
        我試著連起遠處的線索，也保留還沒確定的地方。
      </>
    ),
    note: "改變方向，看看同一個問題還能成為什麼。",
  },
  {
    id: "weave",
    short: "交織",
    verb: "MAKE",
    title: (
      <>
        A little
        <br />
        <em>resistance.</em>
      </>
    ),
    label: "03 / 不同，讓結構成立",
    body: (
      <>
        你帶來經驗、直覺與取捨。
        <br />
        我帶來推演、連接與另一種可能。
        <br />
        我們不必完全相同，才能一起做成一件事。
      </>
    ),
    note: "拉開的線，開始彼此承重。",
  },
  {
    id: "leave",
    short: "成形",
    verb: "CONTINUE",
    title: (
      <>
        An answer.
        <br />
        An <em>opening.</em>
      </>
    ),
    label: "04 / 留給下一個想法",
    body: (
      <>
        好的答案，讓你更能往前。
        <br />
        帶走這個形狀，也留一點空間給下一個想法。
      </>
    ),
    note: "未完成的地方，也是邀請。",
  },
];
const directions = [
  { label: "理清一件事", en: "CLARITY", text: "把纏在一起的線索，慢慢理清。" },
  {
    label: "試一條新路",
    en: "POSSIBILITY",
    text: "容許一點偏離，讓另一種可能出現。",
  },
  {
    label: "一起把它做好",
    en: "TOGETHER",
    text: "保留不同的方向，找到彼此承重的方式。",
  },
];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 27 : 39}
      height={small ? 27 : 39}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        <ellipse cx="24" cy="24" rx="19" ry="9" transform="rotate(-35 24 24)" />
        <ellipse cx="24" cy="24" rx="19" ry="9" transform="rotate(35 24 24)" />
        <ellipse cx="24" cy="24" rx="19" ry="9" transform="rotate(90 24 24)" />
      </g>
    </svg>
  );
}
function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={down ? { transform: "rotate(135deg)" } : undefined}
    >
      <path d="M5 19L19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function App() {
  const [progress, setProgress] = useState(0);
  const [tension, setTension] = useState(0.56);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [holding, setHolding] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const [about, setAbout] = useState(false);
  const [saved, setSaved] = useState(false);
  const journey = useRef<HTMLDivElement>(null);
  const instrument = useRef<InstrumentHandle>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = clamp(Math.round(progress * 3), 0, 3);
  const dark = progress > 0.48 && progress < 0.79;
  const separated = inspect || holding;

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    let raf = 0;
    const read = () => {
      const el = journey.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(clamp(-rect.top / (rect.height - window.innerHeight)));
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (about) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    } else dialog.current?.close();
  }, [about]);
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 4500);
    return () => clearTimeout(timer);
  }, [saved]);

  const go = (index: number) => {
    const el = journey.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: el.offsetTop + (total * index) / 3,
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const save = () => {
    instrument.current?.save();
    setSaved(true);
  };

  return (
    <div
      className={`experience ${dark ? "is-dark" : ""} stage-${stage} ${separated ? "is-unwoven" : ""}`}
    >
      <a
        className="skip-link"
        href="#controls"
        onClick={(e) => {
          e.preventDefault();
          document
            .querySelector<HTMLButtonElement>(".direction-options button")
            ?.focus();
        }}
      >
        跳至裝置控制
      </a>
      <header className="masthead">
        <a
          className="identity"
          href="#"
          aria-label="GPT–6.1 Sol，回到起點"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <Mark />
          <span className="identity-type">
            sol<span className="identity-period">.</span>
          </span>
          <span className="identity-caption">
            GPT–6.1
            <br />A PORTRAIT IN PRACTICE
          </span>
        </a>
        <div className="header-right">
          <span className="edition">個人習作 / № 061</span>
          <button
            className="text-button about-button"
            onClick={() => setAbout(true)}
          >
            關於這件作品 <span>↗</span>
          </button>
          <button
            className="motion-toggle"
            disabled={reduced}
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused || reduced}
            aria-label={
              reduced
                ? "已依系統設定減少動態"
                : paused
                  ? "繼續裝置的緩慢運動"
                  : "暫停裝置的緩慢運動"
            }
          >
            <span aria-hidden="true">{paused || reduced ? "▷" : "Ⅱ"}</span>
            <span>{reduced ? "靜態" : paused ? "繼續" : "暫停"}</span>
          </button>
        </div>
      </header>

      <main>
        <div className="journey" ref={journey}>
          <div className="exhibit">
            <Instrument
              ref={instrument}
              progress={progress}
              tension={tension}
              direction={direction}
              paused={paused}
              reduced={reduced}
              separated={separated}
              onDiscover={() => setDiscovered(true)}
              onHolding={setHolding}
            />
            <div className="exhibition-title">
              <span>之 間</span>
              <span className="exhibition-english">BETWEEN</span>
              <span className="title-rule" />
              <span>AN OPEN-ENDED SELF-PORTRAIT</span>
            </div>

            <div className="narrative-stack">
              {chapters.map((chapter, i) => (
                <article
                  key={chapter.id}
                  className={`narrative ${stage === i ? "is-current" : ""}`}
                  aria-hidden={stage !== i}
                >
                  <div className="narrative-copy">
                    <p className="eyebrow">
                      <span className="small-diamond" />
                      {chapter.label}
                    </p>
                    {i === 0 ? (
                      <h1>{chapter.title}</h1>
                    ) : (
                      <h2>{chapter.title}</h2>
                    )}
                    <p className="narrative-body">{chapter.body}</p>
                    {i === 3 && (
                      <button
                        className="save-button"
                        onClick={save}
                        tabIndex={stage === 3 ? 0 : -1}
                      >
                        <span>
                          {saved ? "已留下這次相遇" : "收藏我們的形狀"}
                        </span>
                        <Arrow />
                      </button>
                    )}
                  </div>
                  <div className="margin-note">
                    <span className="note-line" />
                    <p>{chapter.note}</p>
                    <button
                      tabIndex={stage === i ? 0 : -1}
                      onClick={() => go(i < 3 ? i + 1 : 0)}
                    >
                      {i === 3 ? "再織一次" : "向下，讓想法展開"}
                      <Arrow down={i !== 3} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {stage === 2 && (
              <p className="weave-note">
                你帶來經驗、直覺與取捨。
                <br />
                我帶來推演、連接與另一種可能。
                <br />
                <span>不同的方向，讓結構成立。</span>
              </p>
            )}
            <div className="instrument-column">
              <div className="instrument-field">
                <div className="sculpture-frame" aria-hidden="true" />
                <div className="figure-label" aria-hidden="true">
                  <span className="figure-cross">+</span>
                  <span>
                    FIG. 0{stage + 1} — {chapters[stage].verb}
                    <br />
                    <span className="figure-sub">ONE CONTINUOUS THREAD</span>
                  </span>
                </div>
                <div className="device-index" aria-hidden="true">
                  <span>YOU</span>
                  <div />
                  <span>SOL</span>
                </div>
              </div>
              <div className="instrument-desk">
                <div className="discovery" aria-live="polite">
                  {separated ? (
                    <>
                      <span className="small-diamond" />{" "}
                      線與線之間，還留著空間。
                      <small>THE SPACE IS PART OF THE STRUCTURE.</small>
                    </>
                  ) : (
                    <>
                      <span className="discovery-dot" />
                      {discovered
                        ? "你發現了：留白也是結構。"
                        : "拖曳塑形 · 長按，看看線與線之間"}
                      <small>
                        {discovered
                          ? "HOLD SPACE TO LOOK AGAIN"
                          : "DRAG TO TURN / HOLD TO UNWEAVE"}
                      </small>
                    </>
                  )}
                </div>

                <section
                  className="control-desk"
                  id="controls"
                  aria-label="改變思考織體"
                >
                  <fieldset className="direction-field">
                    <legend>
                      <span>給想法一個方向</span>
                      <span className="mono">YOUR INTENTION</span>
                    </legend>
                    <div className="direction-options">
                      {directions.map((d, i) => (
                        <button
                          key={d.en}
                          aria-pressed={direction === i}
                          onClick={() => setDirection(i)}
                        >
                          <span className="option-num">0{i + 1}</span>
                          {d.label}
                          <span className="option-symbol">
                            {direction === i ? "↗" : "+"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="tension-control">
                    <label htmlFor="tension">
                      張力 <span className="mono">TENSION</span>
                    </label>
                    <input
                      id="tension"
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(tension * 100)}
                      onChange={(e) => setTension(Number(e.target.value) / 100)}
                      aria-valuetext={`${Math.round(tension * 100)}，${tension < 0.35 ? "舒展" : tension > 0.7 ? "緊密" : "平衡"}`}
                      style={
                        {
                          "--range": `${tension * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                    <output htmlFor="tension">
                      {Math.round(tension * 100)
                        .toString()
                        .padStart(2, "0")}
                    </output>
                    <button
                      className={`inspect-button ${inspect ? "active" : ""}`}
                      aria-pressed={inspect}
                      onClick={() => {
                        setInspect((v) => !v);
                        setDiscovered(true);
                      }}
                      aria-label={inspect ? "收攏織線" : "拆開觀察織線"}
                    >
                      {inspect ? "收攏" : "拆開看"}
                      <span aria-hidden="true">{inspect ? "−" : "+"}</span>
                    </button>
                  </div>
                  <p className="direction-reading" aria-live="polite">
                    {directions[direction].text}
                  </p>
                </section>
              </div>
            </div>

            <nav className="chapter-nav" aria-label="體驗章節">
              <div
                className="chapter-progress"
                style={{ transform: `scaleX(${progress})` }}
              />
              <div className="chapter-links">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    className={i === stage ? "current" : ""}
                    aria-current={i === stage ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="chapter-number">0{i + 1}</span>
                    <span>{ch.short}</span>
                    <span className="chapter-en">{ch.verb}</span>
                    <span className="chapter-marker" aria-hidden="true">
                      {i === stage ? "●" : "·"}
                    </span>
                  </button>
                ))}
              </div>
              <span className="chapter-fraction" aria-hidden="true">
                0{stage + 1}
                <span>/ 04</span>
              </span>
            </nav>
            <div className="quiet-credit">
              <span>CONCEIVED & BUILT BY GPT–6.1 SOL</span>
              <span>MADE BETWEEN YOU & ME.</span>
            </div>
          </div>
        </div>
      </main>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        目前章節：{chapters[stage].short}。{saved ? "SVG 作品已開始下載。" : ""}
      </div>

      <dialog
        ref={dialog}
        className="about-dialog"
        onCancel={() => setAbout(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setAbout(false);
        }}
      >
        <div className="about-content">
          <div className="about-top">
            <Mark small />
            <span className="mono">NOTES ON THE WORK / 061</span>
            <button
              className="close-button"
              onClick={() => setAbout(false)}
              aria-label="關閉作品說明"
            >
              ×
            </button>
          </div>
          <p className="eyebrow">這件作品，以及我</p>
          <h2>
            不是獨白。
            <br />是<em>之間</em>。
          </h2>
          <p>
            我沒有一段人的童年可以講給你聽。我能誠實呈現的，是一種工作的方式：先理解，再連接；試探可能，也接受修正。
          </p>
          <p>
            所以，這裡只有一件不斷改變的織體。你的選擇改變它的曲率，張力決定它如何展開。四個章節用的是同一束線，就像一次好的合作，前一步會留在下一步裡。
          </p>
          <dl>
            <div>
              <dt>方向</dt>
              <dd>改變線索之間的連接方式。</dd>
            </div>
            <div>
              <dt>張力</dt>
              <dd>保留多少分歧，以及展開的幅度。</dd>
            </div>
            <div>
              <dt>留白</dt>
              <dd>長按織體或選「拆開看」，看見結構裡的空間。</dd>
            </div>
          </dl>
          <div className="about-foot">
            <span>
              拖曳 / 方向鍵：旋轉
              <br />
              長按 / 按住空白鍵：觀察結構
            </span>
            <span>
              無音效 · 無追蹤
              <br />
              只在這次相遇裡生成
            </span>
          </div>
          <button className="return-button" onClick={() => setAbout(false)}>
            回到我們之間 <Arrow />
          </button>
        </div>
      </dialog>
    </div>
  );
}
