"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useScrollLock } from "@/lib/scroll-lock";

export type LightboxItem = {
  src: string;
  alt: string;
  kind: "image" | "video";
};

type MediaLightboxProps = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function MediaLightbox({
  items,
  index,
  onClose,
  onChange,
}: MediaLightboxProps) {
  const open = index !== null && items[index];
  const item = open ? items[index] : null;

  // Holds the page still behind the overlay — including Lenis, which would
  // otherwise keep scrolling it under the photo.
  useScrollLock(Boolean(item));

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % items.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onChange, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center overscroll-contain bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
        >
          <button
            type="button"
            data-cursor
            aria-label="Close"
            onClick={onClose}
            className="glass-btn absolute right-4 top-24 z-10 inline-flex h-11 w-11 items-center justify-center sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            className="relative max-h-[88svh] w-full max-w-5xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.kind === "video" ? (
              <video
                className="max-h-[88svh] w-full rounded-sm object-contain"
                src={item.src}
                controls
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                width={1600}
                height={1200}
                sizes="100vw"
                className="max-h-[88svh] w-full rounded-sm object-contain"
              />
            )}
          </motion.div>

          {items.length > 1 ? (
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
              <button
                type="button"
                data-cursor
                className="glass-btn-outline px-4 py-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((index! - 1 + items.length) % items.length);
                }}
              >
                Prev
              </button>
              <button
                type="button"
                data-cursor
                className="glass-btn-outline px-4 py-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((index! + 1) % items.length);
                }}
              >
                Next
              </button>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
