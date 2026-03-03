#!/usr/bin/env python3
import argparse
import csv
import json
import shutil
import subprocess
from pathlib import Path


DEFAULT_TAGS = [
    "FileName",
    "Directory",
    "FileSize",
    "FileType",
    "MIMEType",
    "ImageWidth",
    "ImageHeight",
    "Make",
    "Model",
    "LensModel",
    "Software",
    "DateTimeOriginal",
    "CreateDate",
    "ModifyDate",
    "Orientation",
    "ExposureTime",
    "FNumber",
    "ISO",
    "FocalLength",
    "Flash",
    "WhiteBalance",
    "GPSLatitude",
    "GPSLongitude",
]


def chunked(items, size):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def run_exiftool(file_paths):
    records = []
    for batch in chunked(file_paths, 200):
        cmd = ["exiftool", "-json", "-n"]
        cmd.extend(f"-{tag}" for tag in DEFAULT_TAGS)
        cmd.extend(batch)
        proc = subprocess.run(cmd, check=True, capture_output=True, text=True)
        records.extend(json.loads(proc.stdout))
    return records


def collect_files(input_dir, recursive):
    pattern = "**/*" if recursive else "*"
    return sorted(
        str(path)
        for path in input_dir.glob(pattern)
        if path.is_file() and path.name != ".DS_Store"
    )


def write_csv(output_path, records):
    headers = ["SourceFile", *DEFAULT_TAGS]
    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=headers)
        writer.writeheader()
        for record in records:
            row = {key: record.get(key, "") for key in headers}
            writer.writerow(row)


def main():
    parser = argparse.ArgumentParser(
        description="Extract photo metadata into a CSV file."
    )
    parser.add_argument(
        "input_dir",
        nargs="?",
        default=".",
        help="Folder that contains photo files (default: current directory).",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="photo_metadata.csv",
        help="Output CSV path (default: photo_metadata.csv).",
    )
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help="Scan files recursively.",
    )
    args = parser.parse_args()

    if shutil.which("exiftool") is None:
        raise SystemExit("Error: exiftool is not installed or not in PATH.")

    input_dir = Path(args.input_dir).resolve()
    output_path = Path(args.output).resolve()

    if not input_dir.exists() or not input_dir.is_dir():
        raise SystemExit(f"Error: input directory not found: {input_dir}")

    file_paths = collect_files(input_dir, args.recursive)
    file_paths = [
        path
        for path in file_paths
        if Path(path).resolve() not in {output_path, Path(__file__).resolve()}
    ]
    if not file_paths:
        raise SystemExit(f"No files found in {input_dir}")

    records = run_exiftool(file_paths)
    records = [
        record
        for record in records
        if str(record.get("MIMEType", "")).lower().startswith("image/")
    ]
    write_csv(output_path, records)
    print(f"Done: wrote {len(records)} rows to {output_path}")


if __name__ == "__main__":
    main()
