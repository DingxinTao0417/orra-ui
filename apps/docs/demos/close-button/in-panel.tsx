"use client";

import { useState } from "react";
import { Button, CloseButton } from "@orra-ui/react";

export default function CloseButtonInPanel() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <Button variant="outline" tone="neutral" onPress={() => setOpen(true)}>
        重新显示提示
      </Button>
    );
  }
  return (
    <div className="relative w-full max-w-sm rounded-card border border-line bg-surface p-5 pe-12 shadow-card">
      <CloseButton className="absolute end-3 top-3" onPress={() => setOpen(false)} />
      <p className="text-body font-medium text-fg">邀请你的团队</p>
      <p className="mt-1 text-body-sm text-fg-subtle">协作者加入后可以一起编辑看板，并在评论里 @ 彼此。</p>
    </div>
  );
}
