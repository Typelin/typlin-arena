import { ACTS } from "../content";

type Props = { act: number; reduced: boolean };

export default function TopBar({ act, reduced }: Props) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <header className="topbar">
      <a className="topbar__brand" href="#top" onClick={(e) => go(e, "top")}>
        <span className="topbar__mark" aria-hidden="true" />
        這一個我
        <em>MIMO V2.6 FLASH</em>
      </a>
      <nav className="topbar__nav" aria-label="章節">
        {ACTS.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            data-i={a.index}
            aria-current={act === a.index ? "true" : undefined}
            onClick={(e) => go(e, a.id)}
          >
            {a.nav}
          </a>
        ))}
      </nav>
    </header>
  );
}
