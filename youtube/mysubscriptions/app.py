import argparse

from dash import Dash, Input, Output, dcc, html
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


def build_rows(subscriptions, channel_stats):
    rows = []
    for sub in subscriptions:
        stat = channel_stats.get(sub["channel_id"], {})
        rows.append(
            {
                "group": "My Subscriptions",
                "channel": sub["title"],
                "channel_id": sub["channel_id"],
                "thumbnail_url": sub["thumbnail_url"],
                "subscriber_count": stat.get("subscriber_count", 0),
                "view_count": stat.get("view_count", 0),
                "video_count": stat.get("video_count", 0),
            }
        )
    rows.sort(key=lambda x: x["subscriber_count"], reverse=True)
    return rows


def create_treemap(rows, title):
    for row in rows:
        row["weight"] = max(1, row["subscriber_count"])

    fig = px.treemap(
        rows,
        path=["group", "channel"],
        values="weight",
        color="subscriber_count",
        color_continuous_scale="Greens",
        custom_data=[
            "channel",
            "channel_id",
            "thumbnail_url",
            "subscriber_count",
            "view_count",
            "video_count",
        ],
    )
    fig.update_traces(
        texttemplate="<b>%{label}</b><br>%{customdata[3]:,} subs",
        marker_line_color="white",
        marker_line_width=1,
        root_color="white",
        hovertemplate=(
            "<b>%{customdata[0]}</b><br>"
            "Subscribers: %{customdata[3]:,}<br>"
            "Views: %{customdata[4]:,}<br>"
            "Videos: %{customdata[5]:,}<extra></extra>"
        ),
    )
    fig.update_layout(
        title=title,
        margin=dict(t=50, l=10, r=10, b=10),
        coloraxis_colorbar_title="Subscribers",
    )
    return fig


def make_info_panel(row):
    if not row:
        return html.Div("Select a channel tile.")

    return html.Div(
        [
            html.Img(
                src=row.get("thumbnail_url", ""),
                style={"width": "100%", "maxWidth": "320px", "borderRadius": "8px"},
            ),
            html.H3(row.get("channel", "Unknown"), style={"marginTop": "12px", "marginBottom": "8px"}),
            html.Div(f"Subscribers: {row.get('subscriber_count', 0):,}"),
            html.Div(f"Views: {row.get('view_count', 0):,}"),
            html.Div(f"Videos: {row.get('video_count', 0):,}"),
            html.Div(f"Channel ID: {row.get('channel_id', '')}", style={"marginTop": "8px", "fontSize": "12px"}),
        ]
    )


def parse_args():
    parser = argparse.ArgumentParser(description="Dash app: treemap with clickable channel logo panel.")
    parser.add_argument("--title", default="YouTube Subscriptions - Treemap + Logo Panel", help="Chart title")
    parser.add_argument("--host", default="127.0.0.1", help="Dash host")
    parser.add_argument("--port", type=int, default=8050, help="Dash port")
    return parser.parse_args()


def main():
    args = parse_args()
    youtube = authenticate_youtube()
    print("Authenticated.")

    subs = fetch_subscriptions(youtube)
    print(f"Found {len(subs)} subscribed channels")

    stats = fetch_channel_stats(youtube, [sub["channel_id"] for sub in subs])
    rows = build_rows(subs, stats)
    fig = create_treemap(rows, args.title)

    rows_by_channel = {row["channel"]: row for row in rows}
    default_row = rows[0] if rows else None

    app = Dash(__name__)
    app.layout = html.Div(
        [
            html.Div(
                dcc.Graph(id="treemap", figure=fig, style={"height": "92vh"}),
                style={"flex": "3", "minWidth": "0"},
            ),
            html.Div(
                id="info-panel",
                children=make_info_panel(default_row),
                style={
                    "flex": "1",
                    "padding": "16px",
                    "borderLeft": "1px solid #ddd",
                    "fontFamily": "Arial, sans-serif",
                },
            ),
        ],
        style={"display": "flex", "height": "100vh"},
    )

    @app.callback(Output("info-panel", "children"), Input("treemap", "clickData"))
    def update_info_panel(click_data):
        if not click_data or not click_data.get("points"):
            return make_info_panel(default_row)

        label = click_data["points"][0].get("label", "")
        row = rows_by_channel.get(label)
        return make_info_panel(row if row else default_row)

    app.run(host=args.host, port=args.port, debug=False)


if __name__ == "__main__":
    main()
