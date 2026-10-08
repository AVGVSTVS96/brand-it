---
name: brand-it
description: Bassim's way of branding a project, from the name to the wordmark, palette, type, site, link preview, README header, launch post and launch video, all built as code from the product's own parts. Use when naming a project, or making or extending a brand, logo, wordmark, palette, landing page, OG image, favicon, README header, launch post or launch video for one of Bassim's projects, or when asked to "brand it".
---

# brand it

A brand here is a small system grown from the product's own parts. It's written down in one `BRAND.md`, shown working in one `specimen.html`, and made by scripts so any asset can be rebuilt. Every project gets its own look. hex and commonplace, which Bassim approved, set the craft bar, not the style.

| project | the idea | where |
| --- | --- | --- |
| hex | poppy neo-brutalist: cream and ink, blue/yellow/pink blocks, hard shadows, real app UIs | `~/Developer/hex-site/site` (`style.css`, `COPY.md`) |
| commonplace | a light terminal: paper, mono, one red pen, a cursor wordmark | `~/Developer/commonplace-site/brand` |
| seqno (unreviewed) | an outliner built from its own parts: bullet, guide line, dot grid, an apricot field | `~/dev/seqno-site/brand` |

Read the closest one before you start. Copy its shape, never its look. `refs.md` has what Bassim has saved and how to find more; `video.md` covers launch videos.

## The bar

"2026 october standards of design, minimal, clean, crafted, designer, and design engineered." "Non-cringe, non-vibe sloppy."

- **Minimal, but never flat.** Every element earns its place, and a flat page is just as ugly ("doesn't have much pop, doesn't have much character"). Richness has to carry information or feel: real UIs, data in its real shape, motion that follows state.
- **Grown from the product.** commonplace's mark is the CLI cursor; seqno's is the outliner's bullet. Start with the forces (who it's for, where it shows up, what it has to say), then draw.
- **Color means something.** commonplace's one red means "this one, now"; hex runs three poppy accents. A lone accent is how hex v2 went flat.
- **Dark is the same tokens swapped**, never a second design. Everything follows the system theme.
- **Distinctive beats safe.** Agents keep recommending the safe pick, and Bassim keeps choosing the bolder one (the Berkeley Mono clone over Plex, poppy over flat). Always include the distinctive option.
- **Never:** gradients, glows, blur and glass on the page itself, aggressive or fake shadows, pills and callouts nobody needs, emoji, isometric or 3D, AI backgrounds, ASCII as wallpaper, bento grids, generic SaaS themes. Serif display type was rejected for hex.
- **The 2026 "tasteful AI" defaults are tells too:** cream with terracotta, near-black with one acid accent, a hairline broadsheet, tracked all-caps eyebrows, mono labels as costume. hex and commonplace use some of these because their idea calls for it. Never reach for them by default.

## How it goes

1. **Brief.** Read the product: README, code, and real CLI or app output. Keep Bassim's words verbatim; the style words in them are the brief. Names are lowercase, always. Search for collisions before falling for a name, and never invent what a name means.
2. **References from Bassim's saves.** Pull from the X bookmark folders and Raindrop (`refs.md`). Study one or two deeply instead of making a mood board. Write `references.md`: link, what to take, and a "deliberately not taken" list.
3. **Brand and copy in parallel.** Two agents, one repo: `brand/` and `copy/`. Copy always gets its own agent. `copy/MESSAGING.md` is the source of truth for words, and brand reads it before committing.
4. **Marks from real font outlines.** Three directions that genuinely differ, drawn as SVG paths with opentype.js by a `logo/gen.mjs`. Pick one, argue it, and say why not for the others. Check every mark at 16px and next to its neighbors.
5. **Specimen.** One page with the system in use: a hero, type scale, tokens, a ledger or diagram, the logo directions, motion. Render it, look at every shot, fix what you see. `BRAND.md` follows commonplace's headings.
6. **Show Bassim, don't block.** Send full-resolution files and the options side by side with your pick, then keep building what doesn't hang on the answer. For fonts, set the real page in each candidate, including the one Bassim admires and a free clone.
7. **Site.** A static Vite+ page on Vercel, deployed early: link first, polish after. Commit a first pass so there's something to deploy.
8. **Assets.** The OG image rendered from HTML, a favicon that follows the theme, the README `<picture>` header in light and dark, and every logo file as SVG and PNG, all delivered to Bassim. Sizes are at the bottom.
9. **Launch.** The X post, then the video (`video.md`).

## Words

