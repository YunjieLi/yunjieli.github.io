#!/usr/bin/env python3
"""Build New Spain GeoJSON from Milenioscuro's Wikimedia SVG maps (1794 and 1819)."""

from __future__ import annotations

import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np
from matplotlib.path import Path as MplPath
from scipy.interpolate import RBFInterpolator
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid
from svg.path import parse_path, Move, Close

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src/maps/spanish-missions"
CACHE_DIR = ROOT / "scripts/.cache/new-spain"

SVG_URLS = {
    "1794": "https://upload.wikimedia.org/wikipedia/commons/4/41/Mapa_del_Virreinato_de_la_Nueva_Espa%C3%B1a_%281794%29.svg",
    "1819": "https://upload.wikimedia.org/wikipedia/commons/9/91/Mapa_del_Virreinato_de_la_Nueva_Espa%C3%B1a_%281819%29.svg",
}

# Mainland map labels only (excludes Pacific inset labels in the bottom-left corner).
CALIBRATION = {
    "México": (-99.1332, 19.4326),
    "Veracruz": (-96.1342, 19.1738),
    "Puebla": (-98.2062, 19.0414),
    "Oaxaca": (-96.7266, 17.0732),
    "Guadalajara": (-103.3496, 20.6597),
    "Zacatecas": (-102.5833, 22.7709),
    "Valladolid": (-101.1897, 19.7008),
    "Guanaj.": (-101.2577, 21.0190),
    "San Luis Potosí": (-100.9855, 22.1565),
    "Nuevo León": (-100.3161, 25.6866),
    "Nuevo Santander": (-99.1332, 23.7369),
    "Nueva Extremadura": (-104.6573, 24.0277),
    "Mérida de Yucatán": (-89.5926, 20.9674),
    "Guatemala": (-90.5132, 14.6349),
    "San Salvador": (-89.1872, 13.6929),
    "Comayagua": (-87.6211, 14.4609),
    "Nicaragua": (-86.2362, 12.1150),
    "Alta California": (-121.5, 37.0),
    "Baja California": (-112.0, 28.0),
    "Nuevo México": (-105.9378, 35.6870),
    "Nueva Vizcaya": (-106.0698, 28.6320),
    "Nueva Navarra": (-110.9559, 29.0729),
    "Luisiana": (-91.9623, 31.0),
    "Nuevas Filipinas": (-99.9018, 31.9686),
}

SKIP_FILLS = {"none", "transparent", "#ffffff", "#f2f2f2", "#c6a2c1", "#b3e7fa"}
TERRITORY_LAYERS = {"layer2", "layer4"}
CLIP = Polygon([(-125, 7), (-125, 45), (-74, 45), (-74, 7), (-125, 7)])
MIN_PATH_LEN = 500
MIN_RING_AREA = 0.05


