"use client";

import { AgentProgress } from "@orra-ui/react";

export default function AgentProgressOverview() {
  return (
    <div className="w-full max-w-md">
      <AgentProgress
        title="调研竞品定价策略"
        steps={[
          { id: "1", title: "确定 5 家对标产品", status: "done", meta: "12 秒" },
          { id: "2", title: "抓取各家定价页", status: "done", meta: "48 秒" },
          { id: "3", title: "整理套餐与功能矩阵", status: "active", description: "已整理 3/5 家，正在对比 Nimbus 的团队版权益" },
          { id: "4", title: "计算单席位价格区间", status: "pending" },
          { id: "5", title: "输出对比报告", status: "pending" },
        ]}
      />
    </div>
  );
}
