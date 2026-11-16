"use client";

import { createContext, useContext } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from "react-aria-components";
import type { DisclosureGroupProps, DisclosureProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";

export type AccordionVariant = "bordered" | "flush" | "separated";

const AccordionStyleContext = createContext<{ variant: AccordionVariant; headingLevel: 2 | 3 | 4 | 5 | 6 }>({ variant: "bordered", headingLevel: 3 });

export interface AccordionProps extends Omit<DisclosureGroupProps, "className" | "children"> {
  /** `bordered` card (default), `flush` rows with hairlines, or `separated` cards with gaps. */
  variant?: AccordionVariant;
  /** Heading level used for each item's title (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Expandable sections. One open at a time by default; pass
 * `allowsMultipleExpanded` to open several. Height animates smoothly.
 *
 *   <Accordion defaultExpandedKeys={["billing"]}><AccordionItem id="billing" title="Billing">…</AccordionItem></Accordion>
 */
export function Accordion({ variant = "bordered", headingLevel = 3, className, children, ref, ...props }: AccordionProps) {
  return (
    <AccordionStyleContext.Provider value={{ variant, headingLevel }}>
      <DisclosureGroup
        {...props}
        ref={ref}
        className={cx(
          "w-full",
          variant === "bordered" && "divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card",
          variant === "flush" && "divide-y divide-line border-y border-line",
          variant === "separated" && "flex flex-col gap-2.5",
          className,
        )}
      >
        {children}
      </DisclosureGroup>
    </AccordionStyleContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<DisclosureProps, "className" | "children"> {
  title: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Icon element before the title. */
  icon?: ReactNode;
  /** Content on the end side of the header, before the chevron (a badge, a count). */
  end?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One expandable section. Give it an `id` to control it from the Accordion. */
export function AccordionItem({ title, subtitle, icon, end, children, className, ...props }: AccordionItemProps) {
  const { variant, headingLevel } = useContext(AccordionStyleContext);
  const pad = variant === "flush" ? "px-1" : "px-5";
  return (
    <Disclosure
      {...props}
      className={cx(
        "group",
        variant === "separated" && "rounded-card border border-line bg-surface shadow-card data-[expanded]:shadow-raised transition-shadow duration-200",
        className,
      )}
    >
      <Heading level={headingLevel} className="m-0">
        <AriaButton
          slot="trigger"
          className={cx(
            "flex w-full cursor-default items-center gap-3 py-4 text-start outline-none transition-colors duration-150",
            "data-[disabled]:text-fg-disabled data-[focus-visible]:focus-ring data-[focus-visible]:outline-offset-[-2px]",
            variant !== "flush" && "data-[hovered]:bg-surface-hover/60",
            variant === "separated" ? "rounded-card" : variant === "bordered" ? "" : "rounded-control",
            pad,
          )}
        >
          {icon ? (
            <span className="grid size-8 shrink-0 place-items-center rounded-control bg-surface-muted text-fg-muted [&>svg]:size-[18px]">{icon}</span>
          ) : null}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-body font-medium text-fg">{title}</span>
            {subtitle ? <span className="text-body-sm text-fg-subtle">{subtitle}</span> : null}
          </span>
          {end}
          <ChevronGlyph className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft group-data-[expanded]:rotate-180" />
        </AriaButton>
      </Heading>
      <DisclosurePanel className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-out-soft motion-reduce:transition-none">
        <div className={cx("pb-5 text-body text-fg-muted", pad, icon ? (variant === "flush" ? "ps-12" : "ps-16") : null)}>{children}</div>
      </DisclosurePanel>
    </Disclosure>
  );
}
