"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import type { TabListProps as AriaTabListProps, TabPanelProps as AriaTabPanelProps, TabProps as AriaTabProps, TabsProps as AriaTabsProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

export type TabsVariant = "underline" | "pill" | "segment";
type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  variant: TabsVariant;
  size: Size;
  fullWidth: boolean;
  orientation: Orientation;
}
const TabsStyleContext = createContext<TabsContextValue>({ variant: "underline", size: "md", fullWidth: false, orientation: "horizontal" });

export interface TabsProps extends Omit<AriaTabsProps, "className"> {
  /** `underline` (default) for page sections, `pill` for light filters, `segment` for a compact switcher. */
  variant?: TabsVariant;
  size?: Size;
  /** Stretch the tabs to fill the list (horizontal only). */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Tabs with an animated selection indicator, in underline, pill and segment
 * styles, horizontal or vertical. Arrow keys move between tabs.
 *
 *   <Tabs><TabList aria-label="Project"><Tab id="overview">Overview</Tab>…</TabList><TabPanel id="overview">…</TabPanel></Tabs>
 */
export function Tabs({ variant = "underline", size = "md", fullWidth = false, orientation = "horizontal", className, ...props }: TabsProps) {
  return (
    <TabsStyleContext.Provider value={{ variant, size, fullWidth, orientation }}>
      <AriaTabs
        {...props}
        orientation={orientation}
        className={cx("flex", orientation === "horizontal" ? "flex-col gap-4" : "flex-row items-start gap-6", className)}
      />
    </TabsStyleContext.Provider>
  );
}

/* Wrapper (positioning context for the indicator) and inner list classes. */
const WRAP: Record<TabsVariant, Record<Orientation, string>> = {
  underline: {
    horizontal: "relative flex max-w-full overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]",
    vertical: "relative flex border-s border-line",
  },
  pill: {
    horizontal: "relative flex max-w-full overflow-x-auto [scrollbar-width:none]",
    vertical: "relative flex",
  },
  segment: {
    horizontal: "relative inline-flex max-w-full self-start overflow-x-auto rounded-control bg-surface-muted p-1 [scrollbar-width:none]",
    vertical: "relative inline-flex self-start rounded-control bg-surface-muted p-1",
  },
};
const LIST: Record<TabsVariant, Record<Orientation, string>> = {
  underline: { horizontal: "flex gap-1", vertical: "flex w-full flex-col gap-0.5" },
  pill: { horizontal: "flex gap-1", vertical: "flex w-full flex-col gap-1" },
  segment: { horizontal: "flex gap-0.5", vertical: "flex w-full flex-col gap-0.5" },
};

const INDICATOR: Record<TabsVariant, Record<Orientation, string>> = {
  underline: {
    horizontal: "bottom-0 h-0.5 rounded-full bg-accent-500",
    vertical: "-start-px w-0.5 rounded-full bg-accent-500",
  },
  pill: {
    horizontal: "rounded-full bg-accent-50",
    vertical: "rounded-control bg-accent-50",
  },
  segment: {
    horizontal: "rounded-[7px] bg-surface shadow-xs",
    vertical: "rounded-[7px] bg-surface shadow-xs",
  },
};

type Box = { x: number; y: number; w: number; h: number };

/** Measures the selected tab inside `wrap` and follows selection / size changes. */
function useSelectedTabBox(wrapRef: RefObject<HTMLDivElement | null>, deps: unknown[]) {
  const [box, setBox] = useState<Box | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const tab = wrap.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return setBox(null);
      const a = wrap.getBoundingClientRect();
      const b = tab.getBoundingClientRect();
      const next = {
        x: b.left - a.left - wrap.clientLeft + wrap.scrollLeft,
        y: b.top - a.top - wrap.clientTop + wrap.scrollTop,
        w: b.width,
        h: b.height,
      };
      setBox((prev) => (prev && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    wrap.querySelectorAll('[role="tab"]').forEach((t) => ro.observe(t));
    const mo = new MutationObserver(measure);
    mo.observe(wrap, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected"] });
    const raf = requestAnimationFrame(() => setReady(true));
    return () => {
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { box, ready };
}

export interface TabListProps<T extends object = object> extends Omit<AriaTabListProps<T>, "className"> {
  /** Classes for the list wrapper (e.g. a width). */
  className?: string;
}

/** The row (or column) of tabs, with the animated selection indicator. Needs an `aria-label`. */
export function TabList<T extends object = object>({ className, ...props }: TabListProps<T>) {
  const { variant, fullWidth, orientation } = useContext(TabsStyleContext);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { box, ready } = useSelectedTabBox(wrapRef, [variant, orientation]);
  const horizontal = orientation === "horizontal";
  const style: CSSProperties | undefined = box
    ? variant === "underline"
      ? horizontal
        ? { left: box.x + 8, width: Math.max(0, box.w - 16) }
        : { top: box.y + 6, height: Math.max(0, box.h - 12) }
      : { left: box.x, top: box.y, width: box.w, height: box.h }
    : undefined;
  return (
    <div ref={wrapRef} className={cx(WRAP[variant][orientation], fullWidth && horizontal && "flex w-full", className)}>
      {box ? (
        <span
          aria-hidden
          style={style}
          className={cx(
            "pointer-events-none absolute",
            INDICATOR[variant][orientation],
            ready && "transition-[left,top,width,height] duration-300 ease-out-soft motion-reduce:transition-none",
          )}
        />
      ) : null}
      <AriaTabList<T> {...props} className={cx(LIST[variant][orientation], fullWidth && horizontal && "w-full")} />
    </div>
  );
}

const TAB_SIZE: Record<TabsVariant, Record<Size, string>> = {
  underline: { sm: "h-9 px-2.5 text-body-sm", md: "h-10 px-3 text-body", lg: "h-12 px-4 text-body-lg" },
  pill: { sm: "h-7 px-2.5 text-body-sm", md: "h-8 px-3 text-body", lg: "h-10 px-4 text-body-lg" },
  segment: { sm: "h-6 px-2.5 text-body-sm", md: "h-7 px-3 text-body", lg: "h-9 px-4 text-body-lg" },
};

export interface TabProps extends Omit<AriaTabProps, "className" | "children"> {
  /** Icon element before the label. */
  icon?: ReactNode;
  /** A count chip after the label (e.g. open issues). */
  count?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A single tab. Give it the same `id` as its TabPanel. */
export function Tab({ icon, count, children, className, ...props }: TabProps) {
  const { variant, size, fullWidth } = useContext(TabsStyleContext);
  return (
    <AriaTab
      {...props}
      className={({ isSelected }) =>
        cx(
          "group relative flex shrink-0 cursor-default select-none items-center gap-2 whitespace-nowrap font-medium outline-none",
          "transition-colors duration-150 data-[disabled]:text-fg-disabled",
          "data-[focus-visible]:focus-ring data-[focus-visible]:outline-offset-[-2px]",
          TAB_SIZE[variant][size],
          variant === "underline" && "rounded-[8px]",
          variant === "pill" && "rounded-full",
          variant === "segment" && "justify-center rounded-[7px]",
          fullWidth && "flex-1 justify-center",
          isSelected
            ? variant === "pill"
              ? "text-fg-accent"
              : "text-fg"
            : "text-fg-muted data-[hovered]:text-fg",
          !isSelected && variant === "pill" && "data-[hovered]:bg-surface-hover",
          className,
        )
      }
    >
      {({ isSelected }) => (
        <>
          <span className="relative z-[1] inline-flex items-center gap-2">
            {icon ? (
              <span className={cx("inline-flex size-4 shrink-0 [&>svg]:size-full", isSelected ? (variant === "pill" ? "" : "text-fg-accent") : "text-fg-subtle")}>
                {icon}
              </span>
            ) : null}
            {children}
            {count != null ? (
              <span
                className={cx(
                  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-micro font-semibold tabular-nums",
                  isSelected ? "bg-accent-100 text-fg-accent" : "bg-surface-muted text-fg-subtle",
                  variant === "segment" && !isSelected && "bg-surface-active",
                )}
              >
                {count}
              </span>
            ) : null}
          </span>
        </>
      )}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, "className"> {
  className?: string;
}

/** Content for the tab with the same `id`. */
export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      className={cx("min-w-0 flex-1 rounded-control text-body text-fg outline-none data-[focus-visible]:focus-ring", className)}
    />
  );
}
