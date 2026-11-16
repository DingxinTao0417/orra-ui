"use client";

import { useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { cx } from "@orra-ui/react/lib/cx";

export function CopyButton({ value, className, label = "复制" }: { value: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "已复制" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard blocked */
        }
      }}
      className={cx(
        "grid size-8 cursor-pointer place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg",
        className,
      )}
    >
      {copied ? <RiCheckLine className="size-4 text-emerald-500" /> : <RiFileCopyLine className="size-4" />}
    </button>
  );
}
