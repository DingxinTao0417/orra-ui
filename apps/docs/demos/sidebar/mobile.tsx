"use client";

import { useState } from "react";
import { RiCalendar2Line, RiHome5Line, RiInbox2Line, RiPieChart2Line } from "@remixicon/react";
import { Sidebar, SidebarTrigger } from "@orra-ui/react";

export default function SidebarMobile() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-[360px] w-[320px] flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-card">
      <header className="flex h-14 items-center gap-2 border-b border-line bg-surface px-3">
        <SidebarTrigger responsive={false} onPress={() => setOpen(true)} />
        <span className="text-body font-medium text-fg">移动端视图</span>
      </header>
      <p className="p-4 text-body-sm text-fg-muted">点击左上角的菜单按钮，侧边栏会以抽屉形式从起始边滑出；选择页面后自动关闭。</p>
      <Sidebar
        mode="drawer"
        mobileOpen={open}
        onMobileOpenChange={setOpen}
        defaultActiveKey="inbox"
        workspaces={[{ id: "shop", name: "青柚商城", description: "运营后台" }]}
        user={{ name: "沈晓雯", email: "shen@qingyou.shop" }}
        sections={[
          {
            id: "main",
            items: [
              { id: "home", label: "首页", icon: <RiHome5Line /> },
              { id: "inbox", label: "订单消息", icon: <RiInbox2Line />, badge: 18, badgeTone: "danger" },
              { id: "calendar", label: "活动日历", icon: <RiCalendar2Line /> },
              { id: "reports", label: "经营报表", icon: <RiPieChart2Line /> },
            ],
          },
        ]}
      />
    </div>
  );
}
