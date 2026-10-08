import { mkdirSync, writeFileSync, rmSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { chrome, watch, reportMisses } from "../../../.agents/skills/brand-it/scripts/lib.mjs"

const sites = {
  hex: { url: "https://hex-sand.vercel.app/", og: "og.png?v=3" },
  commonplace: { url: "https://commonplace-eight-sable.vercel.app/", og: "og.png" },
  "brand-it": { url: "https://brand-it.vercel.app/", og: "og.png" },
}
const views = { 1035: 720, 390: 844 }
const only = process.argv.slice(2)
const out = `${import.meta.dirname}/public/examples`
mkdirSync(out, { recursive: true })

const webp = (png, file) => {
  const tmp = `${out}/.${file}.png`
  writeFileSync(tmp, png)
  execFileSync("magick", [tmp, "-quality", "92", `${out}/${file}.webp`])
  rmSync(tmp)
  console.log(`${file}.webp`)
}

const browser = await chrome()
const page = watch(await browser.newPage())
for (const [name, { url, og }] of Object.entries(sites)) {
  if (only.length && !only.includes(name)) continue
  for (const [width, height] of Object.entries(views)) {
    for (const scheme of ["light", "dark"]) {
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }, { name: "prefers-reduced-motion", value: "reduce" }])
      await page.setViewport({ width: Number(width), height, deviceScaleFactor: 2 })
      await page.goto(url, { waitUntil: "networkidle0" })
      await page.evaluate(() => document.fonts.ready)
      webp(await page.screenshot(), `${name}-${width}-${scheme}`)
    }
  }
  webp(Buffer.from(await (await fetch(new URL(og, url))).arrayBuffer()), `${name}-og`)
}
reportMisses()
await browser.close()
