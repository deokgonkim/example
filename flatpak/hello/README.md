# hello world using flatpak

## Add repository

```bash
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

## Build

```bash
flatpak-builder --force-clean --user --install-deps-from=flathub --repo=repo --install builddir net.dgkim.Hello.yml
```

## Run

```bash
flatpak run net.dgkim.Hello
```
