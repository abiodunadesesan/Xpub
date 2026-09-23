"use client";

import { useEffect, useRef } from "react";

/**
 * A muted looping clip that only plays while it is on screen, and only loads
 * once it is near the viewport.
 *
 * The gallery puts eight clips in one grid and the browser happily starts all
 * eight: eight media elements decoding at once, on a phone, for tiles that are
 * mostly below the fold. Every one of them competes with the hero for the
 * connection at exactly the moment the visitor is waiting for first paint.
 *
 * So a clip waits for an intersection — with a 200px margin, so it is already
 * moving by the time it is actually visible — and pauses when it leaves. The
 * element is created with `preload="none"`, which is what stops the fetch: an
 * `<video>` with a `src` and no preload hint is otherwise free to pull the
 * whole file down on page load.
 *
 * The trade is that a clip with JS disabled stays on its poster. That is the
 * same bargain the rest of this site already makes (`Reveal` renders plain
 * until it mounts), and the poster is a real frame of the venue rather than a
 * blank tile.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  /** Accessible name — these clips carry meaning, not decoration. */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // A browser without IntersectionObserver just gets the eager behaviour.
    if (typeof IntersectionObserver === "undefined") {
      void node.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Autoplay is allowed for muted inline media; a rejection here is a
          // policy decision, not an error worth surfacing.
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      // Remounts when the source changes, so a swapped clip starts on its own
      // first frame instead of holding the previous one.
      key={src}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
