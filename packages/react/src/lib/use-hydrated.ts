"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server render and hydration, true afterwards. Use it to render
 * values that differ between Node and the browser (time zones, some Intl output,
 * platform-specific shortcuts) only on the client, without hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
