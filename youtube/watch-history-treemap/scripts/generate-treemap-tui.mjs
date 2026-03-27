import fs from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { buildTreemapPage, validateFilterOptions } from "./lib/treemap-generator.mjs";

function normalizeDate(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isYes(value) {
  const trimmed = value.trim().toLowerCase();
  return trimmed === "y" || trimmed === "yes";
}

async function createAsker() {
  if (input.isTTY) {
    const rl = readline.createInterface({ input, output });
    return {
      ask: (prompt) => rl.question(prompt),
      close: () => rl.close(),
    };
  }

  const answers = fs.readFileSync(0, "utf8").split(/\r?\n/);
  let index = 0;

  return {
    ask: async (prompt) => {
      output.write(prompt);
      const answer = answers[index] ?? "";
      index += 1;
      output.write(`${answer}\n`);
      return answer;
    },
    close: () => {},
  };
}

async function main() {
  const asker = await createAsker();

  try {
    output.write("Interactive treemap generator\n\n");

    const treemapTypeRaw = await asker.ask("Treemap type [video/channel] (default: video): ");
    const excludeMusicRaw = await asker.ask("Exclude YouTube Music? [y/N] (default: N): ");
    const sinceRaw = await asker.ask("Since date YYYY-MM-DD (blank for all dates): ");
    const untilRaw = await asker.ask("Until date YYYY-MM-DD (blank for all dates): ");

    const mode = treemapTypeRaw.trim().toLowerCase() === "channel" ? "channel" : "video";
    const options = {
      excludeYouTubeMusic: isYes(excludeMusicRaw),
      since: normalizeDate(sinceRaw),
      until: normalizeDate(untilRaw),
    };

    validateFilterOptions(options);

    const { filename, summary } = buildTreemapPage(mode, options);

    output.write(`\nGenerated dist/${filename}\n`);
    output.write(`Watch events: ${summary.totalWatchEvents.toLocaleString()}\n`);
    output.write(`Aggregated tiles: ${summary.aggregatedCount.toLocaleString()}\n`);
    output.write(`Date range: ${summary.dateRange.first ?? "Unknown"} to ${summary.dateRange.last ?? "Unknown"}\n`);
  } catch (error) {
    console.error(`\n${error.message}`);
    process.exitCode = 1;
  } finally {
    asker.close();
  }
}

main();
