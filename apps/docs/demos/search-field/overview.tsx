"use client";

import { SearchField } from "@orra-ui/react";

export default function SearchFieldOverview() {
  return (
    <div className="w-full max-w-sm">
      <SearchField aria-label="全局搜索" placeholder="搜索文档、成员或项目" shortcut="j" />
    </div>
  );
}
