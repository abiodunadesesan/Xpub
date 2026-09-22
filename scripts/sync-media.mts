#!/usr/bin/env node
/**
 * Makes the bucket web-ready and refreshes `lib/media-manifest.json`.
 *
 * Two jobs, one command:
 *
 *   1. Every photo gets a web-sized copy under `_web/` (longest side 1600px).
 *      The originals run 2–11 MB, and Next's image optimizer aborts any
 *      upstream fetch that takes longer than 7 seconds — on a cold cache that
 *      meant real photos rendering as broken tiles. Resizing once here means
 *      the page never asks for a multi-megabyte original.
 *   2. Videos that are heavy or not already MP4 get a transcoded copy: the
 *      grid autoplays them, so a 12 MB reel or a QuickTime container is worth
 *      normalising once rather than per visitor.
 *   3. The manifest is rewritten with each object's derivative, so the site
 *      serves the small copy while the full-resolution original stays in the
 *      bucket for the lightbox and for download.
 *
 * Run it after `npm run media:upload`:
 *
 *   npm run media:sync
 *   npm run media:sync -- --force             # rebuild derivatives that already exist
 *   npm run media:sync -- --only=hero --force  # rebuild just the hero clip
 */
import { execFile } from "node:child_process";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  contentTypeFor,
  derivativeKey,
  isDerivative,
  publicBase,
  publicUrl,
  resolveRemote,
} from "./r2-client.mts";

const run = promisify(execFile);

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "lib/media-manifest.json");
const flags = new Set(process.argv.slice(2));
const force = flags.has("--force");

const onlyFlag = [...flags].find((flag) => flag.startsWith("--only="));
/** Narrow the run to keys containing this substring, e.g. `--only=hero`. */
const only = onlyFlag ? onlyFlag.slice("--only=".length).toLowerCase() : null;

/** Longest side of a gallery/hero copy. Wide enough for a retina tile. */
const MAX_DIMENSION = 1_600;
/** JPEG quality for the derivative (ffmpeg's mjpeg qscale, lower = better). */
const QUALITY = 4;
/** Longest side of a video copy — tiles are small, autoplaying and muted. */
const MAX_VIDEO_DIMENSION = 960;
/**
 * Longest side of the hero loop, which is full-bleed rather than a tile.
 *
 * The hero source is 720x1280 and the panel it sits in is ~920px wide on a
 * desktop, so a 960px cap was downscaling it to 540x960 and the browser was
 * then blowing that back up by ~1.7x — which is what made the clip look soft.
 * Capping at the source's own long side means the encode is never resampled
 * down, and the remaining 1.28x is the browser's problem, not the file's.
 * (4K would be a straight upscale of 720p pixels: more bytes, no more detail.)
 */
const HERO_MAX_DIMENSION = 1_280;
/** Re-encode above this, so grid autoplay isn't pulling megabytes per tile. */
const MAX_VIDEO_BYTES = 3_000_000;
/** `hero-*` keys fill the viewport, so the encode gets its own profile. */
const HERO_PREFIX = "hero-";

type VideoProfile = {
  crf: number;
  /** Null keeps the source frame rate. */
  frameRate: number | null;
  maxDimension: number;
  preset: "medium" | "slow";
  /** Keep only the first N seconds. Null keeps the whole clip. */
  trimSeconds: number | null;
};

/**
 * How much of the hero reel to keep.
 *
 * It is a background that loops, so length past the first few seconds only
 * costs bytes: nobody watches minute two of a montage they have already looped
 * through twice. The opening stretch is also the strongest — the X Pub sign,
 * the DJ, the bar, the tables.
 */
const HERO_SECONDS = 20;

/**
 * The hero is the one clip whose sharpness is worth bytes, because it is
 * full-bleed and the panel is wider than the source.
 *
 * Resolution is what made the old encode soft, so it no longer gets scaled
 * down; crf 25 at the source's own 720x1280 is a high-quality encode. Frame
 * rate is the cheap lever left — 24fps on a dim handheld club clip is not
 * distinguishable from the source's 30, and it buys back roughly a fifth of
 * the file. Trimming to `HERO_SECONDS` pays for the rest of the increase.
 *
 * Measured on the real 60s source: the whole clip at crf 41 / 540x960 was
 * 0.89 MB; this profile is 12.5 MB → **4.12 MB**, at full resolution.
 */
function videoProfile(key: string): VideoProfile {
  return key.toLowerCase().startsWith(HERO_PREFIX)
    ? {
        crf: 25,
        frameRate: 24,
        maxDimension: HERO_MAX_DIMENSION,
        preset: "slow",
        trimSeconds: HERO_SECONDS,
      }
    : {
        crf: 30,
        frameRate: null,
        maxDimension: MAX_VIDEO_DIMENSION,
        preset: "medium",
        trimSeconds: null,
      };
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET_NAME;

type Snapshot = {
  generatedAt: string;
  bucket: string;
  accountId: string;
  objects: Array<{
    key: string;
    size: number;
    contentType: string;
    kind: string;
    /** Web-sized copy served by the site, when one exists. */
    web?: { key: string; size: number };
  }>;
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"]);

function kindFor(key: string): "image" | "video" | "other" {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "other";
}

/** Fit the longest side to `max`, whichever way the source is oriented. */
function fitLongestSide(max: number) {
  return (
    `scale='if(gt(iw,ih),min(${max},iw),-2)':` +
    `'if(gt(iw,ih),-2,min(${max},ih))'`
  );
}

/** Downscale a photo, keeping the aspect ratio and stripping metadata. */
async function resizeImage(input: string, output: string) {
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-vf",
      fitLongestSide(MAX_DIMENSION),
      "-map_metadata",
      "-1",
      "-q:v",
      String(QUALITY),
      "-pix_fmt",
      "yuvj420p",
      output,
    ],
    { maxBuffer: 16 * 1024 * 1024 },
  );
}

