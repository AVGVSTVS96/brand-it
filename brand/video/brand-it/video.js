import { wordmark, b, nodes } from "./parts.js"

const { spring } = Motion
const SVG = "http://www.w3.org/2000/svg"
const CHAR = 0.045
const ENTER = 0.22
const NODE = 0.024

const stage = document.getElementById("stage")
const scenes = [...document.querySelectorAll(".scene")]
export const END = Math.max(...scenes.map(s => +s.dataset.e))
export const cues = []

const springs = { settle: [0.5, 0], draw: [0.6, 0], pop: [0.35, 0] }
for (const [name, [duration, bounce]] of Object.entries(springs)) stage.style.setProperty(`--${name}`, spring(duration, bounce))
for (const s of scenes) s.style.setProperty("--s", s.dataset.s)

const svg = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}
const fit = (el, path, pad) => {
  const box = path.getBBox()
  el.setAttribute("viewBox", `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`)
  return box
}
const squares = (parent, size, delay, cue) =>
  nodes.forEach(([x, y], i) => {
    const node = svg("rect", { class: "node a", x: x - size / 2, y: y - size / 2, width: size, height: size })
    node.style.cssText = `--k:pop;--t:var(--pop);--d:${(delay + i * NODE).toFixed(3)}`
    if (cue && !i) node.dataset.cue = cue
    parent.append(node)
  })

const mark = (el, cls) => el.append(svg("path", { class: cls, d: wordmark }))
mark(document.getElementById("rail-wm"), "ink")
mark(document.getElementById("wordmark"), "ink")
for (const id of ["rail-wm", "wordmark"]) fit(document.getElementById(id), document.getElementById(id).firstChild, 2)

const lockup = document.getElementById("lockup")
mark(lockup, "ink")
squares(lockup, 3.4, 0.4)
fit(lockup, lockup.firstChild, 2)

const markSvg = document.getElementById("mark")
const outline = svg("path", { class: "outline", d: b })
const ink = svg("path", { class: "ink a", d: b })
ink.style.cssText = "--k:fade;--t:.3s var(--ease);--d:3.1"
ink.dataset.cue = "ready volume=.7"
markSvg.append(outline, ink)
squares(markSvg, 2.4, 2.4, "count duration=700 volume=.3")
const box = fit(markSvg, outline, 8)
outline.style.setProperty("--len", outline.getTotalLength())
outline.style.setProperty("--hair-w", (2 * (box.height + 16)) / markSvg.clientHeight)
outline.style.animation = "stroke .8s var(--ease) calc((var(--s) + 1.6) * 1s) both, out .25s var(--ease) calc((var(--s) + 3.1) * 1s) both"

