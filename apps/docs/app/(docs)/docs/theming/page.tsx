import type { Metadata } from "next";
import { CodeBlock } from "@/components/site/code-block";
import { DocPage, H2, P } from "@/components/site/doc-page";
import { AccentPlayground } from "@/components/site/accent-playground";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "主题定制" };

export default function ThemingPage() {
  return (
    <DocPage title="主题定制" description="CSS 优先的 Tailwind v4：没有 tailwind.config.js。所有设计变量都是 --orra-* CSS 自定义属性，并映射成 bg-surface、text-fg 这样的语义工具类。">
      <H2>两层变量</H2>
      <P>每个主题的原始值写在 <code>:root</code>（浅色）和 <code>.dark</code>（深色）里的 <code>--orra-*</code> 变量上；<code>@theme inline</code> 再把它们映射成 Tailwind 工具类。组件只使用语义类，所以切换 <code>.dark</code> 或覆盖某个变量，整套界面都会跟着变。</P>
      <H2>实时换色</H2>
      <P>选一个主题色试试，整个站点（按钮、链接、焦点环、选中态、Logo）都会跟着变化，并记住你的选择：</P>
      <AccentPlayground />
      <H2>在代码中更换品牌色</H2>
      <P>运行时切换（例如让用户自选品牌色）用 <code>setAccent</code>：它会为浅色和深色各生成一套 11 级 OKLCH 色阶并记住选择。</P>
      <CodeBlock
        code={`import { setAccent } from "${site.packageName}";

setAccent({ preset: "violet" });   // 预设：blue、indigo、violet、pink、rose、orange、amber、green、teal、cyan、slate
setAccent({ hex: "#7C3AED" });     // 任意品牌色
setAccent(null);                   // 恢复默认`}
      />
      <P>也可以直接在 CSS 里覆盖色阶变量：</P>
      <CodeBlock
        title="app/globals.css"
        lang="css"
        code={`@import "tailwindcss";
@import "${site.packageName}/styles.css";

:root {
  --orra-accent-500: oklch(0.6 0.22 295);
  --orra-accent-600: oklch(0.53 0.23 295);
  /* …其余 50–950 档 */
}`}
      />
      <H2>语义变量家族</H2>
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[560px] text-start">
          <tbody className="text-body-sm text-fg-muted">
            {[
              ["表面", "bg-canvas、bg-surface、bg-surface-muted、bg-surface-hover、bg-surface-raised"],
              ["文字", "text-fg、text-fg-muted、text-fg-subtle、text-fg-accent、text-fg-on-accent"],
              ["线条", "border-line、border-line-strong、ring-focus"],
              ["状态", "success / warning / danger / info，各带 -soft 背景色"],
              ["图表", "chart-1 … chart-8、chart-grid、chart-axis"],
              ["强调色", "accent-50 … accent-950、bg-accent-gradient"],
              ["圆角", "rounded-control（10px）、rounded-menu（14px）、rounded-card（20px）"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-line last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-fg">{k}</td>
                <td className="px-4 py-3 font-mono text-caption">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H2>调整语义层</H2>
      <P>想整体调整视觉时，改变量而不是组件代码。例如让卡片描边更柔和，只需覆盖 <code>--orra-line</code>（记得同时覆盖 <code>.dark</code> 下的值）；图表配色同理，覆盖 <code>--orra-chart-1…8</code> 即可。</P>
    </DocPage>
  );
}
