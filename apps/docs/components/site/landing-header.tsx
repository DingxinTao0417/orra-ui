"use client";

import Link from "next/link";
import { RiGithubFill } from "@remixicon/react";
import { ThemeSwitch } from "@/components/site/theme-switch";
import { Logo } from "@/components/site/logo";
import { site } from "@/lib/site";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center rounded-control outline-none focus-visible:focus-ring">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 text-body font-medium text-fg-muted sm:flex">
          <Link href="/components" className="hover:text-fg">组件</Link>
          <Link href="/templates" className="hover:text-fg">模板</Link>
          <Link href="/docs" className="hover:text-fg">文档</Link>
          <Link href="/docs/mcp" className="hover:text-fg">MCP</Link>
        </nav>
        <div className="flex-1" />
        <ThemeSwitch />
        <a href={site.repo} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover">
          <RiGithubFill className="size-5" />
        </a>
      </div>
    </header>
  );
}
