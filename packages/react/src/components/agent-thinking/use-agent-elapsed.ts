"use client";

import { useEffect, useRef, useState } from "react";
import { fill } from "../../lib/copy";

/**
 * Whole seconds elapsed while `active` is true. Starts at 0 on the server and
 * on first render, then ticks once a second on the client only, so it never
 * causes a hydration mismatch. When `active` turns false the value freezes.
 *
 *   const seconds = useAgentElapsed(isThinking);
 */
export function useAgentElapsed(active: boolean, startedAt?: number): number {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = startedAt ?? startRef.current ?? Date.now();
    startRef.current = start;
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [active, startedAt]);

  return seconds;
}

/** "8s" / "1m 05s" style duration, using `{s}` and `{m}` templates from a component's copy. */
export function formatAgentDuration(seconds: number, templates: { seconds: string; minutes: string }): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return fill(templates.seconds, { s });
  const m = Math.floor(s / 60);
  return fill(templates.minutes, { m, s: String(s % 60).padStart(2, "0") });
}
