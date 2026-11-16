"use client";

import { useCallback, useRef, useState } from "react";

/** State that can be controlled (value + onChange) or uncontrolled (defaultValue). */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      if (!controlled) setInner(resolved);
      onChangeRef.current?.(resolved);
    },
    [controlled, current],
  );
  return [current, set] as const;
}
