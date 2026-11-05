import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { homedir } from "node:os"
import opentype from "opentype.js"

const here = import.meta.dirname
const brand = `${here}/../brand`
const readme = process.argv[2] ?? `${here}/../../brand-it/.github/assets`
const shoot = `${homedir()}/.agents/skills/brand-it/scripts/shoot.mjs`
const env = { ...process.env, TMPDIR: process.env.TMPDIR ?? `${here}/../.scratch` }

const mono = opentype.loadSync(`${brand}/logo/ttf/MonaSansMono-Medium.ttf`)
const f = n => Number(n.toFixed(2))

const header = (file, pencil) => {
  const lockup = readFileSync(`${brand}/logo/${file}`, "utf8")
  const [, vw, vh] = lockup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number)
  const inner = lockup.match(/<g transform=.*<\/g><\/g>/s)[0]
  const column = 838
  const pad = 8
  const width = 540
  const scale = width / vw
  const height = vh * scale
  const dimY = height + 28
  const label = mono.getPath(String(column), 0, 0, 14)
  const box = label.getBoundingBox()
  const gap = box.x2 - box.x1 + 20
  const mid = column / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${column} ${f(dimY + 10)}" width="${column}" height="${f(dimY + 10)}" role="img" aria-label="brand-it, measured at ${column}">` +
    `<g transform="translate(${f(mid - width / 2)} 0) scale(${f(scale)})">${inner}</g>` +
    `<g stroke="${pencil}" stroke-width="1" fill="none"><path d="M0.5 ${f(dimY - 7)}V${f(dimY + 7)}M${column - 0.5} ${f(dimY - 7)}V${f(dimY + 7)}M0 ${f(dimY)}H${f(mid - gap / 2)}M${f(mid + gap / 2)} ${f(dimY)}H${column}"/></g>` +
    `<g transform="translate(${f(mid - (box.x1 + box.x2) / 2)} ${f(dimY + 5)})"><path fill="${pencil}" d="${label.toPathData(2)}"/></g>` +
    `</svg>\n`
}

mkdirSync(readme, { recursive: true })
writeFileSync(`${readme}/brand-it.svg`, header("brand-it-lockup.svg", "#0A6DC8"))
writeFileSync(`${readme}/brand-it-dark.svg`, header("brand-it-lockup-dark.svg", "#62BBFF"))
console.log(`${readme}/brand-it.svg, brand-it-dark.svg`)

copyFileSync(`${brand}/logo/favicon.svg`, `${here}/public/favicon.svg`)
copyFileSync(`${brand}/logo/png/apple-touch-icon-180.png`, `${here}/public/apple-touch-icon.png`)
copyFileSync(`${brand}/logo/png/icon-512.png`, `${here}/public/icon-512.png`)
for (const [size, out] of [["1200x630", `${here}/public/og.png`], ["1280x640", `${here}/social-preview.png`]]) {
  execFileSync("bun", [shoot, `${here}/og.html`, size, out], { stdio: "inherit", env })
}
