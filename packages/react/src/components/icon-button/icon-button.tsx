"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { SpinnerGlyph } from "../../lib/glyphs";
import type { Size } from "../../lib/recipes";
import { buttonClass, type ButtonTone, type ButtonVariant } from "../button/button";

const SQUARE: Record<Size, string> = { sm: "size-8 px-0", md: "size-9 px-0", lg: "size-11 px-0" };
const GLYPH: Record<Size, string> = { sm: "size-4", md: "size-[18px]", lg: "size-5" };

export interface IconButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  /** The icon element, e.g. `<RiMoreLine />`. */
  icon: ReactNode;
  /** Required: icon-only buttons need an accessible name. */
  "aria-label": string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: Size;
  /** Round instead of rounded-square. */
  round?: boolean;
  loading?: boolean;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A square, icon-only button. Defaults to the quiet `plain` / `neutral` look
 * used in toolbars and card headers.
 *
 *   <IconButton icon={<RiMoreLine />} aria-label="More actions" />
 */
export function IconButton({ icon, variant = "plain", tone = "neutral", size = "md", round, loading, className, ref, ...props }: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      ref={ref}
      isPending={loading || props.isPending}
      className={cx(buttonClass({ variant, tone, size }), SQUARE[size], round && "rounded-full", className)}
    >
      {loading ? <SpinnerGlyph className={GLYPH[size]} /> : <span className={cx("inline-flex [&>svg]:size-full", GLYPH[size])}>{icon}</span>}
    </AriaButton>
  );
}
