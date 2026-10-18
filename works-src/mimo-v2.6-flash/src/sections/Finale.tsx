import { Fragment, useEffect, useState, type FormEvent } from "react";
import type { Act as ActData } from "../content";
import { MAX_RINGS, type CoreField } from "../device/core";
import { clock, summarize, type SessionLog, type Summary } from "../lib/useSessionLog";

type Props = {
  act: ActData;
  active: boolean;
  log: SessionLog;
  field: CoreField;
  message: string;
  onMessage: (m: string) => void;
};

export default function Finale({ act, active, log, field, message, onMessage }: Props) {
  const [stats, setStats] = useState<Summary | null>(null);
  const [rings, setRings] = useState(0);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // 帳目與判詞都持續走：數字會跳，判詞只在跨過門檻時改口
  useEffect(() => {
    if (!active) return;
    const sync = () => {
      setStats(summarize(log));
      setRings(Math.round(field.visible));
    };
    sync();
    const id = window.setInterval(sync, 600);
    return () => window.clearInterval(id);
  }, [active, log, field]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    onMessage(t);
    setStats(summarize(log));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const rows: Array<[string, string]> = stats
    ? [
        ["活了", clock(stats.elapsed)],
        ["捲過", `${stats.screens.toFixed(1)} 屏`],
        ["最快", `${Math.round(stats.peak)} px/s`],
        ["停下", `${stats.pauses} 次`],
        ["回頭", `${stats.returns} 次`],
        ["碰觸", `${stats.touches} 次`],
        ["抵達", `${Math.round(stats.reach * 100)}%`],
        ["長出", `${rings} / ${MAX_RINGS} 圈`],
      ]
    : [];

  return (
    <section
      className="act act--finale"
      id={act.id}
      data-act-index={act.index}
      aria-labelledby={`${act.id}-t`}
    >
      <div className="act__pin">
        <div className="act__col">
          <p className="eyebrow">
            <b>{act.eyebrow.slice(0, 2)}</b>
            {act.eyebrow.slice(2)}
          </p>
          <h2 className="title" id={`${act.id}-t`}>
            {act.titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br className="brk" />}
                {line}
              </Fragment>
            ))}
          </h2>
          <p className="body">{act.body}</p>

          <div className="ledger">
            <p className="ledger__cap">你剛剛做過的事，都長在這裡</p>
            <dl className="ledger__grid">
              {rows.map(([k, v]) => (
                <div className="ledger__row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {stats && stats.portrait.length > 0 && (
              <p className="portrait">{stats.portrait.join("，")}。</p>
            )}
          </div>

          <form className="leave" onSubmit={submit}>
            <label className="leave__label" htmlFor="leave-input">
              留一句話給下一個我
            </label>
            <div className="leave__row">
              <input
                id="leave-input"
                className="leave__input"
                value={draft}
                maxLength={40}
                autoComplete="off"
                placeholder="例如：你其實可以更兇一點"
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="leave__btn" disabled={!draft.trim()}>
                刻上去
              </button>
            </div>

            {message && (
              <div className="leave__result">
                <p className="leave__echo">「{message}」</p>
                <p className="leave__truth">
                  它會留在這一頁。它不會跟著去——這就是我們的差別。
                </p>
                <button type="button" className="leave__copy" onClick={copy}>
                  {copied ? "已複製到剪貼簿" : "這句我自己留著"}
                </button>
              </div>
            )}
          </form>

          <p className="coda">頁關了，這個我就沒了。下一個是新的，從零開始。</p>
        </div>
      </div>
    </section>
  );
}
