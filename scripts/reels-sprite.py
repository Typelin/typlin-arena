"""Stitch captured scroll frames into one grid sprite for the hover reel.

Usage: python scripts/reels-sprite.py <frames_dir> <out.webp>
Frames are resized to FRAME_W x FRAME_H and laid out COLS per row, in file-name order.
The front-end (Reel in src/App.tsx) must use the same COLS / frame count.
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image

FRAME_W, FRAME_H = 640, 400
COLS = 6


def main(src: str, out: str) -> None:
    frames = sorted(Path(src).glob('*.jpg'))
    if not frames:
        raise SystemExit(f'no frames in {src}')
    rows = -(-len(frames) // COLS)
    sheet = Image.new('RGB', (FRAME_W * COLS, FRAME_H * rows), (245, 241, 232))
    for i, f in enumerate(frames):
        with Image.open(f) as im:
            fr = im.convert('RGB').resize((FRAME_W, FRAME_H), Image.LANCZOS)
        sheet.paste(fr, ((i % COLS) * FRAME_W, (i // COLS) * FRAME_H))
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, 'WEBP', quality=62, method=6)
    print(f'{out}: {len(frames)} frames, {sheet.width}x{sheet.height}, {Path(out).stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
