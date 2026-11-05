import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

import { chrome, inOrder, reportMisses, watch } from "../../skills/brand-it/scripts/lib.ts";

const sites = [
  { name: "hex", og: "og.png?v=3", url: "https://hex-sand.vercel.app/" },
  { name: "commonplace", og: "og.png", url: "https://commonplace-eight-sable.vercel.app/" },
  { name: "brand-it", og: "og.png", url: "https://brand-it-seven.vercel.app/" },
];

const views = [
  { height: 844, width: 390 },
  { height: 720, width: 1035 },
];

const schemes = ["light", "dark"] as const;
const only = process.argv.slice(2);
const out = `${import.meta.dirname}/public/examples`;

mkdirSync(out, { recursive: true });

const webp = (png: Uint8Array, file: string) => {
  const tmp = `${out}/.${file}.png`;
  writeFileSync(tmp, png);
  execFileSync("magick", [tmp, "-quality", "92", `${out}/${file}.webp`]);
  rmSync(tmp);
  console.log(`${file}.webp`);
};

const browser = await chrome();
const page = watch(await browser.newPage());

await inOrder(
  sites.filter(({ name }) => only.length === 0 || only.includes(name)),
  async ({ name, og, url }) => {
    const shots = views.flatMap((view) => schemes.map((scheme) => ({ ...view, scheme })));

    await inOrder(shots, async ({ width, height, scheme }) => {
      await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: scheme },
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
      await page.setViewport({ deviceScaleFactor: 2, height, width });
      await page.goto(url, { waitUntil: "networkidle0" });
      await page.evaluate(async () => await document.fonts.ready);
      webp(await page.screenshot(), `${name}-${width}-${scheme}`);
    });

    const response = await fetch(new URL(og, url));
    webp(await response.bytes(), `${name}-og`);
  },
);

reportMisses();

await browser.close();
