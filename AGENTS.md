# brand-it

A skill for coding agents that brands a project from its own parts, with the site and brand it made for itself. MIT, public.

## Commands

- `bun run check`: oxlint (type-aware), oxfmt, `tsc` per workspace. Lefthook runs it before each commit, CI on each push.
- `bun run fix`: oxlint and oxfmt, fixing what they can.
- `bun --cwd apps/site run dev`, `run build`; `run assets` renders the OG image, icons and README headers from `brand/`.
- In `brand/`: `bun run logo`, `png`, `parts`, `sweep`, then `stills`, `sheet`, `audio`, `video` for the launch video. Set `TMPDIR` to a folder on disk; the server's `/tmp` is RAM.

## Map

| Folder            | Job                                                 | May use             |
| ----------------- | --------------------------------------------------- | ------------------- |
| `skills/brand-it` | the skill; `npx skills add` copies only this folder | puppeteer-core      |
| `apps/site`       | brand-it-seven.vercel.app (Vite, static)            | the skill's scripts |
| `brand`           | logo generator, fonts, copy, the launch video       | the skill's scripts |

## Rules

| Rule                                                                | Enforced by                                       |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| The skill runs on a user's machine with only Bun, Chrome and ffmpeg | its own `package.json`; Bun installs on first run |
| Nothing outside `skills/brand-it` ships to skill users              | the skills CLI copies that folder only            |
| Paths in scripts are repo-relative, never `~/.agents/...`           | judgment                                          |
| No personal data on the public site or in the skill without a yes   | judgment                                          |
