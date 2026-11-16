import type { Metadata } from "next";
import { ComponentsGrid, type GridCard } from "@/components/site/components-grid";
import { demoLoaders } from "@/generated/registry";
import { CATEGORIES, components } from "@/lib/registry";

export const metadata: Metadata = { title: "全部组件", description: "按分类浏览、搜索并实时预览 Orra UI 的全部组件。" };

export default async function ComponentsIndex() {
  const list = components();
  const cards: GridCard[] = await Promise.all(
    list.map(async (i) => {
      const first = i.demos[0];
      const load = first ? demoLoaders[first.file] : undefined;
      const Thumb = load ? (await load()).default : null;
      return {
        slug: i.slug,
        href: `/components/${i.slug}`,
        title: i.title,
        name: i.name,
        description: i.description,
        category: i.category,
        keywords: i.keywords ?? [],
        isNew: i.isNew,
        thumb: Thumb ? <Thumb /> : <span className="text-caption text-fg-subtle">{i.name}</span>,
      };
    }),
  );
  return (
    <div className="mx-auto max-w-[1180px] pt-6">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-title-lg font-semibold text-fg">组件</h1>
        <p className="max-w-2xl text-body text-fg-muted">
          {list.length} 个组件，全部基于 React Aria 无障碍原语与 Tailwind CSS v4 语义变量构建，自动适配深色模式。点击任意卡片查看实时预览、代码与 API。
        </p>
      </header>
      <ComponentsGrid sections={CATEGORIES.filter((c) => c.id !== "templates")} cards={cards} />
    </div>
  );
}
