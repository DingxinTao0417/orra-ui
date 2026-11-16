import type { Metadata } from "next";
import { DocPage, H2, P } from "@/components/site/doc-page";

export const metadata: Metadata = { title: "字体排版" };

const SCALE: { cls: string; size: string; role: string; sample: string }[] = [
  { cls: "text-display-lg", size: "48 / 52", role: "首屏大标题", sample: "为智能体而生" },
  { cls: "text-display", size: "36 / 42", role: "营销标题", sample: "数据一目了然" },
  { cls: "text-title-lg", size: "24 / 30", role: "页面标题", sample: "财务概览" },
  { cls: "text-title", size: "20 / 28", role: "区块标题", sample: "本月营收" },
  { cls: "text-title-sm", size: "17 / 24", role: "卡片标题", sample: "活跃用户" },
  { cls: "text-body-lg", size: "15 / 23", role: "导语", sample: "智能体已完成 12 个任务中的 9 个" },
  { cls: "text-body", size: "14 / 21", role: "默认界面文字", sample: "按钮、输入框、菜单与表格都使用这一档" },
  { cls: "text-body-sm", size: "13 / 19", role: "紧凑界面文字", sample: "密集列表与次要说明" },
  { cls: "text-caption", size: "12 / 16", role: "标签与元信息", sample: "更新于 3 分钟前" },
  { cls: "text-micro", size: "11 / 14", role: "最小注释", sample: "BETA · v0.1" },
];

const WEIGHTS: [string, string][] = [
  ["font-normal", "常规 400"],
  ["font-medium", "中等 500"],
  ["font-semibold", "半粗 600"],
  ["font-bold", "粗体 700"],
];

export default function TypographyPage() {
  return (
    <DocPage section="基础规范" title="字体排版" description="字号工具类一次设定字号、行高和字距；字重单独用 font-medium、font-semibold 搭配。">
      <H2>字号</H2>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {SCALE.map((s) => (
          <div key={s.cls} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-baseline sm:gap-6">
            <div className="w-40 shrink-0">
              <div className="font-mono text-caption font-medium text-fg">{s.cls}</div>
              <div className="text-caption text-fg-subtle">{s.size} · {s.role}</div>
            </div>
            <div className={`min-w-0 truncate font-semibold text-fg ${s.cls}`}>{s.sample}</div>
          </div>
        ))}
      </div>
      <H2>字重</H2>
      <div className="grid gap-3 sm:grid-cols-4">
        {WEIGHTS.map(([cls, label]) => (
          <div key={cls} className="rounded-card border border-line bg-surface p-4">
            <div className={`text-title text-fg ${cls}`}>Aa 字体</div>
            <div className="mt-1 font-mono text-caption text-fg-subtle">{cls} · {label}</div>
          </div>
        ))}
      </div>
      <H2>字体</H2>
      <P>界面字体为 Inter（中文回退到苹方、微软雅黑等系统字体），代码字体为 JetBrains Mono，分别通过 CSS 变量 <code>--font-inter</code> 与 <code>--font-mono-source</code> 接入。数字较多的地方加上 <code>tabular-nums</code>，让数字等宽对齐。</P>
    </DocPage>
  );
}
