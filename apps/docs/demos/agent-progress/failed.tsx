"use client";

import { RiRefreshLine } from "@remixicon/react";
import { AgentProgress, Button } from "@orra-ui/react";

export default function AgentProgressFailed() {
  return (
    <div className="w-full max-w-md">
      <AgentProgress
        title="发布 v2.4 到预发环境"
        defaultExpanded={false}
        steps={[
          { id: "1", title: "运行单元测试", status: "done" },
          { id: "2", title: "构建镜像", status: "done" },
          { id: "3", title: "执行数据库迁移", status: "failed", description: "迁移 0042_add_team_seats 超时（60 秒），已自动回滚" },
          { id: "4", title: "切换流量", status: "pending" },
          { id: "5", title: "冒烟测试", status: "skipped" },
        ]}
        footer={
          <Button size="sm" variant="outline" tone="neutral" startIcon={<RiRefreshLine />}>
            从第 3 步重试
          </Button>
        }
      />
    </div>
  );
}
