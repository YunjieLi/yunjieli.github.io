#!/usr/bin/env python3
"""Build historical Mexico and Texas boundary GeoJSON layers.

Mexico-1821: union(countries.geojson) + (union(1848 US) - Oregon Territory - union(1840 US))
Mexico-1823: union(Mexico from countries.geojson) + (union(1848 US) - Oregon Territory - union(1840 US))
Mexico-1836: Mexico-1823 - Texas
Mexico-1848: Mexico from countries.geojson + northern patch, minus 1848 US borders, clipped to original coastline
Texas: Texas from context-us_1845 (Republic boundaries; annexed into US from 1845)
"""

from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import Polygon, box, mapping, shape
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parents[1]
MAPS = ROOT / "src/maps/spanish-missions"
LAYERS = MAPS / "layers"
COUNTRIES = MAPS / "references/countries.geojson"
US_1840 = LAYERS / "context-us_state_1840.geojson"
US_1845 = LAYERS / "context-us_1845.geojson"
US_1848 = LAYERS / "context-us_1848.geojson"

MIN_PART_AREA = 0.01
# NHGIS leaves a ~0.5° gap between Mexico (modern border) and New Mexico Territory.
GAP_BRIDGE_DISTANCE = 0.55
# Tall band patched onto Mexico's northern SW edge before subtracting 1848 US borders.
NORTHERN_PATCH_BOX = box(-117, 31, -106, 34)
# Inland-only corridor for the NHGIS gap bridge (excludes Pacific coast and Gulf of California).
NORTHERN_LAND_CORRIDOR = box(-112, 31.8, -106, 34)


def fill_holes(geom):
    """Drop interior rings so enclosed land belongs to the territory."""
    geom = make_valid(geom)
    if geom.is_empty:
        return geom
    if geom.geom_type == "Polygon":
        return Polygon(geom.exterior)
    if geom.geom_type == "MultiPolygon":
        return unary_union([Polygon(part.exterior) for part in geom.geoms])
    if geom.geom_type == "GeometryCollection":
        polys = [fill_holes(part) for part in geom.geoms if not part.is_empty]
        if not polys:
            return geom
        return unary_union(polys)
    return geom


def finalize_territory(geom):
    return clean_geom(fill_holes(geom))


def clean_geom(geom):
    geom = make_valid(geom)
    if geom.is_empty:
        return geom
    if geom.geom_type == "MultiPolygon":
        parts = [p for p in geom.geoms if p.area >= MIN_PART_AREA]
        if len(parts) == 1:
            return parts[0]
        if not parts:
            raise ValueError("All polygon parts were below MIN_PART_AREA")
        geom = unary_union(parts)
    return make_valid(geom)


