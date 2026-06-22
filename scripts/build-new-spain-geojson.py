#!/usr/bin/env python3
"""Build New Spain GeoJSON from the historic SVG maps (1794 and 1819).

The SVG (Milenioscuro's Wikimedia map) is georeferenced onto modern coordinates
with a thin-plate-spline rubber-sheet transform: labelled cities anchor the
interior while coastal/island landmarks snapped to the drawn coastline pin the
periphery, so the historic projection and drafting distortions are absorbed and
the traced territory matches today's coastline.

Implementation lives in scripts/newspain/. Run via `npm run spanish-missions:regions`.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "newspain"))

from build import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
