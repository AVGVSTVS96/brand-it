import { mkdir } from "node:fs/promises"
import { serve, chrome, watch, reportMisses } from "../../../.agents/skills/brand-it/scripts/lib.mjs"

const here = import.meta.dirname
const target = process.argv[2] ?? `${here}/../site/dist/index.html`
const widths = [...new Set([...Array.from({ length: 41 }, (_, i) => 320 + i * 40), 390, 1035, 1366, 1512])].sort((a, b) => a - b)

await mkdir(`${here}/brand-it/sweep`, { recursive: true })
const { url, close } = await serve(target)
const browser = await chrome()
const page = watch(await browser.newPage())
for (const scheme of ["light", "dark"]) {
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: scheme },
    { name: "prefers-reduced-motion", value: "reduce" },
  ])
  for (const width of widths) {
    await page.setViewport({ width, height: 720, deviceScaleFactor: 1 })
    await page.goto(url, { waitUntil: "networkidle0" })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `${here}/brand-it/sweep/${scheme}-${width}.webp`, type: "webp", quality: 88 })
  }
}
console.log(`${widths.length} widths, light and dark, in brand-it/sweep/`)
reportMisses()
await browser.close()
close()
