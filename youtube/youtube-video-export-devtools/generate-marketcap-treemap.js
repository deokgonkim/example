#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

const INPUT_PATH = path.resolve(process.argv[2] || "youtube_videos.json");
const OUTPUT_PATH = path.resolve(process.argv[3] || "marketcap-treemap.html");
const TITLE = "YouTube Channel Marketcap Treemap";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tile";
}

function parseViewCount(text) {
  if (!text) return 0;

  const normalized = String(text)
    .replace(/\u00a0/g, " ")
    .replace(/,/g, "")
    .replace(/views?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const koreanMatch = normalized.match(/([0-9]*\.?[0-9]+)\s*(천|만|억)/);
  if (koreanMatch) {
    const value = Number(koreanMatch[1]);
    const unit = koreanMatch[2];
    const multiplier = unit === "천" ? 1e3 : unit === "만" ? 1e4 : 1e8;
    return Math.round(value * multiplier);
  }

  const compactMatch = normalized.match(/([0-9]*\.?[0-9]+)\s*([KMB])/i);
  if (compactMatch) {
    const value = Number(compactMatch[1]);
    const unit = compactMatch[2].toUpperCase();
    const multiplier = unit === "K" ? 1e3 : unit === "M" ? 1e6 : 1e9;
    return Math.round(value * multiplier);
  }

  const rawNumberMatch = normalized.match(/[0-9]+(?:\.[0-9]+)?/);
  return rawNumberMatch ? Math.round(Number(rawNumberMatch[0])) : 0;
}

function aggregateChannels(rows) {
  const byChannel = new Map();

  for (const row of rows) {
    const channelName = String(row.channelName || "Unknown").trim() || "Unknown";
    const channelUrl = String(row.channelUrl || "").trim();
    const viewCount = parseViewCount(row.viewCountText);
    const thumbnailUrl = String(row.thumbnailUrl || "").trim();
    const title = String(row.title || "").trim();

    if (channelName === "Unknown") {
      continue;
    }

    if (!byChannel.has(channelName)) {
      byChannel.set(channelName, {
        channelName,
        channelUrl,
        videos: 0,
        totalViews: 0,
        topVideoTitle: "",
        topVideoUrl: "",
        topVideoViews: 0,
        thumbnailUrl: "",
      });
    }

    const entry = byChannel.get(channelName);
    entry.videos += 1;
    entry.totalViews += viewCount;

    if (!entry.channelUrl && channelUrl) {
      entry.channelUrl = channelUrl;
    }

    if (viewCount >= entry.topVideoViews) {
      entry.topVideoViews = viewCount;
      entry.topVideoTitle = title;
      entry.topVideoUrl = String(row.url || "").trim();
      entry.thumbnailUrl = thumbnailUrl;
    }
  }

  return [...byChannel.values()]
    .filter((entry) => entry.videos > 0)
    .sort((a, b) => b.videos - a.videos || b.totalViews - a.totalViews);
}

function splitTreemap(items, x, y, width, height) {
  if (!items.length) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, width, height }];
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  let running = 0;
  let splitIndex = 0;

  for (let i = 0; i < items.length; i += 1) {
    running += items[i].value;
    if (running >= total / 2) {
      splitIndex = i + 1;
      break;
    }
  }

  const leftItems = items.slice(0, splitIndex);
  const rightItems = items.slice(splitIndex);
  const leftValue = leftItems.reduce((sum, item) => sum + item.value, 0);
  const ratio = total === 0 ? 0.5 : leftValue / total;

  if (width >= height) {
    const leftWidth = width * ratio;
    return [
      ...splitTreemap(leftItems, x, y, leftWidth, height),
      ...splitTreemap(rightItems, x + leftWidth, y, width - leftWidth, height),
    ];
  }

  const topHeight = height * ratio;
  return [
    ...splitTreemap(leftItems, x, y, width, topHeight),
    ...splitTreemap(rightItems, x, y + topHeight, width, height - topHeight),
  ];
}

