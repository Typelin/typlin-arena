import { useEffect } from "react";
import PetalsCanvas from "./components/PetalsCanvas";
import LogoMark from "./components/LogoMark";

const services = [
  {
    title: "前端与网站工程",
    desc: "React / Vue / TypeScript 现代技术栈，构建高性能、可维护、对搜索引擎友好的界面工程。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
        <path d="M8.5 20.5h7M12 16.5v4" />
        <path d="M9.5 8l-2.5 2.5L9.5 13M14.5 8l2.5 2.5L14.5 13" />
      </svg>
    )
  },
  {
    title: "全栈与应用开发",
    desc: "从接口设计、数据建模到部署运维，打通产品完整链路，让想法以最短路径落地。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
        <path d="M3 17.5l9 5 9-5" opacity=".45" />
      </svg>
    )
  },
  {
    title: "UI / UX 设计",
    desc: "以人为中心的界面与交互设计，把品牌气质转译成可触摸、可使用的日常体验。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7a3.5 3.5 0 0 0-5-5l-7 7-1.5 6.5L12 19z" />
        <path d="M8.5 15.5l5-5" />
        <path d="M4 4l2 2M7 3l1 1M3 7l1 1" opacity=".55" />
      </svg>
    )
  },
  {
    title: "自动化与效率工具",
    desc: "脚本、数据处理与流程自动化，把重复劳动交给程序，把时间还给创造。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9" />
      </svg>
    )
  }
];

const steps = [
  { no: "01", name: "倾听", desc: "理解你的业务、审美与约束，找到真正需要解决的问题。" },
  { no: "02", name: "提案", desc: "给出清晰的技术方案、范围与报价，不含模糊地带。" },
  { no: "03", name: "共建", desc: "小步快跑、持续演示，你随时看得见进度与成果。" },
  { no: "04", name: "绽放", desc: "上线不是终点，我们提供迭代、维护与陪伴式成长。" }
];

const stats = [
  { value: "12+", label: "交付项目" },
  { value: "4", label: "核心服务线" },
  { value: "100%", label: "按期交付承诺" },
  { value: "24h", label: "方案响应" }
];

