# references

What the brand-it system is built on, pulled from Bassim's own X bookmarks and likes (`me.db` and the `inspiration`, `cool projects` and `CSS Tips` folders, synced through Sep 24 2026) and Raindrop (through Sep 17 2026), read on Oct 8 2026. commonplace and seqno already mined these saves; their lists are not repeated, only what brand-it takes. Two were studied properly, the rest add one line each.

## Studied

1. **"Spec sheet style design"**, @kyleanthony. https://x.com/kyleanthony/status/2019050942948159843. Looked at frame by frame: a part drawing with a pencil dot on each component, a horizontal leader, a label and a two-line caption; a spec table with a filled head; a serial number in the corner. Taken: the callout (dot, leader, label after the line), the frame-and-label habit, the idea that a brand page can be a drawing of the thing with its parts named. Not taken: the tracked all-caps mono labels (a tell on the skill's own list), the orange field, the 3D render.
2. **"a green blueprint"**, @stylessh. https://x.com/stylessh/status/2056509725915623818. A heading on a grid with a measured bracket drawn under the real element and a label inside it. Taken: the dimension as a bracket under the real thing, with the number knocked out of the line; that became motif 1 and the hero. Not taken: the dark green, the grid wallpaper, the uppercase.

## From his saved posts and bookmarks

3. **"Neo Industrial design is the perfect collision of Swiss design and technical spec sheets"**, @kyleanthony. https://x.com/kyleanthony/status/2093309881893724669. Why a workbench can be a brand: restraint plus labels. commonplace took the ledger from it; brand-it takes the drawing.
4. **"this css-only annotation library is so cool and elegant"**, @vivitseng_ on Maxim Syabro's neat-annotations. https://x.com/vivitseng_/status/2097744577465929822 · https://neat-annotations.syabro.com/. An annotation is wrapped around the real inline element and drawn by CSS, so it can never drift from what it points at. The specimen's dimensions and callouts are positioned from `getBoundingClientRect` for the same reason. Not taken: the hand-drawn arrows and handwriting; hex already has the handwritten note, and brand-it is drafting, not sketching.
5. **"an interactive wireframe reveal animation for each component"**, @wheresryan22, and the reply he saved: "the blueprint/spec-sheet preview is way more interesting than the usual docs experience" (@armondme). https://x.com/wheresryan22/status/2096184499016999199 · https://x.com/armondme/status/2096230574457561423. The construction under the finished thing is what people want to see. The mark (the b with its nodes) and the hero (the wordmark with its dimensions) are that, held still.
6. **Linear, "Output isn't design"**. https://linear.app/now/output-isn-t-design. Forces first: who it's for (agents and the people who brief them), where it shows up (a README, a skills list, one page, one post), what it must say (grown from the product, all of it code, it checks itself). The brand came from that list, not from a mood board.
7. **"bespoke brand design tools are a great use case for building your own tools"**, @kazdenc. https://x.com/kazdenc/status/2099603500220973096. `logo/gen.mjs` draws every mark from the font's outlines; `logo/png.mjs` renders the set; the hero measures itself. Knobs, not files.
8. **@oliverhamrin on Jacqueline Casey**: "Take a simple idea and take it seriously." https://x.com/oliverhamrin/status/2091117071308370089. One idea here: the drafting layer. Everything on the page is either the thing or a line drawn to check it.
9. **"introducing mesurer, a tiny tool to measure spacing and align your UI"**, @Ibelick. https://x.com/Ibelick/status/2042508446671499405. Measuring is a design-engineer's reflex; brand-it makes the measurement the picture.
10. **US Graphics TX-24 printed specimens**, @fatih. https://x.com/fatih/status/2061033715891917088. The specimen as the brand's own artifact. `specimen.html` is the deliverable, not a side page.
11. **"Designed 14 variations of the Off Canvas logo"**, @BrettFromDJ. https://x.com/BrettFromDJ/status/2047015291558007294. Show the spread and the pick side by side. The three directions sit on the specimen at 120, 48, 32 and 16.
12. **"Another brand guidelines: UI Rules"**, @keilethh. https://x.com/keilethh/status/2040418980502835378. Guidelines carry UI rules, not just a logo page: the motifs section says how a frame, a callout and a check are drawn.
13. **An 8px base grid, "set up as tightly as possible"**, @MSchwaibold. https://x.com/MSchwaibold/status/2096306405649318139. The spacing scale.
14. **"0.5 stroke is brutally underrated"**, @_heyrico. https://x.com/_heyrico/status/1972262632611545242. Hairlines at low alpha; a solid 1px only on the subject (frames) and the measurement (pencil).
15. **@cramforce on slop tells**: "The short, punchy sentences. The relentless groups of three. The em dashes." https://x.com/cramforce/status/2099321671882834073. Checked against every label and caption here; the parts section has six items because there are six.
16. **Vercel, "Teaching agents product design"**. https://vercel.com/blog/teaching-agents-product-design-at-vercel. Move checks into scripts. The dimension numbers, the contrast ratios and the shot sweep are all script output.
17. **@dwhitedesign, cube-motion**: a launch film where every frame is drawn in JS. https://www.cube-motion.dev/. The video section's contract: the same page, one clock, frames rendered.

## Outside references that fit

- **The non-photo blue pencil.** Drafters sketched guides in a light cyan-blue because process cameras couldn't see it, so the construction vanished from the print. brand-it's pencil (`#0B74D4`, darkened until it passes 4.5:1 as text) does the same job: it draws the guides, and at small sizes they drop out.
- **Mona Sans and Mona Sans Mono**, GitHub and Degarism, OFL. https://github.com/github/mona-sans. One family with a width axis and a matching mono; the skill is installed from GitHub, which is a fair place for its type to come from.
- **Engineering drawing conventions** (dimension lines with extension lines and ticks, leader lines with a dot at the part). The vocabulary of the motifs, kept to the few marks that mean something on a web page.

## His own projects

- **hex** (`~/Developer/hex-site`): the craft bar and the live render in `examples/`. Not its look: no thick borders, offset shadows, cream or sticker colors.
- **commonplace** (`~/Developer/commonplace-site/brand`): the shape of this folder (BRAND.md headings, references.md, explorations argued in the specimen, `gen.mjs`) and the live render. Not its look: no paper tint, no mono-for-everything, no red.

## What was deliberately not taken

- The spec-sheet costume: tracked uppercase mono eyebrows, serial numbers, "REV 01" stamps, a dot grid or blueprint grid behind everything, dark green or navy fields.
- Hand-drawn annotations, arrows and handwriting (the annotation library's look, hex's Caveat note).
- A design-tool selection blue (Figma's), bezier handles drawn as a logo, a pen-tool cursor.
- Split-square light/dark marks (direction B; argued on the specimen) and theme-toggle imagery.
- Any second accent. hex and commonplace bring the color; the frame stays white, ink and pencil.
- seqno, in any form. Its brand hasn't been reviewed.
