import { useId } from "react";
import { cx } from "@orra-ui/react/lib/cx";

/**
 * The Orra UI mark: a halo ring broken at the top right, with a lit orb resting
 * in the gap. The tile follows the theme's accent ramp, so it re-tints with the
 * accent picker. Static brand files live in /brand.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 64 64" className={cx("size-7 shrink-0", className)} fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-accent-400)" />
          <stop offset="1" stopColor="var(--color-accent-700)" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}-tile)`} />
      <rect width="64" height="64" rx="15" fill={`url(#${id}-sheen)`} />
      <rect x=".5" y=".5" width="63" height="63" rx="14.5" stroke="#fff" strokeOpacity=".16" />
      <g transform="translate(5.76 5.76) scale(.82)">
        <path d="M36.66 14.61A18 18 0 1 0 49.39 27.34" stroke="#fff" strokeWidth="6.8" strokeLinecap="round" />
        <circle cx="44.73" cy="19.27" r="6.6" fill="#fff" opacity=".55" filter={`url(#${id}-glow)`} />
        <circle cx="44.73" cy="19.27" r="4.8" fill="#fff" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-body-lg leading-none font-semibold tracking-tight text-fg">Orra UI</span>
    </span>
  );
}
