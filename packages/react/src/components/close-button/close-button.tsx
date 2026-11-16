"use client";

import type { Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CloseGlyph } from "../../lib/glyphs";
import { focusRing, type Size } from "../../lib/recipes";

const COPY = {
  en: { close: "Close" },
  zh: { close: "关闭" },
};
export type CloseButtonLabels = (typeof COPY)["en"];

const BOX: Record<Size, string> = { sm: "size-6 rounded-[7px]", md: "size-7 rounded-[8px]", lg: "size-8 rounded-control" };
const GLYPH: Record<Size, string> = { sm: "size-3.5", md: "size-4", lg: "size-[18px]" };

const VARIANTS = {
  plain: "text-fg-subtle data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
  soft: "bg-surface-muted text-fg-muted data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
  inverse: "text-current opacity-75 data-[hovered]:bg-current/15 data-[hovered]:opacity-100 data-[pressed]:bg-current/20",
} as const;
export type CloseButtonVariant = keyof typeof VARIANTS;

export interface CloseButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  size?: Size;
  /** `plain` (default) for panels, `soft` on busy backgrounds, `inverse` on solid/coloured surfaces (inherits text colour). */
  variant?: CloseButtonVariant;
  round?: boolean;
  /** Overrides the accessible label (default "Close" / "关闭"). */
  "aria-label"?: string;
  labels?: Partial<CloseButtonLabels>;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The small × button for dialogs, drawers, banners and toasts. Inside a React
 * Aria Dialog, pass `slot="close"` to close it without wiring `onPress`.
 *
 *   <CloseButton onPress={dismiss} />
 */
export function CloseButton({ size = "md", variant = "plain", round, labels, className, ref, ...props }: CloseButtonProps) {
  const t = useCopy(COPY, labels);
  return (
    <AriaButton
      aria-label={t.close}
      {...props}
      ref={ref}
      className={cx(
        "inline-flex shrink-0 cursor-default items-center justify-center transition-[background-color,color,opacity] duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        focusRing,
        BOX[size],
        round && "rounded-full",
        VARIANTS[variant],
        className,
      )}
    >
      <CloseGlyph className={GLYPH[size]} />
    </AriaButton>
  );
}
