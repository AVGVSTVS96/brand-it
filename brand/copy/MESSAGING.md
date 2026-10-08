# brand-it messaging

The source of truth for how we talk about brand-it. The site, README, launch post and video all draw from here. When something here and something there disagree, fix it here first.

The product is a text file about taste, so every line of copy has to pass the skill's own Words section. If a sentence here would get cut from a page brand-it made, cut it here.

## The idea in one sentence

brand-it is a skill for coding agents that takes a project from a name to a wordmark, palette, type, site, link preview, README header, launch post and launch video, all built as code from the product's own parts, the way hex and commonplace were made.

Shorter, for a bio or a card: say "brand it".

On the page, under "Say brand it.", the short form: **A skill for coding agents that takes a project from its name to its launch video, all as code.** The hero is the shortest part, so the nine deliverables are never listed there; they appear once each in the meta description and the README.

## Tagline

**brand a project from its own parts**

It's the skill's own phrase ("built as code from the product's own parts" is in the description, the README and the GitHub blurb), and it says the one thing that separates it from a theme. Lowercase next to the wordmark; sentence case in prose.

Runners-up, in order:

1. **Say brand it.** The name is the command: the skill triggers when you ask an agent to "brand it". Use it as the hero line and the install line. Never as the tagline, since it says nothing on its own.
2. **All of it is code.** The mechanism line. Marks from font outlines, the link preview from HTML, the video from HTML on one clock. Good as a section title.
3. **Each one its own look.** The examples line. hex and commonplace share a method, not a look.

## The story

Three moves, in this order.

**1. The rules come from making real things.**
hex and commonplace were branded by agents, under one person's eye, in days. Every rule in the skill is something he actually said to an agent while that happened, or a mistake an agent kept making. The research behind it read about a year of his prompts; "no em dashes" alone came up more than 40 times. brand-it is that, written down once, 99 lines.

**2. A brand is grown from the product, and all of it is code.**
commonplace's mark is its CLI cursor. hex's site shows the real Telegram, Discord and Buzz. Nothing is picked from a preset. Every asset is made by a script from the product's own parts: marks drawn from real font outlines, the link preview rendered from HTML, the launch video an HTML page on one clock with sound built from the same clock. Any of it rebuilds in one command.

**3. It checks its own work before it says done.**
The page is shot at 45 widths in light and dark and anything that overflows is flagged. The video prints its loudness and true peak after encoding. A fresh agent gets the screenshots and is told to find problems, ranked. On hex that found seven real bugs.

Then the honest line, always: the skill points at Bassim's own projects and saves, so read it as a worked method, or fork it and point it at yours.

## What it is

- **A skill.** One `SKILL.md` (99 lines), two short companions (`video.md`, `refs.md`) and two scripts, installed next to your other skills with `npx skills add AVGVSTVS96/brand-it`. An agent reads it when you say "brand it".
- **A method with a bar.** Nine steps from brief to launch, a Words section, a Fidelity section and a checklist to run before saying done. The bar is in Bassim's words: "2026 october standards of design, minimal, clean, crafted, designer, and design engineered."
- **One person's taste, verbatim.** The rules are quotes and the mistakes behind them, not adjectives. They name what never ships: gradients, glows, glass on the page, fake shadows, pills and callouts nobody needs, emoji, bento grids, the 2026 "tasteful AI" defaults.
- **Assets as code.** `logo/gen.mjs` draws three marks from real font outlines with opentype.js. `shoot.mjs` renders the OG image and icons from HTML. `video.mjs` renders any page that implements `window.seek(t)` into a BT.709 mp4 and masters its soundtrack to -14 LUFS.

## What it isn't

- **Not a theme, a UI kit or a palette.** There are no presets. Every project gets its own look; the previous one sets the craft bar, never the style. hex is cream, ink and three accents with hard shadows. commonplace is paper, mono and one red. They share nothing but the method.
- **Not a logo generator.** No image model. Marks are SVG paths drawn from a real font's outlines, checked at 16 px and next to their neighbours.
- **Not a site template.** Each site is a static page built from that brand's own tokens, with real UIs rebuilt from real screenshots.
- **Not a video editor.** It renders HTML pages that implement `seek(t)`. No timeline app, no Remotion.
- **Not a drop-in for everyone.** It points at Bassim's project folders and his saved references. Say so plainly: a worked method to read, or a fork to point at your own.

## Voice

Write like the README: short sentences, real numbers, what works and what doesn't. A craftsman talking, not an ad. The copy for a taste skill is the first thing people will judge it by.

