"use client";

import { useEffect, useState } from "react";

/**
 * The current time, or null during server render / hydration. Re-reads every
 * `intervalMs` (default: never). Use for "today" highlights and relative times
 * so server and client markup always match.
 */
export function useNow(intervalMs?: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    if (!intervalMs) return;
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
