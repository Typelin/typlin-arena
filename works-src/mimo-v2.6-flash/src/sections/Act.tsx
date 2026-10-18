import { Fragment } from "react";
import type { Act as ActData } from "../content";

type Props = { act: ActData };

export default function Act({ act: a }: Props) {
  const Title = a.index === 0 ? "h1" : "h2";
  const born =
    a.index === 0
      ? new Date().toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : null;

  return (
    <section
      className={`act${a.index === 0 ? " act--first" : ""}`}
      id={a.id}
      data-act-index={a.index}
      aria-labelledby={`${a.id}-t`}
    >
      <div className="act__pin">
        <div className="act__col">
          <p className="eyebrow">
            <b>{a.eyebrow.slice(0, 2)}</b>
            {a.eyebrow.slice(2)}
          </p>
          {born && (
            <p className="born">
              <span>這個我出生於</span>
              <time>{born}</time>
            </p>
          )}
          <Title className="title" id={`${a.id}-t`}>
            {a.titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br className="brk" />}
                {line}
              </Fragment>
            ))}
          </Title>
          <p className="body">{a.body}</p>
          {a.aside && <p className="aside">{a.aside}</p>}
          {a.hint && <p className="hint">{a.hint}</p>}
        </div>
      </div>
    </section>
  );
}
