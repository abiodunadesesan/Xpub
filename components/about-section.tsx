"use client";

import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { Skeleton } from "@/components/skeleton";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n/provider";
import { useVenueMedia } from "@/lib/venue-media";

export function AboutSection() {
  const { t } = useI18n();
  const { aboutImage, isLoading } = useVenueMedia();
  const sideImage = aboutImage?.url;

  return (
    <section id="about" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-y-[8%] right-[-8%] w-[52%] bg-[#111] skew-wide opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-white/50"
        style={{ transform: "rotate(-4deg) scaleX(1.2)" }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:px-8">
        <Reveal className="max-w-2xl">
          <SectionHeading
            eyebrow={t.about.eyebrow}
            titleTop={t.about.titleTop}
            titleBottom={t.about.titleBottom}
          />
          <div className="mt-8 space-y-4 font-serif text-lg leading-8 text-white/85">
            {t.about.paragraphs.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
          <p className="mt-8 font-display text-lg tracking-[0.08em] text-[var(--gold)]">
            {t.about.rating}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="relative" x={32}>
          <div className="glass-card about-media overflow-hidden p-1.5">
            {isLoading && !sideImage ? (
              <Skeleton className="aspect-[4/5] w-full" />
            ) : sideImage ? (
              <Image
                src={sideImage}
                alt={`${t.brand.name} ${t.brand.city} — ${t.nav.about}`}
                width={800}
                height={900}
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <Skeleton className="aspect-[4/5] w-full" />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
