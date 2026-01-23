#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: dedupe_sha1.sh [--delete] [--dry-run] [--report FILE] DIR

Find duplicate files by SHA1 hash. By default, runs in dry-run mode and prints
which files would be removed. The first file seen for a given hash is kept.

Options:
  --delete       Move duplicates to Trash (default: dry-run)
  --dry-run      Print duplicates without deleting (default)
  --report FILE  Write duplicate pairs to FILE
  -h, --help     Show this help

Example:
  ./dedupe_sha1.sh --dry-run /path/to/dir
  ./dedupe_sha1.sh --delete --report dupes.txt /path/to/dir
USAGE
}

mode="dry"
report=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delete) mode="delete"; shift ;;
    --dry-run) mode="dry"; shift ;;
    --report)
      report="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    --*)
      echo "Unknown option: $1" >&2
      usage; exit 1 ;;
    *) break ;;
  esac
 done

if [[ $# -ne 1 ]]; then
  usage; exit 1
fi

dir="$1"
if [[ ! -d "$dir" ]]; then
  echo "Not a directory: $dir" >&2
  exit 1
fi

if [[ -n "$report" ]]; then
  : > "$report"
fi

trash_dir="$dir/Trash"
if [[ "$mode" == "delete" ]]; then
  mkdir -p "$trash_dir"
fi

# Map of hash -> first file seen
declare -A seen

while IFS= read -r -d '' file; do
  [[ -f "$file" ]] || continue
  # Skip files already in Trash
  case "$file" in
    "$trash_dir"/*) continue ;;
  esac
  hash=$(sha1sum "$file" | awk '{print $1}')

  if [[ -n "${seen[$hash]:-}" ]]; then
    kept="${seen[$hash]}"
    if [[ "$mode" == "delete" ]]; then
      base="$(basename "$file")"
      target="$trash_dir/$base"
      if [[ -e "$target" ]]; then
        target="$trash_dir/${base}.$(date +%s).$$"
      fi
      mv -- "$file" "$target"
      action="TRASHED"
    else
      action="DUP"
    fi
    echo "$action: $file (same as $kept)"
    if [[ -n "$report" ]]; then
      printf '%s\t%s\t%s\n' "$action" "$file" "$kept" >> "$report"
    fi
  else
    seen[$hash]="$file"
  fi
 done < <(find "$dir" -type f -print0)