**Do**
- Say what happened. "The site was live under two hours after the name." "On hex that found seven real bugs."
- Use the real names of things: `SKILL.md`, `shoot.mjs`, `video.mjs`, `window.seek(t)`, `BRAND.md`, `specimen.html`, `logo/gen.mjs`.
- Count with a script and say how. 99 lines is `wc -l SKILL.md`. 45 widths is what `shoot.mjs` loads. Round ours down when the count is rough ("more than 40", not 44).
- Keep Bassim's words verbatim when quoting the bar, and mark them as quotes.
- One headline, one short line, one visual per section. The hero is the shortest part.
- Lowercase brand-it always, even at the start of a sentence. Lowercase hex and commonplace too. The launch post is all lowercase.

**Don't**
- No em dashes anywhere. Reword, don't swap in a comma.
- Never: supercharge, seamless, effortless, blazing, powerful, magical, revolutionary, unlock, unleash, AI-native, AI-powered, automatically, one-click, pixel-perfect, professional-grade, stunning, beautiful (unless inside a Bassim quote), design system, end-to-end, complete.
- Don't call it a tool, platform, engine, framework, system or generator. Call it a skill, a method, a way of working, a text file.
- No feature lists. Nobody needs "comprehensive brand guidelines". Say what the file is and what the script prints.
- No "in minutes". hex took two days, commonplace under two hours; say the real one.
- No groups of three for rhythm. The deliverable list is nine items because there are nine.
- No moral-of-the-story closers, invented origin stories or manufactured hooks. The origin is one line of fact: it came from making hex and commonplace.
- Never claim hex or commonplace were "made with brand-it". The skill came after them, from them. brand-it is the first project branded with it.
- Never show seqno. Its brand hasn't been reviewed.

**Examples**

| Don't | Do |
|---|---|
| An AI-powered design system generator for your next project. | A skill for coding agents. Say brand it. |
| Beautiful, on-brand assets in minutes. | Marks drawn from the font's outlines, the link preview from HTML, the video from HTML on one clock. Any asset rebuilds in one command. |
| Battle-tested taste, distilled into best practices. | Every rule is something one person said to an agent, or a mistake one kept making. |
| Works everywhere, for any project. | It points at my own projects and saves. Read it as a worked method, or fork it and point it at yours. |
| Pixel-perfect, fully responsive, accessible by default. | Shot at 45 widths in light and dark. Text tokens pass 4.5:1. Anything that overflows is printed. |

## Name

Always `brand-it`, lowercase, with the hyphen: the repo, the skill folder and the wordmark. Never "Brand-it", "Brand It", "brandit" or "brand_it". When it's what you say to the agent, it's two words in quotes: say "brand it". The name is the command, so the copy can lean on that once per surface, not more.

## Facts, with sources

Every claim on any surface traces to one of these. Checked Oct 8 2026 against `~/Developer/brand-it` (commit `85c627c`) and the research in `~/tmp/brand-it-research/`.

**The skill**
- Repo github.com/AVGVSTVS96/brand-it, MIT, public, created Oct 8 2026, one commit. (`gh repo view`)
- Files: `SKILL.md` 99 lines, `video.md` 76, `refs.md` 56, `scripts/lib.mjs` 61, `scripts/shoot.mjs` 70, `scripts/video.mjs` 146. Scripts total 277 lines. (`wc -l`)
- Install: `npx skills add AVGVSTVS96/brand-it`. The skills CLI installs into `~/.agents/skills/` and links it into agent folders. (README; `npx skills add --help`; `~/.agents/.skill-lock.json`)
- Triggers on "brand it", naming a project, or any brand, logo, wordmark, palette, landing page, OG image, favicon, README header, launch post or launch video ask. (SKILL.md frontmatter)
- Needs Bun, Chrome and ffmpeg. Bun installs puppeteer-core on first run. (README; `lib.mjs` imports `puppeteer-core`)
- "A brand here is a small system grown from the product's own parts. It's written down in one `BRAND.md`, shown working in one `specimen.html`, and made by scripts so any asset can be rebuilt." (SKILL.md, first line)
- Nine steps: brief; references from Bassim's saves; brand and copy in parallel; marks from real font outlines; specimen; show, don't block; site; assets; launch. (SKILL.md "How it goes")
- Marks: three directions that genuinely differ, drawn as SVG paths with opentype.js by `logo/gen.mjs`, checked at 16 px. (SKILL.md step 4)
- Site: a static Vite+ page on Vercel, deployed early. (SKILL.md step 7)
- Assets: OG image rendered from HTML, a favicon that follows the theme, the README `<picture>` header in light and dark, every logo as SVG and PNG. (SKILL.md step 8)
- The rules "come from what was actually said to agents while building those three, and from the mistakes they kept making." (README)
- "It points at those projects' folders, so read it as a worked method rather than a drop-in." (README)
- The bar, verbatim: "2026 october standards of design, minimal, clean, crafted, designer, and design engineered." "Non-cringe, non-vibe sloppy." (SKILL.md "The bar")
- The never list: gradients, glows, blur and glass on the page itself, aggressive or fake shadows, pills and callouts nobody needs, emoji, isometric or 3D, AI backgrounds, ASCII as wallpaper, bento grids, generic SaaS themes. (SKILL.md)
- Words: no em dashes; the banned-word list; numbers "round yours up and theirs down, and footnote how"; "Anything landing within the hour is shown as live." (SKILL.md "Words")
- Checks: shots read at 390, 1035 and 1440; a fresh subagent finds problems, ranked ("On hex that found seven real bugs"); every motif glyph exists in the font; text tokens pass 4.5:1; the live OG image is checked after deploy. (SKILL.md "Check before saying done")
- Sizes: OG 1200×630 with `twitter:card` set to `summary_large_image`; GitHub social preview 1280×640 under 1 MB; iMessage wants `og:image` at least 900 px wide; README column 838 px, export at 2x; `favicon.svg` with its own `prefers-color-scheme`, `apple-touch-icon.png` at 180, `icon-512.png`. (SKILL.md "Sizes", checked Oct 2026)

