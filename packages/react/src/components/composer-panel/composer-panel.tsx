"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode, Ref } from "react";
import { Button as AriaButton, TextArea, TextField } from "react-aria-components";
import type { Key } from "react-aria-components";
import {
  RiAddLine,
  RiArrowUpLine,
  RiAttachment2,
  RiChatQuoteLine,
  RiFlashlightLine,
  RiImageAddLine,
  RiListCheck3,
  RiMicFill,
  RiMicLine,
} from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { buttonClass } from "../button/button";
import { ComposerAttachments } from "../composer-attachments/composer-attachments";
import type { ComposerAttachmentItem } from "../composer-attachments/composer-attachments";
import { ComposerLoader, ComposerStopButton } from "../composer-loader/composer-loader";
import { Dropdown, DropdownItem, DropdownSection, DropdownSeparator } from "../dropdown/dropdown";
import { IconButton } from "../icon-button/icon-button";
import { Kbd } from "../kbd/kbd";
import { Tooltip } from "../tooltip/tooltip";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const COPY = {
  en: {
    placeholder: "Ask anything, @ to mention a file…",
    message: "Message",
    send: "Send",
    add: "Add",
    files: "Upload files",
    filesHint: "PDF, docs, spreadsheets, code",
    images: "Add images",
    imagesHint: "PNG, JPG, screenshots",
    tools: "Tools",
    mode: "Mode",
    voice: "Voice input",
    stopVoice: "Stop recording",
    generating: "Generating…",
    modeAsk: "Ask first",
    modeAskHint: "Confirms before editing files or running commands",
    modeAuto: "Auto",
    modeAutoHint: "Edits and runs commands without asking",
    modePlan: "Plan only",
    modePlanHint: "Proposes a plan, changes nothing",
  },
  zh: {
    placeholder: "输入任何问题，@ 引用文件…",
    message: "消息",
    send: "发送",
    add: "添加",
    files: "上传文件",
    filesHint: "PDF、文档、表格、代码",
    images: "添加图片",
    imagesHint: "PNG、JPG、截图",
    tools: "工具",
    mode: "模式",
    voice: "语音输入",
    stopVoice: "停止录音",
    generating: "正在生成…",
    modeAsk: "先询问",
    modeAskHint: "修改文件或执行命令前先确认",
    modeAuto: "自动执行",
    modeAutoHint: "直接修改文件、执行命令",
    modePlan: "仅规划",
    modePlanHint: "只给出方案，不做任何修改",
  },
};
export type ComposerPanelLabels = (typeof COPY)["en"];

