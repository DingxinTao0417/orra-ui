"use client";

import { useState, type ReactNode } from "react";
import {
  RiBarChartBoxLine,
  RiCalendar2Line,
  RiDashboardLine,
  RiHeartPulseLine,
  RiKanbanView2,
  RiMegaphoneLine,
  RiSparkling2Line,
  RiTeamLine,
  RiUserStarLine,
  RiWallet3Line,
} from "@remixicon/react";
import {
  Breadcrumb,
  NotificationCenterPopover,
  SearchField,
  Sidebar,
  SidebarTrigger,
  ThemeToggle,
  type NotificationCenterItem,
  type SidebarNavSection,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";

/** Every template in the dashboard family, so the sidebar doubles as a template switcher. */
const NAV: SidebarNavSection[] = [
  {
    id: "workspace",
    items: [
      { id: "dashboard", label: "总览", icon: <RiDashboardLine />, href: "/templates/dashboard" },
      { id: "finance", label: "财务", icon: <RiWallet3Line />, href: "/templates/finance" },
      { id: "marketing", label: "营销", icon: <RiMegaphoneLine />, href: "/templates/marketing" },
      { id: "hr", label: "人力", icon: <RiTeamLine />, href: "/templates/hr" },
      { id: "medical-profile", label: "健康档案", icon: <RiHeartPulseLine />, href: "/templates/medical-profile" },
    ],
  },
  {
    id: "work",
    title: "协作",
    items: [
      { id: "project-board", label: "项目看板", icon: <RiKanbanView2 />, href: "/templates/project-board", badge: 3 },
      { id: "calendar", label: "日程", icon: <RiCalendar2Line />, href: "/templates/calendar" },
      { id: "ai-profile", label: "AI 使用档案", icon: <RiUserStarLine />, href: "/templates/ai-profile" },
    ],
  },
  {
    id: "ai",
    title: "AI 应用",
    items: [
      { id: "ai-chat", label: "AI 编程助手", icon: <RiSparkling2Line />, href: "/templates/ai-chat" },
      { id: "reports", label: "报表中心", icon: <RiBarChartBoxLine />, href: "/templates/marketing" },
    ],
  },
];

const WORKSPACES = [
  { id: "orra", name: "Orra 工作室", description: "团队版 · 24 位成员" },
  { id: "lab", name: "星桥实验室", description: "企业版 · 86 位成员" },
];

const USER = { name: "林依然", email: "yiran@orra.studio", status: "online" as const };

function sampleInbox(): NotificationCenterItem[] {
  const now = Date.now();
  const h = 3_600_000;
  return [
    { id: "n1", actor: { name: "周以安" }, title: <><b>周以安</b> 评论了「Q4 预算复盘」</>, description: "第三页的渠道拆分可以再细一点吗？", time: now - 0.4 * h, mention: true },
    { id: "n2", actor: { name: "陈默" }, title: <><b>陈默</b> 邀请你加入「品牌焕新」项目</>, time: now - 3 * h, actions: [{ id: "accept", label: "加入" }, { id: "decline", label: "忽略" }] },
    { id: "n3", icon: <RiWallet3Line />, tone: "accent", title: "11 月账单已生成", description: "本月用量较上月增长 12%。", time: now - 26 * h, read: true },
  ];
}

export interface DashboardShellProps {
  /** Sidebar item id of this page. */
  active: string;
  /** Breadcrumb trail after the workspace root. */
  crumbs: string[];
  title: ReactNode;
  description?: ReactNode;
  /** Buttons at the end of the title row. */
  actions?: ReactNode;
  /** Remove the max-width / padding (e.g. full-bleed boards). */
  bleed?: boolean;
  children: ReactNode;
}

/**
 * The shared frame of every dashboard-family template: sidebar (doubles as a
 * template switcher), a top bar with breadcrumb, search, notifications and
 * theme toggle, then a title row and the page body.
 */
export function DashboardShell({ active, crumbs, title, description, actions, bleed, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inbox, setInbox] = useState(sampleInbox);
  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar sections={NAV} activeKey={active} workspaces={WORKSPACES} user={USER} variant="inset" mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 px-4 lg:px-6">
          <SidebarTrigger onPress={() => setMobileOpen(true)} className="lg:hidden" />
          <Breadcrumb items={[{ label: "Orra 工作室", href: "/templates/dashboard" }, ...crumbs.map((label) => ({ label }))]} className="hidden min-w-0 sm:flex" />
          <div className="flex-1" />
          <SearchField aria-label="搜索" placeholder="搜索…" size="sm" className="hidden w-56 md:flex" />
          <NotificationCenterPopover items={inbox} onItemsChange={setInbox} size="sm" />
          <ThemeToggle variant="icon" />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className={cx("flex flex-col gap-6", bleed ? "px-4 pb-6 lg:px-6" : "mx-auto w-full max-w-[1320px] px-4 pb-10 lg:px-6")}>
            <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-title-lg font-semibold text-fg">{title}</h1>
                {description ? <p className="text-body text-fg-muted">{description}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
