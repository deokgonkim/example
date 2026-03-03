import argparse

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import plotly.express as px

# Constants
SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]
CLIENT_SECRET_FILE = "client_secret.json"


def authenticate_youtube():
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)
    return build("youtube", "v3", credentials=credentials)


def fetch_subscriptions(youtube):
    subs = []
    next_page_token = None

    while True:
        response = (
            youtube.subscriptions()
            .list(
                part="snippet",
                mine=True,
                maxResults=50,
                pageToken=next_page_token,
            )
            .execute()
        )

        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            channel_id = snippet.get("resourceId", {}).get("channelId")
            title = snippet.get("title", "Unknown")
            thumbnail_url = snippet.get("thumbnails", {}).get("high", {}).get("url", "")
            if channel_id:
                subs.append(
                    {
                        "title": title,
                        "channel_id": channel_id,
                        "thumbnail_url": thumbnail_url,
                    }
                )

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return subs


def fetch_channel_stats(youtube, channel_ids):
    stats = {}

    for i in range(0, len(channel_ids), 50):
        batch_ids = channel_ids[i : i + 50]
        response = (
            youtube.channels()
            .list(part="statistics", id=",".join(batch_ids), maxResults=50)
            .execute()
        )

        for item in response.get("items", []):
            channel_id = item.get("id")
            statistics = item.get("statistics", {})
            if channel_id:
                stats[channel_id] = {
                    "subscriber_count": int(statistics.get("subscriberCount", 0)),
                    "view_count": int(statistics.get("viewCount", 0)),
                    "video_count": int(statistics.get("videoCount", 0)),
                }

    return stats


def build_chart_data(subscriptions, channel_stats):
    rows = []
    for sub in subscriptions:
        stat = channel_stats.get(sub["channel_id"], {})
        rows.append(
            {
                "group": "My Subscriptions",
                "channel": sub["title"],
                "subscriber_count": stat.get("subscriber_count", 0),
                "view_count": stat.get("view_count", 0),
                "video_count": stat.get("video_count", 0),
                "thumbnail_url": sub.get("thumbnail_url", ""),
            }
        )

    rows.sort(key=lambda x: x["subscriber_count"], reverse=True)
    return rows


def create_treemap(rows, title):
    # Use a minimum of 1 so channels with hidden/zero subscribers remain visible.
    for row in rows:
        row["weight"] = max(1, row["subscriber_count"])

    fig = px.treemap(
        rows,
        path=["group", "channel"],
        values="weight",
        color="subscriber_count",
        color_continuous_scale="Greens",
        hover_data={
            "subscriber_count": ":,",
            "view_count": ":,",
            "video_count": ":,",
            "thumbnail_url": True,
            "weight": False,
        },
    )

    fig.update_traces(
        texttemplate="<b>%{label}</b><br>%{customdata[0]:,} subs",
        marker_line_color="white",
        marker_line_width=1,
        root_color="white",
    )
    fig.update_layout(
        title=title,
        margin=dict(t=50, l=10, r=10, b=10),
        coloraxis_colorbar_title="Subscribers",
    )
    return fig


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create a Plotly market-cap style treemap of subscribed channels by subscriber count."
    )
    parser.add_argument(
        "--output-html",
        default="subscription_marketcap_treemap_v2.html",
        help="Output interactive HTML path",
    )
    parser.add_argument("--output-image", default="", help="Optional static image path (e.g. treemap.png)")
    parser.add_argument("--title", default="YouTube Subscriptions - Market Cap Treemap (v2)", help="Chart title")
    return parser.parse_args()


def main():
    args = parse_args()
    youtube = authenticate_youtube()
    print("Authenticated.")

    subs = fetch_subscriptions(youtube)
    print(f"Found {len(subs)} subscribed channels")

    channel_ids = [sub["channel_id"] for sub in subs]
    stats = fetch_channel_stats(youtube, channel_ids)
    rows = build_chart_data(subs, stats)

    fig = create_treemap(rows, title=args.title)
    fig.write_html(args.output_html)
    print(f"Saved interactive treemap HTML to: {args.output_html}")

    if args.output_image:
        try:
            fig.write_image(args.output_image, scale=2)
            print(f"Saved static treemap image to: {args.output_image}")
        except Exception as e:
            print(
                "Failed to export static image. Install 'kaleido' for image export support. "
                f"Error: {e}"
            )


if __name__ == "__main__":
    main()
