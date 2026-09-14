"use client";

import Image from "next/image";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SplitHeadline } from "@/components/split-headline";
import { useI18n } from "@/lib/i18n/provider";
import { useVenueMedia } from "@/lib/use-venue-media";

export function BlogSection() {
  const { t } = useI18n();
  const { blogImages } = useVenueMedia();

  return (
    <section id="blog" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <p className="font-label text-[11px] text-[var(--gold)]">{t.blog.eyebrow}</p>
          <div className="mt-3">
            <SplitHeadline first={t.blog.titleTop} second={t.blog.titleBottom} />
          </div>
        </Reveal>

        <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.1}>
          {t.blog.posts.map((post, index) => {
            const cover = blogImages[index] ?? null;
            return (
              <article key={post.title} className="glass-card group overflow-hidden">
                {cover?.url ? (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={cover.url}
                      alt={post.title}
                      fill
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="font-label text-[10px] text-[var(--gold)]">{post.tag}</p>
                  <h3 className="mt-3 font-display text-2xl tracking-[0.06em] text-white">
                    {post.title}
                  </h3>
                  <p className="mt-3 font-serif text-base leading-7 text-white/70">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
