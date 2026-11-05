import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { fights, findProblems, lightImages, showEverything, tile } from "./checks.ts";
import { chrome, inOrder, reportMisses, serve, watch } from "./lib.ts";

const [target, first, second] = process.argv.slice(2);
const size = /^(?<width>\d+)x(?<height>\d+)(?:@(?<scale>\d+))?$/u.exec(first ?? "")?.groups;

if (target === undefined || (size && second === undefined)) {
  console.error(`usage:
  bun shoot.ts <page|url> [out-dir]                          every width from 320 to 1920 in light and dark: problems, shots, 1:1 tiles
  bun shoot.ts <page|url> <W>x<H>[@scale] <out.png> [--clear]  one exact render: og image, icon, banner`);
  process.exit(1);
}

const { url, close } = serve(target);
const browser = await chrome();
const page = watch(await browser.newPage());

const load = async () => {
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(async () => await document.fonts.ready);
};

const exact = async (width: number, height: number, scale: number, file: string) => {
  await page.setViewport({ deviceScaleFactor: scale, height, width });
  await load();
  await page.screenshot({ omitBackground: process.argv.includes("--clear"), path: file });
  console.log(file);
};

const sweep = async (out: string) => {
  await mkdir(path.join(out, "tiles"), { recursive: true });
  const decoder = await browser.newPage();
  await page.bringToFront();

  const widths = [
    ...new Set([...Array.from({ length: 41 }, (_, i) => 320 + i * 40), 390, 1035, 1366, 1512]),
  ].toSorted((a, b) => a - b);

  const shots = new Map([
    [390, 2],
    [1035, 1],
    [1440, 1],
  ]);

  const problems = new Map<string, { problem: string; where: string[] }>();

  const note = (problem: string, where: string, key = problem) => {
    const seen = problems.get(key) ?? { problem, where: [] };
    problems.set(key, seen);
    seen.where.push(where);
  };

  const shoot = async (scheme: string, width: number, scale: number) => {
    await page.evaluate(showEverything);
    await page.waitForNetworkIdle({ concurrency: 2 });

    if (scheme === "dark") {
      for (const problem of await page.evaluate(lightImages)) {
        note(problem, `dark ${width}`);
      }
    }

    const full = await page.screenshot({
      fullPage: true,
      path: path.join(out, `${width}-${scheme}.png`),
    });

    const tiles = await decoder.evaluate(tile, Buffer.from(full).toString("base64"), 900 * scale);

    await Promise.all(
      tiles.map(async ({ y, png, areas }) => {
        const top = y / scale;

        for (const [key, problem] of fights(areas)) {
          note(problem, `${scheme} ${width} y ${top}–${top + 900}`, key);
        }

        if (png !== null) {
          const name = `${width}-${scheme}-${String(top / 900 + 1).padStart(2, "0")}.png`;
          await writeFile(path.join(out, "tiles", name), Buffer.from(png, "base64"));
        }
      }),
    );
  };

  const check = async (scheme: string, width: number) => {
    const scale = shots.get(width);
    await page.setViewport({ deviceScaleFactor: scale ?? 1, height: 900, width });
    await load();

    for (const problem of await page.evaluate(findProblems)) {
      note(problem, `${scheme} ${width}`);
    }

    if (scale !== undefined) {
      await shoot(scheme, width, scale);
    }
  };

  await inOrder(["light", "dark"], async (scheme) => {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: scheme },
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await inOrder(widths, async (width) => {
      await check(scheme, width);
    });
  });

  for (const { problem, where } of problems.values()) {
    console.log(`${problem}\n  at ${where.join(", ")}`);
  }

  const count =
    problems.size > 0
      ? `\n${problems.size} problem${problems.size === 1 ? "" : "s"}`
      : "no problems";

  console.log(
    count,
    `· shots in ${out}/ at 390@2x, 1035, 1440, cut into screen-high tiles in ${out}/tiles/`,
  );
};

await (size
  ? exact(Number(size.width), Number(size.height), Number(size.scale ?? 1), second ?? "")
  : sweep(first ?? "shots"));

reportMisses();

await browser.close();

close?.();