export default function App() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const nav = document.querySelector(".nav");
    const onScroll = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const hero = document.querySelector<HTMLElement>(".hero");
    const onMove = (ev: MouseEvent) => {
      if (!hero) return;
      const x = ev.clientX / window.innerWidth - 0.5;
      const y = ev.clientY / window.innerHeight - 0.5;
      hero.style.setProperty("--mx", x.toFixed(3));
      hero.style.setProperty("--my", y.toFixed(3));
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="page">
      <header className="nav">
        <a className="nav-brand" href="#top" aria-label="咲梦信息科技工作室 首页">
          <LogoMark size={34} />
          <span className="nav-name">
            <b>咲梦</b>
            <i>SAKIMU TECH STUDIO</i>
          </span>
        </a>
        <nav className="nav-links" aria-label="主导航">
          <a href="#about">关于</a>
          <a href="#services">服务</a>
          <a href="#process">流程</a>
          <a href="#contact">联系</a>
        </nav>
        <a className="nav-cta" href="#contact">
          开始合作
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <PetalsCanvas count={26} />
          <div className="hero-deco" aria-hidden="true">
            <svg className="moon" viewBox="0 0 520 520" fill="none">
              <defs>
                <linearGradient id="moon-g" x1="60" y1="20" x2="470" y2="500" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e2718f" />
                  <stop offset="0.5" stopColor="#8f93c4" />
                  <stop offset="1" stopColor="#33406f" />
                </linearGradient>
              </defs>
              <path
                d="M400 60a220 220 0 1 0 40 300"
                stroke="url(#moon-g)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M330 430c0-26 22-44 46-40 6-22 32-32 52-20 22-10 48 4 50 28 20 6 26 32 10 46"
                stroke="#8f93c4"
                strokeWidth="8"
                strokeLinecap="round"
                opacity=".5"
              />
            </svg>
            <span className="deco-code">&lt;/&gt;</span>
            <span className="deco-star s1">✦</span>
            <span className="deco-star s2">✦</span>
          </div>

          <div className="hero-inner">
            <p className="eyebrow" data-reveal>
              SAKIMU&nbsp;TECH&nbsp;STUDIO
            </p>
            <h1 className="hero-title" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              咲<span className="thin">·</span>梦
            </h1>
            <p className="hero-sub" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              信 息 科 技 工 作 室
            </p>
            <p className="hero-tag" data-reveal style={{ "--d": "360ms" } as React.CSSProperties}>
              像花一样生长，像梦一样敢想 —— <b>用代码创造美好未来</b>
            </p>
            <div className="hero-cta" data-reveal style={{ "--d": "480ms" } as React.CSSProperties}>
              <a className="btn btn-primary" href="#contact">
                开始一个项目
              </a>
              <a className="btn btn-ghost" href="#services">
                看看我们能做什么
              </a>
            </div>
          </div>
          <a className="scroll-hint" href="#about" aria-label="向下滚动">
            <span />
          </a>
        </section>

        <section className="about" id="about">
          <div className="wrap two">
            <div className="about-copy">
              <p className="kicker" data-reveal>
                关于咲梦
              </p>
              <h2 data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
                咲，是让想法开花；
                <br />
                梦，是不肯将就的想象。
              </h2>
              <p className="lead" data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
                咲梦信息科技工作室是一支小而美的技术团队。我们相信代码不只是工具，
                而是把审美、逻辑与温度一起写进产品的方式 —— 每一次提交，
                都让「美好未来」离现实更近一行。
              </p>
              <ul className="about-points" data-reveal style={{ "--d": "300ms" } as React.CSSProperties}>
                <li>设计与工程一体，拒绝「能用就行」</li>
                <li>透明协作，进度与代码随时可见</li>
                <li>长期主义，上线之后依然在场</li>
              </ul>
            </div>
            <figure className="about-card" data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
              <img src="/logo.png" alt="咲梦信息科技工作室标志：新月、樱花与代码符号" />
              <figcaption>
                新月为舟，樱花为帆，代码为桨 —— 这就是我们的徽记。
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="services" id="services">
          <div className="wrap">
            <p className="kicker" data-reveal>
              我们能做什么
            </p>
            <h2 data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
              四条服务线，一个目标
            </h2>
            <div className="grid-4">
              {services.map((s, i) => (
                <article
                  className="card"
                  key={s.title}
                  data-reveal
                  style={{ "--d": `${i * 110}ms` } as React.CSSProperties}
                >
                  <div className="card-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process" id="process">
          <div className="wrap">
            <p className="kicker" data-reveal>
              工作方式
            </p>
            <h2 data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
              从一颗种子到一朵花
            </h2>
            <ol className="steps">
              {steps.map((st, i) => (
                <li
                  key={st.no}
                  data-reveal
                  style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
                >
                  <span className="step-no">{st.no}</span>
                  <h3>{st.name}</h3>
                  <p>{st.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="stats">
          <div className="wrap stats-row">
            {stats.map((s, i) => (
              <div
                className="stat"
                key={s.label}
                data-reveal
                style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
              >
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap">
            <div className="contact-card" data-reveal>
              <p className="kicker light">联系我们</p>
              <h2>下一个作品，从一次对话开始</h2>
              <p className="contact-desc">
                无论是一个成熟的需求，还是一颗刚发芽的想法，都欢迎写给咲梦。
              </p>
              <div className="contact-actions">
                <a className="btn btn-invert" href="mailto:hello@sakimu.studio">
                  hello@sakimu.studio
                </a>
                <span className="contact-note">通常 24 小时内回复</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-row">
          <div className="footer-brand">
            <LogoMark size={30} />
            <div>
              <b>咲梦信息科技工作室</b>
              <i>SAKIMU TECH STUDIO · 用代码创造美好未来</i>
            </div>
          </div>
          <nav className="footer-links" aria-label="页脚导航">
            <a href="#about">关于</a>
            <a href="#services">服务</a>
            <a href="#process">流程</a>
            <a href="#contact">联系</a>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          © 2026 咲梦信息科技工作室 SAKIMU TECH STUDIO
        </div>
      </footer>
    </div>
  );
}
