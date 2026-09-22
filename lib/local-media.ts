import { contentTypeFor, type MediaManifest, type VenueMediaItem } from "./media-types";

/**
 * Graceful-degradation manifest built from media committed to `public/`.
 *
 * Served whenever cloud storage is unconfigured or unreachable, so no section
 * can ever be left rendering empty skeletons.
 *
 * Until now this listed the *previous* project's assets — a different
 * business's photos and a stock DJ clip — which meant the one moment the
 * fallback mattered was also the moment the site advertised somebody else.
 * Everything below is the venue's own media, under the same filenames the
 * bucket uses, so section rules (`drink-*` to the menu, `venue-*` to the VIP
 * tab) keep working with no credentials at all.
 *
 * It is deliberately a small representative set rather than a mirror: full
 * coverage is the bucket's job, and duplicating 42 photos into the repository
 * to guard against an outage that hasn't happened is the wrong trade. Sizes
 * are the committed files' exact byte counts, used only to bucket "fast" vs
 * "heavy" media.
 */
function image(path: string, size: number): VenueMediaItem {
  return {
    _id: path,
    url: path,
    contentType: contentTypeFor(path),
    size,
    kind: "image",
  };
}

function video(path: string, size: number): VenueMediaItem {
  return {
    _id: path,
    url: path,
    contentType: contentTypeFor(path),
    size,
    kind: "video",
  };
}

export const LOCAL_MEDIA: MediaManifest = {
  images: [
    image("/media/hero-poster.jpg", 225_383),
    image("/media/about-neon.jpg", 271_575),
    image("/media/exterior-01.jpg", 280_059),
    // Guests
    image("/media/guests-01.jpg", 131_548),
    image("/media/guests-06.jpg", 127_703),
    // Staff
    image("/media/team-01.jpg", 205_915),
    // The pub's own space — these fill the VIP Rooms tab
    image("/media/venue-02.jpg", 161_939),
    image("/media/venue-06.jpg", 329_764),
    image("/media/venue-07.jpg", 186_099),
    // Drinks — these fill the menu
    image("/media/drink-cocktail-01.jpg", 66_522),
    image("/media/drink-cocktail-04.jpg", 88_759),
    image("/media/drink-bar-01.jpg", 162_771),
  ],
  videos: [
    video("/videos/venue-clip-01.mp4", 981_800),
    video("/videos/venue-clip-02.mp4", 957_541),
    video("/videos/venue-clip-03.mp4", 922_854),
    video("/videos/venue-clip-04.mp4", 846_186),
    video("/videos/venue-clip-05.mp4", 869_514),
  ],
};
