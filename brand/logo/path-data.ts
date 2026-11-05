import type { Path, PathCommand } from "opentype.js";

const number = (value: number) =>
  Math.round(value) === value ? String(Math.round(value)) : value.toFixed(2);

const pack = (...values: number[]) =>
  values.map((value, i) => (value >= 0 && i > 0 ? " " : "") + number(value)).join("");

const segment = (command: PathCommand) => {
  switch (command.type) {
    case "M":
    case "L": {
      return command.type + pack(command.x, command.y);
    }

    case "Q": {
      return `Q${pack(command.x1, command.y1, command.x, command.y)}`;
    }

    case "C": {
      return `C${pack(command.x1, command.y1, command.x2, command.y2, command.x, command.y)}`;
    }

    case "Z": {
      return "Z";
    }

    default: {
      return command satisfies never;
    }
  }
};

const closesContour = (command: PathCommand, next: PathCommand | undefined) =>
  command.type !== "Z" && (next === undefined || next.type === "M");

export const pathData = (path: Path) =>
  path.commands
    .map(
      (command, i) => segment(command) + (closesContour(command, path.commands[i + 1]) ? "Z" : ""),
    )
    .join("");