// the two dimensions read what gen.mjs printed for the same outlines, so one unit runs through the scene
const printed = document.getElementById("gen-out").textContent
const measure = () => {
  seek(13)
  const name = document.getElementById("name-dim")
  const frame = name.closest(".frame").getBoundingClientRect()
  const r = lockup.firstChild.getBoundingClientRect()
  name.style.setProperty("--x", `${r.left - frame.left}px`)
  name.style.setProperty("--w", `${r.width}px`)
  name.style.setProperty("--y", `${r.bottom - frame.top + 28}px`)
  name.querySelector("span").textContent = printed.match(/wordmark: \{\s*w: ([\d.]+)/)[1]

  seek(19)
  const dim = document.getElementById("mark-dim")
  const fig = document.getElementById("mark-fig").getBoundingClientRect()
  const g = ink.getBoundingClientRect()
  dim.style.setProperty("--x", `${g.right - fig.left + 36}px`)
  dim.style.setProperty("--y", `${g.top - fig.top}px`)
  dim.style.setProperty("--h", `${g.height}px`)
  dim.querySelector("span").textContent = printed.match(/b: \{[^}]*?h: ([\d.]+)/)[1]
}

function parse(cue) {
  const [name, ...pairs] = cue.split(" ")
  return { name, options: Object.fromEntries(pairs.map(p => p.split("=")).map(([k, v]) => [k, Number.isNaN(+v) ? v : +v])) }
}

const typed = [...document.querySelectorAll("[data-type]")].map(el => {
  const scene = +el.closest(".scene").dataset.s
  const text = el.dataset.type
  const char = +(el.dataset.char ?? CHAR)
  const start = scene + +el.dataset.d
  const show = el.dataset.show === undefined ? start - 0.3 : scene + +el.dataset.show
  const done = start + text.length * char
  const enter = done + +(el.dataset.enter ?? ENTER)
  const verb = +(el.dataset.verb ?? 0)
  for (let i = 0; i < text.length; i++) if (text[i] !== " ") cues.push({ t: start + i * char, name: "type", options: { key: "printable", emphasis: "subtle", volume: 0.75 }, el })
  cues.push({ t: enter, name: "type", options: { key: "enter", emphasis: "subtle", volume: 0.9 }, el })
  if (el.dataset.cue) cues.push({ t: enter, ...parse(el.dataset.cue), el })
  return { el, text, char, start, show, done, enter, verb, t: el.querySelector(".t") }
})

for (const el of document.querySelectorAll("[data-cue]:not([data-type])")) {
  const style = getComputedStyle(el)
  cues.push({ t: +style.getPropertyValue("--s") + +(style.getPropertyValue("--d") || 0), ...parse(el.dataset.cue), el })
}

// the sweep: the widths shoot.mjs loads, a few of them held longer where it found a problem, light then dark
const sweep = document.getElementById("sweep")
const sweepScene = sweep.closest(".scene")
const every = +sweep.dataset.every
const problems = new Set(sweep.dataset.problems.split(" ").map(Number))
const steps = []
let at = +sweepScene.dataset.s + +sweep.dataset.d
for (const scheme of ["light", "dark"])
  for (const step of sweep.dataset.widths.split(" ")) {
    const [width, hold = every] = step.split(":").map(Number)
    const img = document.createElement("img")
    img.src = `sweep/${scheme}-${width}.webp`
    img.alt = ""
    sweep.querySelector(".shot").append(img)
    steps.push({ scheme, width, img, from: at })
    at += hold
  }
const sweepLabel = sweep.querySelector(".label")
const sweepNumber = sweep.querySelector(".dim span")
let shown = -1
const showStep = i => {
  if (i === shown) return
  steps[shown]?.img.classList.remove("on")
  shown = i
  const { scheme, width, img } = steps[i]
  img.classList.add("on")
  sweep.style.setProperty("--w", `${width * parseFloat(getComputedStyle(sweep).getPropertyValue("--scale"))}px`)
  sweep.classList.toggle("problem", problems.has(width))
  sweepLabel.textContent = `brand-it · ${width} · ${scheme}`
  sweepNumber.textContent = width
}

const count = document.getElementById("count")
const pad = n => String(n).padStart(2, "0")

export function seek(t) {
  scenes.forEach((s, i) => {
    const on = t >= +s.dataset.s && t < +s.dataset.e
    s.classList.toggle("on", on)
    if (on) count.textContent = `${pad(i + 1)} / ${pad(scenes.length)}`
  })
  for (const c of typed) {
    const n = t < c.start ? 0 : Math.min(c.text.length, Math.floor((t - c.start) / c.char + 1e-6) + 1)
    const shown = c.text.slice(0, n)
    c.t.innerHTML = c.verb && n > c.verb ? `<b>${shown.slice(0, c.verb)}</b>${shown.slice(c.verb)}` : shown
    c.el.classList.toggle("on", t >= c.show)
    c.el.classList.toggle("live", t >= c.start && t < c.enter)
  }
  showStep(Math.max(0, steps.findLastIndex(step => t >= step.from - 1e-6)))
  for (const a of document.getAnimations()) {
    a.pause()
    a.currentTime = t * 1000
  }
}

measure()
seek(0)
window.seek = seek
window.END = END

if (!navigator.webdriver) {
  const audio = new Audio("out/soundtrack.wav")
  const from = +new URLSearchParams(location.search).get("t") || 0
  let t0 = performance.now() - from * 1000
  addEventListener("click", () => {
    audio.currentTime = 0
    audio.play()
  })
  audio.addEventListener("ended", () => (t0 = performance.now()))
  const tick = now => {
    seek(audio.paused ? ((now - t0) / 1000) % END : audio.currentTime)
    requestAnimationFrame(tick)
  }
  document.fonts.ready.then(() => requestAnimationFrame(tick))
}
