import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentPreview } from "@/components/site/component-preview";
import { InstallTabs } from "@/components/site/install-tabs";
import { PropsTable } from "@/components/site/props-table";
import { demoLoaders } from "@/generated/registry";
import { demoSource } from "@/lib/demo-source";
import { highlight } from "@/lib/highlight";
import { categoryTitle, components, getItem, neighbours } from "@/lib/registry";
import type { Demo } from "@/lib/registry-types";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return components().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return {};
  return { title: `${item.title} ${item.name}`, description: item.description };
}

async function DemoBlock({ demo }: { demo: Demo }) {
  const load = demoLoaders[demo.file];
  const code = await demoSource(demo.file);
  const codeHtml = await highlight(code);
  if (!load) return null;
  const { default: Demo } = await load();
  return (
    <ComponentPreview code={code} codeHtml={codeHtml} layout={demo.layout} height={demo.height}>
      <Demo />
    </ComponentPreview>
  );
}

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9一-龥]+/g, "-");

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();
  const [first, ...rest] = item.demos;
  const { prev, next } = neighbours(slug);
  const exportsList = item.exports?.length ? item.exports : [item.name.replace(/\s+/g, "")];
  const importSnippet = `import { ${exportsList.join(", ")} } from "${site.packageName}";`;
  const extraDeps = item.dependencies.filter((d) => !d.startsWith("react"));

  const toc = [
    { id: "installation", title: "安装" },
    { id: "usage", title: "引入" },
    ...rest.map((d) => ({ id: anchor(d.title), title: d.title })),
    ...(item.notes?.length ? [{ id: "notes", title: "使用说明" }] : []),
    ...(item.props?.length ? [{ id: "api", title: "API" }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-[1180px] gap-10 pt-6">
      <article className="docs-prose min-w-0 flex-1">
        <nav className="mb-4 flex items-center gap-1 text-caption font-medium text-fg-subtle">
          <Link href="/components" className="hover:text-fg-muted">组件</Link>
          <RiArrowRightSLine className="size-3.5" />
          <span>{categoryTitle(item.category)}</span>
        </nav>
        <header className="mb-8 flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-title-lg font-semibold text-fg">{item.title}</h1>
            <span className="font-mono text-body font-medium text-fg-subtle">{item.name}</span>
          </div>
          <p className="max-w-2xl text-body">{item.description}</p>
        </header>

        {first ? <DemoBlock demo={first} /> : null}

        <section id="installation" className="mt-12 flex flex-col gap-4">
          <h2 className="text-title-sm font-semibold text-fg">安装</h2>
          <p className="text-body">
            方式一：安装 npm 包，按需引入（需要项目已配置 Tailwind CSS v4，并在全局样式中引入 <code>{site.packageName}/styles.css</code>，详见<Link href="/docs/installation">安装指南</Link>）。
          </p>
          <InstallTabs packages={site.packageName} />
          <p className="text-body">方式二：用 CLI 把源码复制进你的项目，完全掌控代码（会自动带上内部依赖并安装所需 npm 包）。</p>
          <InstallTabs dlx={`${site.cliPackage} add ${item.slug}`} />
          {extraDeps.length ? (
            <p className="text-caption text-fg-subtle">
              依赖：{extraDeps.map((d) => <code key={d} className="me-1">{d.replace(/@[\^~]?[\d.]+$/, "")}</code>)}
            </p>
          ) : null}
        </section>

        <section id="usage" className="mt-12 flex flex-col gap-4">
          <h2 className="text-title-sm font-semibold text-fg">引入</h2>
          <CodeBlock code={importSnippet} />
        </section>

        {rest.length ? (
          <section className="mt-12 flex flex-col gap-10">
            <h2 className="text-title-sm font-semibold text-fg">示例</h2>
            {rest.map((demo) => (
              <div key={demo.file} id={anchor(demo.title)} className="flex flex-col gap-3">
                <h3 className="text-body-lg font-semibold text-fg">{demo.title}</h3>
                {demo.description ? <p className="text-body">{demo.description}</p> : null}
                <DemoBlock demo={demo} />
              </div>
            ))}
          </section>
        ) : null}

        {item.notes?.length ? (
          <section id="notes" className="mt-12 flex flex-col gap-3">
            <h2 className="text-title-sm font-semibold text-fg">使用说明</h2>
            <ul className="flex list-disc flex-col gap-2 ps-5 text-body text-fg-muted">
              {item.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.props?.length ? (
          <section id="api" className="mt-12 flex flex-col gap-4">
            <h2 className="text-title-sm font-semibold text-fg">API</h2>
            <PropsTable groups={item.props} />
          </section>
        ) : null}

        <footer className="mt-16 grid grid-cols-2 gap-3 border-t border-line pt-6">
          {prev ? (
            <Link href={`/components/${prev.slug}`} className="group flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 hover:bg-surface-hover">
              <span className="flex items-center gap-1 text-caption font-medium text-fg-subtle"><RiArrowLeftSLine className="size-4" />上一个</span>
              <span className="text-body font-medium text-fg">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/components/${next.slug}`} className="group flex flex-col items-end gap-1 rounded-2xl border border-line bg-surface p-4 text-end hover:bg-surface-hover">
              <span className="flex items-center gap-1 text-caption font-medium text-fg-subtle">下一个<RiArrowRightSLine className="size-4" /></span>
              <span className="text-body font-medium text-fg">{next.title}</span>
            </Link>
          ) : null}
        </footer>
      </article>

      <aside className="sticky top-20 hidden h-fit w-48 shrink-0 xl:block">
        <div className="mb-2 text-caption font-medium text-fg-subtle">本页内容</div>
        <ul className="flex flex-col gap-1.5 border-s border-line">
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="-ms-px block border-s border-transparent ps-3 text-body-sm text-fg-subtle hover:border-fg-subtle hover:text-fg">
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
