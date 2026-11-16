"use client";

import { RiRocket2Line } from "@remixicon/react";
import { Button, Notification } from "@orra-ui/react";

export default function NotificationVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Notification variant="soft" tone="info" title="soft · 浅色底" description="默认样式，适合页面顶部的提示。" />
      <Notification variant="outline" tone="success" title="outline · 卡片底" description="放在卡片或表单内部时更克制。" />
      <Notification variant="accent" tone="warning" title="accent · 侧边色条" description="强调程度介于二者之间。" />
      <Notification
        variant="outline"
        tone="neutral"
        icon={<RiRocket2Line />}
        title="自定义图标，操作放在末尾"
        actionsPlacement="end"
        actions={<Button size="sm" variant="outline" tone="neutral">查看</Button>}
      />
    </div>
  );
}
