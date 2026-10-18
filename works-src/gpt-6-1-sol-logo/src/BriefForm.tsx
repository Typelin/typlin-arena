import { useState } from "react";
import { Arrow, Bloom } from "./Graphics";
export function BriefForm({
  kind,
  onKindChange,
}: {
  kind: string;
  onKindChange: (kind: string) => void;
}) {
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [timeline, setTimeline] = useState("先聊聊，還沒決定");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const content = () =>
    `咲夢 SAKIMU / 專案需求卡\n\n想做的事：${kind}\n稱呼：${name.trim() || "尚未填寫"}\n期待時程：${timeline}\n\n想法與目標\n${idea.trim()}\n\n下一次討論可以補充\n・希望誰來使用？\n・最重要的改變是什麼？\n・目前有哪些內容或素材？\n\n此需求卡由瀏覽器產生，未傳送至任何服務。`;
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([content()], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "sakimu-project-brief.txt";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  return (
    <div className="brief-form-wrap">
      {ready ? (
        <div className="brief-result" aria-live="polite">
          <Bloom />
          <span className="section-kicker">A GOOD BEGINNING.</span>
          <h3>想法，已經有了輪廓。</h3>
          <p>
            你的需求卡整理好了。
            <br />
            先把它帶走，讓下一次討論有個好的開始。
          </p>
          <div className="brief-summary">
            <span>{kind}</span>
            <span>{timeline}</span>
          </div>
          <button className="button primary full" onClick={download}>
            {downloaded ? "再次下載需求卡" : "下載我的需求卡"}
            <Arrow />
          </button>
          <div className="result-actions">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(content());
                  setCopied("已複製需求卡");
                } catch {
                  setCopied("無法複製，請使用下載需求卡。");
                }
              }}
            >
              複製內容 <span>⧉</span>
            </button>
            <button
              onClick={() => {
                setReady(false);
                setCopied("");
                setDownloaded(false);
              }}
            >
              再調整一下 ↗
            </button>
          </div>
          <p className="copy-status" role="status">
            {copied || "這份想法留在你手上，沒有寄出。"}
          </p>
        </div>
      ) : (
        <form
          className="brief-form"
          onSubmit={(e) => {
            e.preventDefault();
            setReady(true);
          }}
        >
          <fieldset>
            <legend>
              你正在想什麼？<span>01</span>
            </legend>
            <div className="brief-kind">
              {["品牌網站", "數位工具", "品牌設計", "還沒決定"].map((k) => (
                <label key={k} className={kind === k ? "selected" : ""}>
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    onChange={() => onKindChange(k)}
                  />
                  <span>{k}</span>
                  <i>{kind === k ? "↗" : "+"}</i>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form-pair">
            <label>
              怎麼稱呼你 <span className="optional">選填</span>
              <input
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的名字"
                autoComplete="name"
              />
            </label>
            <label>
              期待的時程
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              >
                <option>先聊聊，還沒決定</option>
                <option>一至兩個月內</option>
                <option>兩至三個月內</option>
                <option>可以慢慢打磨</option>
              </select>
            </label>
          </div>
          <label className="idea-label" htmlFor="project-idea">
            說說你的想法 <span>02</span>
          </label>
          <textarea
            id="project-idea"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="想做什麼、想幫助誰，或想解決哪個問題？不用很完整，先寫下十個字以上就好。"
          />
          <div className="form-bottom">
            <p>
              內容只在此頁面整理，
              <br />
              不會傳送或收集。
            </p>
            <button className="button primary" type="submit">
              建立我的需求卡
              <Arrow />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
