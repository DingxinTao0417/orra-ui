import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Callout, DocPage, H2, P } from "@/components/site/doc-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "MCP 服务器" };

const tools: [string, string][] = [
  ["list_components", "列出全部组件与模板，可按分类过滤。"],
  ["search_components", "按意图或关键词（中英文）搜索，返回最匹配的组件。"],
  ["get_component", "完整文档：说明、安装、引入、属性表、使用要点与可运行示例；可选附带源码。"],
  ["get_component_source", "获取组件源文件，便于理解内部实现或二次修改。"],
  ["get_design_rules", "必须遵守的设计规范：语义颜色、复合字号、间距圆角、cx/图标/表单/焦点/RTL。"],
  ["get_theme", "主题指南（变量家族、字号、深色模式、换肤），可附带原始 theme.css。"],
  ["get_patterns", "页面配方（仪表盘、表格页、登录、AI 对话、设置）与动效规范。"],
  ["get_setup_guide", "在项目中安装与接入的步骤。"],
  ["add_components", "把组件源码写入项目并安装依赖（源码模式）。"],
];

export default function McpPage() {
  return (
    <DocPage title="MCP 服务器" description="通过 Model Context Protocol，让 Claude Code、Cursor、VS Code、Windsurf 等智能体在写代码时实时查询组件 API、示例与设计规范，而不是凭记忆猜测。">
      <H2>Claude Code</H2>
      <CodeBlock lang="bash" code={`claude mcp add orra-ui -- npx -y ${site.cliPackage} mcp`} />
      <P>或在项目根目录的 <code>.mcp.json</code> 中声明，团队成员会共享同一配置：</P>
      <CodeBlock
        title=".mcp.json"
        lang="json"
        code={`{
  "mcpServers": {
    "orra-ui": {
      "command": "npx",
      "args": ["-y", "${site.cliPackage}", "mcp"]
    }
  }
}`}
      />
      <H2>Cursor</H2>
      <CodeBlock
        title=".cursor/mcp.json"
        lang="json"
        code={`{
  "mcpServers": {
    "orra-ui": { "command": "npx", "args": ["-y", "${site.cliPackage}", "mcp"] }
  }
}`}
      />
      <H2>VS Code</H2>
      <CodeBlock
        title=".vscode/mcp.json"
        lang="json"
        code={`{
  "servers": {
    "orra-ui": { "type": "stdio", "command": "npx", "args": ["-y", "${site.cliPackage}", "mcp"] }
  }
}`}
      />
      <H2>提供的工具</H2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-start">
          <tbody>
            {tools.map(([name, desc]) => (
              <tr key={name} className="border-b border-line align-top last:border-0">
                <td className="px-4 py-3 font-mono text-body-sm font-medium whitespace-nowrap text-fg">{name}</td>
                <td className="px-4 py-3 text-body-sm text-fg-muted">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H2>试一试</H2>
      <P>接入后，可以直接对智能体说：</P>
      <CodeBlock lang="text" code={`用 Orra UI 做一个财务仪表盘：顶部 4 个指标卡，下面是营收面积图和支出排行，最底部是交易表格。`} />
      <Callout>MCP 服务器完全离线运行，组件注册表随 npm 包发布，不会把你的代码发送到任何地方。</Callout>
    </DocPage>
  );
}
