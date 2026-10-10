import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { serve, chrome, watch, reportMisses } from "./lib.mjs"

const [target, ...rest] = process.argv.slice(2)
const size = rest[0]?.match(/^(\d+)x(\d+)(?:@(\d+))?$/)
if (!target || (size && !rest[1])) {
  console.error(`usage:
  bun shoot.mjs <page|url> [out-dir]                          every width from 320 to 1920 in light and dark: problems, shots, 1:1 tiles
  bun shoot.mjs <page|url> <W>x<H>[@scale] <out.png> [--clear]  one exact render: og image, icon, banner`)
  process.exit(1)
}

const { url, close } = await serve(target)
const browser = await chrome()
const page = watch(await browser.newPage())
const load = async () => {
  await page.goto(url, { waitUntil: "networkidle0" })
  await page.evaluate(() => document.fonts.ready)
}

function findProblems() {
  const found = []
  const doc = document.documentElement
  if (doc.scrollWidth > innerWidth) found.push(`page scrolls sideways by ${doc.scrollWidth - innerWidth}px`)
  for (const el of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(el)
    if (style.display.startsWith("inline") || style.textOverflow === "ellipsis" || /auto|scroll/.test(style.overflowX)) continue
    if (el.clientWidth <= 1 || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
    if (el.scrollWidth > el.clientWidth + 1) {
      const name = el.tagName.toLowerCase() + (el.classList[0] ? `.${el.classList[0]}` : "")
      found.push(`text wider than its box: ${name} "${el.textContent.trim().slice(0, 40)}"`)
    }
  }
  const lines = el => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return [...range.getClientRects()].filter(r => r.width && r.height)
  }
  const label = el => `${el.tagName.toLowerCase()}${el.classList[0] ? `.${el.classList[0]}` : ""} "${el.textContent.trim().slice(0, 40)}"`
  for (const el of document.body.querySelectorAll("code, kbd, samp, pre, [data-url]")) {
    if (el.textContent.trim().includes("\n") || el.parentElement.closest("code, kbd, samp, pre, [data-url]")) continue
    const tops = new Set(lines(el).map(r => Math.round(r.top + r.height / 2)))
    if (tops.size > 1) found.push(`wraps onto ${tops.size} lines, truncate it with an ellipsis instead: ${label(el)}`)
  }
  const painted = style => style.backgroundImage !== "none" || !/^(transparent|rgba\(.*, 0\))$/.test(style.backgroundColor)
  for (const el of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(el)
    if (!style.display.startsWith("inline") || !painted(style) || !el.textContent.trim()) continue
    const block = el.parentElement.closest(":not(a, b, i, em, strong, span, mark, code, kbd, small, sup, sub)") ?? el.parentElement
    for (const band of el.getClientRects()) {
      const above = lines(block).find(r => r.bottom <= band.bottom - band.height / 2 && r.top < band.top && r.bottom > band.top + 0.5 && r.right > band.left && r.left < band.right)
      if (above) {
        found.push(`highlight band overlaps the line above by ${Math.round(above.bottom - band.top)}px: ${label(el)}`)
        break
      }
    }
  }
  return found
}

function lightImages() {
  const luminance = ([r, g, b]) => [r, g, b].map(v => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
  const backdrop = el => {
    for (let at = el.parentElement; at; at = at.parentElement) {
      const [r, g, b, a = 1] = getComputedStyle(at).backgroundColor.match(/[\d.]+/g).map(Number)
      if (a > 0.5) return luminance([r, g, b])
    }
    return 0
  }
  const canvas = new OffscreenCanvas(16, 16)
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  const found = []
  for (const img of document.querySelectorAll("img, video")) {
    const { width, height } = img.getBoundingClientRect()
    if (width * height < 0.08 * innerWidth * Math.min(innerHeight, 900) || backdrop(img) > 0.2) continue
    try {
      ctx.clearRect(0, 0, 16, 16)
      ctx.drawImage(img, 0, 0, 16, 16)
      const { data } = ctx.getImageData(0, 0, 16, 16)
      let sum = 0
      for (let i = 0; i < data.length; i += 4) sum += luminance([data[i], data[i + 1], data[i + 2]]) * (data[i + 3] / 255) + backdrop(img) * (1 - data[i + 3] / 255)
      if (sum / 256 > 0.5) found.push(`big light image on a dark page, set it on a light band: ${(img.currentSrc || img.src).split("/").pop()}`)
    } catch {}
  }
  return found
}

async function showEverything() {
  for (const img of document.querySelectorAll('img[loading="lazy"]')) img.loading = "eager"
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
    scrollTo(0, y)
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  }
  scrollTo(0, 0)
  await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
}

