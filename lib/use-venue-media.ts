"use client";

import { anyApi } from "convex/server";
import { useQuery } from "convex/react";

export type VenueMediaItem = {
  _id: string;
  url: string;
  contentType: string;
  size: number;
  kind: "image" | "video" | "other";
};

/** Prefer these for fast tiles (under ~2.5MB). */
const FAST_IMAGE_MAX = 2_500_000;
const MEDIUM_IMAGE_MAX = 4_200_000;

const HERO_STORAGE_ID = "kg2dd8tj8j1fgpcjwjbmjbrs2h8e8t3v";
const ABOUT_STORAGE_ID = "kg227qwag3hm51r6tavwkw4g7s8e98qm";

const EXPERIENCE_COVER_IDS = [
  "kg262ha6df7vekc2d2gkksjg4h8e873a",
  "kg26ebzbajwbcj9zme8hypxpa18e8mza",
  "kg2ax7af3aw1ksvj9pc6pm7hfh8e9frc",
  "kg21acam0mpskfvkcg66298vds8e9th1",
] as const;

const MENU_IMAGE_IDS = [
  "kg25mm8bd7bk2cwjsdc4rd1p4x8e9g1p",
  "kg2ef6pn57zztz030wxgx3ecz58e8w5w",
  "kg214pbkrgk9h8er9s82879h2x8e9n4s",
  "kg2fahp3adr0z7vswkc0ykvt2h8e8s3r",
] as const;

/** Never autoplay / embed this 53MB file in grids. */
const HEAVY_VIDEO_ID = "kg2f9dk8f6f6ede17b96csvn1s8e9dh2";

const EXPERIENCE_TAB_COUNT = 4;
const EXPERIENCE_BULLETS_PER_TAB = 4;

function uniqueById(items: VenueMediaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  });
}

function pickUnique(
  pool: VenueMediaItem[],
  used: Set<string>,
  count: number,
  preferredIds: readonly string[] = [],
) {
  const byId = new Map(pool.map((item) => [item._id, item]));
  const out: VenueMediaItem[] = [];

  for (const id of preferredIds) {
    if (out.length >= count) break;
    const item = byId.get(id);
    if (item && !used.has(item._id)) {
      used.add(item._id);
      out.push(item);
    }
  }

  for (const item of pool) {
    if (out.length >= count) break;
    if (used.has(item._id)) continue;
    used.add(item._id);
    out.push(item);
  }

  return out;
}

/** Fair split: give each bucket `perBucket` items, cycling the pool if short. */
function loadBalanceBuckets(
  pool: VenueMediaItem[],
  bucketCount: number,
  perBucket: number,
): VenueMediaItem[][] {
  if (pool.length === 0 || bucketCount === 0 || perBucket === 0) {
    return Array.from({ length: bucketCount }, () => []);
  }

  const buckets: VenueMediaItem[][] = Array.from(
    { length: bucketCount },
    () => [],
  );

  let cursor = 0;
  for (let b = 0; b < bucketCount; b++) {
    for (let i = 0; i < perBucket; i++) {
      buckets[b].push(pool[cursor % pool.length]!);
      cursor += 1;
    }
  }

  return buckets;
}

export type ExperienceMediaPack = {
  cover: VenueMediaItem | null;
  bullets: VenueMediaItem[];
};

