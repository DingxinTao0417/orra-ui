"use client";

import { Kbd } from "@orra-ui/react";

const SHORTCUTS = [
  { action: "打开命令面板", keys: "mod+k" },
  { action: "新建文档", keys: "mod+alt+n" },
  { action: "发送消息", keys: "mod+enter" },
  { action: "切换侧栏", keys: "mod+\\" },
  { action: "关闭弹窗", keys: "esc" },
];

export default function KbdOverview() {
  return (
    <div className="w-full max-w-xs rounded-card border border-line bg-surface p-2 shadow-card">
      {SHORTCUTS.map((s) => (
        <div key={s.action} className="flex items-center justify-between rounded-control px-3 py-2">
          <span className="text-body-sm text-fg-muted">{s.action}</span>
          <Kbd keys={s.keys} />
        </div>
      ))}
    </div>
  );
}
