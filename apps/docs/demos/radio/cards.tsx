"use client";

import { useState } from "react";
import { RiBuilding2Line, RiRocket2Line, RiSeedlingLine } from "@remixicon/react";
import { Radio, RadioGroup } from "@orra-ui/react";

export default function RadioCards() {
  const [plan, setPlan] = useState("team");
  return (
    <div className="w-full max-w-md">
      <RadioGroup label="选择方案" variant="card" value={plan} onChange={setPlan} description="随时可以升级或降级，按天折算费用。">
        <Radio value="starter" icon={<RiSeedlingLine />} description="3 位成员 · 5 个项目" aside="免费">
          入门版
        </Radio>
        <Radio value="team" icon={<RiRocket2Line />} description="不限项目 · 高级权限 · 优先支持" aside="¥89/席">
          团队版
        </Radio>
        <Radio value="business" icon={<RiBuilding2Line />} description="SSO · 审计日志 · 专属客户经理" aside="¥199/席">
          企业版
        </Radio>
      </RadioGroup>
    </div>
  );
}
