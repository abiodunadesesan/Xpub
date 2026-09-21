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
  },
};

export default nextConfig;
