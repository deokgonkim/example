# Photo Metadata and Camera Chart Documentation

## Conversation Summary

This folder contains photo files named with UUID-like filenames (no file extensions).

You requested:
1. A script to extract metadata (camera model, etc.) into a CSV.
2. An additional script to create pie charts based on camera make and model.
3. Markdown documentation of what we completed.

Completed:
1. Added metadata extraction script: `extract_photo_metadata.py`
2. Ran extraction and generated: `metadata.csv`
3. Added pie chart script: `create_camera_pie_charts.py`
4. Ran chart script and generated:
   - `camera_make_pie.png`
   - `camera_model_pie.png`

## Files Added

- `extract_photo_metadata.py`
- `create_camera_pie_charts.py`
- `PHOTO_METADATA_DOCUMENTATION.md` (this document)

## Generated Outputs

- `metadata.csv`
- `camera_make_pie.png`
- `camera_model_pie.png`

## 1) Metadata Extraction Script

Script: `extract_photo_metadata.py`

Purpose:
- Scans files in a directory
- Uses `exiftool` to read EXIF/metadata
- Exports selected metadata fields to CSV

Key exported columns:
- `Make`
- `Model`
- `LensModel`
- `DateTimeOriginal`
- `CreateDate`
- `ModifyDate`
- `ImageWidth`, `ImageHeight`
- `ISO`, `FNumber`, `ExposureTime`, `FocalLength`
- `GPSLatitude`, `GPSLongitude`
- plus file-level columns like `SourceFile`, `FileType`, `MIMEType`

Run:

```bash
python3 extract_photo_metadata.py -o metadata.csv
```

Optional:

```bash
python3 extract_photo_metadata.py /path/to/photos -o output.csv -r
```

Options:
- `-o, --output`: Output CSV path (default: `photo_metadata.csv`)
- `-r, --recursive`: Recursively scan subfolders

Notes:
- Requires `exiftool` in `PATH`.
- Filters output to image MIME types only.

## 2) Pie Chart Script

Script: `create_camera_pie_charts.py`

Purpose:
- Reads the metadata CSV
- Builds pie chart for camera `Make`
- Builds pie chart for camera `Model`

Run:

```bash
python3 create_camera_pie_charts.py metadata.csv
```

Default outputs:
- `camera_make_pie.png`
- `camera_model_pie.png`

Options:
- `--make-output`: Output filename/path for make chart
- `--model-output`: Output filename/path for model chart
- `--top-models`: Maximum model slices before grouping the rest into `Other` (default: `12`)

Example:

```bash
python3 create_camera_pie_charts.py metadata.csv --top-models 10
```

## Environment Notes Observed During Run

- `matplotlib` is available.
- `pandas` is not required and was not used.
- A runtime warning indicated matplotlib used a temporary config dir because default config path was not writable. This does not block chart generation.

## End-to-End Quick Start

```bash
python3 extract_photo_metadata.py -o metadata.csv
python3 create_camera_pie_charts.py metadata.csv
```

Outputs will be:
- `metadata.csv`
- `camera_make_pie.png`
- `camera_model_pie.png`
