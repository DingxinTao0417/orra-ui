"use client";

import { useEffect, useState } from "react";
import { AgentAvatar, type AgentAvatarState } from "@orra-ui/react";

const SCRIPT: { state: AgentAvatarState; text: string }[] = [
  { state: "thinking", text: "正在理解你的需求…" },
  { state: "working", text: "正在读取 Q3 销售明细.xlsx" },
  { state: "speaking", text: "正在撰写分析结论" },
  { state: "idle", text: "已完成 · 等待新的指令" },
];

export default function AgentAvatarInChat() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= SCRIPT.length - 1) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 2200);
    return () => window.clearTimeout(id);
  }, [step]);
  const { state, text } = SCRIPT[step]!;

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <AgentAvatar name="数据分析师" seed="data-analyst" state={state} size="lg" />
      <div className="flex min-w-0 flex-col">
        <span className="text-body font-medium text-fg">数据分析师</span>
        <span key={step} className="truncate text-body-sm text-fg-subtle motion-safe:animate-fade-in">
          {text}
        </span>
      </div>
    </div>
  );
}
