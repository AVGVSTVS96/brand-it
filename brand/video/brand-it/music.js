// 120 BPM in C major, the key cuelume's cues are pitched in. Sections sit on the picture's cuts:
// intro under the two sites, a stop-down under Introducing, the drop on the name, something new every four bars,
// a strip-down under the rules, and a button on the return of "brand it" that rings out to the end.
import { hall } from "./sound.js"

const BEAT = 0.5
const BAR = BEAT * 4
const STEP = BEAT / 4

const LETTERS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const midi = note => {
  if (typeof note === "number") return note
  const [, letter, sharp, octave] = note.match(/([A-G])(#?)(\d)/)
  return 12 * (+octave + 1) + LETTERS[letter] + (sharp ? 1 : 0)
}
const hz = note => 440 * 2 ** ((midi(note) - 69) / 12)
const chord = (bass, voicing) => ({ bass: midi(bass), voicing: voicing.split(" ").map(midi) })

const C69 = chord("C2", "C4 E4 G4 A4 D5")
const AM9 = chord("A1", "A3 C4 E4 G4 B4")
const FMAJ9 = chord("F1", "F3 A3 C4 E4 G4")
const G6 = chord("G1", "G3 B3 D4 E4 A4")
const DM9 = chord("D2", "D4 F4 A4 C5 E5")
const EM7 = chord("E2", "E4 G4 B4 D5")
const A = [C69, AM9, FMAJ9, G6]
const B = [DM9, EM7, FMAJ9, G6]

const MOTIF = ["G5", "E5", "D5", "E5", "G5", "A5"]
const HOOK = [MOTIF, ["E5", "D5", "C5", "D5", "E5", "G5"], ["A5", "G5", "E5", "G5", "A5", "C6"], ["G5", "E5", "D5", "C5"]]
const HOOK_STEPS = [0, 3, 6, 8, 11, 14]
const BASS_STEPS = [[0, 0, 1], [3, 12, 0.5], [6, 0, 0.9], [8, 0, 0.7], [11, 12, 0.5], [14, 0, 0.9]]
const ARP = [0, 2, 4, 2, 1, 3, 4, 3]
const ACCENTS = [0.42, 0.12, 0.26, 0.12, 0.32, 0.12, 0.26, 0.12, 0.38, 0.12, 0.26, 0.12, 0.32, 0.12, 0.26, 0.18]
const MALLET = [[1, 1], [3.99, 0.2]]

function noise(ctx, seconds, random) {
  const buffer = ctx.createBuffer(2, seconds * ctx.sampleRate, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) data[i] = random() * 2 - 1
  }
  return buffer
}

function metal(ctx, seconds, random) {
  const rate = ctx.sampleRate
  const buffer = ctx.createBuffer(1, seconds * rate, rate)
  const data = buffer.getChannelData(0)
  for (const f of [205.3, 304.4, 369.6, 522.7, 540, 800].map(f => f * 1.7)) {
    const phase = random() * 2 * Math.PI
    for (let k = 1; k * f < 18000; k += 2) {
      const w = (2 * Math.PI * k * f) / rate
      for (let i = 0; i < data.length; i++) data[i] += Math.sin(w * i + k * phase) / k / 6
    }
  }
  return buffer
}

function saturate(amount) {
  const curve = new Float32Array(2048)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(x * amount) / Math.tanh(amount)
  }
  return curve
}

