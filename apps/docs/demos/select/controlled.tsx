"use client";

import { useState } from "react";
import { Select, SelectItem } from "@orra-ui/react";

const PLANS = [
  { id: "starter", name: "入门版", price: "免费" },
  { id: "team", name: "团队版", price: "¥89 / 席 / 月" },
  { id: "business", name: "企业版", price: "¥199 / 席 / 月" },
];

export default function SelectControlled() {
  const [plan, setPlan] = useState<string | number | null>("team");
  const current = PLANS.find((p) => p.id === plan);
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Select label="订阅方案" items={PLANS} selectedKey={plan} onSelectionChange={setPlan} isInvalid={plan === "starter"} errorMessage="入门版不支持 SSO 登录。">
        {(item) => (
          <SelectItem id={item.id} meta={item.price}>
            {item.name}
          </SelectItem>
        )}
      </Select>
      <p className="text-body-sm text-fg-muted">当前：{current ? `${current.name} · ${current.price}` : "未选择"}</p>
    </div>
  );
}
