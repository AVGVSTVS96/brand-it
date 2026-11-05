/* oxlint-disable no-bitwise, unicorn/prefer-math-trunc -- mulberry32 mixes bits and wraps to 32-bit integers, which Math.trunc does not, https://gist.github.com/tommyettinger/46a874533244883189143505d203312c */
export const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};
