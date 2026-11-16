import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { Callout, DocPage, H2, P, Step, Steps } from "@/components/site/doc-page";
import { InstallTabs } from "@/components/site/install-tabs";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "安装" };

export default function Installation() {
  return (
    <DocPage title="安装" description="在 Next.js、Vite 或任何 React 19 + Tailwind CSS v4 项目中使用。">
      <H2>自动安装</H2>
      <P>在项目根目录运行 init：它会安装 npm 包，并把样式引入写进你的全局 CSS。</P>
      <InstallTabs dlx={`${site.cliPackage} init`} />
      <H2>手动安装</H2>
      <Steps>
        <Step title="安装依赖">
          <P>确保项目已经使用 Tailwind CSS v4（Next.js 用 <code>@tailwindcss/postcss</code>，Vite 用 <code>@tailwindcss/vite</code>）。</P>
          <InstallTabs packages={site.packageName} />
        </Step>
        <Step title="引入样式">
          <P>在全局 CSS 中，紧跟 Tailwind 之后引入组件库样式。它包含设计变量、字号体系与组件动画，并通过 <code>@source</code> 让 Tailwind 扫描到组件内部用到的类名。</P>
          <CodeBlock title="app/globals.css" lang="css" code={`@import "tailwindcss";\n@import "${site.packageName}/styles.css";`} />
        </Step>
        <Step title="配置字体（推荐）">
          <P>设计系统使用 Inter，通过 CSS 变量 <code>--font-inter</code> 接入；代码字体使用 <code>--font-mono-source</code>。不配置时会回退到系统字体。</P>
          <CodeBlock
            title="app/layout.tsx"
            code={`import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-source" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={\`\${inter.variable} \${mono.variable}\`}>
      <body>{children}</body>
    </html>
  );
}`}
          />
        </Step>
        <Step title="开始使用">
          <CodeBlock
            title="app/page.tsx"
            code={`import { Button } from "${site.packageName}";
import { RiAddLine } from "@remixicon/react";

export default function Page() {
  return <Button startIcon={<RiAddLine />}>新建项目</Button>;
}`}
          />
        </Step>
      </Steps>
      <H2>深色模式</H2>
      <P>在 <code>&lt;html&gt;</code> 上切换 <code>dark</code> 类即可，所有组件都通过语义颜色自动适配。内置的 <code>ThemeToggle</code> 或 <code>setThemeMode("light" | "dark" | "system")</code> 会切换并记住选择。为避免首屏闪烁，在 <code>&lt;head&gt;</code> 里内联 <code>themeScript</code>：</P>
      <CodeBlock
        title="app/layout.tsx"
        code={`import { themeScript } from "${site.packageName}/lib/theme-script";

// <head> 中：
<script dangerouslySetInnerHTML={{ __html: themeScript }} />`}
      />
      <Callout>
        用到状态、事件或表格的组件需要放在 <code>&quot;use client&quot;</code> 模块中（React Aria 表格在服务端组件里会渲染不出列）。
      </Callout>
      <H2>引入方式</H2>
      <P>推荐从根入口按需引入（配合 Next.js 的 <code>optimizePackageImports</code> 或任意支持 tree-shaking 的打包器）：</P>
      <CodeBlock code={`import { Button, Select, SelectItem, toast } from "${site.packageName}";`} />
      <P>也可以按路径深层引入单个模块：</P>
      <CodeBlock code={`import { Button } from "${site.packageName}/components/button/button";\nimport { cx } from "${site.packageName}/lib/cx";`} />
    </DocPage>
  );
}
