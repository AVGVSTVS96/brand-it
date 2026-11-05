import { readFileSync, writeFileSync } from "node:fs";

import { parse } from "opentype.js";
import type { BoundingBox, Font, Path } from "opentype.js";

import { pathData } from "./path-data.ts";

const out = import.meta.dirname;
const font = (file: string) => parse(Uint8Array.from(readFileSync(`${out}/ttf/${file}`)).buffer);
const sans = font("MonaSans-SemiBold.ttf");
const mono = font("MonaSansMono-Medium.ttf");

const SIZE = 100;
const TRACK = -35;
const PAD = 8;

interface Colors {
  paper: string;
  ink: string;
  pencil: string;
}

const light: Colors = { ink: "#0F1113", paper: "#FFFFFF", pencil: "#0A6DC8" };
const dark: Colors = { ink: "#ECEEF0", paper: "#101214", pencil: "#62BBFF" };
const flat: Colors = { ink: "currentColor", paper: "none", pencil: "currentColor" };

type Point = readonly [number, number];

type Draw = (colors: Colors) => string;

interface Run {
  path: Path;
  d: string;
  box: BoundingBox;
  advance: number;
}

const f = (n: number) => Number(n.toFixed(2));

const svg = (w: number, h: number, body: string, label = "brand-it") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${label}">${body}</svg>\n`;

const write = (name: string, content: string) => {
  writeFileSync(`${out}/${name}`, content);
};

const run = (face: Font, text: string, size = SIZE, tracking = TRACK): Run => {
  const path = face.getPath(text, 0, 0, size, { kerning: true, tracking });

  return {
    advance: face.getAdvanceWidth(text, size, { kerning: true, tracking }),
    box: path.getBoundingBox(),
    d: pathData(path),
    path,
  };
};

const onCurve = (path: Path) => {
  const seen = new Set<string>();
  const points: Point[] = [];

  for (const command of path.commands) {
    if (command.type !== "Z") {
      const key = `${command.x.toFixed(1)},${command.y.toFixed(1)}`;

      if (!seen.has(key)) {
        seen.add(key);
        points.push([command.x, command.y]);
      }
    }
  }

  return points;
};

const squares = (points: Point[], colors: Colors, side: number, halo = 0.8) => {
  const rects = points
    .map(
      ([x, y]) =>
        `<rect x="${f(x - side / 2)}" y="${f(y - side / 2)}" width="${f(side)}" height="${f(side)}"/>`,
    )
    .join("");

  const stroke = colors.paper === "none" ? "none" : colors.paper;

  return `<g fill="${colors.pencil}" stroke="${stroke}" stroke-width="${halo}">${rects}</g>`;
};

const wm = run(sans, "brand-it");
const b = run(sans, "b");
const top = -wm.box.y1;
const W = wm.box.x2 - wm.box.x1;
const H = top + wm.box.y2;

const placed = (x: number, y: number, inner: string) =>
  `<g transform="translate(${f(x)} ${f(y)})">${inner}</g>`;

const wordmark: Draw = (colors) => `<path fill="${colors.ink}" d="${wm.d}"/>`;

const nodesOnTheB: Draw = (colors) => wordmark(colors) + squares(onCurve(b.path), colors, 3.4);

const lockupNodes: Draw = (colors) =>
  svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, nodesOnTheB(colors)));

const brand = run(sans, "brand");
const it = run(sans, "it");
const seamGap = 14;
const blockX = brand.advance + seamGap;
const blockPad = 11;
const blockTop = -80;
const blockBottom = 6;
const blockW = it.box.x2 - it.box.x1 + blockPad * 2;

const itKnockedOut: Draw = (colors) => {
  const knockedOut = placed(
    blockX + blockPad - it.box.x1,
    0,
    `<path fill="${colors.paper === "none" ? "#fff" : colors.paper}" d="${it.d}"/>`,
  );

  return `<path fill="${colors.ink}" d="${brand.d}"/><rect fill="${colors.ink}" x="${f(blockX)}" y="${blockTop}" width="${f(blockW)}" height="${blockBottom - blockTop}"/>${knockedOut}`;
};

const lockupSeam: Draw = (colors) =>
  svg(
    blockX + blockW + PAD * 2 - brand.box.x1,
    H + PAD * 2,
    placed(PAD - brand.box.x1, PAD + top, itKnockedOut(colors)),
  );

const dimY = 24;
const label = run(mono, `${Math.round(W)}`, 11, 0);

const measuredWordmark: Draw = (colors) => {
  const x0 = wm.box.x1;
  const x1 = wm.box.x2;
  const mid = (x0 + x1) / 2;
  const lw = label.box.x2 - label.box.x1 + 10;

  const number = placed(
    mid - (label.box.x1 + label.box.x2) / 2,
    dimY + 4,
    `<path fill="${colors.pencil}" d="${label.d}"/>`,
  );

  const lines =
    `<g stroke="${colors.pencil}" stroke-width="1" fill="none">` +
    `<path d="M${f(x0)} 8V${dimY + 6}M${f(x1)} 8V${dimY + 6}"/>` +
    `<path d="M${f(x0)} ${dimY}H${f(mid - lw / 2)}M${f(mid + lw / 2)} ${dimY}H${f(x1)}"/>` +
    `</g>`;

  return `${wordmark(colors)}${lines}${number}`;
};

