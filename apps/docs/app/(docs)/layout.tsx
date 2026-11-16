import { DocsShell, type NavSection } from "@/components/site/docs-shell";
import { CATEGORIES, itemsIn } from "@/lib/registry";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections: NavSection[] = CATEGORIES.filter((c) => c.id !== "templates").map((c) => ({
    title: c.title,
    links: itemsIn(c.id).map((i) => ({ title: i.title, href: `/components/${i.slug}`, isNew: i.isNew })),
  }));
  return <DocsShell sections={sections}>{children}</DocsShell>;
}
