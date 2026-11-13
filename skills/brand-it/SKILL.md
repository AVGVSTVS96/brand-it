---
name: brand-it
description: Bassim's way of branding a project, from the name to the wordmark, palette, type, site, link preview, README header, launch post and launch video, each project its own look, drawn from real references and built as code. Use when naming a project, or making or extending a brand, logo, wordmark, palette, landing page, OG image, favicon, README header, launch post or launch video for one of Bassim's projects, or when asked to "brand it".
---

# brand it

A brand is a look that belongs to one product, made by someone who studied real work first. Every project gets its own: seqno's hero borrows from Buzz and is still seqno's, the portfolio is nineties Japanese tech, iikb is Swiss Helvetica, BROADCOM is Bloomberg terminal meets Vercel and Linear. What they share is how they were made, not how they look.

The bar is a page a designer would ship in 2026: minimal but thoughtful, rich where it carries something, finished in every detail. Bassim says he isn't a designer and expects you to bring the craft.

## 1. Read the product

Read the README, the code, and the real app or CLI output. Keep Bassim's words about the project as he said them; the style words in them are the brief. If he named a style or a reference for this project, that wins over anything here.

Names are lowercase. Search for collisions before falling for one.

## 2. Find the references

The looks Bassim loves all came from real references; the ones he calls generic had none. His X saves are the source (`refs.md` shows how to pull them):

1. Pull 20 to 40 candidates from his inspiration and project folders, plus real sites of products like this one.
2. Put them on one HTML board with the images, so he and you can see them together. The model is the BROADCOM board, `~/Developer/pages/pages/broadcom-inspiration.html`.
3. Pick one or two to study closely: their grid, type, color, how they show the product. Write `references.md` with what each direction takes and from where.

Evoke a reference, don't clone it. Credit a direct inspiration in the README.

## 3. Directions

Two or three directions, each a whole first screen and one section below it, built in HTML with the product's real UI or output in it. They should differ at a glance in layout, type and motif, not just color ("these are just color palettes, not an actual like full design direction"). Draw each from a named reference on the board.

Make one a more creative take than the safe pick. Rank them blind with `crit` before sending. Show them to him as screenshots side by side, light and dark, with your pick and why, then keep building whatever doesn't depend on the answer.

## 4. The system

Once a direction is picked, write it down in `BRAND.md` and show it in `specimen.html`: tokens, type scale, the mark, motion, and the product's real screenshots in both themes.

- **Marks** are SVG paths drawn from real font outlines by a `logo/gen.mjs` (opentype.js), checked at 16px.
- **Type and color:** one small set of sizes, weights and colors, used the same way everywhere, with a clear hierarchy. Color has a job; visualizations can be rich and colorful. Set the real page in each font candidate before choosing.
- **Dark mode** is designed against what sits on it: the product's own dark screenshots set the field, then the tokens swap with the system theme. When `shoot.ts` says colors fight, move the field to the product's hue a step darker, or toward neutral. A light brand color darkened turns brown; keep it light.

## 5. Site

Write the section list first: what each section shows and the visual that carries it. Each section gets a layout of its own, so the page reads as designed all the way down, not just in the hero, and every section draws from the references like the hero does. Show the visual instead of explaining it: real UIs rebuilt from current screenshots, data in its real shape, motion that follows state. Other brands' logos are their official SVGs.

A static Vite+ page on Vercel (`bunx vercel@latest`, logged in on the server and the Mac). Deploy early, then polish.

## 6. Words

Copy gets its own agent, working in `copy/` beside `brand/`. Run it through the `clean-copy` skill.

- Short. The hero is the name or one line, plus one sentence of about 15 words. A section is a headline, a line and a visual.
- Say what the product does and what's true about it; lead with what's different. Bassim writes like a craftsman, not an ad, and uses no em dashes.
- Every claim is checked against the code, and nothing gets drawn that the product doesn't do. Numbers come from a script that counts them into `copy/facts.json`, which the site, README, OG image and video all read.
- His personal data stays off public pages unless he says yes.

## 7. Assets and launch

The OG image and a short silent OG video, both rendered from HTML, a favicon that follows the theme, a README `<picture>` header in light and dark, the logo as SVG and PNG. Each asset's source sits beside its output. Then the X post and the launch video (`video.md`).

## Check

```sh
s=~/.agents/skills/brand-it/scripts
export TMPDIR=$PWD/.scratch                      # the server's /tmp is RAM
bun $s/shoot.ts site/ shots/                    # 320 to 1920px, light and dark: overflow, wrapped URLs, colors that fight, plus 1:1 tiles
bun $s/shoot.ts site/og.html 1200x630 og.png    # exact renders: OG image, icons (--clear for transparent)
```

- Read the tiles yourself at 1035 and 390, both themes, top to bottom. Bassim browses at 1035, often in dark. A full-page shot reaches you shrunk and hides the small stuff.
- Run `crit` on the page; where it replaces one, it should win the blind compare.
- After deploying, check the live OG image (bump `?v=`, X and iMessage cache by URL) and the README header in both themes.
- iOS: `xcrun simctl openurl booted <url>` and a Simulator screenshot on the Mac before calling a phone fix done.
- Fix the bugs you find. Changing the look (colors, type, hiding the wordmark) waits for his yes.

## Working with Bassim

- Send screenshots the moment there's something to see, at one stable preview path.
- A small note means a small change. Finishing isn't redesigning.
- Decide the small things yourself, and bring him real choices with your pick.
- Render headless; on the server, one render at a time.
- Commits are signed, Conventional Commits (`feat(brand): …`, `fix(site): …`).

## Sizes (checked Oct 2026)

- **OG image:** 1200×630 PNG with `og:image:width`, `height` and `alt`, and `twitter:card` `summary_large_image`. X lays the title over the bottom fifth; the type has to read at 400px wide.
- **OG video:** 1200×630 H.264 mp4, a few seconds, silent, with `og:video`, `og:video:type`, `width` and `height` beside the image tags.
- **GitHub social preview:** 1280×640, under 1 MB, set in the repo's settings.
- **iMessage** wants `og:image` at least 900px wide.
- **README header:** the column is 838px, so export at 2x, with a `prefers-color-scheme: dark` `<source>`.
- **Icons:** `favicon.svg` with its own `prefers-color-scheme` style, `apple-touch-icon.png` at 180 (full bleed, opaque) and `icon-512.png`. Check at 16, 32 and 48.
