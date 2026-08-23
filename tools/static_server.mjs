import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

export function startStaticServer(root, port = 0, host = "127.0.0.1") {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, "http://localhost");
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname === "/") pathname = "/index.html";
      if (!path.extname(pathname)) pathname += ".html";
      const candidate = path.resolve(root, `.${pathname}`);
      if (!candidate.startsWith(path.resolve(root) + path.sep)) {
        response.writeHead(400).end("BAD_REQUEST");
        return;
      }
      const fileStat = await stat(candidate);
      if (!fileStat.isFile()) throw new Error("not a file");
      response.writeHead(200, {
        "content-type":
          contentTypes[path.extname(candidate)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      createReadStream(candidate).pipe(response);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("NOT_FOUND");
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve({
        server,
        origin: `http://${host}:${address.port}`,
      });
    });
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replaceAll("\\", "/")}`).href) {
  const root = path.resolve(process.argv[2] ?? "dist");
  const port = Number(process.argv[3] ?? 4173);
  const { origin } = await startStaticServer(root, port);
  console.log(`R51_STATIC_SERVER ${origin}`);
}
