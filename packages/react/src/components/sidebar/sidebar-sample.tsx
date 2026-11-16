"use client";

import { RiBankCardLine, RiCalendar2Line, RiFolder3Line, RiHome5Line, RiInbox2Line, RiPieChart2Line, RiSettings3Line, RiTeamLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import type { SidebarNavSection, SidebarUser, SidebarWorkspace } from "./sidebar-types";

const COPY = {
  en: {
    home: "Home",
    inbox: "Inbox",
    projects: "Projects",
    website: "Website refresh",
    mobile: "Mobile app 2.0",
    planning: "2027 planning",
    calendar: "Calendar",
    reports: "Reports",
    workspace: "Workspace",
    team: "Team",
    billing: "Billing",
    settings: "Settings",
    northwind: "Northwind Studio",
    northwindDesc: "Team · 18 members",
    personal: "Personal",
    personalDesc: "Free plan",
    labs: "Fieldnote Labs",
    labsDesc: "Business · 64 members",
  },
  zh: {
    home: "首页",
    inbox: "收件箱",
    projects: "项目",
    website: "官网改版",
    mobile: "移动端 2.0",
    planning: "2027 年度规划",
    calendar: "日程",
    reports: "报表",
    workspace: "工作区",
    team: "成员",
    billing: "账单",
    settings: "设置",
    northwind: "北风工作室",
    northwindDesc: "团队版 · 18 位成员",
    personal: "个人空间",
    personalDesc: "免费版",
    labs: "拾光实验室",
    labsDesc: "企业版 · 64 位成员",
  },
};

/** Sample navigation, workspaces and user for Sidebar (clearly sample data). */
export function useSidebarSample(): { sections: SidebarNavSection[]; workspaces: SidebarWorkspace[]; user: SidebarUser } {
  const t = useCopy(COPY);
  return {
    sections: [
      {
        id: "main",
        items: [
          { id: "home", label: t.home, icon: <RiHome5Line />, href: "#home" },
          { id: "inbox", label: t.inbox, icon: <RiInbox2Line />, href: "#inbox", badge: 4 },
          {
            id: "projects",
            label: t.projects,
            icon: <RiFolder3Line />,
            items: [
              { id: "website", label: t.website, href: "#website" },
              { id: "mobile", label: t.mobile, href: "#mobile", badge: 2 },
              { id: "planning", label: t.planning, href: "#planning" },
            ],
          },
          { id: "calendar", label: t.calendar, icon: <RiCalendar2Line />, href: "#calendar" },
          { id: "reports", label: t.reports, icon: <RiPieChart2Line />, href: "#reports" },
        ],
      },
      {
        id: "workspace",
        title: t.workspace,
        items: [
          { id: "team", label: t.team, icon: <RiTeamLine />, href: "#team" },
          { id: "billing", label: t.billing, icon: <RiBankCardLine />, href: "#billing" },
          { id: "settings", label: t.settings, icon: <RiSettings3Line />, href: "#settings" },
        ],
      },
    ],
    workspaces: [
      { id: "northwind", name: t.northwind, description: t.northwindDesc },
      { id: "labs", name: t.labs, description: t.labsDesc },
      { id: "personal", name: t.personal, description: t.personalDesc },
    ],
    user: { name: "Mira Lin", email: "mira@northwind.studio", status: "online" },
  };
}
