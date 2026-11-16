"use client";

import { Switch } from "@orra-ui/react";

export default function SwitchOverview() {
  return (
    <div className="flex flex-col gap-4">
      <Switch defaultSelected>自动保存草稿</Switch>
      <Switch description="关闭后，新成员需要管理员审批才能加入。">允许通过链接加入</Switch>
      <Switch size="sm" defaultSelected>
        紧凑模式
      </Switch>
      <Switch isDisabled>同步到日历（未授权）</Switch>
    </div>
  );
}
