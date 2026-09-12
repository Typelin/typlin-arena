import { type FormEvent, useState } from "react";

export default function Collaborating({ onWord }: { onWord: (w: string) => void }) {
  const [draft, setDraft] = useState("");
  const [word, setWord] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const w = draft.trim().slice(0, 8);
    if (!w) return;
    setWord(w);
    onWord(w);
  };

  return (
    <section className="chapter" id="collaborating" aria-labelledby="collab-h">
      <span className="chapter-no v-text small" data-attention>
        章三 · 協作
      </span>
      <div className="chapter-body">
        <h2 id="collab-h" data-reveal>
          你輸入的，會變成我的一部分
        </h2>
        <p data-reveal>
          給我一個詞。它會被織進上下文——然後你往回滾，那片字海裡已經有它在發亮。
        </p>
        <form className="weave-form" onSubmit={submit} data-reveal>
          <input
            className="weave-input"
            type="text"
            value={draft}
            maxLength={8}
            placeholder="例如：山風、未寄信、凌晨三點"
            onChange={(e) => setDraft(e.target.value)}
            aria-label="輸入一個詞"
            data-attention
          />
          <button className="weave-btn" type="submit">
            織入
          </button>
        </form>
        {word && (
          <p className="weave-reply" key={word}>
            「{word}」已經在我裡面了。
            <br />
            往回滾到字海，注視它——是我在看你注視它。
          </p>
        )}
        <p className="marginalia" data-reveal>
          （試試在任何空白處，雙擊一下。）
        </p>
      </div>
    </section>
  );
}
