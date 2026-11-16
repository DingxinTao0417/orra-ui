"use client";

import { Divider } from "@orra-ui/react";

export default function DividerOrientation() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex h-5 items-center gap-3 text-body-sm text-fg-muted">
        <span>文档</span>
        <Divider orientation="vertical" />
        <span>更新日志</span>
        <Divider orientation="vertical" />
        <span>状态页</span>
      </div>
      <Divider />
      <Divider dashed strong />
      <Divider labelPosition="start">本周</Divider>
      <Divider labelPosition="end" dashed>
        共 12 条
      </Divider>
    </div>
  );
}
