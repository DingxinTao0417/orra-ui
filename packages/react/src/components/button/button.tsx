"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import type { ButtonProps as AriaButtonProps, LinkProps as AriaLinkProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { SpinnerGlyph } from "../../lib/glyphs";
import { controlSize, focusRing, iconSize, type Size } from "../../lib/recipes";

export type ButtonVariant = "solid" | "outline" | "soft" | "plain";
export type ButtonTone = "accent" | "neutral" | "danger";

const VARIANTS: Record<ButtonVariant, Record<ButtonTone, string>> = {
  solid: {
    accent: "bg-accent-gradient text-fg-on-accent data-[hovered]:brightness-[1.06] data-[pressed]:brightness-95",
    neutral: "bg-surface-inverse text-fg-inverse shadow-xs data-[hovered]:opacity-90 data-[pressed]:opacity-80",
    danger: "bg-danger-gradient text-white data-[hovered]:brightness-[1.06] data-[pressed]:brightness-95",
  },
  outline: {
    accent: "border border-line-strong bg-surface text-fg-accent shadow-xs data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
    neutral: "border border-line-strong bg-surface text-fg shadow-xs data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
    danger: "border border-line-strong bg-surface text-danger shadow-xs data-[hovered]:bg-danger-soft data-[pressed]:bg-danger-soft",
  },
  soft: {
    accent: "bg-accent-50 text-fg-accent data-[hovered]:bg-accent-100 data-[pressed]:bg-accent-200",
    neutral: "bg-surface-muted text-fg data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
    danger: "bg-danger-soft text-danger data-[hovered]:brightness-[0.97] data-[pressed]:brightness-95",
  },
  plain: {
    accent: "text-fg-accent data-[hovered]:bg-accent-50 data-[pressed]:bg-accent-100",
    neutral: "text-fg-muted data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
    danger: "text-danger data-[hovered]:bg-danger-soft data-[pressed]:bg-danger-soft",
  },
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: Size;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

/** Class string for button styling — use it to style other elements (e.g. a Dropdown trigger) as buttons. */
export function buttonClass({ variant = "solid", tone = "accent", size = "md", fullWidth = false }: ButtonStyleOptions = {}) {
  return cx(
    "inline-flex shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-control font-medium",
    "transition-[background-color,color,box-shadow,filter,opacity] duration-150",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
    focusRing,
    controlSize[size],
    VARIANTS[variant][tone],
    fullWidth && "w-full",
  );
}

interface ButtonOwnProps extends ButtonStyleOptions {
  /** Icon element before the label, e.g. `<RiAddLine />`. */
  startIcon?: ReactNode;
  /** Icon element after the label. */
  endIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends ButtonOwnProps, Omit<AriaButtonProps, "className" | "children"> {
  /** Shows a spinner, keeps the width and blocks presses (maps to React Aria `isPending`). */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

function Content({ size, startIcon, endIcon, loading, children }: { size: Size; startIcon?: ReactNode; endIcon?: ReactNode; loading?: boolean; children?: ReactNode }) {
  const icon = iconSize[size];
  return (
    <>
      {loading ? <SpinnerGlyph className={icon} /> : startIcon ? <span className={cx("inline-flex shrink-0 [&>svg]:size-full", icon)}>{startIcon}</span> : null}
      {children != null ? <span className="truncate">{children}</span> : null}
      {endIcon ? <span className={cx("inline-flex shrink-0 [&>svg]:size-full rtl:[&>svg]:-scale-x-100", icon)}>{endIcon}</span> : null}
    </>
  );
}

/**
 * The action button. Built on React Aria's Button, so it handles press,
 * keyboard and touch consistently and exposes data-hovered / data-pressed.
 *
 *   <Button startIcon={<RiAddLine />}>New project</Button>
 *   <Button variant="outline" tone="neutral">Cancel</Button>
 */
export function Button({ variant, tone, size = "md", fullWidth, startIcon, endIcon, loading, className, children, ref, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      ref={ref}
      isPending={loading || props.isPending}
      className={cx(buttonClass({ variant, tone, size, fullWidth }), className)}
    >
      <Content size={size} startIcon={startIcon} endIcon={endIcon} loading={loading || props.isPending}>
        {children}
      </Content>
    </AriaButton>
  );
}

export interface ButtonLinkProps extends ButtonOwnProps, Omit<AriaLinkProps, "className" | "children"> {
  ref?: Ref<HTMLAnchorElement>;
}

/** A link that looks like a Button (renders <a>; works with client-side routers via React Aria's RouterProvider). */
export function ButtonLink({ variant, tone, size = "md", fullWidth, startIcon, endIcon, className, children, ref, ...props }: ButtonLinkProps) {
  return (
    <AriaLink {...props} ref={ref} className={cx(buttonClass({ variant, tone, size, fullWidth }), className)}>
      <Content size={size} startIcon={startIcon} endIcon={endIcon}>
        {children}
      </Content>
    </AriaLink>
  );
}
