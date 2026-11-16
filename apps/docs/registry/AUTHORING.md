# 组件文档编写规范（Authoring guide）

每个组件的文档由两部分组成：

1. `apps/docs/registry/items/<slug>.json` — 元数据（标题、描述、示例列表、属性表）。
2. `apps/docs/demos/<slug>/<name>.tsx` — 实时演示，文档站的「预览」渲染它，「代码」页签展示它的源码，MCP / CLI 也会把它作为用法示例提供给 AI 智能体。

完整参考：`registry/items/button.json` + `demos/button/*.tsx`。

## JSON 字段

| 字段 | 说明 |
| --- | --- |
| `slug` `name` `title` `category` | 已预填，不要改。 |
| `files` | 组件入口源码，相对 `packages/react/src`，如 `["components/select/select.tsx"]`。第一个是用户引入的主模块。 |
| `description` | 一到两句中文，说明它是什么、有什么特点。不提及任何其他 UI 库/品牌。 |
| `keywords` | 中英文同义词，用于搜索，如 `["select", "dropdown", "下拉", "选择"]`。 |
| `exports` | 引入片段里展示的具名导出，按重要性排序。必须是 `@orra-ui/react` 根入口真实导出的名字。 |
| `isNew` | 可选，`true` 会在侧栏显示「新」。 |
| `demos` | 2–5 个示例。第一个是页首大预览（「概览」），应最能代表组件。每项：`file`（相对 `demos/`）、`title`（中文）、`description`（可选，中文）、`height`（预览区最小高度 px，默认 280）、`layout`（`center` 默认 / `padded` / `full`）。 |
| `notes` | 可选，2–4 条中文使用要点（无障碍、受控/非受控、常见坑）。 |
| `props` | 属性表，按组件分组：`[{ component, description?, props: [{ name, type, default?, required?, description }] }]`。只列真实存在的属性；说明用中文；`type` 用 TS 写法。继承的原生/React Aria 属性用一句 `description` 概括，不要逐个列出。 |

## 演示文件规则

- 第一行必须是 `"use client";`，默认导出一个无参数组件，名字用 PascalCase（如 `SelectWithIcons`）。
- 一律从包根入口引入：`import { Select, SelectItem } from "@orra-ui/react";`（只有根入口没导出的名字才用深路径 `@orra-ui/react/components/<slug>/<slug>`）。图标用 `@remixicon/react`，以元素形式传入，如 `startIcon={<RiAddLine />}`。
- 文案用简体中文、贴近真实产品场景（人名、团队名、数据都要自然）。不要出现任何其他 UI 库或品牌名。
- 只使用设计系统的语义类（见 `packages/react/CONVENTIONS.md`）：颜色 `text-fg` / `text-fg-muted` / `text-fg-subtle`、`bg-surface`、`bg-canvas`、`border-line`；字号 `text-body`、`text-body-sm`、`text-caption`、`text-title-sm` 配合 `font-medium`。不要写 `text-gray-500`、`bg-white`、hex 颜色，也不要写 `dark:` 覆盖。
- 演示只负责布局容器（`flex gap-3`、`w-full max-w-sm` 等），不要重新实现组件已提供的样式。
- 宽组件（图表卡片、数据表格、侧栏等）给外层设定合理宽度，如 `<div className="w-[420px]">` 或 `w-full max-w-2xl`，并用 `layout: "padded"` 或合适的 `height`。
- 需要状态时用 `useState` 做成受控示例，让读者能真正交互。
- 不要引入 `next/*`、不要请求网络、不要读取外部图片（头像可用 `Avatar` 的 `initials`，或省略 `src`）。
- 保持精简：每个示例 10–60 行，聚焦一个知识点。

## 自检

```bash
node scripts/build-registry.mjs                # 重新生成注册表（会报告缺失的 demo 文件）
cd apps/docs && npx tsc --noEmit                # 类型检查
curl -s -o /dev/null -w "%{http_code}" http://localhost:3200/components/<slug>   # 期望 200
```
