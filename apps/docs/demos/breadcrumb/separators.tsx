"use client";

import { Breadcrumb } from "@orra-ui/react";

const ITEMS = [{ label: "文档", href: "#" }, { label: "组件", href: "#" }, { label: "面包屑" }];

export default function BreadcrumbSeparators() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Breadcrumb items={ITEMS} />
      <Breadcrumb items={ITEMS} separator="slash" />
      <Breadcrumb items={ITEMS} separator={<span className="text-fg-disabled">·</span>} size="sm" />
    </div>
  );
}
