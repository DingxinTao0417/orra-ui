import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Callout, DocPage, H2, P } from "@/components/site/doc-page";
import { InstallTabs } from "@/components/site/install-tabs";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "CLI 命令行" };

const rows: [string, string][] = [
  ["init", "安装 npm 包并在全局 CSS 中加入样式引入；加 --source 则改为源码模式（只写入样式与工具函数）。"],
  ["add <名称...>", "把组件或模板的源码（含内部依赖）复制到 components/orra-ui/，并安装缺失的 npm 依赖。"],
  ["list [分类]", "列出全部组件，可按 base / agents / blocks / charts / templates 过滤。"],
  ["search <关键词>", "中英文关键词搜索，例如「日期」「chat input」。"],
  ["info <名称>", "在终端查看某个组件的安装方式、引入语句、属性表与示例代码。"],
  ["skill", "为 AI 智能体安装技能与常驻规则（Claude Code / Cursor / AGENTS.md）。"],
  ["mcp", "以 stdio 方式启动 MCP 服务器。"],
];

export default function CliPage() {
  return (
    <DocPage title="CLI 命令行" description={`${site.cliPackage} 是组件库的命令行工具：初始化项目、复制组件源码、查询文档，同时内置 MCP 服务器。它离线工作——注册表随包一起发布。`}>
      <H2>快速开始</H2>
      <InstallTabs dlx={`${site.cliPackage} add button select date-picker`} />
      <H2>命令</H2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-start">
          <tbody>
            {rows.map(([cmd, desc]) => (
              <tr key={cmd} className="border-b border-line align-top last:border-0">
                <td className="px-4 py-3 font-mono text-body-sm font-medium whitespace-nowrap text-fg">{cmd}</td>
                <td className="px-4 py-3 text-body-sm text-fg-muted">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H2>常用参数</H2>
      <CodeBlock
        lang="bash"
        code={`--dir <目录>      源码写入位置（默认 components/orra-ui）
--overwrite       覆盖已存在的文件
--no-install      只写文件，不安装 npm 依赖
--cwd <目录>      项目根目录（默认当前目录）
-y, --yes         不询问，使用默认值`}
      />
      <H2>源码模式如何工作</H2>
      <P>
        <code>add</code> 会沿着导入关系收集组件需要的所有文件（例如 Select 会带上表单字段、浮层样式与 cx 工具），保持相对路径原样写入，因此无需配置路径别名。第一次添加时还会写入 <code>styles.css</code> 及设计变量文件，并尝试自动加到你的全局 CSS 中。
      </P>
      <CodeBlock
        lang="bash"
        code={`components/orra-ui/
├── components/select/select.tsx
├── components/button/button.tsx
├── lib/cx.ts
├── lib/recipes.ts
├── lib/field.tsx
├── lib/copy.ts
├── styles/tokens.css
├── styles/typography.css
├── styles/motion.css
├── styles/base.css
└── styles.css`}
      />
      <Callout>模板（如 finance、ai-chat）通过 add 安装时会复制页面专属的源码，并依赖 npm 包 {site.packageName} 提供基础组件，CLI 会一并安装。</Callout>
    </DocPage>
  );
}
