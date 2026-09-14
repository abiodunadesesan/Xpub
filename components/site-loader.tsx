"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { HeroSkeleton } from "@/components/skeleton";
import { useVenueMedia } from "@/lib/use-venue-media";

/** Skeleton shell while first paint / Convex media hydrate — replaces arcade intro. */
export function SiteLoader() {
  const reduce = useReducedMotion();
  const { isLoading, heroImage } = useVenueMedia();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinTimeDone(true), reduce ? 120 : 480);
    document.body.classList.add("is-loading");
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("is-loading");
    };
  }, [reduce]);

  useEffect(() => {
    const mediaReady = !isLoading || Boolean(heroImage);
    if (minTimeDone && mediaReady) {
      const t = window.setTimeout(() => setDone(true), 80);
      return () => window.clearTimeout(t);
    }
  }, [minTimeDone, isLoading, heroImage]);

  // Failsafe: never block the page if media hangs
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done) document.body.classList.remove("is-loading");
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-auto bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <div className="hidden gap-4 lg:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-14 animate-pulse bg-white/10" />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="h-8 w-20 animate-pulse bg-white/10" />
              <div className="hidden h-6 w-6 animate-pulse rounded-full bg-white/10 sm:block" />
              <div className="hidden h-6 w-6 animate-pulse rounded-full bg-white/10 sm:block" />
            </div>
          </div>
          <HeroSkeleton />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
