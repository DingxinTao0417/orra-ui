"use client";

import { SearchField } from "@orra-ui/react";

export default function SearchFieldVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <SearchField aria-label="小号搜索" size="sm" placeholder="小号" />
      <SearchField aria-label="圆角搜索" round placeholder="圆角胶囊样式" shortcut="/" />
      <SearchField aria-label="大号搜索" size="lg" placeholder="搜索帮助中心" defaultValue="发票" />
    </div>
  );
}
