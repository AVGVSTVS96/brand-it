import { readFileSync, writeFileSync } from "node:fs";

const here = import.meta.dirname;
const read = (name: string) => readFileSync(`${here}/../logo/${name}`, "utf-8");

const capture = (text: string, pattern: RegExp) => {
  const value = pattern.exec(text)?.groups?.value;

  if (value === undefined) {
    throw new Error(`${pattern.source} not found`);
  }

  return value;
};

const round = (n: number) => Number(n.toFixed(2));

const lockup = read("brand-it-lockup.svg");
const wordmark = capture(lockup, /<path fill="#0F1113" d="(?<value>[^"]+)"/u);

const nodes = [
  ...lockup.matchAll(/<rect x="(?<x>[-\d.]+)" y="(?<y>[-\d.]+)" width="(?<size>[\d.]+)"/gu),
].map(({ groups }) => {
  const half = Number(groups?.size) / 2;

  return [round(Number(groups?.x) + half), round(Number(groups?.y) + half)] as const;
});

const b = capture(read("mark-mono.svg"), /<path fill="currentColor" d="(?<value>[^"]+)"/u);

writeFileSync(
  `${here}/brand-it/parts.ts`,
  `export const wordmark =
  ${JSON.stringify(wordmark)};

export const b =
  ${JSON.stringify(b)};

export const nodes = [
${nodes.map(([x, y]) => `  [${x}, ${y}],`).join("\n")}
] as const;
`,
);

console.log(
  `parts.ts: wordmark ${wordmark.length} chars, b ${b.length} chars, ${nodes.length} nodes`,
);
