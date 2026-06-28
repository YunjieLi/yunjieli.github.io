#!/usr/bin/env python3
"""Build presidios.geojson from references/presidios-frontier-districts.csv."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "src/maps/spanish-missions/references/presidios-frontier-districts.csv"
OUT_PATH = ROOT / "src/maps/spanish-missions/layers/presidios.geojson"

# Historic presidio sites (lon, lat). Keys match the presidio column in the CSV.
COORDS: dict[str, tuple[float, float]] = {
    "El Presidio Real de San Diego": (-117.1943, 32.7587),
    "El Presidio Real de Monterrey": (-121.8974, 36.5977),
    "El Presidio de San Francisco": (-122.4641, 37.8014),
    "El Presidio Real de Santa Bárbara": (-119.6986, 34.4383),
    "El Presidio de Nuestra Señora de Loreto": (-111.349, 26.014),
    "El Presidio de San José del Cabo": (-109.695, 23.061),
    "Presidio de Santa Cruz de Terrenate": (-110.188, 31.723),
    "Presidio de San Miguel de Horcasitas": (-110.917, 29.333),
    "Presidio de San Ignacio de Tubac": (-111.047, 31.612),
    "Presidio de Santa Gertrudis de Altar": (-111.959, 30.714),
    "Presidio de San Agustín del Tucsón": (-110.974, 32.222),
    "Presidio de San Carlos de Buenavista": (-109.874, 27.959),
    "Presidio de Arizpe": (-110.130, 30.343),
    "Presidio de San Francisco de Conchos": (-105.3485, 27.2742),
    "Presidio de San Pedro de Janos": (-108.1947, 30.8881),
    "Presidio de San Juan Bautista de Carrizal": (-105.8892, 27.9444),
    "Presidio de Real de San Carlos de Cerro Gordo": (-104.3647, 24.3572),
    "Presidio de San Elzeario (San Elizario)": (-106.2727, 31.5852),
    "Real de San José del Parral (Capital)": (-105.6664, 26.9318),
    "Villa de San Felipe el Real de Chihuahua (Capital)": (-106.0691, 28.6329),
    "El Presidio Real de Santa Fe": (-105.9382, 35.6872),
    "Presidio de San Juan Bautista del Río Grande": (-100.3769, 28.3083),
    "Presidio de San Francisco de Coahuila (Monclova)": (-101.4215, 26.9005),
    "Presidio de Santa Rosa María del Sacramento": (-101.5172, 27.8786),
    "Presidio de San Antonio de Béxar": (-98.4861, 29.4258),
    "Presidio de Nuestra Señora de Loreto de la Bahía": (-97.3881, 28.6477),
    "Presidio de Los Adaes (Early Capital)": (-93.3068, 31.6913),
}


def parse_optional_int(value: str) -> int | None:
    text = (value or "").strip()
    if not text:
        return None
    return int(float(text))


def add_capital_end_years(features: list[dict]) -> None:
    by_region: dict[str, list[tuple[int, dict[str, object]]]] = {}
    for feature in features:
        props = feature["properties"]
        became = props.get("year_became_capital")
        if became is None:
            continue
        by_region.setdefault(str(props["region"]), []).append((int(became), props))

    for capitals in by_region.values():
        capitals.sort(key=lambda item: item[0])
        for index, (_, props) in enumerate(capitals):
            if index + 1 < len(capitals):
                props["year_ended_as_capital"] = capitals[index + 1][0]
            else:
                props.pop("year_ended_as_capital", None)


def main() -> int:
    if not CSV_PATH.exists():
        print(f"Missing {CSV_PATH}", file=sys.stderr)
        return 1

    features = []
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        for index, row in enumerate(csv.DictReader(handle), start=1):
            name = row["presidio"].strip()
            if name not in COORDS:
                print(f"Missing coordinates for {name!r}", file=sys.stderr)
                return 1
            lon, lat = COORDS[name]
            year_became_capital = parse_optional_int(row.get("year_became_capital", ""))
            properties: dict[str, object] = {
                "name": name,
                "location": row["modern_day_location"].strip(),
                "year": int(row["year_built"]),
                "region": row["region"].strip(),
            }
            if year_became_capital is not None:
                properties["year_became_capital"] = year_became_capital
            features.append(
                {
                    "type": "Feature",
                    "id": index,
                    "geometry": {"type": "Point", "coordinates": [lon, lat]},
                    "properties": properties,
                }
            )

    add_capital_end_years(features)

    geojson = {"type": "FeatureCollection", "features": features}
    OUT_PATH.write_text(json.dumps(geojson, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {OUT_PATH.relative_to(ROOT)} ({len(features)} presidios)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
