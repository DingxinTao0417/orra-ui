import type { Metadata } from "next";
import Link from "next/link";
import { RiExternalLinkLine } from "@remixicon/react";
import { CopyButton } from "@/components/site/copy-button";
import { FitScale } from "@/components/site/fit-scale";
import { templates } from "@/lib/registry";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "模板", description: "完整页面模板：仪表盘、财务、营销、人力、医疗、AI 对话、多智能体协作与项目看板。" };

export default function TemplatesPage() {
  const list = templates();
  return (
    <div className="mx-auto max-w-[1180px] pt-6">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-title-lg font-semibold text-fg">模板</h1>
        <p className="max-w-2xl text-body text-fg-muted">
          {list.length} 个完整页面，由组件库中的组件组合而成。点击卡片全屏体验，或用一条命令把源码复制进项目再按需修改。
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {list.map((t) => {
          const cmd = `npx ${site.cliPackage} add ${t.slug}`;
          return (
            <div key={t.slug} className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
              <Link href={t.route ?? `/templates/${t.slug}`} className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-surface-muted">
                <div className="pointer-events-none absolute inset-0" inert>
                  <FitScale padding={0}>
                    <iframe src={t.route ?? `/templates/${t.slug}`} title={t.title} loading="lazy" width={1440} height={900} className="block border-0" tabIndex={-1} />
                  </FitScale>
                </div>
              </Link>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-body-lg font-semibold text-fg">{t.title}</h2>
                  <span className="hidden truncate font-mono text-caption text-fg-subtle sm:inline">{t.name}</span>
                  <Link href={t.route ?? `/templates/${t.slug}`} className="ms-auto flex shrink-0 items-center gap-1 text-body-sm font-medium whitespace-nowrap text-accent-600 hover:underline dark:text-accent-400">
                    全屏预览 <RiExternalLinkLine className="size-3.5" />
                  </Link>
                </div>
                <p className="text-body-sm text-fg-muted">{t.description}</p>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-muted ps-3 pe-1">
                  <code className="min-w-0 flex-1 truncate py-2 font-mono text-caption text-fg-muted">{cmd}</code>
                  <CopyButton value={cmd} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
