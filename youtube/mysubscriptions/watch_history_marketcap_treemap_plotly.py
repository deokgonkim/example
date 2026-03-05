import argparse
import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

import plotly.express as px


def parse_channel_id(channel_url):
    if not channel_url:
        return ""

    parsed = urlparse(channel_url)
    path_parts = [p for p in parsed.path.split("/") if p]

    # Most exports use /channel/<id>
    if len(path_parts) >= 2 and path_parts[0] == "channel":
        return path_parts[1]

    # Fallback for other URL styles (/@handle, /c/name, /user/name)
    query = parse_qs(parsed.query)
    if "channel_id" in query and query["channel_id"]:
        return query["channel_id"][0]

    return parsed.path or channel_url


def load_watch_history(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_item_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def parse_user_datetime(value, is_until):
    if not value:
        return None

    # Date-only input: inclusive day range in UTC.
    if len(value) == 10:
        dt = datetime.fromisoformat(value).replace(tzinfo=timezone.utc)
        if is_until:
            return dt + timedelta(days=1) - timedelta(microseconds=1)
        return dt

    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def filter_history_by_time(history_items, since, until):
    since_dt = parse_user_datetime(since, is_until=False)
    until_dt = parse_user_datetime(until, is_until=True)
    if not since_dt and not until_dt:
        return history_items

    filtered = []
    for item in history_items:
        raw_time = item.get("time")
        if not raw_time:
            continue
        try:
            item_time = parse_item_time(raw_time)
        except Exception:
            continue

        if since_dt and item_time < since_dt:
            continue
        if until_dt and item_time > until_dt:
            continue
        filtered.append(item)

    return filtered


def build_chart_data(history_items):
    by_channel = defaultdict(
        lambda: {"group": "YouTube", "channel": "Unknown", "channel_id": "", "watch_count": 0}
    )

    for item in history_items:
        group = item.get("header", "") or "YouTube"
        if group not in {"YouTube", "YouTube Music"}:
            group = "YouTube"

        subtitles = item.get("subtitles") or []
        if not subtitles:
            channel_name = "Unknown"
            channel_url = ""
        else:
            source = subtitles[0] or {}
            channel_name = source.get("name", "Unknown")
            channel_url = source.get("url", "")

        channel_id = parse_channel_id(channel_url)
        key = (group, channel_id or channel_name)

        row = by_channel[key]
        row["group"] = group
        row["channel"] = channel_name
        row["channel_id"] = channel_id
        row["watch_count"] += 1

    rows = [
        {
            "group": value["group"],
            "channel": value["channel"],
            "channel_id": value["channel_id"],
            "watch_count": value["watch_count"],
            "weight": max(1, value["watch_count"]),
        }
        for value in by_channel.values()
    ]

    rows.sort(key=lambda x: x["watch_count"], reverse=True)
    return rows


def create_treemap(rows, title):
    fig = px.treemap(
        rows,
        path=["group", "channel"],
        values="weight",
        color="watch_count",
        custom_data=["channel_id"],
        color_continuous_scale="Greens",
    )

    fig.update_traces(
        texttemplate="<b>%{label}</b><br>%{value:,.0f} views",
        hovertemplate=(
            "label=%{label}<br>"
            "parent=%{parent}<br>"
            "watch_count=%{value:,.0f}<br>"
            "channel_id=%{customdata[0]}<extra></extra>"
        ),
        marker_line_color="white",
        marker_line_width=1,
        root_color="white",
    )
    fig.update_layout(
        title=title,
        margin=dict(t=50, l=10, r=10, b=10),
        coloraxis_colorbar_title="Watch Count",
    )
    return fig


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create a Plotly market-cap style treemap from YouTube watch-history.json by channel watch count."
    )
    parser.add_argument("--input", default="watch-history.json", help="Path to watch-history.json")
    parser.add_argument(
        "--output-html",
        default="watch_history_marketcap_treemap.html",
        help="Output interactive HTML path",
    )
    parser.add_argument("--output-image", default="", help="Optional static image path (e.g. treemap.png)")
    parser.add_argument(
        "--title",
        default="YouTube Watch History - Market Cap Treemap",
        help="Chart title",
    )
    parser.add_argument(
        "--top-n",
        type=int,
        default=0,
        help="Only keep top N channels by watch count (0 = all)",
    )
    parser.add_argument(
        "--since",
        default="",
        help="Include entries on/after this time (YYYY-MM-DD or ISO8601, UTC if no timezone)",
    )
    parser.add_argument(
        "--until",
        default="",
        help="Include entries on/before this time (YYYY-MM-DD or ISO8601, UTC if no timezone)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    history_items = load_watch_history(args.input)
    print(f"Loaded {len(history_items)} watch history entries from: {args.input}")

    history_items = filter_history_by_time(history_items, args.since, args.until)
    print(f"After time filter: {len(history_items)} entries")

    rows = build_chart_data(history_items)
    print(f"Aggregated into {len(rows)} channels")

    if args.top_n > 0:
        rows = rows[: args.top_n]
        print(f"Using top {len(rows)} channels")

    fig = create_treemap(rows, args.title)
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
