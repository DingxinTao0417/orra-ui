"use client";

import { Button, Drawer, type DrawerPlacement } from "@orra-ui/react";

const ITEMS: { placement: DrawerPlacement; label: string }[] = [
  { placement: "start", label: "从起始边" },
  { placement: "end", label: "从结束边" },
  { placement: "bottom", label: "底部抽屉" },
];

export default function DrawerPlacementDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {ITEMS.map(({ placement, label }) => (
        <Drawer
          key={placement}
          placement={placement}
          size="sm"
          trigger={
            <Button variant="outline" tone="neutral">
              {label}
            </Button>
          }
          title="通知设置"
          footer={({ close }) => <Button onPress={close}>保存</Button>}
        >
          <p>选择你希望接收通知的方式。start / end 会随文字方向（RTL）自动镜像。</p>
        </Drawer>
      ))}
    </div>
  );
}
