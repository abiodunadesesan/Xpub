"use client";

import { useEffect, useRef, useState } from "react";

const LINE = "SEE YOU SOON";

export function SeeYouSoon() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

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
  }, []);

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
