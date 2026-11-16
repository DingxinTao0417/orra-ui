"use client";

import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  Autocomplete,
  Dialog,
  DialogTrigger,
  Input,
  Menu,
  Modal as AriaModal,
  ModalOverlay,
  SearchField,
  useFilter,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiSearchLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { overlayBackdrop } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { DropdownItem, DropdownSection } from "../dropdown/dropdown";
import type { DropdownItemProps, DropdownSectionProps } from "../dropdown/dropdown";
import { Kbd } from "../kbd/kbd";

const COPY = {
  en: {
    title: "Command palette",
    placeholder: "Type a command or search…",
    empty: "No results for “{query}”",
    emptyHint: "Try a different keyword.",
    navigate: "Navigate",
    select: "Open",
    close: "Close",
  },
  zh: {
    title: "命令面板",
    placeholder: "输入命令或搜索…",
    empty: "没有找到与“{query}”相关的结果",
    emptyHint: "换个关键词试试。",
    navigate: "切换",
    select: "打开",
    close: "关闭",
  },
};
export type CommandPaletteLabels = (typeof COPY)["en"];

/* --------------------------------------------------------------- shortcut */

function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1] ?? "";
  return {
    key,
    mod: parts.includes("mod") || parts.includes("cmd") || parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt") || parts.includes("option"),
  };
}

/* ------------------------------------------------------------------ root */

export interface CommandPaletteProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Optional pressable element that opens the palette. */
  trigger?: ReactElement;
  /**
   * Global keyboard shortcut that toggles the palette, e.g. "mod+k" (default) or "mod+shift+p".
   * `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Pass `false` for none.
   */
  shortcut?: string | false;
  placeholder?: string;
  /** CommandPaletteGroup / CommandPaletteItem elements. */
  children: ReactNode;
  /** Called with the item id when an item is chosen; the palette then closes. */
  onAction?: (key: Key) => void;
  /** Search text (controlled). */
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  /** Custom filter; defaults to a case- and accent-insensitive "contains" on the item text + keywords. */
  filter?: (textValue: string, inputValue: string) => boolean;
  /** Replaces the default empty state. */
  emptyState?: ReactNode;
  /** Replaces the key-hint footer; `false` hides it. */
  footer?: ReactNode | false;
  /** Classes for the panel. */
  className?: string;
  labels?: Partial<CommandPaletteLabels>;
}

/**
 * A ⌘K dialog: a search box over grouped commands with icons, descriptions
 * and shortcuts. Arrow keys move through results, Enter runs, Escape clears
 * then closes.
 *
 *   <CommandPalette onAction={run}>
 *     <CommandPaletteGroup title="Pages"><CommandPaletteItem id="home">Home</CommandPaletteItem></CommandPaletteGroup>
 *   </CommandPalette>
 */
export function CommandPalette({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  trigger,
  shortcut = "mod+k",
  placeholder,
  children,
  onAction,
  inputValue,
  defaultInputValue = "",
  onInputChange,
  filter,
  emptyState,
  footer,
  className,
  labels,
}: CommandPaletteProps) {
  const t = useCopy(COPY, labels);
  const [open, setOpen] = useControllableState(isOpen, defaultOpen, onOpenChange);
  const [query, setQuery] = useControllableState(inputValue, defaultInputValue, onInputChange);
  const { contains } = useFilter({ sensitivity: "base" });

  const openRef = useRef(open);
  openRef.current = open;
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (shortcut === false) return;
    const combo = parseShortcut(shortcut);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== combo.key) return;
      if (combo.mod !== (e.metaKey || e.ctrlKey) || combo.shift !== e.shiftKey || combo.alt !== e.altKey) return;
      e.preventDefault();
      setOpenRef.current(!openRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && inputValue === undefined) setQuery("");
  };

  const overlay = (
    <ModalOverlay
      isOpen={open}
      onOpenChange={handleOpenChange}
      isDismissable
      className={cx(overlayBackdrop, "flex items-start justify-center px-3 pt-[10vh] pb-4 sm:pt-[14vh]")}
    >
      <AriaModal
        className={cx(
          "flex w-full max-w-[600px] flex-col overflow-hidden rounded-card bg-surface-raised text-fg shadow-raised outline-none",
          "data-[entering]:animate-dialog-in data-[exiting]:animate-dialog-out",
          className,
        )}
      >
        <Dialog aria-label={t.title} className="flex max-h-[min(540px,76dvh)] flex-col outline-none">
          {({ close }) => (
            <Autocomplete
              inputValue={query}
              onInputChange={setQuery}
              filter={(textValue, input) => (filter ? filter(textValue, input) : contains(textValue, input))}
            >
              <SearchField aria-label={t.title} autoFocus className="group flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
                <RiSearchLine aria-hidden className="size-5 shrink-0 text-fg-subtle" />
                <Input
                  placeholder={placeholder ?? t.placeholder}
                  className="h-full min-w-0 flex-1 bg-transparent text-body-lg text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
                />
                <Kbd keys="esc" size="sm" className="hidden sm:inline-flex" />
              </SearchField>
              <Menu
                aria-label={t.title}
                onAction={(key) => {
                  onAction?.(key);
                  close();
                }}
                renderEmptyState={() =>
                  emptyState ?? (
                    <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                      <RiSearchLine aria-hidden className="mb-2 size-6 text-fg-disabled" />
                      <p className="text-body font-medium text-fg">{fill(t.empty, { query })}</p>
                      <p className="text-body-sm text-fg-subtle">{t.emptyHint}</p>
                    </div>
                  )
                }
                className="min-h-0 flex-1 overflow-y-auto scroll-py-2 p-2 outline-none"
              >
                {children}
              </Menu>
            </Autocomplete>
          )}
        </Dialog>
        {footer === false ? null : (
          <div className="flex shrink-0 items-center gap-4 border-t border-line bg-surface-muted/60 px-4 py-2.5 text-caption text-fg-subtle">
            {footer ?? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Kbd keys={["up", "down"]} size="sm" />
                  {t.navigate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Kbd keys="enter" size="sm" />
                  {t.select}
                </span>
                <span className="ms-auto inline-flex items-center gap-1.5">
                  <Kbd keys="esc" size="sm" />
                  {t.close}
                </span>
              </>
            )}
          </div>
        )}
      </AriaModal>
    </ModalOverlay>
  );

  if (!trigger) return overlay;
  return (
    <DialogTrigger isOpen={open} onOpenChange={handleOpenChange}>
      {trigger}
      {overlay}
    </DialogTrigger>
  );
}

/* ------------------------------------------------------------------ parts */

export interface CommandPaletteItemProps extends DropdownItemProps {
  /** Extra search terms (synonyms, English names…) that should match this item. */
  keywords?: string[];
}

/** A command row: icon, label, optional description and shortcut. */
export function CommandPaletteItem({ keywords, textValue, children, className, ...props }: CommandPaletteItemProps) {
  const base = textValue ?? (typeof children === "string" ? children : "");
  return (
    <DropdownItem {...props} textValue={[base, ...(keywords ?? [])].join(" ").trim() || undefined} className={cx("py-2.5", className)}>
      {children}
    </DropdownItem>
  );
}

export type CommandPaletteGroupProps = DropdownSectionProps;

/** A titled group of commands (e.g. Pages, Actions, Recent). Hidden when nothing in it matches. */
export function CommandPaletteGroup(props: CommandPaletteGroupProps) {
  return <DropdownSection {...props} />;
}
