import {
  buildTreemapPage,
  parseCliArgs,
  usageText,
} from "./lib/treemap-generator.mjs";

let options;
try {
  options = parseCliArgs();
} catch (error) {
  console.error(error.message);
  console.error("");
  console.error(usageText("scripts/generate-video-treemap.mjs"));
  process.exit(1);
}

const { filename } = buildTreemapPage("video", options);
console.log(`Generated dist/${filename}`);
