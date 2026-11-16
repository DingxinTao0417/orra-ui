"use client";

import { useEffect, useState } from "react";
import { RiAttachment2 } from "@remixicon/react";
import { Button, ComposerAttachments, type ComposerAttachmentItem } from "@orra-ui/react";

const FILES = ["用户访谈记录.docx", "埋点数据导出.csv", "需求文档 v3.pdf", "backend.zip"];

export default function ComposerAttachmentsUpload() {
  const [items, setItems] = useState<ComposerAttachmentItem[]>([]);

  // Advance every uploading item a little each tick.
  useEffect(() => {
    if (!items.some((i) => i.status === "uploading")) return;
    const id = window.setTimeout(() => {
      setItems((list) =>
        list.map((i) => {
          if (i.status !== "uploading") return i;
          const progress = Math.min(100, (i.progress ?? 0) + 18);
          return { ...i, progress, status: progress >= 100 ? "done" : "uploading" };
        }),
      );
    }, 300);
    return () => window.clearTimeout(id);
  }, [items]);

  const add = () => {
    const name = FILES[items.length % FILES.length]!;
    setItems((list) => [...list, { id: crypto.randomUUID(), name, size: 180_000 + list.length * 420_000, status: "uploading", progress: 0 }]);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <Button size="sm" variant="outline" tone="neutral" startIcon={<RiAttachment2 />} onPress={add}>
        添加文件
      </Button>
      <ComposerAttachments items={items} onRemove={(id) => setItems((list) => list.filter((i) => i.id !== id))} />
    </div>
  );
}
