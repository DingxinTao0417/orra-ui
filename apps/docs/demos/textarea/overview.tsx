"use client";

import { Textarea } from "@orra-ui/react";

export default function TextareaOverview() {
  return (
    <div className="w-full max-w-md">
      <Textarea
        label="项目简介"
        placeholder="用两三句话介绍这个项目要解决的问题…"
        description="会展示在项目卡片和分享链接里。"
        limit={200}
        showCount
        defaultValue="为销售团队搭建统一的线索看板，自动汇总各渠道的新增线索，并按跟进阶段提醒负责人。"
      />
    </div>
  );
}
