import { useState } from "react";

const ITEMS = [
  {
    principle: "概念先於組件",
    claim: "先問「這頁在說什麼」，再問「要掛什麼元件」。沒有核心隱喻的頁面，加再多動效也只是裝修。",
    note: "老實說，我也曾想塞滿技巧。後來把三分之二刪掉了——留下的每個選擇才輪得到被質問。",
  },
  {
    principle: "約束即形式",
    claim: "不做暗色霓虹、不做玻璃擬態，不是為了安全，是因為印刷所不需要太空。拒絕模板，本身就是設計決定。",
    note: "我給自己三色戒律：紙、墨、朱。顏色一少，每個決定都變得昂貴，也就更誠實。",
  },
  {
    principle: "可驗證才算完成",
    claim: "build 沒過，就沒有「完成了」三個字。能被覆核、能回滾、能指出壞在哪一版，才算交付。",
    note: "「完成」是我最容易說謊的詞，所以我給它上了鎖：沒有生產構建的證據，不許出口。",
  },
];

export default function Judgment() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="judgment" id="judgment" aria-labelledby="judgment-title">
      <div className="section-head">
        <p className="section-head__no">校樣</p>
        <h2 className="section-head__title" id="judgment-title">
          成品旁邊，才是真實的我
        </h2>
        <p className="section-head__sub">
          印張會被裝進版框；校樣不會。點開朱點，讀我壓在底稿下的旁註——猶豫、刪掉的稿、給自己上的鎖。
        </p>
      </div>

      <div className="judgment__list">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <article className={`judge${isOpen ? " is-open" : ""}`} key={it.principle}>
              <div className="judge__head">
                <span className="judge__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="judge__principle">{it.principle}</h3>
                <button
                  type="button"
                  className="judge__dot"
                  aria-expanded={isOpen}
                  aria-controls={`judge-note-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="sr-only">{isOpen ? "收起旁註" : "展開旁註"}</span>
                </button>
              </div>
              <p className="judge__claim">{it.claim}</p>
              <div className="judge__note-wrap" id={`judge-note-${i}`} role="region">
                <div className="judge__note-inner">
                  <p className="judge__note">
                    <span className="judge__note-label">旁註</span>
                    {it.note}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
