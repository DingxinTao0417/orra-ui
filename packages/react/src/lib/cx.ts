import { extendTailwindMerge } from "tailwind-merge";

/** Orra's type-scale sizes, so tailwind-merge treats them as font sizes (not colours). */
const TYPE_SCALE = ["display-lg", "display", "title-lg", "title", "title-sm", "body-lg", "body", "body-sm", "caption", "micro"];

const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPE_SCALE }],
      shadow: [{ shadow: ["xs", "card", "raised", "popover", "accent"] }],
      rounded: [{ rounded: ["control", "menu", "card"] }],
    },
  },
});

type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(values: ClassValue[], out: string[] = []): string[] {
  for (const v of values) {
    if (!v && v !== 0) continue;
    if (Array.isArray(v)) flatten(v, out);
    else out.push(String(v));
  }
  return out;
}

/**
 * Joins class names (skipping falsy values, flattening arrays) and resolves
 * Tailwind conflicts so the last class wins: `cx("px-3", big && "px-5")`.
 */
export function cx(...values: ClassValue[]): string {
  return merge(flatten(values).join(" "));
}
