"use client";

import { useState } from "react";
import { Announcement, Button } from "@orra-ui/react";

export default function AnnouncementTones() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex w-full flex-col gap-3">
      <Announcement tone="neutral" badge="限时" href="#pricing" linkLabel="查看方案">
        年付套餐享 8 折，截至 12 月 31 日
      </Announcement>
      <Announcement tone="inverse" badge={null} open={open} onOpenChange={setOpen} dismissible>
        计划维护：11 月 20 日 02:00–04:00 期间导出功能暂停使用
      </Announcement>
      {!open ? (
        <Button size="sm" variant="outline" tone="neutral" className="self-center" onPress={() => setOpen(true)}>
          恢复维护通知
        </Button>
      ) : null}
      <div className="flex justify-center pt-2">
        <Announcement variant="pill" badge="招聘" dismissible>
          我们正在招聘设计工程师
        </Announcement>
      </div>
    </div>
  );
}
