export type VenueMediaItem = {
  _id: string;
  url: string;
  contentType: string;
  size: number;
  kind: "image" | "video" | "other";
};

/** Everything a section allocator needs — deliberately storage-agnostic. */
export type MediaManifest = {
  images: VenueMediaItem[];
  videos: VenueMediaItem[];
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v", "quicktime"]);

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

function extensionOf(key: string) {
  const name = key.split("?")[0]!.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function contentTypeFor(key: string) {
  return CONTENT_TYPES[extensionOf(key)] ?? "application/octet-stream";
}

export function kindFor(key: string): VenueMediaItem["kind"] {
  const ext = extensionOf(key);
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "other";
}

/** Last path segment, lowercased — how media is pinned to sections by name. */
export function baseName(item: VenueMediaItem) {
  return (item.url.split("?")[0]!.split("/").pop() ?? "").toLowerCase();
}

/**
 * Join an object key onto a public CDN base, encoding each path segment.
 * Object keys contain spaces and brackets (`brw (2 of 20).jpg`), so encoding
 * per segment — rather than on the whole key — is what keeps the slashes.
 */
export function buildPublicUrl(base: string, key: string) {
  const trimmed = base.replace(/\/+$/, "");
  const origin = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  const path = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${origin}/${path}`;
}
