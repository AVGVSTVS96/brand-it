import { mkdir } from "node:fs/promises";

import { chrome, reportMisses, serve, watch } from "../../skills/brand-it/scripts/lib.ts";

const here = import.meta.dirname;
const target = process.argv[2] ?? `${here}/../../apps/site/dist/index.html`;

const widths = [
  ...new Set([...Array.from({ length: 41 }, (_, i) => 320 + i * 40), 390, 1035, 1366, 1512]),
].toSorted((a, b) => a - b);

await mkdir(`${here}/brand-it/sweep`, { recursive: true });

const { url, close } = serve(target);
const browser = await chrome();
const page = watch(await browser.newPage());

/* oxlint-disable no-await-in-loop -- one page shoots every width in turn */
for (const scheme of ["light", "dark"]) {
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: scheme },
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);

  for (const width of widths) {
    await page.setViewport({ deviceScaleFactor: 1, height: 720, width });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluate(async () => await document.fonts.ready);
    await page.screenshot({
      path: `${here}/brand-it/sweep/${scheme}-${width}.webp`,
      quality: 88,
      type: "webp",
    });
  }
}
/* oxlint-enable no-await-in-loop -- the loop above is the only sequential part */

console.log(`${widths.length} widths, light and dark, in brand-it/sweep/`);

reportMisses();

await browser.close();

close?.();
