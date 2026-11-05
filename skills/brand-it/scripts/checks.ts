// oxlint-disable unicorn/consistent-function-scoping -- page.evaluate sends each exported function to the page alone, so its helpers have to live inside it
export type Lab = [number, number, number];

export interface Area {
  share: number;
  lab: Lab;
  hex: string;
}

export interface Tile {
  y: number;
  png: string | null;
  areas: Area[];
}

export const findProblems = () => {
  const found: string[] = [];
  const doc = document.documentElement;
  const text = (el: Element) => (el.textContent ?? "").trim();

  const name = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.classList[0] === undefined ? "" : `.${el.classList[0]}`}`;

  const label = (el: Element) => `${name(el)} "${text(el).slice(0, 40)}"`;

  const lines = (el: Element) => {
    const range = document.createRange();
    range.selectNodeContents(el);

    return [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
  };

  const ownsText = (el: Element) =>
    [...el.childNodes].some(
      (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
    );

  const clips = (style: CSSStyleDeclaration) =>
    style.display.startsWith("inline") ||
    style.textOverflow === "ellipsis" ||
    /auto|scroll/u.test(style.overflowX);

  const painted = (style: CSSStyleDeclaration) =>
    style.backgroundImage !== "none" ||
    !/^(?:transparent|rgba\(.*, 0\))$/u.test(style.backgroundColor);

  if (doc.scrollWidth > innerWidth) {
    found.push(`page scrolls sideways by ${doc.scrollWidth - innerWidth}px`);
  }

  for (const el of document.body.querySelectorAll("*")) {
    const overflows =
      !clips(getComputedStyle(el)) &&
      el.clientWidth > 1 &&
      ownsText(el) &&
      el.scrollWidth > el.clientWidth + 1;

    if (overflows) {
      found.push(`text wider than its box: ${name(el)} "${text(el).slice(0, 40)}"`);
    }
  }

  const literal = "code, kbd, samp, pre, [data-url]";

  for (const el of document.body.querySelectorAll(literal)) {
    const nested = el.parentElement?.closest(literal) !== null;
    const tops = new Set(lines(el).map((r) => Math.round(r.top + r.height / 2)));

    if (!text(el).includes("\n") && !nested && tops.size > 1) {
      found.push(
        `wraps onto ${tops.size} lines, truncate it with an ellipsis instead: ${label(el)}`,
      );
    }
  }

  for (const el of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    const parent = el.parentElement;

    if (!style.display.startsWith("inline") || !painted(style) || text(el) === "" || !parent) {
      continue;
    }

    const block =
      parent.closest(":not(a, b, i, em, strong, span, mark, code, kbd, small, sup, sub)") ?? parent;

    const above = [...el.getClientRects()]
      .map((band) => ({
        band,
        line: lines(block).find(
          (r) =>
            r.bottom <= band.bottom - band.height / 2 &&
            r.top < band.top &&
            r.bottom > band.top + 0.5 &&
            r.right > band.left &&
            r.left < band.right,
        ),
      }))
      .find(({ line }) => line !== undefined);

    if (above?.line) {
      found.push(
        `highlight band overlaps the line above by ${Math.round(above.line.bottom - above.band.top)}px: ${label(el)}`,
      );
    }
  }

  return found;
};

export const lightImages = () => {
  const weights = [0.2126, 0.7152, 0.0722];

  const linear = (v: number) => {
    const c = v / 255;

    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const luminance = (rgb: number[]) =>
    rgb.map(linear).reduce((sum, v, i) => sum + v * (weights[i] ?? 0), 0);

  const backdrop = (el: Element) => {
    for (let at = el.parentElement; at; at = at.parentElement) {
      const [r = 0, g = 0, b = 0, a = 1] = (
        getComputedStyle(at).backgroundColor.match(/[\d.]+/gu) ?? []
      ).map(Number);

      if (a > 0.5) {
        return luminance([r, g, b]);
      }
    }

    return 0;
  };

  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const found: string[] = [];

  if (!ctx) {
    return found;
  }

  for (const img of document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video")) {
    const { width, height } = img.getBoundingClientRect();
    const behind = backdrop(img);

    if (width * height < 0.08 * innerWidth * Math.min(innerHeight, 900) || behind > 0.2) {
      continue;
    }

    try {
      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(img, 0, 0, 16, 16);
      const { data } = ctx.getImageData(0, 0, 16, 16);
      let sum = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = (data[i + 3] ?? 0) / 255;
        sum +=
          luminance([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]) * alpha +
          behind * (1 - alpha);
      }

      const src = img instanceof HTMLImageElement ? img.currentSrc || img.src : img.currentSrc;

      if (sum / 256 > 0.5) {
        found.push(
          `big light image on a dark page, set it on a light band: ${src.split("/").pop() ?? src}`,
        );
      }
    } catch {
      continue;
    }
  }

  return found;
};

export const showEverything = async () => {
  for (const img of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
    img.loading = "eager";
  }

  const frame = async () => {
    const { promise, resolve } = Promise.withResolvers<number>();
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
    await promise;
  };

  const scrollFrom = async (y: number): Promise<void> => {
    if (y >= document.documentElement.scrollHeight) {
      return;
    }

    scrollTo(0, y);
    await frame();
    await scrollFrom(y + innerHeight);
  };

  await scrollFrom(0);
  scrollTo(0, 0);
  await Promise.allSettled(
    [...document.images].map(async (img) => {
      await img.decode();
    }),
  );
};

export const tile = async (b64: string, height: number): Promise<Tile[]> => {
  const lin = Array.from({ length: 256 }, (_, i) =>
    i <= 10 ? i / 255 / 12.92 : ((i / 255 + 0.055) / 1.055) ** 2.4,
  );

  const bytes = Uint8Array.from(atob(b64), (c) => c.codePointAt(0) ?? 0);
  const image = await createImageBitmap(new Blob([bytes], { type: "image/png" }));

  interface Sum {
    n: number;
    lab: Lab;
    rgb: Lab;
  }

  const empty = (): Sum => ({ lab: [0, 0, 0], n: 0, rgb: [0, 0, 0] });

  const add = (into: Sum, n: number, lab: Lab, rgb: Lab) => {
    into.n += n;
    into.lab = [into.lab[0] + lab[0], into.lab[1] + lab[1], into.lab[2] + lab[2]];
    into.rgb = [into.rgb[0] + rgb[0], into.rgb[1] + rgb[1], into.rgb[2] + rgb[2]];
  };

  const oklab = (r: number, g: number, b: number): Lab => {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  };

  const toBase64 = async (blob: Blob) => {
    const encoded = new Uint8Array(await blob.arrayBuffer());

    return btoa(Array.from(encoded, (byte) => String.fromCodePoint(byte)).join(""));
  };

  const cut = async (y: number): Promise<Tile> => {
    const canvas = new OffscreenCanvas(image.width, Math.min(height, image.height - y));
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return { areas: [], png: null, y };
    }

    ctx.drawImage(image, 0, -y);
    const { data, width } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buckets = new Map<string, Sum>();
    let samples = 0;

    for (let py = 0; py < canvas.height; py += 4) {
      for (let px = 0; px < width; px += 4) {
        const i = (py * width + px) * 4;
        const rgb: Lab = [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0];
        const lab = oklab(lin[rgb[0]] ?? 0, lin[rgb[1]] ?? 0, lin[rgb[2]] ?? 0);
        const key = `${Math.round(lab[0] / 0.04)},${Math.round(lab[1] / 0.02)},${Math.round(lab[2] / 0.02)}`;
        const bucket = buckets.get(key) ?? empty();
        buckets.set(key, bucket);
        add(bucket, 1, lab, rgb);
        samples += 1;
      }
    }

    const areas: Sum[] = [];

    for (const { n, lab, rgb } of [...buckets.values()].toSorted((a, b) => b.n - a.n)) {
      const mean = lab.map((v) => v / n);

      const near = areas.find(
        (a) => Math.hypot(...a.lab.map((v, k) => v / a.n - (mean[k] ?? 0))) < 0.04,
      );

      const into = near ?? empty();

      if (!near) {
        areas.push(into);
      }

      add(into, n, lab, rgb);
    }

    const png =
      y % height === 0 ? await toBase64(await canvas.convertToBlob({ type: "image/png" })) : null;

    const hex = (rgb: Lab, n: number) =>
      `#${rgb
        .map((v) =>
          Math.round(v / n)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")}`;

    return {
      areas: areas.flatMap((a): Area[] =>
        a.n / samples >= 0.05 && (canvas.height >= height / 2 || y === 0)
          ? [
              {
                hex: hex(a.rgb, a.n),
                lab: [a.lab[0] / a.n, a.lab[1] / a.n, a.lab[2] / a.n],
                share: a.n / samples,
              },
            ]
          : [],
      ),
      png,
      y,
    };
  };

  const starts = Array.from(
    { length: Math.ceil(image.height / (height / 2)) },
    (_, k) => (k * height) / 2,
  );

  return await Promise.all(starts.map(cut));
};

export const fights = (areas: Area[]) => {
  const lch = ({ lab: [L, a, b] }: Area) => ({
    C: Math.hypot(a, b),
    L,
    h: (Math.atan2(b, a) * 180) / Math.PI,
  });

  return areas.flatMap((one, i) =>
    areas.slice(i + 1).flatMap((other): [string, string][] => {
      const x = lch(one);
      const z = lch(other);
      const turn = Math.abs(((x.h - z.h + 540) % 360) - 180);

      if (Math.min(x.C, z.C) < 0.03 || turn < 90 || Math.abs(x.L - z.L) >= 0.05) {
        return [];
      }

      const key = [x.h, z.h]
        .map((h) => Math.round(h / 30))
        .toSorted((p, q) => p - q)
        .join(",");

      return [
        [
          key,
          `colors fight: ${one.hex} (${Math.round(one.share * 100)}% of the view) next to ${other.hex} (${Math.round(other.share * 100)}%), hues ${Math.round(turn)}° apart at the same lightness`,
        ],
      ];
    }),
  );
};
