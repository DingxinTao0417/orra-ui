"use client";

import { useEffect, useState } from "react";
import { Avatar, Button, Skeleton, SkeletonSwap, SkeletonText } from "@orra-ui/react";

export default function SkeletonSwapDemo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <SkeletonSwap
        loading={loading}
        className="w-full"
        fallback={
          <div className="flex gap-3 rounded-card border border-line bg-surface p-5">
            <Skeleton shape="circle" width={40} />
            <div className="flex flex-1 flex-col gap-3 pt-1">
              <Skeleton shape="text" width="40%" />
              <SkeletonText lines={2} size="sm" />
            </div>
          </div>
        }
      >
        <div className="flex gap-3 rounded-card border border-line bg-surface p-5">
          <Avatar name="周子航" />
          <div className="flex flex-col gap-1">
            <span className="text-body-sm font-medium text-fg">周子航 · 产品经理</span>
            <p className="text-body-sm text-fg-muted">新版引导流程已经上线灰度 10%，首日激活率提升 6.2%，明天扩大到 50%。</p>
          </div>
        </div>
      </SkeletonSwap>
      <Button variant="outline" tone="neutral" size="sm" onPress={() => setLoading(true)} isDisabled={loading}>
        重新加载
      </Button>
    </div>
  );
}
