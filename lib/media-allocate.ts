import { baseName, type MediaManifest, type VenueMediaItem } from "./media-types";

/** Prefer these for fast tiles (under ~2.5MB). */
export const FAST_IMAGE_MAX = 2_500_000;
export const MEDIUM_IMAGE_MAX = 4_200_000;

/** Never autoplay / embed files this large in grids. Size-based, not id-based. */
export const HEAVY_VIDEO_BYTES = 50_000_000;

const EXPERIENCE_TAB_COUNT = 4;
const EXPERIENCE_BULLETS_PER_TAB = 4;
const MENU_TAB_COUNT = 3;
const MENU_STILLS = 3;
const BLOG_POST_COUNT = 3;
/** The gallery is the showcase: show the whole pool, up to a sane ceiling. */
const GALLERY_MAX = 48;
const GALLERY_MIN = 8;
const MUSIC_VIDEOS = 2;
const GALLERY_VIDEOS_MAX = 8;

function uniqueById(items: VenueMediaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  });
}

/**
 * Take `count` items from `pool` starting at `offset`, wrapping around when the
 * pool is short.
 *
 * Ordering sections by "who claims media first" always starves whoever is
 * last — with a small pool the menu, blog and gallery ended up empty. Rotating
 * a per-section offset instead guarantees every slot is filled, every tab looks
 * different, and nothing renders blank. Sharing an image between two sections
 * is a far better failure mode than a blank tile.
 */
function rotate(pool: VenueMediaItem[], offset: number, count: number) {
  if (pool.length === 0 || count <= 0) return [];
  return Array.from(
    { length: count },
    (_, index) => pool[(offset + index) % pool.length]!,
  );
}

/** Pin media to a section by filename fragment — e.g. `cover.jpg` → hero. */
function named(...needles: string[]) {
  return (item: VenueMediaItem) =>
    needles.some((needle) => baseName(item).includes(needle));
}

/**
 * Filename fragment that marks a key as drink media.
 *
 * The menu is drinks-only by definition, and a bucket can't be queried by
 * subject — so the name carries the tag. Uploading `drink-negroni.jpg` adds it
 * to the menu with no code change.
 */
const DRINK_PREFIX = "drink-";

/**
 * Drink category per menu tab, index-aligned with `t.menu.tabs`
 * (cocktails, beer, nights).
 *
 * `drink-cocktail-01.jpg` belongs to Cocktails, `drink-bar-pour.mp4` to
 * Nights. A drink with no category (`drink-negroni.jpg`) is never wasted — it
 * fills whichever tab is short. Upload `drink-beer-*.jpg` and the Beer & Cold
 * tab draws from its own photos instead of borrowing the cocktails'.
 */
const MENU_TAB_CATEGORIES = ["cocktail", "beer", "bar"] as const;

function isDrink(item: VenueMediaItem) {
  return baseName(item).startsWith(DRINK_PREFIX);
}

function isDrinkIn(item: VenueMediaItem, category: string) {
  return baseName(item).startsWith(`${DRINK_PREFIX}${category}-`);
}

/** Readable, stable order — `drink-cocktail-01` before `-02`. */
function byBaseName(a: VenueMediaItem, b: VenueMediaItem) {
  return baseName(a).localeCompare(baseName(b), undefined, { numeric: true });
}

/**
 * Fill a short list from `pool`, repeating only when the pool is genuinely
 * smaller than the slots it has to fill.
 */
function padTo(items: VenueMediaItem[], count: number, pool: VenueMediaItem[]) {
  if (items.length >= count || pool.length === 0) return items;
  return [...items, ...rotate(pool, items.length, count - items.length)];
}

function firstMatching(pool: VenueMediaItem[], ...needles: string[]) {
  return pool.find(named(...needles)) ?? null;
}

export type ExperienceMediaPack = {
  cover: VenueMediaItem | null;
  bullets: VenueMediaItem[];
};

export type MenuMediaPack = {
  /** `cocktail` | `beer` | `bar` — mirrors the tab at the same index. */
  category: string;
  cover: VenueMediaItem | null;
  stills: VenueMediaItem[];
  /** The clip that plays in the strip for this tab, when one exists. */
  video: VenueMediaItem | null;
};

export type VenueMedia = {
  isLoading: boolean;
  heroImage: VenueMediaItem | null;
  /** Background clip for the hero stage — `hero-*` in the bucket. */
  heroVideo: VenueMediaItem | null;
  aboutImage: VenueMediaItem | null;
  visitImage: VenueMediaItem | null;
  experiencePacks: ExperienceMediaPack[];
  experienceImages: VenueMediaItem[];
  /** One pack per menu tab, in `t.menu.tabs` order. */
  menuPacks: MenuMediaPack[];
  menuImages: VenueMediaItem[];
  menuVideos: VenueMediaItem[];
  blogImages: VenueMediaItem[];
  galleryImages: VenueMediaItem[];
  galleryVideos: VenueMediaItem[];
  video: VenueMediaItem | null;
  videos: VenueMediaItem[];
  allVideos: VenueMediaItem[];
  images: VenueMediaItem[];
};

/**
 * Single source of truth for how venue media is distributed across sections.
 * Pure — no React, no fetching, no storage assumptions.
 */
