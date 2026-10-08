import opentype from "opentype.js"
import { writeFileSync, rmSync } from "node:fs"

const out = import.meta.dirname
const sans = opentype.loadSync(`${out}/ttf/MonaSans-SemiBold.ttf`)
const mono = opentype.loadSync(`${out}/ttf/MonaSansMono-Medium.ttf`)

const SIZE = 100
const TRACK = -35
const PAD = 8
const PICK = "a"

const light = { paper: "#FFFFFF", ink: "#0F1113", pencil: "#0A6DC8" }
const dark = { paper: "#101214", ink: "#ECEEF0", pencil: "#62BBFF" }
const flat = { paper: "none", ink: "currentColor", pencil: "currentColor" }

const f = n => Number(n.toFixed(2))
const svg = (w, h, body, label = "brand-it") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${label}">${body}</svg>\n`
const write = (name, s) => writeFileSync(`${out}/${name}`, s)

const run = (font, str, size = SIZE, tracking = TRACK) => {
  const path = font.getPath(str, 0, 0, size, { kerning: true, tracking })
  const box = path.getBoundingBox()
  return { path, d: path.toPathData(2), box, advance: font.getAdvanceWidth(str, size, { kerning: true, tracking }) }
}

const onCurve = path => {
  const seen = new Set()
  const pts = []
  for (const c of path.commands) {
    if (c.type === "Z") continue
    const key = `${c.x.toFixed(1)},${c.y.toFixed(1)}`
    if (seen.has(key)) continue
    seen.add(key)
    pts.push([c.x, c.y])
  }
  return pts
}
const squares = (pts, c, s, halo = 0.8) =>
  `<g fill="${c.pencil}" stroke="${c.paper === "none" ? "none" : c.paper}" stroke-width="${halo}">` +
  pts.map(([x, y]) => `<rect x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${f(s)}" height="${f(s)}"/>`).join("") + "</g>"

const wm = run(sans, "brand-it")
const b = run(sans, "b")
const top = -wm.box.y1
const W = wm.box.x2 - wm.box.x1
const H = top + wm.box.y2

const placed = (x, y, inner) => `<g transform="translate(${f(x)} ${f(y)})">${inner}</g>`
const wordmark = c => `<path fill="${c.ink}" d="${wm.d}"/>`

// A · nodes: the wordmark in ink, the b's real on-curve points in pencil
const nodesA = c => wordmark(c) + squares(onCurve(b.path), c, 3.4)
const lockupA = c => svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, nodesA(c)))

// B · seam: brand in ink, it knocked out of an ink block, the hyphen becomes the edge
const brand = run(sans, "brand")
const it = run(sans, "it")
const seamGap = 14
const blockX = brand.advance + seamGap
const blockPad = 11
const blockTop = -80
const blockBottom = 6
const blockW = it.box.x2 - it.box.x1 + blockPad * 2
const seamB = c =>
  `<path fill="${c.ink}" d="${brand.d}"/>` +
  `<rect fill="${c.ink}" x="${f(blockX)}" y="${blockTop}" width="${f(blockW)}" height="${blockBottom - blockTop}"/>` +
  placed(blockX + blockPad - it.box.x1, 0, `<path fill="${c.paper === "none" ? "#fff" : c.paper}" d="${it.d}"/>`)
const lockupB = c => svg(blockX + blockW + PAD * 2 - brand.box.x1, H + PAD * 2, placed(PAD - brand.box.x1, PAD + top, seamB(c)))

// C · dimension: the wordmark measured, extension lines, a dimension line and its number
const dimY = 24
const label = run(mono, `${Math.round(W)}`, 11, 0)
const seamC = c => {
  const x0 = wm.box.x1, x1 = wm.box.x2, mid = (x0 + x1) / 2
  const lw = label.box.x2 - label.box.x1 + 10
  return wordmark(c) +
    `<g stroke="${c.pencil}" stroke-width="1" fill="none">` +
    `<path d="M${f(x0)} 8V${dimY + 6}M${f(x1)} 8V${dimY + 6}"/>` +
    `<path d="M${f(x0)} ${dimY}H${f(mid - lw / 2)}M${f(mid + lw / 2)} ${dimY}H${f(x1)}"/>` +
    `</g>` +
    placed(mid - (label.box.x1 + label.box.x2) / 2, dimY + 4, `<path fill="${c.pencil}" d="${label.d}"/>`)
}
const lockupC = c => svg(W + PAD * 2, H + dimY + PAD * 2, placed(PAD - wm.box.x1, PAD + top, seamC(c)))

