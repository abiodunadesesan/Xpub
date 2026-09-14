"use client";

import Link from "next/link";
import { SeeYouSoon } from "@/components/see-you-soon";
import { useI18n } from "@/lib/i18n/provider";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative z-10 overflow-hidden bg-black pt-6 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] top-8 h-px origin-left scale-x-110 bg-[var(--pi-yellow)]/50"
        style={{ transform: "rotate(-4deg)" }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
        <SeeYouSoon />

        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-3xl text-[var(--pi-yellow)] sm:text-4xl">
            {t.brand.name}
          </p>
          <p className="font-body text-xs uppercase tracking-[0.25em] text-white/60">
            {t.footer.nightlife}
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-sm text-white/70">
          <Link href="/legal" className="hover:text-[var(--pi-yellow)]">
            {t.footer.legal}
          </Link>
          <a href="#visit" className="hover:text-[var(--pi-yellow)]">
            {t.footer.visit}
          </a>
          <a
            href="https://www.instagram.com/xpubgirne/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--pi-yellow)]"
          >
            {t.footer.instagram}
          </a>
        </nav>
        <p className="font-body text-xs text-white/45">
          © {new Date().getFullYear()} {t.brand.name} Girne
        </p>
      </div>
    </footer>
  );
}
