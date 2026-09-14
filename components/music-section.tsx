"use client";

import { Reveal, RevealGroup } from "@/components/reveal";
import { Skeleton } from "@/components/skeleton";
import { SplitHeadline } from "@/components/split-headline";
import { useVenueMedia } from "@/lib/use-venue-media";
import { useI18n } from "@/lib/i18n/provider";

export function MusicSection() {
  const { t } = useI18n();
  const { video, videos, blogImages, isLoading } = useVenueMedia();
  const secondary = videos.find((v) => v.url !== video?.url) ?? null;
  const posterA = blogImages[0]?.url;
  const posterB = blogImages[1]?.url;

  return (
    <section id="music" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="font-label text-[11px] text-[var(--gold)]">{t.music.eyebrow}</p>
          <div className="mt-3">
            <SplitHeadline first={t.music.titleTop} second={t.music.titleBottom} />
          </div>
          <p className="mt-6 font-serif text-lg leading-8 text-white/80">{t.music.lead}</p>
        </Reveal>

        {isLoading && !video ? (
          <div className="mt-10">
            <Skeleton className="aspect-video w-full" />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            {video?.url ? (
              <Reveal className="glass-card overflow-hidden" y={48}>
                <video
                  className="aspect-video h-auto w-full object-cover"
                  src={video.url}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterA}
                  aria-label="X Pub venue atmosphere video"
                />
              </Reveal>
            ) : null}

            {secondary?.url ? (
              <Reveal delay={0.1} className="glass-card overflow-hidden" y={48}>
                <video
                  className="aspect-[3/4] h-full max-h-[420px] w-full object-cover lg:aspect-auto lg:min-h-full"
                  src={secondary.url}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterB}
                  aria-label="X Pub nightlife clip"
                />
              </Reveal>
            ) : null}
          </div>
        )}

        <RevealGroup
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          stagger={0.06}
        >
          {t.music.sets.map((set) => (
            <article key={set.day + set.title} className="glass-card px-5 py-6">
              <p className="font-display text-2xl tracking-[0.08em] text-[var(--gold)]">
                {set.day}
              </p>
              <h3 className="mt-3 font-body text-base font-medium text-white">{set.title}</h3>
              <p className="mt-2 font-label text-[10px] text-white/55">{set.time}</p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
