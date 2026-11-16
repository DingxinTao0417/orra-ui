"use client";

import { useState } from "react";
import type { Selection } from "react-aria-components";
import { RiBuilding2Line, RiTeamLine, RiUserLine } from "@remixicon/react";
import { TreeView, type TreeViewNode } from "@orra-ui/react";

const ORG: TreeViewNode[] = [
  {
    id: "product",
    name: "产品研发中心",
    icon: <RiBuilding2Line />,
    children: [
      {
        id: "design",
        name: "设计组",
        icon: <RiTeamLine />,
        children: [
          { id: "lin", name: "林晓雨", icon: <RiUserLine /> },
          { id: "shen", name: "沈清禾", icon: <RiUserLine /> },
        ],
      },
      {
        id: "frontend",
        name: "前端组",
        icon: <RiTeamLine />,
        children: [
          { id: "gu", name: "顾一鸣", icon: <RiUserLine /> },
          { id: "chen", name: "陈默", icon: <RiUserLine /> },
        ],
      },
    ],
  },
  { id: "ops", name: "运营部", icon: <RiBuilding2Line />, children: [{ id: "xu", name: "许嘉宁", icon: <RiUserLine /> }] },
];

export default function TreeViewCheckboxes() {
  const [selected, setSelected] = useState<Selection>(new Set(["lin", "gu"]));
  const count = selected === "all" ? "全部" : selected.size;
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="rounded-card border border-line bg-surface p-2 shadow-card">
        <TreeView
          aria-label="选择参会人"
          items={ORG}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          defaultExpandedKeys={["product", "design", "frontend"]}
          density="compact"
        />
      </div>
      <p className="text-body-sm text-fg-subtle">已选择 {count} 项</p>
    </div>
  );
}
