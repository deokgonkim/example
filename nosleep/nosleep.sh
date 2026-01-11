#!/usr/bin/env sh
set -eu

APP_ID="com.example.nosleep"
REASON="Keeping the session awake"

usage() {
  echo "Usage: nosleep.sh [--app-id ID] [--reason TEXT]" >&2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --app-id)
      shift
      [ "$#" -gt 0 ] || { usage; exit 1; }
      APP_ID="$1"
      ;;
    --reason)
      shift
      [ "$#" -gt 0 ] || { usage; exit 1; }
      REASON="$1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      exit 1
      ;;
  esac
  shift
 done

if ! command -v gdbus >/dev/null 2>&1; then
  echo "gdbus not found. Install the 'glib2.0-bin' package." >&2
  exit 1
fi

escape_reason() {
  printf "%s" "$1" | sed "s/'/\\\\'/g"
}

REASON_ESCAPED=$(escape_reason "$REASON")
OPTIONS="{'reason': <'${REASON_ESCAPED}'>}"

OUTPUT=$(gdbus call --session \
  --dest org.freedesktop.portal.Desktop \
  --object-path /org/freedesktop/portal/desktop \
  --method org.freedesktop.portal.Inhibit.Inhibit \
  "$APP_ID" 8 "$OPTIONS" 2>&1) || {
  # Fallback for portals that include a window handle parameter.
  OUTPUT=$(gdbus call --session \
    --dest org.freedesktop.portal.Desktop \
    --object-path /org/freedesktop/portal/desktop \
    --method org.freedesktop.portal.Inhibit.Inhibit \
    "$APP_ID" "" 8 "$OPTIONS" 2>&1) || {
      echo "Failed to request inhibit via xdg-desktop-portal." >&2
      echo "$OUTPUT" >&2
      exit 1
    }
}

HANDLE=$(printf "%s" "$OUTPUT" | tr -d '\n')

echo "Inhibit active. Press Ctrl+C to release."
[ -n "$HANDLE" ] && echo "Portal handle: $HANDLE"

while :; do
  sleep 60
 done
