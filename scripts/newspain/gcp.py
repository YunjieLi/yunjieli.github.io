"""Ground control points and transform fitting for New Spain georeferencing."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from scipy.interpolate import RBFInterpolator

sys.path.insert(0, str(Path(__file__).resolve().parent))
from svg_geom import parse_svg  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
REFERENCES = ROOT / "src/maps/spanish-missions/references"

# Reliable *point* city labels only (not region labels). Modern lon/lat.
CITY_GCPS: dict[str, tuple[float, float]] = {
    "México": (-99.1332, 19.4326),
    "Veracruz": (-96.1342, 19.1738),
    "Puebla": (-98.2062, 19.0414),
    "Oaxaca": (-96.7266, 17.0732),
    "Guadalajara": (-103.3496, 20.6597),
    "Zacatecas": (-102.5833, 22.7709),
    "Valladolid": (-101.1897, 19.7008),
    "Guanaj.": (-101.2577, 21.0190),
    "San Luis Potosí": (-100.9855, 22.1565),
    "Mérida de Yucatán": (-89.6168, 20.9674),
    "Guatemala": (-90.5132, 14.6349),
    "San Salvador": (-89.1872, 13.6929),
    "Comayagua": (-87.6211, 14.4609),
}


# Coastal / island landmarks as (name, lon, lat). Their pixel position is found
# automatically: invert the affine (city-based) fit to predict the pixel, then snap
# to the nearest actual coastline vertex. This pins the historic coastline to the
# modern one without error-prone manual pixel picking.
COAST_LANDMARKS: list[tuple[str, float, float]] = [
    # Pacific coast (N -> S)
    ("Cape Mendocino", -124.41, 40.44),
    ("San Francisco", -122.48, 37.81),
    ("Point Conception", -120.47, 34.45),
    ("San Diego", -117.16, 32.72),
    ("Punta Eugenia", -115.08, 27.84),
    ("Cabo San Lazaro", -112.10, 24.79),
    ("Cabo San Lucas", -109.91, 22.88),
    # Gulf of California
    ("Colorado delta", -114.70, 31.75),
    ("Guaymas", -110.90, 27.92),
    ("Mazatlan", -106.42, 23.19),
    ("Cabo Corrientes", -105.69, 20.41),
    # Pacific south
    ("Acapulco", -99.92, 16.84),
    ("Salina Cruz", -95.20, 16.16),
    ("Gulf of Fonseca", -87.80, 13.15),
    # Caribbean / Gulf mainland (S -> N -> E)
    ("Cabo Gracias a Dios", -83.17, 15.00),
    ("Yucatan Catoche", -86.80, 21.55),
    ("Yucatan Progreso", -89.66, 21.29),
    ("Campeche", -90.72, 19.85),
    ("Tampico", -97.86, 22.25),
    ("Rio Grande mouth", -97.15, 25.96),
    ("Galveston", -94.80, 29.31),
    ("Mississippi delta", -89.25, 29.15),
    ("Pensacola", -87.20, 30.40),
    ("Apalachee", -84.02, 30.10),
    ("Cape Sable", -81.10, 25.13),
    ("Cape Canaveral", -80.60, 28.45),
    ("NE Florida", -81.30, 30.40),
    # Islands
    ("Cuba west", -84.95, 21.86),
    ("Havana", -82.36, 23.13),
    ("Cuba east", -74.14, 20.25),
    ("Hispaniola west", -74.45, 18.35),
    ("Hispaniola east", -68.32, 18.60),
    ("Puerto Rico west", -67.25, 18.20),
    ("Puerto Rico east", -65.62, 18.30),
]


def _fit_inverse_affine(year: str):
    """Affine lon/lat -> pixel, from city GCPs only (a stable global bridge)."""
    src, dst, _ = city_gcp_pairs(year)
    return fit_affine(dst, src)  # swap: input lon/lat, output pixel


def coastal_gcp_pairs(year: str = "1794"):
    """Snap each landmark to the nearest coastline vertex; return (src_px, dst_ll, names)."""
    import extract  # local import to avoid cycle at module load

    inv = _fit_inverse_affine(year)
    verts = extract.coast_vertices(year)
    src: list[list[float]] = []
    dst: list[list[float]] = []
    names: list[str] = []
    for name, lon, lat in COAST_LANDMARKS:
        guess = inv(np.array([[lon, lat]]))[0]
        d = np.hypot(verts[:, 0] - guess[0], verts[:, 1] - guess[1])
        i = int(np.argmin(d))
        src.append([float(verts[i, 0]), float(verts[i, 1])])
        dst.append([lon, lat])
        names.append(name)
    return np.array(src, dtype=float), np.array(dst, dtype=float), names


def label_pixels(year: str = "1794") -> dict[str, tuple[float, float]]:
    """Return {label_text: (x, y)} for Names-layer labels (first occurrence)."""
    parsed = parse_svg(REFERENCES / f"ref-new-spain-{year}.svg", step=8.0)
    out: dict[str, tuple[float, float]] = {}
    for label in parsed.labels:
        if label.layer != "Names":
            continue
        out.setdefault(label.text, (label.x, label.y))
    return out


def city_gcp_pairs(year: str = "1794") -> tuple[np.ndarray, np.ndarray, list[str]]:
    px = label_pixels(year)
    src: list[list[float]] = []
    dst: list[list[float]] = []
    names: list[str] = []
    for name, lonlat in CITY_GCPS.items():
        if name not in px:
            print(f"  WARNING: label {name!r} not found in SVG")
            continue
        src.append(list(px[name]))
        dst.append(list(lonlat))
        names.append(name)
    return np.array(src, dtype=float), np.array(dst, dtype=float), names


def all_gcp_pairs(year: str = "1794", use_coastal: bool = True):
    src, dst, names = city_gcp_pairs(year)
    if use_coastal:
        csrc, cdst, cnames = coastal_gcp_pairs(year)
        src = np.vstack([src, csrc])
        dst = np.vstack([dst, cdst])
        names = names + cnames
    return src, dst, names


def fit_affine(src: np.ndarray, dst: np.ndarray):
    """Least-squares affine pixel->lonlat. Returns callable."""
    n = len(src)
    A = np.hstack([src, np.ones((n, 1))])
    coef_lon, *_ = np.linalg.lstsq(A, dst[:, 0], rcond=None)
    coef_lat, *_ = np.linalg.lstsq(A, dst[:, 1], rcond=None)

    def transform(pts: np.ndarray) -> np.ndarray:
        pts = np.atleast_2d(pts)
        B = np.hstack([pts, np.ones((len(pts), 1))])
        return np.column_stack([B @ coef_lon, B @ coef_lat])

    return transform


def fit_poly2(src: np.ndarray, dst: np.ndarray):
    """Second-order polynomial pixel->lonlat."""
    def design(pts: np.ndarray) -> np.ndarray:
        x = pts[:, 0]
        y = pts[:, 1]
        return np.column_stack([np.ones_like(x), x, y, x * x, x * y, y * y])

    A = design(src)
    coef_lon, *_ = np.linalg.lstsq(A, dst[:, 0], rcond=None)
    coef_lat, *_ = np.linalg.lstsq(A, dst[:, 1], rcond=None)

    def transform(pts: np.ndarray) -> np.ndarray:
        pts = np.atleast_2d(pts)
        D = design(pts)
        return np.column_stack([D @ coef_lon, D @ coef_lat])

    return transform


def fit_tps(src: np.ndarray, dst: np.ndarray, smoothing: float = 0.0):
    rbf_lon = RBFInterpolator(src, dst[:, 0], kernel="thin_plate_spline", smoothing=smoothing)
    rbf_lat = RBFInterpolator(src, dst[:, 1], kernel="thin_plate_spline", smoothing=smoothing)

    def transform(pts: np.ndarray) -> np.ndarray:
        pts = np.atleast_2d(pts)
        return np.column_stack([rbf_lon(pts), rbf_lat(pts)])

    return transform


def residual_report(src: np.ndarray, dst: np.ndarray, names: list[str], fitter) -> None:
    transform = fitter(src, dst)
    pred = transform(src)
    err = pred - dst
    dist = np.hypot(err[:, 0], err[:, 1])
    print(f"  RMS residual: {np.sqrt(np.mean(dist**2)):.3f} deg, max: {dist.max():.3f} deg")
    for name, d in sorted(zip(names, dist), key=lambda t: -t[1])[:6]:
        print(f"    {name}: {d:.3f} deg")


if __name__ == "__main__":
    year = sys.argv[1] if len(sys.argv) > 1 else "1794"
    src, dst, names = city_gcp_pairs(year)
    print(f"=== {len(names)} city GCPs ===")
    print("--- affine ---")
    residual_report(src, dst, names, fit_affine)
    print("--- poly2 ---")
    residual_report(src, dst, names, fit_poly2)
    print("--- tps ---")
    residual_report(src, dst, names, fit_tps)
