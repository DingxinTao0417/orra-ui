"use client";

import { useState } from "react";
import { RiHome5Line } from "@remixicon/react";
import { Breadcrumb, type BreadcrumbItemData } from "@orra-ui/react";

const PATH: BreadcrumbItemData[] = [
  { id: "root", label: "全部文件", icon: <RiHome5Line /> },
  { id: "company", label: "公司资料" },
  { id: "finance", label: "财务部" },
  { id: "2026", label: "2026 年" },
  { id: "q4", label: "第四季度" },
  { id: "invoice", label: "供应商发票" },
];

export default function BreadcrumbCollapsed() {
  const [depth, setDepth] = useState(PATH.length);
  const items = PATH.slice(0, depth);
  return (
    <div className="flex flex-col items-center gap-3">
      <Breadcrumb
        items={items}
        maxItems={4}
        onAction={(id) => setDepth(PATH.findIndex((p) => p.id === id) + 1)}
      />
      <p className="text-body-sm text-fg-subtle">超过 4 级时，中间层级折叠进「…」菜单；点击任一层级可返回。</p>
      {depth < PATH.length ? (
        <button type="button" className="text-body-sm text-fg-accent" onClick={() => setDepth(PATH.length)}>
          恢复完整路径
        </button>
      ) : null}
    </div>
  );
}
