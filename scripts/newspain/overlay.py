"""Overlay the warped SVG coastline on the modern coastline to assess georeferencing."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", "/tmp/mpl-cache")
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gcp as G  # noqa: E402
from extract import coastline_polylines, zone_polylines  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "scripts/.cache/new-spain"
REF = ROOT / "scripts/.cache/ref/ne_50m_coastline.geojson"

VIEW = dict(lon=(-130, -58), lat=(5, 52))


def load_modern_coast():
    data = json.load(open(REF))
    lines = []
    for feat in data["features"]:
        geom = feat["geometry"]
        coords = geom["coordinates"]
        parts = coords if geom["type"] == "MultiLineString" else [coords]
        for part in parts:
            arr = np.array(part, dtype=float)
            if arr[:, 0].max() < VIEW["lon"][0] or arr[:, 0].min() > VIEW["lon"][1]:
                continue
            if arr[:, 1].max() < VIEW["lat"][0] or arr[:, 1].min() > VIEW["lat"][1]:
                continue
            lines.append(arr)
    return lines


def build_fitter(year: str, kind: str, use_coastal: bool):
    src, dst, names = G.all_gcp_pairs(year, use_coastal=use_coastal)
    fit = {"affine": G.fit_affine, "poly2": G.fit_poly2, "tps": G.fit_tps}[kind]
    transform = fit(src, dst)
    return transform, src, dst, names


def main() -> int:
    year = sys.argv[1] if len(sys.argv) > 1 else "1794"
    kind = sys.argv[2] if len(sys.argv) > 2 else "tps"
    use_coastal = "--coastal" in sys.argv

    transform, src, dst, names = build_fitter(year, kind, use_coastal)

    fig, ax = plt.subplots(figsize=(17, 12), dpi=110)

    for line in load_modern_coast():
        ax.plot(line[:, 0], line[:, 1], color="#888", lw=0.6, zorder=1)

    for poly in zone_polylines(year):
        ll = transform(poly)
        ax.fill(ll[:, 0], ll[:, 1], facecolor="#e9c46a", edgecolor="none",
                alpha=0.25, zorder=2)
    for poly in coastline_polylines(year):
        ll = transform(poly)
        ax.plot(ll[:, 0], ll[:, 1], color="#c1121f", lw=0.7, zorder=3)

    # GCP markers: source projected (red x) should land on target (green o).
    proj = transform(src)
    ax.scatter(dst[:, 0], dst[:, 1], s=40, facecolors="none", edgecolors="green",
               linewidths=1.2, zorder=5, label="GCP target")
    ax.scatter(proj[:, 0], proj[:, 1], s=20, marker="x", color="red", zorder=6,
               label="GCP projected")

    ax.set_xlim(*VIEW["lon"])
    ax.set_ylim(*VIEW["lat"])
    ax.set_aspect(1.0 / np.cos(np.radians(25)))
    ax.grid(True, lw=0.3, alpha=0.4)
    ax.legend(loc="lower left", fontsize=8)
    ax.set_title(f"New Spain {year} warped ({kind}, coastal={use_coastal}) vs modern coast")

    CACHE.mkdir(parents=True, exist_ok=True)
    suffix = f"{kind}{'-coastal' if use_coastal else ''}"
    out = CACHE / f"overlay-{year}-{suffix}.png"
    fig.savefig(out, bbox_inches="tight")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
