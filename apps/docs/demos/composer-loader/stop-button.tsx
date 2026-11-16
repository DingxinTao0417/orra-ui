"use client";

import { useState } from "react";
import { ComposerStopButton } from "@orra-ui/react";

export default function ComposerLoaderStopButton() {
  const [stopped, setStopped] = useState(false);
  return (
    <div className="flex items-center gap-6">
      <ComposerStopButton size="sm" />
      <ComposerStopButton onPress={() => setStopped(true)} spinning={!stopped} />
      <span className="text-body-sm text-fg-muted">{stopped ? "已停止生成" : "点击右侧按钮停止"}</span>
    </div>
  );
}
