<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/brand-it-dark.svg">
    <img src=".github/assets/brand-it.svg" alt="brand-it">
  </picture>
</p>

<p align="center">brand a project from its own parts<br><a href="https://brand-it-seven.vercel.app">brand-it-seven.vercel.app</a></p>

A skill for coding agents that brands a project: name, wordmark, palette, type, site, link preview, README header, launch post and launch video, each project its own look, drawn from real references in the owner's saves and shown as two or three directions to pick from, all built as code.

It points at one person's projects and saves, so read it as a worked method, or fork it and point it at yours.

```sh
npx skills add AVGVSTVS96/brand-it
```

Then open a project in Claude Code and say "brand it".

```
skills/brand-it/    the skill: npx skills add installs only this folder
  SKILL.md          the method: references, directions, system, site, words, checks
  refs.md           saved references, and how an agent pulls more
  video.md          launch videos: HTML scenes on one clock, rendered frame by frame,
                    sound built from the same clock
  scripts/
    shoot.ts        a page at 45 widths from 320 to 1920 in light and dark,
                    flagging overflow and colors that fight; screen-high tiles
                    to read at real size; exact renders for OG images and icons
    video.ts        any page with window.seek(t): stills, contact sheets,
                    a -14 LUFS soundtrack, a BT.709 mp4 in 5 s parts that resume
apps/site/          brand-it-seven.vercel.app, built with the skill
brand/              brand-it's own brand, copy and launch video, made with the skill
```

The scripts need Bun, Chrome and ffmpeg. Bun installs puppeteer-core on first run.

## Made this way

|             |                                        |                                                                                  |
| ----------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| hex         | Claude Code as your personal assistant | [hex-sand.vercel.app](https://hex-sand.vercel.app)                               |
| commonplace | your personal data kit for agents      | [commonplace-eight-sable.vercel.app](https://commonplace-eight-sable.vercel.app) |
| brand-it    | this skill, branded with itself        | [brand-it-seven.vercel.app](https://brand-it-seven.vercel.app)                   |

MIT
