#!/usr/bin/env node
/**
 * Cuts the room clips for the gallery and the live-music section out of the
 * venue's own footage.
 *
 * These used to be photo montages — three stills with a slow push-in — because
 * the bucket held stills only. It now holds real footage, so the clips are
 * short muted segments of it: the DJ, the booth, the dance floor, the bar.
 * Nothing here is synthesised, and no segment is a drink close-up: these also
 * feed the live-music slots, where a cocktail under a DJ schedule was a real
 * complaint.
 *
 *   npm run media:videos
 *   npm run media:upload        # push them to the bucket
 *   npm run media:sync          # refresh the manifest
 *
 * Requires `ffmpeg` on PATH.
 */
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const publicBase = process.env.R2_PUBLIC_DOMAIN ?? "pub-109bf5c952674bbcb07de2a87309b58d.r2.dev";

/** The master clip the segments are cut from. */
const SOURCE_KEY = "hero-xpub.mp4";

/**
 * Seconds into the reel, and what that stretch shows — checked frame by frame
 * rather than guessed:
 *
 *   5s  the DJ, arms up, blue neon
 *   25s the booth behind the X neon and red light bars
 *   30s the second DJ, hands up over the decks
 *   40s a guest waving at a table, red light
 *   50s the bar, bartender pointing at the camera
 */
const SEGMENTS: Array<{ start: number; label: string }> = [
  { start: 5, label: "DJ, arms up" },
  { start: 25, label: "the booth, X neon" },
  { start: 30, label: "over the decks" },
  { start: 40, label: "guests at the table" },
  { start: 50, label: "the bar" },
];

/** Clip length. Long enough to read as film, short enough to autoplay freely. */
const CLIP_SECONDS = 6;
/** Tiles and the music card are small, so 720 wide is plenty. */
const MAX_WIDTH = 720;

function publicUrl(key: string) {
  return `https://${publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function cutClip(source: string, start: number, output: string) {
  await run(
    "ffmpeg",
    [
      "-y",
      "-ss",
      String(start),
      "-t",
      String(CLIP_SECONDS),
      "-i",
      source,
      "-vf",
      `scale='min(${MAX_WIDTH},iw)':-2`,
      "-an",
      "-r",
      "25",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "30",
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
  const response = await fetch(publicUrl(SOURCE_KEY));
  if (!response.ok) {
    throw new Error(`GET ${SOURCE_KEY} → HTTP ${response.status} (is the reel still in the bucket?)`);
  }
  const reel = Buffer.from(await response.arrayBuffer());
  console.log(`Cutting ${SEGMENTS.length} clip(s) from ${SOURCE_KEY} (${(reel.length / 1_000_000).toFixed(1)} MB)…\n`);

  const dir = await mkdtemp(join(tmpdir(), "xpub-clip-"));
  try {
    const source = join(dir, "reel.mp4");
    await writeFile(source, reel);

    for (const [index, segment] of SEGMENTS.entries()) {
      const output = join(
        process.cwd(),
        "public",
        "videos",
        `venue-clip-${String(index + 1).padStart(2, "0")}.mp4`,
      );
      await cutClip(source, segment.start, output);

      const { stdout } = await run("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration,size",
        "-of",
        "csv=p=0",
        output,
      ]);
      const [duration, size] = stdout.trim().split(",");
      console.log(
        `  ${output.split("/").pop()}  ${Number(duration).toFixed(1)}s  ` +
          `${(Number(size) / 1_000_000).toFixed(2)} MB  ← ${segment.start}s · ${segment.label}`,
      );
    }
    console.log("\nUpload them with `npm run media:upload`, then `npm run media:sync`.");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
