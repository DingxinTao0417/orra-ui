"use client";

import { StatusDot, type BadgeTone } from "@orra-ui/react";

const SERVICES: { name: string; region: string; tone: BadgeTone; state: string; pulse?: boolean }[] = [
  { name: "API 网关", region: "华东 2", tone: "success", state: "运行正常" },
  { name: "向量检索", region: "华北 1", tone: "accent", state: "正在扩容", pulse: true },
  { name: "邮件推送", region: "新加坡", tone: "warning", state: "延迟偏高" },
  { name: "账单服务", region: "法兰克福", tone: "danger", state: "部分中断", pulse: true },
];

export default function BadgeStatusDot() {
  return (
    <ul className="flex w-full max-w-sm flex-col divide-y divide-line rounded-card border border-line bg-surface">
      {SERVICES.map((s) => (
        <li key={s.name} className="flex items-center gap-3 px-4 py-3">
          <StatusDot tone={s.tone} pulse={s.pulse} />
          <div className="flex flex-1 flex-col">
            <span className="text-body-sm font-medium text-fg">{s.name}</span>
            <span className="text-caption text-fg-subtle">{s.region}</span>
          </div>
          <span className="text-caption text-fg-muted">{s.state}</span>
        </li>
      ))}
    </ul>
  );
}
