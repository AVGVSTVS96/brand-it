# brand-it

A skill for coding agents that brands a project the way [hex](https://github.com/AVGVSTVS96/hex), [commonplace](https://github.com/AVGVSTVS96/commonplace) and [seqno](https://github.com/AVGVSTVS96/seqno) were made: name, wordmark, palette, type, site, link preview, README header, launch post and launch video, all built as code from the product's own parts.

The rules come from what was actually said to agents while building those three, and from the mistakes they kept making. It points at those projects' folders, so read it as a worked method rather than a drop-in.

```sh
npx skills add AVGVSTVS96/brand-it
```

```
SKILL.md        the method: the bar, the steps, words, fidelity, checks
refs.md         saved references, and how an agent pulls more
video.md        launch videos: HTML scenes on one clock, rendered frame by frame,
                sound built from the same clock
scripts/
  shoot.mjs     a page at every width from 320 to 1920 in light and dark,
                flagging overflow; exact renders for OG images and icons
  video.mjs     any page with window.seek(t): stills, contact sheets,
                a -14 LUFS soundtrack, a BT.709 mp4 in 5 s parts that resume
```

The scripts need Bun, Chrome and ffmpeg. Bun installs puppeteer-core on first run.

MIT
