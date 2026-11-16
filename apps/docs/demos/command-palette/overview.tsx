"use client";

import { useState } from "react";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiFileTextLine,
  RiHome5Line,
  RiMoonLine,
  RiSearchLine,
  RiSettings3Line,
  RiTeamLine,
  RiTimeLine,
  RiUserAddLine,
} from "@remixicon/react";
import { Button, CommandPalette, CommandPaletteGroup, CommandPaletteItem, Kbd } from "@orra-ui/react";

export default function CommandPaletteOverview() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <CommandPalette
        shortcut={false}
        onAction={(key) => setLast(String(key))}
        trigger={
          <Button variant="outline" tone="neutral" startIcon={<RiSearchLine />} className="w-64 justify-start text-fg-subtle">
            <span className="flex-1 text-start">搜索或执行命令…</span>
            <Kbd keys="mod+k" size="sm" joined />
          </Button>
        }
      >
        <CommandPaletteGroup title="最近访问">
          <CommandPaletteItem id="recent-q4" icon={<RiTimeLine />} description="增长实验室 · 2 小时前">
            Q4 渠道复盘
          </CommandPaletteItem>
          <CommandPaletteItem id="recent-okr" icon={<RiTimeLine />} description="管理层 · 昨天">
            2027 年度 OKR 草案
          </CommandPaletteItem>
        </CommandPaletteGroup>
        <CommandPaletteGroup title="页面">
          <CommandPaletteItem id="home" icon={<RiHome5Line />} keywords={["home", "dashboard", "首页"]}>
            工作台
          </CommandPaletteItem>
          <CommandPaletteItem id="reports" icon={<RiBarChartBoxLine />} keywords={["reports", "analytics"]}>
            数据报表
          </CommandPaletteItem>
          <CommandPaletteItem id="team" icon={<RiTeamLine />} keywords={["team", "members"]}>
            团队成员
          </CommandPaletteItem>
          <CommandPaletteItem id="settings" icon={<RiSettings3Line />} keywords={["settings", "preferences"]} shortcut="mod+,">
            设置
          </CommandPaletteItem>
        </CommandPaletteGroup>
        <CommandPaletteGroup title="操作">
          <CommandPaletteItem id="new-doc" icon={<RiFileTextLine />} shortcut="mod+n" keywords={["new", "create"]}>
            新建文档
          </CommandPaletteItem>
          <CommandPaletteItem id="new-project" icon={<RiAddLine />} keywords={["project"]}>
            新建项目
          </CommandPaletteItem>
          <CommandPaletteItem id="invite" icon={<RiUserAddLine />} description="通过邮箱邀请同事加入工作区" keywords={["invite"]}>
            邀请成员
          </CommandPaletteItem>
          <CommandPaletteItem id="theme" icon={<RiMoonLine />} shortcut="mod+shift+l" keywords={["dark", "theme", "深色"]}>
            切换深色模式
          </CommandPaletteItem>
        </CommandPaletteGroup>
      </CommandPalette>
      <p className="text-body-sm text-fg-subtle">{last ? `已执行：${last}` : "点击按钮打开（本页已占用 ⌘K，因此关闭了全局快捷键）"}</p>
    </div>
  );
}
