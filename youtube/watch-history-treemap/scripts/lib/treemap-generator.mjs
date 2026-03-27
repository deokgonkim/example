import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const INPUT_PATH = path.join(ROOT, "watch-history.json");
const DIST_DIR = path.join(ROOT, "dist");

function readWatchHistory() {
  const raw = fs.readFileSync(INPUT_PATH, "utf8");
  const rows = JSON.parse(raw);

  return rows.map((row) => {
    const subtitle = row.subtitles?.[0];
    return {
      title: typeof row.title === "string" ? row.title.replace(/^Watched\s+/, "") : "Untitled",
      titleUrl: row.titleUrl ?? null,
      channelName: subtitle?.name ?? "Unknown",
      channelUrl: subtitle?.url ?? null,
      watchedAt: row.time ?? null,
    };
  });
}

function parseCliArgs(argv = process.argv.slice(2)) {
  const options = {
    excludeYouTubeMusic: false,
    since: null,
    until: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--exclude-youtube-music") {
      options.excludeYouTubeMusic = true;
      continue;
    }

    if (arg === "--since" || arg === "--until") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}. Expected YYYY-MM-DD.`);
      }

      assertValidDate(value, arg);
      if (arg === "--since") {
        options.since = value;
      } else {
        options.until = value;
      }
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  validateFilterOptions(options);
  return options;
}

function validateFilterOptions(options) {
  if (options.since) {
    assertValidDate(options.since, "--since");
  }

  if (options.until) {
    assertValidDate(options.until, "--until");
  }

  if (options.since && options.until && options.since > options.until) {
    throw new Error("--since cannot be later than --until.");
  }
}

function assertValidDate(value, flagName) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${flagName} value: ${value}. Expected YYYY-MM-DD.`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ${flagName} value: ${value}. Expected a real calendar date in YYYY-MM-DD format.`);
  }
}

function filterRows(rows, options) {
  return rows.filter((row) => {
    const watchedDate = row.watchedAt?.slice(0, 10) ?? null;

    if (options.excludeYouTubeMusic && row.titleUrl) {
      try {
        const parsed = new URL(row.titleUrl);
        if (parsed.host === "music.youtube.com") {
          return false;
        }
      } catch {
        return false;
      }
    }

    if (options.since && watchedDate && watchedDate < options.since) {
      return false;
    }

    if (options.until && watchedDate && watchedDate > options.until) {
      return false;
    }

    return true;
  });
}

function compareDateAsc(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function compareDateDesc(a, b) {
  return compareDateAsc(b, a);
}

function findVideoId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function channelIdFromUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const channelIndex = parts.indexOf("channel");
    if (channelIndex === -1 || !parts[channelIndex + 1]) {
      return null;
    }
    return parts[channelIndex + 1];
  } catch {
    return null;
  }
}

function aggregateVideos(rows) {
  const byVideo = new Map();

  for (const row of rows) {
    const key = row.titleUrl ?? `${row.channelName}::${row.title}`;
    const existing = byVideo.get(key);

    if (existing) {
      existing.watchCount += 1;
      existing.firstWatchedAt = compareDateAsc(row.watchedAt, existing.firstWatchedAt) < 0 ? row.watchedAt : existing.firstWatchedAt;
      existing.lastWatchedAt = compareDateDesc(row.watchedAt, existing.lastWatchedAt) < 0 ? row.watchedAt : existing.lastWatchedAt;
      continue;
    }

    byVideo.set(key, {
      id: key,
      title: row.title,
      url: row.titleUrl,
      channelName: row.channelName,
      channelUrl: row.channelUrl,
      watchCount: 1,
      firstWatchedAt: row.watchedAt,
      lastWatchedAt: row.watchedAt,
      thumbnailUrl: thumbnailFromVideoUrl(row.titleUrl),
    });
  }

  return [...byVideo.values()].sort(sortByCountDescThenName);
}

function aggregateChannels(rows) {
  const byChannel = new Map();

  for (const row of rows) {
    const key = row.channelUrl ?? `unknown::${row.channelName}`;
    const existing = byChannel.get(key);

    if (existing) {
      existing.watchCount += 1;
      existing.uniqueVideos.add(row.titleUrl ?? row.title);
      existing.firstWatchedAt = compareDateAsc(row.watchedAt, existing.firstWatchedAt) < 0 ? row.watchedAt : existing.firstWatchedAt;
      existing.lastWatchedAt = compareDateDesc(row.watchedAt, existing.lastWatchedAt) < 0 ? row.watchedAt : existing.lastWatchedAt;
      continue;
    }

    byChannel.set(key, {
      id: key,
      channelName: row.channelName,
      channelUrl: row.channelUrl,
      channelId: channelIdFromUrl(row.channelUrl),
      watchCount: 1,
      uniqueVideos: new Set([row.titleUrl ?? row.title]),
      firstWatchedAt: row.watchedAt,
      lastWatchedAt: row.watchedAt,
      logoCandidates: logoCandidatesFromChannelUrl(row.channelUrl),
    });
  }

  return [...byChannel.values()]
    .map((channel) => ({
      id: channel.id,
      channelName: channel.channelName,
      channelUrl: channel.channelUrl,
      channelId: channel.channelId,
      watchCount: channel.watchCount,
      uniqueVideoCount: channel.uniqueVideos.size,
      firstWatchedAt: channel.firstWatchedAt,
      lastWatchedAt: channel.lastWatchedAt,
      logoCandidates: channel.logoCandidates,
    }))
    .sort(sortByCountDescThenName);
}

function thumbnailFromVideoUrl(url) {
  const videoId = findVideoId(url);
  if (!videoId) {
    return null;
  }

  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function logoCandidatesFromChannelUrl(url) {
  const channelId = channelIdFromUrl(url);
  if (!channelId) {
    return [];
  }

  return [
    `https://unavatar.io/youtube/${channelId}`,
    `https://unavatar.io/${encodeURIComponent(`https://www.youtube.com/channel/${channelId}`)}`,
  ];
}

