# Repository Guidelines

## Project Structure & Module Organization
This repository is a small collection of “nosleep” utilities for Ubuntu Wayland, each in a different language. Key files and folders:
- `nosleep.py`, `nosleep.js`, `nosleep.go`, `nosleep.sh`: standalone implementations that call `gdbus` to request an idle/screen saver inhibit.
- `nosleep-rs/`: Rust implementation (Cargo project).
- `*.patch`: patch files capturing changes (`nosleep.patch`, `nosleep-go.patch`, `nosleep-go-fix.patch`).
- `summarization.md`, `talk.md`: project notes and conversation log.
- `screenshot.png`: asset (if needed for docs/demo).

## Build, Test, and Development Commands
There is no unified build system; use language-specific commands:
- Python: `./nosleep.py --reason "Watching a movie"`
- Node.js: `./nosleep.js --reason "Watching a movie"`
- Go: `go build -o nosleep-go nosleep.go`
- Rust: `cd nosleep-rs && cargo build --release`
- Shell: `./nosleep.sh --reason "Watching a movie"`

Each program uses `gdbus` (package: `glib2.0-bin`) and keeps running until interrupted.

## Coding Style & Naming Conventions
Keep files ASCII-only. Use concise, readable code and small helper functions. Prefer simple CLI flags:
- `--app-id` for portal app ID
- `--reason` for human-readable inhibit reason
Naming: lower_snake_case for shell/Python helpers, lowerCamelCase in JS, and idiomatic Go/Rust naming.

## Testing Guidelines
No automated tests are set up in this repository. Manual verification is expected:
- Run the chosen binary/script and confirm the session does not idle.
- If a portal signature mismatch occurs, ensure the fallback path works.

## Commit & Pull Request Guidelines
Commit conventions are not established in this directory. Use clear, imperative messages (e.g., "Add Go fallback for portal signature"). For PRs, include a short description and how to run the relevant version (command + expected behavior).

## Security & Configuration Tips
These tools invoke `gdbus` on the session bus only. Avoid embedding secrets. If distributing, document the `glib2.0-bin` dependency and the expected Wayland environment.
