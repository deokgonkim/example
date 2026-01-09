# YouTube Channel Logos

Fetch YouTube channel logos from user-provided channel URLs/handles/IDs and generate a tiled image.

## Requirements

- Python 3.8+
- YouTube Data API v3 credentials (`client_secret.json`)
- Dependencies in `requirements.txt`

## Setup

1) Install dependencies:

```bash
pip install -r requirements.txt
```

2) Place your OAuth client file at `client_secret.json` in this directory.

## Usage

Provide channel URLs, handles, or channel IDs directly:

```bash
python channel_logos.py https://www.youtube.com/@SomeHandle https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
```

Or pass a file (one entry per line, `#` comments allowed):

```bash
python channel_logos.py --input-file channels.txt
```

Supported inputs include:

- `https://www.youtube.com/@handle`
- `@handle`
- `https://www.youtube.com/channel/UC...`
- `https://www.youtube.com/user/LegacyUsername`
- `https://www.youtube.com/c/CustomName`
- `UC...` channel ID

## Output

- Individual logos: `logos/`
- Tiled image: `tile_output.jpg`

## Notes

- The script authenticates via OAuth and uses the YouTube Data API to resolve channel IDs.
- Some legacy formats may resolve via search when no direct mapping is available.
