import { chrome, watch, reportMisses } from "../../../../.agents/skills/brand-it/scripts/lib.mjs"

const sites = {
  hex: "https://hex-sand.vercel.app/",
  commonplace: "https://commonplace-eight-sable.vercel.app/",
}
const out = import.meta.dirname
const browser = await chrome()
const page = watch(await browser.newPage())
for (const [name, url] of Object.entries(sites)) {
  for (const scheme of ["light", "dark"]) {
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }, { name: "prefers-reduced-motion", value: "reduce" }])
    await page.setViewport({ width: 1035, height: 720, deviceScaleFactor: 2 })
    await page.goto(url, { waitUntil: "networkidle0" })
    await page.evaluate(() => document.fonts.ready)
    const path = `${out}/${name}-1035-${scheme}.png`
    await page.screenshot({ path })
    console.log(path)
  }
}
reportMisses()
await browser.close()
