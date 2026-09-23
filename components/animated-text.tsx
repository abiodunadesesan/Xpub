"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMounted } from "@/lib/use-mounted";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Word-by-word rise for display type.
 *
 * The heading copy is the one thing on this site a visitor actually reads, and
 * it was the only thing that didn't move — every block around it faded and
 * blurred in while the words themselves appeared all at once. Each word now
 * rises out of its own clipped line, staggered, so the eye is led across the
 * headline instead of arriving at a finished sentence.
 *
 * Two details are load-bearing:
 *
 *   • `pb`/`-mb` in `em` on the clipping wrapper. `overflow: hidden` clips the
 *     line box, and a descender (the `g` in "Gallery") would otherwise be cut
 *     off. The padding buys the space and the negative margin gives it back,
 *     so the layout is unchanged.
 *   • a non-breaking space *outside* the clip, between words. Splitting on
 *     spaces and losing the separator silently welds "LiveMusic" together.
 *
 * Renders as plain text until it has mounted, the same guard `Reveal` uses:
 * Motion's `initial` styling has no server equivalent, so animating on the
 * first render is a hydration mismatch.
 */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
  /** Play on load rather than on scroll — for copy already above the fold. */
  mount = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  mount?: boolean;
}) {
  const reduce = useReducedMotion();
  const ready = useMounted();

  const words = text.split(" ").filter(Boolean);
  if (!ready || reduce || words.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...(mount ? { animate: "show" } : { whileInView: "show" })}
      viewport={mount ? undefined : { once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
            <motion.span
              className={`inline-block ${wordClassName ?? ""}`}
              variants={{
                hidden: { y: "115%" },
                show: { y: 0, transition: { duration: 0.72, ease: EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </motion.span>
  );
}

/**
 * The small uppercase eyebrow above a heading, tracked open as it arrives.
 *
 * `font-label` already sets `letter-spacing: 0.22em`, so the animation runs
 * from wider and settles on the real value — the label reads as if it is
 * focusing, rather than sliding in from the side like the rest of the page.
 */
export function TrackingIn({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ready = useMounted();

  if (!ready || reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, letterSpacing: "0.5em" }}
      whileInView={{ opacity: 1, letterSpacing: "0.22em" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {text}
    </motion.span>
  );
}
