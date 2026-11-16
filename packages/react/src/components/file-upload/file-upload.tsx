"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button as AriaButton, DropZone, FileTrigger, isFileDropItem, useLocale } from "react-aria-components";
import type { DropItem } from "react-aria-components";
import {
  RiCheckboxCircleFill,
  RiDeleteBinLine,
  RiErrorWarningFill,
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiFileTextLine,
  RiFileWord2Line,
  RiFileZipLine,
  RiImageLine,
  RiMusic2Line,
  RiRefreshLine,
  RiUploadCloud2Line,
  RiVideoLine,
} from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";

const COPY = {
  en: {
    title: "Drop files here or {browse}",
    browse: "browse",
    browseLabel: "Choose files to upload",
    accepts: "Accepts {types}",
    maxSize: "up to {size} each",
    maxFiles: "{n} files max",
    uploading: "Uploading… {p}",
    queued: "Waiting",
    done: "Uploaded",
    failed: "Upload failed",
    retry: "Retry",
    remove: "Remove {name}",
    rejectType: "{name} isn't an accepted file type",
    rejectSize: "{name} is larger than {size}",
    rejectCount: "You can add up to {n} files",
    listLabel: "Files",
    anyImage: "images",
    anyVideo: "videos",
    anyAudio: "audio",
  },
  zh: {
    title: "拖拽文件到这里，或{browse}",
    browse: "点击选择",
    browseLabel: "选择要上传的文件",
    accepts: "支持 {types}",
    maxSize: "单个文件不超过 {size}",
    maxFiles: "最多 {n} 个文件",
    uploading: "上传中… {p}",
    queued: "等待上传",
    done: "上传完成",
    failed: "上传失败",
    retry: "重试",
    remove: "移除 {name}",
    rejectType: "{name} 的格式不受支持",
    rejectSize: "{name} 超过了 {size}",
    rejectCount: "最多只能添加 {n} 个文件",
    listLabel: "文件列表",
    anyImage: "图片",
    anyVideo: "视频",
    anyAudio: "音频",
  },
};
export type FileUploadLabels = typeof COPY.en;

/** Human-readable byte size in the current locale: 1.2 MB, 340 KB. */
export function formatFileSize(bytes: number, locale?: string) {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return new Intl.NumberFormat(locale, { style: "unit", unit: units[i], unitDisplay: "short", maximumFractionDigits: n < 10 && i > 0 ? 1 : 0 }).format(n);
}

/** Does a file match an accept list like ["image/*", ".pdf", "text/csv"]? */
export function fileMatchesAccept(file: { name: string; type?: string }, accept?: string[]) {
  if (!accept?.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type ?? "").toLowerCase();
  return accept.some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith(".")) return name.endsWith(r);
    if (r.endsWith("/*")) return type.startsWith(r.slice(0, -1));
    return type === r;
  });
}

function iconFor(name: string, type = "") {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return <RiImageLine />;
  if (type.startsWith("video/")) return <RiVideoLine />;
  if (type.startsWith("audio/")) return <RiMusic2Line />;
  if (type === "application/pdf" || ext === "pdf") return <RiFilePdf2Line />;
  if (["zip", "rar", "7z", "gz", "tar"].includes(ext)) return <RiFileZipLine />;
  if (["xls", "xlsx", "csv", "numbers"].includes(ext)) return <RiFileExcel2Line />;
  if (["doc", "docx", "pages", "rtf"].includes(ext)) return <RiFileWord2Line />;
  return <RiFileTextLine />;
}

/* ---------------------------------------------------------------- drop zone */

export type FileRejection = { file: File; reason: "type" | "size" | "count" };

export interface FileDropZoneProps {
  /** MIME types or extensions, e.g. `["image/*", ".pdf"]`. */
  accept?: string[];
  /** Max bytes per file. */
  maxSize?: number;
  /** Max files per drop / selection. */
  maxFiles?: number;
  /** Allow several files at once (default true). */
  multiple?: boolean;
  /** Accepted files, after type / size checks. */
  onFilesAdded?: (files: File[]) => void;
  /** Files that failed the checks. A short message is also shown in the zone. */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Replace the auto-generated hint line ("支持 PNG、PDF · 单个文件不超过 10 MB"). */
  hint?: ReactNode;
  /** Icon element (default: upload cloud). */
  icon?: ReactNode;
  /** `default` tall zone or `compact` single row. */
  layout?: "default" | "compact";
  isDisabled?: boolean;
  labels?: Partial<FileUploadLabels>;
  className?: string;
}

