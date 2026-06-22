#!/usr/bin/env python3
"""Build New Spain GeoJSON from Milenioscuro's Wikimedia SVG maps (1794 and 1819)."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path
from xml.etree import ElementTree as ET

import numpy as np
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
from shapely.validation import make_valid
from svg.path import parse_path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src/maps/spanish-missions"
CACHE_DIR = ROOT / "scripts/.cache/new-spain"

SVG_URLS = {
    "1794": "https://upload.wikimedia.org/wikipedia/commons/4/41/Mapa_del_Virreinato_de_la_Nueva_Espa%C3%B1a_%281794%29.svg",
    "1819": "https://upload.wikimedia.org/wikipedia/commons/9/91/Mapa_del_Virreinato_de_la_Nueva_Espa%C3%B1a_%281819%29.svg",
}

CALIBRATION = {
    "México": (-99.1332, 19.4326),
    "Veracruz": (-96.1342, 19.1738),
    "Alta California": (-121.5, 37.0),
    "Baja California": (-112.0, 28.0),
    "Guatemala": (-90.5, 15.5),
    "Nicaragua": (-85.0, 12.8),
    "Luisiana": (-91.0, 31.0),
    "Texas": (-99.0, 31.0),
    "Santa Fe de Nuevo México": (-105.9378, 35.6870),
    "Sonora y Sinaloa": (-108.0, 26.0),
}

SKIP_FILLS = {"none", "transparent", "#ffffff", "#f2f2f2", "#c6a2c1", "#b3e7fa"}
CLIP = Polygon([(-125, 7), (-125, 45), (-74, 45), (-74, 7), (-125, 7)])


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


def fit_affine(svg_path: Path) -> tuple[np.ndarray, np.ndarray]:
    root = ET.parse(svg_path).getroot()
    points = []
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
        points.append((x, y, *CALIBRATION[label]))

    matrix = np.array([[x, y, 1] for x, y, _, _ in points])
    lon = np.array([point[2] for point in points])
    lat = np.array([point[3] for point in points])
    coeff_lon, _, _, _ = np.linalg.lstsq(matrix, lon, rcond=None)
    coeff_lat, _, _, _ = np.linalg.lstsq(matrix, lat, rcond=None)
    return coeff_lon, coeff_lat


def svg_bbox(path_data: str) -> tuple[float, float, float, float]:
    path = parse_path(path_data)
    xs: list[float] = []
    ys: list[float] = []
    for segment in path:
        for t in (0, 0.2, 0.4, 0.6, 0.8, 1.0):
            point = segment.point(t)
            xs.append(point.real)
            ys.append(point.imag)
    return min(xs), min(ys), max(xs), max(ys)


def in_main_map(bounds: tuple[float, float, float, float]) -> bool:
    x0, _, x1, y1 = bounds
    center_x = (x0 + x1) / 2
    if x0 > 320 or x1 < -340:
        return False
    if y1 < 100:
        return False
    if x0 > 420:
        return False
    if center_x > 230:
        return False
    return True


def to_lonlat(x: float, y: float, coeff_lon: np.ndarray, coeff_lat: np.ndarray) -> tuple[float, float]:
    lon = coeff_lon[0] * x + coeff_lon[1] * y + coeff_lon[2]
    lat = coeff_lat[0] * x + coeff_lat[1] * y + coeff_lat[2]
    return lon, lat


def path_to_geom(path_data: str, coeff_lon: np.ndarray, coeff_lat: np.ndarray):
    path = parse_path(path_data)
    points = []
    for segment in path:
        steps = min(max(2, int(segment.length() / 10) + 1), 40)
        for i in range(steps + 1):
            point = segment.point(i / steps)
            points.append(to_lonlat(point.real, point.imag, coeff_lon, coeff_lat))
    if len(points) < 4:
        return None
    if points[0] != points[-1]:
        points.append(points[0])
    geom = make_valid(Polygon(points))
    if geom.is_empty or geom.area < 0.05:
        return None
    return geom


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
    coeff_lon, coeff_lat = fit_affine(svg_path)
    root = ET.parse(svg_path).getroot()
    geoms = []

    for group in root.iter("{http://www.w3.org/2000/svg}g"):
        layer_id = group.get("id", "")
        if layer_id not in {"layer2", "layer4"}:
            continue
        for path in group.iter("{http://www.w3.org/2000/svg}path"):
            path_data = path.get("d", "")
            if len(path_data) < 500:
                continue
            style = path.get("style", "")
            fill = path.get("fill", "")
            match = re.search(r"fill:([^;]+)", style)
            if match:
                fill = match.group(1).strip()
            if fill in SKIP_FILLS:
                continue
            if not in_main_map(svg_bbox(path_data)):
                continue
            geom = path_to_geom(path_data, coeff_lon, coeff_lat)
            if geom is not None:
                geoms.append(geom)

    merged = normalize_geometry(make_valid(unary_union(geoms)))
    merged = normalize_geometry(make_valid(merged.intersection(CLIP)))
    merged = merged.simplify(0.025, preserve_topology=True)

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
        geojson = build_geojson(svg_path, year)
        out_path = OUT_DIR / f"new-spain-{year}.geojson"
        out_path.write_text(json.dumps(geojson, separators=(",", ":")))
        print(f"Wrote {out_path.relative_to(ROOT)} ({out_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
