#!/usr/bin/env python3
"""
Organize media files into ./YYYY/ folders based on capture date metadata (EXIF/QuickTime) via exiftool.

Changes vs previous:
1) Year-only folder (YYYY)
2) No mtime fallback. If metadata missing -> keep in place by default
3) No separate dst root: organizes under the given root directory itself (default: current directory)

Examples:
  python organize_by_year.py                 # organize under current dir
  python organize_by_year.py ~/Pictures      # organize under ~/Pictures
  python organize_by_year.py . --dry-run
  python organize_by_year.py . --unknown-folder UnknownYear
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional


MEDIA_EXTS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".gif", ".webp", ".tif", ".tiff",
    ".mp4", ".mov", ".m4v", ".avi", ".mkv", ".3gp", ".mts", ".m2ts",
    ".dng", ".arw", ".cr2", ".cr3", ".nef", ".orf", ".rw2",
}


@dataclass
class CaptureInfo:
    year: str
    source: str  # "metadata"


def is_media_file(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in MEDIA_EXTS


def run_exiftool_json(path: Path) -> Optional[dict]:
    try:
        result = subprocess.run(
            ["exiftool", "-j", "-api", "QuickTimeUTC=1", str(path)],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 or not result.stdout.strip():
            return None
        data = json.loads(result.stdout)
        return data[0] if data else None
    except FileNotFoundError:
        raise SystemExit("exiftool not found. Install: sudo apt install -y exiftool")
    except Exception:
        return None


def parse_exiftool_datetime(d: dict) -> Optional[datetime]:
    candidates = [
        "DateTimeOriginal",
        "CreateDate",
        "MediaCreateDate",
        "TrackCreateDate",
        "QuickTime:CreateDate",
    ]

    for key in candidates:
        val = d.get(key)
        if not val:
            continue

        s = str(val).strip().replace("Z", "+00:00")
        # exiftool typical: YYYY:MM:DD HH:MM:SS(+TZ)
        if len(s) >= 10 and s[4] == ":" and s[7] == ":":
            s = s[:10].replace(":", "-") + s[10:]

        # Try a few common parses
        for fmt in (None, "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S%z"):
            try:
                return datetime.fromisoformat(s) if fmt is None else datetime.strptime(s, fmt)
            except Exception:
                pass

    return None


def capture_year_from_metadata(path: Path) -> Optional[CaptureInfo]:
    meta = run_exiftool_json(path)
    if not meta:
        return None
    dt = parse_exiftool_datetime(meta)
    if not dt:
        return None
    return CaptureInfo(year=f"{dt.year:04d}", source="metadata")


def unique_dest_path(dest: Path) -> Path:
    if not dest.exists():
        return dest
    stem, suffix = dest.stem, dest.suffix
    i = 1
    while True:
        candidate = dest.with_name(f"{stem} ({i}){suffix}")
        if not candidate.exists():
            return candidate
        i += 1


def should_skip_path(p: Path, root: Path) -> bool:
    """
    Skip files already inside a YYYY folder at root level (e.g., ./2025/...)
    to avoid endlessly re-processing moved files on repeated runs.
    """
    try:
        rel = p.relative_to(root)
    except ValueError:
        return True

    if len(rel.parts) >= 2:
        top = rel.parts[0]
        if top.isdigit() and len(top) == 4:
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", nargs="?", default=".", type=Path,
                    help="Root directory to organize under (default: current dir)")
    ap.add_argument("--dry-run", action="store_true", help="Print actions without moving files")
    ap.add_argument("--copy", action="store_true", help="Copy instead of move")
    ap.add_argument("--include-non-media", action="store_true", help="Also process non-media files")
    ap.add_argument("--unknown-folder", default=None,
                    help="If set, files with no readable metadata will be moved into this folder under root (e.g., 'Unknown')")
    args = ap.parse_args()

    root = args.root.expanduser().resolve()
    if not root.is_dir():
        raise SystemExit(f"Not a directory: {root}")

    moved = 0
    skipped = 0
    kept = 0

    for p in root.rglob("*"):
        if not p.is_file():
            continue

        if should_skip_path(p, root):
            continue

        if (not args.include_non_media) and (not is_media_file(p)):
            skipped += 1
            continue

        info = capture_year_from_metadata(p)
        if info is None:
            if args.unknown_folder:
                target_dir = root / args.unknown_folder
            else:
                # default: keep in place
                kept += 1
                continue
        else:
            target_dir = root / info.year

        target_dir.mkdir(parents=True, exist_ok=True)
        dest = unique_dest_path(target_dir / p.name)

        action = "COPY" if args.copy else "MOVE"
        src_display = str(p)
        dst_display = str(dest)
        if info is None:
            print(f"{action} [no-meta ] {src_display} -> {dst_display}")
        else:
            print(f"{action} [{info.source}] {src_display} -> {dst_display}")

        if args.dry_run:
            continue

        try:
            if args.copy:
                shutil.copy2(p, dest)
            else:
                shutil.move(p, dest)
            moved += 1
        except Exception as e:
            print(f"  !! failed: {e}")
            skipped += 1

    print(f"\nDone. moved/copied={moved}, kept(no-meta)={kept}, skipped={skipped}")
    if args.dry_run:
        print("Dry-run mode: no files were changed.")


if __name__ == "__main__":
    main()

