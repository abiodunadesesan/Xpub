"use client";

import Image from "next/image";
import Link from "next/link";
import { SeeYouSoon } from "@/components/see-you-soon";
import {
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/social-icons";
import { useI18n } from "@/lib/i18n/provider";
import { BUSINESS, PHONE_HREF, WHATSAPP_HREF } from "@/lib/site";

/**
 * The end of the page.
 *
 * It reads as three answers in order: who this is (name, city, address,
 * hours), where to go next (the section anchors), and how to reach the venue
 * (the profiles). The sign-off stays the centrepiece above them, and the legal
 * line moves to a separate bar at the very bottom — it is the one item here
 * nobody is looking for, so it doesn't belong in the middle of the list.
 */
export function SiteFooter() {
  const { t } = useI18n();

  const explore = [
    { href: "#about", label: t.nav.about },
    { href: "#menu", label: t.nav.menu },
    { href: "#music", label: t.nav.music },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#visit", label: t.nav.visit },
  ];

  // The number is an icon here too, never printed. Its accessible name still
  // carries the digits, exactly as the visit panel's does.
  const follow = [
    {
      href: "https://www.instagram.com/xpubgirne/",
      label: t.footer.instagram,
      Icon: InstagramIcon,
    },
    {
      href: "https://www.facebook.com/xpubgirne",
      label: t.footer.facebook,
      Icon: FacebookIcon,
    },
    { href: WHATSAPP_HREF, label: t.footer.whatsapp, Icon: WhatsAppIcon },
    {
      href: PHONE_HREF,
      label: `${t.ui.call} — ${BUSINESS.telephone}`,
      Icon: PhoneIcon,
    },
  ];

  return (
    // `pb-24` rather than a tight bottom: the floating controls sit in the two
    // bottom corners of this page, 68px tall including their offset, and the
    // bottom bar would otherwise run underneath them.
    <footer className="relative z-10 overflow-hidden bg-black pt-16 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] top-8 h-px origin-left scale-x-110 bg-[var(--yellow)]/50"
        style={{ transform: "rotate(-4deg)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* The sign-off, with the venue's own line under it. */}
        <div className="flex flex-col items-center text-center">
          <SeeYouSoon />
          <p className="mt-5 font-serif text-lg italic text-white/70">{t.brand.tagline}</p>
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-8">
          <div>
            {/* The mark, not the name set in type. The header and the hero
                already lead with it, and a footer that spells the same name in
                a third style reads as a different brand. */}
            <Image
              src="/brand/logo.webp"
              alt={`${t.brand.name} ${t.brand.city}`}
              width={660}
              height={620}
              className="brand-emblem h-20 w-auto"
            />
            <p className="mt-4 font-label text-[10px] uppercase tracking-[0.3em] text-white/60">
              {t.footer.nightlife}
            </p>
            <address className="mt-6 font-serif text-base leading-7 text-white/75 not-italic">
              {t.visit.address[0]}
              <br />
              {t.visit.address[1]}
            </address>
            <p className="mt-3 font-body text-xs text-white/55">{t.visit.hours}</p>
          </div>

          {/* Section links. `aria-labelledby` rather than a bare list, so the
              heading is a real name for the list and not just a label above it. */}
          <nav aria-labelledby="footer-explore">
            <h2
              id="footer-explore"
              className="font-label text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              {t.footer.explore}
            </h2>
            <ul className="mt-6 space-y-3">
              {explore.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    data-cursor
                    className="inline-flex items-center gap-2.5 font-body text-sm text-white/75 transition hover:text-[var(--yellow)]"
                  >
                    <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--yellow)]/60" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
              {t.footer.follow}
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {follow.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    aria-label={label}
                    title={label}
                    className="glass-panel inline-flex h-11 w-11 items-center justify-center text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The quiet bar: nothing here is a destination. */}
        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row">
          <p className="font-body text-xs text-white/45">
            © {new Date().getFullYear()} {t.brand.name} Girne
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-xs text-white/60">
            <Link href="/legal" data-cursor className="transition hover:text-[var(--yellow)]">
              {t.footer.legal}
            </Link>
            <a href="#visit" data-cursor className="transition hover:text-[var(--yellow)]">
              {t.footer.visit}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
