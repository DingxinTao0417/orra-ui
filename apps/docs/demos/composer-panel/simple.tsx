"use client";

import { useState } from "react";
import { ComposerPanel } from "@orra-ui/react";

export default function ComposerPanelSimple() {
  const [last, setLast] = useState("");
  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <ComposerPanel modes={[]} submitShortcut="enter" minRows={1} placeholder="问问客服助手，回车发送，Shift + 回车换行" onSubmit={({ text }) => setLast(text)} />
      <p className="px-1 text-caption text-fg-subtle">{last ? `已发送：${last}` : "还没有发送消息"}</p>
    </div>
  );
}
