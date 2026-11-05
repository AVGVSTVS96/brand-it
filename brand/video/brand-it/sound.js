import { END, cues, seek } from "./video.js"
import music from "./music.js"

export const RATE = 48000

const seeded = seed => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function hall(ctx, seconds, predelay, random) {
  const rate = ctx.sampleRate
  const buffer = ctx.createBuffer(2, seconds * rate, rate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    let low = 0
    let energy = 0
    for (let i = 0; i < data.length; i++) {
      const t = i / rate - predelay
      if (t < 0) continue
      low += (0.06 + 0.9 * Math.exp(-t * 2.2)) * (random() * 2 - 1 - low)
      data[i] = low * Math.exp((-6.9 * t) / (seconds - predelay))
      energy += data[i] ** 2
    }
    for (let i = 0; i < data.length; i++) data[i] /= Math.sqrt(energy)
  }
  return buffer
}

const WIDTH = 0.4
function pan(el, t) {
  seek(t)
  const { left, width } = el.getBoundingClientRect()
  return Math.max(-1, Math.min(1, (left + width / 2) / 960 - 1)) * WIDTH
}

async function renderCue({ name, options }, i) {
  const ctx = new OfflineAudioContext(2, 3 * RATE, RATE)
  Object.defineProperty(ctx, "state", { get: () => "running" })
  window.AudioContext = function () {
    return ctx
  }
  // cuelume keeps one AudioContext and its own randomness for the life of its module, so every cue imports a fresh copy on a seeded Math.random
  Math.random = seeded(i + 1)
  const { play } = await import(`../node_modules/cuelume/dist/audio/engine.js?cue=${i}`)
  play(name, options)
  return ctx.startRendering()
}

async function renderCues() {
  const list = cues.map(cue => ({ ...cue, from: pan(cue.el, cue.t), to: pan(cue.el, cue.t + 0.6) }))
  const ctx = new OfflineAudioContext(2, Math.ceil(END * RATE), RATE)
  // cuelume's cues render about 14 dB under the music's peaks; this lifts the bus so volume=1 lands level with them
  const bus = new GainNode(ctx, { gain: 5 })
  bus.connect(ctx.destination)
  const clear = new BiquadFilterNode(ctx, { type: "highpass", frequency: 250, Q: 0.6 })
  clear.connect(bus)
  const room = new ConvolverNode(ctx, { buffer: hall(ctx, 1.6, 0.025, seeded(7)), disableNormalization: true })
  clear.connect(new GainNode(ctx, { gain: 0.07 })).connect(room).connect(bus)
  for (const [i, cue] of list.entries()) {
    const source = new AudioBufferSourceNode(ctx, { buffer: await renderCue(cue, i) })
    const panner = new StereoPannerNode(ctx)
    panner.pan.setValueAtTime(cue.from, cue.t)
    panner.pan.linearRampToValueAtTime(cue.to, cue.t + 0.6)
    source.connect(panner).connect(clear)
    source.start(cue.t)
  }
  return ctx.startRendering()
}

async function renderMusic() {
  const ctx = new OfflineAudioContext(2, Math.ceil(END * RATE), RATE)
  Math.random = seeded(1)
  music(ctx, END, seeded(2))
  return ctx.startRendering()
}

function wav(buffer) {
  const channels = [buffer.getChannelData(0), buffer.getChannelData(1)]
  const frames = buffer.length
  const bytes = new DataView(new ArrayBuffer(44 + frames * 8))
  const text = (offset, s) => [...s].forEach((c, i) => bytes.setUint8(offset + i, c.charCodeAt(0)))
  text(0, "RIFF")
  bytes.setUint32(4, 36 + frames * 8, true)
  text(8, "WAVEfmt ")
  bytes.setUint32(16, 16, true)
  bytes.setUint16(20, 3, true)
  bytes.setUint16(22, 2, true)
  bytes.setUint32(24, RATE, true)
  bytes.setUint32(28, RATE * 8, true)
  bytes.setUint16(32, 8, true)
  bytes.setUint16(34, 32, true)
  text(36, "data")
  bytes.setUint32(40, frames * 8, true)
  for (let i = 0; i < frames; i++)
    for (let c = 0; c < 2; c++) bytes.setFloat32(44 + i * 8 + c * 4, channels[c][i], true)
  return new Uint8Array(bytes.buffer).toBase64()
}

window.cueList = () => cues.map(({ t, name, options }) => ({ t: +t.toFixed(3), name, ...options }))
window.soundtrack = async () => {
  const random = Math.random
  try {
    return { cues: wav(await renderCues()), music: wav(await renderMusic()) }
  } finally {
    Math.random = random
  }
}