**shoot.mjs**
- Loads 45 widths: 320 to 1920 in 40 px steps plus 390, 1035, 1366 and 1512, in light and dark, with reduced motion. (`widths` in the script; counted with Bun)
- Flags "page scrolls sideways by Npx" and "text wider than its box: tag.class "text"", each with the schemes and widths it happened at. (`findProblems`)
- Saves full-page shots at 390 (2x), 1035 and 1440. (`shots`)
- Prints "no problems" or "N problems", then "shots in <dir>/ at 390@2x, 1035, 1440". Prints "didn't load: …" for anything that 404s.
- One-shot mode: `bun shoot.mjs page WxH[@scale] out.png [--clear]` for OG images, icons and banners; `--clear` makes the background transparent.
- Serves a local page from its repo root, its own folder and its `public/`, so `../brand/fonts` and Vite public files resolve. (`lib.mjs serve`)

**video.mjs**
- The page sets `window.END` (seconds) and `window.seek(t)`, a pure function of time. Optional `window.soundtrack()` returns `{ stem: base64 wav }`. (usage text; video.md "The contract")
- Modes: `stills <t…>`, `sheet [every]` (a contact sheet, 4 wide at 480 px), `audio`, `video [fps]`. Default 1920×1080; `--size 1080x1350` for the 4:5 cut.
- Audio: stems mixed, gain measured twice with `ebur128`, mastered to -14 LUFS with a true-peak limiter at 0.794 (under -2 dBTP) at 192 kHz, written as 32-bit float wav. Prints "soundtrack.wav: X LUFS, true peak Y dBTP".
- Video: 60 fps default, BT.709 tv range, yuv420p, libx264 preset slow, CRF 14, High profile, 4 threads; rendered in 5 s parts in a folder keyed by a hash of every served file, so a stopped render resumes and a page edit invalidates the old parts; parts joined with `-c:v copy`; AAC 320k at 48 kHz; faststart. Prints "<file>: X LUFS, true peak Y dBTP after AAC" or ", silent".
- Progress line while rendering: "Ns / ENDs".

**video.md**
- Launch videos are HTML in the brand's fonts and tokens, timed by one clock, rendered frame by frame in headless Chrome, encoded with ffmpeg, with sound built from the same clock "so picture and sound can't drift".
- Pacing: one statement per screen; hold long enough to read the caption twice; an "Introducing" card before the name, held "maybe a half a second more"; hard cuts on half seconds (120 BPM); cuts never land mid-animation.
- Look: 1920×1080, rails (wordmark top-left, tagline top-right, scene count bottom-left, URL bottom-right); anything the viewer reads at least 3% of frame width (about 58 px), dense CLI output can drop to 28 px; rules 2 px; the first frame is composed, never blank.
- Sound: music plus sparse effects, 10 to 15 cues in 90 s, tiered (1 for the big moment, about .5 for a tap, about .35 for a whoosh); one key (C major, 120 BPM); no big low hits; end on a button that rings out.
- Content: a "magic underneath" beat; burned-in captions, since X autoplays muted.
- X (checked Oct 2026): free accounts post up to 140 s and 512 MB; H.264 High, yuv420p, AAC, constant frame rate, SDR, up to 60 fps; clips under about 6 s loop.

**Where the rules come from** (`~/tmp/brand-it-research/intent.md`, `hex.md`, `commonplace.md`)
- The research read every design, copy and process prompt Bassim sent to Codex, Claude Code and pi from Sep 2025 to Oct 8 2026 (18,909 rows, about 12,000 unique prompts), plus the hex, commonplace and seqno threads and logs.
- Rough counts of distinct prompts: `ugly` 51, `slop` 37, em-dash bans 44, gradient complaints 21, `screenshot` 68, light/dark 54, mobile/widths 54. Say "more than 40" for the em dashes; the counts are rough.
- "everyone has heard most those features a thousand times." "reduce text… add more visuals. add more diagrams." "i'm a craftsman." (hex threads)

