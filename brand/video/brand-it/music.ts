import { hall } from "./hall.ts";

interface Chord {
  bass: number;
  voicing: number[];
}

interface Burst {
  attack?: number;
  buffer?: AudioBuffer;
  decay: number;
  frequency: number;
  into?: AudioNode;
  level: number;
  pan?: number;
  Q?: number;
  type?: BiquadFilterType;
}

interface Tonal {
  attack?: number;
  decay: number;
  frequency: number;
  glide?: number;
  into: AudioNode;
  level: number;
  to?: number;
  type?: OscillatorType;
}

type Section = "a" | "strip" | "top" | "turn";

const BEAT = 0.5;
const BAR = BEAT * 4;
const STEP = BEAT / 4;

const SEMITONES = new Map([
  ["A", 9],
  ["B", 11],
  ["C", 0],
  ["D", 2],
  ["E", 4],
  ["F", 5],
  ["G", 7],
]);

const midi = (note: string) => {
  const groups = /(?<letter>[A-G])(?<sharp>#?)(?<octave>\d)/u.exec(note)?.groups;

  if (groups === undefined) {
    throw new Error(`not a note: ${note}`);
  }

  return (
    12 * (Number(groups.octave) + 1) +
    (SEMITONES.get(groups.letter ?? "") ?? 0) +
    (groups.sharp === "#" ? 1 : 0)
  );
};

const hz = (note: number) => 440 * 2 ** ((note - 69) / 12);

const chord = (bass: string, voicing: string): Chord => ({
  bass: midi(bass),
  voicing: voicing.split(" ").map(midi),
});

const pick = <T>(list: readonly T[], index: number): T => {
  const item = list[index % list.length];

  if (item === undefined) {
    throw new Error(`nothing at ${index}`);
  }

  return item;
};

const C69 = chord("C2", "C4 E4 G4 A4 D5");
const AM9 = chord("A1", "A3 C4 E4 G4 B4");
const FMAJ9 = chord("F1", "F3 A3 C4 E4 G4");
const G6 = chord("G1", "G3 B3 D4 E4 A4");
const DM9 = chord("D2", "D4 F4 A4 C5 E5");
const EM7 = chord("E2", "E4 G4 B4 D5");
const A = [C69, AM9, FMAJ9, G6];
const B = [DM9, EM7, FMAJ9, G6];

const MOTIF = ["G5", "E5", "D5", "E5", "G5", "A5"].map(midi);

const HOOK = [
  MOTIF,
  ["E5", "D5", "C5", "D5", "E5", "G5"].map(midi),
  ["A5", "G5", "E5", "G5", "A5", "C6"].map(midi),
  ["G5", "E5", "D5", "C5"].map(midi),
];

const C6 = midi("C6");
const HOOK_STEPS = [0, 3, 6, 8, 11, 14];

const BASS_STEPS = [
  [0, 0, 1],
  [3, 12, 0.5],
  [6, 0, 0.9],
  [8, 0, 0.7],
  [11, 12, 0.5],
  [14, 0, 0.9],
] as const;

const ARP = [0, 2, 4, 2, 1, 3, 4, 3];

const ACCENTS = [
  0.42, 0.12, 0.26, 0.12, 0.32, 0.12, 0.26, 0.12, 0.38, 0.12, 0.26, 0.12, 0.32, 0.12, 0.26, 0.18,
];

const MALLET = [
  [1, 1],
  [3.99, 0.2],
] as const;

const at = (bar: number, step: number) => bar * BAR + step * STEP;
const accent = (step: number) => ACCENTS[step] ?? 0;
const hookStep = (i: number) => HOOK_STEPS[i] ?? 0;

const noise = (ctx: BaseAudioContext, seconds: number, random: () => number) => {
  const buffer = ctx.createBuffer(2, seconds * ctx.sampleRate, ctx.sampleRate);

  for (const channel of [0, 1]) {
    const data = buffer.getChannelData(channel);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = random() * 2 - 1;
    }
  }

  return buffer;
};

const metal = (ctx: BaseAudioContext, seconds: number, random: () => number) => {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, seconds * rate, rate);
  const data = buffer.getChannelData(0);

  for (const f of [205.3, 304.4, 369.6, 522.7, 540, 800].map((base) => base * 1.7)) {
    const phase = random() * 2 * Math.PI;

    for (let k = 1; k * f < 18_000; k += 2) {
      const w = (2 * Math.PI * k * f) / rate;

      for (let i = 0; i < data.length; i += 1) {
        data[i] = (data[i] ?? 0) + Math.sin(w * i + k * phase) / k / 6;
      }
    }
  }

  return buffer;
};