/** Drag-and-drop + click-to-browse area that validates type and size. */
export function FileDropZone({
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  onFilesAdded,
  onFilesRejected,
  hint,
  icon,
  layout = "default",
  isDisabled,
  labels,
  className,
}: FileDropZoneProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const [message, setMessage] = useState<string | null>(null);

  const listFormat = new Intl.ListFormat(locale, { style: "short", type: "conjunction" });
  const typeName = (rule: string) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith(".")) return r.slice(1).toUpperCase();
    if (r === "image/*") return t.anyImage;
    if (r === "video/*") return t.anyVideo;
    if (r === "audio/*") return t.anyAudio;
    const sub = r.split("/")[1] ?? r;
    return sub.replace(/^(x-|vnd\.)/, "").split(/[.+]/)[0]!.toUpperCase();
  };
  const typeLabel = accept?.length ? listFormat.format([...new Set(accept.map(typeName))]) : null;
  const hintText =
    hint ??
    [typeLabel ? fill(t.accepts, { types: typeLabel }) : null, maxSize ? fill(t.maxSize, { size: formatFileSize(maxSize, locale) }) : null, maxFiles ? fill(t.maxFiles, { n: maxFiles }) : null]
      .filter(Boolean)
      .join(" · ");

  const handle = (incoming: File[]) => {
    if (isDisabled || !incoming.length) return;
    const ok: File[] = [];
    const rejected: FileRejection[] = [];
    for (const file of multiple ? incoming : incoming.slice(0, 1)) {
      if (!fileMatchesAccept(file, accept)) rejected.push({ file, reason: "type" });
      else if (maxSize && file.size > maxSize) rejected.push({ file, reason: "size" });
      else if (maxFiles && ok.length >= maxFiles) rejected.push({ file, reason: "count" });
      else ok.push(file);
    }
    if (ok.length) onFilesAdded?.(ok);
    if (rejected.length) {
      onFilesRejected?.(rejected);
      const r = rejected[0]!;
      setMessage(
        r.reason === "type"
          ? fill(t.rejectType, { name: r.file.name })
          : r.reason === "size"
            ? fill(t.rejectSize, { name: r.file.name, size: formatFileSize(maxSize ?? 0, locale) })
            : fill(t.rejectCount, { n: maxFiles ?? 0 }),
      );
    } else setMessage(null);
  };

  const onDrop = async (items: DropItem[]) => {
    const files = await Promise.all(items.filter(isFileDropItem).map((item) => item.getFile()));
    handle(files);
  };

  const compact = layout === "compact";
  const browse = <span className="font-medium text-fg-accent">{t.browse}</span>;
  const [before, after] = t.title.split("{browse}");

  return (
    <DropZone
      isDisabled={isDisabled}
      getDropOperation={() => (isDisabled ? "cancel" : "copy")}
      onDrop={(e) => void onDrop(e.items)}
      className={cx(
        "group relative flex rounded-card border border-dashed border-line-strong bg-surface-muted/60 text-center outline-none",
        "transition-[border-color,background-color] duration-150",
        "hover:border-line-hover hover:bg-surface-muted",
        "data-[drop-target]:border-solid data-[drop-target]:border-accent-500 data-[drop-target]:bg-accent-50",
        "data-[focus-visible]:focus-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-55",
        compact ? "items-center gap-3 rounded-control px-4 py-3 text-start" : "flex-col items-center justify-center gap-3 px-6 py-8",
        className,
      )}
    >
      <span
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-surface text-fg-muted shadow-xs ring-1 ring-line transition-[color,translate] duration-200 ease-out-soft",
          "group-data-[drop-target]:-translate-y-0.5 group-data-[drop-target]:text-fg-accent",
          compact ? "size-9 [&>svg]:size-[18px]" : "size-11 [&>svg]:size-[22px]",
        )}
      >
        {icon ?? <RiUploadCloud2Line />}
      </span>
      <span className={cx("flex min-w-0 flex-col gap-1", compact && "flex-1")}>
        <span className="text-body-sm text-fg">
          {before}
          {browse}
          {after}
        </span>
        {hintText ? <span className="text-caption text-fg-subtle">{hintText}</span> : null}
        {message ? (
          <span role="alert" className="text-caption text-danger">
            {message}
          </span>
        ) : null}
      </span>
      <FileTrigger acceptedFileTypes={accept} allowsMultiple={multiple} onSelect={(list) => handle(list ? Array.from(list) : [])}>
        <AriaButton aria-label={t.browseLabel} isDisabled={isDisabled} className={cx("absolute inset-0 cursor-default rounded-[inherit]", focusRing)} />
      </FileTrigger>
    </DropZone>
  );
}

/* --------------------------------------------------------------- file rows */

export interface UploadFileItem {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  /** MIME type, used for the icon. */
  type?: string;
  /** 0–100 while uploading. */
  progress?: number;
  status?: "queued" | "uploading" | "done" | "error";
  /** Error text for `status="error"` (default "Upload failed"). */
  error?: ReactNode;
}

