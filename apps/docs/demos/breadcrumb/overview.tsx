"use client";

import { RiFolder3Line, RiHome5Line } from "@remixicon/react";
import { Breadcrumb } from "@orra-ui/react";

export default function BreadcrumbOverview() {
  return (
    <Breadcrumb
      items={[
        { label: "工作台", href: "#", icon: <RiHome5Line /> },
        { label: "增长实验室", href: "#", icon: <RiFolder3Line /> },
        { label: "Q4 渠道复盘", href: "#" },
        { label: "投放数据明细" },
      ]}
    />
  );
}
