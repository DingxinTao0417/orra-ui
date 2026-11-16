"use client";

import { createContext, useContext } from "react";
import type { ReactNode, Ref } from "react";
import { SelectionIndicator, ToggleButton, ToggleButtonGroup } from "react-aria-components";
import type { ToggleButtonGroupProps, ToggleButtonProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

const GROUP: Record<Size, string> = { sm: "h-8 p-0.5 rounded-[9px]", md: "h-9 p-[3px] rounded-control", lg: "h-11 p-1 rounded-xl" };
const ITEM: Record<Size, string> = {
  sm: "px-2.5 text-body-sm gap-1.5 rounded-[7px] [&_svg]:size-3.5",
  md: "px-3 text-body-sm gap-1.5 rounded-lg [&_svg]:size-4",
  lg: "px-4 text-body gap-2 rounded-[10px] [&_svg]:size-[18px]",
};

const SizeContext = createContext<{ size: Size; fullWidth?: boolean }>({ size: "md" });

export interface SegmentedControlOption {
  id: string;
  label?: ReactNode;
  icon?: ReactNode;
  isDisabled?: boolean;
  /** Required when the option is icon-only. */
  "aria-label"?: string;
}

export interface SegmentedControlProps
  extends Omit<ToggleButtonGroupProps, "className" | "children" | "selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange" | "disallowEmptySelection"> {
  /** Options as data; or pass `<SegmentedControlItem>` children instead. */
  options?: SegmentedControlOption[];
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: Size;
  /** Stretch to the container width with equal-width segments. */
  fullWidth?: boolean;
  /** Required: names the control for assistive tech. */
  "aria-label"?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline single-choice switcher with a sliding indicator (React Aria
 * SelectionIndicator, so it animates between segments with CSS only).
 *
 *   <SegmentedControl aria-label="视图" defaultValue="board"
 *     options={[{ id: "list", label: "列表" }, { id: "board", label: "看板" }]} />
 */
export function SegmentedControl({ options, children, value, defaultValue, onChange, size = "md", fullWidth, className, ref, ...props }: SegmentedControlProps) {
  const toSet = (v?: string) => (v === undefined ? undefined : [v]);
  return (
    <ToggleButtonGroup
      {...props}
      ref={ref}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={toSet(value)}
      defaultSelectedKeys={toSet(defaultValue)}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next != null) onChange?.(String(next));
      }}
      className={cx(
        "relative isolate items-stretch bg-canvas ring-1 ring-line ring-inset",
        fullWidth ? "flex w-full" : "inline-flex",
        "data-[disabled]:opacity-55",
        GROUP[size],
        className,
      )}
    >
      <SizeContext.Provider value={{ size, fullWidth }}>
      {options
        ? options.map((o) => (
            <SegmentedControlItem key={o.id} id={o.id} icon={o.icon} isDisabled={o.isDisabled} aria-label={o["aria-label"]}>
              {o.label}
            </SegmentedControlItem>
          ))
        : children}
      </SizeContext.Provider>
    </ToggleButtonGroup>
  );
}

export interface SegmentedControlItemProps extends Omit<ToggleButtonProps, "className" | "children" | "id"> {
  id: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One segment. Size comes from the parent control. */
export function SegmentedControlItem({ icon, children, className, ...props }: SegmentedControlItemProps) {
  const { size, fullWidth } = useContext(SizeContext);
  return (
    <ToggleButton
      {...props}
      className={cx(
        "relative z-0 inline-flex cursor-default select-none items-center justify-center whitespace-nowrap font-medium text-fg-muted outline-none",
        "transition-colors duration-150 data-[hovered]:text-fg data-[selected]:text-fg",
        "data-[disabled]:text-fg-disabled data-[focus-visible]:focus-ring",
        ITEM[size],
        fullWidth ? "min-w-0 flex-1" : "shrink-0",
        className,
      )}
    >
      <SelectionIndicator className="absolute inset-0 -z-10 rounded-[inherit] bg-surface shadow-xs ring-1 ring-line transition-[translate,width,height] duration-250 ease-out-soft motion-reduce:transition-none" />
      {icon ? <span className="inline-flex shrink-0 [&>svg]:shrink-0">{icon}</span> : null}
      {children != null ? <span className="truncate">{children}</span> : null}
    </ToggleButton>
  );
}
