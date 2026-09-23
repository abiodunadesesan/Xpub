import manifest from "./media-manifest.json";

/**
 * The public origin the venue's media is served from.
 *
 * `R2_PUBLIC_DOMAIN` is set in the host's environment, and both the sitemap and
 * the structured data have to turn bucket keys into absolute URLs before a
 * crawler will look at them. That tripped over the scheme once already — the
 * variable is documented without one and wrangler echoes it without one — so
 * the normalising lives here rather than in each caller.
 *
 * Returns `null` when it isn't configured: an entry built from a guess is worse
 * than no entry, so callers skip the images entirely.
 */
export function cdnOrigin(): string | null {
  const base = process.env.R2_PUBLIC_DOMAIN?.trim();
  if (!base) return null;
  const trimmed = base.replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Percent-encode each path segment, leaving the separators alone. */
export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

/**
 * Every image the venue has published, as absolute URLs, ready for a crawler.
 *
 * The optimised derivatives are listed rather than the originals: they are what
 * the pages actually render, so the markup and the sitemap describe the same
 * files.
 */
export function photographUrls(): string[] {
  const origin = cdnOrigin();
  if (!origin) return [];
  return manifest.objects
    .filter((object) => object.kind === "image")
    .map((object) => `${origin}/${encodeKey(object.web?.key ?? object.key)}`);
}
