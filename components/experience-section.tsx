"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n/provider";
import { useVenueMedia } from "@/lib/venue-media";

export function ExperienceSection() {
  const { t } = useI18n();
  const { experiencePacks } = useVenueMedia();
  const [active, setActive] = useState(0);
  const item = t.experiences.items[active] ?? t.experiences.items[0];
  const pack = experiencePacks[active] ?? experiencePacks[0];
  const cover = pack?.cover;
  const bulletImages = pack?.bullets ?? [];

  return (
    <section id="experience" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t.experiences.eyebrow}
            titleTop={t.experiences.titleTop}
            titleBottom={t.experiences.titleBottom}
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-10 flex flex-wrap gap-2 sm:gap-3">
          {t.experiences.items.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              data-cursor
              onClick={() => setActive(index)}
              className={`rounded-full px-4 py-2 font-label text-[11px] transition ${
                active === index
                  ? "bg-[var(--gold)] text-black shadow-[0_8px_24px_rgba(184,142,93,0.35)]"
                  : "glass-panel text-white/85 hover:border-[var(--gold)]/50"
              }`}
            >
              {entry.title}
            </button>
          ))}
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimatePresence mode="wait">
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card overflow-hidden"
            >
              {cover?.url ? (
                <div className="relative h-52 overflow-hidden sm:h-72">
                  <Image
                    src={cover.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                </div>
              ) : null}
              <div className="p-6 sm:p-8">
                <p className="font-display text-3xl text-[var(--gold)]">{item.icon}</p>
                <p className="mt-4 font-label text-[10px] text-white/55">{item.time}</p>
                <h3 className="mt-2 font-display text-3xl tracking-[0.08em] text-white sm:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-5 font-serif text-lg leading-8 text-white/80">{item.body}</p>
              </div>
            </motion.article>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.ul
              key={`${item.id}-list`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {item.bullets.map((bullet, index) => {
                const thumb = bulletImages[index];
                return (
                  <li
                    key={bullet}
                    className="glass-card group relative min-h-[9.5rem] overflow-hidden"
                  >
                    {thumb?.url ? (
                      <>
                        <Image
                          src={thumb.url}
                          alt={bullet}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 22vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
                      </>
                    ) : null}
                    <div className="relative z-10 flex h-full flex-col justify-end p-4">
                      <span className="text-[var(--gold)]">✦</span>
                      <p className="mt-2 font-body text-sm font-medium text-white">{bullet}</p>
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
