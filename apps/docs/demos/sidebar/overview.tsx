"use client";

import { useState } from "react";
import {
  RiBankCardLine,
  RiCalendar2Line,
  RiFlashlightLine,
  RiFolder3Line,
  RiHome5Line,
  RiInbox2Line,
  RiPieChart2Line,
  RiSettings3Line,
  RiTeamLine,
} from "@remixicon/react";
import { Button, Sidebar, SidebarTrigger, type SidebarNavSection } from "@orra-ui/react";

const NAV: SidebarNavSection[] = [
  {
    id: "main",
    items: [
      { id: "home", label: "首页", icon: <RiHome5Line />, href: "#home" },
      { id: "inbox", label: "收件箱", icon: <RiInbox2Line />, href: "#inbox", badge: 4 },
      {
        id: "projects",
        label: "项目",
        icon: <RiFolder3Line />,
        items: [
          { id: "website", label: "官网改版", href: "#website" },
          { id: "mobile", label: "移动端 2.0", href: "#mobile", badge: 2 },
          { id: "planning", label: "2027 年度规划", href: "#planning" },
        ],
      },
      { id: "calendar", label: "日程", icon: <RiCalendar2Line />, href: "#calendar" },
      { id: "reports", label: "报表", icon: <RiPieChart2Line />, href: "#reports" },
    ],
  },
  {
    id: "workspace",
    title: "工作区",
    items: [
      { id: "team", label: "成员", icon: <RiTeamLine />, href: "#team" },
      { id: "billing", label: "账单", icon: <RiBankCardLine />, href: "#billing" },
      { id: "settings", label: "设置", icon: <RiSettings3Line />, href: "#settings" },
    ],
  },
];

const WORKSPACES = [
  { id: "northwind", name: "北风工作室", description: "团队版 · 18 位成员" },
  { id: "labs", name: "拾光实验室", description: "企业版 · 64 位成员" },
];

export default function SidebarOverview() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("home");
  return (
    <div className="flex h-[700px] w-full overflow-hidden bg-canvas">
      <Sidebar
        sections={NAV}
        workspaces={WORKSPACES}
        user={{ name: "林依然", email: "lin@northwind.cn", status: "online" }}
        activeKey={page}
        onActiveChange={setPage}
        mobileOpen={open}
        onMobileOpenChange={setOpen}
        onSearch={() => alert("打开命令面板")}
        onCreateWorkspace={() => {}}
        footer={
          <div className="flex flex-col gap-2 rounded-menu border border-line bg-surface-muted p-3">
            <span className="flex items-center gap-1.5 text-body-sm font-medium text-fg">
              <RiFlashlightLine className="size-4 text-fg-accent" />
              试用还剩 9 天
            </span>
            <span className="text-caption text-fg-subtle">升级团队版，解锁自动化与高级报表。</span>
            <Button size="sm">立即升级</Button>
          </div>
        }
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-line px-4">
          <SidebarTrigger onPress={() => setOpen(true)} />
          <span className="text-body font-medium text-fg">当前页面：{page}</span>
        </header>
        <div className="grid flex-1 grid-cols-2 gap-4 p-6">
          <div className="rounded-card border border-dashed border-line-strong" />
          <div className="rounded-card border border-dashed border-line-strong" />
        </div>
      </main>
    </div>
  );
}
