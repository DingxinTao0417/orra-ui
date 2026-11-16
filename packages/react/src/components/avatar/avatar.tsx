"use client";

import { Children, createContext, isValidElement, useContext, useEffect, useState } from "react";
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from "react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

const COPY = {
  en: { online: "Online", away: "Away", busy: "Do not disturb", offline: "Offline", more: "{count} more", user: "User" },
  zh: { online: "在线", away: "离开", busy: "勿扰", offline: "离线", more: "还有 {count} 人", user: "用户" },
};
export type AvatarLabels = (typeof COPY)["en"];

const BOX: Record<AvatarSize, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-12 text-body",
  xl: "size-16 text-title-sm",
};

const SQUARE_RADIUS: Record<AvatarSize, string> = {
  xs: "rounded-[6px]",
  sm: "rounded-[8px]",
  md: "rounded-control",
  lg: "rounded-[12px]",
  xl: "rounded-menu",
};

const STATUS_DOT: Record<AvatarSize, string> = {
  xs: "size-1.5 ring-1",
  sm: "size-2 ring-[1.5px]",
  md: "size-2.5 ring-2",
  lg: "size-3 ring-2",
  xl: "size-3.5 ring-[2.5px]",
};

const STATUS_TONE: Record<AvatarStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-fg-disabled",
};

/** Eight soft fills derived from the chart palette; text is mixed toward the foreground for contrast. */
const SWATCHES = [
  "bg-[color-mix(in_oklab,var(--color-chart-1)_15%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-1)_70%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-2)_15%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-2)_70%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-3)_20%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-3)_55%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-4)_20%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-4)_55%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-5)_25%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-5)_45%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-6)_15%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-6)_70%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-7)_20%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-7)_60%,var(--color-fg))]",
  "bg-[color-mix(in_oklab,var(--color-chart-8)_25%,var(--color-surface))] text-[color-mix(in_oklab,var(--color-chart-8)_45%,var(--color-fg))]",
];

/** Stable 0–7 swatch index for a name (same name → same colour everywhere). */
export function avatarSwatchIndex(seed: string): number {
  let hash = 7;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % SWATCHES.length;
}

/**
 * Initials for a display name: "Lin Xiaoyu" → "LX", "陈思远" → "思远",
 * "ops-bot" → "OB". Returns "" when nothing usable is left.
 */
export function avatarInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return "";
  // CJK names: the given name (last two characters) reads most naturally.
  if (/^[㐀-鿿豈-﫿]+$/.test(clean.replace(/\s+/g, ""))) {
    const chars = Array.from(clean.replace(/\s+/g, ""));
    return chars.length <= 2 ? chars.join("") : chars.slice(-2).join("");
  }
  const words = clean.split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0]!, words[words.length - 1]!].map((w) => Array.from(w)[0]) : Array.from(words[0] ?? "").slice(0, 2);
  return letters.join("").toUpperCase();
}

interface AvatarGroupContextValue {
  size?: AvatarSize;
  square?: boolean;
  grouped: boolean;
}
const AvatarGroupContext = createContext<AvatarGroupContextValue>({ grouped: false });

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Display name: used for the accessible label, the initials fallback and the colour. */
  name?: string;
  /** Image URL. Falls back to initials (or `icon`) if missing or broken. */
  src?: string;
  /** Override the computed initials. */
  initials?: string;
  /** Element shown instead of initials when there is no image, e.g. `<RiUserLine />`. */
  icon?: ReactNode;
  size?: AvatarSize;
  /** Rounded-square instead of a circle (teams, workspaces, bots). */
  square?: boolean;
  /** Presence indicator in the bottom end corner. */
  status?: AvatarStatus;
  /** Override the built-in copy (status names, "{count} more"). */
  labels?: Partial<AvatarLabels>;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * A person, team or bot. Shows the image when it loads, otherwise initials on
 * a soft colour picked deterministically from the name.
 *
 *   <Avatar name="林晓雨" status="online" />
 */
