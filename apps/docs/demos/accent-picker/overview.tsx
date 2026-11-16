"use client";

import { AccentPicker, Badge, Button, Switch } from "@orra-ui/react";

export default function AccentPickerOverview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-1">
        <span className="text-body font-medium text-fg">主题色</span>
        <span className="text-body-sm text-fg-subtle">选择后整个界面立即换色，并保存在本地。</span>
      </div>
      <AccentPicker showValue />
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button size="sm">主要操作</Button>
        <Button size="sm" variant="soft">
          次要操作
        </Button>
        <Badge tone="accent">新功能</Badge>
        <Switch size="sm" defaultSelected>
          自动同步
        </Switch>
      </div>
    </div>
  );
}
