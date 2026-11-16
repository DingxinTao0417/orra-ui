"use client";

import { useState } from "react";
import { RiGitBranchLine, RiGitMergeLine, RiGitPullRequestLine, RiTerminalBoxLine } from "@remixicon/react";
import { CommandPalette, CommandPaletteGroup, CommandPaletteItem, Kbd } from "@orra-ui/react";

export default function CommandPaletteShortcut() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2 text-body text-fg-muted">
      <p className="flex items-center gap-2">
        按下 <Kbd keys="mod+j" /> 打开开发者命令
      </p>
      <p className="text-body-sm text-fg-subtle">当前状态：{open ? "已打开" : "已关闭"}</p>
      <CommandPalette
        shortcut="mod+j"
        isOpen={open}
        onOpenChange={setOpen}
        placeholder="搜索 Git 命令…"
        footer={<span>共 4 条命令 · 支持中英文搜索</span>}
      >
        <CommandPaletteGroup title="Git">
          <CommandPaletteItem id="branch" icon={<RiGitBranchLine />} keywords={["branch", "checkout"]}>
            切换分支
          </CommandPaletteItem>
          <CommandPaletteItem id="pr" icon={<RiGitPullRequestLine />} keywords={["pull request", "review"]}>
            创建合并请求
          </CommandPaletteItem>
          <CommandPaletteItem id="merge" icon={<RiGitMergeLine />} keywords={["merge"]}>
            合并到主干
          </CommandPaletteItem>
          <CommandPaletteItem id="terminal" icon={<RiTerminalBoxLine />} keywords={["terminal", "shell"]} shortcut="ctrl+`">
            打开终端
          </CommandPaletteItem>
        </CommandPaletteGroup>
      </CommandPalette>
    </div>
  );
}
