"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

const HINT = ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"] as const;

export function KonamiEgg() {
  const indexRef = useRef(0);
  const [mode, setMode] = useState(false);
  const [intro, setIntro] = useState(false);
  const [flash, setFlash] = useState(false);
  const [progress, setProgress] = useState(0);

  const activate = () => {
    setFlash(true);
    setIntro(true);
    setMode(true);
    document.body.classList.add("konami-active");
    window.setTimeout(() => setFlash(false), 900);
  };

  const deactivate = () => {
    setIntro(false);
    setMode(false);
    setProgress(0);
    indexRef.current = 0;
    document.body.classList.remove("konami-active");
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mode) {
        deactivate();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (mode) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = SEQUENCE[indexRef.current];

      if (key === expected) {
        const next = indexRef.current + 1;
        indexRef.current = next;
        setProgress(next);
        if (next === SEQUENCE.length) {
          indexRef.current = 0;
          activate();
        }
      } else {
        indexRef.current = key === SEQUENCE[0] ? 1 : 0;
        setProgress(indexRef.current);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("konami-active");
    };
  }, [mode]);

  return (
    <>
      {!mode && (
        <div
          aria-hidden
          className="pointer-events-none fixed bottom-20 left-1/2 z-[80] hidden -translate-x-1/2 gap-1.5 md:flex"
        >
          {HINT.map((icon, i) => (
            <span
              key={`${icon}-${i}`}
              className={`konami-chip inline-flex h-7 min-w-7 items-center justify-center rounded-sm border px-1.5 font-display text-[10px] transition ${
                i < progress
                  ? "border-[var(--pi-yellow)] bg-[var(--pi-yellow)] text-black shadow-[0_0_12px_rgba(250,233,0,0.55)]"
                  : "border-white/15 bg-black/50 text-white/35"
              }`}
            >
              {icon}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[130] bg-[var(--pi-yellow)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, times: [0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {intro && (
          <motion.div
            className="konami-overlay fixed inset-0 z-[125] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="konami-scanlines pointer-events-none absolute inset-0" />
            <motion.div
              className="relative z-10 max-w-xl border-2 border-[var(--pi-yellow)] bg-black/90 px-6 py-8 text-center shadow-[0_0_40px_rgba(250,233,0,0.35)]"
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <p className="font-body text-xs uppercase tracking-[0.35em] text-white/55">
                Cheat code accepted
              </p>
              <h2 className="neon-glow mt-3 font-display text-[clamp(2rem,8vw,3.6rem)] leading-none text-[var(--pi-yellow)]">
                XPUB MODE
              </h2>
              <p className="mt-4 font-body text-sm leading-6 text-white/80">
                Full-screen arcade takeover: CRT scanlines, neon bleed, and a
                night-vision palette across the whole site.
              </p>
              <button
                type="button"
                data-cursor
                onClick={() => setIntro(false)}
                className="pi-btn neon-border mt-7 inline-flex"
              >
                Enter the floor
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode && !intro && (
        <button
          type="button"
          data-cursor
          onClick={deactivate}
          className="fixed bottom-4 right-4 z-[80] border border-[var(--pi-yellow)] bg-black/80 px-3 py-2 font-display text-xs text-[var(--pi-yellow)] shadow-[0_0_18px_rgba(250,233,0,0.35)]"
        >
          Arcade ON · Esc
        </button>
      )}
    </>
  );
}
