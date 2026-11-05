import { b, nodes, wordmark } from "./parts.ts";

export type CueOptions = Record<string, number | string | undefined>;

export interface Cue {
  el: Element;
  name: string;
  options: CueOptions;
  t: number;
}

type ElementType<T extends Element> = new () => T;

interface Typed {
  char: number;
  el: HTMLElement;
  enter: number;
  show: number;
  start: number;
  t: HTMLElement;
  text: string;
  verb: number;
}

interface SweepStep {
  from: number;
  img: HTMLImageElement;
  scheme: string;
  width: number;
}

const { spring } = Motion;
const SVG = "http://www.w3.org/2000/svg";
const CHAR = 0.045;
const ENTER = 0.22;
const NODE = 0.024;
const SPRINGS = { draw: [0.6, 0], pop: [0.35, 0], settle: [0.5, 0] } as const;

const ofType = <T extends Element>(el: Element | null, type: ElementType<T>, what: string): T => {
  if (el instanceof type) {
    return el;
  }

  throw new Error(`${what} is missing`);
};

const byId = <T extends Element>(id: string, type: ElementType<T>) =>
  ofType(document.querySelector(`#${id}`), type, `#${id}`);

const within = <T extends Element>(root: ParentNode, selector: string, type: ElementType<T>) =>
  ofType(root.querySelector(selector), type, selector);

const enclosing = (el: Element, selector: string) =>
  ofType(el.closest(selector), HTMLElement, selector);

const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];

const stage = byId("stage", HTMLElement);
const scenes = all(".scene");
export const END = Math.max(...scenes.map((s) => Number(s.dataset.e)));
export const cues: Cue[] = [];

for (const [name, [duration, bounce]] of Object.entries(SPRINGS)) {
  stage.style.setProperty(`--${name}`, String(spring(duration, bounce)));
}

for (const s of scenes) {
  s.style.setProperty("--s", s.dataset.s ?? null);
}

const svg = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, number | string> = {},
) => {
  const el = document.createElementNS(SVG, tag);

  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }

  return el;
};

const fit = (el: Element, path: SVGGraphicsElement, pad: number) => {
  const box = path.getBBox();
  el.setAttribute(
    "viewBox",
    `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`,
  );

  return box;
};

const firstPath = (el: Element) => ofType(el.firstElementChild, SVGPathElement, "path");

const squares = (parent: Element, size: number, delay: number, cue?: string) => {
  for (const [i, [x, y]] of nodes.entries()) {
    const node = svg("rect", {
      class: "node a",
      height: size,
      width: size,
      x: x - size / 2,
      y: y - size / 2,
    });

    node.style.cssText = `--k:pop;--t:var(--pop);--d:${(delay + i * NODE).toFixed(3)}`;

    if (cue !== undefined && i === 0) {
      node.dataset.cue = cue;
    }

    parent.append(node);
  }
};

const mark = (el: Element, cls: string) => {
  el.append(svg("path", { class: cls, d: wordmark }));
};

mark(byId("rail-wm", SVGSVGElement), "ink");

mark(byId("wordmark", SVGSVGElement), "ink");

for (const id of ["rail-wm", "wordmark"]) {
  fit(byId(id, SVGSVGElement), firstPath(byId(id, SVGSVGElement)), 2);
}

const lockup = byId("lockup", SVGSVGElement);

mark(lockup, "ink");

squares(lockup, 3.4, 0.4);

fit(lockup, firstPath(lockup), 2);

const markSvg = byId("mark", SVGSVGElement);
const outline = svg("path", { class: "outline", d: b });
const ink = svg("path", { class: "ink a", d: b });

ink.style.cssText = "--k:fade;--t:.3s var(--ease);--d:3.1";

ink.dataset.cue = "ready volume=.7";

markSvg.append(outline, ink);

squares(markSvg, 2.4, 2.4, "count duration=700 volume=.3");

const box = fit(markSvg, outline, 8);

outline.style.setProperty("--len", String(outline.getTotalLength()));

outline.style.setProperty("--hair-w", String((2 * (box.height + 16)) / markSvg.clientHeight));

outline.style.animation =
  "stroke .8s var(--ease) calc((var(--s) + 1.6) * 1s) both, out .25s var(--ease) calc((var(--s) + 3.1) * 1s) both";

const printed = byId("gen-out", HTMLElement).textContent;

const parse = (cue: string) => {
  const [name = "", ...pairs] = cue.split(" ");
  const options: CueOptions = {};

  for (const pair of pairs) {
    const [key = "", value] = pair.split("=");
    const number = Number(value);
    options[key] = Number.isNaN(number) ? value : number;
  }

  return { name, options };
};

const typed: Typed[] = all("[data-type]").map((el) => {
  const scene = Number(enclosing(el, ".scene").dataset.s);
  const text = el.dataset.type ?? "";
  const char = Number(el.dataset.char ?? CHAR);
  const start = scene + Number(el.dataset.d);
  const show = el.dataset.show === undefined ? start - 0.3 : scene + Number(el.dataset.show);
  const done = start + text.length * char;
  const enter = done + Number(el.dataset.enter ?? ENTER);
  const verb = Number(el.dataset.verb ?? 0);

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== " ") {
      cues.push({
        el,
        name: "type",
        options: { emphasis: "subtle", key: "printable", volume: 0.75 },
        t: start + i * char,
      });
    }
  }

  cues.push({
    el,
    name: "type",
    options: { emphasis: "subtle", key: "enter", volume: 0.9 },
    t: enter,
  });

  if (el.dataset.cue !== undefined && el.dataset.cue !== "") {
    cues.push({ t: enter, ...parse(el.dataset.cue), el });
  }

  return { char, el, enter, show, start, t: within(el, ".t", HTMLElement), text, verb };
});

