"use client";

import type { ReactNode } from "react";
import { I18nProvider, useLocale } from "react-aria-components";

export interface OrraProviderProps {
  /** BCP 47 locale, e.g. "zh-CN", "en-US", "ar". Drives built-in copy (zh / en), date & number formats, and text direction. */
  locale?: string;
  children: ReactNode;
}

/**
 * Optional root provider. Sets the locale for React Aria behaviour, Orra's
 * built-in copy and number/date formatting, and the matching `dir` for RTL
 * languages. Without it, the browser locale is used.
 */
export function OrraProvider({ locale, children }: OrraProviderProps) {
  if (!locale) return <>{children}</>;
  return (
    <I18nProvider locale={locale}>
      <DirectionRoot>{children}</DirectionRoot>
    </I18nProvider>
  );
}

function DirectionRoot({ children }: { children: ReactNode }) {
  const { locale, direction } = useLocale();
  return (
    <div lang={locale} dir={direction} className="contents">
      {children}
    </div>
  );
}

/** Current locale and direction ("ltr" | "rtl"). */
export function useOrraLocale() {
  return useLocale();
}
