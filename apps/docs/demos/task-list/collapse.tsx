"use client";

import { useEffect, useState } from "react";
import { TaskList } from "@orra-ui/react";

const TASKS = ["拉取 9 月工单", "按问题类型聚类", "统计各类占比", "写出三条改进建议"];

export default function TaskListCollapse() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= TASKS.length) return;
    const id = window.setTimeout(() => setDone((d) => d + 1), 900);
    return () => window.clearTimeout(id);
  }, [done]);

  return (
    <div className="w-full max-w-sm">
      <TaskList
        collapseOnComplete
        title="整理客户反馈"
        items={TASKS.map((label, i) => ({ id: String(i), label, status: i < done ? "done" : i === done ? "working" : "pending" }))}
      />
    </div>
  );
}
