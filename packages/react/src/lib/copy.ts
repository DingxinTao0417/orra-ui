"use client";

import { useLocale } from "react-aria-components";

/**
 * Built-in UI copy in English and Simplified Chinese. The language follows the
 * React Aria locale (an `I18nProvider` / `OrraProvider` above, or the browser),
 * and every component that renders copy also accepts a `labels` prop to
 * override individual strings.
 *
 *   const COPY = { en: { close: "Close" }, zh: { close: "关闭" } };
 *   const t = useCopy(COPY, props.labels);
 *   <button aria-label={t.close} />
 */
export type CopyDictionary<T extends Record<string, string>> = { en: T; zh: T };

export function useCopy<T extends Record<string, string>>(dict: CopyDictionary<T>, overrides?: Partial<T>): T {
  const { locale } = useLocale();
  const base = locale.toLowerCase().startsWith("zh") ? dict.zh : dict.en;
  return overrides ? { ...base, ...(overrides as T) } : base;
}

/** Interpolates {name} placeholders: fill("{n} 项", { n: 3 }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
