"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { LocaleCode } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const { locale, setLocale, locales, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const current = locales.find((item) => item.code === locale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        data-cursor
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.ui.language}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-1.5 border border-white/25 bg-black/70 px-3 font-body text-[11px] uppercase tracking-[0.14em] text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
      >
        <span aria-hidden>{locale.toUpperCase()}</span>
        <span className="hidden max-w-[4.5rem] truncate sm:inline">{current?.native}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.ui.language}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[90] max-h-72 w-48 overflow-auto border border-white/15 bg-black/95 py-2 shadow-xl"
        >
          {locales.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                data-cursor
                role="option"
                aria-selected={item.code === locale}
                onClick={() => {
                  setLocale(item.code as LocaleCode);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left font-body text-sm transition ${
                  item.code === locale
                    ? "bg-[var(--yellow)] text-black"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span>{item.native}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {item.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
