"use client";

import { useState } from "react";
import { ComposerAttachments, type ComposerAttachmentItem } from "@orra-ui/react";

/** A local, generated "photo" so the demo needs no network. */
function scene(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="oklch(0.88 0.07 ${hue})"/><stop offset="1" stop-color="oklch(0.62 0.14 ${hue + 40})"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="57" cy="24" r="9" fill="oklch(0.98 0.02 ${hue})"/><path d="M0 62 26 38l20 18 14-12 20 16v20H0Z" fill="oklch(0.42 0.09 ${hue + 70})" opacity=".75"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const INITIAL: ComposerAttachmentItem[] = [
  { id: "1", name: "登录页-当前版本.png", type: "image/png", previewUrl: scene(250) },
  { id: "2", name: "设计稿-暗色.png", type: "image/png", previewUrl: scene(300), status: "uploading", progress: 64 },
  { id: "3", name: "Q3 销售明细.xlsx", size: 284_000 },
  { id: "4", name: "竞品调研纪要.pdf", size: 1_620_000 },
  { id: "5", name: "LoginForm.tsx", size: 12_400, status: "error", error: "文件超过 10 MB 限制" },
];

export default function ComposerAttachmentsOverview() {
  const [items, setItems] = useState(INITIAL);
  return (
    <div className="w-full max-w-xl rounded-card border border-line bg-surface p-3 shadow-card">
      <ComposerAttachments
        items={items}
        onRemove={(id) => setItems((list) => list.filter((i) => i.id !== id))}
        onRetry={(id) => setItems((list) => list.map((i) => (i.id === id ? { ...i, status: "done", error: undefined } : i)))}
      />
    </div>
  );
}
