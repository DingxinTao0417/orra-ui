"use client";

import { Button, Modal, type ModalSize } from "@orra-ui/react";

const SIZES: { size: ModalSize; label: string }[] = [
  { size: "sm", label: "小 sm" },
  { size: "md", label: "中 md" },
  { size: "lg", label: "大 lg" },
  { size: "full", label: "全屏 full" },
];

export default function ModalSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SIZES.map(({ size, label }) => (
        <Modal
          key={size}
          size={size}
          trigger={
            <Button variant="outline" tone="neutral">
              {label}
            </Button>
          }
          title="更新日志 v3.2"
          description="2026 年 11 月 12 日发布"
          footer={({ close }) => <Button onPress={close}>知道了</Button>}
        >
          <ul className="list-disc space-y-2 ps-5">
            <li>看板支持按团队筛选，并可保存为常用视图。</li>
            <li>导出报表新增 PDF 格式，图表保持矢量清晰。</li>
            <li>修复了在深色模式下部分图例颜色过浅的问题。</li>
          </ul>
        </Modal>
      ))}
    </div>
  );
}
