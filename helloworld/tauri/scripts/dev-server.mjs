import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const srcDir = resolve(rootDir, "src");
const host = "127.0.0.1";
const port = 1420;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolvePath(urlPath) {
  const candidate = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const normalized = normalize(candidate).replace(/^(\.\.[/\\])+/, "");
  return join(srcDir, normalized);
}

const server = http.createServer(async (request, response) => {
  const requestPath = resolvePath(request.url ?? "/");

  try {
    await access(requestPath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(requestPath)] ?? "application/octet-stream"
    });
    createReadStream(requestPath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Dev server running at http://${host}:${port}`);
});
