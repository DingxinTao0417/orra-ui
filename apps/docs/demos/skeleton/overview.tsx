"use client";

import { Skeleton, SkeletonCard, SkeletonText } from "@orra-ui/react";

export default function SkeletonOverview() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <SkeletonCard media />
      <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <Skeleton shape="text" width="40%" className="h-3.5" />
          <Skeleton shape="pill" width={64} />
        </div>
        <Skeleton height={28} width="55%" />
        <Skeleton height={120} className="rounded-menu" />
        <SkeletonText lines={2} size="sm" />
      </div>
    </div>
  );
}
