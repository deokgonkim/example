# first `gnome-extension` app

## Create extension

```bash
gnome-extensions create --interactive
# the extension will be created in `.local/share/gnome-shell/extensions/`
```

## Create `pot` file for translation

- reference: https://gjs.guide/extensions/development/translations.html

```bash
xgettext --from-code=UTF-8 --output=po/dgkim-first@dgkim.net.pot *.js
```

## Edit translation with poeditor


```bash
# I uses poedit
flatpak run net.poedit.Poedit
```

## Build

```bash
gnome-extensions pack --podir=po
```

## install

```bash
gnome-extensions install dgkim-first@dgkim.net.shell-extension.zip --force
```

### Running nested gnome-shell for testing

```bash
dbus-run-session -- gnome-shell --nested --wayland
```
