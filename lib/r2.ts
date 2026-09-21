import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  buildPublicUrl,
  contentTypeFor,
  kindFor,
  type MediaManifest,
  type VenueMediaItem,
} from "./media-types";

/**
 * Server-only: this module reads credentials and talks to R2. It is imported by
 * the media route and nothing else — never pull it into a client component.
 */
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const envApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim() || null;

/** Public CDN base for the bucket, or null when it isn't configured. */
export const r2PublicBase = process.env.R2_PUBLIC_DOMAIN?.trim() || null;

/** S3 keys — the fullest access (list + upload + prune). */
export const hasS3Credentials = Boolean(
  accountId && accessKeyId && secretAccessKey && bucket,
);

/**
 * A scoped Cloudflare API token is enough to *read* the bucket listing, which
 * is all the running site needs. Prefer it: it's a narrower credential than an
 * S3 key pair, and it can't upload or delete anything.
 */
export const hasApiToken = Boolean(accountId && envApiToken && bucket);

/**
 * Where `wrangler login` keeps its session.
 *
 * Reusing that session lets a local dev server list the bucket with no new
 * secret — it's how the media pipeline was verified end to end. Two reasons it
 * stays development-only: the token expires hourly and only wrangler refreshes
 * it, and a deployment should carry a scoped token rather than a borrowed CLI
 * session. Set `R2_USE_WRANGLER_SESSION=off` to opt out.
 */
const WRANGLER_CONFIG_PATHS = [
  join(homedir(), "Library", "Preferences", ".wrangler", "config", "default.toml"),
  join(homedir(), ".wrangler", "config", "default.toml"),
  join(homedir(), ".config", ".wrangler", "config", "default.toml"),
];

function wranglerSessionToken(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.R2_USE_WRANGLER_SESSION === "off") return null;

  for (const path of WRANGLER_CONFIG_PATHS) {
    try {
      if (!existsSync(path)) continue;
      const token = readFileSync(path, "utf8").match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
      if (token) return token;
    } catch {
      /* an unreadable config is the same as no session */
    }
  }
  return null;
}

/**
 * The token a live listing will use, whichever source provides it. Resolved on
 * every attempt rather than cached: wrangler rotates the session hourly, and a
 * refreshed token should be picked up without a restart.
 */
async function resolveApiToken(): Promise<string | null> {
  return envApiToken ?? wranglerSessionToken();
}

/** Whether a live bucket listing is possible at all. */
export const hasLiveSource = Boolean(
  hasS3Credentials || hasApiToken || (accountId && bucket && wranglerSessionToken()),
);

/**
 * Hard ceiling for a whole listing. R2 being slow or unreachable must fail
 * fast so the caller can fall back, rather than holding the request open until
 * the platform times it out — and so the failure gets cached quickly.
 */
const LIST_TIMEOUT_MS = 5_000;

type ListedObject = { key: string; size: number; contentType: string };

/**
 * Generated web-sized copies live under `_web/`. They're an implementation
 * detail the site picks up through the manifest, never as gallery items.
 */
const DERIVATIVES_PREFIX = "_web/";

/** Filter out directory placeholders, derivatives and anything not media. */
function toMedia(objects: ListedObject[]) {
  const images: VenueMediaItem[] = [];
  const videos: VenueMediaItem[] = [];
  const base = r2PublicBase!;

  for (const object of objects) {
    if (!object.key || object.key.endsWith("/")) continue;
    if (object.key.startsWith(DERIVATIVES_PREFIX)) continue;
    const kind = kindFor(object.key);
    if (kind === "other") continue;

    const item: VenueMediaItem = {
      _id: object.key,
      url: buildPublicUrl(base, object.key),
      contentType: object.contentType || contentTypeFor(object.key),
      size: object.size,
      kind,
    };

    if (kind === "image") images.push(item);
    else videos.push(item);
  }

  images.sort((a, b) => a.size - b.size);
  return { images, videos };
}

/**
 * List the bucket with the S3 API.
 * Paginated — a marketing bucket is small, but listing must not silently
 * truncate at the 1000-object page limit.
 */
export async function listViaS3(): Promise<MediaManifest> {
  if (!hasS3Credentials) throw new Error("Cloudflare R2 S3 credentials are not configured");

  // Imported here rather than at module scope: the snapshot and API-token paths
  // are the common ones, and neither should pay to load the S3 SDK — in dev
  // that's a visible delay on the first request, in production a cold start.
  const { ListObjectsV2Command, S3Client } = await import("@aws-sdk/client-s3");

  const client = new S3Client({
    region: "auto",
    // R2_ENDPOINT allows pointing at another S3-compatible store (and at a
    // local stub in tests); production uses the account's R2 endpoint.
    endpoint:
      process.env.R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });

  const objects: ListedObject[] = [];
  let continuationToken: string | undefined;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIST_TIMEOUT_MS);

  try {
    do {
      const page = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        }),
        { abortSignal: controller.signal },
      );

      for (const object of page.Contents ?? []) {
        if (!object.Key) continue;
        objects.push({
          key: object.Key,
          size: object.Size ?? 0,
          contentType: contentTypeFor(object.Key),
        });
      }

      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`R2 listing timed out after ${LIST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  return toMedia(objects);
}

/**
 * List the bucket with the Cloudflare REST API.
 *
 * Same result as `listViaS3` but needs only a read-scoped API token, and it
 * works from anywhere `fetch` does — no S3 SDK path involved.
 */
export async function listViaApi(explicitToken?: string): Promise<MediaManifest> {
  const token = explicitToken ?? (await resolveApiToken());
  if (!token || !accountId || !bucket) {
    throw new Error(
      "No R2 read credential: set CLOUDFLARE_API_TOKEN, or run `npx wrangler login` locally",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIST_TIMEOUT_MS);
  const objects: ListedObject[] = [];

  try {
    let cursor: string | undefined;
    do {
      const url = new URL(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects`,
      );
      url.searchParams.set("per_page", "1000");
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: "no-store",
      });

      const body = (await response.json()) as {
        success: boolean;
        errors?: Array<{ message: string }>;
        result?: Array<{
          key: string;
          size: number;
          http_metadata?: { contentType?: string };
        }>;
        result_info?: { cursor?: string; is_truncated?: boolean };
      };

      if (!body.success) {
        throw new Error(
          body.errors?.map((entry) => entry.message).join("; ") ?? "R2 listing failed",
        );
      }

      for (const object of body.result ?? []) {
        if (!object.key) continue;
        objects.push({
          key: object.key,
          size: object.size,
          contentType: object.http_metadata?.contentType ?? contentTypeFor(object.key),
        });
      }

      cursor = body.result_info?.is_truncated ? body.result_info.cursor : undefined;
    } while (cursor);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`R2 API listing timed out after ${LIST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  return toMedia(objects);
}

/** Whichever live listing the configured credentials allow. */
export async function listLive(): Promise<MediaManifest> {
  const token = await resolveApiToken();
  return token ? listViaApi(token) : listViaS3();
}