const saturate = (amount: number) => {
  const curve = new Float32Array(2048);

  for (let i = 0; i < curve.length; i += 1) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
  }

  return curve;
};

const envelope = (param: AudioParam, t: number, peak: number, attack: number, decay: number) => {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(peak, t + attack);
  param.setTargetAtTime(0, t + attack, decay / 4.6);
};

const sectionAt = (t: number, { strip, top, turn }: Record<"strip" | "top" | "turn", number>) => {
  if (t >= top) {
    return "top";
  }

  if (t >= strip) {
    return "strip";
  }

  return t >= turn ? "turn" : "a";
};

const studio = (ctx: BaseAudioContext, END: number, random: () => number) => {
  const NOISE = noise(ctx, 2, random);
  const METAL = metal(ctx, 2, random);

  const node = <T extends AudioNode, O>(
    Type: new (context: BaseAudioContext, options?: O) => T,
    options: O,
    ...into: AudioNode[]
  ) => {
    const n = new Type(ctx, options);

    for (const target of into) {
      n.connect(target);
    }

    return n;
  };

  const drive = (amount: number) =>
    // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names -- WaveShaperNode is the Web Audio API's own name
    node(WaveShaperNode, { curve: saturate(amount), oversample: "4x" });

  const send = (from: AudioNode, amount: number, bus: AudioNode) =>
    from.connect(node(GainNode, { gain: amount }, bus));

  const out = node(GainNode, { gain: 1 }, ctx.destination);
  out.gain.setValueAtTime(1, END - 0.05);
  out.gain.linearRampToValueAtTime(0, END);
  const tone = node(BiquadFilterNode, { Q: 0.7, frequency: 32, type: "highpass" }, out);
  const master = node(GainNode, { gain: 0.42 }, tone);

  const dip = (t: number) => {
    master.gain.setValueAtTime(0.42, t - 0.004);
    master.gain.linearRampToValueAtTime(0.26, t);
    master.gain.setTargetAtTime(0.42, t + 0.08, 0.12);
  };

  const stopdown = (from: number, to: number) => {
    master.gain.setValueAtTime(0.42, from - 0.004);
    master.gain.linearRampToValueAtTime(0, from);
    master.gain.setValueAtTime(0, to);
    master.gain.linearRampToValueAtTime(0.42, to + 0.002);
  };

  const drums = node(GainNode, { gain: 1 }, master);
  const pump = node(GainNode, { gain: 1 }, master);

  const duck = (t: number) => {
    pump.gain.setValueAtTime(0.7, t);
    pump.gain.setTargetAtTime(1, t + 0.01, 0.05);
  };

  const verb = node(BiquadFilterNode, { frequency: 300, type: "highpass" });
  verb
    .connect(
      node(ConvolverNode, { buffer: hall(ctx, 1.6, 0.025, random), disableNormalization: true }),
    )
    .connect(node(BiquadFilterNode, { frequency: 8000, type: "lowpass" }, pump));

  const echo = node(GainNode, { gain: 1 });
  const left = node(DelayNode, { delayTime: BEAT * 0.75, maxDelayTime: 1 });
  const right = node(DelayNode, { delayTime: BEAT * 0.75, maxDelayTime: 1 });
  echo.connect(node(BiquadFilterNode, { Q: 0.5, frequency: 1800, type: "bandpass" })).connect(left);
  left.connect(node(GainNode, { gain: 0.34 }, right));
  right.connect(node(GainNode, { gain: 0.34 }, left));
  left.connect(node(StereoPannerNode, { pan: -0.7 }, pump));
  right.connect(node(StereoPannerNode, { pan: 0.7 }, pump));

  const burst = (
    t: number,
    {
      level,
      decay,
      type = "bandpass",
      frequency,
      Q = 0.8,
      attack = 0.0008,
      into = drums,
      pan = 0,
      buffer = NOISE,
    }: Burst,
  ) => {
    const source = node(AudioBufferSourceNode, { buffer, loop: true });
    const amp = node(GainNode, { gain: 0 });
    source
      .connect(node(BiquadFilterNode, { Q, frequency, type }))
      .connect(amp)
      .connect(node(StereoPannerNode, { pan }, into));
    envelope(amp.gain, t, level, attack, decay);
    source.start(t, random() * 1.5);
    source.stop(t + attack + decay + 0.05);

    return amp;
  };

  const tonal = (
    t: number,
    { frequency, to, glide = 0.015, level, attack = 0.002, decay, type = "sine", into }: Tonal,
  ) => {
    const osc = node(OscillatorNode, { frequency, type });
    osc.frequency.setValueAtTime(frequency, t);

    if (to !== undefined) {
      osc.frequency.setTargetAtTime(to, t, glide);
    }

    const amp = node(GainNode, { gain: 0 }, into);
    osc.connect(amp);
    envelope(amp.gain, t, level, attack, decay);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);

    return amp;
  };

  const kick = (t: number, level = 1, muffle = 0) => {
    const into =
      muffle > 0
        ? node(BiquadFilterNode, { Q: 0.7, frequency: muffle, type: "lowpass" }, drums)
        : drums;

    const body = node(GainNode, { gain: 0.5 });
    body.connect(drive(1.3)).connect(into);
    tonal(t, { attack: 0.001, decay: 0.2, frequency: 62 * 4.5, into: body, level, to: 62 });
    burst(t, {
      Q: 0.7,
      decay: 0.006,
      frequency: 2000,
      into,
      level: 0.22 * level,
      type: "highpass",
    });
    duck(t);
  };

  const clap = (t: number, level = 1) => {
    for (const [frequency, pan, offset] of [
      [1100, -0.15, 0],
      [1250, 0.15, 0.004],
    ] as const) {
      for (const d of [0, 0.011, 0.022]) {
        burst(t + offset + d + (random() - 0.5) * 0.002, {
          Q: 2,
          decay: 0.0115,
          frequency,
          level: 0.36 * level,
          pan,
        });
      }

      send(
        burst(t + offset + 0.033, { Q: 1.4, decay: 0.18, frequency, level: 0.3 * level, pan }),
        0.3,
        verb,
      );
    }

    burst(t, { Q: 0.7, decay: 0.03, frequency: 3200, level: 0.14 * level, type: "highpass" });
  };

  let ringing: GainNode | null = null;

  const hat = (t: number, level: number, open = false) => {
    ringing?.gain.setTargetAtTime(0, t, 0.006);
    const source = node(AudioBufferSourceNode, { buffer: METAL, loop: true });
    const amp = node(GainNode, { gain: 0 });
    source
      .connect(node(BiquadFilterNode, { Q: 0.5, frequency: 9000, type: "bandpass" }))
      .connect(node(BiquadFilterNode, { frequency: 6000, type: "highpass" }))
      .connect(amp)
      .connect(node(StereoPannerNode, { pan: 0.15 }, drums));
    const decay = open ? 0.3 : 0.04;
    envelope(amp.gain, t, 1.4 * level * (0.85 + 0.3 * random()), 0.0006, decay);
    source.start(t, random() * 1.5);
    source.stop(t + decay + 0.05);
    ringing = open ? amp : null;
  };

  const shaker = (t: number, level: number) =>
    burst(t, { Q: 1.4, attack: 0.009, decay: 0.05, frequency: 6200, level, pan: -0.35 });

  const rim = (t: number, level: number, pan: number) => {
    burst(t, { Q: 1.5, decay: 0.012, frequency: 2400, level: level * 0.6, pan });
    tonal(t, {
      decay: 0.03,
      frequency: 1720,
      into: node(StereoPannerNode, { pan }, drums),
      level: level * 0.35,
    });
  };

  const crash = (t: number, level = 1) => {
    const source = node(AudioBufferSourceNode, { buffer: METAL, loop: true });
    const amp = node(GainNode, { gain: 0 });
    source
      .connect(node(BiquadFilterNode, { Q: 0.5, frequency: 5000, type: "highpass" }))
      .connect(amp)
      .connect(master);
    envelope(amp.gain, t, 0.26 * level, 0.001, 2);
    source.start(t);
    source.stop(t + 2.1);
    burst(t, {
      Q: 0.5,
      decay: 1.6,
      frequency: 6500,
      into: master,
      level: 0.12 * level,
      type: "highpass",
    });
    send(amp, 0.25, verb);
  };

  const riser = (from: number, to: number, level: number, into: AudioNode = master) => {
    const source = node(AudioBufferSourceNode, { buffer: NOISE, loop: true });
    const filter = node(BiquadFilterNode, { Q: 2.2, type: "bandpass" });
    filter.frequency.setValueAtTime(800, from);
    filter.frequency.exponentialRampToValueAtTime(10_000, to);
    const amp = node(GainNode, { gain: 0 });
    amp.gain.setValueAtTime(0, from);
    amp.gain.linearRampToValueAtTime(level, to - 0.004);
    amp.gain.linearRampToValueAtTime(0, to);
    source.connect(filter).connect(amp).connect(into);
    send(amp, 0.4, verb);
    source.start(from);
    source.stop(to + 0.01);
  };

  const bass = (t: number, note: number, length: number, level = 1) => {
    const f = hz(note);
    const filter = node(BiquadFilterNode, { Q: 3, type: "lowpass" });
    filter.frequency.setValueAtTime(Math.min(f * 14, 1500), t);
    filter.frequency.setTargetAtTime(f * 2.5, t + 0.005, 0.05);
    const amp = node(GainNode, { gain: 0 });
    filter.connect(drive(1.4)).connect(amp).connect(master);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(0.15 * level, t + 0.004);
    amp.gain.setValueAtTime(0.15 * level, t + length);
    amp.gain.setTargetAtTime(0, t + length, 0.015);

    for (const [type, gain] of [
      ["sine", 0.9],
      ["sawtooth", 0.4],
    ] as const) {
      const osc = node(OscillatorNode, { frequency: f, type });
      osc.connect(node(GainNode, { gain }, filter));
      osc.start(t);
      osc.stop(t + length + 0.1);
    }
  };

  const pad = (
    t: number,
    length: number,
    notes: number[],
    level: number,
    [from, to]: readonly [number, number],
    { attack = 0.5, release = 1.2 } = {},
  ) => {
    const filter = node(BiquadFilterNode, { Q: 0.5, type: "lowpass" });
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + length);
    const amp = node(GainNode, { gain: 0 });
    filter
      .connect(node(BiquadFilterNode, { frequency: 240, type: "highpass" }))
      .connect(amp)
      .connect(pump);
    send(amp, 0.45, verb);
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(level, t + attack);
    amp.gain.setValueAtTime(level, t + length);
    amp.gain.setTargetAtTime(0, t + length, release / 4.6);

    for (const note of notes) {
      for (const spread of [-1, 0, 1]) {
        const f = hz(note);
        const osc = node(OscillatorNode, { detune: spread * 9, frequency: f, type: "sawtooth" });
        osc.connect(node(StereoPannerNode, { pan: spread * 0.6 }, filter));
        osc.start(Math.max(0, t - random() / f));
        osc.stop(t + length + release + 0.1);
      }
    }
  };

  const stab = (t: number, notes: number[], level: number) => {
    const filter = node(BiquadFilterNode, { Q: 1.1, type: "lowpass" });
    filter.frequency.setValueAtTime(5200, t);
    filter.frequency.setTargetAtTime(700, t + 0.01, 0.05);
    const amp = node(GainNode, { gain: 0 });
    filter
      .connect(node(BiquadFilterNode, { frequency: 220, type: "highpass" }))
      .connect(amp)
      .connect(pump);
    send(amp, 0.3, verb);
    send(amp, 0.18, echo);
    envelope(amp.gain, t, level, 0.003, 0.26);

    for (const note of notes) {
      for (const spread of [-1, 1]) {
        const f = hz(note);
        const osc = node(OscillatorNode, { detune: spread * 6, frequency: f, type: "sawtooth" });
        osc.connect(node(StereoPannerNode, { pan: spread * 0.45 }, filter));
        osc.start(Math.max(0, t - random() / f));
        osc.stop(t + 0.4);
      }
    }
  };

  const hook = (t: number, note: number, level = 1) => {
    const f = hz(note);
    const carrier = node(OscillatorNode, { frequency: f });
    const modulator = node(OscillatorNode, { frequency: f * 2 });
    const depth = node(GainNode, { gain: 0 });
    depth.gain.setValueAtTime(f * 2.5, t);
    depth.gain.setTargetAtTime(0, t, 0.07);
    modulator.connect(depth).connect(carrier.frequency);
    const amp = node(GainNode, { gain: 0 });
    carrier.connect(amp).connect(master);
    envelope(amp.gain, t, 0.13 * level, 0.002, 0.55);
    send(amp, 0.3, echo);
    send(amp, 0.25, verb);

    for (const osc of [carrier, modulator]) {
      osc.start(t);
      osc.stop(t + 0.7);
    }
  };

  const mallet = (t: number, note: number, level = 1, decay = 2, into: AudioNode = master) => {
    const f = hz(note);
    const amp = node(GainNode, { gain: 1 }, into);
    send(amp, 0.35, verb);
    send(amp, 0.15, echo);

    for (const [ratio, gain] of MALLET) {
      tonal(t, {
        attack: 0.003,
        decay: decay / ratio,
        frequency: f * ratio,
        into: amp,
        level: 0.16 * level * gain,
      });
    }

    burst(t, {
      Q: 0.7,
      decay: 0.004,
      frequency: 1600,
      into: amp,
      level: 0.05 * level,
      type: "lowpass",
    });
  };

  const arp = (t: number, note: number, level: number, pan: number) => {
    const filter = node(BiquadFilterNode, { Q: 2, frequency: 2100, type: "lowpass" });
    filter.connect(node(StereoPannerNode, { pan }, pump));
    send(
      tonal(t, { decay: 0.09, frequency: hz(note), into: filter, level, type: "square" }),
      0.2,
      echo,
    );
  };

  const fill = (bar: number, level: number) => {
    for (const step of [13, 14, 15]) {
      burst(at(bar, step), {
        Q: 1.2,
        decay: 0.06,
        frequency: 1500,
        level: level + 0.08 * (step - 13),
      });
    }
  };

  return {
    arp,
    bass,
    clap,
    crash,
    dip,
    fill,
    hat,
    hook,
    kick,
    mallet,
    master,
    out,
    pad,
    rim,
    riser,
    shaker,
    stab,
    stopdown,
    tonal,
  };
};

