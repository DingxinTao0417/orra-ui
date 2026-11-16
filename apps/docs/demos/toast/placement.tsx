"use client";

import { useState } from "react";
import { Button, Toaster, toast, type ToasterPlacement } from "@orra-ui/react";

const PLACEMENTS: { value: ToasterPlacement; label: string }[] = [
  { value: "top-center", label: "顶部居中" },
  { value: "top-end", label: "右上" },
  { value: "bottom-start", label: "左下" },
  { value: "bottom-end", label: "右下" },
];

export default function ToastPlacement() {
  const [placement, setPlacement] = useState<ToasterPlacement>("bottom-end");
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Toaster placement={placement} />
      {PLACEMENTS.map((p) => (
        <Button
          key={p.value}
          variant={placement === p.value ? "soft" : "outline"}
          tone="neutral"
          onPress={() => {
            setPlacement(p.value);
            toast(`来自「${p.label}」的提示`, { description: "悬停时堆叠展开，计时暂停。" });
          }}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
