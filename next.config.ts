import type { NextConfig } from "next";
import path from "path";

/**
 * The bucket's public host, from the same env var the app uses.
 *
 * Next has to allow a remote host before it will optimize images from it, and
 * the venue photos are 3–11 MB originals — serving them unoptimized would make
 * the gallery unusable. `**.r2.dev` is allowed alongside it so a custom domain
 * or a re-created bucket doesn't silently break every image.
 */
const r2Host = (
  process.env.R2_PUBLIC_DOMAIN ?? "pub-109bf5c952674bbcb07de2a87309b58d.r2.dev"
)
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "");

/**
 * Caching for the files under `public/`.
 *
 * Next serves everything in `public/` with `Cache-Control: public, max-age=0`,
 * which is right for a file that might be replaced at any moment and wrong for
 * this one: the rotation alone is 16 MB of MP3s, and without a header every
 * visit pays for all of it again. Two policies, because these files fall into
 * two groups.
 *
 * Immutable is safe where the name *is* the version — a font or a track is
 * replaced by renaming it, never by overwriting it in place.
 *
 * A week for the brand mark and the bundled venue media, which are the files
 * someone genuinely might overwrite, with a day of stale-while-revalidate so
 * the refresh happens off the critical path.
 */
const FOREVER = "public, max-age=31536000, immutable";
const A_WEEK = "public, max-age=604800, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: r2Host, pathname: "/**" },
      { protocol: "https", hostname: "**.r2.dev", pathname: "/**" },
    ],
    /**
     * The default is four hours, and R2 sends no `Cache-Control` of its own for
     * Next to defer to — so every optimized photo was being rebuilt and
     * re-sent four times a day. A week keeps that off the table without
     * freezing the gallery: a re-uploaded photograph is visible within it.
     */
    minimumCacheTTL: 604800,
  },
  async headers() {
    return [
      { source: "/audio/:path*", headers: [{ key: "Cache-Control", value: FOREVER }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: FOREVER }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: A_WEEK }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: A_WEEK }] },
      { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: A_WEEK }] },
    ];
  },
};

export default nextConfig;
