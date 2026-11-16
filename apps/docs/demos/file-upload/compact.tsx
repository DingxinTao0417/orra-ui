"use client";

import { useState } from "react";
import { RiImageAddLine } from "@remixicon/react";
import { FileDropZone } from "@orra-ui/react";

export default function FileUploadCompact() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileDropZone
        layout="compact"
        multiple={false}
        accept={["image/png", "image/jpeg", ".svg"]}
        maxSize={2 * 1024 * 1024}
        icon={<RiImageAddLine />}
        onFilesAdded={([file]) => setPicked(file ? file.name : null)}
      />
      <p className="text-body-sm text-fg-muted">{picked ? `已选择：${picked}` : "上传团队 Logo，建议 512 × 512。"}</p>
    </div>
  );
}
