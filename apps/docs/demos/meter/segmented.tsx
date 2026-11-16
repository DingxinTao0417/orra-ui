"use client";

import { useState } from "react";
import { Button, Meter } from "@orra-ui/react";

export default function MeterSegmented() {
  const [credits, setCredits] = useState(14);
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Meter label="密码强度" value={3} maxValue={4} segments={4} accentWhenOk invert thresholds={{ warning: 0.5, critical: 0.25 }} valueLabel="较强" showStatus={false} />
      <Meter label="剩余 AI 额度" value={credits} maxValue={40} invert segments={8} size="lg" />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" tone="neutral" onPress={() => setCredits((c) => Math.max(0, c - 5))}>
          使用 5 次
        </Button>
        <Button size="sm" variant="soft" onPress={() => setCredits(40)}>
          充值额度
        </Button>
      </div>
    </div>
  );
}
