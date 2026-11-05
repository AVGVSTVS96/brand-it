import { readFileSync, writeFileSync } from "node:fs"

const here = import.meta.dirname
const read = name => readFileSync(`${here}/../brand/logo/${name}`, "utf8")

const lockup = read("brand-it-lockup.svg")
const wordmark = lockup.match(/<path fill="#0F1113" d="([^"]+)"/)[1]
const nodes = [...lockup.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)"/g)].map(([, x, y, s]) => [+x + +s / 2, +y + +s / 2])
const b = read("mark-mono.svg").match(/<path fill="currentColor" d="([^"]+)"/)[1]

writeFileSync(
  `${here}/brand-it/parts.js`,
  `// made by parts.mjs from brand/logo: the wordmark and the b as gen.mjs drew them, and the b's on-curve points in outline order
export const wordmark = ${JSON.stringify(wordmark)}
export const b = ${JSON.stringify(b)}
export const nodes = ${JSON.stringify(nodes.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]))}
`,
)
console.log(`parts.js: wordmark ${wordmark.length} chars, b ${b.length} chars, ${nodes.length} nodes`)
