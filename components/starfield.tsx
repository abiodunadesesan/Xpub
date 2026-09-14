"use client";

import { useMemo } from "react";

export function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: i % 5 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
        color: i % 3 === 0 ? "var(--pi-yellow)" : "rgba(255,255,255,0.55)",
        delay: `${(i % 7) * 0.35}s`,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="star-dot absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: star.color,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
