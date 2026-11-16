"use client";

import { useRef, useState } from "react";
import { FileUpload, type UploadFileItem } from "@orra-ui/react";

const SAMPLE: UploadFileItem[] = [
  { id: "1", name: "2026 Q3 经营复盘.pdf", size: 4_820_000, type: "application/pdf", status: "done" },
  { id: "2", name: "门店客流数据.xlsx", size: 1_240_000, status: "uploading", progress: 46 },
  { id: "3", name: "活动主视觉.png", size: 12_400_000, type: "image/png", status: "error", error: "网络中断，上传失败" },
];

export default function FileUploadOverview() {
  const [files, setFiles] = useState<UploadFileItem[]>(SAMPLE);
  const seq = useRef(10);

  // Fake upload: advance progress on a timer. In a real app, update from your upload request.
  const simulate = (id: string) => {
    const tick = setInterval(() => {
      setFiles((list) =>
        list.map((f) => {
          if (f.id !== id) return f;
          const progress = Math.min(100, (f.progress ?? 0) + 12 + Math.random() * 18);
          if (progress >= 100) clearInterval(tick);
          return { ...f, progress, status: progress >= 100 ? "done" : "uploading" };
        }),
      );
    }, 400);
  };

  return (
    <div className="w-full max-w-md">
      <FileUpload
        label="附件"
        accept={["image/*", ".pdf", ".xlsx", ".csv"]}
        maxSize={20 * 1024 * 1024}
        files={files}
        onFilesAdded={(added) => {
          const items = added.map((file) => ({ id: String(seq.current++), name: file.name, size: file.size, type: file.type, status: "uploading" as const, progress: 0 }));
          setFiles((list) => [...items, ...list]);
          items.forEach((item) => simulate(item.id));
        }}
        onRemove={(id) => setFiles((list) => list.filter((f) => f.id !== id))}
        onRetry={(id) => {
          setFiles((list) => list.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0 } : f)));
          simulate(id);
        }}
      />
    </div>
  );
}
