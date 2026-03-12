# converting image

### convert RGB image to RGBA image

```bash
convert icon.png -alpha on -background none -define png:color-type=6 icon2.png
```

### resize image

```bash
convert -resize 256 icon.png icon2.png
```

## (I don't understand yet) generate image

```bash
npx tauri icon icons/icon.png
```
this will generate several icon files for several platforms.

