#!/usr/bin/env node
/**
 * Renames bucket objects to the names the site pins sections to.
 *
 * R2 has no rename operation, so each entry is a copy-then-delete: the bytes
 * come down, go back up under the new key, and the old key is removed. Each
 * object's web-sized copy under `_web/` is moved alongside it, so nothing has
 * to be re-encoded afterwards.
 *
 * Why the names matter: `lib/media-allocate.ts` claims media by filename
 * fragment, so a key is also a content tag. The vocabulary:
 *
 *   hero-*           the hero clip and its poster still
 *   about-*          the about panel's portrait
 *   drink-*          drinks only — the menu never draws from anything else
 *   drink-cocktail-*   ↳ Cocktails tab
 *   drink-beer-*       ↳ Beer & Cold tab (none yet — upload one and it appears)
 *   drink-bar-*        ↳ Nights tab: pours and bar service
 *   guests-*         people enjoying the venue
 *   team-*           staff at work (bar, DJ booth)
 *   venue-*          the pub's own space: lounge, bar back, neon, pool, booth
 *   exterior-*       the building, the signs and the doorway
 *
 * Upload `drink-negroni.jpg` and it joins the menu on its own; upload
 * `potato.jpg` and the general sections rotate it in. `guests-`, `team-` and
 * `exterior-` are descriptive rather than load-bearing — they exist so a
 * photo's subject is readable from its key. `drink-` and `venue-` are both
 * load-bearing: they pin the menu and the VIP Rooms tab respectively, which is
 * why the two crowd shots from the `brw` series live under `guests-` rather
 * than `venue-`.
 *
 *   npm run media:rename -- --dry-run
 *   npm run media:rename
 *   npm run media:sync          # refresh derivatives + manifest afterwards
 *
 * Safe to re-run: anything already at its target name is skipped, so a partial
 * run can simply be repeated.
 */
import {
  derivativeKey,
  derivativeKeys,
  isDerivative,
  resolveRemote,
} from "./r2-client.mts";

type Entry = {
  /** Substring of the current key. */
  contains: string;
  /** Optional exact byte size, to disambiguate lookalike names. */
  size?: number;
  to: string;
  /**
   * Drop the web-sized copy instead of moving it, so `media:sync` rebuilds it
   * — used when the new name wants a different encoding profile.
   */
  rebuild?: boolean;
};

/**
 * The photo series as they were uploaded. Each number maps to what that frame
 * actually shows — verified by looking at every one of them, not inferred from
 * order.
 */
const GUESTS_AND_VENUE: Record<string, string> = {
  "2": "guests-01",
  "3": "team-01",
  "4": "team-02",
  "5": "guests-02",
  // Frames 8 and 19 are full of people — seated guests, then the floor mid-set.
  // `venue-` pins the VIP Rooms tab, and a room is what is being sold there, so
  // they are filed as guests even though the room is behind them.
  "8": "guests-12",
  "9": "venue-02", // the bar's back wall: bottles, and the X Pub roundel
  "10": "guests-03",
  "11": "guests-04",
  "12": "guests-05",
  "13": "guests-06",
  "14": "guests-07",
  "15": "guests-08",
  "16": "guests-09",
  "17": "guests-10",
  "18": "guests-11",
  "19": "guests-13",
  "20": "team-03",
};

const NEON_AND_EXTERIOR: Record<string, string> = {
  "3": "exterior-01", // the building lit up at night
  "4": "exterior-02", // the X Pub sign over the door, lanterns lit
  "5": "exterior-03", // the hanging oval sign, seen from the lane
  "6": "exterior-04", // the doorway, both lanterns on
  "8": "about-neon", // "Meet me at X" in neon on the stone wall
  "9": "team-05", // thumbs up in the courtyard
  "10": "venue-04", // "Meet me at X", wider, under the beams
  "11": "venue-05", // the X neon above the bar counter
  "13": "venue-06", // round window ringed with a dried wreath
  "15": "venue-07", // the pool at night
  "16": "venue-08", // the DJ booth behind red neon bars
  "17": "venue-09", // the same booth, straight on
  "18": "venue-10", // the booth up close, under the tree
};

/**
 * Drinks, split by what each pour is for. The menu draws one tab from each
 * category, so this split is what makes the strip change meaningfully when a
 * visitor switches tab rather than merely shuffling.
 */
const DRINK_CATEGORY: Record<string, string> = {
  "01": "drink-cocktail-01",
  "02": "drink-cocktail-02",
  "03": "drink-cocktail-03",
  "04": "drink-cocktail-04",
  "05": "drink-bar-01", // bartender building a round
  "06": "drink-bar-02", // whiskey poured over ice
  "07": "drink-cocktail-05",
  "08": "drink-cocktail-06",
  "09": "drink-cocktail-07",
  "10": "drink-cocktail-08",
};

