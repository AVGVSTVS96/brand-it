# video

The launch video, made from HTML in the brand's own type and tokens. `brand-it/` is one page of timed scenes on a 1920×1080 paper stage: `window.seek(t)` is a pure function of time, so headless Chrome renders it frame by frame, and `window.soundtrack()` builds the music and the effects from the same cue list, so picture and sound can't drift.

```sh
bun install
bun parts.ts                  # brand-it/parts.ts: the wordmark, the b and its 29 points, read from brand/logo
bun sweep.ts                  # brand-it/sweep/: the site at 45 widths, light and dark, for the check scene (needs apps/site/dist)

s=../../skills/brand-it/scripts
export TMPDIR=$PWD/.scratch
bun $s/video.ts brand-it stills 0 11.5 17.5   # single moments; t=0 is the poster
bun $s/video.ts brand-it sheet 2             # a contact sheet, a frame every 2 s
bun $s/video.ts brand-it audio               # out/soundtrack.wav at -14 LUFS, true peak under -2 dBTP
bun $s/video.ts brand-it video               # out/brand-it.mp4: 60 fps, BT.709, 5 s parts that resume
bun $s/video.ts brand-it video --size 1080x1350   # out/brand-it-1080x1350.mp4, the 4:5 cut
```

The page loads its scripts as TypeScript, so a plain static server can't play it. The skill's server transpiles `.ts`; to watch it live (`?t=20` jumps), start it and open the URL it prints, then click to play with the soundtrack once `audio` has run:

```sh
bun -e "const { serve } = await import('$s/lib.ts'); console.log(serve('brand-it').url); await new Promise(() => {})"
```

```
brand-it/
  index.html   the ten scenes, each a <section data-s data-e>; anything with class a animates at the scene's start plus --d
  video.css    tokens, the stage, rails, keyframes, the dimension and frame motifs at video scale, one block per scene
  video.ts     the clock: springs from Motion as CSS linear(), typed commands, the width sweep, measured dimensions, seek(t)
  sound.ts     effects from data-cue (cuelume) panned to where the element is, in one shared room; the WAV encoder
  music.ts     the track: 120 BPM in C major, sections on the cuts
  hall.ts      the room both share; random.ts, the seeded random they draw from
  parts.ts     made by parts.ts
  sweep/       made by sweep.ts
```

## Timing

A scene runs from `data-s` to `data-e` seconds. `--k` picks the keyframes (`rise` out of an `.m` mask by default, `up`, `fade`, `pop`, `draw`, `draw-y`, `slide-l`, `slide-r`, `stroke`, `out`), `--t` the timing: `var(--settle)` (the default), `var(--draw)`, `var(--pop)` are springs without bounce, or a fixed `.4s var(--ease)`. Typed lines are `[data-type]` with `data-d`, an optional `data-char` (45 ms a character by default) and `data-verb` (how many characters are the command verb, set in pencil). The sweep steps through `data-widths` (a width, or `width:hold` to sit on one) every `data-every` seconds, and draws the dimension dashed at any widths `data-problems` lists. The two dimensions that carry numbers measure the rendered wordmark and the rendered b on load; nothing on them is typed.

Cuts land on half seconds, the beat at 120 BPM. Moving a scene moves everything in it, sound included.

## Sound

A `data-cue` plays when its element starts animating (or, on a typed line, when return lands). Typed characters tick on their own. Tiers: `volume=1` for the one big moment (the name), about `.8` for the b filling, `.5` for a tap, `.35` for a whoosh, `.2` for a keystroke. The music finds its sections in `CUTS` in `music.ts` (`stop`, `drop`, `turn`, `strip`, `top`, `button`); keep them on the cuts when scenes move. `video.ts` mixes the two stems and masters to -14 LUFS; nobody here can listen, so report its numbers.

The track is in C major, the key cuelume's cues are pitched in: an intro under the two sites, a stop-down under Introducing, the drop on the name, something new every four bars, a strip-down under the rules, and a button on the return of "brand it" that rings out to the end.

cuelume keeps one AudioContext and its own randomness for the life of its module, so `sound.ts` imports a fresh copy of its engine for every cue, on a seeded `Math.random`, and renders the cues one at a time. Its cues render about 14 dB under the music's peaks, so the cue bus is lifted 5x to bring `volume=1` level with them.