export interface ComposerMode {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface ComposerAddAction {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface ComposerSubmitPayload {
  text: string;
  attachments: ComposerAttachmentItem[];
  mode?: string;
}

export interface ComposerPanelProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called with the text, attachments and mode. Uncontrolled text is cleared afterwards. */
  onSubmit?: (payload: ComposerSubmitPayload) => void;
  placeholder?: string;
  /** Attachments shown above the text. */
  attachments?: ComposerAttachmentItem[];
  onRemoveAttachment?: (id: string) => void;
  onRetryAttachment?: (id: string) => void;
  /** Enables "Upload files" / "Add images" in the add menu; receives the picked files. */
  onFilesSelected?: (files: File[]) => void;
  /** Extra entries for the add menu's Tools section (web search, connectors…). */
  addActions?: ComposerAddAction[];
  onAddAction?: (id: string) => void;
  /** Slot for a model picker, e.g. `<ModelPicker variant="ghost" size="sm" />`. */
  modelPicker?: ReactNode;
  /** Permission modes. Defaults to Ask first / Auto / Plan only; pass `[]` to hide the picker. */
  modes?: ComposerMode[];
  mode?: string;
  defaultMode?: string;
  onModeChange?: (mode: string) => void;
  /** Shows a microphone button. */
  onVoice?: () => void;
  isRecording?: boolean;
  /** The agent is generating: the send button becomes a stop button and a light sweeps the border. */
  loading?: boolean;
  /** Status text above the composer while loading. */
  loadingLabel?: ReactNode;
  onStop?: () => void;
  isDisabled?: boolean;
  /** `mod-enter` (default): ⌘/Ctrl+Enter sends, Enter adds a line. `enter`: Enter sends, Shift+Enter adds a line. */
  submitShortcut?: "mod-enter" | "enter";
  minRows?: number;
  maxRows?: number;
  autoFocus?: boolean;
  labels?: Partial<ComposerPanelLabels>;
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * Chat input panel for an agent: an auto-growing textarea, attachments, and a
 * toolbar with an add menu, permission mode, model picker slot, voice and a
 * send / stop button. ⌘/Ctrl+Enter sends.
 *
 *   <ComposerPanel onSubmit={send} loading={streaming} onStop={abort} modelPicker={<ModelPicker variant="ghost" size="sm" />} />
 */
export function ComposerPanel({
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  placeholder,
  attachments = [],
  onRemoveAttachment,
  onRetryAttachment,
  onFilesSelected,
  addActions = [],
  onAddAction,
  modelPicker,
  modes,
  mode,
  defaultMode,
  onModeChange,
  onVoice,
  isRecording,
  loading,
  loadingLabel,
  onStop,
  isDisabled,
  submitShortcut = "mod-enter",
  minRows = 2,
  maxRows = 10,
  autoFocus,
  labels,
  className,
  ref,
}: ComposerPanelProps) {
  const t = useCopy(COPY, labels);
  const [text, setText] = useControllableState(value, defaultValue, onChange);
  const modeList: ComposerMode[] = modes ?? [
    { id: "ask", label: t.modeAsk, description: t.modeAskHint, icon: <RiChatQuoteLine /> },
    { id: "auto", label: t.modeAuto, description: t.modeAutoHint, icon: <RiFlashlightLine /> },
    { id: "plan", label: t.modePlan, description: t.modePlanHint, icon: <RiListCheck3 /> },
  ];
  const [currentMode, setMode] = useControllableState(mode, defaultMode ?? modeList[0]?.id ?? "", onModeChange);
  const activeMode = modeList.find((m) => m.id === currentMode);

  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const resize = () => {
    const el = areaRef.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 22;
    const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    el.style.height = "auto";
    const min = line * minRows + chrome;
    const max = line * Math.max(minRows, maxRows) + chrome;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  };
  useIsoLayoutEffect(resize, [text, minRows, maxRows]);

  const uploading = attachments.some((a) => a.status === "uploading");
  const canSend = !isDisabled && !loading && !uploading && (text.trim().length > 0 || attachments.length > 0);

  const submit = () => {
    if (!canSend) return;
    onSubmit?.({ text: text.trim(), attachments, mode: activeMode ? currentMode : undefined });
    if (value === undefined) setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    const mod = e.metaKey || e.ctrlKey;
    if (submitShortcut === "mod-enter" ? mod : !e.shiftKey && !mod) {
      e.preventDefault();
      submit();
    }
  };

  const openPicker = (accept: string) => {
    const input = fileRef.current;
    if (!input) return;
    input.accept = accept;
    input.click();
  };

  const setRefs = (node: HTMLTextAreaElement | null) => {
    areaRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLTextAreaElement | null }).current = node;
  };

  const showAdd = !!onFilesSelected || addActions.length > 0;

