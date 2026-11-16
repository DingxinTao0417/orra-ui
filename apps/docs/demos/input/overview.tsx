"use client";

import { RiLockLine, RiMailLine } from "@remixicon/react";
import { Input } from "@orra-ui/react";

export default function InputOverview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input label="工作邮箱" type="email" placeholder="name@company.com" startIcon={<RiMailLine />} isClearable defaultValue="lin.yue@northwind.cn" />
      <Input label="登录密码" type="password" startIcon={<RiLockLine />} defaultValue="orra-2026" description="至少 8 位，包含字母和数字。" />
      <Input label="团队主页" startAddon="https://" endAddon=".orra.app" placeholder="your-team" />
    </div>
  );
}
