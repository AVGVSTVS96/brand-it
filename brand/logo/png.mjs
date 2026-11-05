import { readFileSync, mkdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { homedir } from "node:os"

const out = import.meta.dirname
const shoot = `${homedir()}/.agents/skills/brand-it/scripts/shoot.mjs`
mkdirSync(`${out}/png`, { recursive: true })

const jobs = [
  ["brand-it", 2000, "--clear"],
  ["brand-it-dark", 2000, "--clear"],
  ["brand-it-lockup", 2000, "--clear"],
  ["brand-it-lockup-dark", 2000, "--clear"],
  ["mark", 512],
  ["mark-dark", 512],
  ["icon", 512],
  ["icon-dark", 512],
  ["icon", 180, "", "apple-touch-icon"],
  ["icon", 32, "", "favicon"],
  ["icon", 16, "", "favicon"],
]

for (const [name, width, clear = "", as = name] of jobs) {
  const [, w, h] = readFileSync(`${out}/${name}.svg`, "utf8").match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number)
  const height = Math.round((width * h) / w)
  const file = `${out}/png/${as}${width === 2000 ? "@2x" : `-${width}`}.png`
  execFileSync("bun", [shoot, `${out}/${name}.svg`, `${width}x${height}`, file, ...(clear ? [clear] : [])], { stdio: "inherit", env: { ...process.env, TMPDIR: process.env.TMPDIR ?? `${out}/../../.scratch` } })
}