export interface FileUploadItemProps {
  file: UploadFileItem;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  labels?: Partial<FileUploadLabels>;
  className?: string;
}

const rowButton = cx(
  "inline-flex size-7 shrink-0 cursor-default items-center justify-center rounded-md text-fg-subtle transition-colors duration-150 [&>svg]:size-4",
  "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
  focusRing,
);

/** One file row: type icon, name, size, progress bar and status, with retry / remove. */
export function FileUploadItem({ file, onRemove, onRetry, labels, className }: FileUploadItemProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const status = file.status ?? "done";
  const progress = Math.max(0, Math.min(100, file.progress ?? (status === "done" ? 100 : 0)));
  const pct = new Intl.NumberFormat(locale, { style: "percent" }).format(progress / 100);

  return (
    <li
      className={cx(
        "flex animate-rise items-center gap-3 rounded-control border bg-surface p-3 shadow-xs",
        status === "error" ? "border-danger/40" : "border-line",
        className,
      )}
    >
      <span
        className={cx(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg [&>svg]:size-[18px]",
          status === "error" ? "bg-danger-soft text-danger" : "bg-surface-muted text-fg-muted",
        )}
      >
        {iconFor(file.name, file.type)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg" title={file.name}>
            {file.name}
          </span>
          <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{formatFileSize(file.size, locale)}</span>
        </div>
        {status === "uploading" || status === "queued" ? (
          <div className="flex items-center gap-2">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={status === "queued" ? undefined : progress}
              aria-label={file.name}
              className="h-1 flex-1 overflow-hidden rounded-full bg-surface-active"
            >
              <div className="h-full rounded-full bg-accent-500 transition-[width] duration-300 ease-out-soft" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-24 shrink-0 text-end text-caption text-fg-subtle tabular-nums">
              {status === "queued" ? t.queued : fill(t.uploading, { p: pct })}
            </span>
          </div>
        ) : (
          <span className={cx("inline-flex items-center gap-1 text-caption", status === "error" ? "text-danger" : "text-success")}>
            {status === "error" ? <RiErrorWarningFill className="size-3.5" /> : <RiCheckboxCircleFill className="size-3.5" />}
            {status === "error" ? (file.error ?? t.failed) : t.done}
          </span>
        )}
      </div>
      {status === "error" && onRetry ? (
        <AriaButton aria-label={t.retry} onPress={() => onRetry(file.id)} className={rowButton}>
          <RiRefreshLine />
        </AriaButton>
      ) : null}
      {onRemove ? (
        <AriaButton aria-label={fill(t.remove, { name: file.name })} onPress={() => onRemove(file.id)} className={cx(rowButton, "data-[hovered]:text-danger")}>
          <RiDeleteBinLine />
        </AriaButton>
      ) : null}
    </li>
  );
}

export interface FileUploadListProps {
  files: UploadFileItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  labels?: Partial<FileUploadLabels>;
  className?: string;
}

/** The list of file rows. */
export function FileUploadList({ files, onRemove, onRetry, labels, className }: FileUploadListProps) {
  const t = useCopy(COPY, labels);
  if (!files.length) return null;
  return (
    <ul aria-label={t.listLabel} className={cx("flex flex-col gap-2", className)}>
      {files.map((f) => (
        <FileUploadItem key={f.id} file={f} onRemove={onRemove} onRetry={onRetry} labels={labels} />
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------- composed */

export interface FileUploadProps extends FileDropZoneProps {
  /** Files to list under the zone (you own the upload and pass progress / status back in). */
  files?: UploadFileItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  zoneClassName?: string;
}

/**
 * Drop zone + file list. The component only reports files (`onFilesAdded`)
 * and renders the `files` you pass back with their progress and status.
 *
 *   <FileUpload accept={["image/*", ".pdf"]} maxSize={10 * 1024 * 1024}
 *     files={files} onFilesAdded={startUpload} onRemove={remove} onRetry={retry} />
 */
export function FileUpload({ files = [], onRemove, onRetry, label, description, className, zoneClassName, labels, ...zone }: FileUploadProps) {
  return (
    <div className={cx("flex w-full flex-col gap-3", className)}>
      {label || description ? (
        <div className="flex flex-col gap-0.5">
          {label ? <span className="text-body-sm font-medium text-fg">{label}</span> : null}
          {description ? <span className="text-caption text-fg-subtle">{description}</span> : null}
        </div>
      ) : null}
      <FileDropZone {...zone} labels={labels} className={zoneClassName} />
      <FileUploadList files={files} onRemove={onRemove} onRetry={onRetry} labels={labels} />
    </div>
  );
}
