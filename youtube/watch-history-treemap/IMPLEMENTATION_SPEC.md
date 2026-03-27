# Watch History Treemap Specification

## Goal

Generate two standalone interactive treemap pages from `watch-history.json` so another coding agent can implement or extend them without rediscovering the data model.

## Dataset Facts

- Input file: [`watch-history.json`](/home/dgkim/git/example/youtube/watch-history-treemap/watch-history.json)
- Observed shape: Google Takeout watch-history array with fields including `title`, `titleUrl`, `subtitles[0]`, and `time`
- Observed row count: about 12,400 watch events
- Observed unique videos after aggregation by `titleUrl`: about 7,718
- Observed unique channels after aggregation by `channelUrl` or name fallback: about 3,077
- URL hosts are primarily `www.youtube.com` and `music.youtube.com`
- Channel URLs in the export are consistently `/channel/UC...` links when present

## Deliverables

### 1. Video Treemap

- One tile represents one watched video aggregated by `titleUrl`
- Tile area is total watch count for that video
- Background image uses the video thumbnail derived from the `v` query parameter when available
- When the tile is too small or no thumbnail is available, fall back to a solid color tile with initials
- Clicking a tile opens the original video URL in a new tab
- Supports CLI source filtering with `--exclude-youtube-music`, `--since YYYY-MM-DD`, and `--until YYYY-MM-DD`

### 2. Channel Treemap

- One tile represents one channel aggregated by `channelUrl` when available, otherwise channel name
- Tile area is total watch count for that channel
- Background image attempts to use a fetched channel logo
- Channel logos are not present in the export and therefore require best-effort online resolution
- When a logo cannot be resolved or loaded, fall back to a solid color tile with initials
- Clicking a tile opens the original channel URL in a new tab when present
- Supports the same CLI source filtering options as the video treemap

## Shared Parsing Rules

- Strip leading `Watched ` from titles when present
- Normalize each watch row to:
  - `title`
  - `titleUrl`
  - `channelName`
  - `channelUrl`
  - `watchedAt`
- If `subtitles[0]` is missing, use `Unknown` as the channel name and `null` for the channel URL
- Dates should be stored as the original ISO strings and only formatted for display at render time

## Aggregate Record Shapes

### Normalized Watch Row

```ts
type NormalizedWatchRow = {
  title: string;
  titleUrl: string | null;
  channelName: string;
  channelUrl: string | null;
  watchedAt: string | null;
};
```

### Video Aggregate Record

```ts
type VideoAggregate = {
  id: string;
  title: string;
  url: string | null;
  channelName: string;
  channelUrl: string | null;
  watchCount: number;
  firstWatchedAt: string | null;
  lastWatchedAt: string | null;
  thumbnailUrl: string | null;
};
```

### Channel Aggregate Record

```ts
type ChannelAggregate = {
  id: string;
  channelName: string;
  channelUrl: string | null;
  channelId: string | null;
  watchCount: number;
  uniqueVideoCount: number;
  firstWatchedAt: string | null;
  lastWatchedAt: string | null;
  logoCandidates: string[];
};
```

## UI Requirements

- Two standalone HTML outputs:
  - `dist/video-treemap.html`
  - `dist/channel-treemap.html`
- Filtered runs should emit distinct filenames by appending active filter suffixes instead of overwriting the default outputs
- Shared controls:
  - top-N selector
  - minimum-watch-count filter
  - summary bar with total watch events, aggregated tile count, visible tile count, and dataset date range
- Surface the active source filters in the page so the generated HTML is self-describing
- Shared interaction:
  - adaptive tile labels
  - hover tooltip
  - click-through to the original URL
- Use deterministic descending watch-count order before treemap layout
- Keep labels readable with a dark overlay over background images

## Image Rules

### Video Page

- Derive thumbnails locally from the YouTube video ID
- Prefer `https://i.ytimg.com/vi/<videoId>/hqdefault.jpg`
- Missing IDs or load failures fall back to solid color plus initials

### Channel Page

- Use best-effort online logo candidates derived from the channel ID
- The current implementation may use avatar proxy services because no official logo URL exists in the export
- Logo resolution must never block rendering
- Any logo failure falls back to solid color plus initials

## CLI Options

```bash
node scripts/generate-video-treemap.mjs [--exclude-youtube-music] [--since YYYY-MM-DD] [--until YYYY-MM-DD]
node scripts/generate-channel-treemap.mjs [--exclude-youtube-music] [--since YYYY-MM-DD] [--until YYYY-MM-DD]
```

- `--exclude-youtube-music` excludes rows whose `titleUrl` host is `music.youtube.com`
- `--since YYYY-MM-DD` includes only rows whose ISO date portion is on or after the given date
- `--until YYYY-MM-DD` includes only rows whose ISO date portion is on or before the given date
- `--since` and `--until` are inclusive
- Invalid dates or `--since` later than `--until` must fail with a non-zero exit and a usage message

## Acceptance Criteria

- Running the generator scripts produces both standalone HTML files under `dist/`
- The video page shows aggregated videos and sizes them by watch count
- The channel page shows aggregated channels and sizes them by watch count
- Larger video tiles use thumbnails when available
- Channel tiles attempt to use logos and degrade gracefully to initials
- Hover tooltips expose the correct aggregate fields
- Click targets open the expected video or channel URL
- The pages remain usable without a local dev server because data is embedded at generation time
