"use client";

import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { WhatsAppIcon } from "@/components/social-icons";
import { useI18n } from "@/lib/i18n/provider";
import { WHATSAPP_HREF } from "@/lib/site";

/**
 * The two controls that stay on screen wherever the visitor has scrolled to.
 *
 * They are one component rather than two because they are a pair in the
 * layout: on a phone the back-to-top button owns the bottom-left corner and
 * WhatsApp owns the bottom-right, and neither should be able to drift into the
 * other's footprint. Both use logical `start`/`end` rather than `left`/`right`,
 * so in the Arabic locale — the one RTL locale — they mirror the way the rest
 * of the page does instead of stacking on top of each other.
 *
 * They sit at `z-[85]`: above the page, below `SiteLoader` at `z-[90]`, so the
 * first paint isn't interrupted by controls fading in under the skeleton.
 */

/** How far down the page has to be before offering a way back. */
const TOP_BUTTON_AFTER_PX = 600;

export function FloatingActions() {
  const { t } = useI18n();
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [pastFold, setPastFold] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastFold(window.scrollY > TOP_BUTTON_AFTER_PX);
    onScroll();
    // Passive: this only reads the position, and it must never delay a scroll.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const backToTop = () => {
    // Lenis drives the scroll position from its own animation frame, so a
    // plain `window.scrollTo` would be overwritten on its next tick. Its
    // instance is only absent when smooth scrolling never mounted, which is
    // the one case the native call is still needed for.
    if (lenis) {
      lenis.scrollTo(0, { duration: reduce ? 0 : 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <button
        type="button"
        data-cursor
        data-testid="back-to-top"
        onClick={backToTop}
        aria-label={t.ui.backToTop}
        title={t.ui.backToTop}
        className={`fixed bottom-5 start-5 z-[85] inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a1a] text-white shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition duration-300 hover:border-[var(--gold)]/70 hover:text-[var(--gold)] ${
          pastFold ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor
        data-testid="whatsapp-cta"
        aria-label={t.ui.whatsapp}
        title={t.ui.whatsapp}
        className="fixed bottom-5 end-5 z-[85] inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#25d366] text-black shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:brightness-110"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
    </>
  );
}
