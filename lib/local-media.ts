import { contentTypeFor, type MediaManifest, type VenueMediaItem } from "./media-types";

/**
 * Graceful-degradation manifest built from the assets committed to `public/`.
 *
 * Served whenever cloud storage is unconfigured or unreachable, so no section
 * can ever be left rendering empty skeletons. Sizes are a snapshot used only
 * to bucket "fast" vs "heavy" media — they do not need to be exact.
 *
 * This must list the same files `scripts/upload-media.mts` pushes to the
 * bucket, otherwise the site renders a different media set depending on
 * whether cloud storage answered.
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
    image("/images/cover.jpg", 425_348),
    image("/images/puzzle-team.jpg", 762_236),
    image("/images/puzzle-inn-carte.png", 625_769),
    image("/images/puzzle-espace-binouze.jpg", 347_246),
    image("/images/puzzle-coin-solo.jpg", 304_023),
    image("/images/puzzle-jeux-recents.jpg", 295_835),
    image("/images/puzzle-salon-multijoueur.jpg", 292_522),
    image("/images/puzzle-jeux-tir.jpg", 191_050),
    image("/images/puzzle-instagram1.jpg", 176_160),
    image("/images/puzzle-instagram4.jpg", 85_065),
    image("/images/puzzle-instagram3.jpg", 72_838),
    image("/images/puzzle-instagram5.jpg", 72_522),
    image("/images/puzzle-instagram6.jpg", 61_498),
    image("/images/puzzle-instagram7.png", 10_758),
  ],
  videos: [video("/videos/dj-set.mp4", 1_846_548)],
};
