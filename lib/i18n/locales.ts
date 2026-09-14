export const LOCALES = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "tr", label: "Turkish", native: "Türkçe", dir: "ltr" },
  { code: "ru", label: "Russian", native: "Русский", dir: "ltr" },
  { code: "de", label: "German", native: "Deutsch", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "it", label: "Italian", native: "Italiano", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "el", label: "Greek", native: "Ελληνικά", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" },
  { code: "pl", label: "Polish", native: "Polski", dir: "ltr" },
  { code: "uk", label: "Ukrainian", native: "Українська", dir: "ltr" },
  { code: "nl", label: "Dutch", native: "Nederlands", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", dir: "ltr" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "xpub-locale";