const lockupDimension: Draw = (colors) =>
  svg(
    W + PAD * 2,
    H + dimY + PAD * 2,
    placed(PAD - wm.box.x1, PAD + top, measuredWordmark(colors)),
  );

const TILE = 100;
const RX = 14;
const bScale = 0.72;
const bW = b.box.x2 - b.box.x1;
const bH = b.box.y2 - b.box.y1;
const bX = (TILE - bW * bScale) / 2 - b.box.x1 * bScale;
const bY = (TILE - bH * bScale) / 2 - b.box.y1 * bScale;

const inTile = (inner: string) =>
  `<g transform="translate(${f(bX)} ${f(bY)}) scale(${bScale})">${inner}</g>`;

const tile = (colors: Colors, inner: string) =>
  (colors.paper === "none"
    ? ""
    : `<rect fill="${colors.paper}" width="${TILE}" height="${TILE}" rx="${RX}"/>`) + inTile(inner);

const markNodes: Draw = (colors) =>
  tile(
    colors,
    `<path fill="${colors.ink}" d="${b.d}"/>${squares(onCurve(b.path), colors, 3.4 / bScale, 0.8 / bScale)}`,
  );

const markPlain: Draw = (colors) => tile(colors, `<path fill="${colors.ink}" d="${b.d}"/>`);

const markSeam: Draw = (colors) =>
  `<clipPath id="t"><rect width="${TILE}" height="${TILE}" rx="${RX}"/></clipPath><clipPath id="l"><rect width="${TILE / 2}" height="${TILE}"/></clipPath><clipPath id="r"><rect x="${TILE / 2}" width="${TILE / 2}" height="${TILE}"/></clipPath>` +
  `<g clip-path="url(#t)"><rect fill="${colors.paper}" width="${TILE}" height="${TILE}"/><rect fill="${colors.ink}" x="${TILE / 2}" width="${TILE / 2}" height="${TILE}"/></g>` +
  `<g clip-path="url(#l)">${inTile(`<path fill="${colors.ink}" d="${b.d}"/>`)}</g>` +
  `<g clip-path="url(#r)">${inTile(`<path fill="${colors.paper}" d="${b.d}"/>`)}</g>` +
  `<rect fill="none" stroke="${colors.ink}" stroke-opacity=".18" x=".5" y=".5" width="${TILE - 1}" height="${TILE - 1}" rx="${RX}"/>`;

const markDimension: Draw = (colors) => {
  const x0 = b.box.x1;
  const x1 = b.box.x2;
  const y = b.box.y2 + 14;

  return tile(
    colors,
    `<path fill="${colors.ink}" d="${b.d}"/>` +
      `<g stroke="${colors.pencil}" stroke-width="${f(1.4 / bScale)}" fill="none"><path d="M${f(x0)} ${f(b.box.y2 + 4)}V${f(y + 5)}M${f(x1)} ${f(b.box.y2 + 4)}V${f(y + 5)}M${f(x0)} ${f(y)}H${f(x1)}"/></g>`,
  );
};

const faviconStyle = `<style>:root{color-scheme:light dark}.p{fill:${light.paper}}.i{fill:${light.ink}}@media(prefers-color-scheme:dark){.p{fill:${dark.paper}}.i{fill:${dark.ink}}}</style>`;

const explorations = {
  "a-mark": (colors) => svg(TILE, TILE, markNodes(colors)),
  "a-nodes": lockupNodes,
  "b-mark": (colors) => svg(TILE, TILE, markSeam(colors)),
  "b-seam": lockupSeam,
  "c-dimension": lockupDimension,
  "c-mark": (colors) => svg(TILE, TILE, markDimension(colors)),
} satisfies Record<string, Draw>;

for (const [name, draw] of Object.entries(explorations)) {
  write(`explore-${name}.svg`, draw(light));
  write(`explore-${name}-dark.svg`, draw(dark));
}

const lockup = lockupNodes;
const mark = markNodes;

const plainWordmark = (colors: Colors) =>
  svg(W + PAD * 2, H + PAD * 2, placed(PAD - wm.box.x1, PAD + top, wordmark(colors)));

write("brand-it.svg", plainWordmark(light));

write("brand-it-dark.svg", plainWordmark(dark));

write("brand-it-mono.svg", plainWordmark(flat));

write("brand-it-lockup.svg", lockup(light));

write("brand-it-lockup-dark.svg", lockup(dark));

write("mark.svg", svg(TILE, TILE, mark(light)));

write("mark-dark.svg", svg(TILE, TILE, mark(dark)));

write("mark-mono.svg", svg(TILE, TILE, markPlain(flat)));

write("icon.svg", svg(TILE, TILE, markPlain(light)));

write("icon-dark.svg", svg(TILE, TILE, markPlain(dark)));

write(
  "favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}">${faviconStyle}<rect class="p" width="${TILE}" height="${TILE}" rx="${RX}"/>${inTile(`<path class="i" d="${b.d}"/>`)}</svg>\n`,
);

console.log({
  b: { h: f(bH), nodes: onCurve(b.path).length, w: f(bW) },
  wordmark: { advance: f(wm.advance), h: f(H), w: f(W) },
});
