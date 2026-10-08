import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { statSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import puppeteer from "puppeteer-core"

const types = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".webm": "video/webm",
}

export async function serve(target) {
  if (/^https?:\/\//.test(target)) return { url: target, files: new Map(), close() {} }
  const page = resolve(target)
  const isDir = statSync(page).isDirectory()
  const dir = isDir ? page : dirname(page)
  let repo = dir
  try {
    repo = execFileSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {}
  const roots = [repo, dir, join(dir, "public")]
  const files = new Map()
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html")
    for (const root of roots) {
      try {
        const file = join(root, path)
        const body = await readFile(file)
        files.set(file, body)
        return res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(body)
      } catch {}
    }
    res.writeHead(404).end()
  }).listen(0, "127.0.0.1")
  await new Promise(r => server.once("listening", r))
  const path = relative(repo, page).split(sep).join("/")
  return { url: `http://127.0.0.1:${server.address().port}/${path}${isDir && path ? "/" : ""}`, files, close: () => server.close() }
}

export const misses = new Set()

export const watch = page => {
  page.on("response", r => r.status() >= 400 && !r.url().endsWith("/favicon.ico") && misses.add(r.url()))
  page.on("requestfailed", r => misses.add(r.url()))
  return page
}

export const reportMisses = () => {
  if (misses.size) console.warn(`didn't load: ${[...misses].join(", ")}\nif this page needs a dev server (Vite, Next), start it and pass its URL`)
}

export const chrome = () =>
  puppeteer.launch({
    ...(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: "chrome" }),
    headless: true,
    protocolTimeout: 0,
    args: ["--force-color-profile=srgb", "--hide-scrollbars", "--disable-dev-shm-usage"],
  })
