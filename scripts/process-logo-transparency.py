from __future__ import annotations

import argparse
import hashlib
import io
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'benchmark-assets' / 'logo-landing' / 'logo.png'

# The source PNG is already transparent, but some antialiased edge pixels were
# exported against white. On dark pages this shows up as a pale/white fringe.
# We therefore clean *only the outer antialias band* and leave opaque white
# artwork details (clouds, highlights, flower stamens, etc.) intact.
EDGE_RADIUS = 2
ALPHA_CUTOFF = 5
EDGE_WHITE_START = 206
MAX_CHROMA = 34

# Hash from the first simple de-white pass. Allow upgrading those generated
# copies to the refined anti-fringe result without touching arbitrary edits.
LEGACY_PROCESSED_HASHES = {
    '7e3aae308ffc91a26cd05a9ab9f617c8acbf9162ebbac38a60702d045627bc5d',
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def process(source_bytes: bytes) -> tuple[bytes, int, int, int]:
    im = Image.open(io.BytesIO(source_bytes)).convert('RGBA')
    alpha = im.getchannel('A')

    # Find a narrow outer contour around non-transparent pixels. Interior white
    # details are deliberately excluded from this mask.
    solid = alpha.point(lambda a: 255 if a > ALPHA_CUTOFF else 0)
    interior = solid.filter(ImageFilter.MinFilter(EDGE_RADIUS * 2 + 1))
    edge_mask = ImageChops.subtract(solid, interior)

    out = []
    affected = 0
    cleared = 0
    decontaminated = 0

    pixels = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    edge_pixels = edge_mask.get_flattened_data() if hasattr(edge_mask, 'get_flattened_data') else edge_mask.getdata()

    for (r, g, b, a), edge in zip(pixels, edge_pixels):
        if a <= ALPHA_CUTOFF:
            if a != 0:
                affected += 1
                cleared += 1
            out.append((r, g, b, 0))
            continue

        nr, ng, nb = r, g, b
        new_alpha = a

        if edge:
            af = a / 255.0

            # Undo white matte contamination on partially-transparent edge
            # pixels. Blend the mathematically unmatted color back in rather
            # than applying it at 100%, which avoids over-darkening soft edges.
            if a < 250:
                corrected = []
                for c in (r, g, b):
                    raw = (c - 255.0 * (1.0 - af)) / max(af, 1e-6)
                    corrected.append(max(0.0, min(255.0, raw)))
                mix = min(0.9, (1.0 - af) * 1.18)
                nr = round(r * (1.0 - mix) + corrected[0] * mix)
                ng = round(g * (1.0 - mix) + corrected[1] * mix)
                nb = round(b * (1.0 - mix) + corrected[2] * mix)
                if (nr, ng, nb) != (r, g, b):
                    decontaminated += 1

            # Remove only *edge-connected* neutral white residue. Opaque white
            # interior artwork is never touched because it is not in edge_mask.
            lo = min(r, g, b)
            hi = max(r, g, b)
            chroma = hi - lo
            if lo >= EDGE_WHITE_START and chroma <= MAX_CHROMA:
                whiteness = max(0.0, min(1.0, (lo - EDGE_WHITE_START) / (255 - EDGE_WHITE_START)))
                neutrality = max(0.0, min(1.0, (MAX_CHROMA - chroma) / MAX_CHROMA))
                transparency_bias = 0.35 + 0.65 * (1.0 - af)
                strength = min(0.98, whiteness * (0.62 + 0.38 * neutrality) * transparency_bias)
                new_alpha = round(new_alpha * (1.0 - strength))

            # Tighten only very faint antialias pixels. This removes fuzzy
            # one-pixel halos while keeping the edge smooth rather than jagged.
            if new_alpha < 82:
                t = new_alpha / 82.0
                new_alpha = round(new_alpha * (t ** 0.22))

        if (nr, ng, nb, new_alpha) != (r, g, b, a):
            affected += 1
        if new_alpha == 0 and a > 0:
            cleared += 1
        out.append((nr, ng, nb, new_alpha))

    im.putdata(out)
    buf = io.BytesIO()
    im.save(buf, format='PNG', optimize=True)
    return buf.getvalue(), affected, cleared, decontaminated


def targets() -> list[Path]:
    result: list[Path] = []
    for project in sorted((ROOT / 'works-src').glob('*-logo')):
        if not project.is_dir():
            continue
        for p in project.rglob('logo.png'):
            rel_parts = p.relative_to(project).parts
            if 'node_modules' in rel_parts or 'dist' in rel_parts:
                continue
            result.append(p)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description='Create transparent/de-whited LOGO copies for Arena benchmark works.')
    parser.add_argument('--check', action='store_true', help='Report what would change without writing.')
    args = parser.parse_args()

    source_bytes = SOURCE.read_bytes()
    processed, affected, cleared, decontaminated = process(source_bytes)
    original_hash = sha256(source_bytes)
    processed_hash = sha256(processed)

    print(f'source={SOURCE}')
    print(f'original_sha256={original_hash}')
    print(f'processed_sha256={processed_hash}')
    print(
        f'affected_pixels={affected} fully_cleared_pixels={cleared} '
        f'edge_decontaminated_pixels={decontaminated}'
    )

    changed = 0
    already = 0
    skipped = 0
    for p in targets():
        current = p.read_bytes()
        current_hash = sha256(current)
        rel = p.relative_to(ROOT)

        if current_hash == processed_hash:
            print(f'OK   {rel} (already processed)')
            already += 1
            continue

        # Never overwrite a model-specific modified image accidentally. We do
        # allow the previous generated pass so the script can upgrade itself.
        if current_hash != original_hash and current_hash not in LEGACY_PROCESSED_HASHES:
            print(f'SKIP {rel} (content differs from benchmark original)')
            skipped += 1
            continue

        print(f'WRITE {rel}')
        if not args.check:
            p.write_bytes(processed)
        changed += 1

    print(f'summary changed={changed} already={already} skipped={skipped} check={args.check}')
    return 0 if skipped == 0 else 2


if __name__ == '__main__':
    raise SystemExit(main())
