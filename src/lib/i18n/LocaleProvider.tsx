"use client";

import { createContext, useContext } from "react";
import type { Locale, DictKey } from "./dictionaries";
import { t as translate } from "./dictionaries";

type LocaleContextValue = {
  locale: Locale;
  t: (key: DictKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider
      value={{ locale, t: (k) => translate(locale, k) }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Safe fallback in case a Client Component renders outside the provider.
    return { locale: "en", t: (k) => translate("en", k) };
  }
  return ctx;
}
