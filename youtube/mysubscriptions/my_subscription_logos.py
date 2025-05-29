import os
import requests
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from PIL import Image
from io import BytesIO
import math

# Constants
SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]
LOGO_DIR = "logos"
TILE_OUTPUT = "tile_output.jpg"
CLIENT_SECRET_FILE = "client_secret.json"  # 다운로드한 OAuth JSON 파일 경로

def authenticate_youtube():
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)
    return build("youtube", "v3", credentials=credentials)

def fetch_subscriptions(youtube):
    subs = []
    next_page_token = None

    while True:
        request = youtube.subscriptions().list(
            part="snippet",
            mine=True,
            maxResults=50,
            pageToken=next_page_token
        )
        response = request.execute()

        for item in response["items"]:
            title = item["snippet"]["title"]
            thumbnail_url = item["snippet"]["thumbnails"]["high"]["url"]
            subs.append((title, thumbnail_url))

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return subs

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
    youtube = authenticate_youtube()
    print("🔑 Authenticated!")

    subs = fetch_subscriptions(youtube)
    print(f"📺 Found {len(subs)} subscribed channels")

    logo_paths = download_logos(subs)
    print(f"⬇️ Downloaded {len(logo_paths)} logos")

    create_tile_image(logo_paths)

if __name__ == "__main__":
    main()

