import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { serve, chrome, watch, reportMisses } from "./lib.mjs"

const [target, ...rest] = process.argv.slice(2)
const size = rest[0]?.match(/^(\d+)x(\d+)(?:@(\d+))?$/)
if (!target || (size && !rest[1])) {
  console.error(`usage:
  bun shoot.mjs <page|url> [out-dir]                          every width from 320 to 1920 in light and dark: problems + shots
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
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
    if (el.scrollWidth > el.clientWidth + 1) {
      const name = el.tagName.toLowerCase() + (el.classList[0] ? `.${el.classList[0]}` : "")
      found.push(`text wider than its box: ${name} "${el.textContent.trim().slice(0, 40)}"`)
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
  await mkdir(out, { recursive: true })
  const widths = [...new Set([...Array.from({ length: 41 }, (_, i) => 320 + i * 40), 390, 1035, 1366, 1512])].sort((a, b) => a - b)
  const shots = { 390: 2, 1035: 1, 1440: 1 }
  const problems = new Map()
  for (const scheme of ["light", "dark"]) {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: scheme },
      { name: "prefers-reduced-motion", value: "reduce" },
    ])
    for (const width of widths) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: shots[width] ?? 1 })
      await load()
      for (const problem of await page.evaluate(findProblems)) {
        problems.set(problem, [...(problems.get(problem) ?? []), `${scheme} ${width}`])
      }
      if (shots[width]) await page.screenshot({ path: join(out, `${width}-${scheme}.png`), fullPage: true })
    }
  }
  for (const [problem, where] of problems) console.log(`${problem}\n  at ${where.join(", ")}`)
  console.log(problems.size ? `\n${problems.size} problems` : "no problems", `· shots in ${out}/ at 390@2x, 1035, 1440`)
}

reportMisses()
await browser.close()
close()
