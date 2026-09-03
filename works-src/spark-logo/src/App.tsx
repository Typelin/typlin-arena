import { useEffect, useState } from 'react';
import { PetalCanvas } from './components/PetalCanvas';
import { Enso } from './components/Enso';
import { Reveal } from './components/Reveal';
import { Omikuji } from './components/Omikuji';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useReducedMotion } from './hooks/useReducedMotion';
import { seasons, works, prices, palette } from './data/content';

const NAV = [
  { href: '#belief', label: '信念' },
  { href: '#seasons', label: '四季' },
  { href: '#omikuji', label: '花籤' },
  { href: '#works', label: '花譜' },
  { href: '#pricing', label: '費用' },
];

export default function App() {
  const { progress } = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const [seasonIdx, setSeasonIdx] = useState(1);
  const [copied, setCopied] = useState(false);

  // 深連結：React 掛載後，瀏覽器早已錯過錨點捲動時機，這裡補上
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }, 60);
    return () => window.clearTimeout(t);
  }, []);

  // 聯絡表單 → 組成 mailto，不經任何後端
  const [form, setForm] = useState({ name: '', budget: '滿開 NT$120,000 起', msg: '' });
  const sendMail = () => {
    const subject = encodeURIComponent(`【咲夢相談】${form.name || '未具名'} — ${form.budget}`);
    const body = encodeURIComponent(`${form.msg}\n\n—— ${form.name}\n預算：${form.budget}`);
    window.location.href = `mailto:hello@sakimu.tech?subject=${subject}&body=${body}`;
  };

  const copyMail = async () => {
    try {
      await navigator.clipboard.writeText('hello@sakimu.tech');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = 'mailto:hello@sakimu.tech';
    }
  };

  const season = seasons[seasonIdx];

  return (
    <>
      <a className="skip" href="#main">
        跳到內文
      </a>
      <PetalCanvas season={progress} reducedMotion={reducedMotion} />
      <div className="grain" aria-hidden="true" />

      {/* ————— 頁首 ————— */}
      <header className="site-head">
        <a className="brand" href="#top" aria-label="咲夢 SAKIMU 回到頂部">
          <span className="brand__seal" aria-hidden="true">
            咲
          </span>
          <span className="brand__text">
            <strong>咲夢</strong>
            <small>SAKIMU TECH STUDIO</small>
          </span>
        </a>
        <nav className="site-nav" aria-label="站內導覽">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="head-progress" aria-hidden="true">
          <Enso progress={progress} size={40} />
        </div>
        <a className="btn btn--small btn--ink head-cta" href="#contact">
          預約相談
        </a>
      </header>

      <main id="main">
        {/* ————— 首屏 ————— */}
        <section className="hero" id="top" aria-labelledby="hero-title">
          <p className="hero__eyebrow">
            <span className="eyebrow__jp">さきむ · 情報科技工作室</span>
            <span className="eyebrow__en">SAKIMU TECH STUDIO — EST. TAIPEI</span>
          </p>

          <div className="hero__seal-wrap">
            <Enso animateOnMount size={340} className="hero__enso" />
            <div className="hero__seal">
              <img src="./logo.png" alt="咲夢信息科技工作室 LOGO：櫻花與圓相環繞的咲夢二字" />
            </div>
            <p className="hero__vertical" aria-hidden="true">
              一期一會
            </p>
          </div>

          <h1 className="hero__title" id="hero-title">
            用程式碼，
            <br />
            種一場春天。
          </h1>
          <p className="hero__sub">
            咲夢相信軟體應該如櫻落般——<b>輕盈、準時、留白</b>。
            網站、系統、自動化，我們只接少而好的案子，一件一件開到滿。
          </p>
          <div className="hero__cta">
            <a className="btn btn--ink" href="#contact">
              預約相談
            </a>
            <a className="btn btn--ghost" href="#omikuji">
              先抽一張花籤 ↓
            </a>
          </div>
          <dl className="hero__meta">
            <div>
              <dt>據點</dt>
              <dd>台北 · 全遠端協作</dd>
            </div>
            <div>
              <dt>接案</dt>
              <dd>同時間最多兩件</dd>
            </div>
            <div>
              <dt>交期</dt>
              <dd>平均 3–6 週</dd>
            </div>
          </dl>
          <p className="hero__cue" aria-hidden="true">
            <span>往下走，季節會變</span>
            <i />
          </p>
        </section>

        {/* ————— 緞帶 ————— */}
        <div className="ribbon" aria-hidden="true">
          <div className="ribbon__track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                用代碼創造美好未來 ✳ SAKIMU TECH STUDIO ✳ 代碼如櫻落 ✳ 輕盈 · 準時 ·
                留白 ✳ 用代碼創造美好未來 ✳ SAKIMU TECH STUDIO ✳&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* ————— 信念 ————— */}
        <section className="section" id="belief" aria-labelledby="belief-title">
          <Reveal>
            <p className="sec-label">
              <span>01 · 信念</span>
              <span className="sec-label__jp">こころえ</span>
            </p>
            <h2 className="sec-title" id="belief-title">
              花期很短，
              <br />
              所以每一行都要精準。
            </h2>
          </Reveal>
          <div className="beliefs">
            {[
              {
                no: '壹',
                name: '輕',
                kana: 'かるい',
                body: '程式要輕。載入要快，依賴要少。刪掉的程式碼，比寫下的更值得驕傲——輕的東西，風才帶得動。',
                code: '0.6s 首屏 · 零追蹤器',
              },
              {
                no: '貳',
                name: '靜',
                kana: 'しずか',
                body: '介面要靜。留白是一種功能：少一個按鈕，多一分信任。我們不做會對使用者大喊大叫的頁面。',
                code: '留白 > 裝飾',
              },
              {
                no: '參',
                name: '久',
                kana: 'ひさしい',
                body: '關係要久。寫下一個接手的人敢改的程式碼，命名清楚、文件齊全。交期有終點，維護沒有。',
                code: 'readable > clever',
              },
            ].map((b, i) => (
              <Reveal key={b.no} variant="rise" delay={i * 120}>
                <article className="belief">
                  <p className="belief__no">
                    {b.no} · {b.kana}
                  </p>
                  <h3 className="belief__name">{b.name}</h3>
                  <p className="belief__body">{b.body}</p>
                  <p className="belief__code">
                    <code>{b.code}</code>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————— 四季 ————— */}
        <section className="section section--ink" id="seasons" aria-labelledby="seasons-title">
          <Reveal>
            <p className="sec-label sec-label--light">
              <span>02 · 四季</span>
              <span className="sec-label__jp">しき · 做法</span>
            </p>
            <h2 className="sec-title sec-title--light" id="seasons-title">
              做一件軟體，
              <br />
              像過完一場四季。
            </h2>
          </Reveal>
          <Reveal variant="rise" delay={100}>
            <div
              className="season-tabs"
              role="tablist"
              aria-label="四季流程"
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const d = e.key === 'ArrowRight' ? 1 : -1;
                setSeasonIdx((i) => (i + d + seasons.length) % seasons.length);
              }}
            >
              {seasons.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === seasonIdx}
                  aria-controls="season-panel"
                  className={`season-tab${i === seasonIdx ? ' is-active' : ''}`}
                  onClick={() => setSeasonIdx(i)}
                >
                  <span className="season-tab__kanji">{s.kanji}</span>
                  <span className="season-tab__name">{s.name}</span>
                  <span className="season-tab__weeks">{s.weeks}</span>
                </button>
              ))}
            </div>
            <article className="season-panel" id="season-panel" role="tabpanel" key={season.id}>
              <p className="season-panel__kana">{season.kana}</p>
              <h3 className="season-panel__title">{season.title}</h3>
              <p className="season-panel__body">{season.body}</p>
              <p className="season-panel__deliver">{season.deliverable}</p>
            </article>
          </Reveal>
        </section>

        {/* ————— 花籤 ————— */}
        <section className="section" id="omikuji" aria-labelledby="omikuji-title">
          <Reveal>
            <p className="sec-label">
              <span>03 · 花籤</span>
              <span className="sec-label__jp">おみくじ</span>
            </p>
            <h2 className="sec-title" id="omikuji-title">
              先別談案子，
              <br />
              抽一張今日花籤。
            </h2>
            <p className="sec-lead">
              動手搖一搖——據說連抽五次的人，會看見春天本身。
              每次開籤，都會掀起一陣花吹雪。
            </p>
          </Reveal>
          <Reveal variant="stamp" delay={120}>
            <Omikuji />
          </Reveal>
        </section>

        {/* ————— 花譜 ————— */}
        <section className="section" id="works" aria-labelledby="works-title">
          <Reveal>
            <p className="sec-label">
              <span>04 · 花譜</span>
              <span className="sec-label__jp">はなふ · 實績選</span>
            </p>
            <h2 className="sec-title" id="works-title">
              開過的花，
              <br />
              留下香味就好。
            </h2>
          </Reveal>
          <div className="works" role="list" aria-label="實績選">
            {works.map((w, i) => (
              <Reveal key={w.no} variant="rise" delay={i * 70}>
                <article className="work" role="listitem">
                  <span className="work__no">{w.no}</span>
                  <div className="work__main">
                    <h3 className="work__name">
                      {w.name}
                      <small>{w.kana}</small>
                    </h3>
                    <p className="work__result">{w.result}</p>
                  </div>
                  <span className="work__kind">{w.kind}</span>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal variant="rise">
            <p className="works__note">完整作品集與客戶引言，請在相談時索取——花不語，香自來。</p>
          </Reveal>
        </section>

        {/* ————— 取色 ————— */}
        <section className="section" id="palette" aria-labelledby="palette-title">
          <Reveal>
            <p className="sec-label">
              <span>05 · 取色</span>
              <span className="sec-label__jp">いろ · 從 LOGO 來</span>
            </p>
            <h2 className="sec-title" id="palette-title">
              這個網站的顏色，
              <br />
              都是從 LOGO 摘下來的。
            </h2>
            <p className="sec-lead">
              櫻粉是花，靛藍是筆，墨是骨，紙是呼吸。本站沒有暗色霓虹——春天不需要夜店燈光。
            </p>
          </Reveal>
          <div className="swatches" role="list" aria-label="LOGO 取色">
            {palette.map((c, i) => (
              <Reveal key={c.hex} variant="rise" delay={i * 70}>
                <div className="swatch" role="listitem" style={{ background: c.hex }}>
                  <span className={`swatch__name${c.ink ? '' : ' swatch__name--dark'}`}>
                    {c.name}
                  </span>
                  <span className={`swatch__meta${c.ink ? '' : ' swatch__meta--dark'}`}>
                    {c.kana} · {c.hex}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="rise">
            <p className="stack">
              <span>技術：</span>
              <code>React · TypeScript · Vite</code>
              <code>Canvas 2D 即時櫻瓣</code>
              <code>零追蹤 · 零 Cookie</code>
            </p>
          </Reveal>
        </section>

        {/* ————— 費用 ————— */}
        <section className="section" id="pricing" aria-labelledby="pricing-title">
          <Reveal>
            <p className="sec-label">
              <span>06 · 費用</span>
              <span className="sec-label__jp">はなだい</span>
            </p>
            <h2 className="sec-title" id="pricing-title">
              花有三開，
              <br />
              選適合你的那一分。
            </h2>
          </Reveal>
          <div className="prices">
            {prices.map((p, i) => (
              <Reveal key={p.name} variant="rise" delay={i * 110}>
                <article className={`price${p.featured ? ' price--featured' : ''}`}>
                  {p.featured && <p className="price__flag">最多人選</p>}
                  <h3 className="price__name">
                    {p.name}
                    <small>{p.kana}</small>
                  </h3>
                  <p className="price__value">{p.price}</p>
                  <p className="price__desc">{p.desc}</p>
                  <ul className="price__points">
                    {p.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal variant="rise">
            <p className="prices__note">正式報價以諮詢後的書面為準。學生、NPO 與獨立書店，另有春泥價。</p>
          </Reveal>
        </section>

        {/* ————— 聯絡 ————— */}
        <section className="section section--ink section--last" id="contact" aria-labelledby="contact-title">
          <Reveal variant="stamp">
            <p className="sec-label sec-label--light">
              <span>07 · 聯絡</span>
              <span className="sec-label__jp">てがみ</span>
            </p>
            <h2 className="sec-title sec-title--light sec-title--huge" id="contact-title">
              春天很短，
              <br />
              想法別放太久。
            </h2>
          </Reveal>
          <div className="contact-grid">
            <Reveal variant="rise" delay={80}>
              <div className="contact-direct">
                <p className="contact-direct__label">直接寫信</p>
                <a className="contact-direct__mail" href="mailto:hello@sakimu.tech">
                  hello@sakimu.tech
                </a>
                <button type="button" className="btn btn--ghost-light" onClick={copyMail}>
                  {copied ? '已複製 ✓' : '複製信箱'}
                </button>
                <p className="contact-direct__note">
                  來信請附：你是誰、想做什麼、希望何時開花。
                  三個工作天內回信，假日賞花去。
                </p>
              </div>
            </Reveal>
            <Reveal variant="rise" delay={160}>
              <form
                className="contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMail();
                }}
              >
                <label className="field">
                  <span>你的名字</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：山田花子"
                    autoComplete="name"
                  />
                </label>
                <label className="field">
                  <span>預算</span>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  >
                    <option>一分咲 NT$48,000 起</option>
                    <option>滿開 NT$120,000 起</option>
                    <option>常駐園丁 NT$18,000 / 月</option>
                    <option>還不知道，先聊聊</option>
                  </select>
                </label>
                <label className="field">
                  <span>想種什麼？</span>
                  <textarea
                    value={form.msg}
                    onChange={(e) => setForm({ ...form, msg: e.target.value })}
                    placeholder="一句話也好：我想為我的店做一個……"
                    rows={4}
                  />
                </label>
                <button type="submit" className="btn btn--sakura">
                  用郵件寄出這封信 →
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ————— 頁尾 ————— */}
      <footer className="site-foot">
        <div className="foot__brand">
          <span className="brand__seal" aria-hidden="true">
            咲
          </span>
          <p>
            <strong>咲夢信息科技工作室</strong>
            <small>SAKIMU TECH STUDIO · 用代碼創造美好未來</small>
          </p>
        </div>
        <p className="foot__meta">© 2026 SAKIMU TECH STUDIO · 本站無追蹤、無 Cookie · 櫻瓣皆為即時運算</p>
      </footer>
    </>
  );
}
