"""Build New Spain GeoJSON by georeferencing the SVG map to modern coordinates.

Pipeline:
  1. Parse the historic SVG (full transform composition) -> pixel geometry.
  2. Fit a thin-plate-spline transform pixel -> lon/lat using ground control
     points: labelled cities (interior) plus coastal/island landmarks snapped to
     the drawn coastline. This rubber-sheets the map onto the real coastline,
     absorbing the historic map's projection and drafting distortions.
  3. Warp every territory "Zones" ring, union them, clean, and simplify.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid

sys.path.insert(0, str(Path(__file__).resolve().parent))
import extract  # noqa: E402
import gcp as G  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "src/maps/spanish-missions"

MIN_RING_AREA_PX = 8.0       # drop drafting specks
MIN_RING_AREA_DEG = 0.002    # drop tiny warped slivers
SIMPLIFY_TOL_DEG = 0.01


def build_territory(year: str, transform) -> "Polygon | object":
    rings = []
    for pts in extract.zone_polylines(year, step=3.0):
        # pixel-space area filter
        area_px = 0.5 * abs(
            np.dot(pts[:, 0], np.roll(pts[:, 1], 1))
            - np.dot(pts[:, 1], np.roll(pts[:, 0], 1))
        )
        if area_px < MIN_RING_AREA_PX:
            continue
        ll = transform(pts)
        poly = Polygon(ll)
        if not poly.is_valid:
            poly = make_valid(poly)
        if poly.is_empty:
            continue
        if poly.geom_type == "Polygon":
            candidates = [poly]
        elif poly.geom_type in ("MultiPolygon", "GeometryCollection"):
            candidates = [g for g in poly.geoms if g.geom_type == "Polygon"]
        else:
            continue
        for cand in candidates:
            if cand.area >= MIN_RING_AREA_DEG:
                rings.append(cand)

    merged = unary_union(rings)
    merged = make_valid(merged)
    # Fill interior province seams / pinholes, then simplify.
    merged = merged.buffer(0.01).buffer(-0.01)
    merged = merged.simplify(SIMPLIFY_TOL_DEG, preserve_topology=True)
    return merged


def build_geojson(year: str) -> dict:
    src, dst, names = G.all_gcp_pairs(year, use_coastal=True)
    transform = G.fit_tps(src, dst)
    geom = build_territory(year, transform)
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": f"new-spain-{year}",
                "properties": {"name": "New Spain", "year": int(year)},
                "geometry": mapping(geom),
            }
        ],
    }


def main() -> int:
    years = sys.argv[1:] or ["1794", "1819"]
    for year in years:
        geojson = build_geojson(year)
        out = OUT_DIR / f"new-spain-{year}.geojson"
        out.write_text(json.dumps(geojson, separators=(",", ":")))
        gtype = geojson["features"][0]["geometry"]["type"]
        print(f"Wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes, {gtype})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
