"use client";

import { useEffect, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, useLocale } from "react-aria-components";
import {
  RiCodeSSlashLine,
  RiErrorWarningFill,
  RiFileExcel2Line,
  RiFileLine,
  RiFilePdf2Line,
  RiFileTextLine,
  RiFileZipLine,
  RiImageLine,
  RiRefreshLine,
} from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CloseGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";
import { formatFileSize } from "../file-upload/file-upload";

const COPY = {
  en: { attachments: "Attachments", remove: "Remove {name}", retry: "Retry {name}", uploading: "Uploading {p}", failed: "Upload failed", image: "Image" },
  zh: { attachments: "附件", remove: "移除 {name}", retry: "重试上传 {name}", uploading: "上传中 {p}", failed: "上传失败", image: "图片" },
};
export type ComposerAttachmentsLabels = (typeof COPY)["en"];

export interface ComposerAttachmentItem {
  id: string;
  name: string;
  /** Bytes. */
  size?: number;
  /** MIME type; used with the extension to pick the tile style and icon. */
  type?: string;
  /** Image URL (object URL or data URL) for an image thumbnail. */
  previewUrl?: string;
  /** Default `done`. */
  status?: "uploading" | "done" | "error";
  /** 0–100 while uploading. */
  progress?: number;
  /** Error text for a failed upload. */
  error?: ReactNode;
}

type FileKind = "image" | "pdf" | "sheet" | "code" | "archive" | "text" | "other";

function extOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function kindOf(item: ComposerAttachmentItem): FileKind {
  const ext = extOf(item.name);
  const type = item.type ?? "";
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "heic"].includes(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv", "tsv", "numbers"].includes(ext)) return "sheet";
  if (["js", "jsx", "ts", "tsx", "py", "go", "rs", "java", "rb", "json", "yml", "yaml", "html", "css", "sql", "sh"].includes(ext)) return "code";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["txt", "md", "doc", "docx", "rtf", "pages"].includes(ext) || type.startsWith("text/")) return "text";
  return "other";
}

const KIND_STYLE: Record<FileKind, { icon: ReactNode; className: string }> = {
  image: { icon: <RiImageLine />, className: "bg-[color-mix(in_oklab,var(--color-chart-3)_18%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-3)_60%,var(--color-fg))]" },
  pdf: { icon: <RiFilePdf2Line />, className: "bg-danger-soft text-danger" },
  sheet: { icon: <RiFileExcel2Line />, className: "bg-success-soft text-success" },
  code: { icon: <RiCodeSSlashLine />, className: "bg-[color-mix(in_oklab,var(--color-chart-2)_16%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-2)_70%,var(--color-fg))]" },
  archive: { icon: <RiFileZipLine />, className: "bg-warning-soft text-warning" },
  text: { icon: <RiFileTextLine />, className: "bg-accent-50 text-fg-accent" },
  other: { icon: <RiFileLine />, className: "bg-surface-muted text-fg-muted" },
};

const removeButton = cx(
  "absolute -top-1.5 -end-1.5 z-10 flex size-5 cursor-default items-center justify-center rounded-full bg-surface-inverse text-fg-inverse shadow-raised ring-2 ring-surface",
  "opacity-0 transition-opacity duration-150 group-hover:opacity-100 data-[focus-visible]:opacity-100 [@media(pointer:coarse)]:opacity-100",
  focusRing,
);

function ProgressRing({ value }: { value: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-6 -rotate-90 text-fg-on-accent">
      <circle cx="12" cy="12" r={r} stroke="currentColor" strokeOpacity=".3" strokeWidth="2.5" />
      <circle
        cx="12"
        cy="12"
        r={r}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        className="transition-[stroke-dashoffset] duration-300 ease-out-soft"
      />
    </svg>
  );
}

export interface ComposerAttachmentProps {
  item: ComposerAttachmentItem;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  labels?: Partial<ComposerAttachmentsLabels>;
  className?: string;
}

