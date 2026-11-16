import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";

export function DocPage({ section = "文档", title, description, children }: { section?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <article className="docs-prose mx-auto max-w-3xl pt-6">
      <nav className="mb-4 flex items-center gap-1 text-caption font-medium text-fg-subtle">
        <Link href="/docs" className="hover:text-fg-muted">{section}</Link>
        <RiArrowRightSLine className="size-3.5" />
        <span>{title}</span>
      </nav>
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="text-title-lg font-semibold text-fg">{title}</h1>
        {description ? <p className="text-body-lg">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </article>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-8 text-title-sm font-semibold text-fg">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-body leading-7">{children}</p>;
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex flex-col gap-8 border-s border-line ps-6 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative flex flex-col gap-3 [counter-increment:step] before:absolute before:-start-[37px] before:top-0 before:grid before:size-6 before:place-items-center before:rounded-full before:border before:border-line before:bg-surface before:text-caption font-semibold before:text-fg-muted before:content-[counter(step)]">
      <h3 className="text-body-lg font-semibold text-fg">{title}</h3>
      {children}
    </li>
  );
}

export function Callout({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div className={tone === "warn" ? "rounded-2xl bg-warning-soft px-4 py-3 text-body text-fg" : "rounded-2xl bg-info-soft px-4 py-3 text-body text-fg"}>
      {children}
    </div>
  );
}

export function CardLinks({ items }: { items: { title: string; href: string; description: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 !no-underline transition-shadow hover:shadow-md">
          <span className="text-body-lg font-semibold text-fg">{i.title}</span>
          <span className="text-body-sm text-fg-muted">{i.description}</span>
        </Link>
      ))}
    </div>
  );
}