for (const el of all("[data-cue]:not([data-type])")) {
  const style = getComputedStyle(el);
  const delay = style.getPropertyValue("--d");
  cues.push({
    t: Number(style.getPropertyValue("--s")) + Number(delay === "" ? 0 : delay),
    ...parse(el.dataset.cue ?? ""),
    el,
  });
}

const sweep = byId("sweep", HTMLElement);
const sweepScene = enclosing(sweep, ".scene");
const every = Number(sweep.dataset.every);

const problems = new Set(
  (sweep.dataset.problems ?? "")
    .split(" ")
    .filter((width) => width !== "")
    .map(Number),
);

const steps: SweepStep[] = [];
let at = Number(sweepScene.dataset.s) + Number(sweep.dataset.d);

for (const scheme of ["light", "dark"]) {
  for (const step of (sweep.dataset.widths ?? "").split(" ")) {
    const [width = Number.NaN, hold = every] = step.split(":").map(Number);
    const img = document.createElement("img");
    img.src = `sweep/${scheme}-${width}.webp`;
    img.alt = "";
    within(sweep, ".shot", HTMLElement).append(img);
    steps.push({ from: at, img, scheme, width });
    at += hold;
  }
}

const sweepLabel = within(sweep, ".label", HTMLElement);
const sweepNumber = within(sweep, ".dim span", HTMLElement);
let shown = -1;

const showStep = (i: number) => {
  if (i === shown) {
    return;
  }

  steps[shown]?.img.classList.remove("on");
  shown = i;
  const step = steps[i];

  if (step === undefined) {
    return;
  }

  const { scheme, width, img } = step;
  img.classList.add("on");
  sweep.style.setProperty(
    "--w",
    `${width * Number(getComputedStyle(sweep).getPropertyValue("--scale"))}px`,
  );
  sweep.classList.toggle("problem", problems.has(width));
  sweepLabel.textContent = `brand-it · ${width} · ${scheme}`;
  sweepNumber.textContent = String(width);
};

const count = byId("count", HTMLElement);
const pad = (n: number) => String(n).padStart(2, "0");

export const seek = (t: number) => {
  for (const [i, s] of scenes.entries()) {
    const on = t >= Number(s.dataset.s) && t < Number(s.dataset.e);
    s.classList.toggle("on", on);

    if (on) {
      count.textContent = `${pad(i + 1)} / ${pad(scenes.length)}`;
    }
  }

  for (const c of typed) {
    const n =
      t < c.start ? 0 : Math.min(c.text.length, Math.floor((t - c.start) / c.char + 1e-6) + 1);

    const visible = c.text.slice(0, n);
    c.t.innerHTML =
      c.verb > 0 && n > c.verb
        ? `<b>${visible.slice(0, c.verb)}</b>${visible.slice(c.verb)}`
        : visible;
    c.el.classList.toggle("on", t >= c.show);
    c.el.classList.toggle("live", t >= c.start && t < c.enter);
  }

  showStep(
    Math.max(
      0,
      steps.findLastIndex((step) => t >= step.from - 1e-6),
    ),
  );

  for (const animation of document.getAnimations()) {
    animation.pause();
    animation.currentTime = t * 1000;
  }
};

const measured = (pattern: RegExp) => pattern.exec(printed)?.groups?.value ?? "";

const measure = () => {
  seek(13);
  const name = byId("name-dim", HTMLElement);
  const frame = enclosing(name, ".frame").getBoundingClientRect();
  const r = firstPath(lockup).getBoundingClientRect();
  name.style.setProperty("--x", `${r.left - frame.left}px`);
  name.style.setProperty("--w", `${r.width}px`);
  name.style.setProperty("--y", `${r.bottom - frame.top + 28}px`);
  within(name, "span", HTMLElement).textContent = measured(/wordmark: \{\s*w: (?<value>[\d.]+)/u);

  seek(19);
  const dim = byId("mark-dim", HTMLElement);
  const fig = byId("mark-fig", Element).getBoundingClientRect();
  const g = ink.getBoundingClientRect();
  dim.style.setProperty("--x", `${g.right - fig.left + 36}px`);
  dim.style.setProperty("--y", `${g.top - fig.top}px`);
  dim.style.setProperty("--h", `${g.height}px`);
  within(dim, "span", HTMLElement).textContent = measured(/b: \{[^}]*?h: (?<value>[\d.]+)/u);
};

measure();

seek(0);

window.seek = seek;

window.END = END;

const play = async () => {
  const audio = new Audio("out/soundtrack.wav");
  const requested = Number(new URLSearchParams(location.search).get("t"));
  const from = Number.isNaN(requested) ? 0 : requested;
  let t0 = performance.now() - from * 1000;
  addEventListener("click", () => {
    audio.currentTime = 0;
    void audio.play();
  });
  audio.addEventListener("ended", () => {
    t0 = performance.now();
  });

  const tick = (now: number) => {
    seek(audio.paused ? ((now - t0) / 1000) % END : audio.currentTime);
    requestAnimationFrame(tick);
  };

  await document.fonts.ready;
  requestAnimationFrame(tick);
};

if (!navigator.webdriver) {
  void play();
}
