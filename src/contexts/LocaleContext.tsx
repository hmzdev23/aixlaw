"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { translations } from "@/lib/i18n/config";

type AnyTranslation = (typeof translations)[Locale];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: AnyTranslation;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1] as Locale | undefined;
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`;
    document.documentElement.lang = l;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
