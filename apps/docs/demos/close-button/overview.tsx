"use client";

import { CloseButton } from "@orra-ui/react";

export default function CloseButtonOverview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <CloseButton size="sm" />
        <CloseButton size="md" />
        <CloseButton size="lg" />
        <CloseButton variant="soft" round />
      </div>
      <div className="flex items-center gap-3 rounded-control bg-surface-inverse py-2 ps-4 pe-2 text-body-sm text-fg-inverse">
        已复制邀请链接
        <CloseButton size="sm" variant="inverse" />
      </div>
    </div>
  );
}
