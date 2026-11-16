"use client";

import { FileUploadList } from "@orra-ui/react";

export default function FileUploadStates() {
  return (
    <div className="w-full max-w-md">
      <FileUploadList
        files={[
          { id: "a", name: "访谈录音-0912.m4a", size: 38_600_000, type: "audio/mp4", status: "queued" },
          { id: "b", name: "产品演示.mp4", size: 182_000_000, type: "video/mp4", status: "uploading", progress: 72 },
          { id: "c", name: "设计资源.zip", size: 64_300_000, status: "done" },
          { id: "d", name: "合同扫描件.docx", size: 880_000, status: "error", error: "文件已损坏" },
        ]}
        onRemove={() => {}}
        onRetry={() => {}}
      />
    </div>
  );
}
