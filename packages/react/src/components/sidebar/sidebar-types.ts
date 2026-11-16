import type { ReactNode } from "react";
import type { AvatarStatus } from "../avatar/avatar";

export interface SidebarNavItem {
  id: string;
  /** Plain text: also used for tooltips in the collapsed rail. */
  label: string;
  /** Renders the item as a link (works with client routers via React Aria's RouterProvider). */
  href?: string;
  /** Icon element, e.g. `<RiHome5Line />`. */
  icon?: ReactNode;
  /** A count (number) or any small node after the label. In the collapsed rail it becomes a dot. */
  badge?: ReactNode;
  /** Colour of a numeric badge (default neutral). */
  badgeTone?: "neutral" | "accent" | "danger";
  /** Nested items: expand in place, or open as a flyout menu in the collapsed rail. */
  items?: SidebarNavItem[];
  isDisabled?: boolean;
}

export interface SidebarNavSection {
  id: string;
  /** Small heading above the section. */
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarWorkspace {
  id: string;
  name: string;
  /** Second line, e.g. plan or member count. */
  description?: string;
  /** Logo element; defaults to initials on a soft colour. */
  logo?: ReactNode;
}

export interface SidebarUser {
  name: string;
  email?: string;
  /** Avatar image URL. */
  src?: string;
  status?: AvatarStatus;
}

export interface SidebarUserMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  tone?: "default" | "danger";
  /** Draw a separator above this item. */
  separatorBefore?: boolean;
  href?: string;
}