export function Avatar({ name, src, initials, icon, size, square, status, labels, className, ref, ...props }: AvatarProps) {
  const group = useContext(AvatarGroupContext);
  const t = useCopy(COPY, labels);
  const resolvedSize = size ?? group.size ?? "md";
  const isSquare = square ?? group.square ?? false;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const showImage = !!src && !failed;
  const text = initials ?? (name ? avatarInitials(name) : "");
  const label = [name ?? t.user, status ? t[status] : null].filter(Boolean).join(" · ");
  const swatch = SWATCHES[avatarSwatchIndex(name ?? text)];
  const radius = isSquare ? SQUARE_RADIUS[resolvedSize] : "rounded-full";

  return (
    <span
      role="img"
      aria-label={label}
      {...props}
      ref={ref}
      className={cx("relative inline-flex shrink-0 select-none align-middle", BOX[resolvedSize], group.grouped && "ring-2 ring-surface", radius, className)}
    >
      <span className={cx("flex size-full items-center justify-center overflow-hidden font-semibold leading-none", radius, !showImage && swatch)}>
        {showImage ? (
          <img src={src} alt="" draggable={false} onError={() => setFailed(true)} className="size-full object-cover" />
        ) : text ? (
          <span aria-hidden className={cx("tracking-tight", /^[\u3400-\u9fff]{2}$/.test(text) && "text-[0.86em] tracking-[-0.04em]")}>
            {text}
          </span>
        ) : (
          <span aria-hidden className="inline-flex size-[55%] [&>svg]:size-full">{icon ?? <PersonGlyph />}</span>
        )}
      </span>
      {status ? (
        <span
          aria-hidden
          className={cx(
            "absolute end-0 bottom-0 rounded-full ring-surface",
            isSquare && "-end-0.5 -bottom-0.5",
            STATUS_DOT[resolvedSize],
            STATUS_TONE[status],
          )}
        />
      ) : null}
    </span>
  );
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="10" cy="7" r="3.6" />
      <path d="M3.2 17.2c.8-3.3 3.5-5.2 6.8-5.2s6 1.9 6.8 5.2c.1.5-.3.8-.7.8H3.9c-.4 0-.8-.3-.7-.8Z" />
    </svg>
  );
}

const OVERLAP: Record<AvatarSize, string> = {
  xs: "-space-x-1.5",
  sm: "-space-x-2",
  md: "-space-x-2",
  lg: "-space-x-3",
  xl: "-space-x-4",
};

export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** `<Avatar>` elements. */
  children: ReactNode;
  /** Show at most this many avatars, then a "+N" chip. */
  max?: number;
  /** Total people when it exceeds the rendered children (e.g. a paginated member list). */
  total?: number;
  /** Size for every avatar in the group. */
  size?: AvatarSize;
  square?: boolean;
  labels?: Partial<AvatarLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Overlapping stack of avatars with a "+N" overflow chip.
 *
 *   <AvatarGroup max={4}>{members.map((m) => <Avatar key={m.id} name={m.name} />)}</AvatarGroup>
 */
export function AvatarGroup({ children, max, total, size = "md", square, labels, className, ref, ...props }: AvatarGroupProps) {
  const t = useCopy(COPY, labels);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const visible = max != null && max >= 0 ? items.slice(0, max) : items;
  const count = Math.max(total ?? items.length, items.length);
  const overflow = count - visible.length;
  const moreLabel = fill(t.more, { count: overflow });

  return (
    <AvatarGroupContext.Provider value={{ size, square, grouped: true }}>
      <div role="group" {...props} ref={ref} className={cx("flex items-center", OVERLAP[size], className)}>
        {visible}
        {overflow > 0 ? (
          <span
            role="img"
            aria-label={moreLabel}
            title={moreLabel}
            className={cx(
              "relative inline-flex shrink-0 items-center justify-center bg-surface-muted font-medium text-fg-muted tabular-nums ring-2 ring-surface",
              BOX[size],
              square ? SQUARE_RADIUS[size] : "rounded-full",
            )}
          >
            <span aria-hidden>+{overflow > 99 ? 99 : overflow}</span>
          </span>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
}
