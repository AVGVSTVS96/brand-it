# refs

What Bassim has saved, and how to find more. Those saves beat your defaults: "there's so much amazing gold in my x mind, especially my inspiration."

## Pull from the saves

On the Mac (`ssh mac` from the server). Read `~/Developer/personal/me/AGENTS.md` first; `raw/` is read-only.

```sh
# X bookmark folders: inspiration, cool projects, Workflow Tips, CSS Tips, prompts, read later
d=$(ls -d ~/Developer/personal/me/raw/xbook/2026-* | tail -1)
jq -rn --arg name inspiration \
  --slurpfile folders $d/folders/documents.jsonl --slurpfile links $d/bookmarkFolders/documents.jsonl '
  ($folders[] | select(.name == $name) | ._id) as $f
  | [$links[] | select(.folderId == $f) | .bookmarkId] as $ids
  | inputs | select(._id as $id | $ids | index($id))
  | "@\(.authorUsername)  \(.text | gsub("\n"; " ") | .[0:120])  https://x.com/\(.authorUsername)/status/\(.xTweetId)"' \
  $d/bookmarks/documents.jsonl

# likes and everything else, full text
sqlite3 -readonly ~/Developer/personal/me/me.db \
  "select id, substr(replace(text, char(10), ' '), 1, 120) from search where search match 'wordmark OR typeface' limit 40"
```

Raindrop's "webDev Inspiration" collection is in `raw/raindrop/*.csv`. The X data stops in late September, so say how fresh it is. Two brands already mined it, so start from what they took: `~/Developer/commonplace-site/brand/references.md` and `~/dev/seqno-site/brand/references.md` on the server.

## The strongest

- **Linear, "Output isn't design"** · linear.app/now/output-isn-t-design. Generating form was never the hard part; fitting it to the forces is. Start there.
- **jem, "Design is how it tastes"** · superposition.jem.computer/design-is-how-it-tastes. Go from feel to visuals to system; "the moment a design intent becomes a token, the temperature drops out of it."
- **@oliverhamrin on Jacqueline Casey** · x.com/oliverhamrin/status/2091117071308370089. "Take a simple idea and take it seriously." The brief for any mark.
- **@kyleanthony** (Brass Hands, 25 saves, the most-saved designer). Industrial, spec-sheet, utilitarian brand systems, now with motion. The Conductor post sets the bar agent work has to clear: "I'd use AI if it could hit this level of quality. Not there yet."
- **@kazdenc, brand tools in code** · x.com/kazdenc/status/2099603500220973096. Generate assets from code, then add knobs. That's why every brand here has a `gen.mjs`.
- **@dwhitedesign** · cube-motion.dev (a launch film where every frame is SVG drawn in JS), textmotion.dev (animate text without breaking kerning), cuelume (the UI sounds in the hex video).
- **@emilkowalski** · animations.dev/vocabulary. Brief motion in Emil's words: stagger, direction-aware, spatial consistency, crossfade, layout animation.
- **@Jakubantalik** · transitions.dev. Motion lives in tokens; polish means tuning them, not swapping the transition.
- **Vercel, "Teaching agents product design"** · vercel.com/blog/teaching-agents-product-design-at-vercel. Saved three times. Separate modes (shape, implement, review, copy, harden) and move every check you can into a script.
- **Design in Paper first** · @ryanvogel: "forcing models to design in paper before implementing it in code... 10x better results." Bassim works this way too: the Paper app on the Mac, whose MCP listens on 127.0.0.1:29979, so it's reachable from the Mac only.
- **Study one reference deeply** · @sts81998850: "rather than collecting 100 cases, I now prefer to pick 1 and actually do it."
- **@cramforce on slop tells** · "The relentless groups of three. The em dashes." Check site and video copy for both.

## Looks Bassim has picked

- **hex:** neo-brutalist with pop, framed by a strict ruled grid.
- **commonplace:** light-terminal brutalist-minimal; mono, red rubrics, ledger tables. Earlier, openleaf was "brutalist terminal minimalism."
- **Grid-line sites** like voidzero.dev and greptile: "this new style of minimal grid style design language."
- **Apple and iOS** for apps and phone pages (`clean-page`, the hex keyboard).
- **References Bassim has sent agents to:** factory.ai's site, Logseq's 2021 site, buzz.xyz's hero, Linear.

## People

@kyleanthony, @Jakubantalik, @emilkowalski, @dwhitedesign, @jh3yy, @JohnPhamous, @jakubkrehel, @_heyrico, @sheherenow_, @MSchwaibold, @meodai, @raunofreiberg, @micka_design. When a problem is hard: "see what design engineers like emil, rauchg, rauno, evil rabbit, shadcn, etc say and do."

## Skills Bassim calls by name

`emil-design-eng` for motion and polish, `apple-design`, `animation-vocabulary`, `review-animations` and `improve-animations`. Use them for the motion pass on sites and videos.
