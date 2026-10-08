# brand-it · brand

**The idea in a sentence:** brand-it looks like the drafting layer under a brand: white paper, ink, and one pencil blue for the guides, measures and nodes the method draws while it checks its work, so the brands it shows sit inside as finished things.

## Personality

- **A workbench, not a brand.** Its job is to frame other brands. hex is loud and commonplace is quiet, and both have to look right on this page. So the page is white, the type is neutral, and the only color is the one the method draws with.
- **Measured.** Every number on a brand-it surface was measured by a script, never typed: the wordmark's width in the hero, the 1035 under a shot, the 4.7:1 next to a token. If it can't be measured it isn't shown as a number.
- **Construction visible.** The finished thing with its guides still on. The mark is the b with the 29 points gen.mjs read from the font; the hero wordmark has its dimensions drawn around it. The guides drop out at small sizes, the way a non-photo pencil drops out of the print.
- **Plain.** It says what the file is and what the script prints. "Shot at 45 widths, light and dark." Not a feature, a fact.
- **One person's taste, shown.** The examples are the argument. The page spends its space on hex and commonplace, not on describing a method.

## What it is and isn't

| it is | it isn't |
| --- | --- |
| a skill: a text file and two scripts | a tool, a platform, a generator |
| a method with a bar | a theme, a UI kit, a palette |
| the drafting layer: guides, measures, nodes | a dashboard, a design-tool costume |
| a frame for other brands | a brand that competes with the ones it shows |

## The visual system

### Type: Mona Sans + Mona Sans Mono (OFL, free)

One family, two voices. Mona Sans carries everything a person reads; Mona Sans Mono carries everything a script prints and every measurement. Both are variable with a width axis, which is the system's one knob: the same tokens at a different setting. GitHub drew them (Degarism, 2022; the mono and optical sizes, 2025), and they ship under the OFL.

