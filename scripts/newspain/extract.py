"""Shared geometry extraction from the New Spain SVG (pixel space)."""

from __future__ import annotations

import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from svg_geom import parse_svg  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
REFERENCES = ROOT / "src/maps/spanish-missions/references"


@lru_cache(maxsize=4)
def _parsed(year: str, step: float):
    return parse_svg(REFERENCES / f"ref-new-spain-{year}.svg", step=step)


def coastline_polylines(year: str = "1794", step: float = 3.0):
    """Coastline polylines (Ocean layer) in pixel space, excluding Pacific insets."""
    parsed = _parsed(year, step)
    return [p.points for p in parsed.polylines if p.layer == "Ocean"]


def zone_polylines(year: str = "1794", step: float = 3.0):
    """Closed territory-zone rings (Zones layer) in pixel space."""
    parsed = _parsed(year, step)
    return [p.points for p in parsed.polylines if p.layer == "Zones" and p.closed]


def coast_vertices(year: str = "1794", step: float = 3.0) -> np.ndarray:
    return np.vstack(coastline_polylines(year, step))
