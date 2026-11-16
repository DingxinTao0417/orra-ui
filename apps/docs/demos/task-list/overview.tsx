"use client";

import { useEffect, useState } from "react";
import { TaskList, type TaskStatus } from "@orra-ui/react";

const TASKS = ["读取现有登录页代码", "抽出表单校验规则", "拆分 useLoginSubmit hook", "第三方登录改为配置驱动", "补充单元测试", "运行测试并修复失败用例"];

export default function TaskListOverview() {
  // tick 0..n: tasks appear, then complete one by one.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (tick >= TASKS.length + 1) return;
    const id = window.setTimeout(() => setTick((t) => t + 1), tick === 0 ? 900 : 1300);
    return () => window.clearTimeout(id);
  }, [tick]);

  const status = (i: number): TaskStatus => (i < tick - 1 ? "done" : i === tick - 1 ? "working" : "pending");

  return (
    <div className="w-full max-w-sm rounded-card border border-line bg-surface p-5 shadow-card">
      <TaskList title="重构登录页" items={TASKS.map((label, i) => ({ id: String(i), label, status: tick === 0 ? "pending" : status(i) }))} />
    </div>
  );
}
