const fig = document.getElementById("hero-fig")!
const ink = fig.querySelector<SVGGraphicsElement>("[data-ink]")!
fig.querySelectorAll<SVGRectElement>(".nodes rect").forEach((r, i) => r.style.setProperty("--i", String(i)))

const measure = () => {
  const g = fig.getBoundingClientRect()
  const box = ink.getBoundingClientRect()
  for (const dim of fig.querySelectorAll<HTMLElement>("[data-measure]")) {
    const axis = dim.dataset.measure as "width" | "height"
    const px = Math.round(box[axis])
    dim.querySelector("span")!.textContent = String(px)
    dim.style[axis] = `${px}px`
    if (axis === "width") dim.style.marginLeft = `${box.left - g.left}px`
    else dim.style.top = `${box.top - g.top}px`
  }
  fig.classList.remove("measured")
  void fig.offsetWidth
  fig.classList.add("measured")
}
document.fonts.ready.then(measure)
addEventListener("resize", measure)

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
  button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(button.dataset.copy!)
    button.textContent = "Copied"
    button.dataset.copied = ""
  })
  button.addEventListener("blur", () => {
    button.textContent = "Copy"
    delete button.dataset.copied
  })
}