/**
 * Re-encode a video as a web-sized, silent, H.264 MP4.
 *
 * Silent because every use on the site is muted autoplay; the original keeps
 * its audio for anyone who wants it.
 */
async function transcodeVideo(
  input: string,
  output: string,
  profile: VideoProfile,
) {
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-vf",
      fitLongestSide(profile.maxDimension),
      "-map_metadata",
      "-1",
      "-an",
      ...(profile.trimSeconds ? ["-t", String(profile.trimSeconds)] : []),
      ...(profile.frameRate ? ["-r", String(profile.frameRate)] : []),
      "-c:v",
      "libx264",
      "-preset",
      profile.preset,
      "-crf",
      String(profile.crf),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output,
    ],
    { maxBuffer: 32 * 1024 * 1024 },
  );
}

async function main() {
  if (!publicBase) {
    console.error("Missing R2_PUBLIC_DOMAIN in .env.local.");
    process.exit(1);
  }

  const { remote, label } = await resolveRemote();
  console.log(`Reading bucket ${bucket} via ${label}…`);

  const index = await remote.index();
  const objects = [...index.entries()];
  const existing = new Set(objects.filter(([key]) => isDerivative(key)).map(([key]) => key));

  // Only originals are venue media; `_web/` copies are an implementation detail.
  const originals = objects
    .filter(([key]) => !isDerivative(key) && !key.endsWith("/"))
    .filter(([key]) => kindFor(key) === "image" || kindFor(key) === "video")
    .map(([key, size]) => ({ key, size }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

  const images = originals.filter((object) => kindFor(object.key) === "image");
  const videos = originals.filter((object) => kindFor(object.key) === "video");

  /** Videos worth normalising: heavy, or in a container we don't want to ship. */
  const needsVideoCopy = (object: { key: string; size: number }) =>
    object.size > MAX_VIDEO_BYTES || !object.key.toLowerCase().endsWith(".mp4");

  const plan = originals
    .flatMap((object) => {
      const kind = kindFor(object.key);
      const extension = kind === "image" ? "jpg" : "mp4";
      if (kind === "video" && !needsVideoCopy(object)) return [];
      const key = derivativeKey(object.key, extension);
      return force || !existing.has(key) ? [{ object, key, kind }] : [];
    })
    .filter((entry) => !only || entry.object.key.toLowerCase().includes(only));

  console.log(
    `\n${originals.length} object(s): ${images.length} photo(s), ${videos.length} video(s). ` +
      `${plan.length} derivative(s) to build${only ? ` (--only=${only})` : ""}.\n`,
  );

  const dir = await mkdtemp(join(tmpdir(), "xpub-web-"));

  try {
    for (const [position, { object, key, kind }] of plan.entries()) {
      const source = join(dir, `src-${position}`);
      const target = join(dir, `web-${position}.${kind === "image" ? "jpg" : "mp4"}`);

      const response = await fetch(publicUrl(object.key));
      if (!response.ok) throw new Error(`GET ${object.key} → HTTP ${response.status}`);
      await writeFile(source, Buffer.from(await response.arrayBuffer()));

      const profile = videoProfile(object.key);
      if (kind === "image") await resizeImage(source, target);
      else await transcodeVideo(source, target, profile);

      const size = (await stat(target)).size;
      await remote.put(key, target);
      console.log(
        `  ~ ${object.key}  ${(object.size / 1_000_000).toFixed(1)} MB → ` +
          `${(size / 1_000_000).toFixed(2)} MB` +
          (kind === "video" ? `  (crf ${profile.crf})` : ""),
      );
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }

  // Re-list so derivatives built earlier in this run (or by an earlier run) are
  // all accounted for, not just the ones we just made.
  const derivatives = new Map<string, { key: string; size: number }>();
  const sizes = plan.length > 0 ? await remote.index() : index;
  for (const object of originals) {
    const extension = kindFor(object.key) === "image" ? "jpg" : "mp4";
    const key = derivativeKey(object.key, extension);
    if (sizes.has(key)) derivatives.set(object.key, { key, size: sizes.get(key)! });
  }

  const snapshot: Snapshot = {
    generatedAt: new Date().toISOString(),
    bucket: bucket!,
    accountId: accountId!,
    objects: originals.map((object) => {
      const web = derivatives.get(object.key);
      return {
        key: object.key,
        size: object.size,
        contentType: contentTypeFor(object.key),
        kind: kindFor(object.key),
        ...(web ? { web } : {}),
      };
    }),
  };

  await writeFile(manifestPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  const withDerivative = snapshot.objects.filter((object) => object.web).length;
  console.log(
    `\nWrote ${snapshot.objects.length} object(s) to lib/media-manifest.json ` +
      `(${withDerivative} with a web-sized copy).`,
  );
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