const ENTRIES: Entry[] = [
  // ——— Videos: hashtag names → what the clip actually shows ———
  // 59.9s portrait reel: the X Pub sign, the DJ, the crowd, the bar. Dropped
  // and rebuilt so it gets the leaner `hero-*` encode profile.
  { contains: "creativevibes", to: "hero-xpub.mp4", rebuild: true },
  // The uploads stored their keys percent-encoded, so the accent in the
  // original filename appears here as `%C4%B1` rather than `ı`.
  { contains: "%C4%B1br%C4%B1s 2.mov", to: "drink-cocktail-mix.mov" },
  { contains: "%C4%B1br%C4%B1s.mov", to: "drink-bar-pour.mov" },
  // The first pass left these two under category-free names; a bucket that ran
  // it has them under those, so both spellings are handled. Entries whose
  // target already exists are skipped, so the order doesn't matter.
  { contains: "drink-mix.mov", to: "drink-cocktail-mix.mov" },
  { contains: "drink-pour.mov", to: "drink-bar-pour.mov" },

  // ——— Drinks: the menu's media pool ———
  // `cdscsds` 2–9 are the cocktail, pour and bartender close-ups; two more
  // drinks live in the `sfsffs` set, both framed against the neon.
  ...Object.entries({
    "2": "drink-cocktail-01",
    "3": "drink-cocktail-02",
    "4": "drink-cocktail-03",
    "5": "drink-cocktail-04",
    "6": "drink-bar-01",
    "7": "drink-bar-02",
    "8": "drink-cocktail-05",
    "9": "drink-cocktail-06",
  }).map(([number, to]) => ({
    contains: `cdscsds (${number} of 9).jpg`,
    to: `${to}.jpg`,
  })),
  { contains: "sfsffs (12 of 18).jpg", to: "drink-cocktail-07.jpg" },
  { contains: "sfsffs (14 of 18).jpg", to: "drink-cocktail-08.jpg" },

  // The hero still: the X neon roundel, used as the video's poster.
  { contains: "sfsffs (7 of 18).jpg", to: "hero-poster.jpg" },

  // ——— The split for a bucket that already ran the first pass ———
  // Those two crowd shots went out as `venue-01` / `venue-03`; re-file them so
  // the VIP tab has nothing but rooms, in both a fresh and an upgraded bucket.
  { contains: "venue-01.jpg", to: "guests-12.jpg" },
  { contains: "venue-03.jpg", to: "guests-13.jpg" },

  // ——— The same split for a bucket that still has the flat `drink-NN` names ———
  ...Object.entries(DRINK_CATEGORY).map(([number, to]) => ({
    contains: `drink-${number}.jpg`,
    to: `${to}.jpg`,
  })),

  // ——— Photo series → subject ———
  ...Object.entries(GUESTS_AND_VENUE).map(([number, to]) => ({
    contains: `brw (${number} of 20).jpg`,
    to: `${to}.jpg`,
  })),
  ...Object.entries(NEON_AND_EXTERIOR).map(([number, to]) => ({
    contains: `sfsffs (${number} of 18).jpg`,
    to: `${to}.jpg`,
  })),
  { contains: "cdscsds (1 of 9).jpg", to: "team-04.jpg" },
];

/**
 * Keys deleted outright, matched exactly.
 *
 * Retiring is not the same as renaming: these are superseded assets whose
 * replacement is already in the bucket under a different name, or demo
 * material that must not appear on the venue's site. Exact keys (rather than
 * substrings) because a replacement's own name can contain the old one —
 * `venue-loop-01.mp4` contains `loop-01.mp4`.
 */
