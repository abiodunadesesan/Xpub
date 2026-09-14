"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { GallerySkeleton } from "@/components/skeleton";
import { MediaLightbox, type LightboxItem } from "@/components/media-lightbox";
import { SplitHeadline } from "@/components/split-headline";
import { useVenueMedia } from "@/lib/use-venue-media";
import { useI18n } from "@/lib/i18n/provider";

export function GallerySection() {
  const { t } = useI18n();
  const { galleryImages, galleryVideos, isLoading } = useVenueMedia();
  const [active, setActive] = useState<number | null>(null);

  const imageItems: LightboxItem[] = galleryImages.map((image, index) => ({
    src: image.url,
    alt: `X Pub Girne ${index + 1}`,
    kind: "image" as const,
  }));

  const videoItems: LightboxItem[] = galleryVideos.map((video, index) => ({
    src: video.url,
    alt: `X Pub clip ${index + 1}`,
    kind: "video" as const,
  }));

  // Interleave unique videos into unique photo list — no duplicates
  const items: LightboxItem[] =
    imageItems.length > 0
      ? [...imageItems]
      : [{ src: "/images/cover.jpg", alt: "X Pub", kind: "image" }];
  if (videoItems[0]) items.splice(Math.min(3, items.length), 0, videoItems[0]);
  if (videoItems[1]) items.splice(Math.min(9, items.length), 0, videoItems[1]);

  return (
    <section id="gallery" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <p className="font-label text-[11px] text-[var(--gold)]">{t.gallery.eyebrow}</p>
          <div className="mt-3">
            <SplitHeadline
              first={t.gallery.titleTop}
              second={t.gallery.titleBottom || t.nav.gallery}
            />
          </div>
          <p className="mt-3 font-serif text-sm text-white/50">
            {items.length} moments · tap to open
          </p>
        </Reveal>

        {isLoading && galleryImages.length === 0 ? (
          <GallerySkeleton count={12} />
        ) : (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4"
            data-testid="gallery-grid"
          >
            {items.map((item, index) => (
              <button
                key={`${item.kind}-${item.src}`}
                type="button"
                data-cursor
                onClick={() => setActive(index)}
                className="glass-card group relative aspect-square w-full overflow-hidden text-left"
              >
                {item.kind === "video" ? (
                  <video
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    src={item.src}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={item.alt}
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading={index < 4 ? "eager" : "lazy"}
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                <span className="pointer-events-none absolute bottom-3 left-3 font-label text-[9px] text-white/80 opacity-0 transition group-hover:opacity-100">
                  {item.kind === "video" ? "Open" : "View"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MediaLightbox
        items={items}
        index={active}
        onClose={() => setActive(null)}
        onChange={setActive}
      />
    </section>
  );
}
