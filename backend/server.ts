// ShoppedByImma backend: runs on Render with a persistent disk.
//
//   POST /rpc/:method     private: only the Vercel frontend calls this (Bearer API_SECRET)
//   GET  /uploads/:name   public: product photos
//   GET  /health          Render health check
//
// It serves the same data functions the frontend uses locally (lib/data/local-repo.ts),
// so there is one source of truth for orders, products and pricing rules.

import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import * as repo from "../lib/data/local-repo";

const PORT = Number(process.env.PORT) || 4000;
const SECRET = process.env.API_SECRET ?? "";
const MAX_BODY = 6 * 1024 * 1024; // base64 photos from the admin

if (SECRET.length < 16) {
  console.error("API_SECRET must be set (16+ characters). Refusing to start.");
  process.exit(1);
}

// Everything callable over RPC. readUpload is served by GET /uploads instead.
const METHODS = new Set(
  Object.entries(repo)
    .filter(([name, fn]) => typeof fn === "function" && name !== "readUpload")
    .map(([name]) => name),
);

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

function authorized(req: http.IncomingMessage) {
  const given = Buffer.from(req.headers.authorization ?? "");
  const expected = Buffer.from(`Bearer ${SECRET}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("Request too large"), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      const stats = await repo.getStats(); // also proves the disk is readable
      return send(res, 200, { ok: true, orders: stats.total });
    }

    const upload = /^\/uploads\/([\w-]+\.(jpg|png|webp))$/.exec(url.pathname);
    if (req.method === "GET" && upload) {
      const file = await repo.readUpload(upload[1]);
      if (!file) return send(res, 404, { error: "Not found" });
      res.writeHead(200, { "content-type": TYPES[upload[2]], "cache-control": "public, max-age=31536000, immutable" });
      return res.end(file);
    }

    const rpc = /^\/rpc\/(\w+)$/.exec(url.pathname);
    if (req.method === "POST" && rpc) {
      if (!authorized(req)) return send(res, 401, { error: "Unauthorized" });
      const method = rpc[1];
      if (!METHODS.has(method)) return send(res, 404, { error: `Unknown method ${method}` });
      const args = JSON.parse((await readBody(req)) || "[]");
      if (!Array.isArray(args)) return send(res, 400, { error: "Arguments must be an array" });
      try {
        const fn = repo[method as keyof typeof repo] as (...a: unknown[]) => Promise<unknown>;
        const result = await fn(...args);
        return send(res, 200, { result: result ?? null });
      } catch (e) {
        // Expected business errors (sold out, duplicate code, …) go back to the UI as-is
        return send(res, 400, { error: e instanceof Error ? e.message : "Request failed" });
      }
    }

    send(res, 404, { error: "Not found" });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    console.error(e);
    send(res, status, { error: status === 413 ? "Request too large" : "Server error" });
  }
});

server.listen(PORT, () => console.log(`ShoppedByImma backend listening on :${PORT}`));
