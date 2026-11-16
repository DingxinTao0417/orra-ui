export type Category = "foundations" | "base" | "agents" | "blocks" | "charts" | "templates";

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface PropsGroup {
  /** Component (export) name, e.g. "Button". */
  component: string;
  description?: string;
  props: PropDoc[];
}

export interface Demo {
  /** Path under apps/docs/demos, e.g. "button/variants.tsx". */
  file: string;
  title: string;
  description?: string;
  /** Preview canvas min-height in px (default 280). */
  height?: number;
  /** "center" (default) centers the demo; "padded" aligns top-left with padding; "full" lets it fill edge to edge. */
  layout?: "center" | "padded" | "full";
}

export interface RegistryItem {
  slug: string;
  name: string;
  /** Chinese display name. */
  title: string;
  category: Category;
  description: string;
  keywords?: string[];
  isNew?: boolean;
  /** Named exports to show in the import snippet. */
  exports?: string[];
  /** Short notes rendered under "使用说明" (markdown-ish plain text paragraphs). */
  notes?: string[];
  importPath: string | null;
  dependencies: string[];
  libImports: string[];
  fileList: string[];
  demos: Demo[];
  props?: PropsGroup[];
  /** Templates only. */
  route?: string;
  /** Templates only: JSX that renders the template entry. */
  usage?: string;
  /** Main module path (relative to the package src, or the docs app for templates). */
  entry?: string;
}
