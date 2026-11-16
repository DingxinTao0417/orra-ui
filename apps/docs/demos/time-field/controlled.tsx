"use client";

import { useState } from "react";
import { Time } from "@internationalized/date";
import { TimeField } from "@orra-ui/react";

export default function TimeFieldControlled() {
  const [time, setTime] = useState<Time | null>(new Time(19, 0));
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <TimeField
        label="预约到店时间"
        value={time}
        onChange={setTime}
        hourCycle={24}
        minValue={new Time(10)}
        maxValue={new Time(21, 30)}
        errorMessage="营业时间为 10:00 – 21:30。"
        description="营业时间 10:00 – 21:30"
      />
      <p className="text-body-sm text-fg-muted">
        已选择：<span className="font-medium text-fg tabular-nums">{time ? time.toString().slice(0, 5) : "未选择"}</span>
      </p>
    </div>
  );
}
