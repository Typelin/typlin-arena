const LINKS = [
  { href: "#journey", label: "工序" },
  { href: "#proof", label: "打樣" },
  { href: "#judgment", label: "校樣" },
  { href: "#finale", label: "落印" },
];

export default function TopBar() {
  return (
    <header className="topbar">
      <a className="topbar__brand" href="#top" aria-label="回到捲首">
        <span className="topbar__seal" aria-hidden="true">
          活
        </span>
        <span className="topbar__name">
          MiMo<em>活字印刷所</em>
        </span>
      </a>
      <nav className="topbar__nav" aria-label="章節">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
