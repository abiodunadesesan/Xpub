"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SplitHeadline } from "@/components/split-headline";
import { useI18n } from "@/lib/i18n/provider";
import { useVenueMedia } from "@/lib/use-venue-media";

type TabId = "cocktails" | "beer" | "nights";

export function MenuSection() {
  const { t } = useI18n();
  const { menuImages, menuVideos } = useVenueMedia();
  const [tab, setTab] = useState<TabId>("cocktails");
  const items = t.menu.categories[tab];
  const tabIndex = Math.max(0, t.menu.tabs.findIndex((entry) => entry.id === tab));
  const cover = menuImages[tabIndex] ?? menuImages[0];
  const sideStills = menuImages.filter((_, i) => i !== tabIndex).slice(0, 3);
  const pourVideo = menuVideos[0];

  return (
    <section id="menu" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel relative overflow-hidden px-5 py-10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-[var(--gold)]/10 blur-3xl" />

          <Reveal>
            <p className="font-label text-[11px] text-[var(--gold)]">{t.menu.eyebrow}</p>
            <div className="mt-3">
              <SplitHeadline first={t.menu.titleTop} second={t.menu.titleBottom || t.nav.menu} />
            </div>
          </Reveal>

          {/* Compact media strip — avoids a tall left column leaving empty right space */}
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pourVideo?.url ? (
              <div className="glass-card relative col-span-2 aspect-[16/10] overflow-hidden sm:col-span-2">
                <video
                  className="h-full w-full object-cover"
                  src={pourVideo.url}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  poster={cover?.url}
                  aria-label="X Pub drinks pour"
                />
              </div>
            ) : cover?.url ? (
              <div className="glass-card relative col-span-2 aspect-[16/10] overflow-hidden">
                <Image
                  src={cover.url}
                  alt="X Pub drinks"
                  fill
                  loading="lazy"
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : null}

            {sideStills.map((still) => (
              <div key={still._id} className="glass-card relative aspect-square overflow-hidden">
                <Image
                  src={still.url}
                  alt="X Pub drink"
                  fill
                  loading="lazy"
                  unoptimized
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            ))}
          </div>

          <Reveal delay={0.06} className="mt-8 flex flex-wrap gap-2">
            {t.menu.tabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                data-cursor
                onClick={() => setTab(entry.id)}
                className={`px-4 py-2.5 font-label text-[11px] transition ${
                  tab === entry.id
                    ? "bg-[var(--gold)] text-black"
                    : "glass-panel text-white hover:border-[var(--gold)]/60"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.04}>
                {items.map((item) => (
                  <article key={item.name} className="glass-card px-4 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-lg tracking-[0.06em] text-white">
                        {item.name}
                      </h3>
                      <span className="shrink-0 font-label text-[10px] text-[var(--gold)]">
                        {item.price}
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-base leading-7 text-white/70">
                      {item.detail}
                    </p>
                  </article>
                ))}
              </RevealGroup>
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 font-serif text-base italic text-white/60">{t.menu.note}</p>
        </div>
      </div>
    </section>
  );
}
