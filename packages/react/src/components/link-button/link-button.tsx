"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import type { ButtonProps as AriaButtonProps, LinkProps as AriaLinkProps } from "react-aria-components";
import { RiArrowRightUpLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing, type Size } from "../../lib/recipes";

const COPY = {
  en: { newTab: "(opens in a new tab)" },
  zh: { newTab: "（在新标签页打开）" },
};
export type LinkButtonLabels = (typeof COPY)["en"];

export type LinkButtonTone = "accent" | "neutral" | "muted" | "danger";

const TONES: Record<LinkButtonTone, string> = {
  accent: "text-fg-accent decoration-accent-500/40 data-[hovered]:decoration-current",
  neutral: "text-fg decoration-line-hover data-[hovered]:decoration-current",
  muted: "text-fg-muted decoration-line-hover data-[hovered]:text-fg data-[hovered]:decoration-current",
  danger: "text-danger decoration-danger/40 data-[hovered]:decoration-current",
};

const SIZES: Record<Size | "inherit", string> = {
  sm: "text-body-sm gap-1",
  md: "text-body gap-1.5",
  lg: "text-body-lg gap-1.5",
  inherit: "gap-[0.3em]",
};
const ICON: Record<Size | "inherit", string> = { sm: "size-3.5", md: "size-4", lg: "size-[18px]", inherit: "size-[1.1em]" };

interface LinkButtonOwnProps {
  tone?: LinkButtonTone;
  /** Text size; `inherit` takes the surrounding text size (inline in a sentence). */
  size?: Size | "inherit";
  /** When the underline shows. */
  underline?: "hover" | "always" | "none";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Opens in a new tab with an ↗ icon and a screen-reader hint (links only). */
  external?: boolean;
  labels?: Partial<LinkButtonLabels>;
  className?: string;
  children?: ReactNode;
}

export type LinkButtonProps = LinkButtonOwnProps &
  (
    | ({ href: string; ref?: Ref<HTMLAnchorElement> } & Omit<AriaLinkProps, "className" | "children" | "href">)
    | ({ href?: undefined; ref?: Ref<HTMLButtonElement> } & Omit<AriaButtonProps, "className" | "children">)
  );

/** Class string for link-styled text actions. */
export function linkButtonClass({ tone = "accent", size = "inherit", underline = "hover" }: Pick<LinkButtonOwnProps, "tone" | "size" | "underline"> = {}) {
  return cx(
    "inline-flex cursor-pointer items-center rounded-[4px] font-medium underline-offset-[3px] decoration-1",
    "transition-[color,text-decoration-color] duration-150",
    underline === "always" && "underline",
    underline === "hover" && "decoration-transparent underline data-[hovered]:decoration-current",
    underline === "none" && "no-underline",
    "data-[disabled]:cursor-default data-[disabled]:text-fg-disabled data-[disabled]:no-underline",
    focusRing,
    SIZES[size],
    TONES[tone],
    underline === "hover" && "decoration-transparent",
  );
}

/**
 * Inline text action that looks like a link (underline on hover). Renders an
 * <a> when given `href`, otherwise a <button>.
 *
 *   <LinkButton href="/docs/billing">查看计费说明</LinkButton>
 *   <LinkButton onPress={resend} tone="muted">重新发送验证码</LinkButton>
 */
export function LinkButton(props: LinkButtonProps) {
  const { tone = "accent", size = "inherit", underline = "hover", startIcon, endIcon, external, labels, className, children } = props;
  const t = useCopy(COPY, labels);
  const icon = ICON[size];
  const classes = cx(linkButtonClass({ tone, size, underline }), className);
  const content = (
    <>
      {startIcon ? <span aria-hidden className={cx("inline-flex shrink-0 [&>svg]:size-full", icon)}>{startIcon}</span> : null}
      <span>{children}</span>
      {endIcon ? (
        <span aria-hidden className={cx("inline-flex shrink-0 [&>svg]:size-full rtl:[&>svg]:-scale-x-100", icon)}>{endIcon}</span>
      ) : external && props.href != null ? (
        <span aria-hidden className={cx("inline-flex shrink-0 opacity-70 [&>svg]:size-full rtl:[&>svg]:-scale-x-100", icon)}>
          <RiArrowRightUpLine />
        </span>
      ) : null}
      {external && props.href != null ? <span className="sr-only">{t.newTab}</span> : null}
    </>
  );

  if (props.href != null) {
    const { tone: _t, size: _s, underline: _u, startIcon: _si, endIcon: _ei, external: _e, labels: _l, className: _c, children: _ch, ...rest } = props;
    return (
      <AriaLink {...rest} target={external ? "_blank" : rest.target} rel={external ? "noopener noreferrer" : rest.rel} className={classes}>
        {content}
      </AriaLink>
    );
  }
  const { tone: _t, size: _s, underline: _u, startIcon: _si, endIcon: _ei, external: _e, labels: _l, className: _c, children: _ch, href: _h, ...rest } = props;
  return (
    <AriaButton {...rest} className={cx(classes, "text-start")}>
      {content}
    </AriaButton>
  );
}
