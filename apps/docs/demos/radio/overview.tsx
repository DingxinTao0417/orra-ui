"use client";

import { Radio, RadioGroup } from "@orra-ui/react";

export default function RadioOverview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <RadioGroup label="项目可见范围" defaultValue="team">
        <Radio value="private" description="只有你和被邀请的成员可以访问">
          私密
        </Radio>
        <Radio value="team" description="工作区内的所有成员都可以查看">
          团队可见
        </Radio>
        <Radio value="public" description="任何拿到链接的人都可以查看">
          公开链接
        </Radio>
      </RadioGroup>
      <RadioGroup label="导出格式" orientation="horizontal" defaultValue="xlsx">
        <Radio value="csv">CSV</Radio>
        <Radio value="xlsx">Excel</Radio>
        <Radio value="pdf">PDF</Radio>
        <Radio value="json" isDisabled>
          JSON
        </Radio>
      </RadioGroup>
    </div>
  );
}
