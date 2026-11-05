import { chrome, inOrder, reportMisses, watch } from "../../skills/brand-it/scripts/lib.ts";

const sites = [
  { name: "hex", url: "https://hex-sand.vercel.app/" },
  { name: "commonplace", url: "https://commonplace-eight-sable.vercel.app/" },
];

const schemes = ["light", "dark"] as const;
const out = import.meta.dirname;
const browser = await chrome();
const page = watch(await browser.newPage());

const shots = sites.flatMap((site) => schemes.map((scheme) => ({ ...site, scheme })));

await inOrder(shots, async ({ name, url, scheme }) => {
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: scheme },
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.setViewport({ deviceScaleFactor: 2, height: 720, width: 1035 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(async () => await document.fonts.ready);
  const path = `${out}/${name}-1035-${scheme}.png`;
  await page.screenshot({ path });
  console.log(path);
});

reportMisses();

await browser.close();
