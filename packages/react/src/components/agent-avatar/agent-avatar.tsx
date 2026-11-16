"use client";

import { useId } from "react";
import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";

const COPY = {
  en: { agent: "AI agent", idle: "Idle", thinking: "Thinking", speaking: "Speaking", working: "Working", error: "Needs attention" },
  zh: { agent: "AI 智能体", idle: "空闲", thinking: "思考中", speaking: "回复中", working: "执行中", error: "需要处理" },
};
export type AgentAvatarLabels = (typeof COPY)["en"];

export type AgentAvatarState = "idle" | "thinking" | "speaking" | "working" | "error";
export type AgentAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const BOX: Record<AgentAvatarSize, string> = {
  xs: "size-5",
  sm: "size-7",
  md: "size-9",
  lg: "size-12",
  xl: "size-[72px]",
};

/** Blur radius of the outer glow, scaled with the avatar. */
const GLOW: Record<AgentAvatarSize, string> = {
  xs: "blur-[3px]",
  sm: "blur-[4px]",
  md: "blur-[6px]",
  lg: "blur-[8px]",
  xl: "blur-[12px]",
};

/** Chart hues that read well as orb colours (chart-7 is a neutral grey, so it is left out). */
const SEED_HUES = [1, 2, 3, 4, 5, 6, 8].map((n) => `var(--color-chart-${n})`);

