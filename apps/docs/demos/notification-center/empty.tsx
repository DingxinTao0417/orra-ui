"use client";

import { NotificationCenter } from "@orra-ui/react";

export default function NotificationCenterEmpty() {
  return (
    <div className="w-full max-w-[380px]">
      <NotificationCenter defaultItems={[]} defaultTab="unread" />
    </div>
  );
}
