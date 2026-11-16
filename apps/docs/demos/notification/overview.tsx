"use client";

import { Button, Notification } from "@orra-ui/react";

export default function NotificationOverview() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Notification tone="info" title="新版本可用" description="v3.2 带来了看板筛选与 PDF 导出，刷新页面即可体验。" dismissible />
      <Notification tone="success" title="数据同步完成" description="已从 CRM 导入 1,284 条客户记录。" />
      <Notification
        tone="warning"
        title="试用期还剩 3 天"
        description="升级到团队版以保留全部项目与成员。"
        actions={
          <>
            <Button size="sm">立即升级</Button>
            <Button size="sm" variant="plain" tone="neutral">
              了解套餐
            </Button>
          </>
        }
      />
      <Notification tone="danger" title="支付方式已过期" description="尾号 4021 的银行卡已于 10 月到期，请及时更新以免服务中断。" dismissible />
    </div>
  );
}
