"use client";

import { useState } from "react";
import { Button, ComposerLoader } from "@orra-ui/react";

export default function ComposerLoaderOverview() {
  const [active, setActive] = useState(true);
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <ComposerLoader active={active} label="正在分析季度报表…" onStop={() => setActive(false)}>
        <div className="flex min-h-28 flex-col justify-between rounded-card border border-line-strong bg-surface p-4 shadow-card">
          <p className="text-body text-fg">对比 Q2 和 Q3 华东区收入，找出下滑原因并给出建议。</p>
          <p className="text-caption text-fg-subtle">已附加 Q3 销售明细.xlsx</p>
        </div>
      </ComposerLoader>
      {active ? null : (
        <Button size="sm" variant="outline" tone="neutral" onPress={() => setActive(true)}>
          重新开始
        </Button>
      )}
    </div>
  );
}
