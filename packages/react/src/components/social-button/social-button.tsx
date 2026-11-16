"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { SpinnerGlyph } from "../../lib/glyphs";
import { controlSize, focusRing, type Size } from "../../lib/recipes";
import { buttonClass } from "../button/button";
import { SOCIAL_BRAND, SocialLogo, type SocialProvider } from "./social-logos";


const COPY = {
  en: {
    continue: "Continue with {provider}",
    signIn: "Sign in with {provider}",
    signUp: "Sign up with {provider}",
    google: "Google",
    github: "GitHub",
    apple: "Apple",
    microsoft: "Microsoft",
    x: "X",
    facebook: "Facebook",
    discord: "Discord",
    gitlab: "GitLab",
    slack: "Slack",
    linkedin: "LinkedIn",
    wechat: "WeChat",
    alipay: "Alipay",
  },
  zh: {
    continue: "使用 {provider} 继续",
    signIn: "使用 {provider} 登录",
    signUp: "使用 {provider} 注册",
    google: "Google",
    github: "GitHub",
    apple: "Apple",
    microsoft: "Microsoft",
    x: "X",
    facebook: "Facebook",
    discord: "Discord",
    gitlab: "GitLab",
    slack: "Slack",
    linkedin: "领英",
    wechat: "微信",
    alipay: "支付宝",
  },
};
export type SocialButtonLabels = (typeof COPY)["en"];

const SQUARE: Record<Size, string> = { sm: "size-8 px-0", md: "size-9 px-0", lg: "size-11 px-0" };
const LOGO: Record<Size, string> = { sm: "size-4", md: "size-[18px]", lg: "size-5" };

export interface SocialButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  provider: SocialProvider;
  /** `outline` (default): neutral button with the colour mark. `filled`: brand-coloured surface with a white mark. */
  variant?: "outline" | "filled";
  /** Square, logo-only button (the label becomes its accessible name). */
  iconOnly?: boolean;
  /** Wording of the generated label. */
  action?: "continue" | "signIn" | "signUp";
  /** Custom label instead of "Continue with …". */
  children?: ReactNode;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  labels?: Partial<SocialButtonLabels>;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Sign-in button for a common identity provider, with its mark and a
 * localized "Continue with …" label.
 *
 *   <SocialButton provider="github" fullWidth />
 *   <SocialButton provider="wechat" variant="filled" />
 *   <SocialButton provider="apple" iconOnly />
 */
export function SocialButton({
  provider,
  variant = "outline",
  iconOnly = false,
  action = "continue",
  children,
  size = "md",
  fullWidth,
  loading,
  labels,
  className,
  ref,
  ...props
}: SocialButtonProps) {
  const t = useCopy(COPY, labels);
  const label = fill(t[action], { provider: t[provider] });
  const brand = SOCIAL_BRAND[provider];
  const filled = variant === "filled";
  // Monochrome marks (GitHub, Apple, X) always follow the text colour; brand marks turn white on their own colour.
  const mono = brand == null ? provider === "github" || provider === "apple" || provider === "x" : filled;

  const surface = filled
    ? brand
      ? "bg-[var(--orra-social-brand)] text-fg-on-accent shadow-xs data-[hovered]:brightness-[1.08] data-[pressed]:brightness-95"
      : "bg-surface-inverse text-fg-inverse shadow-xs data-[hovered]:opacity-90 data-[pressed]:opacity-80"
    : null;

  return (
    <AriaButton
      aria-label={iconOnly ? (typeof children === "string" ? children : label) : undefined}
      {...props}
      ref={ref}
      isPending={loading || props.isPending}
      style={brand ? ({ "--orra-social-brand": brand } as CSSProperties) : undefined}
      className={cx(
        filled
          ? cx(
              "inline-flex shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-control font-medium",
              "transition-[filter,opacity] duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
              focusRing,
              controlSize[size],
              surface,
              fullWidth && "w-full",
            )
          : buttonClass({ variant: "outline", tone: "neutral", size, fullWidth }),
        iconOnly && SQUARE[size],
        className,
      )}
    >
      {loading || props.isPending ? <SpinnerGlyph className={LOGO[size]} /> : <SocialLogo provider={provider} mono={mono} className={cx("shrink-0", LOGO[size])} />}
      {iconOnly ? null : <span className="truncate">{children ?? label}</span>}
    </AriaButton>
  );
}
