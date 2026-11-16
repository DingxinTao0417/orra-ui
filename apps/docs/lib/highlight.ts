import "server-only";
import { codeToHtml } from "shiki";

/** Highlights code for display in both themes (CSS picks --shiki-dark under .dark). */
export async function highlight(code: string, lang: string = "tsx") {
  return codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark-default" },
    defaultColor: "light",
  });
}
