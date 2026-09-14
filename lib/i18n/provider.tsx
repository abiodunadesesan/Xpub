"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries } from "./dictionaries";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  type LocaleCode,
} from "./locales";
import type { Dictionary } from "./types";

type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: Dictionary;
  locales: typeof LOCALES;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string): value is LocaleCode {
  return LOCALES.some((locale) => locale.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && isLocale(saved)) {
      setLocaleState(saved);
      return;
    }
    const browser = navigator.language.slice(0, 2).toLowerCase();
    if (isLocale(browser)) setLocaleState(browser);
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    const meta = LOCALES.find((item) => item.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta?.dir ?? "ltr";
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale] ?? dictionaries.en,
      locales: LOCALES,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
