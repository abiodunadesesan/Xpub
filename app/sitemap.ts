import type { MetadataRoute } from "next";
import manifest from "@/lib/media-manifest.json";
import { SITE_URL } from "@/lib/site";

/**
 * The site is two real pages — the one-pager and the legal notice — with every
 * section an anchor inside the first. There are no per-language URLs: the
 * language switcher swaps the dictionary in the client, so the same address
 * serves all fifteen. Claiming `hreflang` alternates here would point crawlers
 * at URLs that don't exist.
 *
 * The venue's photos are listed as image entries because they *are* the
 * content of a nightlife site, and they live on the R2 CDN rather than under
 * `/public`. The entry is skipped rather than guessed when the CDN base isn't
 * configured.
 */
function cdnOrigin(): string | null {
  const base = process.env.R2_PUBLIC_DOMAIN?.trim();
  if (!base) return null;
  const trimmed = base.replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = cdnOrigin();
  const images = origin
    ? manifest.objects
        .filter((object) => object.kind === "image")
        .map((object) => `${origin}/${encodeKey(object.web?.key ?? object.key)}`)
    : [];

  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      ...(images.length > 0 ? { images } : {}),
    },
    {
      url: `${SITE_URL}/legal`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
