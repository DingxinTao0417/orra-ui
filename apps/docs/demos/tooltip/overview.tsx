"use client";

import { RiBold, RiItalic, RiLink, RiListUnordered, RiUnderline } from "@remixicon/react";
import { IconButton, Tooltip } from "@orra-ui/react";

const TOOLS = [
  { icon: <RiBold />, label: "加粗", shortcut: "mod+b" },
  { icon: <RiItalic />, label: "斜体", shortcut: "mod+i" },
  { icon: <RiUnderline />, label: "下划线", shortcut: "mod+u" },
  { icon: <RiLink />, label: "插入链接", shortcut: "mod+k" },
  { icon: <RiListUnordered />, label: "无序列表", shortcut: "mod+shift+8" },
];

export default function TooltipOverview() {
  return (
    <div className="flex items-center gap-1 rounded-control border border-line bg-surface p-1 shadow-xs">
      {TOOLS.map((tool) => (
        <Tooltip key={tool.label} content={tool.label} shortcut={tool.shortcut}>
          <IconButton icon={tool.icon} aria-label={tool.label} size="sm" />
        </Tooltip>
      ))}
    </div>
  );
}