type Studio = ReturnType<typeof studio>;

const CUTS = { button: 38, drop: 10, intro: 0, stop: 8, strip: 26, top: 34, turn: 18 };

const playIntro = (s: Studio) => {
  const { intro, stop } = CUTS;
  s.pad(intro, stop - intro, C69.voicing, 0.018, [700, 1800], { attack: 1, release: 0.3 });

  for (let bar = 0; bar < stop / BAR; bar += 1) {
    const chordNow = pick(A, bar);

    for (let step = 0; step < 16; step += 1) {
      s.hat(at(bar, step), accent(step) * 0.7);

      if (step % 2 === 1) {
        s.shaker(at(bar, step), 0.03);
      }
    }

    for (const beat of [1, 3]) {
      s.rim(at(bar, beat * 4), 0.18, beat === 1 ? -0.4 : 0.4);
    }

    for (const [i, note] of pick(HOOK, bar).entries()) {
      s.hook(at(bar, hookStep(i)), note, 0.9);
    }

    if (bar >= 2) {
      for (const [step, octave, level] of BASS_STEPS) {
        s.bass(at(bar, step), chordNow.bass + 12 + octave, STEP * 0.8, level * 0.8);
      }

      for (const beat of [0, 2]) {
        s.kick(at(bar, beat * 4), 0.7, 900);
      }
    }
  }

  s.fill(stop / BAR - 1, 0.2);
};

