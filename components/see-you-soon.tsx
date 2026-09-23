"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const LINE = "SEE YOU SOON";

/** The letters light up under a real pointer — not under a finger. */
const FINE_POINTER = "(pointer: fine)";

const subscribeToPointer = (onChange: () => void) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches;
const noPointerOnTheServer = () => false;

export function SeeYouSoon() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  // A subscription, not an effect that sets state: the answer is the device's,
  // and it can change mid-session (a tablet gaining a mouse), so the letters
  // should follow it rather than latch on first paint.
  const enabled = useSyncExternalStore(
    subscribeToPointer,
    hasFinePointer,
    noPointerOnTheServer,
  );

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      refs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const hot = dist < 56;
        el.classList.toggle("is-lit", hot);
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  return (
    <p
      aria-hidden={!enabled}
      className="see-you-soon select-none font-display text-[clamp(2.8rem,11vw,7rem)] leading-[0.9] tracking-wide"
    >
      {LINE.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          ref={(node) => {
            refs.current[i] = node;
          }}
          className={`see-you-letter inline-block ${char === " " ? "w-[0.35em]" : ""}`}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}
