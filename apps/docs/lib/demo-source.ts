import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

/** Reads a demo file's source for the code tab. */
export async function demoSource(file: string) {
  const full = path.join(process.cwd(), "demos", file);
  try {
    return await fs.readFile(full, "utf8");
  } catch {
    return `// demo not found: ${file}`;
  }
}