def load_geojson(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def feature_geom(feature: dict):
    geom = make_valid(shape(feature["geometry"]))
    if geom.is_empty:
        raise ValueError(f"Empty geometry in {feature.get('properties')}")
    return geom


def union_features(features: list[dict]):
    geoms = [feature_geom(f) for f in features]
    return make_valid(unary_union(geoms))


def features_by_name(geojson: dict, names: tuple[str, ...]) -> list[dict]:
    wanted = set(names)
    return [f for f in geojson["features"] if f["properties"].get("name") in wanted]


def features_by_state(geojson: dict, names: tuple[str, ...]) -> list[dict]:
    wanted = set(names)
    return [
        f for f in geojson["features"]
        if f["properties"].get("STATENAM") in wanted
    ]


def single_feature(geom, name: str, year: int | None = None) -> dict:
    props = {"name": name}
    if year is not None:
        props["year"] = year
    return {
        "type": "Feature",
        "properties": props,
        "geometry": mapping(geom),
    }


def feature_collection(features: list[dict]) -> dict:
    return {"type": "FeatureCollection", "features": features}


def write_geojson(path: Path, geojson: dict) -> None:
    path.write_text(json.dumps(geojson, separators=(",", ":")), encoding="utf-8")


def us_territory_patch(us_later: dict, us_1840: dict):
    """Later US states/territories minus Oregon Territory minus 1840 US."""
    us_later_union = union_features(us_later["features"])
    oregon = feature_geom(features_by_state(us_later, ("Oregon Territory",))[0])
    us_1840_union = union_features(us_1840["features"])
    subtract = unary_union([oregon, us_1840_union])
    return finalize_territory(us_later_union.difference(subtract))


def union_with_patch_bridge(base, patch):
    """Union base territory with the US patch and bridge narrow gaps between them."""
    bridge = base.buffer(GAP_BRIDGE_DISTANCE).intersection(patch.buffer(GAP_BRIDGE_DISTANCE))
    return finalize_territory(unary_union([base, patch, bridge]))


def build_mexico_1821(countries: dict, us_1840: dict, us_1848: dict):
    countries_union = clean_geom(union_features(countries["features"]))
    patch = us_territory_patch(us_1848, us_1840)
    geom = union_with_patch_bridge(countries_union, patch)
    return single_feature(geom, "Mexico", 1821)


def build_mexico_1823(countries: dict, us_1840: dict, us_1848: dict):
    mexico = clean_geom(feature_geom(features_by_name(countries, ("Mexico",))[0]))
    patch = us_territory_patch(us_1848, us_1840)
    geom = union_with_patch_bridge(mexico, patch)
    return single_feature(geom, "Mexico", 1823)


def build_mexico_1836(mexico_1823_geom, us_1845: dict):
    texas = feature_geom(features_by_state(us_1845, ("Texas",))[0])
    geom = finalize_territory(mexico_1823_geom.difference(texas))
    return single_feature(geom, "Mexico", 1836)


def clip_to_original_coastline(geom, coastline, inland_corridor):
    """Keep the source coastline; only allow additions outside it on inland land."""
    trimmed = unary_union([
        geom.intersection(coastline),
        geom.difference(coastline).intersection(inland_corridor),
    ])
    return finalize_territory(trimmed)


def build_mexico_1848(countries: dict, us_1848: dict):
    """Modern Mexico with NHGIS gap closed, preserving the original coastline."""
    mexico = clean_geom(feature_geom(features_by_name(countries, ("Mexico",))[0]))
    us_union = union_features(us_1848["features"])
    extended = unary_union([mexico, NORTHERN_PATCH_BOX])
    raw = extended.difference(us_union)
    geom = clip_to_original_coastline(raw, mexico, NORTHERN_LAND_CORRIDOR)
    return single_feature(geom, "Mexico", 1848)


def build_texas(us_1845: dict):
    texas = features_by_state(us_1845, ("Texas",))[0]
    feature = dict(texas)
    props = dict(feature.get("properties") or {})
    props["name"] = "Texas"
    props["year"] = 1836
    feature["properties"] = props
    return feature


def main() -> int:
    countries = load_geojson(COUNTRIES)
    us_1840 = load_geojson(US_1840)
    us_1845 = load_geojson(US_1845)
    us_1848 = load_geojson(US_1848)

    mexico_1821 = build_mexico_1821(countries, us_1840, us_1848)
    mexico_1823 = build_mexico_1823(countries, us_1840, us_1848)
    mexico_1823_geom = shape(mexico_1823["geometry"])
    mexico_1836 = build_mexico_1836(mexico_1823_geom, us_1845)

    outputs = {
        "context-mexico-1821.geojson": mexico_1821,
        "context-mexico-1823.geojson": mexico_1823,
        "context-mexico-1836.geojson": mexico_1836,
        "context-mexico-1848.geojson": build_mexico_1848(countries, us_1848),
        "context-texas.geojson": build_texas(us_1845),
    }

    for filename, feature in outputs.items():
        out = LAYERS / filename
        write_geojson(out, feature_collection([feature]))
        geom_type = feature["geometry"]["type"]
        size = out.stat().st_size
        print(f"Wrote {out.relative_to(ROOT)} ({size:,} bytes, {geom_type})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
