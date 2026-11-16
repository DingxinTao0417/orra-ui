"use client";

import { Spinner } from "@orra-ui/react";

export default function SpinnerOverview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-8">
        <Spinner size="xl" />
        <Spinner size="xl" variant="dots" />
        <Spinner size="xl" variant="ring" tone="neutral" />
      </div>
      <Spinner variant="dots" tone="neutral" label="正在生成周报摘要…" />
    </div>
  );
}