const playStopdown = (s: Studio) => {
  const { drop, stop } = CUTS;
  s.stopdown(stop, drop);
  s.tonal(stop, {
    attack: 0.02,
    decay: 1.6,
    frequency: hz(C69.bass + 12),
    into: s.out,
    level: 0.07,
  });
  s.mallet(stop + BEAT, C6, 0.3, 1.4, s.out);
  s.riser(drop - BAR, drop, 0.025, s.out);
};

interface Bar {
  bar: number;
  chord: Chord;
  full: boolean;
  phrase: number;
  section: Section;
  t: number;
  wide: boolean;
}

const barAt = (bar: number): Bar => {
  const t = bar * BAR;
  const phrase = (bar - CUTS.drop / BAR) % 4;
  const section = sectionAt(t, CUTS);

  return {
    bar,
    chord: pick(section === "turn" ? B : A, phrase),
    full: section !== "strip" || phrase >= 2,
    phrase,
    section,
    t,
    wide: section === "top",
  };
};

const playBeat = (s: Studio, { bar, chord: now, full, section, t }: Bar) => {
  if (full) {
    s.pad(t, BAR, now.voicing, section === "turn" ? 0.012 : 0.009, [1600, 2200], {
      attack: 0.06,
      release: 0.3,
    });

    for (const beat of [0, 1, 2, 3]) {
      s.kick(t + beat * BEAT, section === "strip" ? 0.8 : 1);
    }

    for (const beat of [1, 3]) {
      s.clap(t + beat * BEAT, 0.9);
    }
  }

  for (const [step, octave, level] of BASS_STEPS) {
    s.bass(at(bar, step), now.bass + 12 + octave, STEP * 0.8, level);
  }
};

