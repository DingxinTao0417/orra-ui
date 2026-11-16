import type { Metadata } from "next";
import { CardLinks, DocPage, H2, P } from "@/components/site/doc-page";
import { components, templates } from "@/lib/registry";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "开始使用" };

export default function Introduction() {
  return (
    <DocPage title="开始使用" description={`${site.name} 是一套为仪表盘和 AI 智能体界面打造的 React 设计系统：可以作为 npm 包直接引入，也可以用 CLI 把源码复制进项目，还能通过 MCP 服务器和智能体技能让 AI 直接用它写界面。`}>
      <H2>它包含什么</H2>
      <P>
        {components().length} 个组件（基础组件、智能体组件、区块与图表卡片）和 {templates().length} 个完整页面模板。所有组件基于 React Aria 无障碍原语、Tailwind CSS v4 语义变量与 Motion 动效构建，开箱支持深色模式、RTL 和键盘操作。
      </P>
      <H2>三种使用方式</H2>
      <CardLinks
        items={[
          { title: "npm 包", href: "/docs/installation", description: `pnpm add ${site.packageName}，按需引入，随版本升级。` },
          { title: "CLI 复制源码", href: "/docs/cli", description: "orra-ui add button —— 源码进入你的仓库，随意修改。" },
          { title: "MCP 服务器", href: "/docs/mcp", description: "让 Claude、Cursor 等智能体实时查询组件 API 与示例。" },
          { title: "智能体技能", href: "/docs/skills", description: "一条命令为智能体装上设计规范与组件目录。" },
        ]}
      />
      <H2>设计原则</H2>
      <ul className="flex list-disc flex-col gap-2 ps-5 text-body text-fg-muted">
        <li><strong className="text-fg">语义变量优先</strong>：颜色全部来自语义 token（如 <code>text-fg</code>、<code>bg-surface</code>），深色模式自动翻转。</li>
        <li><strong className="text-fg">复合字号</strong>：<code>text-body font-medium</code> 一个类同时设定字号、字重、行高与字距。</li>
        <li><strong className="text-fg">克制的动效</strong>：淡入 + 轻微缩放 + 小幅模糊，悬停 150ms，按下变深而不缩放。</li>
        <li><strong className="text-fg">无障碍</strong>：表单、浮层、菜单、表格全部基于 React Aria，焦点与键盘行为正确。</li>
      </ul>
      <H2>下一步</H2>
      <CardLinks
        items={[
          { title: "浏览组件", href: "/components", description: "实时预览、代码与属性表。" },
          { title: "主题定制", href: "/docs/theming", description: "更换品牌色、调整语义变量。" },
        ]}
      />
    </DocPage>
  );
}
