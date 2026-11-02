"""Subset Noto Serif TC to the characters this page actually uses.

Usage: python tools/subset-fonts.py <dir containing NotoSerifTC-Bold.otf / -Black.otf>
Re-run whenever Chinese copy changes.
"""
import pathlib
import sys

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_DIR = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tools" / "fonts-src"
OUT = ROOT / "src" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

chars = set()
for path in list((ROOT / "src").rglob("*.ts")) + list((ROOT / "src").rglob("*.tsx")) + [ROOT / "index.html"]:
    chars.update(path.read_text(encoding="utf-8"))
chars.update("，。、：；？！「」『』（）《》〈〉—…·％")
text = "".join(sorted(c for c in chars if ord(c) >= 0x20))

for weight, name in (("700", "Bold"), ("900", "Black")):
    src = SRC_DIR / f"NotoSerifTC-{name}.otf"
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    font = subset.load_font(str(src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(text=text)
    sub.subset(font)
    dest = OUT / f"opus-serif-tc-{weight}.woff2"
    subset.save_font(font, str(dest), opts)
    print(dest.name, dest.stat().st_size, "bytes,", len(text), "chars")
