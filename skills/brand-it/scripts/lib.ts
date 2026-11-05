import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

import { launch } from "puppeteer-core";
import type { Browser, Page } from "puppeteer-core";

const types = {
  ".avif": "image/avif",
  ".css": "text/css",
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ts": "text/javascript",
  ".ttf": "font/ttf",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
} satisfies Record<string, string>;

const isKnown = (ext: string): ext is keyof typeof types => Object.hasOwn(types, ext);

const contentType = (ext: string) => (isKnown(ext) ? types[ext] : "application/octet-stream");

const typescript = new Bun.Transpiler({ loader: "ts" });

export interface Served {
  url: string;
  files: Map<string, Uint8Array>;
  close?: () => void;
}

const repoRoot = (dir: string) => {
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return dir;
  }
};

const firstFile = async (roots: string[], pathname: string) => {
  const candidates = roots.map((root) => Bun.file(path.join(root, pathname)));
  const exists = await Promise.all(candidates.map(async (file) => await file.exists()));
  const index = exists.indexOf(true);

  return index === -1 ? null : candidates[index];
};

export const serve = (target: string): Served => {
  if (/^https?:\/\//u.test(target)) {
    return { files: new Map(), url: target };
  }

  const page = path.resolve(target);
  const isDir = statSync(page).isDirectory();
  const dir = isDir ? page : path.dirname(page);
  const repo = repoRoot(dir);
  const roots = [repo, dir, path.join(dir, "public")];
  const files = new Map<string, Uint8Array>();

  const server = Bun.serve({
    fetch: async (request) => {
      const pathname = decodeURIComponent(new URL(request.url).pathname).replace(
        /\/$/u,
        "/index.html",
      );

      const file = await firstFile(roots, pathname);

      if (file?.name === undefined) {
        return new Response(null, { status: 404 });
      }

      const body = await file.bytes();
      files.set(file.name, body);
      const ext = path.extname(file.name);

      return new Response(ext === ".ts" ? typescript.transformSync(body) : body, {
        headers: { "content-type": contentType(ext) },
      });
    },
    hostname: "127.0.0.1",
    port: 0,
  });

  const relativePath = path.relative(repo, page).split(path.sep).join("/");

  return {
    close: () => {
      void server.stop(true);
    },
    files,
    url: `http://127.0.0.1:${server.port}/${relativePath}${isDir && relativePath ? "/" : ""}`,
  };
};

export const misses = new Set<string>();

export const watch = (page: Page) => {
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().endsWith("/favicon.ico")) {
      misses.add(response.url());
    }
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED") {
      misses.add(request.url());
    }
  });

  return page;
};

export const reportMisses = () => {
  if (misses.size > 0) {
    console.warn(
      `didn't load: ${[...misses].join(", ")}\nif this page needs a dev server (Vite, Next), start it and pass its URL`,
    );
  }
};

export const chrome = async (): Promise<Browser> =>
  await launch({
    ...(process.env.CHROME === undefined
      ? { channel: "chrome" }
      : { executablePath: process.env.CHROME }),
    args: ["--force-color-profile=srgb", "--hide-scrollbars", "--disable-dev-shm-usage"],
    headless: true,
    protocolTimeout: 0,
  });

export const inOrder = async <T>(items: readonly T[], step: (item: T) => Promise<void>) => {
  const [head, ...tail] = items;

  if (head === undefined) {
    return;
  }

  await step(head);
  await inOrder(tail, step);
};