function formatViews(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatViewsExact(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

async function fetchDataUrl(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function extractLogoUrl(html) {
  const patterns = [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="og:image"/i,
    /"avatar"\s*:\s*\{"thumbnails"\s*:\s*\[\{"url":"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1]
        .replace(/\\u0026/g, "&")
        .replace(/\\\//g, "/");
    }
  }

  return "";
}

async function resolveChannelLogo(entry) {
  if (!entry.channelUrl) {
    return entry.thumbnailUrl || "";
  }

  try {
    const html = await fetchText(entry.channelUrl);
    const logoUrl = extractLogoUrl(html);
    if (logoUrl) {
      try {
        return await fetchDataUrl(logoUrl);
      } catch (error) {
        console.warn(`[logo-image] ${entry.channelName}: ${error.message}`);
        return logoUrl;
      }
    }
  } catch (error) {
    console.warn(`[logo] ${entry.channelName}: ${error.message}`);
  }

  if (!entry.thumbnailUrl) {
    return "";
  }

  try {
    return await fetchDataUrl(entry.thumbnailUrl);
  } catch (error) {
    console.warn(`[thumb] ${entry.channelName}: ${error.message}`);
    return entry.thumbnailUrl;
  }
}

async function enrichWithLogos(entries) {
  const concurrency = 6;
  const queue = [...entries];
  const enriched = new Map();

  async function worker() {
    while (queue.length) {
      const entry = queue.shift();
      const logoDataUrl = await resolveChannelLogo(entry);
      enriched.set(entry.channelName, { ...entry, logoDataUrl });
      console.log(`[tile] ${entry.channelName} videos=${entry.videos}`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return entries.map((entry) => enriched.get(entry.channelName) || entry);
}

function buildHtml(layout, generatedAt, sourceFile) {
  const tiles = layout.map((item) => {
    const style = [
      `left:${item.x.toFixed(2)}px`,
      `top:${item.y.toFixed(2)}px`,
      `width:${Math.max(0, item.width - 6).toFixed(2)}px`,
      `height:${Math.max(0, item.height - 6).toFixed(2)}px`,
    ].filter(Boolean).join(";");

    return `
      <a class="tile" href="${escapeHtml(item.channelUrl || item.topVideoUrl || "#")}" target="_blank" rel="noreferrer" style="${style}">
        ${item.logoDataUrl
          ? `<img class="tile__image" src="${escapeAttribute(item.logoDataUrl)}" alt="${escapeAttribute(item.channelName)} logo" loading="lazy" decoding="async">`
          : `<div class="tile__image tile__image--empty"></div>`}
        <div class="tile__shade"></div>
        <div class="tile__content">
          <div class="tile__name">${escapeHtml(item.channelName)}</div>
          <div class="tile__stats">${escapeHtml(formatViewsExact(item.videos))} videos</div>
        </div>
      </a>
    `;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(TITLE)}</title>
  <style>
    :root {
      --bg: #f5f0e8;
      --ink: #1e1d1a;
      --muted: rgba(30, 29, 26, 0.72);
      --tile-gap: 6px;
      --panel: #fffaf2;
      --accent: #cc5a2d;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(204, 90, 45, 0.12), transparent 28%),
        radial-gradient(circle at bottom right, rgba(16, 102, 122, 0.12), transparent 30%),
        linear-gradient(180deg, #f8f2e8 0%, #efe6d8 100%);
    }

    .page {
      max-width: 1500px;
      margin: 0 auto;
      padding: 28px;
    }

    .header {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 20px;
      align-items: end;
      margin-bottom: 20px;
    }

    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 10px;
    }

    h1 {
      margin: 0;
      font-size: clamp(32px, 6vw, 72px);
      line-height: 0.94;
      letter-spacing: -0.04em;
      font-weight: 700;
    }

    .summary {
      background: rgba(255, 250, 242, 0.78);
      border: 1px solid rgba(30, 29, 26, 0.12);
      border-radius: 18px;
      padding: 18px 20px;
      backdrop-filter: blur(10px);
    }

    .summary p,
    .footer p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
      font-size: 14px;
    }

    .stats {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      margin-top: 12px;
      font-size: 14px;
    }

    .stats strong {
      display: block;
      font-size: 20px;
      color: var(--ink);
    }

    .treemap {
      position: relative;
      height: min(76vh, 980px);
      min-height: 640px;
      background: rgba(255, 250, 242, 0.48);
      border-radius: 24px;
      padding: 3px;
      overflow: hidden;
      box-shadow: 0 20px 70px rgba(55, 38, 12, 0.14);
      border: 1px solid rgba(30, 29, 26, 0.12);
    }

    .tile {
      position: absolute;
      display: block;
      overflow: hidden;
      border-radius: 18px;
      color: #fffdf7;
      text-decoration: none;
      background:
        linear-gradient(135deg, rgba(61, 58, 49, 0.7), rgba(20, 20, 17, 0.45)),
        linear-gradient(135deg, #876445, #3f2f25);
      isolation: isolate;
    }

    .tile__shade,
    .tile__content {
      position: absolute;
      inset: 0;
    }

    .tile__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.02);
      filter: saturate(1.08) contrast(1.02);
    }

    .tile__image--empty {
      background:
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.28), transparent 20%),
        linear-gradient(135deg, #876445, #3f2f25);
    }

    .tile__shade {
      background:
        linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.58) 100%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.28));
    }

    .tile__content {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: clamp(12px, 1.4vw, 18px);
      gap: 4px;
    }

    .tile__name {
      font-size: clamp(14px, 1.4vw, 30px);
      line-height: 1;
      font-weight: 700;
      text-wrap: balance;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
    }

    .tile__stats,
    .tile__meta {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
    }

    .tile__stats {
      font-size: clamp(11px, 1vw, 16px);
      opacity: 0.96;
    }

    .tile__meta {
      font-size: clamp(10px, 0.86vw, 13px);
      opacity: 0.74;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      flex-wrap: wrap;
      margin-top: 16px;
      padding: 0 4px;
    }

    @media (max-width: 900px) {
      .page {
        padding: 16px;
      }

      .header {
        grid-template-columns: 1fr;
      }

      .treemap {
        min-height: 78vh;
        height: 78vh;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div>
        <div class="eyebrow">Generated from youtube_videos.json</div>
        <h1>${escapeHtml(TITLE)}</h1>
      </div>
      <div class="summary">
        <p>
          Tile area uses the exported video count per channel.
          Channel pages are queried for <code>og:image</code>, then each tile is filled with the channel logo.
        </p>
        <div class="stats">
          <span><strong>${escapeHtml(String(layout.length))}</strong>channels</span>
          <span><strong>${escapeHtml(formatViewsExact(layout.reduce((sum, item) => sum + item.videos, 0)))}</strong>videos</span>
          <span><strong>${escapeHtml(formatViewsExact(layout.reduce((sum, item) => sum + item.totalViews, 0)))}</strong>parsed views</span>
        </div>
      </div>
    </section>

    <section class="treemap">
      ${tiles}
    </section>

    <section class="footer">
      <p>Source: ${escapeHtml(sourceFile)}</p>
      <p>Generated: ${escapeHtml(generatedAt)}</p>
    </section>
  </main>
</body>
</html>`;
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows)) {
    throw new Error("Input JSON must be an array of YouTube video rows.");
  }

  const channels = aggregateChannels(rows);
  const withLogos = await enrichWithLogos(channels);
  const chartWidth = 1400;
  const chartHeight = 900;
  const layout = splitTreemap(
    withLogos.map((entry) => ({
      ...entry,
      value: Math.max(entry.videos, 1),
      id: slugify(entry.channelName),
    })),
    0,
    0,
    chartWidth,
    chartHeight,
  );

  const html = buildHtml(layout, new Date().toISOString(), path.basename(INPUT_PATH));
  await fs.writeFile(OUTPUT_PATH, html, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