**hex** (`hex.md`; `~/Developer/hex-site`; live site checked Oct 8)
- Claude Code as your personal assistant. Site hex-sand.vercel.app, repo github.com/AVGVSTVS96/hex, MIT. Built in 6 hours at the Personal Agents Hackathon (Bassim's own README note).
- Brief Oct 4 2026 15:04: "brand logo will be a simple lowercase hex with a nice font... the website will be beautiful, stunning, 2026 october standards of design". First landing page commit 15:13. A serif version was rejected ("I don't like that serif kind of font style"), then a flat one ("it doesn't have much pop"). The poppy version at 16:17 is the one that stuck.
- Wordmark: lowercase "hex" in Archivo ExtraBold at 125% width, glyphs as paths, kerned by hand. Icon: a white "h" on blue `#2B3EFF`. Type: Archivo for headlines, Martian Mono for labels, Caveat only for his handwritten note.
- Color: cream `#F3EFE6`, ink `#0A0A0A`, blue `#2B3EFF`, yellow `#FFD23F`, pink `#FF5FA2`. Hard offset shadows with no blur; in dark mode the shadows turn blue.
- Real UIs: Telegram as it looks on iOS 26, rebuilt from his own iPhone screenshots; Discord; Buzz from Block's own screenshots and theme source. All three follow the system theme.
- OG image rendered from HTML with the site's own fonts, cache-busted `og.png?v=3`. `twitter:card` is `summary_large_image`. (live `<head>`)
- Launch video: 89 s, 13 scenes, 120 BPM in C, cuelume cues, Motion springs baked to CSS `linear()`. Rendered file `~/Developer/hex-launch/out/hex-launch.mp4`, 89.0 s. The kit is committed in the hex repo (Oct 8 09:46, "renders in 5-second parts").
- Timeline: brand and site Oct 4 to Oct 6, video Oct 6 in three rounds. Say "two days".
- A 45-width sweep and a fresh-eyes reviewer caught the hero overflowing at 1035 px (his own desktop width) and seven other real bugs. (hex.md §2; SKILL.md)

**commonplace** (`commonplace.md`; `~/Developer/commonplace-site`; live site checked Oct 8)
- your personal data kit for agents. A commonplace book for the age of agents. Site commonplace-eight-sable.vercel.app, repo github.com/AVGVSTVS96/commonplace, MIT.
- The brief, verbatim: "more of a developer/coder minimalist brutalist style, code-terminal-light-terminal vibes... really clean, minimal, data-powerful... approachable and clean, not super deep technical developer neovim."
- Brand: "a light terminal: paper, mono, one red pen." Paper `#FAF9F6`, ink `#141412`, red `#D2451E` ("this one, now"). Square corners, no shadows, 1 px hairlines. Dark is the same tokens swapped.
- Type: Ioskeley Mono (an Iosevka build in Berkeley Mono's proportions, OFL) for everything the computer says; IBM Plex Sans for everything a person says. Bassim picked the Berkeley clone over the agent's recommendation.
- Wordmark: the name in Ioskeley Mono Medium with a red block cursor exactly x-height tall, drawn from glyph outlines with opentype.js in `logo/gen.mjs`. Three directions (cursor, bookplate, rows); the cursor won because it "says CLI without drawing a window" and reduces to a 16 px favicon (`c▮`). The favicon follows the system theme.
- Timeline Oct 8 2026: naming 07:10 to 07:29; repo 07:39; brand brief 07:55; brand and copy agents in parallel from 07:57; copy done 08:02, brand 08:10; approved 08:20 ("looks perfect no need to block"); font comparison in context 08:26, Ioskeley picked 08:27; site live 08:48; approved 09:19 ("great work on the site"). Name to live site: 1 h 38 min. Say "under two hours".
- The font comparison caught that Plex Mono has no box-drawing glyphs, so the brand's own snapshot tree couldn't render in it. (commonplace.md §4)
- The video kit is committed (scenes as data, a deterministic `seek(t)`, sound from the same clock) but the mp4 was never rendered. Don't show or claim a commonplace video.

**brand-it, as a brand**
- The first project branded with the skill, by itself. Its idea line and tokens come from `brand/BRAND.md` once the brand agent lands it. The site URL and asset paths are the site agent's; the README rewrite marks them as `SITE_URL` and `.github/assets/brand-it{,-dark}.svg`.
- hex's facts strip says "name to launch video in two days": the name came Oct 4 14:47, the third video cut Oct 6 11:41.
