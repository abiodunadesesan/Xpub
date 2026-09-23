"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { GallerySkeleton } from "@/components/skeleton";
import { LazyVideo } from "@/components/lazy-video";
import { MediaLightbox, type LightboxItem } from "@/components/media-lightbox";
import { SectionHeading } from "@/components/section-heading";
import { useVenueMedia } from "@/lib/venue-media";
import { useI18n } from "@/lib/i18n/provider";
import { fill } from "@/lib/i18n/format";

/**
 * Spread the clips evenly through the photo grid instead of clustering them.
 * Every clip is placed — with a wide grid the fixed "insert at 3 and 9" trick
 * only ever showed the first two.
 */
function interleave(images: LightboxItem[], videos: LightboxItem[]) {
  if (videos.length === 0) return images;
  if (images.length === 0) return videos;

  const stride = Math.max(2, Math.floor(images.length / (videos.length + 1)));
  const out: LightboxItem[] = [];
  let next = 0;

  images.forEach((image, index) => {
    out.push(image);
    if (next < videos.length && (index + 1) % stride === 0) {
      out.push(videos[next]!);
      next += 1;
    }
  });

  while (next < videos.length) {
    out.push(videos[next]!);
    next += 1;
  }

  return out;
}

export function GallerySection() {
  const { t } = useI18n();
  const { galleryImages, galleryVideos, isLoading } = useVenueMedia();
  const [active, setActive] = useState<number | null>(null);

  // Every alt is built from the dictionary rather than written out, so it is
  // both translated and keyword-bearing: the venue's name and town, then what
  // the picture is of. A bare "photo 1" tells a crawler nothing.
  const label = `${t.brand.name} ${t.brand.city} — ${t.gallery.titleBottom || t.nav.gallery}`;

  const imageItems: LightboxItem[] = galleryImages.map((image, index) => ({
    src: image.url,
    alt: `${label} · ${index + 1}`,
    kind: "image" as const,
  }));

  const videoItems: LightboxItem[] = galleryVideos.map((video, index) => ({
    src: video.url,
    alt: `${label} · ${t.gallery.open} ${index + 1}`,
    kind: "video" as const,
  }));

  const items = interleave(
    imageItems.length > 0
      ? imageItems
      : [
          {
            src: "/media/about-neon.jpg",
            alt: `${t.brand.name} ${t.brand.city}`,
            kind: "image" as const,
          },
        ],
    videoItems,
  );

  return (
    <section id="gallery" className="relative z-10 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <SectionHeading
            eyebrow={t.gallery.eyebrow}
            titleTop={t.gallery.titleTop}
            titleBottom={t.gallery.titleBottom || t.nav.gallery}
          />
          <p className="mt-3 font-serif text-sm text-white/50">
            {fill(t.gallery.summary, {
              moments: items.length,
              clips: videoItems.length,
            })}
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
                  <LazyVideo
                    src={item.src}
                    label={item.alt}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                <span className="pointer-events-none absolute bottom-3 left-3 font-label text-[9px] text-white/80 opacity-0 transition group-hover:opacity-100">
                  {item.kind === "video" ? t.gallery.open : t.gallery.view}
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
