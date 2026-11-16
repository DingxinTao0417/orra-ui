"use client";

import { Button, Divider } from "@orra-ui/react";

export default function DividerOverview() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Button variant="outline" tone="neutral" fullWidth>
        使用企业单点登录
      </Button>
      <Divider>或使用邮箱登录</Divider>
      <Button fullWidth>发送登录链接</Button>
    </div>
  );
}
