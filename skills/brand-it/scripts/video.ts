import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Page } from "puppeteer-core";

import { chrome, inOrder, reportMisses, serve, watch } from "./lib.ts";

declare global {
  interface Window {
    END: number;
    seek: (t: number) => void;
    soundtrack?: () => Promise<Record<string, string>>;
  }
}

const modes = ["stills", "sheet", "audio", "video"] as const;

type Mode = (typeof modes)[number];

const isMode = (value: string | undefined): value is Mode => modes.some((mode) => mode === value);

const args = process.argv.slice(2);

const option = (name: string) => {
  const i = args.indexOf(`--${name}`);

  return i === -1 ? undefined : args.splice(i, 2)[1];
};

const [width = 1920, height = 1080] = (option("size") ?? "1920x1080").split("x").map(Number);
const outOption = option("out");
const [target, mode, ...rest] = args;

if (target === undefined || !isMode(mode)) {
  console.error(`usage: bun video.ts <page|url> <mode> [--size 1920x1080] [--out dir]
  stills <t…>    PNGs of single moments
  sheet [every]  one contact sheet, a frame every N seconds (default 2)
  audio          soundtrack.wav from window.soundtrack(), mastered to -14 LUFS, true peak under -2 dBTP
  video [fps]    the mp4 (default 60 fps), rendered in 5 s parts that resume; adds soundtrack.wav if it exists
the page sets window.END (seconds) and window.seek(t); window.soundtrack() returns { stem: base64 wav }`);
  process.exit(1);
}

const local = !/^https?:\/\//u.test(target);

const localDir = (file: string) =>
  statSync(file).isDirectory() ? path.resolve(file) : path.dirname(path.resolve(file));

const pageDir = local ? localDir(target) : process.cwd();
const out = path.resolve(outOption ?? path.join(pageDir, "out"));
const size = width === 1920 && height === 1080 ? "" : `-${width}x${height}`;
const name = `${path.basename(pageDir)}${size}`;

await mkdir(out, { recursive: true });

const { url, files, close } = serve(target);
const browser = await chrome();

const open = async (previous?: Page) => {
  await previous?.close().catch(() => null);
  const fresh = watch(await browser.newPage());
  await fresh.setViewport({ height, width });
  await fresh.goto(url, { waitUntil: "networkidle0" });
  await fresh.evaluate(async () => await document.fonts.ready);

  return fresh;
};

let page = await open();
const end = await page.evaluate(() => window.END);

const shot = async (t: number) => {
  await page.evaluate((at) => {
    window.seek(at);
  }, t);

  return await page.screenshot({ clip: { height, width, x: 0, y: 0 }, type: "png" });
};

const ffmpeg = (argv: string[]) => {
  const child = spawn("ffmpeg", ["-y", "-hide_banner", ...argv], {
    stdio: ["pipe", "inherit", "pipe"],
  });

  const chunks: string[] = [];
  const { promise, resolve, reject } = Promise.withResolvers<string>();

  child.stderr.on("data", (chunk: Buffer) => {
    chunks.push(chunk.toString());
  });
  child.on("close", (code) => {
    const log = chunks.join("");

    if (code === 0) {
      resolve(log);
    } else {
      reject(new Error(log));
    }
  });

  return { done: promise, stdin: child.stdin };
};

const pipeFrames = async (times: number[], argv: string[]) => {
  const { stdin, done } = ffmpeg([
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-c:v",
    "png",
    ...argv,
  ]);

  await inOrder(times, async (t) => {
    if (!stdin.write(await shot(t))) {
      const { promise, resolve } = Promise.withResolvers<null>();
      stdin.once("drain", () => {
        resolve(null);
      });
      await promise;
    }
  });
  stdin.end();

  return await done;
};

const measure = async (inputs: string[], filter: string) => {
  const log = await ffmpeg([
    ...inputs,
    "-filter_complex",
    `${filter},ebur128=peak=true`,
    "-f",
    "null",
    "-",
  ]).done;

  const summary = log.slice(log.lastIndexOf("Summary"));

  return {
    lufs: Number(/I:\s+(?<value>-?[\d.]+)/u.exec(summary)?.groups?.value),
    peak: Number(/Peak:\s+(?<value>-?[\d.]+)/u.exec(summary)?.groups?.value),
  };
};

const stills = async () => {
  await inOrder(rest.map(Number), async (t) => {
    const file = path.join(out, `${name}-${t.toFixed(2)}.png`);
    await writeFile(file, await shot(t));
    console.log(file);
  });
};

