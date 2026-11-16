"use client";

import { RiGithubLine, RiSearchLine } from "@remixicon/react";
import { Input } from "@orra-ui/react";

export default function InputAddons() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Input aria-label="搜索订单" placeholder="订单号 / 客户名" startIcon={<RiSearchLine />} isClearable />
      <Input label="GitHub 用户名" startIcon={<RiGithubLine />} startAddon="github.com/" defaultValue="orra-labs" />
      <Input label="月度预算" type="number" inputMode="decimal" startAddon="¥" endAddon="元 / 月" defaultValue="12000" />
    </div>
  );
}
