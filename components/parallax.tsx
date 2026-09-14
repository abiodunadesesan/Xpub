"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

type ParallaxProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
};

/** Lightweight parallax layer driven by Lenis scroll. */
export function Parallax({ children, speed = 0.15, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || !ref.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const el = ref.current;
    const onScroll = ({ scroll }: { scroll: number }) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${center * -speed * 0.08}px, 0)`;
    };

    lenis.on("scroll", onScroll);
    onScroll({ scroll: lenis.scroll });
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis, speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className ?? ""}`}>
      {children}
    </div>
  );
}
