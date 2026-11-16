import { RiBookOpenLine, RiDownload2Line, RiPlugLine, RiRobot2Line, RiPaletteLine, RiFontSize, RiLayoutGridLine, RiLayout4Line, RiTerminalBoxLine, RiContrastDrop2Line, RiTextDirectionL } from "@remixicon/react";
import type { ComponentType } from "react";

export type NavLink = { title: string; href: string; icon?: ComponentType<{ className?: string }>; badge?: string };

export const GUIDES: NavLink[] = [
  { title: "开始使用", href: "/docs", icon: RiBookOpenLine },
  { title: "安装", href: "/docs/installation", icon: RiDownload2Line },
  { title: "CLI 命令行", href: "/docs/cli", icon: RiTerminalBoxLine },
  { title: "MCP 服务器", href: "/docs/mcp", icon: RiPlugLine, badge: "AI" },
  { title: "智能体技能", href: "/docs/skills", icon: RiRobot2Line, badge: "AI" },
  { title: "主题定制", href: "/docs/theming", icon: RiContrastDrop2Line },
  { title: "RTL 与国际化", href: "/docs/rtl", icon: RiTextDirectionL },
];

export const FOUNDATIONS: NavLink[] = [
  { title: "颜色", href: "/foundations/colors", icon: RiPaletteLine },
  { title: "字体排版", href: "/foundations/typography", icon: RiFontSize },
  { title: "全部组件", href: "/components", icon: RiLayoutGridLine },
  { title: "模板", href: "/templates", icon: RiLayout4Line },
];