function sortByCountDescThenName(a, b) {
  if (b.watchCount !== a.watchCount) {
    return b.watchCount - a.watchCount;
  }
  return (a.title ?? a.channelName).localeCompare(b.title ?? b.channelName);
}

function datasetSummary(rows, aggregates) {
  const watchedDates = rows.map((row) => row.watchedAt).filter(Boolean).sort();
  return {
    totalWatchEvents: rows.length,
    aggregatedCount: aggregates.length,
    dateRange: {
      first: watchedDates[0] ?? null,
      last: watchedDates[watchedDates.length - 1] ?? null,
    },
  };
}

function filterSummary(options, filteredRows) {
  const parts = [];

  if (options.excludeYouTubeMusic) {
    parts.push("YouTube Music excluded");
  }

  if (options.since) {
    parts.push(`since ${options.since}`);
  }

  if (options.until) {
    parts.push(`until ${options.until}`);
  }

  if (!parts.length) {
    return "No source filters applied.";
  }

  return `${parts.join(" · ")} · ${filteredRows.length.toLocaleString()} source rows included.`;
}

function outputFilename(baseName, options) {
  const suffix = [];

  if (options.excludeYouTubeMusic) {
    suffix.push("no-music");
  }

  if (options.since) {
    suffix.push(`since-${options.since}`);
  }

  if (options.until) {
    suffix.push(`until-${options.until}`);
  }

  if (!suffix.length) {
    return `${baseName}.html`;
  }

  return `${baseName}--${suffix.join("--")}.html`;
}

function usageText(scriptName) {
  return [
    `Usage: node ${scriptName} [--exclude-youtube-music] [--since YYYY-MM-DD] [--until YYYY-MM-DD]`,
    "",
    "Options:",
    "  --exclude-youtube-music   Exclude rows whose titleUrl host is music.youtube.com",
    "  --since YYYY-MM-DD        Include only rows watched on or after this date",
    "  --until YYYY-MM-DD        Include only rows watched on or before this date",
  ].join("\n");
}

