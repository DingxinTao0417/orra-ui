"use client";

import { useState } from "react";
import { NumberField } from "@orra-ui/react";

export default function NumberFieldControlled() {
  const [seats, setSeats] = useState(8);
  const price = 89;
  const total = Number.isNaN(seats) ? 0 : seats * price;
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <NumberField
        label="团队席位"
        stepper="split"
        value={seats}
        onChange={setSeats}
        minValue={3}
        maxValue={50}
        isInvalid={seats > 40}
        errorMessage="超过 40 席请联系销售获取企业报价。"
        description="每席 ¥89 / 月，最少 3 席。"
      />
      <div className="flex items-baseline justify-between rounded-control bg-surface-muted px-3 py-2">
        <span className="text-body-sm text-fg-muted">每月合计</span>
        <span className="text-title-sm font-semibold tabular-nums text-fg">¥{total.toLocaleString("zh-CN")}</span>
      </div>
    </div>
  );
}
