"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Freeze the page behind an overlay.
 *
 * `overflow: hidden` on `<body>` is not enough here: the site scrolls through
 * Lenis, which drives `window.scrollTo` from its own animation frame and keeps
 * moving the page regardless of the body's overflow. The page behind a
 * lightbox therefore stayed scrollable, and a wheel or swipe moved the
 * sections underneath the overlay. Stopping the Lenis instance is what
 * actually holds the page still; the overflow rule is kept so the native
 * scrollbar disappears too (and so this still behaves if Lenis is ever
 * removed).
 *
 * Restoring the previous value rather than clearing it means nested locks —
 * the mobile menu open behind an article dialog, say — unwind in the right
 * order instead of the inner one re-enabling scroll for the outer one.
 */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [locked, lenis]);
}
