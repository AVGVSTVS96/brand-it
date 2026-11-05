import { hall } from "./hall.ts";
import { music } from "./music.ts";
import { seeded } from "./random.ts";
import { END, cues, seek } from "./video.ts";
import type { Cue, CueOptions } from "./video.ts";

interface CueEngine {
  play: (name: string, options: CueOptions) => void;
}

const RATE = 48_000;
const WIDTH = 0.4;
const CUE_LIFT_TO_MUSIC_PEAKS = 5;

const pan = (el: Element, t: number) => {
  seek(t);
  const { left, width } = el.getBoundingClientRect();

  return Math.max(-1, Math.min(1, (left + width / 2) / 960 - 1)) * WIDTH;
};

const isEngine = (module: unknown): module is CueEngine =>
  typeof module === "object" &&
  module !== null &&
  "play" in module &&
  typeof module.play === "function";

const freshEngine = async (cue: number) => {
  const engine: unknown = await import(
    `../../node_modules/cuelume/dist/audio/engine.js?cue=${cue}`
  );

  if (!isEngine(engine)) {
    throw new Error("cuelume's engine has no play()");
  }

  return engine;
};

const renderCue = async ({ name, options }: Cue, i: number) => {
  const ctx = new OfflineAudioContext(2, 3 * RATE, RATE);
  Object.defineProperty(ctx, "state", { get: () => "running" });

  const SharedContext = function SharedContext() {
    return ctx;
  };

  Object.defineProperty(window, "AudioContext", { value: SharedContext });
  Math.random = seeded(i + 1);
  const { play } = await freshEngine(i);
  play(name, options);

  return await ctx.startRendering();
};

const renderCues = async () => {
  const list = cues.map((cue) => ({
    ...cue,
    from: pan(cue.el, cue.t),
    to: pan(cue.el, cue.t + 0.6),
  }));

  const ctx = new OfflineAudioContext(2, Math.ceil(END * RATE), RATE);
  const bus = new GainNode(ctx, { gain: CUE_LIFT_TO_MUSIC_PEAKS });
  bus.connect(ctx.destination);
  const clear = new BiquadFilterNode(ctx, { Q: 0.6, frequency: 250, type: "highpass" });
  clear.connect(bus);

  const room = new ConvolverNode(ctx, {
    buffer: hall(ctx, 1.6, 0.025, seeded(7)),
    disableNormalization: true,
  });

  clear
    .connect(new GainNode(ctx, { gain: 0.07 }))
    .connect(room)
    .connect(bus);

  for (const [i, cue] of list.entries()) {
    // oxlint-disable-next-line no-await-in-loop -- each cue swaps the global AudioContext and Math.random, so cues render one at a time
    const source = new AudioBufferSourceNode(ctx, { buffer: await renderCue(cue, i) });
    const panner = new StereoPannerNode(ctx);
    panner.pan.setValueAtTime(cue.from, cue.t);
    panner.pan.linearRampToValueAtTime(cue.to, cue.t + 0.6);
    source.connect(panner).connect(clear);
    source.start(cue.t);
  }

  return await ctx.startRendering();
};

const renderMusic = async () => {
  const ctx = new OfflineAudioContext(2, Math.ceil(END * RATE), RATE);
  Math.random = seeded(1);
  music(ctx, END, seeded(2));

  return await ctx.startRendering();
};

const wav = (buffer: AudioBuffer) => {
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const frames = buffer.length;
  const bytes = new DataView(new ArrayBuffer(44 + frames * 8));

  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) {
      bytes.setUint8(offset + i, s.codePointAt(i) ?? 0);
    }
  };

  text(0, "RIFF");
  bytes.setUint32(4, 36 + frames * 8, true);
  text(8, "WAVEfmt ");
  bytes.setUint32(16, 16, true);
  bytes.setUint16(20, 3, true);
  bytes.setUint16(22, 2, true);
  bytes.setUint32(24, RATE, true);
  bytes.setUint32(28, RATE * 8, true);
  bytes.setUint16(32, 8, true);
  bytes.setUint16(34, 32, true);
  text(36, "data");
  bytes.setUint32(40, frames * 8, true);

  for (let i = 0; i < frames; i += 1) {
    bytes.setFloat32(44 + i * 8, left[i] ?? 0, true);
    bytes.setFloat32(44 + i * 8 + 4, right[i] ?? 0, true);
  }

  return new Uint8Array(bytes.buffer).toBase64();
};

window.cueList = () =>
  cues.map(({ t, name, options }) => ({ name, t: Number(t.toFixed(3)), ...options }));

window.soundtrack = async () => {
  const random = Math.random.bind(Math);

  try {
    return { cues: wav(await renderCues()), music: wav(await renderMusic()) };
  } finally {
    Math.random = random;
  }
};
