"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Group, Input as AriaInput, SearchField as AriaSearchField } from "react-aria-components";
import type { FieldErrorProps, SearchFieldProps as AriaSearchFieldProps } from "react-aria-components";
import { RiSearchLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { CloseGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, fieldInput, focusRing, iconSize, type Size } from "../../lib/recipes";

const COPY = {
  en: { placeholder: "Search…", clear: "Clear search" },
  zh: { placeholder: "搜索…", clear: "清空搜索" },
};
export type SearchFieldLabels = typeof COPY.en;

const noop = () => () => {};
const isApplePlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/** True on macOS / iOS. Server and first client render return false, so markup hydrates cleanly. */
function useIsApple() {
  return useSyncExternalStore(noop, isApplePlatform, () => false);
}

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  /** Defaults to "Search…" / "搜索…". */
  placeholder?: string;
  size?: Size;
  /**
   * A letter that focuses the field with ⌘ / Ctrl + key from anywhere on the
   * page, e.g. `"k"`. Rendered as a key hint on the end side while empty.
   */
  shortcut?: string;
  /** Visual pill style. */
  round?: boolean;
  /** Replace the default search icon (pass `null` to hide it). */
  icon?: ReactNode;
  labels?: Partial<SearchFieldLabels>;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Search input with a leading icon, a clear button, Escape-to-clear and an
 * optional global shortcut hint such as ⌘K.
 *
 *   <SearchField shortcut="k" onSubmit={runSearch} />
 */
export function SearchField({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  shortcut,
  round,
  icon,
  labels,
  className,
  inputClassName,
  ref,
  ...props
}: SearchFieldProps) {
  const t = useCopy(COPY, labels);
  const isApple = useIsApple();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!shortcut) return;
    const key = shortcut.toLowerCase();
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === key) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
  };

  return (
    <AriaSearchField {...props} className={cx("group flex w-full flex-col gap-1.5", className)}>
      {({ isDisabled, isInvalid }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <Group isDisabled={isDisabled} isInvalid={isInvalid} className={cx(fieldBox, controlSize[size], round && "rounded-full")}>
            {icon === null ? null : (
              <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size])}>{icon ?? <RiSearchLine />}</span>
            )}
            <AriaInput
              ref={setRefs}
              placeholder={placeholder ?? t.placeholder}
              className={cx(fieldInput, "h-full [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden", inputClassName)}
            />
            <AriaButton
              aria-label={t.clear}
              className={cx(
                "-me-1 inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-full text-fg-subtle transition-colors duration-150",
                "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
                "group-data-[empty]:hidden data-[disabled]:hidden",
                focusRing,
              )}
            >
              <CloseGlyph className="size-4" />
            </AriaButton>
            {shortcut ? (
              <kbd
                aria-hidden
                className="hidden shrink-0 items-center gap-0.5 rounded-md border border-line bg-surface-muted px-1.5 py-px font-sans text-caption font-medium text-fg-subtle [.group[data-empty]:not(:focus-within)_&]:inline-flex"
              >
                <span>{isApple ? "⌘" : "Ctrl"}</span>
                <span>{shortcut.toUpperCase()}</span>
              </kbd>
            ) : null}
          </Group>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
        </>
      )}
    </AriaSearchField>
  );
}
