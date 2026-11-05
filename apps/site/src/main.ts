const fig = document.querySelector<HTMLElement>("#hero-fig");
const ink = fig?.querySelector<SVGGraphicsElement>("[data-ink]");

const isAxis = (value: string | undefined): value is "width" | "height" =>
  value === "width" || value === "height";

const measure = (figure: HTMLElement, mark: SVGGraphicsElement) => {
  const g = figure.getBoundingClientRect();
  const box = mark.getBoundingClientRect();

  for (const dim of figure.querySelectorAll<HTMLElement>("[data-measure]")) {
    const axis = dim.dataset.measure;

    if (isAxis(axis)) {
      const px = Math.round(box[axis]);
      const number = dim.querySelector("span");

      if (number) {
        number.textContent = String(px);
      }

      dim.style[axis] = `${px}px`;

      if (axis === "width") {
        dim.style.marginLeft = `${box.left - g.left}px`;
      } else {
        dim.style.top = `${box.top - g.top}px`;
      }
    }
  }

  figure.classList.remove("measured");
  figure.getBoundingClientRect();
  figure.classList.add("measured");
};

if (fig && ink) {
  for (const [i, rect] of [...fig.querySelectorAll<SVGRectElement>(".nodes rect")].entries()) {
    rect.style.setProperty("--i", String(i));
  }

  const remeasure = () => {
    measure(fig, ink);
  };

  void document.fonts.ready.then(remeasure);
  addEventListener("resize", remeasure);
}

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
  const copy = async () => {
    await navigator.clipboard.writeText(button.dataset.copy ?? "");
    button.textContent = "Copied";
    button.dataset.copied = "";
  };

  button.addEventListener("click", () => {
    void copy();
  });
  button.addEventListener("blur", () => {
    button.textContent = "Copy";
    delete button.dataset.copied;
  });
}
