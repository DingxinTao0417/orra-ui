"use client";

import { useState } from "react";
import { RiCodeSSlashLine, RiEyeLine, RiRefreshLine } from "@remixicon/react";
import { cx } from "@orra-ui/react/lib/cx";
import { CopyButton } from "@/components/site/copy-button";

export interface ComponentPreviewProps {
  code: string;
  codeHtml: string;
  layout?: "center" | "padded" | "full";
  height?: number;
  children: React.ReactNode;
}

/** Live demo canvas with a 预览 / 代码 switch, a replay (remount) button and copy. */
export function ComponentPreview({ code, codeHtml, layout = "center", height = 280, children }: ComponentPreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [nonce, setNonce] = useState(0);
  const tabs = [
    { id: "preview" as const, label: "预览", icon: RiEyeLine },
    { id: "code" as const, label: "代码", icon: RiCodeSSlashLine },
  ];
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex h-11 items-center gap-1 border-b border-line px-1.5">
        <div role="tablist" className="flex items-center gap-0.5 rounded-xl bg-surface-muted p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "flex h-7 cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 text-body-sm font-medium transition-colors",
                tab === t.id ? "bg-surface text-fg shadow-card" : "text-fg-subtle hover:text-fg-muted",
              )}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {tab === "preview" ? (
          <button
            type="button"
            aria-label="重新渲染"
            onClick={() => setNonce((n) => n + 1)}
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <RiRefreshLine className="size-4" />
          </button>
        ) : null}
        <CopyButton value={code} label="复制代码" />
      </div>
      {tab === "preview" ? (
        <div
          key={nonce}
          className={cx(
            "relative bg-[radial-gradient(var(--color-separator-border)_1px,transparent_1px)] [background-size:16px_16px]",
            layout === "center" && "flex items-center justify-center p-6 sm:p-10",
            layout === "padded" && "p-6 sm:p-8",
            layout === "full" && "",
          )}
          style={{ minHeight: height }}
        >
          {children}
        </div>
      ) : (
        <div
          className="overflow-auto p-4 font-mono text-[13px] leading-6"
          style={{ maxHeight: Math.max(height, 420) }}
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
      )}
    </div>
  );
}
