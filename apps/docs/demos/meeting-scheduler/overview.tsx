"use client";

import { useState } from "react";
import { MeetingScheduler, type MeetingSlot } from "@orra-ui/react";

export default function MeetingSchedulerOverview() {
  const [slot, setSlot] = useState<MeetingSlot | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-5xl flex-col gap-3">
      <MeetingScheduler
        host={{ name: "林晓雨", subtitle: "解决方案顾问 · 云杉科技" }}
        title="产品演示与需求沟通"
        description="30 分钟线上演示，了解你的团队流程并推荐合适的套餐。"
        duration={30}
        locationType="video"
        location="腾讯会议（预约后发送链接）"
        timeZone="Asia/Shanghai"
        value={slot}
        onChange={setSlot}
        onConfirm={(s) => setBooked(`${s.date.toString()} ${s.time}`)}
      />
      <p className="text-body-sm text-fg-subtle">{booked ? `已预约：${booked}` : "选择日期和时间后点击确认"}</p>
    </div>
  );
}
