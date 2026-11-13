# refs

What Bassim has saved, and how to find more. Those saves beat your defaults: "there's so much amazing gold in my x mind, especially my inspiration."

## Pull from the saves

On the Mac (`ssh mac` from the server), through the `commonplace` CLI of the archive in `~/Developer/personal/commonplace`.

```sh
# X bookmark folders and other saved collections: inspiration, cool projects, Workflow Tips, CSS Tips, prompts, Design Engineers, designers, webDev Inspiration (Raindrop)
commonplace sql "select t.author, substr(replace(t.text, char(10), ' '), 1, 120) as text, t.url
  from events e join things t on t.id = e.thing_id, json_each(e.collections) c
  where e.verb = 'saved' and c.value = 'inspiration'"

# likes and everything else, full text
commonplace search "wordmark OR typeface" --limit 40
```

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

Each project its own; these are the range, not a style to copy.

- **seqno's hero:** after Buzz's hero, still its own. Below the hero the page had no reference and shows it.
- **His portfolio:** nineties Japanese tech.
- **BROADCOM:** Bloomberg terminal x Vercel x Linear, built from an inspiration board of his saves. His bar for dashboards and hex's own pages.
- **iikb:** Swiss, Helvetica, lowercase.
- **Vercel and Linear** where he asks for clean and modern, with richer visuals and a bit more color.
- **Apple and iOS** for apps and phone pages.
- **Grid-line sites** like voidzero.dev and greptile: "this new style of minimal grid style design language."
- **References he has sent agents to:** factory.ai's site, Logseq's 2021 site, buzz.xyz's hero, Linear.

The hex site's neo-brutalism was a 20-minute hackathon page, and he calls it basic.

## Launch films and brand systems

X has no launch or OG folder; these sit in inspiration, cool projects and Workflow Tips, mostly as video or image with a one-line caption, so open the media.

- **@LexnLin's cinetic** (launch films in Remotion) and **earshot** (sound effects made in code, timed to the frame). `~/Developer/films` has three films made with them.
- **@kyleanthony's** brand systems: Synthetic, American Turbines, Pan Am, "Neo Industrial ... Swiss design and technical spec sheets".
- **@keilethh**, ZeroNode and "UI Rules": a whole system grown from one reference image.
- **@miralizain**, a brand system around physical artifacts; **@BrettFromDJ**, 14 variations of one logo.
- **@shadcn**, skills that write a DESIGN.md (tokens, type scale, elevation) an agent can follow.
- **@ctatedev's webreel**, scripted screen recordings with a real cursor, for product shots in a video.

## People

@kyleanthony, @Jakubantalik, @emilkowalski, @dwhitedesign, @jh3yy, @JohnPhamous, @jakubkrehel, @_heyrico, @sheherenow_, @MSchwaibold, @meodai, @raunofreiberg, @micka_design. When a problem is hard: "see what design engineers like emil, rauchg, rauno, evil rabbit, shadcn, etc say and do."

## Skills Bassim calls by name

`emil-design-eng` for motion and polish, `apple-design`, `animation-vocabulary`, `review-animations` and `improve-animations`. Use them for the motion pass on sites and videos.
