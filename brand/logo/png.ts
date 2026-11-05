import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const out = import.meta.dirname;
const shoot = `${out}/../../skills/brand-it/scripts/shoot.ts`;

interface Job {
  name: string;
  width: number;
  clear?: boolean;
  as?: string;
}

const jobs: Job[] = [
  { clear: true, name: "brand-it", width: 2000 },
  { clear: true, name: "brand-it-dark", width: 2000 },
  { clear: true, name: "brand-it-lockup", width: 2000 },
  { clear: true, name: "brand-it-lockup-dark", width: 2000 },
  { name: "mark", width: 512 },
  { name: "mark-dark", width: 512 },
  { name: "icon", width: 512 },
  { name: "icon-dark", width: 512 },
  { as: "apple-touch-icon", name: "icon", width: 180 },
  { as: "favicon", name: "icon", width: 32 },
  { as: "favicon", name: "icon", width: 16 },
];

const viewBox = (name: string) => {
  const match = /viewBox="0 0 (?<w>[\d.]+) (?<h>[\d.]+)"/u.exec(
    readFileSync(`${out}/${name}.svg`, "utf-8"),
  )?.groups;

  if (match?.w === undefined || match.h === undefined) {
    throw new Error(`${name}.svg has no viewBox`);
  }

  return { h: Number(match.h), w: Number(match.w) };
};

mkdirSync(`${out}/png`, { recursive: true });

for (const { name, width, clear = false, as = name } of jobs) {
  const { w, h } = viewBox(name);
  const height = Math.round((width * h) / w);
  const file = `${out}/png/${as}${width === 2000 ? "@2x" : `-${width}`}.png`;

  execFileSync(
    "bun",
    [shoot, `${out}/${name}.svg`, `${width}x${height}`, file, ...(clear ? ["--clear"] : [])],
    {
      env: { ...process.env, TMPDIR: process.env.TMPDIR ?? `${out}/../../.scratch` },
      stdio: "inherit",
    },
  );
}
