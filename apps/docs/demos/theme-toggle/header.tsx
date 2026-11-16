"use client";

import { RiQuestionLine } from "@remixicon/react";
import { Avatar, IconButton, ThemeToggle } from "@orra-ui/react";

export default function ThemeToggleInHeader() {
  return (
    <div className="flex w-full max-w-xl items-center gap-2 rounded-card border border-line bg-surface px-4 py-2.5 shadow-card">
      <span className="text-body font-semibold text-fg">北风工作室</span>
      <span className="text-body-sm text-fg-subtle">/ 运营看板</span>
      <div className="flex-1" />
      <IconButton icon={<RiQuestionLine />} aria-label="帮助" />
      <ThemeToggle variant="menu" />
      <Avatar name="林依然" size="sm" />
    </div>
  );
}