const playTops = (s: Studio, { bar, section, wide }: Bar) => {
  for (let step = 0; step < 16; step += 1) {
    if (wide && step % 4 === 2) {
      s.hat(at(bar, step), 0.3, true);
    } else if (!(wide && step % 4 === 3)) {
      s.hat(at(bar, step), accent(step) * (bar === CUTS.drop / BAR ? 0.7 : 1));
    }

    s.shaker(at(bar, step), (step % 2 === 1 ? 0.05 : 0.03) * (section === "strip" ? 0.6 : 1));
  }

  if (section !== "strip") {
    for (const [step, pan] of [
      [3, -0.4],
      [10, 0.4],
    ] as const) {
      s.rim(at(bar, step), 0.2, pan);
    }
  }
};

const playHooks = (s: Studio, { bar, chord: now, full, phrase, section, wide }: Bar) => {
  if (section === "turn") {
    for (const [step, index] of [...ARP, ...ARP].entries()) {
      s.arp(at(bar, step), pick(now.voicing, index) + 12, 0.05, step % 2 === 1 ? 0.3 : -0.3);
    }
  }

  if (full) {
    for (const [i, note] of pick(HOOK, phrase).entries()) {
      s.hook(at(bar, hookStep(i)), note, wide ? 1.1 : 1);
    }
  }

  if (full && wide) {
    for (const [i, note] of pick(HOOK, phrase).entries()) {
      s.hook(at(bar, hookStep(i)), note + 12, 0.3);
    }
  }
};

