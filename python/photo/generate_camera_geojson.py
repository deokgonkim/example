#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


def to_float(value):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def build_href(row, csv_dir):
    source = (row.get("SourceFile") or "").strip()
    if source:
        source_path = Path(source)
        if not source_path.is_absolute():
            source_path = (csv_dir / source_path).resolve()
        else:
            source_path = source_path.resolve()
        return source_path.as_uri()
    return ""


def build_features(csv_path, include_href):
    features = []
    with csv_path.open("r", newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        csv_dir = csv_path.parent
        for row in reader:
            lat = to_float(row.get("GPSLatitude"))
            lon = to_float(row.get("GPSLongitude"))
            if lat is None or lon is None:
                continue

            properties = {
                "make": (row.get("Make") or "").strip(),
                "model": (row.get("Model") or "").strip(),
                "longitude": lon,
                "latitude": lat,
            }
            if include_href:
                properties["href"] = build_href(row, csv_dir)

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat],
                },
                "properties": properties,
            }
            features.append(feature)
    return features


def main():
    parser = argparse.ArgumentParser(
        description="Generate GeoJSON from metadata CSV using camera make/model and GPS coordinates."
    )
    parser.add_argument(
        "csv_path",
        nargs="?",
        default="metadata.csv",
        help="Input metadata CSV path (default: metadata.csv).",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="camera_locations.geojson",
        help="Output GeoJSON path (default: camera_locations.geojson).",
    )
    parser.add_argument(
        "--include-href",
        action="store_true",
        help="Include file href in properties using SourceFile as file:// URL.",
    )
    args = parser.parse_args()

    csv_path = Path(args.csv_path).resolve()
    output_path = Path(args.output).resolve()

    if not csv_path.exists():
        raise SystemExit(f"Error: CSV file not found: {csv_path}")

    features = build_features(csv_path, include_href=args.include_href)
    geojson = {"type": "FeatureCollection", "features": features}

    with output_path.open("w", encoding="utf-8") as out_file:
        json.dump(geojson, out_file, ensure_ascii=False, indent=2)

    print(f"Done: wrote {len(features)} features to {output_path}")


if __name__ == "__main__":
    main()