async function tile(b64, height) {
  const lin = Array.from({ length: 256 }, (_, i) => (i <= 10 ? i / 255 / 12.92 : ((i / 255 + 0.055) / 1.055) ** 2.4))
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  const image = await createImageBitmap(new Blob([bytes], { type: "image/png" }))
  const tiles = []
  for (let y = 0; y < image.height; y += height / 2) {
    const canvas = new OffscreenCanvas(image.width, Math.min(height, image.height - y))
    const ctx = canvas.getContext("2d")
    ctx.drawImage(image, 0, -y)
    const { data, width } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const buckets = new Map()
    let samples = 0
    for (let py = 0; py < canvas.height; py += 4) {
      for (let px = 0; px < width; px += 4) {
        const i = (py * width + px) * 4
        const [r, g, b] = [lin[data[i]], lin[data[i + 1]], lin[data[i + 2]]]
        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
        const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
        const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
        const lab = [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
        const key = `${Math.round(lab[0] / 0.04)},${Math.round(lab[1] / 0.02)},${Math.round(lab[2] / 0.02)}`
        const bucket = buckets.get(key) ?? buckets.set(key, { n: 0, lab: [0, 0, 0], rgb: [0, 0, 0] }).get(key)
        bucket.n++
        for (const k of [0, 1, 2]) (bucket.lab[k] += lab[k]), (bucket.rgb[k] += data[i + k])
        samples++
      }
    }
    const areas = []
    for (const { n, lab, rgb } of [...buckets.values()].sort((a, b) => b.n - a.n)) {
      const mean = lab.map(v => v / n)
      const near = areas.find(a => Math.hypot(...a.lab.map((v, k) => v / a.n - mean[k])) < 0.04)
      const into = near ?? areas[areas.push({ n: 0, lab: [0, 0, 0], rgb: [0, 0, 0] }) - 1]
      into.n += n
      for (const k of [0, 1, 2]) (into.lab[k] += lab[k]), (into.rgb[k] += rgb[k])
    }
    const blob = y % height ? null : await canvas.convertToBlob({ type: "image/png" })
    const png = blob && (await new Promise(done => {
      const reader = new FileReader()
      reader.onload = () => done(reader.result.split(",")[1])
      reader.readAsDataURL(blob)
    }))
    tiles.push({
      y,
      png,
      areas: areas
        .filter(a => a.n / samples >= 0.05 && (canvas.height >= height / 2 || !y))
        .map(a => ({ share: a.n / samples, lab: a.lab.map(v => v / a.n), hex: "#" + a.rgb.map(v => Math.round(v / a.n).toString(16).padStart(2, "0")).join("") })),
    })
  }
  return tiles
}

function fights(areas) {
  const lch = ({ lab: [L, a, b] }) => [L, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI]
  const found = []
  for (const [i, one] of areas.entries()) {
    for (const other of areas.slice(i + 1)) {
      const [[L1, C1, h1], [L2, C2, h2]] = [lch(one), lch(other)]
      const turn = Math.abs(((h1 - h2 + 540) % 360) - 180)
      if (Math.min(C1, C2) >= 0.03 && turn >= 90 && Math.abs(L1 - L2) < 0.05) {
        const key = [h1, h2].map(h => Math.round(h / 30)).sort().join()
        found.push([key, `colors fight: ${one.hex} (${Math.round(one.share * 100)}% of the view) next to ${other.hex} (${Math.round(other.share * 100)}%), hues ${Math.round(turn)}° apart at the same lightness`])
      }
    }
  }
  return found
}

if (size) {
  const [width, height, scale] = size.slice(1).map(v => Number(v ?? 1))
  await page.setViewport({ width, height, deviceScaleFactor: scale })
  await load()
  await page.screenshot({ path: rest[1], omitBackground: rest.includes("--clear") })
  console.log(rest[1])
} else {
  const out = rest[0] ?? "shots"
  await mkdir(join(out, "tiles"), { recursive: true })
  const decoder = await browser.newPage()
  await page.bringToFront()
  const widths = [...new Set([...Array.from({ length: 41 }, (_, i) => 320 + i * 40), 390, 1035, 1366, 1512])].sort((a, b) => a - b)
  const shots = { 390: 2, 1035: 1, 1440: 1 }
  const problems = new Map()
  const note = (problem, where, key = problem) => {
    const seen = problems.get(key) ?? problems.set(key, { problem, where: [] }).get(key)
    seen.where.push(where)
  }
  for (const scheme of ["light", "dark"]) {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: scheme },
      { name: "prefers-reduced-motion", value: "reduce" },
    ])
    for (const width of widths) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: shots[width] ?? 1 })
      await load()
      for (const problem of await page.evaluate(findProblems)) note(problem, `${scheme} ${width}`)
      if (!shots[width]) continue
      await page.evaluate(showEverything)
      await page.waitForNetworkIdle({ concurrency: 2 })
      if (scheme === "dark") for (const problem of await page.evaluate(lightImages)) note(problem, `dark ${width}`)
      const scale = shots[width]
      const full = await page.screenshot({ path: join(out, `${width}-${scheme}.png`), fullPage: true })
      const tiles = await decoder.evaluate(tile, Buffer.from(full).toString("base64"), 900 * scale)
      for (const { y, png, areas } of tiles) {
        const top = y / scale
        if (png) await writeFile(join(out, "tiles", `${width}-${scheme}-${String(top / 900 + 1).padStart(2, "0")}.png`), Buffer.from(png, "base64"))
        for (const [key, problem] of fights(areas)) note(problem, `${scheme} ${width} y ${top}–${top + 900}`, key)
      }
    }
  }
  for (const { problem, where } of problems.values()) console.log(`${problem}\n  at ${where.join(", ")}`)
  console.log(problems.size ? `\n${problems.size} problem${problems.size === 1 ? "" : "s"}` : "no problems", `· shots in ${out}/ at 390@2x, 1035, 1440, cut into screen-high tiles in ${out}/tiles/`)
}

reportMisses()
await browser.close()
close()
