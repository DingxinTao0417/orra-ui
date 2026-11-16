"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RiSearchLine } from "@remixicon/react";
import { cx } from "@orra-ui/react/lib/cx";
import { FitScale } from "@/components/site/fit-scale";

export type GridCard = {
  slug: string;
  href: string;
  title: string;
  name: string;
  description: string;
  category: string;
  keywords: string[];
  isNew?: boolean;
  thumb: React.ReactNode;
};

export function ComponentsGrid({ sections, cards }: { sections: { id: string; title: string; blurb: string }[]; cards: GridCard[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      cards.filter(
        (c) =>
          (cat === "all" || c.category === cat) &&
          (!q || [c.title, c.name, c.slug, c.description, ...c.keywords].join(" ").toLowerCase().includes(q)),
      ),
    [cards, q, cat],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="sticky top-14 z-10 -mx-1 flex flex-col gap-3 bg-canvas/85 px-1 py-2 backdrop-blur-md sm:flex-row sm:items-center">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 shadow-card focus-within:ring-2 focus-within:ring-focus">
          <RiSearchLine className="size-4 text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`在 ${cards.length} 个组件中搜索，支持中英文…`}
            className="h-full flex-1 bg-transparent text-body text-fg outline-none placeholder:text-fg-subtle"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {[{ id: "all", title: "全部" }, ...sections].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCat(s.id)}
              className={cx(
                "h-8 cursor-pointer rounded-full px-3 text-body-sm font-medium transition-colors",
                cat === s.id ? "bg-surface-inverse text-fg-inverse" : "text-fg-muted hover:bg-surface-hover",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {sections.map((s) => {
        const list = filtered.filter((c) => c.category === s.id);
        if (!list.length) return null;
        return (
          <section key={s.id} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-title-sm font-semibold text-fg">{s.title}</h2>
              <span className="text-body text-fg-subtle">{list.length} · {s.blurb}</span>
            </div>
            <div className={cx("grid gap-4", s.id === "templates" ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
              {list.map((c) => (
                <div
                  key={c.slug}
                  className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow focus-within:ring-2 focus-within:ring-focus hover:shadow-md"
                >
                  <div className="pointer-events-none relative h-48 overflow-hidden border-b border-line bg-surface-muted/60" inert>
                    <FitScale>{c.thumb}</FitScale>
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <div className="flex items-center gap-2">
                      <Link href={c.href} className="text-body-lg font-semibold text-fg outline-none after:absolute after:inset-0 after:content-['']">
                        {c.title}
                      </Link>
                      <span className="font-mono text-caption text-fg-subtle">{c.name}</span>
                      {c.isNew ? <span className="ms-auto rounded-full bg-accent-50 px-1.5 text-micro font-semibold text-accent-600 dark:bg-accent-950 dark:text-accent-300">新</span> : null}
                    </div>
                    <p className="line-clamp-2 text-body-sm text-fg-muted">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {!filtered.length ? <p className="py-20 text-center text-body text-fg-subtle">没有找到匹配的组件</p> : null}
    </div>
  );
}
