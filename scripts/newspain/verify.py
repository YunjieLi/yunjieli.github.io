"""Plot the FINAL output geojson over the modern coastline + mission points."""

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

ROOT = Path(__file__).resolve().parents[2]
MAPS = ROOT / "src/maps/spanish-missions"
CACHE = ROOT / "scripts/.cache/new-spain"
REF = ROOT / "scripts/.cache/ref/ne_50m_coastline.geojson"
VIEW = dict(lon=(-130, -58), lat=(5, 52))


def iter_rings(geom):
    if geom["type"] == "Polygon":
        yield from geom["coordinates"]
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            yield from poly


def modern_coast():
    data = json.load(open(REF))
    for feat in data["features"]:
        g = feat["geometry"]
        parts = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for part in parts:
            arr = np.array(part, float)
            if arr[:, 0].max() < VIEW["lon"][0] or arr[:, 0].min() > VIEW["lon"][1]:
                continue
            if arr[:, 1].max() < VIEW["lat"][0] or arr[:, 1].min() > VIEW["lat"][1]:
                continue
            yield arr


def main() -> int:
    year = sys.argv[1] if len(sys.argv) > 1 else "1794"
    gj = json.load(open(MAPS / f"new-spain-{year}.geojson"))
    geom = gj["features"][0]["geometry"]

    fig, ax = plt.subplots(figsize=(17, 12), dpi=110)
    for line in modern_coast():
        ax.plot(line[:, 0], line[:, 1], color="#999", lw=0.6, zorder=1)

    for ring in iter_rings(geom):
        arr = np.array(ring, float)
        ax.fill(arr[:, 0], arr[:, 1], facecolor="#e9c46a", edgecolor="#c1121f",
                lw=0.8, alpha=0.35, zorder=2)

    missions = MAPS / "layers/missions.geojson"
    if missions.exists():
        md = json.load(open(missions))
        pts = np.array([f["geometry"]["coordinates"] for f in md["features"]], float)
        ax.scatter(pts[:, 0], pts[:, 1], s=8, color="#1d3557", zorder=4,
                   label="missions")

    ax.set_xlim(*VIEW["lon"])
    ax.set_ylim(*VIEW["lat"])
    ax.set_aspect(1.0 / np.cos(np.radians(25)))
    ax.grid(True, lw=0.3, alpha=0.4)
    ax.legend(loc="lower left", fontsize=8)
    ax.set_title(f"new-spain-{year}.geojson (output) vs modern coastline")
    out = CACHE / f"verify-{year}.png"
    fig.savefig(out, bbox_inches="tight")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