const playAccents = (s: Studio, { bar, chord: now, phrase, section, wide }: Bar) => {
  if (section === "turn" || section === "top") {
    for (const step of [6, 14]) {
      s.stab(at(bar, step), now.voicing, wide ? 0.026 : 0.02);
    }
  }

  if (section === "strip" && phrase < 2) {
    for (const [i, note] of MOTIF.entries()) {
      s.mallet(at(bar, hookStep(i)), note, 0.9, 1.2);
    }
  }

  if (phrase === 3) {
    s.fill(bar, 0.22);
  }
};

const playBar = (s: Studio, bar: number) => {
  const now = barAt(bar);
  playBeat(s, now);
  playTops(s, now);
  playHooks(s, now);
  playAccents(s, now);
};

const playButton = (s: Studio) => {
  const { button } = CUTS;
  s.kick(button, 1);
  s.stab(button, C69.voicing, 0.02);
  s.pad(button, 0.1, C69.voicing, 0.013, [3200, 3000], { attack: 0.004, release: 3.2 });
  s.tonal(button, {
    attack: 0.004,
    decay: 2.6,
    frequency: hz(C69.bass + 12),
    into: s.master,
    level: 0.22,
  });

  for (const [i, note] of MOTIF.entries()) {
    s.mallet(button + BEAT + (i * BEAT) / 2, note, 0.9, 2.4);
  }

  s.mallet(button + BEAT * 4, C6, 0.7, 3);
};

export const music = (ctx: BaseAudioContext, END: number, random: () => number) => {
  const s = studio(ctx, END, random);
  const { button, drop, top, turn } = CUTS;

  playIntro(s);
  playStopdown(s);

  for (let bar = drop / BAR; bar < button / BAR; bar += 1) {
    playBar(s, bar);
  }

  for (const t of [drop, turn, top]) {
    s.crash(t, t === drop ? 0.8 : 0.5);
  }

  for (const t of [17.1, 24.6]) {
    s.dip(t);
  }

  s.riser(top - BAR, top, 0.06);
  playButton(s);
};
