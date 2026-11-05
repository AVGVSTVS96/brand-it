# video

The launch video, made from HTML in the brand's own type and tokens. `brand-it/` is one page of timed scenes on a 1920×1080 paper stage: `window.seek(t)` is a pure function of time, so headless Chrome renders it frame by frame, and `window.soundtrack()` builds the music and the effects from the same cue list, so picture and sound can't drift.

```sh
bun install
bun parts.mjs                 # brand-it/parts.js: the wordmark, the b and its 29 points, read from brand/logo
bun sweep.mjs                 # brand-it/sweep/: the site at 45 widths, light and dark, for the check scene (needs site/dist)

s=~/.agents/skills/brand-it/scripts
export TMPDIR=$PWD/.scratch
bun $s/video.mjs brand-it stills 0 11.5 17.5   # single moments; t=0 is the poster
bun $s/video.mjs brand-it sheet 2             # a contact sheet, a frame every 2 s
bun $s/video.mjs brand-it audio               # out/soundtrack.wav at -14 LUFS, true peak under -2 dBTP
bun $s/video.mjs brand-it video               # out/brand-it.mp4: 60 fps, BT.709, 5 s parts that resume
bun $s/video.mjs brand-it video --size 1080x1350   # out/brand-it-1080x1350.mp4, the 4:5 cut
```

Open `brand-it/index.html` through any static server rooted at the repo to watch it live (`?t=20` jumps); click to play with the soundtrack once `audio` has run.

```
brand-it/
  index.html   the ten scenes, each a <section data-s data-e>; anything with class a animates at the scene's start plus --d
  video.css    tokens, the stage, rails, keyframes, the dimension and frame motifs at video scale, one block per scene
  video.js     the clock: springs from Motion as CSS linear(), typed commands, the width sweep, measured dimensions, seek(t)
  sound.js     effects from data-cue (cuelume) panned to where the element is, in one shared room; the WAV encoder
  music.js     the track: 120 BPM in C major, sections on the cuts
  parts.js     made by parts.mjs
  sweep/       made by sweep.mjs
```

## Timing

A scene runs from `data-s` to `data-e` seconds. `--k` picks the keyframes (`rise` out of an `.m` mask by default, `up`, `fade`, `pop`, `draw`, `draw-y`, `slide-l`, `slide-r`, `stroke`, `out`), `--t` the timing: `var(--settle)` (the default), `var(--draw)`, `var(--pop)` are springs without bounce, or a fixed `.4s var(--ease)`. Typed lines are `[data-type]` with `data-d`, an optional `data-char` (45 ms a character by default) and `data-verb` (how many characters are the command verb, set in pencil). The sweep steps through `data-widths` (a width, or `width:hold` to sit on one) every `data-every` seconds, and draws the dimension dashed at any widths `data-problems` lists. The two dimensions that carry numbers measure the rendered wordmark and the rendered b on load; nothing on them is typed.

Cuts land on half seconds, the beat at 120 BPM. Moving a scene moves everything in it, sound included.

## Sound

A `data-cue` plays when its element starts animating (or, on a typed line, when return lands). Typed characters tick on their own. Tiers: `volume=1` for the one big moment (the name), about `.8` for the b filling, `.5` for a tap, `.35` for a whoosh, `.2` for a keystroke. The music finds its sections in `music.js` (`stop`, `drop`, `turn`, `strip`, `top`, `button`); keep them on the cuts when scenes move. `video.mjs` mixes the two stems and masters to -14 LUFS; nobody here can listen, so report its numbers.
