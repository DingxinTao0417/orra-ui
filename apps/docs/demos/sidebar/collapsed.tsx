"use client";

import { useState } from "react";
import { RiBarChartBoxLine, RiChatSmile3Line, RiDashboardLine, RiFileList3Line, RiRobot2Line, RiSettings3Line } from "@remixicon/react";
import { Sidebar, Switch, type SidebarNavSection } from "@orra-ui/react";

const NAV: SidebarNavSection[] = [
  {
    id: "main",
    items: [
      { id: "overview", label: "总览", icon: <RiDashboardLine />, href: "#overview" },
      { id: "chats", label: "对话", icon: <RiChatSmile3Line />, href: "#chats", badge: 12, badgeTone: "accent" },
      {
        id: "agents",
        label: "智能体",
        icon: <RiRobot2Line />,
        items: [
          { id: "support", label: "客服助手", href: "#support" },
          { id: "analyst", label: "数据分析师", href: "#analyst", badge: "新" },
          { id: "writer", label: "文案助手", href: "#writer" },
        ],
      },
      { id: "logs", label: "调用日志", icon: <RiFileList3Line />, href: "#logs" },
      { id: "usage", label: "用量", icon: <RiBarChartBoxLine />, href: "#usage" },
    ],
  },
  { id: "system", title: "系统", items: [{ id: "settings", label: "设置", icon: <RiSettings3Line />, href: "#settings" }] },
];

export default function SidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="flex h-[560px] w-full overflow-hidden bg-canvas">
      <Sidebar
        mode="rail"
        variant="inset"
        sections={NAV}
        defaultActiveKey="analyst"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        workspaces={[{ id: "ai", name: "灵犀 AI 平台", description: "企业版" }]}
        user={{ name: "金诺亚", email: "noah@lingxi.ai", status: "busy" }}
      />
      <main className="m-2 ms-0 flex flex-1 items-start rounded-card border border-line bg-surface p-6 shadow-card">
        <Switch isSelected={collapsed} onChange={setCollapsed}>
          收起为图标栏
        </Switch>
      </main>
    </div>
  );
}
