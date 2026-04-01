#!/bin/bash
# Usage: ./heic2jpg.sh [-o OUTPUT_DIR]
# Converts all HEIC/heic files to JPG with auto-orientation.
# Output filename: YYYYMMDD_HHMMSS_[original].jpg (uses EXIF DateTimeOriginal via exiftool)
# Falls back to [original].jpg when no EXIF date is available.

OUTPUT_DIR="."

while getopts "o:" opt; do
    case $opt in
        o) OUTPUT_DIR="$OPTARG" ;;
        *) echo "Usage: $0 [-o output_dir]"; exit 1 ;;
    esac
done

mkdir -p "$OUTPUT_DIR"

# Collect all HEIC files (case-insensitive)
files=(*.[hH][eE][iI][cC])
total=${#files[@]}
count=0

for f in "${files[@]}"; do
    count=$((count + 1))
    base="${f%.*}"

    # Extract DateTimeOriginal from EXIF using exiftool
    taken=$(exiftool -DateTimeOriginal -d "%Y%m%d_%H%M%S" -s3 "$f" 2>/dev/null)

    if [ -n "$taken" ]; then
        outname="${taken}_${base}.jpg"
    else
        outname="${base}.jpg"
    fi

    echo "[$count/$total] $f → $outname"
    convert "$f" -auto-orient "$OUTPUT_DIR/$outname"
done

echo "완료! ($total 파일 변환됨)"
