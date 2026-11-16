"use client";

import { RiCloudLine, RiQuestionLine } from "@remixicon/react";
import { Avatar, Tooltip, TooltipTarget } from "@orra-ui/react";

export default function TooltipTargetDemo() {
  return (
    <div className="flex items-center gap-6 text-body text-fg-muted">
      <Tooltip content="上次同步：2 分钟前">
        <TooltipTarget className="gap-1.5">
          <RiCloudLine className="size-4" />
          已同步
        </TooltipTarget>
      </Tooltip>
      <Tooltip content="毛利率 = (收入 − 成本) ÷ 收入">
        <TooltipTarget className="gap-1 text-fg">
          毛利率 38.2%
          <RiQuestionLine className="size-4 text-fg-subtle" />
        </TooltipTarget>
      </Tooltip>
      <Tooltip content="沈清禾 · 产品设计">
        <TooltipTarget className="rounded-full">
          <Avatar name="沈清禾" size="sm" />
        </TooltipTarget>
      </Tooltip>
    </div>
  );
}
