import { useEffect, useMemo, useRef, useState } from "react";

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

type Season = {
  id: string;
  glyph: string;
  name: string;
  english: string;
  headline: string;
  description: string;
  note: string;
  accent: string;
  wash: string;
};

const seasons: Season[] = [
  {
    id: "bloom",
    glyph: "花",
    name: "花開",
    english: "BLOOM",
    headline: "讓一個好點子，\n長出自己的季節。",
    description: "我們把模糊的靈感，整理成清楚的品牌語言與可被使用的數位作品。",
    note: "從品牌第一眼開始",
    accent: "#e879a3",
    wash: "#ffe7ef",
  },
  {
    id: "moon",
    glyph: "月",
    name: "月映",
    english: "MOON",
    headline: "把複雜收進秩序，\n讓體驗留下餘韻。",
    description: "以策略梳理脈絡，以設計建立節奏，讓每個畫面都知道自己為何存在。",
    note: "從資訊架構到互動細節",
    accent: "#3753a0",
    wash: "#e7ebff",
  },
  {
    id: "cloud",
    glyph: "雲",
    name: "雲行",
    english: "CLOUD",
    headline: "輕盈地啟程，\n穩穩地抵達。",
    description: "從原型、工程到上線驗證，讓技術藏在順手的體驗後面。",
    note: "從概念原型到可靠產品",
    accent: "#5575bb",
    wash: "#eaf4ff",
  },
  {
    id: "code",
    glyph: "碼",
    name: "成碼",
    english: "CODE",
    headline: "不只想得漂亮，\n也把它做得好用。",
    description: "設計與程式在同一張桌上對話，少一點交接耗損，多一點完整實現。",
    note: "從像素到每一次點擊",
    accent: "#29488f",
    wash: "#edf0f8",
  },
];

const services = [
  { number: "01", title: "品牌識別", text: "把品牌性格整理成可延展、可辨認的視覺系統。" },
  { number: "02", title: "數位產品", text: "從資訊架構到介面互動，讓複雜的事情變得直覺。" },
  { number: "03", title: "創意開發", text: "用前端工程、動態與原型，實現不只停在稿上的想像。" },
];

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return <span aria-hidden="true" className={`arrow arrow--${direction}`}>↗</span>;
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = seasons[activeIndex];
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.14 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const moveLogo = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stageRef.current?.style.setProperty("--mx", `${x * 14}px`);
    stageRef.current?.style.setProperty("--my", `${y * 14}px`);
  };

  const resetLogo = () => {
    stageRef.current?.style.setProperty("--mx", "0px");
    stageRef.current?.style.setProperty("--my", "0px");
  };

  const cycleSeason = () => setActiveIndex((current) => (current + 1) % seasons.length);

  return (
    <main style={{ "--active": active.accent, "--wash": active.wash } as React.CSSProperties}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="咲夢首頁">
          <span className="wordmark__mark">咲</span>
          <span className="wordmark__text">SAKIMU<br /><small>TECH STUDIO</small></span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "關閉" : "選單"}</span>
          <span aria-hidden="true">{menuOpen ? "×" : "＋"}</span>
        </button>
        <nav id="primary-navigation" className={menuOpen ? "nav nav--open" : "nav"} aria-label="主要導覽">
          <a href="#about" onClick={() => setMenuOpen(false)}>關於</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>專長</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>方法</a>
          <a className="nav__contact" href="#contact" onClick={() => setMenuOpen(false)}>下一季 <Arrow /></a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow"><span>{active.english}</span> DIGITAL CRAFT / TAIWAN</p>
          <div className="hero__title-wrap" key={active.id}>
            <h1 id="hero-title">{active.headline.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero__description">{active.description}</p>
          </div>
          <div className="hero__actions">
            <a className="button button--primary" href="#services">探索工作方式 <Arrow /></a>
            <button className="button button--quiet" type="button" onClick={cycleSeason}>換一種靈感 <span aria-hidden="true">＋</span></button>
          </div>
          <p className="hero__note"><span className="note-line" /> {active.note}</p>
        </div>

        <div
          className="logo-stage"
          ref={stageRef}
          onPointerMove={moveLogo}
          onPointerLeave={resetLogo}
          aria-label="咲夢品牌四種創作狀態"
        >
          <div className="logo-stage__halo" aria-hidden="true" />
          <div className="logo-stage__paper">
            <img src={LOGO_SRC} width="800" height="800" alt="咲夢信息科技工作室 SAKIMU TECH STUDIO 原始品牌標誌" />
          </div>
          <span className="logo-stage__index" aria-hidden="true">0{activeIndex + 1} / 04</span>
          <div className="season-switcher" role="group" aria-label="切換品牌意象">
            {seasons.map((season, index) => (
              <button
                key={season.id}
                className={index === activeIndex ? "season-button season-button--active" : "season-button"}
                type="button"
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <span className="season-button__glyph">{season.glyph}</span>
                <span className="season-button__name">{season.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto" id="about" data-reveal>
        <p className="section-label">ABOUT / 咲夢</p>
        <div className="manifesto__grid">
          <h2>咲，是綻放。<br />夢，是尚未成形的可能。</h2>
          <div>
            <p>咲夢是一間相信「好設計需要被做出來」的數位工作室。我們在品牌、體驗與技術之間來回，替每個想法找到最自然、最有生命力的樣子。</p>
            <p className="manifesto__aside">不套模板，不追逐表面流行。從你的問題出發，做剛剛好的答案。</p>
          </div>
        </div>
      </section>

      <section className="services" id="services" aria-labelledby="services-title">
        <div className="section-heading" data-reveal>
          <p className="section-label">WHAT WE SHAPE</p>
          <h2 id="services-title">從第一眼，做到每一次使用。</h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.number} data-reveal>
              <span className="service-card__number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <span className="service-card__symbol" aria-hidden="true">✦</span>
            </article>
          ))}
        </div>
      </section>

      <section className="process" id="process" aria-labelledby="process-title">
        <div className="process__intro" data-reveal>
          <p className="section-label section-label--light">HOW WE WORK</p>
          <h2 id="process-title">有想像力，<br />也有把事情做完的節奏。</h2>
        </div>
        <ol className="process__steps">
          <li data-reveal><span>一</span><div><h3>聽見</h3><p>先理解真正的問題，以及什麼才算成功。</p></div></li>
          <li data-reveal><span>二</span><div><h3>定形</h3><p>把策略、內容與視覺收斂成清楚方向。</p></div></li>
          <li data-reveal><span>三</span><div><h3>實作</h3><p>快速原型、逐步打磨，讓設計走進真實情境。</p></div></li>
          <li data-reveal><span>四</span><div><h3>抵達</h3><p>測試每個細節，交付能穩定生長的作品。</p></div></li>
        </ol>
      </section>

      <section className="closing" id="contact" data-reveal>
        <img src={LOGO_SRC} width="800" height="800" alt="" aria-hidden="true" className="closing__logo" />
        <p className="section-label">NEXT SEASON</p>
        <h2>你的下一個想法，<br />想在什麼季節盛開？</h2>
        <button
          className="button button--primary button--large"
          type="button"
          onClick={() => {
            setActiveIndex((current) => (current + 1) % seasons.length);
            document.querySelector("#top")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          回到靈感舞台 <Arrow />
        </button>
      </section>

      <footer>
        <p>咲夢信息科技工作室</p>
        <p>SAKIMU TECH STUDIO © {year}</p>
        <a href="#top">回到頁首 <span aria-hidden="true">↑</span></a>
      </footer>
    </main>
  );
}

export default App;
