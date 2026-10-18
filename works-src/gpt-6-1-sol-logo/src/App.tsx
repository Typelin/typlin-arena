import { useEffect, useRef, useState } from "react";
import { Arrow, Bloom, ProjectArt } from "./Graphics";
import { HeroGarden } from "./HeroGarden";
import { BriefForm } from "./BriefForm";
import { projects, questions, services } from "./data";
import type { Project } from "./data";
const logo = `${import.meta.env.BASE_URL}logo.png`;
const process = [
  {
    title: "先把問題，聊清楚。",
    text: "理解你想做的事、面對的人，以及這次最希望改變什麼。先找到值得做的方向。",
    label: "聊聊想法",
    en: "DISCOVER",
    items: ["目標與使用者", "內容與現況", "範圍與優先順序"],
  },
  {
    title: "讓想像，有個共同的樣子。",
    text: "從視覺方向、內容架構到互動原型，在投入開發前，先一起看見將要完成的樣子。",
    label: "定下方向",
    en: "DEFINE",
    items: ["網站架構", "視覺提案", "互動原型"],
  },
  {
    title: "把每個細節，接起來。",
    text: "將設計變成真正能操作的頁面。邊做邊確認，讓每個尺寸與使用情境都被照顧。",
    label: "動手實作",
    en: "BUILD",
    items: ["元件與頁面", "響應式實作", "可用性確認"],
  },
  {
    title: "好好完成，也好好交到你手上。",
    text: "一起檢查內容、操作與不同裝置的表現。整理交付與使用說明，讓作品有一個穩定的起點。",
    label: "打磨交付",
    en: "REFINE",
    items: ["內容與功能測試", "不同裝置驗證", "交付與使用說明"],
  },
];

