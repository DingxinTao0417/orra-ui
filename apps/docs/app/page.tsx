import Link from "next/link";
import { RiArrowRightLine, RiGithubFill, RiPlugLine, RiRobot2Line, RiTerminalBoxLine, RiBox3Line } from "@remixicon/react";
import { CodeBlock } from "@/components/site/code-block";
import { CopyButton } from "@/components/site/copy-button";
import { LandingHeader } from "@/components/site/landing-header";
import { LandingShowcase } from "@/components/site/landing-showcase";
import { Logo } from "@/components/site/logo";
import { components, templates } from "@/lib/registry";
import { site } from "@/lib/site";

const STACK = ["React 19", "Tailwind CSS v4", "React Aria", "Motion", "TypeScript"];

const WAYS = [
  {
    icon: RiBox3Line,
    title: "npm 包",
    desc: "一行安装，按需引入，随版本升级获得修复与新组件。",
    code: `pnpm add ${site.packageName}`,
    href: "/docs/installation",
  },
  {
    icon: RiTerminalBoxLine,
    title: "CLI 复制源码",
    desc: "把组件源码与内部依赖复制进仓库，完全掌控、随意修改。",
    code: `npx ${site.cliPackage} add date-picker`,
    href: "/docs/cli",
  },
  {
    icon: RiPlugLine,
    title: "MCP 服务器",
    desc: "让 Claude Code、Cursor 等智能体实时查询组件 API 与示例。",
    code: `claude mcp add orra-ui -- npx -y ${site.cliPackage} mcp`,
    href: "/docs/mcp",
  },
  {
    icon: RiRobot2Line,
    title: "智能体技能",
    desc: "一条命令装上设计规范与组件目录，AI 写出的界面风格统一。",
    code: `npx ${site.cliPackage} skill`,
    href: "/docs/skills",
  },
];

export default function Home() {
  const count = components().length;
  const tplCount = templates().length;
  return (
    <div className="min-h-dvh bg-canvas">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] max-w-5xl rounded-full bg-[radial-gradient(closest-side,var(--color-accent-200),transparent)] opacity-60 blur-3xl dark:bg-[radial-gradient(closest-side,var(--color-accent-900),transparent)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-14 text-center sm:pt-28">
          <Link href="/components" className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-caption font-medium text-fg-muted shadow-card hover:text-fg">
            <span className="size-1.5 rounded-full bg-accent-500" />
            {count} 个组件 · {tplCount} 个模板 · MCP + 智能体技能
            <RiArrowRightLine className="size-3.5" />
          </Link>
          <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-fg sm:text-[64px]">
            React 设计系统
            <br />
            <span className="bg-gradient-to-r from-accent-500 to-accent-700 bg-clip-text text-transparent dark:from-accent-300 dark:to-accent-500">为智能体界面而打造</span>
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-fg-muted">
            {site.name} 是一套基于 React Aria 与 Tailwind CSS v4 的组件库：基础组件、AI 智能体组件、图表卡片与完整页面模板，自带深色模式与无障碍，可以 npm 安装，也可以让 AI 通过 MCP 直接使用。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent-gradient px-4 text-body font-medium text-fg-on-accent hover:brightness-[1.06] active:brightness-95">
              开始使用 <RiArrowRightLine className="size-4" />
            </Link>
            <Link href="/components" className="inline-flex h-10 items-center rounded-xl border border-line-strong bg-surface px-4 text-body font-medium text-fg shadow-xs hover:bg-surface-hover">
              浏览组件
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-surface ps-4 pe-1 shadow-card">
            <code className="py-2 font-mono text-body-sm text-fg-muted">
              <span className="text-fg-subtle">$ </span>pnpm add {site.packageName}
            </code>
            <CopyButton value={`pnpm add ${site.packageName}`} />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption font-medium text-fg-subtle">
            {STACK.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Live showcase */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <LandingShowcase />
      </section>

      {/* Ways to use */}
      <section className="border-y border-line bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <h2 className="text-display font-semibold text-fg">人和 AI，都能用</h2>
            <p className="max-w-xl text-body text-fg-muted">同一份组件注册表，驱动文档站、npm 包、CLI 和 MCP 服务器，所以人看到的和智能体拿到的永远一致。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {WAYS.map((w) => (
              <div key={w.title} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-300">
                    <w.icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-body-lg font-semibold text-fg">{w.title}</h3>
                    <p className="text-body-sm text-fg-muted">{w.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-muted ps-3 pe-1">
                  <code className="min-w-0 flex-1 truncate py-2 font-mono text-caption text-fg-muted">{w.code}</code>
                  <CopyButton value={w.code} />
                </div>
                <Link href={w.href} className="inline-flex items-center gap-1 text-body-sm font-medium text-accent-600 hover:underline dark:text-accent-400">
                  了解更多 <RiArrowRightLine className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code sample */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-display font-semibold text-fg">语义变量，深色模式免费送</h2>
          <p className="text-body text-fg-muted">
            组件只使用语义 token（<code className="font-mono text-fg">text-fg</code>、<code className="font-mono text-fg">bg-surface</code>），切换深色模式时自动翻转。换品牌色只需改 11 级 accent 色阶，按钮、链接、焦点环和选中态全部跟着变。
          </p>
          <Link href="/docs/theming" className="inline-flex items-center gap-1 text-body font-medium text-accent-600 hover:underline dark:text-accent-400">
            主题定制 <RiArrowRightLine className="size-4" />
          </Link>
        </div>
        <CodeBlock
          title="app/page.tsx"
          code={`"use client";
import { Button, StatCards } from "${site.packageName}";
import { RiAddLine } from "@remixicon/react";

export default function Page() {
  return (
    <main className="flex flex-col gap-6 bg-canvas p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title-lg font-semibold text-fg">概览</h1>
        <Button startIcon={<RiAddLine />}>新建报表</Button>
      </div>
      <StatCards />
    </main>
  );
}`}
        />
      </section>

      {/* Templates strip */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="flex flex-col items-start justify-between gap-4 rounded-card border border-line bg-surface p-8 shadow-card sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-title font-semibold text-fg">{tplCount} 个完整页面模板</h2>
            <p className="text-body text-fg-muted">仪表盘、财务、营销、人力、医疗、AI 编程对话、图像生成、多智能体协作、项目看板。</p>
          </div>
          <Link href="/templates" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent-gradient px-4 text-body font-medium text-fg-on-accent hover:brightness-[1.06]">
            查看模板 <RiArrowRightLine className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <Logo />
          <div className="flex items-center gap-5 text-body-sm text-fg-subtle">
            <Link href="/docs" className="hover:text-fg">文档</Link>
            <Link href="/components" className="hover:text-fg">组件</Link>
            <Link href="/templates" className="hover:text-fg">模板</Link>
            <a href={site.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-fg">
              <RiGithubFill className="size-4" /> GitHub
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