- Write like the README: short sentences, real numbers, what works and what doesn't. A craftsman talking, not an ad.
- No em dashes anywhere. Reword the sentence; don't just swap in a comma.
- Less text. A section is a headline, one short line and a visual, and the hero is the shortest part: "reduce text... add more visuals."
- No feature lists ("everyone has heard most those features a thousand times"). Say what happened, and lead with the edge, not table stakes.
- Never: supercharge, seamless, effortless, blazing, powerful, magical, revolutionary, unlock, unleash, AI-native, second brain, waitlist. No moral-of-the-story closers, invented origin stories or manufactured hooks.
- Numbers are honest and still impressive: count with a script, round yours up and theirs down, and footnote how.
- Anything landing within the hour is shown as live. "Coming" is only for real future work, and don't label something coming when it's cheap to just build.
- Bassim's own words (a note, the origin story) stay verbatim.
- Every claim is checked against the code. Never invent a requirement or a feature.
- Launch copy follows `~/Developer/side-projects/x-pipeline/08-writing-style-guide.md` on the Mac. Run drafts through `~/Developer/side-projects/delvish` (`node src/cli.ts draft.txt --no-pager`).

## Fidelity

- Real UIs look like the real apps in their current version, rebuilt from real screenshots (Bassim's, or the vendor's own). Real CLI output keeps its exact shape.
- Never draw a feature the product doesn't have ("visualizations that actually don't even match the existing app").
- Examples show the product's whole breadth. Made up but realistic beats a narrow slice of real data. Bassim's real personal data never goes on a public page without a yes.
- Other brands' logos are the official SVG or the exact file you were given.
- Comparisons are like for like: same state, same content.

## Check before saying done

```sh
s=~/.agents/skills/brand-it/scripts
export TMPDIR=$PWD/.scratch                      # the server's /tmp is RAM-backed and fills up
bun $s/shoot.mjs site/ shots/                    # 320 to 1920px, light and dark: overflow and clipped text, plus shots
bun $s/shoot.mjs site/og.html 1200x630 og.png    # exact renders: og image, icons (--clear for transparent)
```

A local page is served from its repo root, its own folder and its `public/`, so `../brand/fonts`, `/style.css` and Vite's public files all resolve. Anything that fails to load is printed; if the page needs a build step, pass its dev server URL instead.

- Read the shots at 390, 1035 and 1440 yourself. Bassim browses at 1035; that's where the last hero broke.
- Then hand the shots to a fresh subagent told to find problems, ranked, each with its fix. On hex that found seven real bugs.
- Every glyph the motifs use exists in the font. Plex Mono had no box drawing, so commonplace's own tree couldn't render.
- Text tokens pass 4.5:1.
- After deploying, check the live OG image (bump `?v=`, since X and iMessage cache by URL) and the README header in both themes.
- If you can't test on the real target (Telegram's in-app Safari, an iPhone), say so instead of shipping guesses.
- Fix the bugs you notice (overflow, contrast, stale facts) instead of reporting them. Anything that changes the look still needs a yes first.

## Working with Bassim

- A small note means a small change. Feedback comes in small steps, and overcorrection gets noticed both ways.
- Finishing isn't redesigning. Never swap colors or type, or hide the wordmark, without asking.
- Decide the small things yourself. Bring only real decisions, each with your pick. A compliment isn't a decision.
- Stay visible: keep previews at one stable path and send peeks mid-work.
- Do the chore yourself instead of handing it back. If you're blocked, ship what you can and say exactly what unblocks you.
- Brief sub-agents with Bassim's words and the files, not your assumptions.
- Render headless and never open windows on the Mac. On the server, run one render at a time.
- Commits are signed, one line, prefixed `Brand:`, `Copy:`, `Site:` or `Video:`.

## Sizes (checked Oct 2026)

- **OG image:** 1200×630 PNG with `og:image:width`, `height` and `alt`, plus `twitter:card` set to `summary_large_image` (X needs it). X lays the title over the bottom fifth, so keep that clear, and the type has to read at 400px wide.
- **GitHub social preview:** 1280×640, under 1 MB, uploaded in the repo's settings.
- **iMessage** wants `og:image` at least 900px wide.
- **README header:** the column is 838px wide, so export at 2x. Use `<picture>` with a `prefers-color-scheme: dark` source.
- **Icons:** `favicon.svg` with its own `prefers-color-scheme` style, plus `apple-touch-icon.png` at 180 (full bleed, no transparency) and `icon-512.png`. Check them at 16, 32 and 48.
