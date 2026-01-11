#!/usr/bin/env python3
import argparse
import subprocess
import sys
import time

PORTAL_DEST = "org.freedesktop.portal.Desktop"
PORTAL_PATH = "/org/freedesktop/portal/desktop"
PORTAL_IFACE = "org.freedesktop.portal.Inhibit"

# Portal flags: 1=logout, 2=user-switch, 4=suspend, 8=idle
INHIBIT_IDLE = 8


def build_gdbus_args(app_id: str, reason: str) -> list[str]:
    # gdbus expects a{sv} with variant values.
    options = "{'reason': <'" + reason.replace("'", "\\'") + "'>}"
    return [
        "gdbus",
        "call",
        "--session",
        "--dest",
        PORTAL_DEST,
        "--object-path",
        PORTAL_PATH,
        "--method",
        f"{PORTAL_IFACE}.Inhibit",
        app_id,
        "",  # No window handle
        str(INHIBIT_IDLE),
        options,
    ]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Prevent idle sleep/screensaver via xdg-desktop-portal."
    )
    parser.add_argument(
        "--app-id",
        default="com.example.nosleep",
        help="Application ID string for the portal request.",
    )
    parser.add_argument(
        "--reason",
        default="Keeping the session awake",
        help="Human-readable reason for the inhibit request.",
    )
    args = parser.parse_args()

    gdbus_args = build_gdbus_args(args.app_id, args.reason)

    try:
        result = subprocess.run(
            gdbus_args,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except FileNotFoundError:
        print("gdbus not found. Install the 'glib2.0-bin' package.", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print("Failed to request inhibit via xdg-desktop-portal.", file=sys.stderr)
        if exc.stderr:
            print(exc.stderr.strip(), file=sys.stderr)
        return exc.returncode

    # The returned handle is tied to this process's bus name; keep it alive.
    handle = result.stdout.strip()
    print("Inhibit active. Press Ctrl+C to release.")
    if handle:
        print(f"Portal handle: {handle}")

    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("Releasing inhibit and exiting.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
