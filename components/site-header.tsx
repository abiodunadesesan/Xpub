"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FacebookIcon, InstagramIcon, PhoneIcon } from "@/components/social-icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { socials } from "@/lib/content";
import { useI18n } from "@/lib/i18n/provider";

const iconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  phone: PhoneIcon,
  mail: PhoneIcon,
};

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className="site-header-bar relative">
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
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

          <a
            href="#top"
            className="font-display text-lg tracking-wide text-[var(--gold)] lg:hidden"
          >
            {t.brand.short}
          </a>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ul className="hidden items-center gap-3 sm:flex">
              {socials.map((social) => {
                const Icon = iconMap[social.icon];
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
                className="font-display text-2xl text-[var(--pi-yellow)]"
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
