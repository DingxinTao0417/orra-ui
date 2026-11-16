"use client";

import { TaskList } from "@orra-ui/react";

export default function TaskListStates() {
  return (
    <div className="w-full max-w-sm">
      <TaskList
        reveal={false}
        items={[
          { id: "1", label: "导出 Q3 订单数据", status: "done", detail: "orders_q3.csv · 12,480 行" },
          { id: "2", label: "清洗异常订单", status: "done" },
          { id: "3", label: "按区域汇总", status: "working", detail: "已处理 5/7 个区域" },
          { id: "4", label: "同步到 BI 看板", status: "failed", detail: "看板服务暂时不可用" },
          { id: "5", label: "发送周报邮件", status: "pending" },
        ]}
      />
    </div>
  );
}
