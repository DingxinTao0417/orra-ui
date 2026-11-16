"use client";

import { Badge, type BadgeTone, type BadgeVariant } from "@orra-ui/react";

const VARIANTS: BadgeVariant[] = ["soft", "solid", "outline"];
const TONES: { tone: BadgeTone; label: string }[] = [
  { tone: "neutral", label: "归档" },
  { tone: "accent", label: "进行中" },
  { tone: "success", label: "已完成" },
  { tone: "warning", label: "即将到期" },
  { tone: "danger", label: "已逾期" },
  { tone: "info", label: "提示" },
];

export default function BadgeVariants() {
  return (
    <div className="grid grid-cols-[auto_repeat(3,auto)] items-center gap-x-5 gap-y-3">
      <span />
      {VARIANTS.map((v) => (
        <span key={v} className="font-mono text-caption text-fg-subtle">
          {v}
        </span>
      ))}
      {TONES.map(({ tone, label }) => (
        <div key={tone} className="contents">
          <span className="font-mono text-caption text-fg-subtle">{tone}</span>
          {VARIANTS.map((v) => (
            <Badge key={v} tone={tone} variant={v} dot={v !== "solid"}>
              {label}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
