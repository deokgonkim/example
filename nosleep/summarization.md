Created multiple nosleep implementations for Ubuntu Wayland using xdg-desktop-portal's Inhibit API: Python (`nosleep.py`), Node.js (`nosleep.js`), Rust (`nosleep-rs/`), Go (`nosleep.go`), and a shell script (`nosleep.sh`). Each version calls `gdbus` to request an idle/screen saver inhibit and keeps the process alive until interrupted.

Adjusted the Go and shell versions to handle portal signature differences by trying the no-window-handle form first and falling back to the variant that includes a window handle when needed. Also created patch files capturing changes: a full patch at `nosleep.patch`, a Go-only patch at `nosleep-go.patch`, and a targeted Go fix patch at `nosleep-go-fix.patch`.

Usage examples:
- Go: `go build -o nosleep-go nosleep.go && ./nosleep-go --reason "Watching a movie"`
- Shell: `./nosleep.sh --reason "Watching a movie"`
