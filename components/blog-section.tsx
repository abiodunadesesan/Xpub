"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n/provider";
import { useVenueMedia } from "@/lib/venue-media";

type Post = ReturnType<typeof useI18n>["t"]["blog"]["posts"][number];

/**
 * Full story for a card, in a dialog. Cards show an excerpt, so the reader
 * needs somewhere for the rest of the piece to live — clicking a card is the
 * whole interaction, no routing involved.
 */
function ArticleDialog({
  post,
  cover,
  onClose,
  closeLabel,
}: {
  post: Post;
  cover: string | null;
  onClose: () => void;
  closeLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] overflow-y-auto bg-black/90 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-article-title"
        className="glass-card relative mx-auto my-8 max-w-2xl overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          data-cursor
          onClick={onClose}
          aria-label={closeLabel}
          className="glass-btn absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        {cover ? (
          <div className="relative h-48 overflow-hidden sm:h-60">
            <Image
              src={cover}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 42rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        ) : null}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-label text-[10px] text-[var(--gold)]">{post.tag}</p>
            <p className="font-label text-[10px] text-white/45">{post.readTime}</p>
          </div>
          <h3
            id="blog-article-title"
            className="mt-4 font-display text-3xl leading-tight tracking-[0.06em] text-white sm:text-4xl"
          >
            {post.title}
          </h3>

          <div className="mt-6 space-y-4 font-serif text-lg leading-8 text-white/85">
            {post.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <button
            type="button"
            data-cursor
            onClick={onClose}
            className="glass-btn mt-8 inline-flex min-h-11 items-center px-6 text-sm transition hover:-translate-y-0.5"
          >
            {closeLabel}
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function BlogSection() {
  const { t } = useI18n();
  const { blogImages } = useVenueMedia();
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : (t.blog.posts[open] ?? null);

  return (
    <section id="blog" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <SectionHeading
            eyebrow={t.blog.eyebrow}
            titleTop={t.blog.titleTop}
            titleBottom={t.blog.titleBottom}
          />
        </Reveal>

        <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.1}>
          {t.blog.posts.map((post, index) => {
            const cover = blogImages[index] ?? null;
            return (
              <article key={post.title} className="glass-card group overflow-hidden">
                <button
                  type="button"
                  data-cursor
                  onClick={() => setOpen(index)}
                  aria-label={`${t.blog.readMore}: ${post.title}`}
                  className="block w-full text-left"
                >
                  {cover?.url ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={cover.url}
                        alt={post.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
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
                    <p className="mt-4 font-label text-[10px] uppercase tracking-[0.16em] text-white/50 transition group-hover:text-[var(--gold)]">
                      {t.blog.readMore} →
                    </p>
                  </div>
                </button>
              </article>
            );
          })}
        </RevealGroup>
      </div>

      <AnimatePresence>
        {active ? (
          <ArticleDialog
            key={open}
            post={active}
            cover={open === null ? null : (blogImages[open]?.url ?? null)}
            onClose={() => setOpen(null)}
            closeLabel={t.blog.closeArticle}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