/** Stable 32-bit hash for a seed string (same seed → same colours everywhere). */
export function agentSeedHash(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/**
 * The three orb colours for a seed, as CSS colour values built from theme
 * tokens. Without a seed the orb uses Orra's accent ramp.
 */
export function agentAvatarColors(seed?: string): [string, string, string] {
  if (!seed) return ["var(--color-accent-300)", "var(--color-accent-500)", "var(--color-chart-2)"];
  const h = agentSeedHash(seed);
  const n = SEED_HUES.length;
  const a = h % n;
  const b = (a + 1 + ((h >>> 4) % (n - 2))) % n;
  let c = (b + 1 + ((h >>> 9) % (n - 2))) % n;
  if (c === a) c = (c + 1) % n;
  return [SEED_HUES[a]!, SEED_HUES[b]!, SEED_HUES[c]!];
}

const ERROR_COLORS: [string, string, string] = [
  "color-mix(in oklab, var(--color-danger) 55%, var(--color-surface))",
  "var(--color-danger)",
  "color-mix(in oklab, var(--color-danger) 70%, var(--color-warning))",
];

/** Swirl speed of the orb's inner colours, per state. */
const SWIRL: Record<AgentAvatarState, string> = {
  idle: "[animation-duration:10s]",
  thinking: "[animation-duration:2.4s]",
  speaking: "[animation-duration:4s]",
  working: "[animation-duration:5s]",
  error: "",
};
const SWIRL_BACK: Record<AgentAvatarState, string> = {
  idle: "[animation-duration:16s]",
  thinking: "[animation-duration:3.8s]",
  speaking: "[animation-duration:6.4s]",
  working: "[animation-duration:8s]",
  error: "",
};

export interface AgentAvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color"> {
  /** The agent's display name, used for the accessible label. */
  name?: string;
  /** Any string (agent id, name…) that picks the orb colours. Omit it to use the accent colour. */
  seed?: string;
  /** Explicit orb colours (any CSS colour, e.g. `var(--color-chart-4)`); overrides `seed`. */
  colors?: [string, string, string];
  /** What the agent is doing, expressed by motion: a slow drift when idle, a fast swirl with an orbiting halo when thinking, a breathing pulse when speaking, a dashed rotating halo when working. */
  state?: AgentAvatarState;
  size?: AgentAvatarSize;
  /** Show the halo ring around the orb (default true). */
  halo?: boolean;
  labels?: Partial<AgentAvatarLabels>;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Animated identity for an AI agent: a lit orb inside a broken halo ring,
 * after the Orra mark. Colours come from `seed` (or the accent), and the
 * state is expressed through motion. With reduced motion it renders a still,
 * fully legible orb.
 *
 *   <AgentAvatar name="小研" seed="researcher" state="thinking" />
 */
export function AgentAvatar({ name, seed, colors, state = "idle", size = "md", halo = true, labels, className, style, ref, ...props }: AgentAvatarProps) {
  const t = useCopy(COPY, labels);
  const reduce = useReducedMotion();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [c1, c2, c3] = state === "error" ? ERROR_COLORS : (colors ?? agentAvatarColors(seed));
  const label = `${name ?? t.agent} · ${t[state]}`;
  const moving = state !== "error";
  const busy = state === "thinking" || state === "working";

  return (
    <span
      role="img"
      aria-label={label}
      data-state={state}
      {...props}
      ref={ref}
      style={{ ...style, "--agent-c1": c1, "--agent-c2": c2, "--agent-c3": c3 } as CSSProperties}
      className={cx("relative inline-grid shrink-0 select-none place-items-center align-middle", BOX[size], className)}
    >
      {/* soft glow behind the orb */}
      <span
        aria-hidden
        className={cx(
          "absolute inset-[14%] rounded-full bg-[radial-gradient(circle,var(--agent-c2)_0%,var(--agent-c1)_45%,transparent_72%)] transition-opacity duration-300",
          GLOW[size],
          busy || state === "speaking" ? "opacity-80 motion-safe:animate-glow" : "opacity-45",
        )}
      />

      {/* halo ring, broken at the top end, with a small lit orb resting in the gap */}
      {halo ? (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
          className={cx(
            "absolute inset-0 size-full overflow-visible rtl:-scale-x-100",
            state === "thinking" && "motion-safe:animate-spin motion-safe:[animation-duration:1.8s]",
            state === "working" && "motion-safe:animate-spin motion-safe:[animation-duration:6s]",
          )}
        >
          <defs>
            <linearGradient id={`${id}-halo`} x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--agent-c1)" stopOpacity={busy ? 0.15 : 0.35} />
              <stop offset="1" stopColor="var(--agent-c2)" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          {state === "working" ? (
            <circle cx="24" cy="24" r="22" stroke={`url(#${id}-halo)`} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1.2 5.3" />
          ) : (
            // A 300° arc from the top, clockwise, leaving a gap at the top end.
            <path d="M24 2A22 22 0 1 1 4.95 13" stroke={`url(#${id}-halo)`} strokeWidth="1.6" strokeLinecap="round" transform="rotate(75 24 24)" />
          )}
          {state === "working" ? null : (
            <g transform="rotate(75 24 24)">
              <circle cx="11.6" cy="5.9" r="3.4" fill="var(--agent-c2)" opacity=".35" />
              <circle cx="11.6" cy="5.9" r="2" fill="var(--agent-c2)" />
            </g>
          )}
        </svg>
      ) : null}

      {/* the orb */}
      <motion.span
        aria-hidden
        className={cx("relative overflow-hidden rounded-full", halo ? "size-[70%]" : "size-full")}
        style={{
          backgroundImage: "radial-gradient(circle at 35% 30%, var(--agent-c1), var(--agent-c2) 58%, var(--agent-c3))",
          boxShadow: "inset 0 -2px 6px color-mix(in oklab, var(--agent-c3) 70%, transparent), 0 1px 2px color-mix(in oklab, var(--agent-c3) 40%, transparent)",
        }}
        animate={state === "speaking" && !reduce ? { scale: [1, 1.07, 0.98, 1.04, 1] } : { scale: 1 }}
        transition={state === "speaking" && !reduce ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        {/* drifting colour field */}
        <span
          className={cx(
            "absolute -inset-1/4 rounded-full blur-[2px]",
            "bg-[conic-gradient(from_0deg,var(--agent-c1),var(--agent-c3),var(--agent-c2),var(--agent-c1))] opacity-70",
            moving && "motion-safe:animate-spin",
            SWIRL[state],
          )}
          style={{ maskImage: "radial-gradient(circle at 60% 65%, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at 60% 65%, black 20%, transparent 70%)" }}
        />
        {/* a second, counter-rotating wisp so the surface never looks mechanical */}
        <span
          className={cx(
            "absolute -inset-1/3 rounded-full blur-[3px] opacity-55",
            "bg-[conic-gradient(from_120deg,transparent,var(--agent-c1),transparent_40%,var(--agent-c3),transparent_75%)]",
            moving && "motion-safe:animate-spin motion-safe:[animation-direction:reverse]",
            SWIRL_BACK[state],
          )}
        />
        {/* gloss */}
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_24%,color-mix(in_oklab,var(--color-fg-on-accent)_80%,transparent)_0%,transparent_42%)]" />
      </motion.span>
    </span>
  );
}
