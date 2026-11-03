"""Build small WebP copies of the work screenshots for the hero contact sheet.

public/shots/<name>.png -> public/shots/mini/<name>.webp (320px wide).
Skips archive/ and LOGO landing shots. Re-run after shots.mjs refreshes a screenshot.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'public' / 'shots'
OUT = SHOTS / 'mini'
WIDTH = 320


def main() -> None:
    count = 0
    for src in sorted(SHOTS.rglob('*.png')):
        rel = src.relative_to(SHOTS)
        if rel.parts[0] in ('archive', 'mini') or src.stem.endswith('-logo'):
            continue
        dst = (OUT / rel).with_suffix('.webp')
        dst.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(src) as im:
            im = im.convert('RGB')
            h = round(im.height * WIDTH / im.width)
            im.resize((WIDTH, h), Image.LANCZOS).save(dst, 'WEBP', quality=74, method=6)
        count += 1
        print(f'{rel} -> {dst.relative_to(ROOT)}')
    print(f'{count} files')


if __name__ == '__main__':
    main()
