#!/usr/bin/env python3
"""Convert Esri shapefile(s) to GeoJSON.

Usage:
  python3 scripts/convert-shapefile.py /path/to/Provincia_mayor_merge.shp
  python3 scripts/convert-shapefile.py /path/to/folder --merge

If given a directory, converts every .shp found (or merges with --merge).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    import shapefile
except ImportError:
    print("Install pyshp first: pip3 install pyshp", file=sys.stderr)
    raise SystemExit(1)


def shp_to_features(shp_path: Path) -> list[dict]:
    reader = shapefile.Reader(str(shp_path))
    field_names = [field[0] for field in reader.fields[1:]]
    features = []

    for shape_record in reader.iterShapeRecords():
        geometry = shape_record.shape.__geo_interface__
        properties = dict(zip(field_names, shape_record.record))
        features.append({
            "type": "Feature",
            "geometry": geometry,
            "properties": properties,
        })

    return features


def write_geojson(features: list[dict], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    geojson = {"type": "FeatureCollection", "features": features}
    out_path.write_text(json.dumps(geojson, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(features)} features -> {out_path}")


def resolve_inputs(path: Path) -> list[Path]:
    if path.is_file() and path.suffix.lower() == ".shp":
        return [path]

    if path.is_dir():
        shapefiles = sorted(path.glob("*.shp"))
        if not shapefiles:
            raise FileNotFoundError(f"No .shp files in {path}")
        return shapefiles

    shp = path.with_suffix(".shp")
    if shp.is_file():
        return [shp]

    raise FileNotFoundError(path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert shapefile(s) to GeoJSON")
    parser.add_argument("input", type=Path, help="Path to .shp file or directory")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output .geojson path (default: same name as input .shp)",
    )
    parser.add_argument(
        "--merge",
        action="store_true",
        help="When input is a directory, write one merged GeoJSON",
    )
    args = parser.parse_args()

    inputs = resolve_inputs(args.input)
    if args.merge or len(inputs) > 1 and args.input.is_dir() and not args.output:
        features: list[dict] = []
        for shp_path in inputs:
            features.extend(shp_to_features(shp_path))
        out_path = args.output or (args.input / f"{args.input.name}.geojson")
        write_geojson(features, out_path)
        return 0

    for shp_path in inputs:
        out_path = args.output or shp_path.with_suffix(".geojson")
        if len(inputs) > 1 and args.output:
            raise SystemExit("--output with multiple shapefiles requires --merge")
        write_geojson(shp_to_features(shp_path), out_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
