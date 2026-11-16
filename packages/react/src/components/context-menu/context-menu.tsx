"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode, Ref } from "react";
import { Menu, MenuTrigger, Popover as AriaPopover, Pressable } from "react-aria-components";
import type { MenuProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import { DropdownItem, DropdownSection, DropdownSeparator, DropdownSubmenu, dropdownPanelClass } from "../dropdown/dropdown";

const LONG_PRESS_MS = 520;
const MOVE_TOLERANCE = 10;

export interface ContextMenuProps<T extends object = object> extends Omit<MenuProps<T>, "children" | "className" | "style"> {
  /** The area that responds to right-click, long-press and Shift+F10 / the Menu key. */
  children: ReactNode;
  /** The menu content: ContextMenuItem / ContextMenuSection / ContextMenuSeparator / ContextMenuSubmenu. */
  menu: ReactNode;
  isDisabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Make the area itself focusable so keyboard users can open the menu (default true). */
  focusable?: boolean;
  /** Classes for the area wrapper. */
  className?: string;
  /** Classes for the floating menu panel. */
  menuClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A menu opened at the pointer by right-click, by long-press on touch, or
 * with Shift+F10 / the Menu key on the focused area. Uses the same items as
 * Dropdown.
 *
 *   <ContextMenu menu={<ContextMenuItem id="copy">Copy</ContextMenuItem>} onAction={run}>
 *     <FileCard />
 *   </ContextMenu>
 */
export function ContextMenu<T extends object = object>({
  children,
  menu,
  isDisabled,
  onOpenChange,
  focusable = true,
  className,
  menuClassName,
  ref,
  ...menuProps
}: ContextMenuProps<T>) {
  const [isOpen, setOpenState] = useState(false);
  const [focusFirst, setFocusFirst] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const setOpen = (open: boolean) => {
    setOpenState(open);
    onOpenChange?.(open);
  };
  const press = useRef<{ x: number; y: number; timer: number } | null>(null);

  const openAt = (x: number, y: number, viaKeyboard = false) => {
    if (isDisabled) return;
    setPoint({ x, y });
    setFocusFirst(viaKeyboard);
    setOpen(true);
  };

  const onContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    e.preventDefault();
    cancelPress();
    openAt(e.clientX, e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      const target = (e.target as HTMLElement) ?? e.currentTarget;
      const rect = target.getBoundingClientRect();
      const rtl = getComputedStyle(target).direction === "rtl";
      openAt(rtl ? rect.right - 8 : rect.left + 8, rect.top + Math.min(rect.height, 28), true);
    }
  };

  function cancelPress() {
    if (press.current) window.clearTimeout(press.current.timer);
    press.current = null;
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isDisabled || e.pointerType !== "touch") return;
    const { clientX: x, clientY: y } = e;
    cancelPress();
    press.current = { x, y, timer: window.setTimeout(() => openAt(x, y), LONG_PRESS_MS) };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!press.current) return;
    if (Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > MOVE_TOLERANCE) cancelPress();
  };

  return (
    <>
      <div
        ref={ref}
        tabIndex={focusable && !isDisabled ? 0 : undefined}
        data-open={isOpen || undefined}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        className={cx("[-webkit-touch-callout:none]", focusRing, className)}
      >
        {children}
      </div>
      <div
        className="contents"
        onContextMenu={(e) => {
          // A right-click while open lands on the popover underlay: close instead of showing the native menu.
          e.preventDefault();
          setOpen(false);
        }}
      >
        <MenuTrigger isOpen={isOpen} onOpenChange={setOpen}>
          {/* Invisible anchor at the pointer: it acts as the menu trigger for positioning. */}
          <Pressable>
            <span
              role="presentation"
              tabIndex={-1}
              className="pointer-events-none fixed size-0 outline-none"
              style={{ left: point.x, top: point.y }}
            />
          </Pressable>
          <AriaPopover placement="bottom start" offset={2} className={cx(dropdownPanelClass, menuClassName)}>
            <Menu<T> {...menuProps} autoFocus={focusFirst ? "first" : true} className="max-h-[inherit] outline-none">
              {menu}
            </Menu>
          </AriaPopover>
        </MenuTrigger>
      </div>
    </>
  );
}

/** Same as DropdownItem, named for context menus. */
export const ContextMenuItem = DropdownItem;
/** Same as DropdownSection, named for context menus. */
export const ContextMenuSection = DropdownSection;
/** Same as DropdownSeparator, named for context menus. */
export const ContextMenuSeparator = DropdownSeparator;
/** Same as DropdownSubmenu, named for context menus. */
export const ContextMenuSubmenu = DropdownSubmenu;
