# brand-it site copy

Final copy. Use it word for word. Text in `code` is shown as code. Notes in *(italics)* are for the designer, not the page.

One page: a hero, the examples, two short sections, install, footer. Every section is one headline, one short line and a visual. The examples are the page; everything else stays short. The name is lowercase everywhere, even at the start of a sentence. Nothing on this page may claim something the skill doesn't do today.

## Page

- `<title>`: brand-it · brand a project from its own parts
- Meta description: A skill for coding agents. Say brand it, and it makes the name, wordmark, palette, type, site, link preview, README header, launch post and launch video, all built as code from the product's own parts, the way hex and commonplace were made.
- Header: the wordmark on the left, GitHub on the right. No nav; it's one screen of scrolling.

## Hero

- Wordmark: brand-it
- Tagline, under the wordmark: brand a project from its own parts
- Hero line: Say brand it.
- Sub line: A skill for coding agents that takes a project from its name to its launch video, all as code.
- Install line, as code with a copy button: `npx skills add AVGVSTVS96/brand-it`
- Copy button: Copy · after click: Copied
- Secondary link: View on GitHub

*(The hero has no visual of its own. The examples start right under the install line and are above the fold at 1035, so the three marks are the first picture on the page.)*

## Examples

Section title: Each one its own look.
Line: The rules come from making hex and commonplace. The first thing the skill branded was itself.

*(Three rows, one per project, in this order. Each row shows the real thing and nothing redrawn: that repo's wordmark SVG, the live site shot with `shoot.mjs` at 1035 and 390 in light and dark, and its OG image. Links go to the live site and the repo. The shots follow the system theme, so a dark-mode visitor sees the dark shots. The idea line is one sentence; the facts strip is four short mono items.)*

### hex

- Name line: hex · Claude Code as your personal assistant
- The idea: Poppy neo-brutalist. Cream and ink, blue, yellow and pink, hard shadows, and the real Telegram, Discord and Buzz on the page.
- Facts strip: Archivo · Martian Mono · 3 accents · name to launch video in two days
- Links: hex-sand.vercel.app · github.com/AVGVSTVS96/hex

### commonplace

- Name line: commonplace · your personal data kit for agents
- The idea: A light terminal. Paper, mono, one red pen. The wordmark is the CLI cursor, drawn from the font's outlines.
- Facts strip: Ioskeley Mono · IBM Plex Sans · 1 red · name to live site in under two hours
- Links: commonplace-eight-sable.vercel.app · github.com/AVGVSTVS96/commonplace

### brand-it

- Name line: brand-it · brand a project from its own parts
- The idea: *(the idea line from `brand/BRAND.md`, verbatim, once the brand agent lands it)*
- Facts strip: *(the two faces and the accent count from `BRAND.md`)* · this page, by the skill
- Links: github.com/AVGVSTVS96/brand-it

Caption under the three: They share a method, not a look.

## Code

Section title: All of it is code.
Line: A brand is one BRAND.md, one specimen page and the scripts that made it, so any asset rebuilds in one command.

*(The visual is a file tree: what a branded repo holds when the skill is done. Monospace, one line per file, the right column in the muted ink.)*

```
brand/
  BRAND.md          the system, written down
  specimen.html     the system in use: hero, type scale, tokens, motion
  references.md     what was taken from your saves, and what wasn't
  logo/gen.mjs      three marks from real font outlines, as SVG paths
copy/
  MESSAGING.md      the one line, what it is and isn't, the voice, facts with sources
  SITE.md  LAUNCH.md  README.md
site/               static, on Vercel: og.png, favicon.svg, the README header
video/              HTML scenes on one clock, sound built from the same clock
```

## Checks

Section title: Checked before it says done.
Line: Two scripts ship with the skill. One shoots a page at 45 widths in light and dark and prints anything that overflows. The other renders the video frame by frame and prints its loudness after encoding.

*(The visual is one terminal with both scripts' output in the exact shape they print. The problems are illustrative but real in kind: the stat that overflowed at 1035 is the width Bassim browses at, and the bug that got past four widths on hex. "2 problems" is the script's own wording.)*

```
$ bun shoot.mjs site/ shots/
page scrolls sideways by 14px
  at light 320, dark 320
text wider than its box: strong.num "~2,000"
  at light 1035, dark 1035

2 problems · shots in shots/ at 390@2x, 1035, 1440

$ bun video.mjs video/ video
41s / 41s
video/out/video.mp4: -14 LUFS, true peak -2.1 dBTP after AAC
```

## Install

Section title: Install
Line: One command. Then open a project in Claude Code and say brand it.

```sh
npx skills add AVGVSTVS96/brand-it
```

Copy button: Copy · after click: Copied

**You'll need**
- Bun, Chrome and ffmpeg, for the scripts. Bun installs puppeteer-core on first run.

Closing line: It points at my own projects and saves, so read it as a worked method, or fork it and point it at yours.

## Footer

- Open source under MIT. This page was made with it.
- github.com/AVGVSTVS96/brand-it
- by [bassim](https://github.com/AVGVSTVS96)
