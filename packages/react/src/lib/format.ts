/** Number formatting helpers shared by stats and charts (locale-aware via Intl). */

export function formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions) {
  return createNumberFormatter(locale, options).format(value);
}

export function formatCompact(value: number, locale?: string) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, locale?: string, digits = 1) {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: digits }).format(value);
}

export function formatCurrency(value: number, currency = "USD", locale?: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0, ...options }).format(value);
}

/** Signed percentage change between two values, e.g. +12.4%. */
export function formatDelta(current: number, previous: number, locale?: string) {
  if (!previous) return "—";
  const delta = (current - previous) / Math.abs(previous);
  const text = formatPercent(Math.abs(delta), locale);
  return `${delta >= 0 ? "+" : "−"}${text}`;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Cached `Intl.NumberFormat` factory — use it in render loops (chart ticks, table cells).
 * Note: Node and browsers can disagree on a few compact/currency outputs; for server-rendered
 * text that must hydrate exactly, prefer plain (non-compact) formats or format on the client.
 */
export function createNumberFormatter(locale?: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale ?? ""}|${JSON.stringify(options ?? {})}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/** Replaces the narrow / thin no-break spaces some Intl implementations emit, so server and client text match. */
export function normalizeIntl(text: string): string {
  return text.replace(/[   ]/g, " ");
}
