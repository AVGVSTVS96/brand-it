# brand-it launch

The X post, two alternates, and the launch video in beats. The post is in Bassim's own voice: lowercase, plain hyphens, numbers over adjectives, link in the first reply so the post itself gets the reach. Media on the post is the launch video; the fallback is the three sites side by side in light. Every draft went through delvish.

## The post

```
i wrote brand-it, a skill for coding agents that brands a project from its own parts: name, wordmark, palette, type, site, link preview, readme header, launch post and launch video, all as code

> every mark is drawn from real font outlines by a script, so any asset rebuilds in one command
> the site gets shot at 45 widths in light and dark before anyone calls it done
> the launch video is an html page on one clock: frames from headless chrome, sound from the same clock, -14 lufs

every rule is something i actually said to an agent while making hex and commonplace, or a mistake one kept making. "no em dashes" alone came up 40+ times

link in replies
```

First reply:

```
github.com/AVGVSTVS96/brand-it

npx skills add AVGVSTVS96/brand-it, then open a project in claude code and say "brand it". it points at my own projects and saves, so read it as a worked method or fork it and point it at yours
```

Second reply, optional: the hex and commonplace sites side by side, one line: "hex and commonplace. same method, nothing alike"

## Alternate A: the examples first

```
hex and commonplace look nothing alike. they were made the same way, and now that way is a skill

brand-it: say "brand it" and your agent makes the name, wordmark, palette, type, site, link preview, readme header, launch post and launch video, as code, from the product's own parts

99 lines of rules i actually said to agents, plus two scripts: one shoots the site at 45 widths in light and dark, one renders the video and prints the loudness numbers

link in replies
```

*(Media: the two sites side by side, then the brand-it page. The first line only works if the picture is right there.)*

## Alternate B: the mechanism first

```
a launch video as a web page: every scene is html in the brand's own fonts and tokens, window.seek(t) is a pure function of time, headless chrome shoots it at 60 fps, and the soundtrack renders from the same cue list, so picture and sound can't drift

that's one part of brand-it, a skill that brands a project from its own parts: name, wordmark, palette, type, site, link preview, readme header, launch post and the video, all as code

hex and commonplace were made this way. the skill is 99 lines plus two scripts

link in replies
```

*(Media: the launch video itself, since the post is about how it was made.)*

## Launch video, about 40 seconds

Same look as the site, at 1920×1080, with the rails from `video.md`: wordmark top-left, tagline top-right, scene count bottom-left, URL bottom-right. No voiceover. Captions burned in, at least 58 px; CLI text at least 28 px. Hard cuts on half seconds, elements stagger by 0.5 s, every scene holds after its last element lands. Bassim's cap is 45 s at the very most; this runs 41.5 s, and the video agent may trim beats 09 and 11 by half a second each if the holds feel long.

The hex and commonplace frames are real shots of the live sites, taken with `shoot.mjs`, never redrawn. brand-it's own mark, tokens and `logo/gen.mjs` come from `brand/` once the brand agent lands them.

| # | t (s) | scene | on screen | caption | why |
| --- | --- | --- | --- | --- | --- |
| 01 | 0.0 to 2.5 | hex | hex's live hero fills the frame, light, inside the rails. This is the poster frame, so it's composed. | hex | the proof first, and a real brand as frame 0 |
| 02 | 2.5 to 5.0 | commonplace | commonplace's live hero fills the frame, light. Hard cut. | commonplace | the second look |
| 03 | 5.0 to 8.0 | both | the two heroes side by side, half the frame each, a 2 px rule between them. | Nothing alike. Made the same way. | the point, stated once |
| 04 | 8.0 to 10.0 | introducing | the "Introducing" card, held. The music stops down under it. | none | the hex lesson: a card before the name, with room |
| 05 | 10.0 to 13.5 | name | the wordmark lands on the beat; the tagline lands 0.5 s later: brand a project from its own parts. The one big cue. | none, the tagline is the caption | the name, with time to sit |
| 06 | 13.5 to 19.0 | from the parts | a terminal: `$ bun brand/logo/gen.mjs` types at 45 ms a character, then whatever brand-it's `gen.mjs` really prints. Beside it the brand-it mark draws itself as an SVG path from the font's outlines, stroke first, then fill. | The mark is drawn from the product's own parts. | the magic underneath: a mark is code from a font's outlines |
| 07 | 19.0 to 24.5 | all code | the file tree from `SITE.md` lands one line per half second: `BRAND.md`, `specimen.html`, `logo/gen.mjs`, `MESSAGING.md`, `site/`, `og.png`, `favicon.svg`, `video/`. | All of it is code. Any asset rebuilds in one command. | what you get |
| 08 | 24.5 to 30.5 | checks | the terminal from `SITE.md`: `$ bun shoot.mjs site/ shots/` types, widths tick by in the muted ink (320, 360, 390 … 1920, light then dark), one problem line lands in the accent, then `2 problems · shots in shots/ at 390@2x, 1035, 1440`. A tap on the problem line. | 45 widths, light and dark, before it says done. | the edge: it checks its own work |
| 09 | 30.5 to 35.0 | the rules | four lines of `SKILL.md` as they are in the file, one per beat: "Minimal, but never flat." / "Distinctive beats safe." / "No em dashes anywhere." / "Finishing isn't redesigning." | Every rule is something one person said to an agent. | where the taste comes from |
| 10 | 35.0 to 38.5 | install | `npx skills add AVGVSTVS96/brand-it` types, then a prompt line: `> brand it`, return. A tap on return. | Then say brand it. | the ask |
| 11 | 38.5 to 41.5 | end | the wordmark, the tagline, github.com/AVGVSTVS96/brand-it, "by bassim" bottom-right. The end button rings out past the last frame. | none | the button |

**Sound.** Music in C major at 120 BPM, the kind Bassim asked for on hex: "high energy and crafty and elegant and simple and sleek and crisp." Change something every 4 bars, stop down under beat 04, drop on beat 05. Five cues in 41 s, tiered: the wordmark landing at volume 1 (05), a whoosh at about .35 for the side by side (03), a tap at about .5 when the problem line lands (08), a tap at about .5 on return (10), the end button (11). Nothing on the file tree or the rules; they land on the music. No low hits. Each cue sits on its element, panned to where it is, in one shared room. Mastered with `video.mjs`: report LUFS and true peak after AAC, a spectrogram, and cue onsets against the picture times, since nobody here can listen.

**Checks before sending.** Stills at 0, 5, 10, 13.5, 19, 24.5, 30.5, 35 and 38.5; a pair around every cut (0.1 s before, 0.2 s after); a contact sheet every 2 s. Every held frame complete: rails, rules, nothing mid-animation. Then the mp4 and the sheet go to a fresh subagent told to roast it, ranked, with timecodes.

**Formats.** 1920×1080 at 60 fps for the post. A 1080×1350 cut with `--size` is optional; it takes more feed height on phones but every two-column beat (03) has to be restacked for it, so only if there's time.