export function useVenueMedia() {
  const media = useQuery(anyApi.media.list) as
    | {
        images: VenueMediaItem[];
        videos: VenueMediaItem[];
      }
    | undefined;

  const images = media?.images ?? [];
  const videos = media?.videos ?? [];
  const byId = new Map(images.map((image) => [image._id, image]));
  const usedImages = new Set<string>();
  const usedVideos = new Set<string>();

  const allImages = uniqueById(images).sort((a, b) => a.size - b.size);
  const fastImages = allImages.filter(
    (image) => image.size <= FAST_IMAGE_MAX && image._id !== HERO_STORAGE_ID,
  );
  const mediumImages = allImages.filter(
    (image) =>
      image.size > FAST_IMAGE_MAX &&
      image.size <= MEDIUM_IMAGE_MAX &&
      image._id !== HERO_STORAGE_ID,
  );
  /** Section-ready pool: fast first, then medium. */
  const balancedPool = [...fastImages, ...mediumImages];

  const heroImage =
    byId.get(HERO_STORAGE_ID) ??
    fastImages.find((image) => image.size >= 400_000) ??
    fastImages[0] ??
    null;
  if (heroImage) usedImages.add(heroImage._id);

  const aboutImage =
    byId.get(ABOUT_STORAGE_ID) && !usedImages.has(ABOUT_STORAGE_ID)
      ? byId.get(ABOUT_STORAGE_ID)!
      : pickUnique(fastImages, usedImages, 1)[0] ?? heroImage;
  if (aboutImage) usedImages.add(aboutImage._id);

  // ——— Load balance: reserve Night-to-dawn / menu / blog BEFORE gallery ———
  const experienceCovers = pickUnique(
    balancedPool,
    usedImages,
    EXPERIENCE_TAB_COUNT,
    EXPERIENCE_COVER_IDS,
  );

  // Reserve enough unique stills for every bullet tile, then load-balance across tabs.
  // Cap at 8 so menu / blog / gallery still get a fair share of the pool.
  const bulletQuota = Math.min(
    EXPERIENCE_TAB_COUNT * EXPERIENCE_BULLETS_PER_TAB,
    8,
  );
  const experienceBulletPool = pickUnique(balancedPool, usedImages, bulletQuota);

  const bulletBuckets = loadBalanceBuckets(
    experienceBulletPool,
    EXPERIENCE_TAB_COUNT,
    EXPERIENCE_BULLETS_PER_TAB,
  );

  const experiencePacks: ExperienceMediaPack[] = Array.from(
    { length: EXPERIENCE_TAB_COUNT },
    (_, tab) => ({
      cover: experienceCovers[tab] ?? experienceCovers[0] ?? null,
      bullets: bulletBuckets[tab] ?? [],
    }),
  );

  const menuImages = pickUnique(balancedPool, usedImages, 4, MENU_IMAGE_IDS);
  const blogImages = pickUnique(balancedPool, usedImages, 3);

  // Gallery takes what's left (still unique), capped for performance
  const galleryImages = [
    ...pickUnique(fastImages, usedImages, 18),
    ...pickUnique(mediumImages, usedImages, 6),
  ].slice(0, 24);

  // Videos: skip the 53MB file for grids; prefer small → mid
  const playableVideos = uniqueById(
    [...videos]
      .filter((v) => v._id !== HEAVY_VIDEO_ID)
      .sort((a, b) => {
        const aMp4 = a.contentType.includes("mp4") ? 0 : 1;
        const bMp4 = b.contentType.includes("mp4") ? 0 : 1;
        if (aMp4 !== bMp4) return aMp4 - bMp4;
        return a.size - b.size;
      }),
  );

  const galleryVideos = pickUnique(
    playableVideos,
    usedVideos,
    2,
    playableVideos
      .filter((v) => v.size < 3_000_000 || v.contentType.includes("quicktime"))
      .map((v) => v._id),
  );

  const menuVideos = pickUnique(
    playableVideos,
    usedVideos,
    1,
    playableVideos.map((v) => v._id),
  );

  const musicVideos = pickUnique(
    playableVideos,
    usedVideos,
    1,
    playableVideos.filter((v) => v.contentType.includes("mp4")).map((v) => v._id),
  );

  const heavyVideo = videos.find((v) => v._id === HEAVY_VIDEO_ID) ?? null;
  const featureVideo = musicVideos[0] ?? playableVideos[0] ?? null;

  return {
    isLoading: media === undefined,
    heroImage,
    aboutImage,
    visitImage: aboutImage,
    experiencePacks,
    experienceImages: experiencePacks
      .map((p) => p.cover)
      .filter(Boolean) as VenueMediaItem[],
    menuImages,
    menuVideos,
    blogImages,
    galleryImages,
    galleryVideos,
    video: featureVideo,
    videos: musicVideos.length ? musicVideos : featureVideo ? [featureVideo] : [],
    allVideos: uniqueById([...playableVideos, ...(heavyVideo ? [heavyVideo] : [])]),
    images,
  };
}
