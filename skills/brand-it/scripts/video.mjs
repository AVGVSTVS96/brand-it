import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises"
import { existsSync, statSync } from "node:fs"
import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { basename, dirname, join, resolve } from "node:path"
import { serve, chrome, watch, reportMisses } from "./lib.mjs"

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i < 0 ? fallback : args.splice(i, 2)[1]
}
const [width, height] = option("size", "1920x1080").split("x").map(Number)
const outOption = option("out")
const [target, mode, ...rest] = args
if (!target || !["stills", "sheet", "audio", "video"].includes(mode)) {
  console.error(`usage: bun video.mjs <page|url> <mode> [--size 1920x1080] [--out dir]
  stills <t…>    PNGs of single moments
  sheet [every]  one contact sheet, a frame every N seconds (default 2)
  audio          soundtrack.wav from window.soundtrack(), mastered to -14 LUFS, true peak under -2 dBTP
  video [fps]    the mp4 (default 60 fps), rendered in 5 s parts that resume; adds soundtrack.wav if it exists
the page sets window.END (seconds) and window.seek(t); window.soundtrack() returns { stem: base64 wav }`)
  process.exit(1)
}

const local = !/^https?:\/\//.test(target)
const pageDir = local ? (statSync(target).isDirectory() ? resolve(target) : dirname(resolve(target))) : process.cwd()
const out = resolve(outOption ?? join(pageDir, "out"))
const name = `${basename(pageDir)}${width === 1920 && height === 1080 ? "" : `-${width}x${height}`}`
await mkdir(out, { recursive: true })

const { url, files, close } = await serve(target)
const browser = await chrome()
let page
const open = async () => {
  await page?.close().catch(() => {})
  page = watch(await browser.newPage())
  await page.setViewport({ width, height })
  await page.goto(url, { waitUntil: "networkidle0" })
  await page.evaluate(() => document.fonts.ready)
}
await open()
const end = await page.evaluate(() => window.END)

const shot = async t => {
  await page.evaluate(t => window.seek(t), t)
  return page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } })
}

const ffmpeg = argv => {
  const child = spawn("ffmpeg", ["-y", "-hide_banner", ...argv], { stdio: ["pipe", "inherit", "pipe"] })
  let log = ""
  child.stderr.on("data", d => (log += d))
  const done = new Promise((ok, fail) => child.on("close", code => (code ? fail(new Error(log)) : ok(log))))
  return { stdin: child.stdin, done }
}

const pipeFrames = async (times, argv) => {
  const { stdin, done } = ffmpeg(["-loglevel", "error", "-f", "image2pipe", "-c:v", "png", ...argv])
  for (const t of times) if (!stdin.write(await shot(t))) await new Promise(r => stdin.once("drain", r))
  stdin.end()
  return done
}

const measure = async (inputs, filter) => {
  const log = await ffmpeg([...inputs, "-filter_complex", `${filter},ebur128=peak=true`, "-f", "null", "-"]).done
  const summary = log.slice(log.lastIndexOf("Summary"))
  return { lufs: Number(summary.match(/I:\s+(-?[\d.]+)/)[1]), peak: Number(summary.match(/Peak:\s+(-?[\d.]+)/)[1]) }
}

if (mode === "stills") {
  for (const t of rest.map(Number)) {
    const file = join(out, `${name}-${t.toFixed(2)}.png`)
    await writeFile(file, await shot(t))
    console.log(file)
  }
}

if (mode === "sheet") {
  const every = Number(rest[0] ?? 2)
  const times = Array.from({ length: Math.ceil(end / every) }, (_, i) => i * every)
  const file = join(out, `${name}-sheet.png`)
  await pipeFrames(times, ["-i", "-", "-vf", `scale=480:-1,tile=4x${Math.ceil(times.length / 4)}:padding=4`, "-frames:v", "1", file])
  console.log(file)
}

if (mode === "audio") {
  await page.mouse.click(1, 1)
  const stems = await page.evaluate(() => window.soundtrack())
  const inputs = []
  for (const [stem, data] of Object.entries(stems)) {
    await writeFile(join(out, `${stem}.wav`), Buffer.from(data, "base64"))
    inputs.push("-i", join(out, `${stem}.wav`))
  }
  const mix = inputs.length > 2 ? `amix=inputs=${inputs.length / 2}:normalize=0` : "anull"
  const master = gain => `${mix},volume=${gain}dB,aresample=192000,alimiter=limit=0.794:attack=5:release=50:level=0:latency=1,aresample=48000`
  let gain = -14 - (await measure(inputs, mix)).lufs
  gain += -14 - (await measure(inputs, master(gain))).lufs
  const file = join(out, "soundtrack.wav")
  await ffmpeg(["-loglevel", "error", ...inputs, "-filter_complex", master(gain), "-c:a", "pcm_f32le", file]).done
  const { lufs, peak } = await measure(["-i", file], "anull")
  console.log(`${file}: ${lufs} LUFS, true peak ${peak} dBTP`)
}

if (mode === "video") {
  const fps = Number(rest[0] ?? 60)
  const hash = local
    ? [...files].sort(([a], [b]) => a.localeCompare(b)).reduce((h, [path, body]) => h.update(path).update(body), createHash("sha256")).digest("hex").slice(0, 12)
    : Date.now().toString(36)
  const parts = join(out, `parts-${name}-${fps}-${hash}`)
  for (const dir of await readdir(out)) if (dir.startsWith(`parts-${name}-`) && join(out, dir) !== parts) await rm(join(out, dir), { recursive: true })
  await mkdir(parts, { recursive: true })
  const frames = Math.round(end * fps)
  const batch = 5 * fps
  const list = []
  for (let from = 0; from < frames; from += batch) {
    const part = `${String(from / batch).padStart(3, "0")}.mp4`
    list.push(`file '${part}'`)
    if (existsSync(join(parts, part))) continue
    await open()
    const times = Array.from({ length: Math.min(batch, frames - from) }, (_, i) => (from + i) / fps)
    await pipeFrames(times, [
      "-framerate", String(fps), "-i", "-",
      "-vf", "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv",
      "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-profile:v", "high", "-threads", "4",
      join(parts, `tmp-${part}`),
    ])
    await rename(join(parts, `tmp-${part}`), join(parts, part))
    process.stdout.write(`\r${Math.min((from + batch) / fps, end)}s / ${end}s`)
  }
  await writeFile(join(parts, "list.txt"), list.join("\n"))
  const sound = join(out, "soundtrack.wav")
  const file = join(out, `${name}.mp4`)
  await ffmpeg([
    "-loglevel", "error",
    "-f", "concat", "-safe", "0", "-i", join(parts, "list.txt"),
    ...(existsSync(sound) ? ["-i", sound] : ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]),
    "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", file,
  ]).done
  const heard = existsSync(sound) ? await measure(["-i", file], "anull") : null
  console.log(`\n${file}${heard ? `: ${heard.lufs} LUFS, true peak ${heard.peak} dBTP after AAC` : ", silent"}`)
}

reportMisses()
await browser.close()
close()
