import argparse
import os
import re
import requests
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from PIL import Image
from io import BytesIO
import math
from urllib.parse import urlparse

# Constants
SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]
LOGO_DIR = "logos"
TILE_OUTPUT = "tile_output.jpg"
CLIENT_SECRET_FILE = "client_secret.json"  # 다운로드한 OAuth JSON 파일 경로
CHANNEL_ID_RE = re.compile(r"^UC[a-zA-Z0-9_-]{22}$")

def authenticate_youtube():
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)
    return build("youtube", "v3", credentials=credentials)

def read_channel_inputs(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]

def parse_channel_input(entry):
    entry = entry.strip()
    if not entry:
        return None
    if entry.startswith("http"):
        parsed = urlparse(entry)
        path = parsed.path.strip("/")
        if path.startswith("@"):
            return {"type": "handle", "value": path.lstrip("@")}
        parts = path.split("/")
        if parts and parts[0].startswith("@"):
            return {"type": "handle", "value": parts[0][1:]}
        if len(parts) >= 2:
            if parts[0] == "channel":
                return {"type": "channel_id", "value": parts[1]}
            if parts[0] == "c":
                return {"type": "custom", "value": parts[1]}
            if parts[0] == "user":
                return {"type": "username", "value": parts[1]}
        return {"type": "search", "value": entry}
    if entry.startswith("@"):
        return {"type": "handle", "value": entry[1:]}
    if CHANNEL_ID_RE.match(entry):
        return {"type": "channel_id", "value": entry}
    return {"type": "search", "value": entry}

def resolve_channel_id(youtube, entry):
    if entry["type"] == "channel_id":
        return entry["value"]
    if entry["type"] == "handle":
        try:
            response = youtube.channels().list(
                part="snippet",
                forHandle=entry["value"]
            ).execute()
            items = response.get("items", [])
            if items:
                return items[0]["id"]
        except Exception:
            pass
    if entry["type"] == "username":
        try:
            response = youtube.channels().list(
                part="snippet",
                forUsername=entry["value"]
            ).execute()
            items = response.get("items", [])
            if items:
                return items[0]["id"]
        except Exception:
            pass
    try:
        response = youtube.search().list(
            part="snippet",
            q=entry["value"],
            type="channel",
            maxResults=1
        ).execute()
        items = response.get("items", [])
        if items:
            return items[0]["id"]["channelId"]
    except Exception:
        pass
    return None

def fetch_channels_from_inputs(youtube, channel_inputs):
    channels = []
    seen_ids = set()
    for raw_entry in channel_inputs:
        entry = parse_channel_input(raw_entry)
        if not entry:
            continue
        channel_id = resolve_channel_id(youtube, entry)
        if not channel_id:
            print(f"❌ Could not resolve channel: {raw_entry}")
            continue
        if channel_id in seen_ids:
            continue
        seen_ids.add(channel_id)
        try:
            response = youtube.channels().list(
                part="snippet",
                id=channel_id
            ).execute()
            items = response.get("items", [])
            if not items:
                print(f"❌ No channel data for: {raw_entry}")
                continue
            snippet = items[0]["snippet"]
            title = snippet["title"]
            thumbnail_url = snippet["thumbnails"]["high"]["url"]
            channels.append((title, thumbnail_url))
        except Exception as e:
            print(f"❌ Failed to fetch channel {raw_entry}: {e}")
    return channels

def download_logos(subs):
    os.makedirs(LOGO_DIR, exist_ok=True)
    logo_paths = []

    for i, (title, url) in enumerate(subs):
        try:
            response = requests.get(url)
            image = Image.open(BytesIO(response.content)).convert("RGB")
            filename = os.path.join(LOGO_DIR, f"logo_{i}.jpg")
            image.save(filename)
            logo_paths.append(filename)
        except Exception as e:
            print(f"❌ Failed to download {title}: {e}")
    
    return logo_paths

def create_tile_image(logo_paths, tile_size=100, columns=10):
    if not logo_paths:
        print("No logos to tile.")
        return

    rows = math.ceil(len(logo_paths) / columns)
    result_image = Image.new("RGB", (tile_size * columns, tile_size * rows), (255, 255, 255))

    for idx, path in enumerate(logo_paths):
        try:
            logo = Image.open(path).resize((tile_size, tile_size))
            x = (idx % columns) * tile_size
            y = (idx // columns) * tile_size
            result_image.paste(logo, (x, y))
        except Exception as e:
            print(f"❌ Error processing {path}: {e}")
    
    result_image.save(TILE_OUTPUT)
    print(f"✅ Tile image saved to: {TILE_OUTPUT}")

def main():
    parser = argparse.ArgumentParser(description="Fetch YouTube channel logos from URLs.")
    parser.add_argument("urls", nargs="*", help="Channel URLs, handles, or channel IDs.")
    parser.add_argument(
        "-i",
        "--input-file",
        help="Path to a text file with channel URLs/handles (one per line)."
    )
    args = parser.parse_args()

    channel_inputs = []
    if args.input_file:
        channel_inputs.extend(read_channel_inputs(args.input_file))
    if args.urls:
        channel_inputs.extend(args.urls)

    if not channel_inputs:
        print("Provide channel URLs via args or --input-file.")
        return

    youtube = authenticate_youtube()
    print("🔑 Authenticated!")

    channels = fetch_channels_from_inputs(youtube, channel_inputs)
    print(f"📺 Resolved {len(channels)} channels")

    logo_paths = download_logos(channels)
    print(f"⬇️ Downloaded {len(logo_paths)} logos")

    create_tile_image(logo_paths)

if __name__ == "__main__":
    main()