export function App() {
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [step, setStep] = useState(0);
  const [faq, setFaq] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const [briefKind, setBriefKind] = useState("品牌網站");
  const dialog = useRef<HTMLDialogElement>(null);
  const isOpen = selected !== null;
  useEffect(() => {
    if (!isOpen) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);
  useEffect(() => {
    if (!menu) return;
    document
      .querySelector<HTMLAnchorElement>(".site-nav a")
      ?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        document
          .querySelector<HTMLButtonElement>(".menu-toggle")
          ?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);
  const begin = (kind?: string) => {
    if (kind) setBriefKind(kind);
    setSelected(null);
    setMenu(false);
    window.setTimeout(
      () =>
        document.querySelector("#start")?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        }),
      0,
    );
  };
  return (
    <>
      <a href="#main" className="skip-link">
        跳至主要內容
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="咲夢工作室，回到首頁">
          <img src={logo} width="64" height="64" alt="咲夢 LOGO" />
          <span>
            <strong>
              咲夢<span>工作室</span>
            </strong>
            <small>SAKIMU TECH STUDIO</small>
          </span>
        </a>
        <nav
          className={menu ? "site-nav open" : "site-nav"}
          aria-label="主要導覽"
        >
          <a href="#work" onClick={() => setMenu(false)}>
            精選作品
          </a>
          <a href="#services" onClick={() => setMenu(false)}>
            我們擅長
          </a>
          <a href="#process" onClick={() => setMenu(false)}>
            合作方式
          </a>
          <a href="#questions" onClick={() => setMenu(false)}>
            常見問題
          </a>
          <button className="mobile-start" onClick={() => begin()}>
            聊聊你的想法 ↗
          </button>
        </nav>
        <button className="header-cta" onClick={() => begin()}>
          聊聊你的想法
          <Arrow />
        </button>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-label={menu ? "關閉導覽" : "開啟導覽"}
          onClick={() => setMenu((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      <main id="main">
        <section className="hero section-shell" id="top">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="little-star">✳</span>把好想法，變成真實的日常
              <span className="eyebrow-line" />
            </div>
            <h1>
              讓好想法，
              <br />
              有處
              <span className="bloom-word">
                盛開
                <svg viewBox="0 0 260 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 15C74 1 175 2 254 14M18 21C80 10 174 11 222 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              。
            </h1>
            <p className="hero-description">
              我們是咲夢，一個把設計與程式放在一起的小工作室。
              <br className="desktop-br" />
              從品牌網站到順手的數位工具，
              <br className="desktop-br" />
              陪你把「如果可以」，做成「真的可以」。
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => begin()}>
                一起做點有意思的事
                <Arrow />
              </button>
              <a className="text-link" href="#work">
                先看看作品
                <Arrow down />
              </a>
            </div>
            <div className="hero-service-switch" aria-label="探索工作室服務">
              {services.map((s, i) => (
                <button
                  key={s.id}
                  className={active === i ? "active" : ""}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                >
                  <span>{s.number}</span>
                  {s.label}
                  <i>{active === i ? "↗" : "·"}</i>
                </button>
              ))}
            </div>
            <div className="hero-signature">
              <span className="small-cross">+</span>
              <span>有溫度的設計，有把握的實作。</span>
              <small>DESIGN × DEVELOPMENT</small>
            </div>
          </div>
          <HeroGarden active={active} onChange={setActive} />
        </section>

        <div className="studio-ribbon">
          <div>
            <Bloom />
            <span>
              一點浪漫，<strong>加上認真。</strong>
            </span>
            <i />
            <p>GOOD DESIGN. THOUGHTFUL CODE. A LITTLE SAKURA.</p>
            <span className="ribbon-end">從想法，到上線 ↗</span>
          </div>
        </div>

        <section className="work-section section-shell section-space" id="work">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span />
                SELECTED DIRECTIONS / 01
              </span>
              <h2>
                好的想法，
                <br />
                可以長成這些模樣。
              </h2>
            </div>
            <div className="section-heading-aside">
              <p>
                幾個不同的出發點，
                <br />
                同樣在意每一次使用的感受。
              </p>
              <div className="work-filters" aria-label="篩選概念作品">
                {[
                  { id: "all", label: "全部" },
                  { id: "web", label: "品牌網站" },
                  { id: "tools", label: "數位工具" },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={filter === f.id ? "active" : ""}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                  >
                    {f.label}
                    <span>
                      {f.id === "all" ? "03" : f.id === "web" ? "02" : "01"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`projects-grid ${filter !== "all" ? "filtered" : ""}`}
          >
            {projects
              .filter((p) => filter === "all" || p.kind === filter)
              .map((p) => (
                <article key={p.id} className={`project-card project-${p.id}`}>
                  <button
                    className="project-open"
                    onClick={() => setSelected(p)}
                    aria-label={`查看${p.name}概念作品`}
                  >
                    <div className="project-visual">
                      <ProjectArt theme={p.theme} />
                      <span className="project-view">
                        <Arrow />
                      </span>
                    </div>
                    <div className="project-info">
                      <div className="project-meta">
                        <span>{p.category}</span>
                        <span>{p.year}</span>
                      </div>
                      <h3>
                        {p.name}
                        <Arrow />
                      </h3>
                      <p>{p.subtitle}</p>
                    </div>
                  </button>
                </article>
              ))}
          </div>
          <p className="concept-note">
            <span />
            以上為工作室概念展示，用不同題目探索設計與開發的可能。
          </p>
        </section>

        <section className="services-section" id="services">
          <div className="section-shell services-grid">
            <div className="services-intro">
              <span className="section-kicker">
                <span />
                WHAT WE CAN MAKE / 02
              </span>
              <h2>
                不只是好看。
                <br />
                也要<span>真的好用。</span>
              </h2>
              <p>
                設計負責讓人想靠近，
                <br />
                程式負責讓每一步都走得順。
                <br />
                我們把兩件事，當成同一件事來做。
              </p>
              <div className="craft-mark" aria-hidden="true">
                <span>Aa</span>
                <Bloom />
                <span>&lt;/&gt;</span>
                <i>FEELING + FUNCTION</i>
              </div>
            </div>
            <div className="service-list">
              {services.map((s, i) => (
                <div
                  key={s.id}
                  className={`service-row ${active === i ? "active" : ""}`}
                >
                  <button
                    className="service-toggle"
                    aria-expanded={active === i}
                    aria-controls={`service-panel-${i}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="service-number">{s.number}</span>
                    <span>
                      <strong>{s.label}</strong>
                      <small>{s.en}</small>
                    </span>
                    <b>{active === i ? "−" : "+"}</b>
                  </button>
                  <div
                    className="service-panel"
                    id={`service-panel-${i}`}
                    hidden={active !== i}
                  >
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                    <div className="service-tags">
                      {s.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <button
                      className="text-link"
                      onClick={() =>
                        begin(s.label === "網站體驗" ? "品牌網站" : s.label)
                      }
                    >
                      從這個方向開始
                      <Arrow />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="process-section section-shell section-space"
          id="process"
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span />A SHARED PROCESS / 03
              </span>
              <h2>
                先聊想法，
                <br />
                再一起動手。
              </h2>
            </div>
            <p>
              不把合作變成一場猜測。
              <br />
              每個階段，都知道我們正在往哪裡走。
            </p>
          </div>
          <div className="process-grid">
            <div className="process-board">
              <div className="board-top">
                <span>SAKIMU / PROJECT NOTES</span>
                <span className="board-date">A GOOD IDEA, IN PROGRESS.</span>
              </div>
              <div className="board-title">
                <span>0{step + 1}</span>
                <h3>{process[step].title}</h3>
              </div>
              <div className="board-checklist">
                {process[step].items.map((item, i) => (
                  <div key={item}>
                    <span>✓</span>
                    <p>{item}</p>
                    <small>0{i + 1}</small>
                  </div>
                ))}
              </div>
              <div className="board-bottom">
                <span>一起把它，做得更好。</span>
                <Bloom />
              </div>
              <div
                className="board-progress"
                style={{ width: `${(step + 1) * 25}%` }}
              />
            </div>
            <div className="process-steps">
              {process.map((p, i) => (
                <div
                  key={p.en}
                  className={
                    step === i ? "process-step active" : "process-step"
                  }
                >
                  <button
                    aria-expanded={step === i}
                    aria-controls={`process-panel-${i}`}
                    onClick={() => setStep(i)}
                  >
                    <span className="step-circle">0{i + 1}</span>
                    <span>
                      {p.label}
                      <small>{p.en}</small>
                    </span>
                    <i>{step === i ? "↗" : "+"}</i>
                  </button>
                  <p id={`process-panel-${i}`} hidden={step !== i}>
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section section-shell" id="questions">
          <div>
            <span className="section-kicker">
              <span />
              BEFORE WE BEGIN
            </span>
            <h2>
              你可能，
              <br />
              也在想這些。
            </h2>
            <p>把最初的枝末節，先聊清楚。</p>
          </div>
          <div className="faq-list">
            {questions.map((q, i) => (
              <div
                key={q.q}
                className={faq === i ? "faq-item open" : "faq-item"}
              >
                <h3>
                  <button
                    aria-expanded={faq === i}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    <span>{q.q}</span>
                    <i>{faq === i ? "−" : "+"}</i>
                  </button>
                </h3>
                <p id={`faq-answer-${i}`} hidden={faq !== i}>
                  {q.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="brief-section" id="start">
          <div className="section-shell brief-grid">
            <div className="brief-intro">
              <span className="section-kicker">
                <span />
                LET'S MAKE SOMETHING BLOOM.
              </span>
              <h2>
                下一個好想法，
                <br />
                從這裡開始。
              </h2>
              <p>
                不用把每個細節都想好。
                <br />
                先告訴我們，你正在想什麼。
              </p>
              <div className="brief-flower" aria-hidden="true">
                <Bloom />
                <span>
                  EVERY GOOD THING
                  <br />
                  BEGINS SOMEWHERE.
                </span>
              </div>
              <span className="brief-note">先整理方向，再討論可能。</span>
            </div>
            <BriefForm kind={briefKind} onKindChange={setBriefKind} />
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <a className="brand" href="#top">
          <img src={logo} width="64" height="64" alt="咲夢工作室 LOGO" />
          <span>
            <strong>
              咲夢<span>工作室</span>
            </strong>
            <small>SAKIMU TECH STUDIO</small>
          </span>
        </a>
        <p>
          用代碼，創造美好未來。<span>BRAND WEBSITE CONCEPT / 2026</span>
        </p>
        <a className="back-top" href="#top">
          回到頂部
          <Arrow />
        </a>
      </footer>

      <dialog
        className="project-dialog"
        ref={dialog}
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setSelected(null);
        }}
      >
        {selected && (
          <div className="project-dialog-content">
            <div className="dialog-top">
              <span>SAKIMU / CONCEPT STUDY</span>
              <button
                autoFocus
                className="close-dialog"
                onClick={() => setSelected(null)}
                aria-label="關閉作品詳情"
              >
                ×
              </button>
            </div>
            <div className="dialog-project-grid">
              <div>
                <span className="section-kicker">
                  {selected.category} / {selected.year}
                </span>
                <h2>{selected.name}</h2>
                <h3>{selected.subtitle}</h3>
                <p>{selected.description}</p>
                <div className="service-tags">
                  {selected.scope.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <button
                  className="button primary"
                  onClick={() => begin(selected.category)}
                >
                  以這個方向開始
                  <Arrow />
                </button>
                <p className="dialog-concept-note">
                  這是一份概念提案，展示可延伸的設計方向。
                </p>
              </div>
              <ProjectArt theme={selected.theme} />
            </div>
            <div className="dialog-bottom">
              <span>
                概念作品 0{projects.findIndex((p) => p.id === selected.id) + 1}{" "}
                / 03
              </span>
              <button
                onClick={() =>
                  setSelected(
                    projects[
                      (projects.findIndex((p) => p.id === selected.id) + 1) %
                        projects.length
                    ],
                  )
                }
              >
                下一個方向
                <Arrow />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
