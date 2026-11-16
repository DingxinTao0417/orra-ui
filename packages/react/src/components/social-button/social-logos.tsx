"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Simplified provider marks, drawn for Orra on a 24×24 grid. Brand colours
 * live only in these SVG fills. `mono` paints every shape in currentColor
 * (used on filled, brand-coloured buttons).
 */

export type SocialProvider =
  | "google"
  | "github"
  | "apple"
  | "microsoft"
  | "x"
  | "facebook"
  | "discord"
  | "gitlab"
  | "slack"
  | "linkedin"
  | "wechat"
  | "alipay";

export const SOCIAL_PROVIDERS: SocialProvider[] = ["google", "github", "apple", "microsoft", "x", "facebook", "discord", "gitlab", "slack", "linkedin", "wechat", "alipay"];

/** Brand colour per provider (null = monochrome mark that follows the text colour). */
export const SOCIAL_BRAND: Record<SocialProvider, string | null> = {
  google: null,
  github: null,
  apple: null,
  microsoft: null,
  x: null,
  facebook: "#1877F2",
  discord: "#5865F2",
  gitlab: "#E24329",
  slack: "#4A154B",
  linkedin: "#0A66C2",
  wechat: "#07C160",
  alipay: "#1677FF",
};

type LogoProps = { mono: boolean; id: string };

/** Paint a shape with a brand colour, or currentColor in mono mode. */
const paint = (mono: boolean, colour: string) => (mono ? "currentColor" : colour);

function Google({ mono }: LogoProps) {
  const w = 3.6;
  return (
    <g fill="none" strokeWidth={w}>
      <path d="M17.745 7.18A7.5 7.5 0 0 0 4.952 9.435" stroke={paint(mono, "#EA4335")} />
      <path d="M4.952 9.435A7.5 7.5 0 0 0 5.505 15.75" stroke={paint(mono, "#FBBC05")} />
      <path d="M5.505 15.75A7.5 7.5 0 0 0 17.745 16.82" stroke={paint(mono, "#34A853")} />
      <path d="M17.745 16.82A7.5 7.5 0 0 0 19.5 12" stroke={paint(mono, "#4285F4")} />
      <rect x="12" y="10.2" width="9.3" height="3.6" fill={paint(mono, "#4285F4")} stroke="none" />
    </g>
  );
}

