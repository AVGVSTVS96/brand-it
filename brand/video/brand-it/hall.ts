export const hall = (
  ctx: BaseAudioContext,
  seconds: number,
  predelay: number,
  random: () => number,
) => {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(2, seconds * rate, rate);

  for (const channel of [0, 1]) {
    const data = buffer.getChannelData(channel);
    let low = 0;
    let energy = 0;

    for (let i = 0; i < data.length; i += 1) {
      const t = i / rate - predelay;

      if (t >= 0) {
        low += (0.06 + 0.9 * Math.exp(-t * 2.2)) * (random() * 2 - 1 - low);
        data[i] = low * Math.exp((-6.9 * t) / (seconds - predelay));
        energy += (data[i] ?? 0) ** 2;
      }
    }

    const norm = Math.sqrt(energy);

    for (const [i, sample] of data.entries()) {
      data[i] = sample / norm;
    }
  }

  return buffer;
};
