"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { socialIconMap } from "@/components/social-icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { socials } from "@/lib/socials";
import { useI18n } from "@/lib/i18n/provider";
import { useScrollLock } from "@/lib/scroll-lock";

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#experience", label: t.nav.experience },
    { href: "#menu", label: t.nav.menu },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#music", label: t.nav.music },
    { href: "#blog", label: t.nav.blog },
    { href: "#visit", label: t.nav.visit },
  ];

  // The menu covers the page, so the page behind it must not scroll — and
  // on mobile that means stopping Lenis, not just hiding the body overflow.
  useScrollLock(open);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className="site-header-bar relative">
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          {/* The venue's mark, at every width. It replaced a text "XPUB" that
              only rendered on small screens, so desktop had no brand at all. */}
          <a
            href="#top"
            data-cursor
            aria-label={`${t.brand.name} ${t.brand.city} — ${t.brand.tagline}`}
            className="shrink-0"
          >
            <Image
              src="/brand/logo.webp"
              alt={`${t.brand.name} ${t.brand.city}`}
              width={660}
              height={620}
              priority
              className="brand-emblem h-11 w-auto sm:h-12 lg:h-10"
            />
          </a>

          <nav className="hidden min-w-0 flex-1 items-center gap-4 xl:flex xl:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor
                className="font-display text-[14px] tracking-wide text-white transition hover:text-[var(--gold)] xl:text-[15px]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <nav className="hidden items-center gap-3 lg:flex xl:hidden">
            {navLinks.slice(0, 5).map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor
                className="font-display text-[13px] tracking-wide text-white transition hover:text-[var(--gold)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ul className="hidden items-center gap-3 sm:flex">
              {socials.map((social) => {
                const Icon = socialIconMap[social.icon];
                return (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      data-cursor
                      className="inline-flex h-8 w-8 items-center justify-center text-white transition hover:text-[var(--gold)]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-white lg:hidden"
              aria-label={open ? t.ui.closeMenu : t.ui.openMenu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-[var(--yellow)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