export default function music(ctx, END, random) {
  const intro = 0
  const stop = 8
  const drop = 10
  const turn = 18
  const strip = 26
  const top = 34
  const button = 38

  const NOISE = noise(ctx, 2, random)
  const METAL = metal(ctx, 2, random)

  const node = (Type, options, ...into) => {
    const n = new Type(ctx, options)
    for (const target of into) n.connect(target)
    return n
  }
  const shaper = amount => node(WaveShaperNode, { curve: saturate(amount), oversample: "4x" })
  const send = (from, amount, bus) => from.connect(node(GainNode, { gain: amount }, bus))

  const out = node(GainNode, { gain: 1 }, ctx.destination)
  out.gain.setValueAtTime(1, END - 0.05)
  out.gain.linearRampToValueAtTime(0, END)
  const tone = node(BiquadFilterNode, { type: "highpass", frequency: 32, Q: 0.7 }, out)
  const master = node(GainNode, { gain: 0.42 }, tone)
  const dip = t => {
    master.gain.setValueAtTime(0.42, t - 0.004)
    master.gain.linearRampToValueAtTime(0.26, t)
    master.gain.setTargetAtTime(0.42, t + 0.08, 0.12)
  }
  const stopdown = (from, to) => {
    master.gain.setValueAtTime(0.42, from - 0.004)
    master.gain.linearRampToValueAtTime(0, from)
    master.gain.setValueAtTime(0, to)
    master.gain.linearRampToValueAtTime(0.42, to + 0.002)
  }

  const drums = node(GainNode, { gain: 1 }, master)
  const pump = node(GainNode, { gain: 1 }, master)
  const duck = t => {
    pump.gain.setValueAtTime(0.7, t)
    pump.gain.setTargetAtTime(1, t + 0.01, 0.05)
  }

  const verb = node(BiquadFilterNode, { type: "highpass", frequency: 300 })
  verb.connect(node(ConvolverNode, { buffer: hall(ctx, 1.6, 0.025, random), disableNormalization: true })).connect(node(BiquadFilterNode, { type: "lowpass", frequency: 8000 }, pump))

  const echo = node(GainNode, { gain: 1 })
  const left = node(DelayNode, { delayTime: BEAT * 0.75, maxDelayTime: 1 })
  const right = node(DelayNode, { delayTime: BEAT * 0.75, maxDelayTime: 1 })
  echo.connect(node(BiquadFilterNode, { type: "bandpass", frequency: 1800, Q: 0.5 })).connect(left)
  left.connect(node(GainNode, { gain: 0.34 }, right))
  right.connect(node(GainNode, { gain: 0.34 }, left))
  left.connect(node(StereoPannerNode, { pan: -0.7 }, pump))
  right.connect(node(StereoPannerNode, { pan: 0.7 }, pump))

  const envelope = (param, t, peak, attack, decay) => {
    param.setValueAtTime(0, t)
    param.linearRampToValueAtTime(peak, t + attack)
    param.setTargetAtTime(0, t + attack, decay / 4.6)
  }

  const burst = (t, { level, decay, type = "bandpass", frequency, Q = 0.8, attack = 0.0008, into = drums, pan = 0, buffer = NOISE }) => {
    const source = node(AudioBufferSourceNode, { buffer, loop: true })
    const amp = node(GainNode, { gain: 0 })
    source.connect(node(BiquadFilterNode, { type, frequency, Q })).connect(amp).connect(node(StereoPannerNode, { pan }, into))
    envelope(amp.gain, t, level, attack, decay)
    source.start(t, random() * 1.5)
    source.stop(t + attack + decay + 0.05)
    return amp
  }

  const tonal = (t, { frequency, to, glide = 0.015, level, attack = 0.002, decay, type = "sine", into }) => {
    const osc = node(OscillatorNode, { type, frequency })
    osc.frequency.setValueAtTime(frequency, t)
    if (to) osc.frequency.setTargetAtTime(to, t, glide)
    const amp = node(GainNode, { gain: 0 }, into)
    osc.connect(amp)
    envelope(amp.gain, t, level, attack, decay)
    osc.start(t)
    osc.stop(t + attack + decay + 0.05)
    return amp
  }

  const kick = (t, level = 1, muffle = 0) => {
    const into = muffle ? node(BiquadFilterNode, { type: "lowpass", frequency: muffle, Q: 0.7 }, drums) : drums
    const body = node(GainNode, { gain: 0.5 })
    body.connect(shaper(1.3)).connect(into)
    tonal(t, { frequency: 62 * 4.5, to: 62, level, attack: 0.001, decay: 0.2, into: body })
    burst(t, { level: 0.22 * level, decay: 0.006, type: "highpass", frequency: 2000, Q: 0.7, into })
    duck(t)
  }

  const clap = (t, level = 1) => {
    for (const [frequency, pan, offset] of [[1100, -0.15, 0], [1250, 0.15, 0.004]]) {
      for (const d of [0, 0.011, 0.022]) burst(t + offset + d + (random() - 0.5) * 0.002, { level: 0.36 * level, decay: 0.0115, frequency, Q: 2, pan })
      send(burst(t + offset + 0.033, { level: 0.3 * level, decay: 0.18, frequency, Q: 1.4, pan }), 0.3, verb)
    }
    burst(t, { level: 0.14 * level, decay: 0.03, type: "highpass", frequency: 3200, Q: 0.7 })
  }

  let ringing = null
  const hat = (t, level, open = false) => {
    if (ringing) ringing.gain.setTargetAtTime(0, t, 0.006)
    const source = node(AudioBufferSourceNode, { buffer: METAL, loop: true })
    const amp = node(GainNode, { gain: 0 })
    source.connect(node(BiquadFilterNode, { type: "bandpass", frequency: 9000, Q: 0.5 })).connect(node(BiquadFilterNode, { type: "highpass", frequency: 6000 })).connect(amp).connect(node(StereoPannerNode, { pan: 0.15 }, drums))
    const decay = open ? 0.3 : 0.04
    envelope(amp.gain, t, 1.4 * level * (0.85 + 0.3 * random()), 0.0006, decay)
    source.start(t, random() * 1.5)
    source.stop(t + decay + 0.05)
    ringing = open ? amp : null
  }

  const shaker = (t, level) => burst(t, { level, decay: 0.05, attack: 0.009, frequency: 6200, Q: 1.4, pan: -0.35 })

  const rim = (t, level, pan) => {
    burst(t, { level: level * 0.6, decay: 0.012, frequency: 2400, Q: 1.5, pan })
    tonal(t, { frequency: 1720, level: level * 0.35, decay: 0.03, into: node(StereoPannerNode, { pan }, drums) })
  }

  const crash = (t, level = 1) => {
    const source = node(AudioBufferSourceNode, { buffer: METAL, loop: true })
    const amp = node(GainNode, { gain: 0 })
    source.connect(node(BiquadFilterNode, { type: "highpass", frequency: 5000, Q: 0.5 })).connect(amp).connect(master)
    envelope(amp.gain, t, 0.26 * level, 0.001, 2)
    source.start(t)
    source.stop(t + 2.1)
    burst(t, { level: 0.12 * level, decay: 1.6, type: "highpass", frequency: 6500, Q: 0.5, into: master })
    send(amp, 0.25, verb)
  }

  const riser = (from, to, level, into = master) => {
    const source = node(AudioBufferSourceNode, { buffer: NOISE, loop: true })
    const filter = node(BiquadFilterNode, { type: "bandpass", Q: 2.2 })
    filter.frequency.setValueAtTime(800, from)
    filter.frequency.exponentialRampToValueAtTime(10000, to)
    const amp = node(GainNode, { gain: 0 })
    amp.gain.setValueAtTime(0, from)
    amp.gain.linearRampToValueAtTime(level, to - 0.004)
    amp.gain.linearRampToValueAtTime(0, to)
    source.connect(filter).connect(amp).connect(into)
    send(amp, 0.4, verb)
    source.start(from)
    source.stop(to + 0.01)
  }

  const bass = (t, note, length, level = 1) => {
    const f = hz(note)
    const filter = node(BiquadFilterNode, { type: "lowpass", Q: 3 })
    filter.frequency.setValueAtTime(Math.min(f * 14, 1500), t)
    filter.frequency.setTargetAtTime(f * 2.5, t + 0.005, 0.05)
    const amp = node(GainNode, { gain: 0 })
    filter.connect(shaper(1.4)).connect(amp).connect(master)
    amp.gain.setValueAtTime(0, t)
    amp.gain.linearRampToValueAtTime(0.15 * level, t + 0.004)
    amp.gain.setValueAtTime(0.15 * level, t + length)
    amp.gain.setTargetAtTime(0, t + length, 0.015)
    for (const [type, gain] of [["sine", 0.9], ["sawtooth", 0.4]]) {
      const osc = node(OscillatorNode, { type, frequency: f })
      osc.connect(node(GainNode, { gain }, filter))
      osc.start(t)
      osc.stop(t + length + 0.1)
    }
  }

  const pad = (t, length, notes, level, cutoff, { attack = 0.5, release = 1.2 } = {}) => {
    const filter = node(BiquadFilterNode, { type: "lowpass", Q: 0.5 })
    filter.frequency.setValueAtTime(cutoff[0], t)
    filter.frequency.exponentialRampToValueAtTime(cutoff[1], t + length)
    const amp = node(GainNode, { gain: 0 })
    filter.connect(node(BiquadFilterNode, { type: "highpass", frequency: 240 })).connect(amp).connect(pump)
    send(amp, 0.45, verb)
    amp.gain.setValueAtTime(0, t)
    amp.gain.linearRampToValueAtTime(level, t + attack)
    amp.gain.setValueAtTime(level, t + length)
    amp.gain.setTargetAtTime(0, t + length, release / 4.6)
    for (const note of notes)
      for (const spread of [-1, 0, 1]) {
        const f = hz(note)
        const osc = node(OscillatorNode, { type: "sawtooth", frequency: f, detune: spread * 9 })
        osc.connect(node(StereoPannerNode, { pan: spread * 0.6 }, filter))
        osc.start(Math.max(0, t - random() / f))
        osc.stop(t + length + release + 0.1)
      }
  }

  const stab = (t, notes, level) => {
    const filter = node(BiquadFilterNode, { type: "lowpass", Q: 1.1 })
    filter.frequency.setValueAtTime(5200, t)
    filter.frequency.setTargetAtTime(700, t + 0.01, 0.05)
    const amp = node(GainNode, { gain: 0 })
    filter.connect(node(BiquadFilterNode, { type: "highpass", frequency: 220 })).connect(amp).connect(pump)
    send(amp, 0.3, verb)
    send(amp, 0.18, echo)
    envelope(amp.gain, t, level, 0.003, 0.26)
    for (const note of notes)
      for (const spread of [-1, 1]) {
        const f = hz(note)
        const osc = node(OscillatorNode, { type: "sawtooth", frequency: f, detune: spread * 6 })
        osc.connect(node(StereoPannerNode, { pan: spread * 0.45 }, filter))
        osc.start(Math.max(0, t - random() / f))
        osc.stop(t + 0.4)
      }
  }

  const hook = (t, note, level = 1) => {
    const f = hz(note)
    const carrier = node(OscillatorNode, { frequency: f })
    const modulator = node(OscillatorNode, { frequency: f * 2 })
    const depth = node(GainNode, { gain: 0 })
    depth.gain.setValueAtTime(f * 2.5, t)
    depth.gain.setTargetAtTime(0, t, 0.07)
    modulator.connect(depth).connect(carrier.frequency)
    const amp = node(GainNode, { gain: 0 })
    carrier.connect(amp).connect(master)
    envelope(amp.gain, t, 0.13 * level, 0.002, 0.55)
    send(amp, 0.3, echo)
    send(amp, 0.25, verb)
    for (const osc of [carrier, modulator]) {
      osc.start(t)
      osc.stop(t + 0.7)
    }
  }

  const mallet = (t, note, level = 1, decay = 2, into = master) => {
    const f = hz(note)
    const amp = node(GainNode, { gain: 1 }, into)
    send(amp, 0.35, verb)
    send(amp, 0.15, echo)
    for (const [ratio, gain] of MALLET) tonal(t, { frequency: f * ratio, level: 0.16 * level * gain, attack: 0.003, decay: decay / ratio, into: amp })
    burst(t, { level: 0.05 * level, decay: 0.004, type: "lowpass", frequency: 1600, Q: 0.7, into: amp })
  }

  const arp = (t, note, level, pan) => {
    const filter = node(BiquadFilterNode, { type: "lowpass", frequency: 2100, Q: 2 })
    filter.connect(node(StereoPannerNode, { pan }, pump))
    send(tonal(t, { frequency: hz(note), level, decay: 0.09, type: "square", into: filter }), 0.2, echo)
  }

  const fill = (bar, level) => {
    for (const step of [13, 14, 15]) burst(at(bar, step), { level: level + 0.08 * (step - 13), decay: 0.06, frequency: 1500, Q: 1.2 })
  }

  const at = (bar, step) => bar * BAR + step * STEP

  // intro: hats and the hook over a held chord, the bass from bar 2, a fill into the stop-down
  pad(intro, stop - intro, C69.voicing, 0.018, [700, 1800], { attack: 1, release: 0.3 })
  for (let bar = 0; bar < stop / BAR; bar++) {
    const chordNow = A[bar % 4]
    for (let step = 0; step < 16; step++) {
      hat(at(bar, step), ACCENTS[step] * 0.7)
      if (step % 2) shaker(at(bar, step), 0.03)
    }
    for (const beat of [1, 3]) rim(at(bar, beat * 4), 0.18, beat === 1 ? -0.4 : 0.4)
    HOOK[bar % 4].forEach((note, i) => hook(at(bar, HOOK_STEPS[i]), note, 0.9))
    if (bar >= 2) {
      for (const [step, octave, level] of BASS_STEPS) bass(at(bar, step), chordNow.bass + 12 + octave, STEP * 0.8, level * 0.8)
      for (const beat of [0, 2]) kick(at(bar, beat * 4), 0.7, 900)
    }
  }
  fill(stop / BAR - 1, 0.2)

  // the stop-down under Introducing: one low note, a swell, a riser into the name
  stopdown(stop, drop)
  tonal(stop, { frequency: hz(C69.bass + 12), level: 0.07, attack: 0.02, decay: 1.6, into: out })
  mallet(stop + BEAT, "C6", 0.3, 1.4, out)
  riser(drop - BAR, drop, 0.025, out)

  // the groove from the drop: A chords, then B at the turn, stripped to hats and bass under the rules, full at the top
  for (let bar = drop / BAR; bar < button / BAR; bar++) {
    const t = bar * BAR
    const phrase = (bar - drop / BAR) % 4
    const section = t >= top ? "top" : t >= strip ? "strip" : t >= turn ? "turn" : "a"
    const chordNow = (section === "turn" ? B : A)[phrase]
    const wide = section === "top"

    if (section !== "strip" || phrase >= 2) {
      pad(t, BAR, chordNow.voicing, section === "turn" ? 0.012 : 0.009, [1600, 2200], { attack: 0.06, release: 0.3 })
      for (const beat of [0, 1, 2, 3]) kick(t + beat * BEAT, section === "strip" ? 0.8 : 1)
      for (const beat of [1, 3]) clap(t + beat * BEAT, 0.9)
    }
    for (const [step, octave, level] of BASS_STEPS) bass(at(bar, step), chordNow.bass + 12 + octave, STEP * 0.8, level)
    for (let step = 0; step < 16; step++) {
      const open = wide && step % 4 === 2
      if (open) hat(at(bar, step), 0.3, true)
      else if (!(wide && step % 4 === 3)) hat(at(bar, step), ACCENTS[step] * (bar === drop / BAR ? 0.7 : 1))
      shaker(at(bar, step), (step % 2 ? 0.05 : 0.03) * (section === "strip" ? 0.6 : 1))
    }
    if (section !== "strip") for (const [step, pan] of [[3, -0.4], [10, 0.4]]) rim(at(bar, step), 0.2, pan)

    if (section === "turn") ARP.concat(ARP).forEach((index, step) => arp(at(bar, step), chordNow.voicing[index % chordNow.voicing.length] + 12, 0.05, step % 2 ? 0.3 : -0.3))
    if (section !== "strip" || phrase >= 2) {
      HOOK[phrase].forEach((note, i) => hook(at(bar, HOOK_STEPS[i]), note, wide ? 1.1 : 1))
      if (wide) HOOK[phrase].forEach((note, i) => hook(at(bar, HOOK_STEPS[i]), midi(note) + 12, 0.3))
    }
    if (section === "turn" || section === "top") for (const step of [6, 14]) stab(at(bar, step), chordNow.voicing, wide ? 0.026 : 0.02)
    if (section === "strip" && phrase < 2) MOTIF.forEach((note, i) => mallet(at(bar, HOOK_STEPS[i]), note, 0.9, 1.2))
    if (phrase === 3) fill(bar, 0.22)
  }

  for (const t of [drop, turn, top]) crash(t, t === drop ? 0.8 : 0.5)
  for (const t of [17.1, 24.6]) dip(t)
  riser(top - BAR, top, 0.06)

  // the button: a C69 chord struck once on the return, ringing out to the end, nothing under it
  kick(button, 1)
  stab(button, C69.voicing, 0.02)
  pad(button, 0.1, C69.voicing, 0.013, [3200, 3000], { attack: 0.004, release: 3.2 })
  tonal(button, { frequency: hz(C69.bass + 12), level: 0.22, attack: 0.004, decay: 2.6, into: master })
  MOTIF.forEach((note, i) => mallet(button + BEAT + (i * BEAT) / 2, note, 0.9, 2.4))
  mallet(button + BEAT * 4, "C6", 0.7, 3)
}