// Marks: the b on a 100 tile
const T = 100
const RX = 14
const bScale = 0.72
const bW = b.box.x2 - b.box.x1
const bH = b.box.y2 - b.box.y1
const bX = (T - bW * bScale) / 2 - b.box.x1 * bScale
const bY = (T - bH * bScale) / 2 - b.box.y1 * bScale
const inTile = inner => `<g transform="translate(${f(bX)} ${f(bY)}) scale(${bScale})">${inner}</g>`
const tile = (c, inner, extra = "") =>
  (c.paper === "none" ? "" : `<rect fill="${c.paper}" width="${T}" height="${T}" rx="${RX}"/>`) + extra + inTile(inner)

const markA = c => tile(c, `<path fill="${c.ink}" d="${b.d}"/>` + squares(onCurve(b.path), c, 3.4 / bScale, 0.8 / bScale))
const markPlain = c => tile(c, `<path fill="${c.ink}" d="${b.d}"/>`)
const markB = c =>
  `<clipPath id="t"><rect width="${T}" height="${T}" rx="${RX}"/></clipPath><clipPath id="l"><rect width="${T / 2}" height="${T}"/></clipPath><clipPath id="r"><rect x="${T / 2}" width="${T / 2}" height="${T}"/></clipPath>` +
  `<g clip-path="url(#t)"><rect fill="${c.paper}" width="${T}" height="${T}"/><rect fill="${c.ink}" x="${T / 2}" width="${T / 2}" height="${T}"/></g>` +
  `<g clip-path="url(#l)">${inTile(`<path fill="${c.ink}" d="${b.d}"/>`)}</g>` +
  `<g clip-path="url(#r)">${inTile(`<path fill="${c.paper}" d="${b.d}"/>`)}</g>` +
  `<rect fill="none" stroke="${c.ink}" stroke-opacity=".18" x=".5" y=".5" width="${T - 1}" height="${T - 1}" rx="${RX}"/>`
const markC = c => {
  const x0 = b.box.x1, x1 = b.box.x2, y = b.box.y2 + 14
  return tile(c,
    `<path fill="${c.ink}" d="${b.d}"/>` +
    `<g stroke="${c.pencil}" stroke-width="${f(1.4 / bScale)}" fill="none"><path d="M${f(x0)} ${f(b.box.y2 + 4)}V${f(y + 5)}M${f(x1)} ${f(b.box.y2 + 4)}V${f(y + 5)}M${f(x0)} ${f(y)}H${f(x1)}"/></g>`)
}
const faviconStyle = `<style>:root{color-scheme:light dark}.p{fill:${light.paper}}.i{fill:${light.ink}}@media(prefers-color-scheme:dark){.p{fill:${dark.paper}}.i{fill:${dark.ink}}}</style>`

const explores = { "a-nodes": lockupA, "a-mark": c => svg(T, T, markA(c)), "b-seam": lockupB, "b-mark": c => svg(T, T, markB(c)), "c-dimension": lockupC, "c-mark": c => svg(T, T, markC(c)) }
for (const [name, draw] of Object.entries(explores)) {
  write(`explore-${name}.svg`, draw(light))
  write(`explore-${name}-dark.svg`, draw(dark))
}

const picks = { a: [lockupA, markA], b: [lockupB, markB], c: [lockupC, markC] }
const [lockup, mark] = picks[PICK]
write("brand-it.svg", svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, wordmark(light))))
write("brand-it-dark.svg", svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, wordmark(dark))))
write("brand-it-mono.svg", svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, wordmark(flat))))
write("brand-it-lockup.svg", lockup(light))
write("brand-it-lockup-dark.svg", lockup(dark))
write("mark.svg", svg(T, T, mark(light)))
write("mark-dark.svg", svg(T, T, mark(dark)))
write("mark-mono.svg", svg(T, T, markPlain(flat)))
write("icon.svg", svg(T, T, markPlain(light)))
write("icon-dark.svg", svg(T, T, markPlain(dark)))
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}">${faviconStyle}<rect class="p" width="${T}" height="${T}" rx="${RX}"/>${inTile(`<path class="i" d="${b.d}"/>`)}</svg>\n`)

console.log({ wordmark: { w: f(W), h: f(H), advance: f(wm.advance) }, b: { w: f(bW), h: f(bH), nodes: onCurve(b.path).length }, pick: PICK })
