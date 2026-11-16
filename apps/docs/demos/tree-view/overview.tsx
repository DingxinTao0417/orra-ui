"use client";

import { RiFileImageLine, RiMarkdownLine } from "@remixicon/react";
import { TreeView, type TreeViewNode } from "@orra-ui/react";

const FILES: TreeViewNode[] = [
  {
    id: "brand",
    name: "品牌资产",
    children: [
      { id: "logo", name: "logo-primary.svg", icon: <RiFileImageLine />, meta: "12 KB" },
      { id: "palette", name: "配色规范.pdf", meta: "2.4 MB" },
    ],
  },
  {
    id: "campaign",
    name: "双十一活动",
    children: [
      {
        id: "visuals",
        name: "主视觉",
        children: [
          { id: "kv-a", name: "KV-横版.png", icon: <RiFileImageLine />, meta: "3.1 MB" },
          { id: "kv-b", name: "KV-竖版.png", icon: <RiFileImageLine />, meta: "2.8 MB" },
        ],
      },
      { id: "brief", name: "活动简报.md", icon: <RiMarkdownLine />, meta: "8 KB" },
    ],
  },
  { id: "readme", name: "README.md", icon: <RiMarkdownLine />, meta: "1 KB" },
];

export default function TreeViewOverview() {
  return (
    <div className="w-full max-w-xs rounded-card border border-line bg-surface p-2 shadow-card">
      <TreeView aria-label="项目文件" items={FILES} selectionMode="single" defaultSelectedKeys={["brief"]} defaultExpandedKeys={["campaign", "visuals"]} />
    </div>
  );
}
