/**
 * Shared R2 access for the media scripts.
 *
 * Two interchangeable backends, picked from whatever credentials exist:
 *
 *   1. CLOUDFLARE_API_TOKEN (Workers R2 Storage: Edit) — one scoped token
 *   2. an existing `wrangler login` session — no new secret at all
 *   3. CLOUDFLARE_R2_ACCESS_KEY_ID + CLOUDFLARE_R2_SECRET_ACCESS_KEY
 *
 * Backends 1 and 2 both use the Cloudflare REST API, so the common case needs
 * nothing beyond the account ID and bucket name already in `.env.local`.
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join } from "node:path";

/** Mirrors `lib/media-types.ts`; kept local so scripts need no build step. */
export const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

/**
 * Prefix for generated web-sized copies. Underscore keeps them visually
 * separate in the bucket, and the site filters them out of the media list —
 * they're an implementation detail, not venue media.
 */
export const DERIVATIVES_PREFIX = "_web/";

/**
 * Derivative keys are re-encoded, so they take the extension of the encoding
 * rather than the original — otherwise JPEG bytes would be labelled
 * `image/png`, or H.264 bytes `video/quicktime`.
 */
export const derivativeKey = (key: string, extension: "jpg" | "mp4") =>
  `${DERIVATIVES_PREFIX}${key.replace(/\.[^./]+$/, "")}.${extension}`;
export const isDerivative = (key: string) => key.startsWith(DERIVATIVES_PREFIX);

/** Both encodings a key could have a derivative in. */
export const derivativeKeys = (key: string) => [
  derivativeKey(key, "jpg"),
  derivativeKey(key, "mp4"),
];

export type Remote = {
  /** Object key → size, for every object currently in the bucket. */
  index: () => Promise<Map<string, number>>;
  /** Fetch an object's bytes straight from its public URL. */
  get: (key: string) => Promise<Buffer>;
  put: (key: string, path: string) => Promise<void>;
  putBytes: (key: string, bytes: Uint8Array) => Promise<void>;
  remove: (keys: string[]) => Promise<void>;
};

/**
 * What uploaded media is served with, and why it matters.
 *
 * R2 sends **no** `Cache-Control` of its own, and the hero clip alone is over
 * 4 MB — so without this header every visit re-downloads it in full. A week is
 * the deliberate middle: long enough that a returning visitor pays once, short
 * enough that re-uploading a photo under the same name shows up without a
 * cache purge. Objects uploaded before this line existed still carry no header;
 * re-running the sync is what fixes them.
 */
const MEDIA_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400";

