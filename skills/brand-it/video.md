# video

Launch videos are made like the site: HTML in the brand's own fonts and tokens, timed by one clock, rendered frame by frame in headless Chrome and encoded with ffmpeg. The sound is built from the same clock, so picture and sound can't drift. The source is committed with the project, "part of the overall design system", so the next video is cheap.

Start from the closest kit:

- **hex** · `~/Developer/hex-media/media` (README). The richest one: scenes with `data-s`/`data-e`, Motion springs baked into CSS `linear()` curves, Telegram (iOS 26), Discord and Buzz chrome drawn like the real apps, cuelume cues and music in Web Audio.
- **commonplace** · `~/Developer/commonplace-site/video` (README, LEARNED.md). Terminal scenes as data (`scenes.js`), typed commands, key ticks and tones. `LEARNED.md` is everything the hex video taught, in Bassim's words.

## The contract

The page sets `window.END` in seconds and `window.seek(t)`, a pure function of time. Nothing moves on its own: no running CSS animations, transitions, timers or rAF while rendering, and no unseeded `Math.random` (seed it from the cue index). hex's `stage.js` pauses every animation and sets its `currentTime`; commonplace's `video.js` toggles classes from the clock. Fonts are local files. `window.soundtrack()` is optional and returns `{ stem: base64 wav }`, rendered with an `OfflineAudioContext` from the same cue list as the picture; the page owns the mix and the script masters it.

```sh
s=~/.agents/skills/brand-it/scripts
export TMPDIR=$PWD/.scratch
bun $s/video.mjs video/ stills 0 12 30.5        # single moments; t=0 is the poster
bun $s/video.mjs video/ sheet 2                 # contact sheet, a frame every 2 s
bun $s/video.mjs video/ audio                   # stems → soundtrack.wav at -14 LUFS, true peak under -2 dBTP
bun $s/video.mjs video/ video                   # out/video.mp4: 60 fps, BT.709, 5 s parts that resume
bun $s/video.mjs video/ video --size 1080x1350  # the 4:5 cut for the feed
```

Render and master with `video.mjs`. The kits' own `render.mjs` files predate its color fix (without it, `#D9372B` comes out `#E64427`), and commonplace's masters to -16 LUFS.

## Pacing

- "Nice, short, punchy", but "some of the slides go by quite fast... a little bit more time for them to sink in." Nobody has said too long: hex grew 48 → 73 → 89 s on Bassim's asks.
- One statement per screen. Every scene holds after its last element lands, long enough to read the caption twice.
- Open on the point, then an "Introducing" card before the name, held "maybe a half a second more".
- Hard cuts, no crossfades, no stock-video feel. Cuts land on half seconds (the beat at 120 BPM), elements stagger by 0.5 s, and a cut never lands mid-animation.
- You pick the scenes that carry the idea and give them more room; Bassim doesn't micro-time.

## Look

- The site's system exactly, at 1920×1080: same fonts and tokens, with rails (wordmark top-left, tagline top-right, scene count bottom-left, URL bottom-right).
- A phone shows the frame at about a fifth of its size, so anything the viewer has to read is at least 3% of the frame width (about 58 px). Dense CLI output can drop to 28 px. Rules are 2 px; 1 px shimmers or vanishes after X re-encodes.
- The first frame is composed, never blank paper: X uses it as the poster unless a thumbnail is set in Media Studio.
- On the cut frame every static element is already in place; only the thing being built animates after it. Text arrives whole (fade or move), never sliced by a clip-path, and numbers show their final value on the cut instead of scrambling or counting.
- Every frame is complete, not just the last one: no border missing mid-animation, no missing 2 px rule, no foreground text over background text, dot grids padded off the edges and quieter than the text. When something blurs, blur the whole content area, not just the words.
- One accent object per scene.

## Motion

- Springs without bounce by default (Motion's, baked to `linear()`); bounce only where it means something.
- Reveal on the beat through the scene. Dumping everything on screen in the first quarter and then freezing is a slideshow.
- Still beats fake motion: no breathing scale loops, no slow drifting pans.
- Exits are faster than entrances, and things don't all enter the same way.
- Typed text lands like real output, about 45 ms a character.
- Run the motion pass with `emil-design-eng`, but its UI durations (under 300 ms) don't apply here; video entrances run 0.3 to 0.8 s.

## Sound

- Silence is "underwhelming". The ask is music plus generated effects (cuelume).
- Effects are sparse: "one for a moment that matters, not one per item." The hex cut called "overdone... there just for the sake of being there" had 43 cues in 73 s. Aim for 10 to 15 in 90 s, tiered: volume 1 for the one or two big moments, about .5 for a tap, about .35 for a whoosh.
- Music isn't generic: "high energy and crafty and elegant and simple and sleek and crisp." Change something every 4 to 8 bars, stop down before a reveal, and end on a button that rings out instead of a fade.
- The 89 s hex cut got "I hate the music." Make it in Suno: "use that to make much better music."
- Everything is in one key (cuelume's cues are pitched in C major; hex runs 120 BPM in C). No big low hits: the gong "doesn't fit. It sounds strange."
- Each cue sits on the element it belongs to, panned to where it is on screen, low-cut, in one shared room.
- You can't listen, so say that and report numbers: loudness and true peak after AAC (`video` prints them), a spectrogram, and cue onsets against picture times. AAC adds a little overshoot, so -2 dBTP on the master lands around -1.5 in the mp4; under -1 there is fine.

## Content

- Include a "magic underneath" beat that shows the mechanism behind the simple surface: "It's like simple. Yeah, but it's insanely like cutting edge type shit."
- Burn in captions. X autoplays muted, and uploaded subtitles are opt-in.

## Process

1. Storyboard as a table first: time, scene, what's on screen, caption, and why it's there. A scene with no why gets cut.
2. Keep the mp4 at one path and refresh it mid-work for peeks. Say exactly what that file contains; a preview missing the newest scene caused a mix-up once.
3. Before every full render, check stills at chosen moments, a pair around every cut (0.1 s before, 0.2 s after) to catch pops, and a contact sheet. Look at every held frame.
4. Before sending it, give the mp4 and the contact sheet to a fresh subagent told to roast it, not praise it: ranked problems with timecodes.
5. Render one video at a time. The 5 s parts keep memory flat; the old single-pipe render grew past 1 GB at about 1 GB a minute until the server's watcher froze it.
6. Commit the pipeline with a README.

## X (checked Oct 2026)

Free accounts post up to 140 s and 512 MB. Upload H.264 High, yuv420p, AAC, constant frame rate, SDR, up to 60 fps (`video.mjs` does all of that). 16:9 is the safe default; 4:5 (1080×1350) takes more feed height on phones. Short clips under about 6 s loop, so their last frame should cut cleanly back to the first.
