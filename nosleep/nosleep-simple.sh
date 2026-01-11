#!/usr/bin/env sh
set -eu

gdbus call --session \
  --dest org.freedesktop.portal.Desktop \
  --object-path /org/freedesktop/portal/desktop \
  --method org.freedesktop.portal.Inhibit.Inhibit \
  com.example.nosleep 8 "{'reason': <'Keeping the session awake'>}" >/dev/null

sleep infinity
