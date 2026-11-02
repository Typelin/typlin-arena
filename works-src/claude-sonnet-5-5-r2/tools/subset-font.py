"""Subset Noto Serif TC (variable wght) to the characters this page uses.
Run from the project root: python tools/subset-font.py
Source font is downloaded to fontsrc/ on first run (SIL OFL 1.1)."""
import pathlib
import re
import subprocess
import sys
import urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
src = root / "fontsrc" / "NotoSerifTC-VF.ttf"
out = root / "src" / "fonts" / "noto-serif-tc-sub.woff2"
url = "https://github.com/google/fonts/raw/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf"

if not src.exists():
    src.parent.mkdir(exist_ok=True)
    urllib.request.urlretrieve(url, src)

text = ""
for p in [root / "index.html", *sorted((root / "src").rglob("*.ts"))]:
    text += p.read_text(encoding="utf-8")

chars = {c for c in text if ord(c) > 0x2E7F}
chars |= set("，。、；：！？「」『』（）—…·％＄×→←↑↓％")
chars |= set(map(chr, range(0x20, 0x7F)))
(root / "fontsrc" / "chars.txt").write_text("".join(sorted(chars)), encoding="utf-8")

cmd = [
    sys.executable, "-m", "fontTools.subset", str(src),
    f"--text-file={root / 'fontsrc' / 'chars.txt'}",
    f"--output-file={out}", "--flavor=woff2",
    "--layout-features=*", "--no-hinting", "--desubroutinize",
]
subprocess.check_call(cmd)
print(len(chars), "chars ->", out.stat().st_size, "bytes")
