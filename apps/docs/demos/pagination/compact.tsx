"use client";

import { Pagination } from "@orra-ui/react";

export default function PaginationCompact() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full max-w-[320px] rounded-card border border-dashed border-line-strong p-3">
        <p className="mb-2 text-caption text-fg-subtle">窄容器（320px）· auto 自动切换为紧凑模式</p>
        <Pagination total={240} defaultPage={3} />
      </div>
      <div className="w-fit">
        <Pagination total={240} defaultPage={3} mode="compact" variant="outline" />
      </div>
    </div>
  );
}
