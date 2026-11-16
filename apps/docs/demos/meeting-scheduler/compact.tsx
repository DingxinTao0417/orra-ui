"use client";

import { useState } from "react";
import type { CalendarDate } from "@internationalized/date";
import { MeetingScheduler } from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Afternoons only, every 45 minutes; Fridays are fully booked.
function afternoonSlots(date: CalendarDate) {
  if (date.toDate("UTC").getUTCDay() === 5) return [];
  return ["13:30", "14:15", "15:00", "15:45", "16:30"];
}

export default function MeetingSchedulerCompact() {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="w-full max-w-[400px]">
      <MeetingScheduler
        host={{ name: "周以安", subtitle: "客户成功经理" }}
        title="季度业务回顾"
        duration={45}
        locationType="in-person"
        location="上海 · 静安嘉里中心 2 座 18F"
        getSlots={afternoonSlots}
        hourCycle={12}
        confirming={confirming}
        onConfirm={async () => {
          setConfirming(true);
          await wait(1200);
          setConfirming(false);
        }}
      />
    </div>
  );
}
