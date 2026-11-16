/**
 * Shared class recipes. Every component builds on these so that inputs,
 * menus, popovers and cards look identical across the library. Change a
 * recipe here and the whole family follows.
 */

export type Size = "sm" | "md" | "lg";

/** Keyboard focus ring for any interactive element (use with data-focus-visible / :focus-visible). */
export const focusRing = "outline-none focus-visible:focus-ring data-[focus-visible]:focus-ring";

/** Height + horizontal padding + text size per control size (buttons, inputs, selects). */
export const controlSize: Record<Size, string> = {
  sm: "h-8 px-2.5 text-body-sm gap-1.5",
  md: "h-9 px-3 text-body gap-2",
  lg: "h-11 px-4 text-body-lg gap-2",
};

/** Icon size that pairs with each control size. */
export const iconSize: Record<Size, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-[18px]",
};

/** The box shared by Input, Textarea, Select trigger, Combobox, NumberField, TimeField, SearchField… */
export const fieldBox = [
  "flex w-full items-center rounded-control border border-line-strong bg-surface text-fg shadow-xs",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-line-hover",
  "focus-within:border-accent-500 focus-within:ring-3 focus-within:ring-accent-500/15",
  "data-[invalid]:border-danger data-[invalid]:focus-within:ring-danger/15",
  "data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-muted data-[disabled]:text-fg-disabled data-[disabled]:shadow-none",
].join(" ");

/** Placeholder styling for native inputs inside a fieldBox. */
export const fieldInput = "min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed";

/** Floating panel for menus, selects, comboboxes, popovers. */
export const floatingPanel = [
  "rounded-menu bg-surface-raised p-1 text-fg shadow-popover outline-none",
  "data-[entering]:animate-in data-[exiting]:animate-out",
].join(" ");

/** A row inside a menu / listbox. */
export const menuItem = [
  "relative flex cursor-default select-none items-center gap-2 rounded-[10px] px-2.5 py-2 text-body outline-none",
  "text-fg data-[focused]:bg-surface-hover data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
  "data-[disabled]:pointer-events-none data-[disabled]:text-fg-disabled",
].join(" ");

/** Section heading inside menus and listboxes. */
export const menuHeading = "px-2.5 pt-2 pb-1 text-caption font-medium text-fg-subtle";

/** Card / panel surface. */
export const card = "rounded-card border border-line bg-surface shadow-card";

/** Dimmed backdrop behind modal overlays. */
export const overlayBackdrop = [
  "fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]",
  "data-[entering]:animate-fade-in data-[exiting]:animate-out",
].join(" ");
