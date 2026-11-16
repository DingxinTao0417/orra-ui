import type { Metadata } from "next";
import { CopyButton } from "@/components/site/copy-button";
import { DocPage, H2, P } from "@/components/site/doc-page";

export const metadata: Metadata = { title: "颜色" };

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const GROUPS: { title: string; note: string; tokens: string[] }[] = [
  { title: "表面", note: "canvas 是页面底色，surface 是卡片与输入框，muted 用于凹槽和轨道，raised 用于菜单与对话框。", tokens: ["canvas", "surface", "surface-muted", "surface-hover", "surface-active", "surface-raised", "surface-inverse"] },
  { title: "文字", note: "fg 用于标题和正文，muted 用于辅助说明，subtle 用于提示与元信息。", tokens: ["fg", "fg-muted", "fg-subtle", "fg-disabled", "fg-accent", "fg-on-accent", "fg-inverse"] },
  { title: "线条", note: "line 是分割线和卡片描边，line-strong 是控件边框，focus 是键盘焦点环。", tokens: ["line", "line-strong", "line-hover", "focus"] },
  { title: "状态", note: "每种状态都有前景色与柔和背景色一对。", tokens: ["success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft"] },
  { title: "图表", note: "所有图表共用的 8 个系列色，以及网格和坐标轴颜色。", tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7", "chart-8", "chart-grid", "chart-axis"] },
];

function Swatch({ token }: { token: string }) {
  const cssVar = `--color-${token}`;
  return (
    <div className="group flex items-center gap-3 rounded-control border border-line bg-surface p-2 pe-1">
      <span className="size-10 shrink-0 rounded-[8px] border border-line" style={{ background: `var(${cssVar})` }} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-caption font-medium text-fg">{token}</div>
        <div className="truncate font-mono text-micro text-fg-subtle">var({cssVar})</div>
      </div>
      <CopyButton value={`var(${cssVar})`} className="opacity-0 group-hover:opacity-100" />
    </div>
  );
}

export default function ColorsPage() {
  return (
    <DocPage section="基础规范" title="颜色" description="组件只使用语义颜色。切换右上角的深色模式，下面每个色块都会跟着变化——这就是组件里不需要写 dark: 的原因。">
      <H2>强调色 Accent</H2>
      <P>主要操作、选中态、链接和焦点使用的品牌色阶，可以在「主题定制」里一键更换。</P>
      <div className="grid grid-cols-11 overflow-hidden rounded-control border border-line">
        {SHADES.map((s) => (
          <div key={s} className="flex flex-col">
            <div className="h-14" style={{ background: `var(--color-accent-${s})` }} />
            <div className="bg-surface py-1.5 text-center font-mono text-micro text-fg-subtle">{s}</div>
          </div>
        ))}
      </div>
      {GROUPS.map((g) => (
        <section key={g.title} className="flex flex-col gap-3">
          <H2>{g.title}</H2>
          <P>{g.note}</P>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </div>
        </section>
      ))}
    </DocPage>
  );
}
