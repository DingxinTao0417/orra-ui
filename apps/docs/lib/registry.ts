import { registry } from "@/generated/registry";
import type { Category, RegistryItem } from "@/lib/registry-types";

export const CATEGORIES: { id: Category; title: string; blurb: string }[] = [
  { id: "base", title: "基础组件", blurb: "日常界面的积木：按钮、表单、浮层、反馈与导航。" },
  { id: "agents", title: "智能体组件", blurb: "为 AI 产品设计：思考过程、任务进度、对话输入与联网搜索。" },
  { id: "blocks", title: "区块", blurb: "开箱即用的复合区块：侧边栏、设置、通知中心、数据网格。" },
  { id: "charts", title: "图表", blurb: "成品图表卡片：标题、图例、交互与状态一应俱全。" },
  { id: "templates", title: "模板", blurb: "完整页面，复制即可上线。" },
];

export const categoryTitle = (c: Category) => CATEGORIES.find((x) => x.id === c)?.title ?? c;

export function allItems(): RegistryItem[] {
  return registry;
}

export function itemsIn(category: Category): RegistryItem[] {
  return registry.filter((i) => i.category === category);
}

export function getItem(slug: string): RegistryItem | undefined {
  return registry.find((i) => i.slug === slug && i.category !== "templates");
}

export function getTemplate(slug: string): RegistryItem | undefined {
  return registry.find((i) => i.slug === slug && i.category === "templates");
}

export function components(): RegistryItem[] {
  return registry.filter((i) => i.category !== "templates");
}

export function templates(): RegistryItem[] {
  return registry.filter((i) => i.category === "templates");
}

/** Previous / next within the flat component order (for page footers). */
export function neighbours(slug: string) {
  const list = components();
  const i = list.findIndex((x) => x.slug === slug);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}
