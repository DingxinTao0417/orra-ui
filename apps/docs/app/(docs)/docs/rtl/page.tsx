import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { DocPage, H2, P } from "@/components/site/doc-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "RTL 与国际化" };

export default function RtlPage() {
  return (
    <DocPage title="RTL 与国际化" description="组件全部使用逻辑属性（start / end），OrraProvider 会同步文字方向、键盘行为、弹出层位置和内置文案语言，阿拉伯语、希伯来语等从右到左的语言开箱可用。">
      <H2>为整个应用设置方向</H2>
      <P>在根部包一层 <code>OrraProvider</code>，传入明确的 BCP 47 语言标签；同时在 <code>&lt;html&gt;</code> 上设置对应的 <code>lang</code> 与 <code>dir</code>。只设置 CSS 的 dir 不会改变 React Aria 的键盘导航与浮层定位。</P>
      <CodeBlock
        code={`import { OrraProvider } from "${site.packageName}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <OrraProvider locale="ar">{children}</OrraProvider>
      </body>
    </html>
  );
}`}
      />
      <H2>局部区域</H2>
      <P>Provider 可以嵌套，用于在中文页面中嵌入一块阿拉伯语内容。默认渲染为 <code>display: contents</code>，不影响布局。</P>
      <CodeBlock code={`<OrraProvider locale="he">\n  <CommentThread />\n</OrraProvider>`} />
      <H2>编写自己的组件时</H2>
      <ul className="flex list-disc flex-col gap-2 ps-5 text-body text-fg-muted">
        <li>使用逻辑类：<code>ms</code>/<code>me</code>、<code>ps</code>/<code>pe</code>、<code>start</code>/<code>end</code>、<code>text-start</code>、<code>border-s</code>、<code>rounded-e</code>。</li>
        <li>自定义交互用 <code>useOrraLocale().direction</code> 读取方向；导航类箭头图标在 RTL 下需要镜像。</li>
        <li>代码、验证码、邮箱和 URL 放在显式 LTR 区域，混排文本用 <code>&lt;bdi&gt;</code> 或 <code>dir=&quot;auto&quot;</code> 隔离。</li>
        <li>图表、画布和测量几何保持物理坐标，不要镜像。</li>
      </ul>
      <H2>内置文案的语言</H2>
      <P>组件里的内置文案（关闭、加载中、无结果、步骤剩余等）自带简体中文和英文两套，按当前语言自动选择：<code>zh-*</code> 用中文，其余用英文。每个带文案的组件都接受 <code>labels</code> 属性，可以单独改写任意一句：</P>
      <CodeBlock
        code={`<OrraProvider locale="zh-CN">
  <App />
</OrraProvider>

// 单独改写某个组件的文案
<Pagination labels={{ previous: "上一页", next: "下一页" }} />`}
      />
    </DocPage>
  );
}