const RETIRED: Array<{ key: string; size?: number; why: string }> = [
  {
    key: "dj-set.mp4",
    size: 1_846_548,
    why: "the original template's stock DJ clip, superseded by real venue footage",
  },
  {
    key: "loop-01.mp4",
    size: 523_541,
    why: "photo montage, rebuilt from non-drink photos as venue-loop-01.mp4",
  },
  {
    key: "loop-02.mp4",
    size: 373_943,
    why: "photo montage, rebuilt from non-drink photos as venue-loop-02.mp4",
  },
  {
    key: "loop-03.mp4",
    size: 361_510,
    why: "photo montage, rebuilt from non-drink photos as venue-loop-03.mp4",
  },
  {
    key: "loop-04.mp4",
    size: 874_143,
    why: "photo montage, rebuilt from non-drink photos as venue-loop-04.mp4",
  },
  {
    key: "loop-05.mp4",
    size: 792_251,
    why: "photo montage, rebuilt from non-drink photos as venue-loop-05.mp4",
  },
  // The montages themselves, once real footage replaced them.
  {
    key: "venue-loop-01.mp4",
    size: 502_038,
    why: "photo montage, superseded by venue-clip-01.mp4 (real footage)",
  },
  {
    key: "venue-loop-02.mp4",
    size: 537_884,
    why: "photo montage, superseded by venue-clip-02.mp4 (real footage)",
  },
  {
    key: "venue-loop-03.mp4",
    size: 768_247,
    why: "photo montage, superseded by venue-clip-03.mp4 (real footage)",
  },
  {
    key: "venue-loop-04.mp4",
    size: 680_661,
    why: "photo montage, superseded by venue-clip-04.mp4 (real footage)",
  },
  {
    key: "venue-loop-05.mp4",
    size: 627_369,
    why: "photo montage, superseded by venue-clip-05.mp4 (real footage)",
  },
];

const flags = new Set(process.argv.slice(2));
const dryRun = flags.has("--dry-run");

const { remote, label } = await resolveRemote();
const index = await remote.index();

/** Never treat a finished rename as the source for another entry. */
const targets = new Set(ENTRIES.map((entry) => entry.to));

console.log(`Bucket ${process.env.R2_BUCKET_NAME} via ${label} — ${index.size} object(s)`);
if (dryRun) console.log("DRY RUN — nothing will be written");

/** Match an entry to exactly one live object key. */
function resolveKey(entry: Entry): string | null {
  const matches = [...index.keys()].filter(
    (key) =>
      !isDerivative(key) &&
      !targets.has(key) &&
      key.includes(entry.contains) &&
      (entry.size === undefined || index.get(key) === entry.size),
  );

  if (matches.length > 1) {
    throw new Error(
      `"${entry.contains}" matches ${matches.length} objects — narrow it down:\n` +
        matches.map((key) => `  • ${key}`).join("\n"),
    );
  }
  return matches[0] ?? null;
}

let renamed = 0;
let skipped = 0;
let retired = 0;

for (const entry of ENTRIES) {
  // Checked first so re-running after a partial pass is a no-op rather than an
  // overwrite warning.
  if (index.has(entry.to)) {
    console.log(`= ${entry.to} (already in place)`);
    skipped += 1;
    continue;
  }

  const from = resolveKey(entry);
  if (!from) {
    console.log(`? ${entry.to} (no match)`);
    skipped += 1;
    continue;
  }

  const bytes = await remote.get(from);
  const declared = index.get(from) ?? 0;
  if (bytes.length !== declared) {
    throw new Error(`${from}: expected ${declared} bytes, downloaded ${bytes.length}`);
  }

  console.log(`~ ${from}\n    → ${entry.to}  (${(bytes.length / 1_000_000).toFixed(2)} MB)`);

  if (dryRun) continue;

  await remote.putBytes(entry.to, bytes);

  // Move the existing web copy so `media:sync` has nothing to re-encode. Its
  // extension can differ from the original's (`drink-mix.mov` → `.mp4`).
  const derivatives = derivativeKeys(from).filter((key) => index.has(key));

  for (const oldKey of derivatives) {
    if (entry.rebuild) {
      console.log(`    - dropping ${oldKey} so it can be rebuilt`);
      await remote.remove([oldKey]);
      continue;
    }
    const extension = oldKey.endsWith(".mp4") ? "mp4" : "jpg";
    const newKey = derivativeKey(entry.to, extension);
    await remote.putBytes(newKey, await remote.get(oldKey));
    await remote.remove([oldKey]);
    console.log(`    ⇢ ${oldKey} → ${newKey}`);
  }

  await remote.remove([from]);
  renamed += 1;
}

for (const obsolete of RETIRED) {
  const size = index.get(obsolete.key);
  if (size === undefined) {
    console.log(`= ${obsolete.key} (already retired)`);
    continue;
  }
  if (obsolete.size !== undefined && size !== obsolete.size) {
    throw new Error(
      `${obsolete.key} is ${size} bytes, expected ${obsolete.size} — refusing to delete it`,
    );
  }

  console.log(`- ${obsolete.key}  (${obsolete.why})`);
  if (dryRun) continue;

  await remote.remove([
    obsolete.key,
    ...derivativeKeys(obsolete.key).filter((key) => index.has(key)),
  ]);
  retired += 1;
}

console.log(
  `\n${renamed} renamed, ${retired} retired, ${skipped} already in place.` +
    (dryRun ? "" : "\nNow run `npm run media:sync` to refresh the manifest."),
);
