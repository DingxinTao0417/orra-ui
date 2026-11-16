"use client";

import { RiSearchLine } from "@remixicon/react";
import { ComposerLoader, Input } from "@orra-ui/react";

export default function ComposerLoaderRadius() {
  return (
    <div className="w-full max-w-sm">
      <ComposerLoader radius="control" showStatus={false}>
        <Input aria-label="搜索" defaultValue="2026 年 AI 编程助手市场规模" startIcon={<RiSearchLine />} />
      </ComposerLoader>
    </div>
  );
}
