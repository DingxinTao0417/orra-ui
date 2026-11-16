"use client";

import { Children, cloneElement, createContext, isValidElement, useContext } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup } from "react-aria-components";
import type { ToggleButtonGroupProps as AriaToggleButtonGroupProps, ToggleButtonProps as AriaToggleButtonProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { controlSize, focusRing, iconSize, type Size } from "../../lib/recipes";
import { Button, ButtonLink, type ButtonTone, type ButtonVariant } from "../button/button";
import { IconButton } from "../icon-button/icon-button";

type Orientation = "horizontal" | "vertical";

const ButtonGroupContext = createContext<{ size: Size; orientation: Orientation }>({ size: "md", orientation: "horizontal" });

/** Fuses direct children: shared borders, outer radius only on the first / last item, focused item on top. */
function fused(orientation: Orientation) {
  return orientation === "horizontal"
    ? cx(
        "inline-flex items-stretch",
        "[&>*]:rounded-none [&>*:first-child]:rounded-s-control [&>*:last-child]:rounded-e-control",
        "[&>*:not(:first-child)]:-ms-px",
      )
    : cx(
        "inline-flex flex-col items-stretch",
        "[&>*]:rounded-none [&>*:first-child]:rounded-t-control [&>*:last-child]:rounded-b-control",
        "[&>*:not(:first-child)]:-mt-px",
      );
}
const LAYERING = "[&>*]:relative [&>*:hover]:z-[1] [&>*[data-selected]]:z-[2] [&>*[data-focus-visible]]:z-[3]";

/* ------------------------------------------------------- action group */

export interface ButtonGroupProps {
  /** `Button`, `IconButton` or `ButtonLink` elements (for a selectable group, use `selectionMode` + `ButtonGroupItem`). */
  children: ReactNode;
  /** Size applied to every child that doesn't set its own. */
  size?: Size;
  /** Variant applied to children that don't set one (default "outline"). */
  variant?: ButtonVariant;
  /** Tone applied to children that don't set one (default "neutral"). */
  tone?: ButtonTone;
  orientation?: Orientation;
  /** Single or multiple selection: renders a React Aria ToggleButtonGroup of `ButtonGroupItem`s. */
  selectionMode?: AriaToggleButtonGroupProps["selectionMode"];
  selectedKeys?: AriaToggleButtonGroupProps["selectedKeys"];
  defaultSelectedKeys?: AriaToggleButtonGroupProps["defaultSelectedKeys"];
  onSelectionChange?: AriaToggleButtonGroupProps["onSelectionChange"];
  /** Keep at least one item selected. */
  disallowEmptySelection?: boolean;
  isDisabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const STYLED = new Set<unknown>([Button, IconButton, ButtonLink]);

/**
 * A fused row (or column) of buttons. Size, variant and tone flow down to
 * children that don't set their own. With `selectionMode`, items become
 * toggle buttons with a selected state.
 *
 *   <ButtonGroup aria-label="文本对齐" selectionMode="single" defaultSelectedKeys={["left"]}>
 *     <ButtonGroupItem id="left" icon={<RiAlignLeft />} aria-label="左对齐" />
 *     …
 *   </ButtonGroup>
 */
export function ButtonGroup({
  children,
  size = "md",
  variant = "outline",
  tone = "neutral",
  orientation = "horizontal",
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disallowEmptySelection,
  isDisabled,
  className,
  ref,
  ...aria
}: ButtonGroupProps) {
  const classes = cx(fused(orientation), LAYERING, "w-fit shadow-xs rounded-control [&>*]:shadow-none", className);

  if (selectionMode) {
    return (
      <ButtonGroupContext.Provider value={{ size, orientation }}>
        <AriaToggleButtonGroup
          {...aria}
          ref={ref}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          defaultSelectedKeys={defaultSelectedKeys}
          onSelectionChange={onSelectionChange}
          disallowEmptySelection={disallowEmptySelection}
          isDisabled={isDisabled}
          orientation={orientation}
          className={classes}
        >
          {children}
        </AriaToggleButtonGroup>
      </ButtonGroupContext.Provider>
    );
  }

  const items = Children.map(children, (child) => {
    if (!isValidElement(child) || !STYLED.has(child.type)) return child;
    const el = child as ReactElement<{ size?: Size; variant?: ButtonVariant; tone?: ButtonTone; isDisabled?: boolean }>;
    return cloneElement(el, {
      size: el.props.size ?? size,
      variant: el.props.variant ?? variant,
      tone: el.props.tone ?? tone,
      isDisabled: el.props.isDisabled ?? isDisabled,
    });
  });

  return (
    <ButtonGroupContext.Provider value={{ size, orientation }}>
      <div role="group" {...aria} ref={ref} data-orientation={orientation} className={classes}>
        {items}
      </div>
    </ButtonGroupContext.Provider>
  );
}

/* ------------------------------------------------------- toggle item */

const SQUARE: Record<Size, string> = { sm: "w-8 px-0", md: "w-9 px-0", lg: "w-11 px-0" };

export interface ButtonGroupItemProps extends Omit<AriaToggleButtonProps, "className" | "children"> {
  /** Icon element; alone (with `aria-label`) it makes a square icon button. */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/** A selectable item inside `<ButtonGroup selectionMode=…>`. Needs an `id`. */
export function ButtonGroupItem({ icon, children, className, ref, ...props }: ButtonGroupItemProps) {
  const { size } = useContext(ButtonGroupContext);
  const iconOnly = icon != null && children == null;
  return (
    <AriaToggleButton
      {...props}
      ref={ref}
      className={cx(
        "inline-flex shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-control font-medium",
        "border border-line-strong bg-surface text-fg-muted transition-[background-color,color] duration-150",
        "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
        "data-[selected]:bg-surface-active data-[selected]:text-fg",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        focusRing,
        controlSize[size],
        iconOnly && SQUARE[size],
        className,
      )}
    >
      {icon ? <span aria-hidden className={cx("inline-flex shrink-0 [&>svg]:size-full", iconSize[size])}>{icon}</span> : null}
      {children != null ? <span className="truncate">{children}</span> : null}
    </AriaToggleButton>
  );
}
