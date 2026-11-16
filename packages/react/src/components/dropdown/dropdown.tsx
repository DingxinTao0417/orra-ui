"use client";

import type { ReactElement, ReactNode, Ref } from "react";
import {
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover as AriaPopover,
  Separator,
  SubmenuTrigger,
  Text,
} from "react-aria-components";
import type { MenuItemProps, MenuProps, MenuSectionProps, PopoverProps as AriaPopoverProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { floatingPanel, menuHeading, menuItem } from "../../lib/recipes";
import { Kbd } from "../kbd/kbd";

/* ------------------------------------------------------------------ panel */

/** Classes for the floating menu panel (shared by Dropdown, ContextMenu and submenus). */
export const dropdownPanelClass = cx(floatingPanel, "min-w-48 max-w-[min(20rem,calc(100vw-1.5rem))] overflow-auto");

const menuListClass = "max-h-[inherit] outline-none";

/* ------------------------------------------------------------------ root */

export interface DropdownProps<T extends object = object>
  extends Omit<MenuProps<T>, "className" | "style">,
    Pick<AriaPopoverProps, "placement" | "offset" | "crossOffset" | "shouldFlip"> {
  /** A pressable element (e.g. `<Button>` / `<IconButton>`) that opens the menu. */
  trigger: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Open on press (default) or on long press. */
  triggerMode?: "press" | "longPress";
  /** Classes for the floating panel (e.g. a fixed width). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * An action menu attached to a trigger. Fill it with DropdownItem,
 * DropdownSection, DropdownSeparator and DropdownSubmenu.
 *
 *   <Dropdown trigger={<IconButton icon={<RiMoreLine />} aria-label="More" />} onAction={run}>
 *     <DropdownItem id="rename" icon={<RiEditLine />} shortcut="mod+r">Rename</DropdownItem>
 *   </Dropdown>
 */
export function Dropdown<T extends object = object>({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  triggerMode,
  placement = "bottom start",
  offset = 6,
  crossOffset,
  shouldFlip,
  className,
  ref,
  ...menuProps
}: DropdownProps<T>) {
  return (
    <MenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} trigger={triggerMode}>
      {trigger}
      <AriaPopover placement={placement} offset={offset} crossOffset={crossOffset} shouldFlip={shouldFlip} className={cx(dropdownPanelClass, className)}>
        <Menu<T> {...menuProps} ref={ref} className={menuListClass} />
      </AriaPopover>
    </MenuTrigger>
  );
}

/* ------------------------------------------------------------------ items */

export interface DropdownItemProps<T extends object = object> extends Omit<MenuItemProps<T>, "children" | "className"> {
  /** Icon element before the label, e.g. `<RiEditLine />`. */
  icon?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Keyboard shortcut hint, e.g. "mod+d" or ["shift", "delete"]. */
  shortcut?: string | string[];
  /** `danger` for destructive actions. */
  tone?: "default" | "danger";
  /** Extra content on the end side (a badge, a count). */
  end?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A row in a Dropdown / ContextMenu. Shows a check (multiple) or dot (single) when its section is selectable. */
export function DropdownItem<T extends object = object>({
  icon,
  description,
  shortcut,
  tone = "default",
  end,
  children,
  className,
  textValue,
  ...props
}: DropdownItemProps<T>) {
  const danger = tone === "danger";
  return (
    <MenuItem<T>
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={cx(
        menuItem,
        description ? "items-start" : null,
        danger && "text-danger data-[focused]:bg-danger-soft data-[hovered]:bg-danger-soft data-[pressed]:bg-danger-soft",
        "data-[open]:bg-surface-hover",
        className,
      )}
    >
      {({ selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode !== "none" ? (
            <span className={cx("grid size-4 shrink-0 place-items-center text-fg-accent", description ? "mt-0.5" : null)}>
              {isSelected ? (
                selectionMode === "multiple" ? (
                  <CheckGlyph className="size-4" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )
              ) : null}
            </span>
          ) : null}
          {icon ? (
            <span
              className={cx(
                "inline-flex size-4 shrink-0 [&>svg]:size-full",
                danger ? "text-danger" : "text-fg-subtle",
                description ? "mt-0.5" : null,
              )}
            >
              {icon}
            </span>
          ) : null}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className="truncate">
              {children}
            </Text>
            {description ? (
              <Text slot="description" className="text-caption text-fg-subtle">
                {description}
              </Text>
            ) : null}
          </span>
          {end}
          {shortcut ? <Kbd keys={shortcut} size="sm" variant="ghost" joined className="ms-3 h-auto px-0" /> : null}
          {hasSubmenu ? <ChevronGlyph direction="right" className="-me-1 size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" /> : null}
        </>
      )}
    </MenuItem>
  );
}

export interface DropdownSectionProps<T extends object = object> extends Omit<MenuSectionProps<T>, "className" | "children"> {
  /** Heading shown above the items. */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A group of items with an optional heading. Give it `selectionMode`
 * ("single" | "multiple") + `selectedKeys` / `onSelectionChange` for radio / checkbox items.
 */
export function DropdownSection<T extends object = object>({ title, children, className, ...props }: DropdownSectionProps<T>) {
  return (
    <MenuSection<T> {...props} className={cx("[&:not(:first-child)]:mt-1", className)}>
      {title ? <Header className={menuHeading}>{title}</Header> : null}
      {children}
    </MenuSection>
  );
}

/** A hairline between items or sections. */
export function DropdownSeparator({ className }: { className?: string }) {
  return <Separator className={cx("mx-1.5 my-1 h-px bg-line", className)} />;
}

export interface DropdownSubmenuProps {
  /** Label of the row that opens the submenu. */
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  /** Required when the label isn't plain text (used for type-ahead). */
  textValue?: string;
  isDisabled?: boolean;
  /** Items of the nested menu. */
  children: ReactNode;
  /** Selection props for the nested menu. */
  menuProps?: Omit<MenuProps<object>, "children" | "className" | "style">;
  /** Classes for the nested panel. */
  className?: string;
}

/** A row that opens a nested menu (hover, → or Enter). */
export function DropdownSubmenu({ label, icon, description, textValue, isDisabled, children, menuProps, className }: DropdownSubmenuProps) {
  return (
    <SubmenuTrigger>
      <DropdownItem icon={icon} description={description} textValue={textValue} isDisabled={isDisabled}>
        {label}
      </DropdownItem>
      <AriaPopover offset={-2} crossOffset={-5} className={cx(dropdownPanelClass, className)}>
        <Menu {...menuProps} className={menuListClass}>
          {children}
        </Menu>
      </AriaPopover>
    </SubmenuTrigger>
  );
}
