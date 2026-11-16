"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { card } from "../../lib/recipes";

/* ---------------------------------------------------------------- context */

export interface SettingsModalApi {
  /** Flag the open page as edited: shows the save bar. */
  markDirty: () => void;
  /** Whether there are unsaved edits. */
  dirty: boolean;
  /** The active section id. */
  section: string;
  setSection: (id: string) => void;
  close: () => void;
}

export const SettingsModalContext = createContext<SettingsModalApi | null>(null);

/** Access the surrounding SettingsModal (markDirty, section…) from page content. */
export function useSettingsModal(): SettingsModalApi {
  return (
    useContext(SettingsModalContext) ?? {
      markDirty: () => {},
      dirty: false,
      section: "",
      setSection: () => {},
      close: () => {},
    }
  );
}

/* ------------------------------------------------------------------ parts */

export interface SettingsRowProps {
  label: ReactNode;
  description?: ReactNode;
  /** The control (switch, select, button…). */
  children?: ReactNode;
  /** Put the control under the text instead of on the end side. */
  stacked?: boolean;
  /** id of the control the label names (for native inputs). */
  htmlFor?: string;
  className?: string;
}

/** One setting: label + description on the start side, its control on the end side. */
export function SettingsRow({ label, description, children, stacked, htmlFor, className }: SettingsRowProps) {
  const Label = htmlFor ? "label" : "div";
  return (
    <div className={cx("flex gap-x-6 gap-y-3 py-4", stacked ? "flex-col" : "flex-col @md:flex-row @md:items-center", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Label htmlFor={htmlFor} className="text-body font-medium text-fg">
          {label}
        </Label>
        {description ? <p className="text-body-sm text-fg-subtle">{description}</p> : null}
      </div>
      {children != null ? (
        <div className={cx("flex min-w-0 items-center gap-2", !stacked && "@md:max-w-[55%] @md:shrink-0 @md:justify-end")}>{children}</div>
      ) : null}
    </div>
  );
}

export interface SettingsGroupProps {
  title?: ReactNode;
  description?: ReactNode;
  /** SettingsRows; they get hairlines between them. */
  children: ReactNode;
  /** Draw the rows inside a bordered card. */
  bordered?: boolean;
  className?: string;
}

/** A titled block of SettingsRows. */
export function SettingsGroup({ title, description, children, bordered, className }: SettingsGroupProps) {
  return (
    <section className={cx("flex flex-col gap-1", className)}>
      {title || description ? (
        <div className="flex flex-col gap-0.5 pb-1">
          {title ? <h3 className="text-body-sm font-semibold text-fg">{title}</h3> : null}
          {description ? <p className="text-body-sm text-fg-subtle">{description}</p> : null}
        </div>
      ) : null}
      <div className={cx("@container flex flex-col divide-y divide-line", bordered && cx(card, "px-4 shadow-none"))}>{children}</div>
    </section>
  );
}