function buildTreemapPage(mode, options) {
  const rows = readWatchHistory();
  const filteredRows = filterRows(rows, options);
  const isVideoMode = mode === "video";
  const items = isVideoMode ? aggregateVideos(filteredRows) : aggregateChannels(filteredRows);
  const summary = datasetSummary(filteredRows, items);
  const filename = outputFilename(`${mode}-treemap`, options);

  const html = renderHtml({
    mode,
    title: isVideoMode ? "Video Watch Count Treemap" : "Channel Watch Count Treemap",
    description: isVideoMode
      ? "Each tile represents a watched video aggregated from Google Takeout watch history. Tile area follows repeat watch count, and larger tiles use YouTube thumbnails as their background."
      : "Each tile represents a watched channel aggregated from Google Takeout watch history. Tile area follows total watch count, and the page attempts to use fetched channel logos as the tile background before falling back to initials.",
    items,
    summary,
    imageMode: isVideoMode ? "thumbnail" : "logo",
    filterNote: filterSummary(options, filteredRows),
  });

  writeOutput(filename, html);

  return {
    filename,
    filteredRows,
    items,
    summary,
  };
}

function ensureDistDir() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function writeOutput(filename, html) {
  ensureDistDir();
  fs.writeFileSync(path.join(DIST_DIR, filename), html, "utf8");
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderHtml({ mode, title, description, items, summary, imageMode, filterNote }) {
  const payload = {
    mode,
    title,
    description,
    items,
    summary,
    imageMode,
    filterNote,
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --page-bg: #efe5d3;
        --page-bg-2: #d9c4a3;
        --panel: rgba(255, 249, 238, 0.86);
        --panel-border: rgba(90, 64, 21, 0.18);
        --text: #22170c;
        --muted: #6d5540;
        --accent: #a73f17;
        --shadow: 0 18px 44px rgba(68, 42, 15, 0.16);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 30%),
          linear-gradient(140deg, var(--page-bg), var(--page-bg-2));
      }

      .shell {
        max-width: 1600px;
        margin: 0 auto;
        padding: 20px;
      }

      .hero {
        display: grid;
        gap: 18px;
        grid-template-columns: 1.7fr 1fr;
        align-items: stretch;
      }

      .card {
        background: var(--panel);
        backdrop-filter: blur(14px);
        border: 1px solid var(--panel-border);
        border-radius: 22px;
        box-shadow: var(--shadow);
      }

      .hero-copy {
        padding: 24px;
      }

      .eyebrow {
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 12px;
      }

      h1 {
        margin: 0;
        font-size: clamp(32px, 6vw, 62px);
        line-height: 0.95;
        font-weight: 700;
      }

      .description {
        margin: 16px 0 0;
        max-width: 60ch;
        line-height: 1.55;
        color: var(--muted);
        font-size: 16px;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding: 18px;
      }

      .stat {
        padding: 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(90, 64, 21, 0.12);
      }

      .stat-label {
        display: block;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: clamp(22px, 2.8vw, 36px);
        font-weight: 700;
      }

      .controls {
        display: flex;
        gap: 12px;
        align-items: end;
        flex-wrap: wrap;
        margin-top: 18px;
      }

      .control {
        display: grid;
        gap: 6px;
        min-width: 180px;
      }

      .control label {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .control input,
      .control select {
        appearance: none;
        border: 1px solid rgba(90, 64, 21, 0.18);
        background: rgba(255, 255, 255, 0.72);
        color: var(--text);
        border-radius: 12px;
        padding: 10px 12px;
        font: inherit;
      }

      .toggle-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(90, 64, 21, 0.18);
        background: rgba(255, 255, 255, 0.72);
        color: var(--text);
        font-size: 13px;
      }

      .toggle input {
        margin: 0;
      }

      .controls-note {
        font-size: 13px;
        color: var(--muted);
      }

      .treemap-card {
        margin-top: 18px;
        padding: 18px;
      }

      .treemap {
        position: relative;
        min-height: 72vh;
        height: 72vh;
        overflow: hidden;
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.12)),
          rgba(98, 68, 30, 0.12);
      }

      .tile {
        position: absolute;
        overflow: hidden;
        border: 1px solid rgba(255, 245, 229, 0.55);
        border-radius: 11px;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        box-shadow: inset 0 0 0 1px rgba(38, 22, 7, 0.08);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
      }

      .tile:hover {
        transform: scale(1.01);
        z-index: 3;
        box-shadow: 0 12px 24px rgba(27, 17, 7, 0.18);
        border-color: rgba(255, 255, 255, 0.82);
      }

      .tile::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(10, 8, 6, 0.04), rgba(10, 8, 6, 0.62));
      }

      .tile-content {
        position: absolute;
        inset: auto 0 0 0;
        z-index: 1;
        padding: 10px;
        display: grid;
        gap: 4px;
      }

      .tile-title,
      .tile-subtitle,
      .tile-meta {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        color: #fff6ea;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
      }

      .tile-title {
        font-size: 16px;
        line-height: 1.12;
        -webkit-line-clamp: 3;
        font-weight: 700;
      }

      .tile-subtitle,
      .tile-meta {
        font-size: 12px;
        line-height: 1.2;
        -webkit-line-clamp: 1;
      }

      .tile.small .tile-title {
        font-size: 12px;
      }

      .tile.tiny .tile-content {
        display: none;
      }

      .treemap.hide-names .tile-title,
      .treemap.hide-names .tile-subtitle {
        display: none;
      }

      .treemap.hide-counts .tile-meta {
        display: none;
      }

      .treemap.hide-names.hide-counts .tile-content {
        display: none;
      }

      .tile.no-image::before {
        content: attr(data-initials);
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        z-index: 0;
        color: rgba(255, 245, 232, 0.72);
        font-size: clamp(18px, 4vw, 72px);
        letter-spacing: 0.08em;
        font-weight: 700;
      }

      .tooltip {
        position: fixed;
        z-index: 10;
        pointer-events: none;
        min-width: 220px;
        max-width: min(320px, calc(100vw - 24px));
        padding: 12px 14px;
        border-radius: 14px;
        color: #fff9f0;
        background: rgba(21, 16, 12, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 18px 28px rgba(0, 0, 0, 0.24);
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 120ms ease, transform 120ms ease;
      }

      .tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .tooltip strong,
      .tooltip span {
        display: block;
      }

      .tooltip strong {
        font-size: 14px;
        margin-bottom: 8px;
      }

      .tooltip span {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 244, 226, 0.8);
      }

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .treemap {
          min-height: 68vh;
          height: 68vh;
        }
      }

      @media (max-width: 640px) {
        .shell {
          padding: 14px;
        }

        .hero-copy {
          padding: 18px;
        }

        .stats {
          grid-template-columns: 1fr 1fr;
          padding: 14px;
        }

        .stat {
          padding: 14px;
        }

        .treemap-card {
          padding: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="hero">
        <article class="card hero-copy">
          <div class="eyebrow">YouTube Watch History Treemap</div>
          <h1>${escapeHtml(title)}</h1>
          <p class="description">${escapeHtml(description)}</p>
          <div class="controls">
            <div class="control">
              <label for="topN">Visible Top N</label>
              <select id="topN">
                <option value="50">Top 50</option>
                <option value="100">Top 100</option>
                <option value="250" selected>Top 250</option>
                <option value="500">Top 500</option>
                <option value="1000">Top 1000</option>
                <option value="all">All</option>
              </select>
            </div>
            <div class="control">
              <label for="minCount">Minimum Watch Count</label>
              <input id="minCount" type="number" min="1" step="1" value="1">
            </div>
            <div class="toggle-row" aria-label="Tile label toggles">
              <label class="toggle" for="toggleNames">
                <input id="toggleNames" type="checkbox" checked>
                <span>Show video/channel name</span>
              </label>
              <label class="toggle" for="toggleCounts">
                <input id="toggleCounts" type="checkbox" checked>
                <span>Show watch count</span>
              </label>
            </div>
            <div class="controls-note" id="controlsNote"></div>
          </div>
        </article>
        <aside class="card stats">
          <div class="stat">
            <span class="stat-label">Watch Events</span>
            <span class="stat-value" id="totalWatchEvents"></span>
          </div>
          <div class="stat">
            <span class="stat-label">Aggregated Tiles</span>
            <span class="stat-value" id="aggregatedCount"></span>
          </div>
          <div class="stat">
            <span class="stat-label">Visible Tiles</span>
            <span class="stat-value" id="visibleTiles"></span>
          </div>
          <div class="stat">
            <span class="stat-label">Date Range</span>
            <span class="stat-value" id="dateRange" style="font-size: clamp(14px, 1.6vw, 18px); line-height: 1.3;"></span>
          </div>
        </aside>
      </section>

      <section class="card treemap-card">
        <div id="treemap" class="treemap" aria-label="${escapeHtml(title)} treemap"></div>
      </section>
    </div>

    <div id="tooltip" class="tooltip" role="status" aria-live="polite"></div>

    <script>
      const APP_DATA = ${jsonForScript(payload)};

      const treemapEl = document.getElementById("treemap");
      const tooltipEl = document.getElementById("tooltip");
      const topNEl = document.getElementById("topN");
      const minCountEl = document.getElementById("minCount");
      const toggleNamesEl = document.getElementById("toggleNames");
      const toggleCountsEl = document.getElementById("toggleCounts");
      const controlsNoteEl = document.getElementById("controlsNote");
      const filterNote = APP_DATA.filterNote;
      const totalWatchEventsEl = document.getElementById("totalWatchEvents");
      const aggregatedCountEl = document.getElementById("aggregatedCount");
      const visibleTilesEl = document.getElementById("visibleTiles");
      const dateRangeEl = document.getElementById("dateRange");

      const dateFormatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      totalWatchEventsEl.textContent = numberFormat(APP_DATA.summary.totalWatchEvents);
      aggregatedCountEl.textContent = numberFormat(APP_DATA.summary.aggregatedCount);
      dateRangeEl.textContent = formatDate(APP_DATA.summary.dateRange.first) + " to " + formatDate(APP_DATA.summary.dateRange.last);

      function numberFormat(value) {
        return new Intl.NumberFormat().format(value);
      }

      function formatDate(value) {
        return value ? dateFormatter.format(new Date(value)) : "Unknown";
      }

      function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
      }

      function colorFromCount(count, minCount, maxCount) {
        if (minCount === maxCount) {
          return "hsl(15 76% 45%)";
        }

        const ratio = (count - minCount) / (maxCount - minCount);
        const hue = APP_DATA.mode === "video" ? 18 : 212;
        const saturation = APP_DATA.mode === "video" ? 74 : 62;
        const lightness = 68 - (ratio * 34);
        return "hsl(" + hue + " " + saturation + "% " + lightness.toFixed(1) + "%)";
      }

      function initialsFor(label) {
        const words = String(label || "")
          .trim()
          .split(/\\s+/)
          .filter(Boolean)
          .slice(0, 2);
        return words.map((word) => word[0]).join("").toUpperCase() || "?";
      }

      function normalizeItems() {
        const topN = topNEl.value === "all" ? Number.POSITIVE_INFINITY : Number(topNEl.value);
        const minCount = Math.max(1, Number(minCountEl.value) || 1);

        const filtered = APP_DATA.items
          .filter((item) => item.watchCount >= minCount)
          .slice(0, topN);

        controlsNoteEl.textContent = filtered.length
          ? filterNote + " Showing " + numberFormat(filtered.length) + " tiles after controls."
          : filterNote + " No tiles match the current controls.";
        visibleTilesEl.textContent = numberFormat(filtered.length);
        return filtered;
      }

      function syncTextVisibility() {
        treemapEl.classList.toggle("hide-names", !toggleNamesEl.checked);
        treemapEl.classList.toggle("hide-counts", !toggleCountsEl.checked);
      }

      function worst(row, sideLength) {
        if (!row.length || !sideLength) {
          return Number.POSITIVE_INFINITY;
        }

        let sum = 0;
        let minArea = Number.POSITIVE_INFINITY;
        let maxArea = 0;
        for (const item of row) {
          sum += item._area;
          minArea = Math.min(minArea, item._area);
          maxArea = Math.max(maxArea, item._area);
        }
        const sideSquared = sideLength * sideLength;
        return Math.max((sideSquared * maxArea) / (sum * sum), (sum * sum) / (sideSquared * minArea));
      }

      function layoutRow(row, rect, horizontal) {
        const rowArea = row.reduce((sum, item) => sum + item._area, 0);
        if (horizontal) {
          const height = rowArea / rect.w;
          let x = rect.x;
          for (const item of row) {
            const width = item._area / height;
            item._layout = { x, y: rect.y, w: width, h: height };
            x += width;
          }
          rect.y += height;
          rect.h -= height;
        } else {
          const width = rowArea / rect.h;
          let y = rect.y;
          for (const item of row) {
            const height = item._area / width;
            item._layout = { x: rect.x, y, w: width, h: height };
            y += height;
          }
          rect.x += width;
          rect.w -= width;
        }
      }

      function squarify(items, width, height) {
        const area = width * height;
        const total = items.reduce((sum, item) => sum + item.watchCount, 0) || 1;
        const working = items
          .map((item) => ({ ...item, _area: (item.watchCount / total) * area }))
          .sort((a, b) => b._area - a._area);

        const rect = { x: 0, y: 0, w: width, h: height };
        const result = [];
        let row = [];

        while (working.length) {
          const candidate = working[0];
          const horizontal = rect.w >= rect.h;
          const sideLength = horizontal ? rect.w : rect.h;

          if (!row.length || worst([...row, candidate], sideLength) <= worst(row, sideLength)) {
            row.push(candidate);
            working.shift();
            continue;
          }

          layoutRow(row, rect, horizontal);
          result.push(...row);
          row = [];
        }

        if (row.length) {
          layoutRow(row, rect, rect.w >= rect.h);
          result.push(...row);
        }

        return result.map((item) => ({
          ...item,
          layout: item._layout,
        }));
      }

      async function preloadImagesForVisible(items) {
        const candidates = items
          .filter((item) => Array.isArray(item.logoCandidates) || item.thumbnailUrl)
          .slice(0, 40);

        await Promise.all(candidates.map((item) => resolveItemImage(item)));
      }

      async function resolveItemImage(item) {
        if (item._resolvedImage !== undefined) {
          return item._resolvedImage;
        }

        if (APP_DATA.imageMode === "thumbnail") {
          item._resolvedImage = item.thumbnailUrl || null;
          return item._resolvedImage;
        }

        const candidates = Array.isArray(item.logoCandidates) ? item.logoCandidates : [];
        for (const candidate of candidates) {
          const ok = await probeImage(candidate);
          if (ok) {
            item._resolvedImage = candidate;
            return candidate;
          }
        }

        item._resolvedImage = null;
        return null;
      }

      function probeImage(url) {
        return new Promise((resolve) => {
          const image = new Image();
          image.referrerPolicy = "no-referrer";
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = url;
        });
      }

      function tooltipHtml(item) {
        if (APP_DATA.mode === "video") {
          return [
            "<strong>" + escapeHtml(item.title) + "</strong>",
            "<span>Channel: " + escapeHtml(item.channelName) + "</span>",
            "<span>Watch count: " + numberFormat(item.watchCount) + "</span>",
            "<span>First watched: " + formatDate(item.firstWatchedAt) + "</span>",
            "<span>Last watched: " + formatDate(item.lastWatchedAt) + "</span>",
          ].join("");
        }

        return [
          "<strong>" + escapeHtml(item.channelName) + "</strong>",
          "<span>Watch count: " + numberFormat(item.watchCount) + "</span>",
          "<span>Unique videos: " + numberFormat(item.uniqueVideoCount) + "</span>",
          "<span>First watched: " + formatDate(item.firstWatchedAt) + "</span>",
          "<span>Last watched: " + formatDate(item.lastWatchedAt) + "</span>",
        ].join("");
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function showTooltip(event, item) {
        tooltipEl.innerHTML = tooltipHtml(item);
        tooltipEl.classList.add("visible");
        moveTooltip(event);
      }

      function moveTooltip(event) {
        const width = tooltipEl.offsetWidth || 260;
        const height = tooltipEl.offsetHeight || 120;
        const x = clamp(event.clientX + 18, 8, window.innerWidth - width - 8);
        const y = clamp(event.clientY + 18, 8, window.innerHeight - height - 8);
        tooltipEl.style.left = x + "px";
        tooltipEl.style.top = y + "px";
      }

      function hideTooltip() {
        tooltipEl.classList.remove("visible");
      }

      function openTarget(item) {
        const target = APP_DATA.mode === "video" ? item.url : item.channelUrl;
        if (target) {
          window.open(target, "_blank", "noopener,noreferrer");
        }
      }

      function applyPlaceholder(tile, item) {
        tile.classList.add("no-image");
        tile.dataset.initials = initialsFor(item.title || item.channelName);
      }

      async function applyResolvedImage(tile, item, area) {
        const imageUrl = await resolveItemImage(item);
        if (imageUrl && area >= 2200) {
          tile.style.backgroundImage = "url(\\"" + imageUrl + "\\")";
          tile.classList.remove("no-image");
          delete tile.dataset.initials;
          return;
        }

        if (!tile.classList.contains("no-image")) {
          applyPlaceholder(tile, item);
        }
      }

      async function render() {
        const items = normalizeItems();
        treemapEl.innerHTML = "";

        if (!items.length) {
          return;
        }

        await preloadImagesForVisible(items);

        const { width, height } = treemapEl.getBoundingClientRect();
        const laidOut = squarify(items, Math.max(1, width), Math.max(1, height));
        const counts = items.map((item) => item.watchCount);
        const minCount = Math.min(...counts);
        const maxCount = Math.max(...counts);

        for (const item of laidOut) {
          const tile = document.createElement("button");
          tile.type = "button";
          tile.className = "tile";
          tile.style.left = item.layout.x + "px";
          tile.style.top = item.layout.y + "px";
          tile.style.width = item.layout.w + "px";
          tile.style.height = item.layout.h + "px";
          tile.style.backgroundColor = colorFromCount(item.watchCount, minCount, maxCount);

          const area = item.layout.w * item.layout.h;
          if (area < 3200) tile.classList.add("small");
          if (area < 1200) tile.classList.add("tiny");

          if (item._resolvedImage && area >= 2200) {
            tile.style.backgroundImage = "url(\\"" + item._resolvedImage + "\\")";
          } else {
            applyPlaceholder(tile, item);
            if (APP_DATA.imageMode === "logo" || item.thumbnailUrl) {
              void applyResolvedImage(tile, item, area);
            }
          }

          const content = document.createElement("div");
          content.className = "tile-content";

          const title = document.createElement("p");
          title.className = "tile-title";
          title.textContent = APP_DATA.mode === "video" ? item.title : item.channelName;

          const subtitle = document.createElement("p");
          subtitle.className = "tile-subtitle";
          subtitle.textContent = APP_DATA.mode === "video" ? item.channelName : numberFormat(item.uniqueVideoCount) + " unique videos";

          const meta = document.createElement("p");
          meta.className = "tile-meta";
          meta.textContent = numberFormat(item.watchCount) + " watches";

          content.append(title, subtitle, meta);
          tile.appendChild(content);

          tile.addEventListener("mouseenter", (event) => showTooltip(event, item));
          tile.addEventListener("mousemove", moveTooltip);
          tile.addEventListener("mouseleave", hideTooltip);
          tile.addEventListener("click", () => openTarget(item));

          treemapEl.appendChild(tile);
        }
      }

      topNEl.addEventListener("change", render);
      minCountEl.addEventListener("change", render);
      toggleNamesEl.addEventListener("change", syncTextVisibility);
      toggleCountsEl.addEventListener("change", syncTextVisibility);
      window.addEventListener("resize", debounce(render, 120));

      function debounce(fn, delay) {
        let timer = null;
        return () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(fn, delay);
        };
      }

      syncTextVisibility();
      render();
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export {
  aggregateChannels,
  aggregateVideos,
  buildTreemapPage,
  datasetSummary,
  filterRows,
  filterSummary,
  outputFilename,
  parseCliArgs,
  readWatchHistory,
  renderHtml,
  usageText,
  validateFilterOptions,
  writeOutput,
};