  const panel = (
    <div
      data-disabled={isDisabled || undefined}
      className={cx(
        "relative flex w-full flex-col rounded-card border border-line-strong bg-surface shadow-card transition-[border-color,box-shadow] duration-150",
        "focus-within:border-accent-500 focus-within:ring-3 focus-within:ring-accent-500/12",
        loading && "border-line focus-within:border-line focus-within:ring-0",
        isDisabled && "bg-surface-muted shadow-none",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) areaRef.current?.focus();
      }}
    >
      {attachments.length ? (
        <ComposerAttachments items={attachments} onRemove={onRemoveAttachment} onRetry={onRetryAttachment} className="px-3 pt-3" />
      ) : null}
      <TextField aria-label={t.message} value={text} onChange={setText} isDisabled={isDisabled} autoFocus={autoFocus} className="flex">
        <TextArea
          ref={setRefs}
          rows={minRows}
          placeholder={placeholder ?? t.placeholder}
          onKeyDown={onKeyDown}
          className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-body leading-relaxed text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
        />
      </TextField>
      <div className="flex items-center gap-1 px-2.5 pt-1 pb-2.5">
        {showAdd ? (
          <Dropdown
            aria-label={t.add}
            placement="top start"
            trigger={<IconButton icon={<RiAddLine />} aria-label={t.add} size="sm" round isDisabled={isDisabled} />}
            onAction={(key: Key) => {
              const id = String(key);
              if (id === "__files") openPicker("");
              else if (id === "__images") openPicker("image/*");
              else onAddAction?.(id);
            }}
          >
            {onFilesSelected ? (
              <DropdownSection>
                <DropdownItem id="__files" icon={<RiAttachment2 />} description={t.filesHint}>
                  {t.files}
                </DropdownItem>
                <DropdownItem id="__images" icon={<RiImageAddLine />} description={t.imagesHint}>
                  {t.images}
                </DropdownItem>
              </DropdownSection>
            ) : null}
            {onFilesSelected && addActions.length ? <DropdownSeparator /> : null}
            {addActions.length ? (
              <DropdownSection title={t.tools}>
                {addActions.map((a) => (
                  <DropdownItem key={a.id} id={a.id} icon={a.icon} description={a.description} textValue={typeof a.label === "string" ? a.label : a.id}>
                    {a.label}
                  </DropdownItem>
                ))}
              </DropdownSection>
            ) : null}
          </Dropdown>
        ) : null}
        {modeList.length ? (
          <Dropdown
            aria-label={t.mode}
            placement="top start"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[currentMode]}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              const next = [...keys][0];
              if (next != null) setMode(String(next));
            }}
            className="w-72"
            trigger={
              <AriaButton aria-label={t.mode} isDisabled={isDisabled} className={cx(buttonClass({ variant: "plain", tone: "neutral", size: "sm" }), "gap-1.5 px-2")}>
                {activeMode?.icon ? <span className="inline-flex size-3.5 [&>svg]:size-full">{activeMode.icon}</span> : null}
                <span className="max-w-32 truncate">{activeMode?.label}</span>
                <ChevronGlyph className="size-3.5 text-fg-subtle" />
              </AriaButton>
            }
          >
            {modeList.map((m) => (
              <DropdownItem key={m.id} id={m.id} icon={m.icon} description={m.description} textValue={typeof m.label === "string" ? m.label : m.id}>
                {m.label}
              </DropdownItem>
            ))}
          </Dropdown>
        ) : null}
        {modelPicker}
        <span className="flex-1" />
        {submitShortcut === "mod-enter" && !loading ? (
          <Kbd keys={["mod", "enter"]} size="sm" variant="ghost" className="me-1 hidden sm:inline-flex" />
        ) : null}
        {onVoice ? (
          <Tooltip content={isRecording ? t.stopVoice : t.voice}>
            <IconButton
              icon={isRecording ? <RiMicFill /> : <RiMicLine />}
              aria-label={isRecording ? t.stopVoice : t.voice}
              aria-pressed={isRecording || undefined}
              size="sm"
              round
              tone={isRecording ? "danger" : "neutral"}
              variant={isRecording ? "soft" : "plain"}
              isDisabled={isDisabled}
              onPress={onVoice}
              className={cx(isRecording && "motion-safe:animate-glow")}
            />
          </Tooltip>
        ) : null}
        {loading ? (
          <ComposerStopButton size="sm" onPress={onStop} isDisabled={!onStop} />
        ) : (
          <AriaButton
            aria-label={t.send}
            isDisabled={!canSend}
            onPress={submit}
            className={cx(
              "inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-full transition-[background-color,color,transform,filter] duration-150",
              "data-[pressed]:scale-95 data-[hovered]:brightness-[1.06]",
              canSend ? "bg-accent-gradient text-fg-on-accent" : "bg-surface-active text-fg-disabled",
              focusRing,
            )}
          >
            <RiArrowUpLine className="size-[18px]" />
          </AriaButton>
        )}
      </div>
      {onFilesSelected ? (
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          tabIndex={-1}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFilesSelected(files);
            e.target.value = "";
          }}
        />
      ) : null}
    </div>
  );

  return (
    <div className={cx("w-full", className)}>
      <ComposerLoader active={!!loading} label={loadingLabel ?? t.generating} showStatus={loadingLabel != null}>
        {panel}
      </ComposerLoader>
    </div>
  );
}