def download_svg(year: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / f"new-spain-{year}.svg"
    if path.exists():
        return path
    url = SVG_URLS[year]
    print(f"Downloading {url}")
    request = urllib.request.Request(url, headers={"User-Agent": "yunjieli.github.io build script"})
    with urllib.request.urlopen(request) as response:
        path.write_bytes(response.read())
    return path


def save_svg(year: str, source: Path) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUT_DIR / f"new-spain-{year}.svg"
    shutil.copy2(source, target)
    return target


def fit_transform(svg_path: Path) -> tuple[RBFInterpolator, RBFInterpolator]:
    root = ET.parse(svg_path).getroot()
    points: list[list[float]] = []
    lons: list[float] = []
    lats: list[float] = []

    for text in root.iter("{http://www.w3.org/2000/svg}text"):
        label_parts = []
        for tspan in text:
            if tspan.tag.endswith("tspan"):
                label_parts.append((tspan.text or "").strip())
        label = " ".join(part for part in label_parts if part)
        if label not in CALIBRATION:
            continue
        x = float(text.get("x", 0))
        y = float(text.get("y", 0))
        if x > 200:
            continue
        lon, lat = CALIBRATION[label]
        points.append([x, y])
        lons.append(lon)
        lats.append(lat)

    matrix = np.array(points, dtype=float)
    return (
        RBFInterpolator(matrix, np.array(lons, dtype=float), kernel="thin_plate_spline"),
        RBFInterpolator(matrix, np.array(lats, dtype=float), kernel="thin_plate_spline"),
    )


def to_lonlat(x: float, y: float, rbf_lon: RBFInterpolator, rbf_lat: RBFInterpolator) -> tuple[float, float]:
    sample = np.array([[x, y]], dtype=float)
    return float(rbf_lon(sample)[0]), float(rbf_lat(sample)[0])


def svg_bbox(path_data: str) -> tuple[float, float, float, float]:
    path = parse_path(path_data)
    xs: list[float] = []
    ys: list[float] = []
    for segment in path:
        for t in (0, 0.25, 0.5, 0.75, 1.0):
            point = segment.point(t)
            xs.append(point.real)
            ys.append(point.imag)
    return min(xs), min(ys), max(xs), max(ys)


def include_path(bounds: tuple[float, float, float, float]) -> bool:
    x0, y0, x1, y1 = bounds
    center_x = (x0 + x1) / 2
    center_y = (y0 + y1) / 2
    if center_x > 230:
        return False
    if center_x < -130 and center_y > 620:
        return False
    if y1 < 100:
        return False
    if x0 > 320 or x1 < -340:
        return False
    return True


def path_fill(path_element) -> str:
    style = path_element.get("style", "")
    fill = path_element.get("fill", "")
    match = re.search(r"fill:([^;]+)", style)
    if match:
        fill = match.group(1).strip()
    return fill


def discretize_subpath(segments, step: int = 6) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for segment in segments:
        steps = min(max(4, int(segment.length() / step) + 1), 80)
        start_index = 1 if points else 0
        for index in range(start_index, steps + 1):
            point = segment.point(index / steps)
            points.append((point.real, point.imag))
    return points


def path_to_subpaths(path_data: str) -> list[list[tuple[float, float]]]:
    path = parse_path(path_data)
    subpaths: list[list[tuple[float, float]]] = []
    current: list = []

    for segment in path:
        if isinstance(segment, Move):
            if current:
                subpaths.append(current)
            current = [(segment.end.real, segment.end.imag)]
            continue

        steps = min(max(4, int(segment.length() / 6) + 1), 80)
        start_index = 1 if current else 0
        for index in range(start_index, steps + 1):
            point = segment.point(index / steps)
            current.append((point.real, point.imag))

        if isinstance(segment, Close) and current:
            subpaths.append(current)
            current = []

    if current:
        subpaths.append(current)

    return subpaths


def path_to_mpl(path_data: str, step: int = 6) -> MplPath:
    path = parse_path(path_data)
    vertices: list[tuple[float, float]] = []
    codes: list[int] = []
    started = False

    for segment in path:
        if isinstance(segment, Move):
            vertices.append((segment.end.real, segment.end.imag))
            codes.append(MplPath.MOVETO)
            started = True
            continue

        if not started:
            vertices.append((segment.start.real, segment.start.imag))
            codes.append(MplPath.MOVETO)
            started = True

        steps = min(max(4, int(segment.length() / step) + 1), 80)
        for index in range(1, steps + 1):
            point = segment.point(index / steps)
            vertices.append((point.real, point.imag))
            codes.append(MplPath.LINETO)

        if isinstance(segment, Close):
            codes[-1] = MplPath.CLOSEPOLY
            vertices[-1] = (0.0, 0.0)
            started = False

    return MplPath(vertices, codes)


def rings_to_polygon(rings: list[Polygon]) -> Polygon | None:
    if not rings:
        return None

    rings = [ring for ring in rings if not ring.is_empty and ring.area >= MIN_RING_AREA]
    if not rings:
        return None

    rings.sort(key=lambda ring: ring.area, reverse=True)
    shell = rings[0]
    holes: list[list[tuple[float, float]]] = []

    for candidate in rings[1:]:
        try:
            if shell.contains(candidate.representative_point()):
                holes.append(list(candidate.exterior.coords))
        except Exception:
            continue

    if holes:
        return make_valid(Polygon(shell.exterior.coords, holes))

    if len(rings) == 1:
        return make_valid(rings[0])

    return make_valid(unary_union([make_valid(ring) for ring in rings]))


def polygon_from_subpaths(subpaths: list[list[tuple[float, float]]], rbf_lon, rbf_lat):
    rings: list[Polygon] = []
    for subpath in subpaths:
        if len(subpath) < 3:
            continue
        coords = [to_lonlat(x, y, rbf_lon, rbf_lat) for x, y in subpath]
        if coords[0] != coords[-1]:
            coords.append(coords[0])
        if len(coords) < 4:
            continue
        ring = make_valid(Polygon(coords))
        if ring.is_empty:
            continue
        if ring.geom_type == "Polygon" and ring.area >= MIN_RING_AREA:
            rings.append(ring)
        elif ring.geom_type == "MultiPolygon":
            rings.extend(part for part in ring.geoms if part.area >= MIN_RING_AREA)
    return rings_to_polygon(rings)


def polygon_from_mpl(path_data: str, rbf_lon, rbf_lat):
    rings: list[Polygon] = []
    for ring in path_to_mpl(path_data).to_polygons():
        if len(ring) < 4:
            continue
        coords = [to_lonlat(x, y, rbf_lon, rbf_lat) for x, y in ring]
        if coords[0] != coords[-1]:
            coords.append(coords[0])
        poly = make_valid(Polygon(coords))
        if poly.is_empty:
            continue
        if poly.geom_type == "Polygon" and poly.area >= MIN_RING_AREA:
            rings.append(poly)
        elif poly.geom_type == "MultiPolygon":
            rings.extend(part for part in poly.geoms if part.area >= MIN_RING_AREA)
    return rings_to_polygon(rings)


def path_to_geom(path_data: str, rbf_lon, rbf_lat):
    subpaths = path_to_subpaths(path_data)
    if len(subpaths) > 1:
        geom = polygon_from_subpaths(subpaths, rbf_lon, rbf_lat)
        if geom is not None:
            return geom
    return polygon_from_mpl(path_data, rbf_lon, rbf_lat)


def normalize_geometry(geom):
    if geom.geom_type == "GeometryCollection":
        parts = [
            part
            for part in geom.geoms
            if part.geom_type in {"Polygon", "MultiPolygon"} and not part.is_empty
        ]
        geom = make_valid(unary_union(parts))
    return geom


def build_geojson(svg_path: Path, year: str) -> dict:
    rbf_lon, rbf_lat = fit_transform(svg_path)
    root = ET.parse(svg_path).getroot()
    geoms = []

    for group in root.iter("{http://www.w3.org/2000/svg}g"):
        layer_id = group.get("id", "")
        if layer_id not in TERRITORY_LAYERS:
            continue
        for path in group.iter("{http://www.w3.org/2000/svg}path"):
            path_data = path.get("d", "")
            if len(path_data) < MIN_PATH_LEN:
                continue
            fill = path_fill(path)
            if fill in SKIP_FILLS:
                continue
            if not include_path(svg_bbox(path_data)):
                continue
            geom = path_to_geom(path_data, rbf_lon, rbf_lat)
            if geom is not None and not geom.is_empty:
                geoms.append(make_valid(geom))

    merged = normalize_geometry(make_valid(unary_union(geoms)))
    merged = normalize_geometry(make_valid(merged.intersection(CLIP)))
    merged = merged.simplify(0.02, preserve_topology=True)

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": f"new-spain-{year}",
                "properties": {"name": "New Spain", "year": int(year)},
                "geometry": mapping(merged),
            }
        ],
    }


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for year in ("1794", "1819"):
        svg_path = download_svg(year)
        svg_out = save_svg(year, svg_path)
        geojson = build_geojson(svg_path, year)
        out_path = OUT_DIR / f"new-spain-{year}.geojson"
        out_path.write_text(json.dumps(geojson, separators=(",", ":")))
        print(f"Wrote {svg_out.relative_to(ROOT)}")
        print(f"Wrote {out_path.relative_to(ROOT)} ({out_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