function GitHub({ id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-gh`}>
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d="M7.4 10.6 7.7 5.4l3 2.6h2.6l3-2.6.3 5.2c.6.7.9 1.5.9 2.4 0 2.6-2.3 3.9-5.5 3.9s-5.5-1.3-5.5-3.9c0-.9.3-1.7.9-2.4Z" fill="#000" />
        <path d="M10.6 16.4h2.8V22h-2.8Z" fill="#000" />
        <path d="M10.6 18.6c-2 .4-3-.3-3.6-1.6" stroke="#000" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </mask>
      <circle cx="12" cy="12" r="10" fill="currentColor" mask={`url(#${id}-gh)`} />
    </>
  );
}

function Apple({ id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-ap`}>
        <path d="M12 8.2C13.5 7.2 17.8 6.8 18.6 11c.6 3.6-1.8 8.8-3.6 8.9-1.2.1-2-.6-3-.6s-1.8.7-3 .6C7.2 19.8 4.8 14.6 5.4 11 6.2 6.8 10.5 7.2 12 8.2Z" fill="#fff" />
        <circle cx="20.1" cy="12.4" r="2.5" fill="#000" />
      </mask>
      <path d="M2 2h20v20H2Z" fill="currentColor" mask={`url(#${id}-ap)`} />
      <path d="M12.3 6.8c-.1-2 1.3-3.5 3.3-3.7.1 2-1.3 3.5-3.3 3.7Z" fill="currentColor" />
    </>
  );
}

function Microsoft({ mono }: LogoProps) {
  return (
    <>
      <rect x="3" y="3" width="8.5" height="8.5" fill={paint(mono, "#F25022")} />
      <rect x="12.5" y="3" width="8.5" height="8.5" fill={paint(mono, "#7FBA00")} />
      <rect x="3" y="12.5" width="8.5" height="8.5" fill={paint(mono, "#00A4EF")} />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" fill={paint(mono, "#FFB900")} />
    </>
  );
}

function XMark(_: LogoProps) {
  return (
    <>
      <path d="M3.6 3.6h4.9l11.9 16.8h-4.9Z" fill="currentColor" />
      <path d="m19.6 3.6-6.2 7.1m-2.8 3.2-6.2 6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none" />
    </>
  );
}

function Facebook({ mono, id }: LogoProps) {
  const f = "M11.4 21.8v-8.4H9.2V11h2.2V9.4c0-2.5 1.4-3.8 3.7-3.8h1.2V8h-1c-1 0-1.4.6-1.4 1.5V11h2.3l-.4 2.4h-1.9v8.4Z";
  if (mono) return <path d={f} fill="currentColor" />;
  return (
    <>
      <mask id={`${id}-fb`}>
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d={f} fill="#000" />
      </mask>
      <circle cx="12" cy="12" r="10" fill="#1877F2" mask={`url(#${id}-fb)`} />
    </>
  );
}

function Discord({ mono, id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-dc`}>
        <path
          d="M5.5 6.8C7.2 5.7 9 5.2 10 5.1l.5 1c1-.2 2-.2 3 0l.5-1c1 .1 2.8.6 4.5 1.7 1.8 2.8 2.5 5.8 2.3 8.8-1.6 1.3-3.3 2-4.8 2.4l-.9-1.4c.8-.3 1.5-.7 2.1-1.1l-.4-.3c-3.1 1.5-6.5 1.5-9.6 0l-.4.3c.6.4 1.3.8 2.1 1.1L8 18c-1.5-.4-3.2-1.1-4.8-2.4-.2-3 .5-6 2.3-8.8Z"
          fill="#fff"
        />
        <ellipse cx="9.3" cy="12.2" rx="1.5" ry="1.7" fill="#000" />
        <ellipse cx="14.7" cy="12.2" rx="1.5" ry="1.7" fill="#000" />
      </mask>
      <path d="M2 2h20v20H2Z" fill={paint(mono, "#5865F2")} mask={`url(#${id}-dc)`} />
    </>
  );
}

function GitLab({ mono }: LogoProps) {
  const dark = paint(mono, "#E24329");
  const mid = paint(mono, "#FC6D26");
  const light = paint(mono, "#FCA326");
  return (
    <g strokeLinejoin="round" strokeWidth=".6">
      <path d="M2.5 13.5 4 4l2.5 6Z" fill={dark} stroke={dark} />
      <path d="M21.5 13.5 20 4l-2.5 6Z" fill={dark} stroke={dark} />
      <path d="M2.5 13.5 6.5 10 12 21Z" fill={light} stroke={light} />
      <path d="M21.5 13.5 17.5 10 12 21Z" fill={light} stroke={light} />
      <path d="M6.5 10h11L12 21Z" fill={mid} stroke={mid} />
    </g>
  );
}

function Slack({ mono }: LogoProps) {
  const r = 1.6;
  return (
    <>
      <g fill={paint(mono, "#36C5F0")}>
        <rect x="3" y="7.4" width="7.6" height="3.2" rx={r} />
        <rect x="7.4" y="3" width="3.2" height="3.2" rx={r} />
      </g>
      <g fill={paint(mono, "#2EB67D")}>
        <rect x="13.4" y="3" width="3.2" height="7.6" rx={r} />
        <rect x="17.8" y="7.4" width="3.2" height="3.2" rx={r} />
      </g>
      <g fill={paint(mono, "#ECB22E")}>
        <rect x="13.4" y="13.4" width="7.6" height="3.2" rx={r} />
        <rect x="13.4" y="17.8" width="3.2" height="3.2" rx={r} />
      </g>
      <g fill={paint(mono, "#E01E5A")}>
        <rect x="7.4" y="13.4" width="3.2" height="7.6" rx={r} />
        <rect x="3" y="13.4" width="3.2" height="3.2" rx={r} />
      </g>
    </>
  );
}

function LinkedIn({ mono, id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-li`}>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" />
        <circle cx="7.6" cy="7.4" r="1.5" fill="#000" />
        <rect x="6.3" y="9.7" width="2.6" height="8.3" fill="#000" />
        <path d="M10.8 9.7h2.5v1.2c.5-.8 1.4-1.4 2.7-1.4 2.2 0 3 1.4 3 3.6V18h-2.6v-4.4c0-1.1-.3-1.8-1.3-1.8s-1.7.8-1.7 1.9V18h-2.6Z" fill="#000" />
      </mask>
      <path d="M2 2h20v20H2Z" fill={paint(mono, "#0A66C2")} mask={`url(#${id}-li)`} />
    </>
  );
}

function WeChat({ mono, id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-wc`}>
        <ellipse cx="9.4" cy="9.4" rx="7" ry="6" fill="#fff" />
        <path d="m5.2 14 -.7 2.7 3.1-1.7Z" fill="#fff" />
        <ellipse cx="15.8" cy="14.6" rx="6.4" ry="5.5" fill="#000" />
        <ellipse cx="15.8" cy="14.6" rx="5.5" ry="4.7" fill="#fff" />
        <path d="m19.2 17.7.7 2.1-2.4-1.1Z" fill="#fff" />
        <circle cx="7.1" cy="8" r=".95" fill="#000" />
        <circle cx="11.7" cy="8" r=".95" fill="#000" />
        <circle cx="13.9" cy="13.7" r=".8" fill="#000" />
        <circle cx="17.7" cy="13.7" r=".8" fill="#000" />
      </mask>
      <path d="M1 1h22v22H1Z" fill={paint(mono, "#07C160")} mask={`url(#${id}-wc)`} />
    </>
  );
}

function Alipay({ mono, id }: LogoProps) {
  return (
    <>
      <mask id={`${id}-ap2`}>
        <rect x="3" y="3" width="18" height="18" rx="4.5" fill="#fff" />
        <g stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M6.8 8h10.4M12 5.8v5" />
          <path d="M7.6 12.2h8.6c-1.4 3.6-4.6 6.1-9 7" />
          <path d="M9.8 14.2c2.4 2.2 5.2 3.6 8.6 4.2" />
        </g>
      </mask>
      <path d="M2 2h20v20H2Z" fill={paint(mono, "#1677FF")} mask={`url(#${id}-ap2)`} />
    </>
  );
}

const LOGOS: Record<SocialProvider, (p: LogoProps) => ReactNode> = {
  google: Google,
  github: GitHub,
  apple: Apple,
  microsoft: Microsoft,
  x: XMark,
  facebook: Facebook,
  discord: Discord,
  gitlab: GitLab,
  slack: Slack,
  linkedin: LinkedIn,
  wechat: WeChat,
  alipay: Alipay,
};

export interface SocialLogoProps {
  provider: SocialProvider;
  /** Paint the mark in currentColor instead of its brand colours. */
  mono?: boolean;
  className?: string;
}

/** A provider mark as inline SVG (decorative; pair it with a text label). */
export function SocialLogo({ provider, mono = false, className }: SocialLogoProps) {
  const id = `orra-logo-${useId().replace(/:/g, "")}`;
  const Logo = LOGOS[provider];
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <Logo mono={mono} id={id} />
    </svg>
  );
}
