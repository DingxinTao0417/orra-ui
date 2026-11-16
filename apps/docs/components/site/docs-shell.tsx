"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCloseLine, RiGithubFill, RiMenuLine, RiNpmjsFill, RiSearchLine } from "@remixicon/react";
import { cx } from "@orra-ui/react/lib/cx";
import { Logo } from "@/components/site/logo";
import { SearchDialog } from "@/components/site/search-dialog";
import { ThemeSwitch } from "@/components/site/theme-switch";
import { FOUNDATIONS, GUIDES, type NavLink } from "@/lib/nav";
import { site } from "@/lib/site";

export type NavSection = { title: string; links: (NavLink & { isNew?: boolean })[] };

function SidebarLink({ link, active, onNavigate }: { link: NavSection["links"][number]; active: boolean; onNavigate?: () => void }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group flex h-8 items-center gap-2 rounded-lg px-2 text-body font-medium transition-colors duration-150",
        active
          ? "bg-surface text-fg shadow-card ring-1 ring-line"
          : "text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      {Icon ? <Icon className={cx("size-4 shrink-0", active ? "text-accent-500" : "text-fg-subtle group-hover:text-fg-muted")} /> : null}
      <span className="min-w-0 flex-1 truncate">{link.title}</span>
      {link.badge ? (
        <span className="rounded-full bg-accent-50 px-1.5 text-micro font-semibold text-accent-600 dark:bg-accent-950 dark:text-accent-300">{link.badge}</span>
      ) : link.isNew ? (
        <span className="rounded-full bg-accent-50 px-1.5 text-micro font-semibold text-accent-600 dark:bg-accent-950 dark:text-accent-300">新</span>
      ) : null}
    </Link>
  );
}

function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const all: NavSection[] = [
    { title: "快速入门", links: GUIDES },
    { title: "基础规范", links: FOUNDATIONS },
    ...sections,
  ];
  return (
    <nav className="flex flex-col gap-5 pb-6">
      {all.map((section) => (
        <div key={section.title} className="flex flex-col gap-0.5">
          <div className="px-2 pb-1 text-caption font-medium text-fg-subtle">{section.title}</div>
          {section.links.map((link) => (
            <SidebarLink key={link.href} link={link} active={pathname === link.href} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}

function SearchButton({ onOpen, className }: { onOpen: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        "flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-surface px-2.5 text-body text-fg-subtle shadow-card transition-colors hover:bg-surface-hover",
        className,
      )}
    >
      <RiSearchLine className="size-4 text-fg-subtle" />
      <span className="flex-1 text-start">快速搜索…</span>
      <kbd className="rounded-md border border-line bg-surface-muted px-1.5 font-sans text-micro font-medium text-fg-subtle">⌘K</kbd>
    </button>
  );
}

export function DocsShell({ sections, children }: { sections: NavSection[]; children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="min-h-dvh bg-surface-muted">
      {/* Desktop floating sidebar */}
      <aside className="fixed inset-y-2 start-2 z-30 hidden w-[264px] flex-col rounded-card bg-surface-muted lg:flex">
        <div className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-raised">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <Link href="/" className="flex items-center rounded-control outline-none focus-visible:focus-ring">
              <Logo />
            </Link>
          </div>
          <div className="px-3 pb-3">
            <SearchButton onOpen={() => setSearchOpen(true)} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 [scrollbar-width:thin]">
            <SidebarNav sections={sections} />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="关闭菜单" className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-2 start-2 flex w-[min(300px,85vw)] flex-col overflow-hidden rounded-card bg-surface shadow-raised">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <Logo />
              <button type="button" aria-label="关闭菜单" onClick={() => setMobileOpen(false)} className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover">
                <RiCloseLine className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3">
              <SidebarNav sections={sections} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:ps-[272px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
          <button type="button" aria-label="打开菜单" onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover lg:hidden">
            <RiMenuLine className="size-5" />
          </button>
          <Link href="/" className="flex items-center lg:hidden">
            <Logo />
          </Link>
          <div className="flex-1" />
          <button type="button" aria-label="搜索" onClick={() => setSearchOpen(true)} className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover lg:hidden">
            <RiSearchLine className="size-5" />
          </button>
          <ThemeSwitch />
          <a href={site.npm} target="_blank" rel="noreferrer" aria-label="npm" className="hidden size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover sm:grid">
            <RiNpmjsFill className="size-5" />
          </a>
          <a href={site.repo} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover">
            <RiGithubFill className="size-5" />
          </a>
        </header>
        <main className="px-4 pb-24 sm:px-6 lg:px-10">{children}</main>
      </div>

      <SearchDialog isOpen={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
