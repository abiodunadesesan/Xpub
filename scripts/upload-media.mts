#!/usr/bin/env node
/**
 * Pushes the venue media in `public/media` and `public/videos` to the R2 bucket
 * the site reads.
 *
 *   npm run media:upload                # upload new/changed files
 *   npm run media:upload -- --force     # re-upload even if the size matches
 *   npm run media:upload -- --dry-run   # show the plan, change nothing
 *   npm run media:prune                 # also delete objects with no local file
 *
 * Then run `npm run media:sync` to build the web-sized copies and refresh the
 * manifest the site reads.
 *
 * `--prune` needs `--yes` as well. This is not ceremony: the venue's photos live
 * in the bucket and were uploaded through the dashboard, so they have no local
 * file by design — and "no local file" is exactly what `--prune` deletes.
 */
import { readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_TYPES, derivativeKeys, isDerivative, resolveRemote } from "./r2-client.mts";

/**
 * Directories whose contents become the venue media in the bucket.
 *
 * `public/images` is deliberately excluded: it holds the arcade art, the map
 * and the older reference photos that `LOCAL_MEDIA` uses as an offline
 * fallback. Mirroring those would push unrelated pictures into the venue's
 * gallery, so uploaded media lives in its own folder.
 */
const SOURCE_DIRS = ["public/media", "public/videos"];

/**
 * Local files that must not be uploaded.
 *
 * `dj-set.mp4` is the original template's stock clip. It was uploaded once and
 * has since been retired in favour of real venue footage — re-uploading it
 * would drop a stock demo video back into the gallery.
 */
const EXCLUDED = new Set(["dj-set.mp4"]);

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = new Set(process.argv.slice(2));
const dryRun = flags.has("--dry-run");
const force = flags.has("--force");
const prune = flags.has("--prune");
const confirmed = flags.has("--yes");

/** Every uploadable file on disk, keyed by the flat object key it gets in R2. */
async function localMedia(): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  for (const dir of SOURCE_DIRS) {
    let entries;
    try {
      entries = await readdir(join(root, dir), { withFileTypes: true });
    } catch {
      console.warn(`skipping ${dir} (not found)`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!CONTENT_TYPES[extname(entry.name).slice(1).toLowerCase()]) continue;
      if (EXCLUDED.has(entry.name.toLowerCase())) continue;
      files.set(entry.name.toLowerCase(), join(root, dir, entry.name));
    }
  }

  return files;
}

function describe(error: unknown) {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error);
  if (name === "AccessDenied" || /Access Denied|status code 403|Unauthorized/.test(message)) {
    return `${message}\n  → the credential needs Workers R2 Storage: Edit on this bucket.`;
  }
  if (name === "NoSuchBucket") {
    return `${message}\n  → check R2_BUCKET_NAME, or create the bucket in the R2 dashboard.`;
  }
  return message;
}

async function main() {
  const { remote, label } = await resolveRemote();
  const bucket = process.env.R2_BUCKET_NAME;
  const local = await localMedia();

  // One listing covers both jobs: size comparison and orphan detection.
  console.log(`Reading bucket ${bucket} via ${label}…`);
  const remoteIndex = await remote.index();
  const remoteSizes = new Map(
    [...remoteIndex].map(([key, size]) => [key.split("/").pop()!.toLowerCase(), size]),
  );

  const upload: Array<[string, string]> = [];
  let unchanged = 0;

  for (const entry of [...local].sort(([a], [b]) => a.localeCompare(b))) {
    const remoteSize = remoteSizes.get(entry[0]);
    if (!force && remoteSize === (await stat(entry[1])).size) {
      console.log(`  = ${entry[0]}`);
      unchanged += 1;
      continue;
    }
    upload.push(entry);
  }

  console.log(
    `\n${upload.length} to upload, ${unchanged} already in sync ` +
      `of ${local.size} local file(s)${dryRun ? " (dry run)" : ""}\n`,
  );

  for (const [key, path] of upload) {
    if (dryRun) {
      console.log(`  + ${key}`);
      continue;
    }
    await remote.put(key, path);
    console.log(`  ↑ ${key}`);
  }

  console.log(
    `\n${dryRun ? "would upload" : "uploaded"} ${upload.length}, ${unchanged} already in sync.`,
  );

  if (!prune) {
    console.log(
      "(`npm run media:prune` removes bucket objects with no local file)\n" +
        "(`npm run media:sync` builds the web-sized copies the site serves)",
    );
    return;
  }

  // An orphan is any object with no counterpart in `public/media` or
  // `public/videos` — which includes photos uploaded straight through the R2
  // dashboard, since those exist only in the bucket. `--prune` is the
  // statement that they should go, so print every key before deleting any.
  const stale = [...remoteIndex.keys()].filter((key) => {
    if (key.endsWith("/") || isDerivative(key)) return false;
    return !local.has(key.split("/").pop()!.toLowerCase());
  });

  if (stale.length === 0) {
    console.log("\nNothing to prune.");
    return;
  }

  if (!confirmed) {
    console.log(
      `\n${stale.length} object(s) would be deleted — refusing to do it without --yes.\n` +
        "These have no local file because they were uploaded through the R2 dashboard,\n" +
        "which is how the venue's own photos got into the bucket. Deleting them is\n" +
        "sometimes what you want (a retired asset) and sometimes the whole gallery.\n" +
        "Re-run with:  npm run media:prune -- --yes",
    );
    return;
  }

  console.log(`\nDeleting ${stale.length} object(s) with no local file:`);
  for (const key of stale) console.log(`  - ${key}`);
  if (dryRun) return;

  const keys = [...stale];
  // Remove each stale object's derivatives too, otherwise `_web/` grows forever.
  for (const key of stale) {
    for (const derivative of derivativeKeys(key)) {
      if (remoteIndex.has(derivative)) keys.push(derivative);
    }
  }

  await remote.remove(keys);
  console.log(`pruned ${keys.length} object(s).`);
}

main().catch((error: unknown) => {
  console.error(`\n${describe(error)}`);
  process.exit(1);
});