const apiBase = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET_NAME}/objects`;

/** Public CDN base, or null when the domain isn't configured yet. */
export const publicBase = (process.env.R2_PUBLIC_DOMAIN ?? "").replace(/\/+$/, "");

/** Join a key onto the public base, encoding each path segment. */
export function publicUrl(key: string) {
  const trimmed = publicBase.replace(/\/+$/, "");
  const origin = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  return `${origin}/${key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function contentTypeFor(key: string) {
  return CONTENT_TYPES[extname(key).slice(1).toLowerCase()] ?? "application/octet-stream";
}

/** The token `wrangler login` stores, if the user has one. */
async function wranglerToken(): Promise<string | null> {
  const candidates = [
    join(homedir(), "Library", "Preferences", ".wrangler", "config", "default.toml"),
    join(homedir(), ".wrangler", "config", "default.toml"),
    join(homedir(), ".config", ".wrangler", "config", "default.toml"),
  ];
  for (const path of candidates) {
    try {
      const match = (await readFile(path, "utf8")).match(/oauth_token\s*=\s*"([^"]+)"/);
      if (match) return match[1]!;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

type ApiObject = {
  key: string;
  size: number;
  http_metadata?: { contentType?: string };
};

/** Cloudflare REST backend — API token, or the wrangler login session. */
export function restBackend(token: string, label: string): Remote {
  async function list(): Promise<ApiObject[]> {
    const objects: ApiObject[] = [];
    let cursor: string | undefined;

    do {
      const url = new URL(apiBase());
      url.searchParams.set("per_page", "1000");
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const body = (await response.json()) as {
        success: boolean;
        errors?: Array<{ message: string }>;
        result?: ApiObject[];
        result_info?: { cursor?: string; is_truncated?: boolean };
      };

      if (!body.success) {
        throw new Error(
          `${label}: ${body.errors?.map((e) => e.message).join("; ") ?? "listing failed"}`,
        );
      }

      objects.push(...(body.result ?? []));
      cursor = body.result_info?.is_truncated ? body.result_info.cursor : undefined;
    } while (cursor);

    return objects;
  }

  const remote: Remote = {
    index: async () => new Map((await list()).map((o) => [o.key, o.size])),
    get: async (key) => {
      // The public URL is what the site itself serves from, so a rename is
      // verified against the exact bytes visitors get.
      const response = await fetch(publicUrl(key), { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`${label}: download of ${key} failed (HTTP ${response.status})`);
      }
      return Buffer.from(await response.arrayBuffer());
    },
    putBytes: async (key, bytes) => {
      const response = await fetch(`${apiBase()}/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentTypeFor(key),
        },
        body: bytes as BodyInit,
      });
      if (!response.ok) {
        throw new Error(`${label}: upload of ${key} failed (HTTP ${response.status})`);
      }
    },
    put: async (key, path) => {
      await remote.putBytes(key, await readFile(path));
    },
    remove: async (keys) => {
      for (const key of keys) {
        const response = await fetch(`${apiBase()}/${encodeURIComponent(key)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`${label}: delete of ${key} failed (HTTP ${response.status})`);
        }
      }
    },
  };

  return remote;
}

/** S3 backend, for anyone who prefers an access key pair. */
export async function s3Backend(): Promise<Remote> {
  const { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } =
    await import("@aws-sdk/client-s3");

  const client = new S3Client({
    region: "auto",
    endpoint:
      process.env.R2_ENDPOINT ??
      `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  return {
    index: async () => {
      const objects = new Map<string, number>();
      let token: string | undefined;
      do {
        const page = await client.send(
          new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
            MaxKeys: 1000,
            ContinuationToken: token,
          }),
        );
        for (const object of page.Contents ?? []) {
          if (object.Key) objects.set(object.Key, object.Size ?? 0);
        }
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
      } while (token);
      return objects;
    },
    get: async (key) => {
      const response = await fetch(publicUrl(key), { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`download of ${key} failed (HTTP ${response.status})`);
      }
      return Buffer.from(await response.arrayBuffer());
    },
    putBytes: async (key, bytes) => {
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: bytes,
          ContentType: contentTypeFor(key),
          CacheControl: MEDIA_CACHE_CONTROL,
        }),
      );
    },
    put: async (key, path) => {
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: await readFile(path),
          ContentType: contentTypeFor(key),
          CacheControl: MEDIA_CACHE_CONTROL,
        }),
      );
    },
    remove: async (keys) => {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        }),
      );
    },
  };
}

export async function resolveRemote(): Promise<{ remote: Remote; label: string }> {
  const missing = ["CLOUDFLARE_ACCOUNT_ID", "R2_BUCKET_NAME"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.error(`Missing ${missing.join(", ")} in .env.local.`);
    process.exit(1);
  }

  if (process.env.CLOUDFLARE_API_TOKEN) {
    return {
      remote: restBackend(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN"),
      label: "Cloudflare API token",
    };
  }

  const session = await wranglerToken();
  if (session) {
    return {
      remote: restBackend(session, "wrangler session"),
      label: "wrangler login session",
    };
  }

  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    return { remote: await s3Backend(), label: "R2 S3 key pair" };
  }

  console.error(
    "No R2 credentials found.\n\n" +
      "Use one of:\n" +
      "  • CLOUDFLARE_API_TOKEN  — a token with Workers R2 Storage: Edit\n" +
      "  • `npx wrangler login`  — reuse an existing session (no new secret)\n" +
      "  • CLOUDFLARE_R2_ACCESS_KEY_ID + CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  );
  process.exit(1);
}
