"""Render the parsed New Spain SVG in pixel space for inspection / GCP picking."""

from __future__ import annotations

import os
import sys
from collections import Counter
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", "/tmp/mpl-cache")

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).resolve().parent))
from svg_geom import parse_svg  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
REFERENCES = ROOT / "src/maps/spanish-missions/references"
CACHE = ROOT / "scripts/.cache/new-spain"


def main() -> int:
    year = sys.argv[1] if len(sys.argv) > 1 else "1794"
    svg_path = REFERENCES / f"ref-new-spain-{year}.svg"
    parsed = parse_svg(svg_path, step=4.0)

    layer_counts = Counter(p.layer for p in parsed.polylines)
    print("=== polyline counts by layer ===")
    for layer, count in layer_counts.most_common():
        print(f"  {layer}: {count}")
    print(f"=== labels: {len(parsed.labels)} ===")

    fig, ax = plt.subplots(figsize=(16, 14), dpi=110)

    # Zones (territory fills).
    for poly in parsed.polylines:
        if poly.layer == "Zones" and poly.closed:
            ax.fill(poly.points[:, 0], poly.points[:, 1], facecolor="#ffe0b0",
                    edgecolor="none", alpha=0.5, zorder=1)

    # Coastline.
    for poly in parsed.polylines:
        if poly.css_class == "coastline" or (poly.layer == "Ocean" and not poly.closed):
            ax.plot(poly.points[:, 0], poly.points[:, 1], color="#0978ab",
                    lw=0.6, zorder=3)
        elif poly.layer == "Ocean" and poly.closed:
            ax.plot(poly.points[:, 0], poly.points[:, 1], color="#0978ab",
                    lw=0.4, alpha=0.7, zorder=2)

    # International borders.
    for poly in parsed.polylines:
        if poly.layer == "International borders":
            ax.plot(poly.points[:, 0], poly.points[:, 1], color="#333", lw=0.4,
                    alpha=0.5, zorder=4)

    # Label anchors.
    for label in parsed.labels:
        if label.layer != "Names":
            continue
        ax.plot(label.x, label.y, ".", color="red", ms=3, zorder=5)
        ax.annotate(label.text, (label.x, label.y), fontsize=5, color="darkred",
                    zorder=6)

    ax.set_aspect("equal")
    ax.invert_yaxis()  # SVG +y is down
    ax.grid(True, lw=0.3, alpha=0.4)
    ax.set_title(f"New Spain {year} — raw SVG pixel space")
    CACHE.mkdir(parents=True, exist_ok=True)
    out = CACHE / f"render-raw-{year}.png"
    fig.savefig(out, bbox_inches="tight")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
