# Hello World Tauri App

Minimal Tauri desktop app with:

- a plain HTML/CSS/JS frontend in `src/`
- a Rust backend in `src-tauri/`
- no frontend framework dependency

## OS dependencies

### Debian / Ubuntu

Install the Linux build dependencies Tauri expects before running the app:

```bash
sudo apt update
sudo apt install \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

On some systems, `libsoup3.0-dev` may also be needed as a transitive WebKitGTK dependency. If `apt` or the linker reports a missing Soup 3 development package, install it explicitly:

```bash
sudo apt install libsoup3.0-dev
```

Tauri's current Debian/Ubuntu prerequisite list is based on `libwebkit2gtk-4.1-dev`, which is the primary package to prefer for Tauri v2.

## Run

1. Install JavaScript dependencies:

```bash
npm install
```

2. Start the desktop app in development mode:

```bash
npm run tauri:dev
```

3. Build a production bundle:

```bash
npm run tauri:build
```

The frontend dev server runs on `http://127.0.0.1:1420`, and production assets are generated into `dist/`.
