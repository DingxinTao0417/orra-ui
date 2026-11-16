"use client";

import { Kbd } from "@orra-ui/react";

export default function KbdVariants() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Kbd keys="mod+shift+p" platform="mac" />
          <span className="text-caption text-fg-subtle">macOS</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Kbd keys="mod+shift+p" platform="other" />
          <span className="text-caption text-fg-subtle">Windows / Linux</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Kbd keys="mod+k" joined size="sm" />
        <Kbd keys="mod+k" joined variant="soft" />
        <Kbd keys={["up", "down"]} variant="soft" size="lg" />
        <Kbd variant="ghost">Tab</Kbd>
      </div>
      <p className="text-body-sm text-fg-muted">
        按 <Kbd keys="/" size="sm" /> 聚焦搜索框，按 <Kbd keys="shift+?" size="sm" /> 查看全部快捷键。
      </p>
    </div>
  );
}