/** One attachment tile: an image thumbnail, or a file card with icon, name and size. */
export function ComposerAttachment({ item, onRemove, onRetry, labels, className }: ComposerAttachmentProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const kind = kindOf(item);
  const status = item.status ?? "done";
  const progress = Math.max(0, Math.min(100, item.progress ?? 0));
  const pct = new Intl.NumberFormat(locale, { style: "percent" }).format(progress / 100);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [item.previewUrl]);
  const style = KIND_STYLE[kind];

  const remove = onRemove ? (
    <AriaButton aria-label={fill(t.remove, { name: item.name })} onPress={() => onRemove(item.id)} className={removeButton}>
      <CloseGlyph className="size-3" />
    </AriaButton>
  ) : null;

  if (kind === "image") {
    return (
      <li className={cx("group relative shrink-0 motion-safe:animate-in", className)} title={item.name}>
        <div
          className={cx(
            "relative size-14 overflow-hidden rounded-control border bg-surface-muted shadow-xs",
            status === "error" ? "border-danger" : "border-line",
          )}
        >
          {item.previewUrl && !broken ? (
            <img src={item.previewUrl} alt={item.name} draggable={false} onError={() => setBroken(true)} className="size-full object-cover" />
          ) : (
            <span role="img" aria-label={item.name} className={cx("flex size-full items-center justify-center [&>svg]:size-5", style.className)}>
              {style.icon}
            </span>
          )}
          {status === "uploading" ? (
            <span
              role="progressbar"
              aria-label={fill(t.uploading, { p: pct })}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="absolute inset-0 flex items-center justify-center bg-overlay"
            >
              <ProgressRing value={progress} />
            </span>
          ) : null}
          {status === "error" ? (
            <span className="absolute inset-0 flex items-center justify-center bg-danger-soft/85 text-danger">
              {onRetry ? (
                <AriaButton aria-label={fill(t.retry, { name: item.name })} onPress={() => onRetry(item.id)} className={cx("rounded-full p-1 data-[hovered]:bg-surface/60", focusRing)}>
                  <RiRefreshLine className="size-4" />
                </AriaButton>
              ) : (
                <RiErrorWarningFill aria-label={t.failed} className="size-4" />
              )}
            </span>
          ) : null}
        </div>
        {remove}
      </li>
    );
  }

  const ext = extOf(item.name).toUpperCase();
  return (
    <li className={cx("group relative shrink-0 motion-safe:animate-in", className)}>
      <div
        className={cx(
          "relative flex h-14 w-56 items-center gap-2.5 overflow-hidden rounded-control border bg-surface ps-2 pe-3 shadow-xs",
          status === "error" ? "border-danger/50" : "border-line",
        )}
      >
        <span className={cx("flex size-10 shrink-0 items-center justify-center rounded-[8px] [&>svg]:size-5", status === "error" ? "bg-danger-soft text-danger" : style.className)}>
          {status === "error" ? <RiErrorWarningFill /> : style.icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-sm font-medium text-fg" title={item.name}>
            {item.name}
          </span>
          <span className={cx("truncate text-caption tabular-nums", status === "error" ? "text-danger" : "text-fg-subtle")}>
            {status === "error"
              ? (item.error ?? t.failed)
              : status === "uploading"
                ? fill(t.uploading, { p: pct })
                : [ext, item.size != null ? formatFileSize(item.size, locale) : null].filter(Boolean).join(" · ")}
          </span>
        </span>
        {status === "error" && onRetry ? (
          <AriaButton
            aria-label={fill(t.retry, { name: item.name })}
            onPress={() => onRetry(item.id)}
            className={cx("flex size-7 shrink-0 cursor-default items-center justify-center rounded-full text-danger data-[hovered]:bg-danger-soft", focusRing)}
          >
            <RiRefreshLine className="size-4" />
          </AriaButton>
        ) : null}
        {status === "uploading" ? (
          <span
            role="progressbar"
            aria-label={item.name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="absolute inset-x-0 bottom-0 h-0.5 bg-surface-muted"
          >
            <span className="block h-full bg-accent-500 transition-[width] duration-300 ease-out-soft" style={{ width: `${progress}%` }} />
          </span>
        ) : null}
      </div>
      {remove}
    </li>
  );
}

export interface ComposerAttachmentsProps {
  items: ComposerAttachmentItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  "aria-label"?: string;
  labels?: Partial<ComposerAttachmentsLabels>;
  className?: string;
  ref?: Ref<HTMLUListElement>;
}

/**
 * Attachment row for a chat composer: image thumbnails and file tiles that
 * pop in as they're added, with upload progress, errors with retry, and
 * remove buttons. Scrolls horizontally when it overflows.
 *
 *   <ComposerAttachments items={files} onRemove={remove} />
 */
export function ComposerAttachments({ items, onRemove, onRetry, "aria-label": ariaLabel, labels, className, ref }: ComposerAttachmentsProps) {
  const t = useCopy(COPY, labels);
  if (!items.length) return null;
  return (
    <ul ref={ref} aria-label={ariaLabel ?? t.attachments} className={cx("flex items-end gap-2 overflow-x-auto pt-2 pe-2 pb-0.5", className)}>
      {items.map((item) => (
        <ComposerAttachment key={item.id} item={item} onRemove={onRemove} onRetry={onRetry} labels={labels} />
      ))}
    </ul>
  );
}
