import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Callout, DocPage, H2, P } from "@/components/site/doc-page";
import { InstallTabs } from "@/components/site/install-tabs";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "智能体技能" };

export default function SkillsPage() {
  return (
    <DocPage title="智能体技能" description="技能（Skill）是智能体常驻加载的知识：组件目录、设计规范、页面配方与动效语言。装上之后，智能体会优先使用真实组件，而不是手写一个长得像的。">
      <H2>一键安装</H2>
      <P>默认安装到当前项目的 <code>.claude/skills/orra-ui/</code>，并在 <code>AGENTS.md</code> 中写入常驻规则（Codex、Cursor、Copilot 等读取 AGENTS.md 的工具都会生效）。</P>
      <InstallTabs dlx={`${site.cliPackage} skill`} />
      <CodeBlock
        lang="bash"
        code={`# 只装 Claude Code 技能，并装到用户目录（所有项目可用）
npx ${site.cliPackage} skill --target claude --global

# 同时生成 Cursor 规则 .cursor/rules/orra-ui.mdc
npx ${site.cliPackage} skill --target all`}
      />
      <H2>包含的内容</H2>
      <CodeBlock
        lang="bash"
        code={`.claude/skills/orra-ui/
├── SKILL.md                  # 工作流、设计规范、选型建议、常见坑
└── references/
    ├── components.md         # 完整组件目录：导出名、安装命令、示例代码（自动生成）
    ├── rules.md              # 常驻设计规范
    ├── theming.md            # 设计变量、字号体系、深色模式、换肤
    ├── patterns.md           # 仪表盘 / 表格 / 登录 / AI 对话 / 设置页配方
    └── motion.md             # 时长、缓动与入场退场配方`}
      />
      <H2>工作流</H2>
      <ol className="flex list-decimal flex-col gap-2 ps-5 text-body text-fg-muted">
        <li>检测项目是否已接入（package.json 中的 {site.packageName} 或 components/orra-ui/）。</li>
        <li>在组件目录或 MCP 中查找准确的组件名与属性。</li>
        <li>直接引入或用 CLI 复制，不重写已有组件。</li>
        <li>按规范组合页面：语义颜色、复合字号、cx() 合并类名、深色模式交给变量。</li>
        <li>交付前自检：没有原始色板类、没有手拼字号、没有 dark: 颜色覆盖。</li>
      </ol>
      <Callout>技能负责「常识」，MCP 服务器负责「实时查询」。两者一起使用效果最好：技能让智能体知道该用什么，MCP 让它拿到准确的属性和示例。</Callout>
      <H2>手动安装</H2>
      <P>技能文件在仓库的 <code>skills/orra-ui/</code> 目录中，也随 {site.cliPackage} 一起发布，可直接复制到任何支持技能的智能体中。</P>
    </DocPage>
  );
}