const sheet = async () => {
  const every = Number(rest[0] ?? 2);
  const times = Array.from({ length: Math.ceil(end / every) }, (_, i) => i * every);
  const file = path.join(out, `${name}-sheet.png`);

  await pipeFrames(times, [
    "-i",
    "-",
    "-vf",
    `scale=480:-1,tile=4x${Math.ceil(times.length / 4)}:padding=4`,
    "-frames:v",
    "1",
    file,
  ]);
  console.log(file);
};

const audio = async () => {
  await page.mouse.click(1, 1);
  const stems = await page.evaluate(async () => await window.soundtrack?.());

  if (stems === undefined) {
    console.error("this page has no window.soundtrack()");

    return;
  }

  const inputs = Object.keys(stems).flatMap((stem) => ["-i", path.join(out, `${stem}.wav`)]);

  await Promise.all(
    Object.entries(stems).map(async ([stem, data]) => {
      await writeFile(path.join(out, `${stem}.wav`), Buffer.from(data, "base64"));
    }),
  );

  const mix = inputs.length > 2 ? `amix=inputs=${inputs.length / 2}:normalize=0` : "anull";

  const master = (gain: number) =>
    `${mix},volume=${gain}dB,aresample=192000,alimiter=limit=0.794:attack=5:release=50:level=0:latency=1,aresample=48000`;

  const mixed = await measure(inputs, mix);
  const raw = -14 - mixed.lufs;
  const mastered = await measure(inputs, master(raw));
  const gain = raw + (-14 - mastered.lufs);
  const file = path.join(out, "soundtrack.wav");

  await ffmpeg([
    "-loglevel",
    "error",
    ...inputs,
    "-filter_complex",
    master(gain),
    "-c:a",
    "pcm_f32le",
    file,
  ]).done;
  const { lufs, peak } = await measure(["-i", file], "anull");
  console.log(`${file}: ${lufs} LUFS, true peak ${peak} dBTP`);
};

const contentHash = () => {
  const hash = createHash("sha256");

  for (const [file, body] of [...files].toSorted(([a], [b]) => a.localeCompare(b))) {
    hash.update(file).update(body);
  }

  return hash.digest("hex").slice(0, 12);
};

const video = async () => {
  const fps = Number(rest[0] ?? 60);
  const hash = local ? contentHash() : Date.now().toString(36);
  const parts = path.join(out, `parts-${name}-${fps}-${hash}`);

  const existing = await readdir(out);

  const stale = existing.filter(
    (dir) => dir.startsWith(`parts-${name}-`) && path.join(out, dir) !== parts,
  );

  await Promise.all(
    stale.map(async (dir) => {
      await rm(path.join(out, dir), { recursive: true });
    }),
  );
  await mkdir(parts, { recursive: true });

  const frames = Math.round(end * fps);
  const batch = 5 * fps;
  const starts = Array.from({ length: Math.ceil(frames / batch) }, (_, k) => k * batch);
  const partName = (from: number) => `${String(from / batch).padStart(3, "0")}.mp4`;

  await inOrder(starts, async (from) => {
    const part = partName(from);

    if (existsSync(path.join(parts, part))) {
      return;
    }

    page = await open(page);

    const times = Array.from(
      { length: Math.min(batch, frames - from) },
      (_, i) => (from + i) / fps,
    );

    await pipeFrames(times, [
      "-framerate",
      String(fps),
      "-i",
      "-",
      "-vf",
      "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "14",
      "-profile:v",
      "high",
      "-threads",
      "4",
      path.join(parts, `tmp-${part}`),
    ]);
    await rename(path.join(parts, `tmp-${part}`), path.join(parts, part));
    process.stdout.write(`\r${Math.min((from + batch) / fps, end)}s / ${end}s`);
  });

  await writeFile(
    path.join(parts, "list.txt"),
    starts.map((from) => `file '${partName(from)}'`).join("\n"),
  );

  const sound = path.join(out, "soundtrack.wav");
  const file = path.join(out, `${name}.mp4`);
  const withSound = existsSync(sound);

  await ffmpeg([
    "-loglevel",
    "error",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    path.join(parts, "list.txt"),
    ...(withSound ? ["-i", sound] : ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]),
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "320k",
    "-ar",
    "48000",
    "-shortest",
    "-movflags",
    "+faststart",
    file,
  ]).done;

  const heard = withSound ? await measure(["-i", file], "anull") : null;

  const loudness = heard
    ? `: ${heard.lufs} LUFS, true peak ${heard.peak} dBTP after AAC`
    : ", silent";

  console.log(`\n${file}${loudness}`);
};

const run = { audio, sheet, stills, video } satisfies Record<Mode, () => Promise<void>>;

await run[mode]();

reportMisses();

await browser.close();

close?.();