- **Mona Sans** for prose, headlines, the wordmark. Display at 600, letter-spacing −0.03em, line-height 1.0, `font-optical-sizing: auto`. h2 at 36/1.1 600 −0.025em; h3 at 18/1.3 600; body 17/1.55 at 400, measure 62ch; small 15/1.5 in `--ink-2`. Width 100 everywhere; the narrow cut (85) is for a number that has to fit, never a style.
- **Mona Sans Mono** for labels, measurements, code, rails. Labels at 12px 500 in `--pencil`, tabular figures, no uppercase, no tracking. Code at 14/1.6 400. Ligatures off (`font-variant-ligatures: none`): `--pencil` stays two hyphens, like a terminal.
- Shipped as subsets in `fonts/` (Latin plus `→ ← · × ✓ − ≈ ≠`), with weight 300 to 800 and width 85 to 110 kept, optical size kept: `mona-sans.woff2` 202 KB, `mona-sans-mono.woff2` 34 KB. The license is next to them. The static cuts `logo/gen.mjs` reads (SemiBold at width 100 and optical size 100, Mono Medium) are in `logo/ttf/`.
- Candidates set on the real page and shot (`fonts-compare.html`): Instrument Sans (softer, wider, reads 2024-indie), Overused Grotesk (the Swiss spec-sheet voice, but Helvetica isn't "new"), JetBrains Mono (crisper code, no family tie). Mona Sans was picked for the engineered cut, the axes, and the matching mono.

### Color: paper, ink, one pencil

Light is the default. Dark is the same tokens swapped, never a second design.

| token | light | dark | job |
| --- | --- | --- | --- |
| `--paper` | `#FFFFFF` | `#101214` | the page: white, not cream, so the brands shown on it keep their own color |
| `--paper-2` | `#F4F5F6` | `#181B1E` | surfaces inside the page: tab strips, code panels |
| `--ink` | `#0F1113` | `#ECEEF0` | text, wordmark, frames: the finished thing (18.9:1) |
| `--ink-2` | `#5B6168` | `#9AA1A8` | second-level text, captions (6.3:1) |
| `--ink-3` | `#6B7177` | `#8E959C` | the dimmest text allowed: section names, rails (4.9:1) |
| `--hair` | `rgb(15 17 19 / .12)` | `rgb(236 238 240 / .14)` | 1px rules, table rows, borders of things that aren't the subject |
| `--hair-2` | `rgb(15 17 19 / .06)` | `rgb(236 238 240 / .07)` | row dividers inside a table |
| `--pencil` | `#0B74D4` | `#62BBFF` | dimension lines, ticks, nodes, callouts, labels, focus rings (4.7:1 on paper) |
| `--pencil-soft` | `rgb(11 116 212 / .10)` | `rgb(98 187 255 / .14)` | selection, the region a measurement covers |

Rule: **the pencil draws the construction and never the thing.** Text, wordmarks, frames and shots are ink; what the method drew around them while checking is pencil. brand-it has one color because the brands it shows bring theirs (hex three accents on cream, commonplace one red on paper). Blue was chosen because it is the non-photo pencil, the one drafters sketch guides in because it drops out of the final print, and it sits well away from hex's violet `#2B3EFF` and commonplace's red. A problem is a dashed pencil line and the script's words, not a second color.

### Grid and spacing

- 8px base, 4px half step. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.
- Page max 80rem with 1px hairline side rails; gutters `clamp(1rem, 4vw, 3rem)`; sections separated by hairlines, not background changes.
- Square corners everywhere except the icon tile (rx 14 at 100). No shadows, no gradients, no blur. 1px lines: hairlines for structure, ink for a frame, pencil for a measurement. 2px only on the video stage.
- Shots and tables go full width of their column; tables scroll sideways on phones rather than wrap.

### Motifs

Every motif is something the skill already does.

1. **The dimension.** Ticks at both ends, a 1px line, the number knocked out of the middle in a 12px pencil label. Horizontal under a thing, vertical beside it. The number is the real size of the thing, never typed: a wordmark shown at full size is measured in the browser (`getBoundingClientRect`); a shot shown smaller than it was taken carries the width it was taken at (`1035`), the way a drawing at scale still carries real dimensions. From the check: shots at 320 to 1920.
2. **The node.** The on-curve points of a glyph as `gen.mjs` reads them with opentype.js: 3.4-unit pencil squares with a 0.8 paper halo, on the outline. The mark is the b with its 29. Shown at display sizes, gone below 48px.
3. **The frame.** 1px ink around a real render, a label on top (`hex · 1035 · light`), a dimension below (`1035`). Shots never float.
4. **The callout.** A 6px pencil dot on the part, a horizontal leader, a label after it. One per thing. From the spec-sheet references.
5. **The check.** What `shoot.mjs` prints, in its exact shape, in the code style. A problem is the dashed dimension plus the script's words.
6. **The pair.** Light and dark side by side. Anything shown once is shown twice.

### Iconography

Almost none. Glyphs the fonts have: `→ · × ✓`. If an icon is unavoidable: 16px grid, 1.5px stroke, square caps, ink only. Other brands' marks are their official SVGs (`examples/hex.svg`, `examples/commonplace.svg`), at their own color, sized to a common cap height.

### Diagrams

Diagrams look measured: 1px ink boxes, pencil dimensions and callouts, mono labels, straight orthogonal leaders. The video stage is drawn this way (a 16:9 ink frame with rails). Never isometric, never icons in boxes, never a dot grid behind.

### Data viz

A number is a dimension or a row. Horizontal bars on a `--hair-2` track in ink, the one being talked about in pencil, label left in `--ink-2`, number right in tabular figures. Only numbers a script produced (`wc -l`, the width list in `shoot.mjs`, the LUFS line from `video.mjs`), with how they were counted.

### Motion

- **Follows a measurement.** A dimension draws from its first tick to its second (`--t3`), then its number fades in (`--t2`); nodes land in outline order, 24ms apart (29 points in 0.9s); a shot appears whole, like a render finishing. Nothing on timers or scroll.
- **Three durations, one curve.** `--t1` 120ms hover and color, `--t2` 200ms appear and node, `--t3` 320ms draw and layout; `cubic-bezier(.2, .7, .2, 1)`. Exits are half an entrance.
- **Only on real events.** The specimen measures the hero on load and on resize, and those are the only times its lines redraw. `prefers-reduced-motion` skips all of it and shows the measured state.

### Video

Same system on a 1920×1080 paper stage, one clock. The video agent builds from this section and `~/.agents/skills/brand-it/video.md`; the closest kit is commonplace's (`~/Developer/commonplace-site/video`), scenes as data with a pure `seek(t)`.

**Contract.** `window.END = 37`, `window.seek(t)` pure, no running animations or timers while rendering, fonts from `brand/fonts/`, `window.soundtrack()` built from the same cue list. Render with `bun ~/.agents/skills/brand-it/scripts/video.mjs video/ video`.

**Look.** Paper stage, `--ink` text, pencil lines at 2px (1px shimmers after X re-encodes). Rails in Mona Sans Mono at 28px: wordmark top-left (`logo/brand-it.svg`), tagline top-right (`brand a project from its own parts`), scene count bottom-left (`03 / 07`), URL bottom-right (`github.com/AVGVSTVS96/brand-it`). Captions in Mona Sans 600 at 64px, centered, burned in. Anything read is at least 58px; CLI lines can drop to 28px. The first frame is composed: the rails and the typed prompt line. One pencil object per scene. Shots of hex and commonplace are the real renders in `examples/`, inside ink frames with their labels.

**Storyboard.** 37 seconds, seven scenes, hard cuts on half seconds at 120 BPM in C major, no crossfades.

| t | scene | on screen | caption | why |
| --- | --- | --- | --- | --- |
| 0.0 – 3.0 | the ask | an agent prompt, typed at 45ms a character: `brand it` | Say brand it. | the name is the command; open on the point |
| 3.0 – 8.5 | the parts | a README line, a CLI line, a glyph outline, each with a callout, settling into one row | A brand grown from the product's own parts. | the thesis |
| 8.5 – 15.0 | the mark | the b's outline draws, 29 nodes land in order, the glyph fills ink, a dimension measures it | Marks from real font outlines. | the magic underneath; the one big sound |
| 15.0 – 21.0 | the check | frames step from 320 to 1920, light then dark, then `shoot.mjs` prints its last line | Shot at 45 widths, light and dark. | it checks its own work |
| 21.0 – 29.0 | each one its own look | hex and commonplace in frames, side by side, their names as labels | Each one its own look. | the proof: the loud one and the quiet one |
| 29.0 – 33.0 | introducing | the lockup lands with its dimension, held | brand-it | the reveal, held half a second longer than feels needed |
| 33.0 – 37.0 | install | `npx skills add AVGVSTVS96/brand-it` typed; the last frame is complete | brand a project from its own parts | the one ask; a poster frame |

**Motion.** Springs without bounce (Motion's, baked to `linear()`), entrances 0.3 to 0.8s, exits faster. Dimensions draw tick to tick; nodes pop in outline order; typed text lands like real output. Every frame complete: rails on every frame, frames never missing a side mid-animation. No breathing, no drifting pans.

**Sound.** Six cues, all in C: typing ticks under the two typed lines (about .35), one tone when the b fills ink (1, the big moment), a quiet tap when the width sweep stops (.5), a tap for the introducing card (.5), and an end chord that rings out. Music: 120 BPM, "high energy and crafty and elegant and simple and sleek and crisp", something changes every 4 bars, stops down before scene 6. No gong, no big low hits. Mastered by `video.mjs` to −14 LUFS; report the numbers, since nobody here can listen.

**Process.** Storyboard above, then stills at every cut (0.1s before, 0.2s after), a contact sheet every 2s, one mp4 at one path refreshed for peeks, then a fresh subagent told to roast it with timecodes. Commit the pipeline with a README.

## Logo

`logo/brand-it.svg` (light), `logo/brand-it-dark.svg`, `logo/brand-it-mono.svg` (`currentColor`, for inline use), `logo/brand-it-lockup.svg` and `-dark` (the wordmark with the b's nodes, display sizes only), `logo/mark.svg` and `-dark` (the b with nodes on a tile, for the README and OG), `logo/mark-mono.svg`, `logo/icon.svg` and `-dark` (the plain b on a tile, for 180 and 512), `logo/favicon.svg` (follows the system theme). `bun logo/gen.mjs` regenerates all of them from the two static cuts in `logo/ttf/`; `bun logo/png.mjs` renders the PNG set into `logo/png/`: `brand-it@2x.png`, `brand-it-dark@2x.png`, `brand-it-lockup@2x.png`, `brand-it-lockup-dark@2x.png` (2000px wide, transparent), `mark-512.png`, `mark-dark-512.png`, `icon-512.png`, `icon-dark-512.png`, `apple-touch-icon-180.png` (full bleed), `favicon-32.png`, `favicon-16.png`.

Three directions were drawn (`logo/explore-*.svg`, shown and argued in `specimen.html`):

- **A, nodes (the pick).** The wordmark in Mona Sans 600, and the first letter shown the way gen.mjs sees it: 29 on-curve points in pencil. It is the mechanism (marks from real outlines) drawn once, it says what a brand here is (the finished thing with its construction still on), and below 48px the points drop out and it's a plain b, which is the pencil's whole idea.
- **B, seam.** Light and dark in one square, the b crossing the seam; "it" knocked out of an ink block in the lockup. The boldest icon of the three. Not picked: at 32px and under the b reads as a glitch, the lockup reads like a Pro badge, and the seam is a fact about every brand made this way, not this one.
- **C, dimension.** The wordmark measured, with its width. Not picked as the mark because the dimension is the motif the whole system uses on everything else; as a logo it would measure nothing but itself. It lives on in the OG image and the README header, where the number is real.

Clear space: one b-height on every side. Minimum height 14px for the wordmark, 16px for the icon. The lockup with nodes is for display sizes only (hero, OG image, README header); everywhere else the plain wordmark. Never recolor the nodes to anything but `--pencil` (or `currentColor` in the mono file). Never set the name in anything but lowercase.

**Assets for the site agent.** The OG image (1200×630) is the lockup on paper with a dimension line under it that reads `1200`, the tagline in `--ink-2`, nothing in the bottom fifth; `twitter:card` is `summary_large_image`. The README header is the same at 2x for the 838px column, light and dark through `<picture>`, its dimension reading `838`. The favicon is `logo/favicon.svg`; `apple-touch-icon.png` and `icon-512.png` are the plain b on the tile, full bleed. Those numbers are real only if the file is that wide, so render them from HTML at those sizes with `shoot.mjs`.

## Files

```
brand/
├ BRAND.md             this
├ references.md        what from his own saves this is built on, and what was left out
├ specimen.html        the system in use: hero, type, color, parts, examples, logo, motion, video
├ fonts-compare.html   the real page set in each type candidate (reads the full TTFs from .scratch/)
├ fonts/               Mona Sans and Mona Sans Mono subsets, OFL alongside
├ logo/                gen.mjs, png.mjs, the static cuts in ttf/, every SVG, png/ when rendered
├ examples/            hex and commonplace: official wordmarks and icons, live renders at 1035 (bun examples/shoot.mjs)
└ shots/               specimen at 390@2x, 1035 and 1440 in light and dark (the skill's shoot.mjs)
```
