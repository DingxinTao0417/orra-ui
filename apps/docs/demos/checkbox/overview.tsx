"use client";

import { Checkbox, CheckboxGroup } from "@orra-ui/react";

export default function CheckboxOverview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Checkbox defaultSelected description="每周一早上 9 点发送上周的数据摘要。">
        订阅周报
      </Checkbox>
      <CheckboxGroup label="通知渠道" defaultValue={["email", "app"]} description="至少保留一个渠道。">
        <Checkbox value="email">邮件</Checkbox>
        <Checkbox value="app">站内信</Checkbox>
        <Checkbox value="sms">短信</Checkbox>
        <Checkbox value="wecom" isDisabled>
          企业微信（未绑定）
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
}
