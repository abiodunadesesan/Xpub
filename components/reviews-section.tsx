"use client";

import { Reveal, RevealGroup } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n/provider";

export function ReviewsSection() {
  const { t } = useI18n();

  return (
    <section id="reviews" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <SectionHeading
            eyebrow={t.reviews.eyebrow}
            titleTop={t.reviews.titleTop}
            titleBottom={t.reviews.titleBottom}
          />
          <p className="mt-4 font-serif text-base text-white/60">{t.reviews.summary}</p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2" stagger={0.1}>
          {t.reviews.items.map((review) => (
            <blockquote key={review.name} className="glass-card p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <cite className="font-label text-[11px] not-italic tracking-[0.14em] text-white">
                  {review.name}
                </cite>
                <span className="font-display text-xl tracking-[0.08em] text-[var(--gold)]">
                  {review.rating}
                </span>
              </div>
              <p className="mt-5 font-serif text-lg leading-8 text-white/85">
                “{review.text}”
              </p>
              <p className="mt-5 font-label text-[10px] text-white/45">{review.scores}</p>
            </blockquote>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