export function buildVenueMedia(media: MediaManifest | null): VenueMedia {
  const images = media?.images ?? [];
  const videos = media?.videos ?? [];

  const allImages = uniqueById(images).sort((a, b) => a.size - b.size);

  // Hero: the best-quality image that is still fast to load. Renaming a file to
  // `cover-*.jpg` (or `hero-*.jpg`) pins it explicitly.
  const heroImage =
    firstMatching(allImages, "cover", "hero") ??
    [...allImages].reverse().find((image) => image.size <= FAST_IMAGE_MAX) ??
    allImages[0] ??
    null;

  // About: a portrait-friendly still that isn't the hero.
  const aboutImage =
    firstMatching(
      allImages.filter((image) => image._id !== heroImage?._id),
      "about",
    ) ??
    allImages.find(
      (image) => image._id !== heroImage?._id && image.size <= MEDIUM_IMAGE_MAX,
    ) ??
    heroImage;

  // Section pool: fast first, then medium. Oversized originals are reserved for
  // the gallery, which loads lazily and gets optimized on the way out.
  const sectionPool = allImages.filter(
    (image) => image.size <= MEDIUM_IMAGE_MAX && image._id !== heroImage?._id,
  );
  const rotationPool = sectionPool.length > 0 ? sectionPool : allImages;

  // ——— Experience: "Night to dawn" ———
  // Each tab gets its own cover plus a full set of bullet tiles.
  const experienceCovers = rotate(rotationPool, 0, EXPERIENCE_TAB_COUNT);
  const experiencePacks: ExperienceMediaPack[] = Array.from(
    { length: EXPERIENCE_TAB_COUNT },
    (_, tab) => ({
      cover: experienceCovers[tab] ?? heroImage,
      bullets: rotate(rotationPool, tab * EXPERIENCE_BULLETS_PER_TAB + 1, EXPERIENCE_BULLETS_PER_TAB),
    }),
  );

  // ——— Video pools ———
  // mp4 first (broadest browser support), then smallest first so grids aren't
  // paying for a huge file.
  const allVideos = uniqueById(videos);
  const playableVideos = allVideos
    .filter((video) => video.size <= HEAVY_VIDEO_BYTES)
    .sort((a, b) => {
      const aMp4 = a.contentType.includes("mp4") ? 0 : 1;
      const bMp4 = b.contentType.includes("mp4") ? 0 : 1;
      if (aMp4 !== bMp4) return aMp4 - bMp4;
      return a.size - b.size;
    });

  // Drinks are menu media, not performance media — without this split a
  // cocktail clip lands in the live-music section, which is the smallest-video
  // slot in the layout.
  const drinkVideos = playableVideos.filter(isDrink);
  const performanceVideos = playableVideos.filter((video) => !isDrink(video));

  // Hero background: an explicit `hero-*` key wins. Failing that, the most
  // substantial clip is the best guess at venue footage — taking the smallest
  // would put a six-second loop behind the headline.
  const heroVideo =
    firstMatching(performanceVideos, "hero") ??
    [...performanceVideos].sort((a, b) => b.size - a.size)[0] ??
    null;

  // ——— Menu ———
  // Drinks only: the strip previews what's on the menu, so a guest, venue or
  // exterior photo must never appear here — the pool is `drink-*` keys and
  // nothing else. (A bucket that has never adopted the convention falls back
  // to the general pool rather than rendering an empty strip.)
  const drinkPool = allImages.filter(isDrink).sort(byBaseName);
  const menuSource = drinkPool.length > 0 ? drinkPool : rotationPool;

  /**
   * One tab's ordered candidates: its own category first, then everything else
   * rotated by tab, so a tab that is short on its own photos borrows different
   * frames than its neighbours instead of repeating them.
   */
  const menuPoolFor = (category: string, tab: number) => {
    const tagged = menuSource.filter((item) => isDrinkIn(item, category));
    const rest = menuSource.filter((item) => !tagged.includes(item));
    return [...tagged, ...rotate(rest, tab * MENU_STILLS, rest.length)];
  };

  const menuPacks: MenuMediaPack[] = Array.from({ length: MENU_TAB_COUNT }, (_, tab) => {
    const category = MENU_TAB_CATEGORIES[tab] ?? "";
    const pool = uniqueById(menuPoolFor(category, tab));
    return {
      category,
      cover: pool[0] ?? heroImage,
      stills: padTo(pool.slice(1, 1 + MENU_STILLS), MENU_STILLS, pool),
      // The clip follows the tab too: the pour for the bar, the mix for the
      // cocktails. Falling back to any drink clip keeps the strip filled.
      video: drinkVideos.find((video) => isDrinkIn(video, category)) ?? drinkVideos[0] ?? null,
    };
  });

  const menuVideos = drinkVideos;

  // ——— Blog + gallery ———
  const blogImages = rotate(rotationPool, MENU_TAB_COUNT * (MENU_STILLS + 1), BLOG_POST_COUNT);

  const galleryImages = (
    allImages.length >= GALLERY_MIN
      ? allImages
      : rotate(allImages, 0, GALLERY_MIN)
  ).slice(0, GALLERY_MAX);

  const musicVideos = performanceVideos.slice(0, MUSIC_VIDEOS);
  const featureVideo = musicVideos[0] ?? null;
  const galleryVideos = playableVideos.slice(0, GALLERY_VIDEOS_MAX);

  return {
    isLoading: media === null,
    heroImage,
    heroVideo,
    aboutImage,
    visitImage: aboutImage,
    experiencePacks,
    experienceImages: experiencePacks
      .map((pack) => pack.cover)
      .filter(Boolean) as VenueMediaItem[],
    menuPacks,
    menuImages: menuPacks.flatMap((pack) =>
      [pack.cover, ...pack.stills].filter(Boolean) as VenueMediaItem[],
    ),
    menuVideos,
    blogImages,
    galleryImages,
    galleryVideos,
    video: featureVideo,
    videos: musicVideos.length ? musicVideos : featureVideo ? [featureVideo] : [],
    allVideos,
    images,
  };
}
